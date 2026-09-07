import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/interaction-regression';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function snap(page, engine, name) {
  const path = `${OUT}/${engine}-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function openLesson1(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /Lesson 1/ }).first().click();
  await page.getByText('学習モードを選択').waitFor();
}

async function counterText(page) {
  const candidates = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  const count = await candidates.count();
  for (let i = 0; i < count; i++) {
    const el = candidates.nth(i);
    if (await el.isVisible().catch(() => false)) return (await el.innerText()).trim();
  }
  return '';
}

async function resumeViaFocus(context, page) {
  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await page.waitForTimeout(250);
  await page.bringToFront();
  await page.waitForTimeout(450);
  await other.close();
}

async function runCase(engine, name, fn) {
  try {
    await fn();
    results.push({ engine, name, ok: true });
    console.log(`PASS ${engine}: ${name}`);
  } catch (error) {
    const message = error?.stack || String(error);
    results.push({ engine, name, ok: false, error: message });
    failures.push({ engine, name, error: message });
    console.error(`FAIL ${engine}: ${name}\n${message}`);
  }
}

async function auditEngine(engine, browserType) {
  const browser = await browserType.launch({ headless: true });

  await runCase(engine, 'standard-mini-after-resume-does-not-flip-or-advance', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /単語カード/ }).click();
    const frontText = page.getByText('There are many books on the president’s life.', { exact: true }).first();
    await frontText.waitFor();
    const card = frontText.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]');
    await card.click();
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ });
    await mini.waitFor();
    const before = await counterText(page);
    assert(before === '1 / 9', `unexpected starting counter: ${before}`);
    await resumeViaFocus(context, page);
    await mini.click();
    await page.getByText('タップして閉じる').waitFor();
    await page.waitForTimeout(900);
    const after = await counterText(page);
    assert(after === before, `mini explanation advanced card: ${before} -> ${after}`);
    assert(await page.getByText('タップして閉じる').isVisible(), 'mini explanation closed or card flipped unexpectedly');
    await snap(page, engine, 'standard-mini-resume');
    await context.close();
  });

  await runCase(engine, 'standard-favorite-yet-prev-next-controls-do-not-flip-card', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /単語カード/ }).click();
    const frontText = page.getByText('There are many books on the president’s life.', { exact: true }).first();
    const card = frontText.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]');
    await card.click();
    await page.getByRole('button', { name: /ミニ解説を見る/ }).waitFor();
    const before = await counterText(page);
    await page.getByRole('button', { name: /お気に入り登録/ }).click();
    assert(await page.getByRole('button', { name: /ミニ解説を見る/ }).isVisible(), 'favorite control flipped card');
    assert((await counterText(page)) === before, 'favorite control changed card');
    await page.getByRole('button', { name: /「まだ」リスト追加/ }).click();
    assert(await page.getByRole('button', { name: /ミニ解説を見る/ }).isVisible(), 'yet control flipped card');
    assert((await counterText(page)) === before, 'yet control changed card');
    await page.getByRole('button', { name: '次のカードへ' }).click();
    assert((await counterText(page)) === '2 / 9', 'next did not advance exactly one card');
    await page.getByRole('button', { name: '前のカードへ' }).click();
    assert((await counterText(page)) === '1 / 9', 'previous did not return exactly one card');
    await context.close();
  });

  await runCase(engine, 'memorize-mini-after-resume-stays-on-same-card', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /答えから覚える/ }).click();
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ });
    await mini.waitFor();
    const before = await counterText(page);
    await resumeViaFocus(context, page);
    await mini.click();
    await page.getByText('タップして閉じる').waitFor();
    assert((await counterText(page)) === before, 'memorize mini changed card');
    await context.close();
  });

  await runCase(engine, 'self-assessment-mini-does-not-submit-or-advance', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /自己申告テスト/ }).click();
    const english = page.getByText('There are many books on the president’s life.', { exact: true }).first();
    const card = english.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]');
    await card.click();
    await page.getByRole('button', { name: /💡 ミニ解説/ }).waitFor();
    const before = await counterText(page);
    await resumeViaFocus(context, page);
    await page.getByRole('button', { name: /💡 ミニ解説/ }).click();
    await page.waitForTimeout(700);
    assert((await counterText(page)) === before, 'self mini advanced question');
    assert(await page.getByRole('button', { name: /まだ/ }).isVisible(), 'self controls disappeared after mini click');
    assert(await page.getByRole('button', { name: /わかった/ }).isVisible(), 'self controls disappeared after mini click');
    await page.getByRole('button', { name: /わかった/ }).click();
    await page.waitForTimeout(250);
    assert((await counterText(page)) === '2 / 9', 'self assessment did not advance exactly one');
    await context.close();
  });

  await runCase(engine, 'time-attack-mini-pauses-auto-advance-until-closed', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByLabel('問題を考える時間').selectOption('3');
    await page.getByLabel('答えを表示する時間').selectOption('5');
    await page.getByRole('button', { name: /タイムアタック開始/ }).click();
    await page.getByRole('button', { name: /💡 ミニ解説/ }).waitFor({ timeout: 7000 });
    const before = await counterText(page);
    await page.getByRole('button', { name: /💡 ミニ解説/ }).click();
    await page.waitForTimeout(6200);
    const after = await counterText(page);
    assert(after === before, `time attack advanced while mini explanation was open: ${before} -> ${after}`);
    await snap(page, engine, 'time-mini-pause');
    await context.close();
  });

  await runCase(engine, 'order-quiz-completes-first-question-and-advances-once', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /並べ替えクイズ/ }).click();
    const words = ['There', 'are', 'many', 'books', 'on', 'the', 'president’s', 'life.'];
    for (const word of words) {
      const poolButton = page.locator('button.border-2').filter({ hasText: new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first();
      await poolButton.click();
    }
    await page.getByRole('button', { name: /解答する/ }).click();
    await page.getByText(/正解/).waitFor();
    await page.waitForTimeout(2300);
    assert((await counterText(page)) === '2 / 9', 'word order did not advance exactly once');
    await context.close();
  });

  await runCase(engine, 'vq-comment-accordion-does-not-flip-or-advance', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /VISION QUEST/ }).click();
    await page.getByRole('button', { name: /今回の試験範囲/ }).first().click();
    await page.getByRole('button', { name: /単語カード/ }).click();
    const card = page.locator('div.cursor-pointer').filter({ hasText: /タップして完成文を見る/ }).first();
    await card.click();
    const point = page.getByRole('button', { name: /💡 ぽいんと/ });
    await point.waitFor();
    const before = await counterText(page);
    await resumeViaFocus(context, page);
    await point.click();
    await page.waitForTimeout(700);
    assert((await counterText(page)) === before, 'VQ point accordion advanced card');
    assert(await page.getByText(/タップで折りたたむ/).isVisible(), 'VQ point accordion did not remain open');
    await context.close();
  });

  await runCase(engine, 'freshness-check-must-not-reload-active-study-session', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await openLesson1(page);
    await page.getByRole('button', { name: /単語カード/ }).click();
    const frontText = page.getByText('There are many books on the president’s life.', { exact: true }).first();
    const card = frontText.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]');
    await card.click();
    await page.getByRole('button', { name: /ミニ解説を見る/ }).waitFor();
    await page.route('**/?__ui_check=*', async route => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head><script type="module" src="/assets/fake-new-bundle.js"></script></head><body></body></html>' });
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(1000);
    assert(await page.getByRole('button', { name: /ミニ解説を見る/ }).isVisible().catch(() => false), 'freshness check reloaded active study session and lost the current card');
    await context.close();
  });

  await browser.close();
}

await auditEngine('chromium-mobile', chromium);
await auditEngine('webkit-mobile', webkit);

const summary = {
  total: results.length,
  passed: results.filter(r => r.ok).length,
  failed: failures.length,
  results,
};
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(summary, null, 2));
fs.writeFileSync(`${OUT}/report.md`, [
  '# Interaction regression audit',
  '',
  `Total: ${summary.total}`,
  `Passed: ${summary.passed}`,
  `Failed: ${summary.failed}`,
  '',
  ...results.map(r => `- ${r.ok ? 'PASS' : 'FAIL'} — ${r.engine} — ${r.name}${r.ok ? '' : `\n  - ${String(r.error).split('\n')[0]}`}`),
].join('\n'));

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
