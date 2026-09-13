import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type Page } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const engine = process.env.BROWSER || 'chromium';
const OUT = process.env.QA_OUT || `audit/card-focus-${engine}`;
fs.mkdirSync(OUT, { recursive: true });
const reports: object[] = [];
const browser = await (engine === 'webkit' ? webkit : chromium).launch(
  engine === 'chromium' && process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] }
    : {},
);

async function checkFocus(page: Page, label: string) {
  await page.waitForFunction(() => {
    const el = document.querySelector<HTMLElement>('[data-ui="study-card-focus"]');
    if (!el?.dataset.focusPosition) return false;
    const rect = el.getBoundingClientRect();
    const height = window.visualViewport?.height || innerHeight;
    const offset = window.visualViewport?.offsetTop || 0;
    const target = offset + Math.max(16, (height - rect.height) / 2);
    return Math.abs(rect.top - target) < 3;
  }, null, { timeout: 5000 });
  const state = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-ui="study-card-focus"]')!;
    const rect = el.getBoundingClientRect();
    const height = window.visualViewport?.height || innerHeight;
    const offset = window.visualViewport?.offsetTop || 0;
    return {
      cardTop: rect.top, cardHeight: rect.height, viewportHeight: height,
      delta: rect.top - offset - Math.max(16, (height - rect.height) / 2),
      scroll: scrollY, mode: el.dataset.focusPosition,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
    };
  });
  assert.ok(Math.abs(state.delta) < 3, `${label}: ${JSON.stringify(state)}`);
  assert.equal(state.horizontalOverflow, false, label);
  if (state.cardHeight <= state.viewportHeight - 32) {
    assert.ok(state.cardTop >= 0 && state.cardTop + state.cardHeight <= state.viewportHeight + 2, `${label}: card clipped`);
  }
  reports.push({ label, ...state });
}
async function openLesson(page: Page, number: number, mode = 'learn') {
  await page.goto(BASE);
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.locator(`[data-ui="hope-lesson-list"] [data-lesson="hope-lesson${number}"]`).click();
  await page.locator(`[data-mode="${mode}"]`).click();
}
for (const [width, height] of [[320, 568], [390, 650], [430, 780], [768, 1024], [1280, 900], [844, 390]]) {
  const context = await browser.newContext({
    viewport: { width, height }, isMobile: width < 900, hasTouch: width < 900, locale: 'ja-JP',
  });
  const errors: string[] = [];
  await context.addInitScript(() => {
    if (sessionStorage.getItem('card-focus-test-seeded')) return;
    localStorage.setItem('flashcard-shuffle', 'false');
    localStorage.setItem('flashcard-dark-mode', 'true');
    localStorage.setItem('flashcard-favorites:2026-midterm-v1', '[4001,4201,3301]');
    localStorage.setItem('flashcard-yet-list:2026-midterm-v1', '[4002,4202]');
    sessionStorage.setItem('card-focus-test-seeded', 'true');
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => errors.push(error.message));
  try {
    await openLesson(page, 1);
    await checkFocus(page, `${width}x${height}: entry`);
    if (width === 390) await page.screenshot({ path: path.join(OUT, 'card-centered-mobile.png') });
    if (width === 1280) await page.screenshot({ path: path.join(OUT, 'card-centered-desktop.png') });
    // Flipping and reading an explanation must not invoke automatic centering.
    await page.getByRole('button', { name: 'タップして日本語訳を見る', exact: true }).click();
    await page.getByRole('button', { name: 'ミニ解説を見る', exact: true }).click();
    const heldScroll = await page.evaluate(() => scrollY);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => scrollY), heldScroll, 'Explanation scroll was hijacked');
    await page.getByRole('button', { name: '次のカードへ', exact: true }).click();
    await checkFocus(page, `${width}x${height}: next after explanation`);
    await page.getByRole('button', { name: '前のカードへ', exact: true }).click();
    await checkFocus(page, `${width}x${height}: previous`);
    // Manual upward scrolling must remain possible, even on a later resize.
    await page.evaluate(() => { window.dispatchEvent(new Event('touchmove')); window.scrollTo(0, 0); });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width, height: height - 40 });
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => scrollY), 0, 'Manual scroll was undone');
    await page.getByRole('button', { name: '日本語から見る', exact: true }).click();
    await page.getByRole('button', { name: '次のカードへ', exact: true }).click();
    await checkFocus(page, `${width}x${height - 40}: Japanese-first`);
    await page.setViewportSize({ width, height });
    await checkFocus(page, `${width}x${height}: resized visible area`);
    for (const lesson of [3, 6, 12]) {
      await openLesson(page, lesson, lesson === 12 ? 'learn' : 'cloze');
      await checkFocus(page, `${width}x${height}: Lesson ${lesson}`);
    }
    // An unusually long card stays readable from its start instead of clipping.
    await page.locator('[data-ui="hope-card-main"]').evaluate(el => { el.textContent = '長い英文でも文字を小さくせず、上から読めます。 '.repeat(35); });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await checkFocus(page, `${width}x${height}: oversized card`);
    await page.getByRole('button', { name: '学習モード選択へ戻る', exact: true }).click();
    assert.equal(await page.evaluate(() => scrollY), 0, 'Menu did not start at top');
    assert.equal(await page.locator('[data-ui="study-screen"]').count(), 0);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('flashcard-favorites:2026-midterm-v1')!)), [4001, 4201, 3301]);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('flashcard-yet-list:2026-midterm-v1')!)), [4002, 4202]);
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine} ${width}x${height}`);
  } catch (error) {
    await page.screenshot({ path: path.join(OUT, `failure-${width}.png`), fullPage: true });
    reports.push({ width, height, error: String(error), pageErrors: errors });
    throw error;
  } finally {
    await context.close();
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ engine, reports }, null, 2));
  }
}
await browser.close();
