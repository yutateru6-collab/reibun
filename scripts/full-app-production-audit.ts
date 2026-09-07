import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type Browser, type Page } from 'playwright';
import {
  basicExampleDecks,
  basicTestDecks,
  visionQuestSentenceDecks,
  visionQuestQuestionDecks,
  type Deck,
  type Card,
} from '../src/data/cards';

const BASE = process.env.APP_URL || 'https://reibun.itisnowornever271.workers.dev/?full_audit=20260908';
const OUT = 'audit/full-app-production';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true });

type Severity = 'critical' | 'major' | 'minor' | 'warning';
type Finding = { severity: Severity; scope: string; message: string; details?: unknown };
const findings: Finding[] = [];
const checks: { scope: string; ok: boolean; message?: string }[] = [];

function norm(value: string) {
  return value
    .replace(/[\[\]]/g, '')
    .replace(/[　\s]+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}
function esc(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function addFinding(severity: Severity, scope: string, message: string, details?: unknown) {
  findings.push({ severity, scope, message, details });
  console.error(`${severity.toUpperCase()} ${scope}: ${message}`);
}
async function check(scope: string, fn: () => Promise<void>) {
  try {
    await fn();
    checks.push({ scope, ok: true });
    console.log(`PASS ${scope}`);
  } catch (e) {
    const message = String((e as Error)?.stack || e);
    checks.push({ scope, ok: false, message });
    addFinding('major', scope, message);
  }
}
async function waitReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('body').waitFor({ state: 'visible' });
}
async function gotoFresh(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  await waitReady(page);
}
async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const m = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (Math.max(m.docWidth, m.bodyWidth) > m.innerWidth + 2) {
    addFinding('major', scope, 'horizontal overflow detected', m);
  }
}
async function flagTextClipping(page: Page, locator: ReturnType<Page['locator']>, scope: string) {
  if (!(await locator.count())) return;
  const clipped = await locator.first().evaluate((el) => {
    const node = el as HTMLElement;
    return { text: node.innerText, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight };
  });
  if (clipped.scrollWidth > clipped.clientWidth + 2 || clipped.scrollHeight > clipped.clientHeight + 2) {
    addFinding('minor', scope, 'visible heading/text is clipped or truncated on mobile', clipped);
  }
}
async function counter(page: Page) {
  const els = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await els.count(); i++) {
    if (await els.nth(i).isVisible().catch(() => false)) return norm(await els.nth(i).innerText());
  }
  return '';
}
async function cardLocator(page: Page) {
  const loc = page.locator('div.cursor-pointer').filter({ hasText: /タップして/ }).first();
  await loc.waitFor({ state: 'visible', timeout: 10000 });
  return loc;
}
async function openBasic(page: Page) {
  await gotoFresh(page);
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /例文（110）/ }).waitFor();
}
async function openVQ(page: Page) {
  await gotoFresh(page);
  await page.getByRole('button', { name: /VISION QUEST/ }).click();
  await page.getByRole('button', { name: '例文', exact: true }).waitFor();
}
async function clickDeckButton(page: Page, title: string) {
  const heading = page.getByRole('heading', { name: title, exact: true });
  const button = page.locator('button').filter({ has: heading }).first();
  await button.waitFor({ state: 'visible', timeout: 10000 });
  await button.click();
  await page.getByText('学習モードを選択', { exact: true }).waitFor();
}
async function openDeck(page: Page, kind: 'basic-example' | 'basic-test' | 'vq-sentence' | 'vq-question', deck: Deck, index: number) {
  if (kind.startsWith('basic')) {
    await openBasic(page);
    if (kind === 'basic-test') await page.getByRole('button', { name: /公式穴埋め（54）/ }).click();
    await clickDeckButton(page, deck.title);
  } else {
    await openVQ(page);
    if (kind === 'vq-question') await page.getByRole('button', { name: '問題', exact: true }).click();
    if (index > 0) await page.getByRole('button', { name: /以前の範囲を見る/ }).click();
    await clickDeckButton(page, deck.title);
  }
}
function expectedFront(kind: string, card: Card) {
  if (kind === 'vq-question') return card.front;
  if (kind === 'vq-sentence') return card.translation;
  return card.front;
}
async function verifyCardFront(page: Page, kind: string, deck: Deck, card: Card, index: number) {
  const cardEl = await cardLocator(page);
  const text = norm(await cardEl.innerText());
  const expected = norm(expectedFront(kind, card));
  if (!text.includes(expected)) {
    const isGenericVqPrompt = kind === 'vq-question' && /日本語に合うように|並べかえ|語句を補|英文を完成|適切な/.test(card.translation);
    addFinding(
      isGenericVqPrompt ? 'critical' : 'major',
      `${kind}/${deck.id}/front/${index + 1}`,
      'front side does not show the actual source problem/prompt',
      { expected, rendered: text, translationField: card.translation }
    );
  }
  if (!text || /^タップして/.test(text)) {
    addFinding('critical', `${kind}/${deck.id}/front/${index + 1}`, 'card front is effectively blank', { rendered: text });
  }
}
async function verifyCardBack(page: Page, kind: string, deck: Deck, card: Card, index: number) {
  const cardEl = await cardLocator(page);
  await cardEl.click();
  await page.waitForTimeout(50);
  const backEl = page.locator('div.cursor-pointer').first();
  const text = norm(await backEl.innerText());
  const expected = norm(card.back);
  if (!text.includes(expected)) {
    addFinding('major', `${kind}/${deck.id}/back/${index + 1}`, 'answer side does not contain the complete answer', { expected, rendered: text });
  }
}
async function auditDeck(page: Page, kind: 'basic-example' | 'basic-test' | 'vq-sentence' | 'vq-question', deck: Deck, deckIndex: number) {
  const scope = `${kind}/${deck.id}`;
  await openDeck(page, kind, deck, deckIndex);
  await assertNoHorizontalOverflow(page, `${scope}/menu`);
  await flagTextClipping(page, page.locator('h1'), `${scope}/menu-title`);
  await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__menu.png`), fullPage: true });

  await page.getByRole('button', { name: /単語カード/ }).click();
  await page.waitForTimeout(120);
  const firstCount = await counter(page);
  if (firstCount !== `1 / ${deck.cards.length}`) {
    addFinding('major', `${scope}/counter`, `wrong first-card counter: ${firstCount}`, { expected: `1 / ${deck.cards.length}` });
  }
  await assertNoHorizontalOverflow(page, `${scope}/standard`);
  await flagTextClipping(page, page.locator('h1'), `${scope}/standard-title`);

  for (let i = 0; i < deck.cards.length; i++) {
    const before = await counter(page);
    if (before !== `${i + 1} / ${deck.cards.length}`) {
      addFinding('major', `${scope}/counter/${i + 1}`, `counter mismatch: ${before}`, { expected: `${i + 1} / ${deck.cards.length}` });
    }
    await verifyCardFront(page, kind, deck, deck.cards[i], i);
    if (i === 0) await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__front.png`), fullPage: true });
    await verifyCardBack(page, kind, deck, deck.cards[i], i);
    if (i === 0) await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__back.png`), fullPage: true });
    if (i < deck.cards.length - 1) {
      await page.getByRole('button', { name: '次のカードへ' }).click();
      await page.waitForTimeout(25);
    }
  }
}

async function smokeOtherModes(page: Page, kind: 'basic-example' | 'vq-sentence' | 'vq-question', deck: Deck, deckIndex: number) {
  const modes = [
    { name: /答えから覚える/, marker: deck.cards[0].back },
    { name: /自己申告テスト/, marker: deck.cards[0].front },
    { name: /並べ替えクイズ/, marker: '' },
  ];
  for (const mode of modes) {
    await openDeck(page, kind, deck, deckIndex);
    await page.getByRole('button', { name: mode.name }).click();
    await page.waitForTimeout(150);
    await assertNoHorizontalOverflow(page, `${kind}/${deck.id}/${String(mode.name)}`);
    const body = norm(await page.locator('body').innerText());
    if (mode.marker && !body.includes(norm(mode.marker))) {
      // VQ sentence self mode intentionally shows the source English and Japanese; VQ question should show the problem.
      addFinding('major', `${kind}/${deck.id}/${String(mode.name)}`, 'mode opened but expected card content is not visible', { expected: norm(mode.marker), body: body.slice(0, 1200) });
    }
  }

  await openDeck(page, kind, deck, deckIndex);
  await page.getByLabel('問題を考える時間').selectOption('3');
  await page.getByLabel('答えを表示する時間').selectOption('3');
  await page.getByRole('button', { name: /タイムアタック開始/ }).click();
  await page.waitForTimeout(150);
  await assertNoHorizontalOverflow(page, `${kind}/${deck.id}/time`);
}

async function auditLandings(page: Page) {
  await gotoFresh(page);
  await assertNoHorizontalOverflow(page, 'top');
  const body = await page.locator('body').innerText();
  if (!/基本例文/.test(body) || !/VISION QUEST/.test(body)) addFinding('critical', 'top', 'main navigation is missing');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'top-mobile.png'), fullPage: true });

  await openBasic(page);
  await assertNoHorizontalOverflow(page, 'basic-home-sentences');
  const lessonButtons = page.locator('button').filter({ has: page.locator('h2') });
  if (await lessonButtons.count() < 12) addFinding('major', 'basic-home-sentences', 'fewer than 12 lesson deck buttons are visible');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'basic-home-sentences.png'), fullPage: true });
  await page.getByRole('button', { name: /公式穴埋め（54）/ }).click();
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'basic-home-tests.png'), fullPage: true });

  await openVQ(page);
  await assertNoHorizontalOverflow(page, 'vq-home-sentences');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-home-sentences.png'), fullPage: true });
  await page.getByRole('button', { name: '問題', exact: true }).click();
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-home-questions.png'), fullPage: true });
  await page.getByRole('button', { name: /以前の範囲を見る/ }).click();
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-home-questions-older.png'), fullPage: true });
}

async function auditMobileChromium() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 416, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await check('chromium-mobile/landings', () => auditLandings(page));
  for (const [i, deck] of basicExampleDecks.entries()) await check(`chromium-mobile/basic-example/${deck.id}`, () => auditDeck(page, 'basic-example', deck, i));
  for (const [i, deck] of basicTestDecks.entries()) await check(`chromium-mobile/basic-test/${deck.id}`, () => auditDeck(page, 'basic-test', deck, i));
  for (const [i, deck] of visionQuestSentenceDecks.entries()) await check(`chromium-mobile/vq-sentence/${deck.id}`, () => auditDeck(page, 'vq-sentence', deck, i));
  for (const [i, deck] of visionQuestQuestionDecks.entries()) await check(`chromium-mobile/vq-question/${deck.id}`, () => auditDeck(page, 'vq-question', deck, i));

  await check('chromium-mobile/modes/basic', () => smokeOtherModes(page, 'basic-example', basicExampleDecks[0], 0));
  await check('chromium-mobile/modes/vq-sentence', () => smokeOtherModes(page, 'vq-sentence', visionQuestSentenceDecks[0], 0));
  await check('chromium-mobile/modes/vq-question', () => smokeOtherModes(page, 'vq-question', visionQuestQuestionDecks[0], 0));

  if (pageErrors.length) addFinding('critical', 'chromium-mobile/runtime', 'uncaught page errors occurred', pageErrors);
  if (consoleErrors.length) addFinding('major', 'chromium-mobile/console', 'console errors occurred', consoleErrors);
  await context.close();
  await browser.close();
}

async function auditWebkitReproduction() {
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 416, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await check('webkit-mobile/current-range-question-front', async () => {
    await openDeck(page, 'vq-question', visionQuestQuestionDecks[0], 0);
    await page.getByRole('button', { name: /単語カード/ }).click();
    await verifyCardFront(page, 'vq-question', visionQuestQuestionDecks[0], visionQuestQuestionDecks[0].cards[0], 0);
    await assertNoHorizontalOverflow(page, 'webkit-mobile/current-range-question-front');
    await page.screenshot({ path: path.join(OUT, 'screenshots', 'webkit-current-range-question-front.png'), fullPage: true });
  });
  await context.close();
  await browser.close();
}

await auditMobileChromium();
await auditWebkitReproduction();

const bySeverity = findings.reduce<Record<string, number>>((acc, f) => {
  acc[f.severity] = (acc[f.severity] || 0) + 1;
  return acc;
}, {});
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  sourceDecks: {
    basicExampleDecks: basicExampleDecks.length,
    basicTestDecks: basicTestDecks.length,
    visionQuestSentenceDecks: visionQuestSentenceDecks.length,
    visionQuestQuestionDecks: visionQuestQuestionDecks.length,
    sourceCardsVisited: [basicExampleDecks, basicTestDecks, visionQuestSentenceDecks, visionQuestQuestionDecks]
      .flat(2)
      .reduce((sum: number, item: any) => sum + (item?.cards?.length || 0), 0),
  },
  checks: { total: checks.length, passed: checks.filter((c) => c.ok).length, failed: checks.filter((c) => !c.ok).length },
  bySeverity,
  findings,
};
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'summary.txt'), [
  `BASE=${BASE}`,
  `checks=${report.checks.total} passed=${report.checks.passed} failed=${report.checks.failed}`,
  `findings=${findings.length}`,
  `critical=${bySeverity.critical || 0} major=${bySeverity.major || 0} minor=${bySeverity.minor || 0} warning=${bySeverity.warning || 0}`,
].join('\n'));
console.log(JSON.stringify(report, null, 2));

if ((bySeverity.critical || 0) + (bySeverity.major || 0) > 0) process.exit(1);
