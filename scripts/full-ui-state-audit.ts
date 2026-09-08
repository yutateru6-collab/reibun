import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type Browser, type Page } from 'playwright';
import { basicExampleDecks, basicTestDecks, visionQuestQuestionDecks, visionQuestSentenceDecks, type Deck, type Card } from '../src/data/cards';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173/?state_audit=1';
const OUT = 'audit/full-ui-state';
fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true });

type Finding = { severity: 'critical' | 'major' | 'minor'; scope: string; message: string; details?: unknown };
const findings: Finding[] = [];
const checks: { scope: string; ok: boolean; error?: string }[] = [];
const norm = (s: string) => s.replace(/[\[\]]/g, '').replace(/[　\s]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
const add = (severity: Finding['severity'], scope: string, message: string, details?: unknown) => {
  findings.push({ severity, scope, message, details });
  console.error(`${severity.toUpperCase()} ${scope}: ${message}`);
};
async function test(scope: string, fn: () => Promise<void>) {
  try { await fn(); checks.push({ scope, ok: true }); console.log(`PASS ${scope}`); }
  catch (e) { const error = String((e as Error)?.stack || e); checks.push({ scope, ok: false, error }); add('major', scope, error); }
}
async function fresh(page: Page, clear = false) {
  if (clear) await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  if (clear) await page.evaluate(() => localStorage.clear());
  if (clear) await page.reload({ waitUntil: 'networkidle' });
}
async function assertBodyIncludes(page: Page, expected: string, scope: string) {
  const body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(expected))) throw new Error(`${scope}: expected body to include ${JSON.stringify(expected)}; body=${body.slice(0, 1600)}`);
}
async function assertNoOverflow(page: Page, scope: string) {
  const m = await page.evaluate(() => ({ width: innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  if (Math.max(m.doc, m.body) > m.width + 2) add('major', scope, 'horizontal overflow', m);
}
async function assertTitleNotClipped(page: Page, scope: string) {
  const h = page.locator('h1').first();
  if (!(await h.count())) return;
  const m = await h.evaluate((e) => { const x = e as HTMLElement; const cs = getComputedStyle(x); return { text:x.innerText, sw:x.scrollWidth,cw:x.clientWidth,sh:x.scrollHeight,ch:x.clientHeight,overflow:cs.overflow,textOverflow:cs.textOverflow,whiteSpace:cs.whiteSpace }; });
  if (m.sw > m.cw + 2 || m.sh > m.ch + 2 || (m.textOverflow === 'ellipsis' && m.overflow === 'hidden')) add('major', scope, 'title is clipped/truncated', m);
}
async function screenshot(page: Page, name: string) { await page.screenshot({ path: path.join(OUT, 'screenshots', `${name}.png`), fullPage: true }); }
async function clickDeck(page: Page, deck: Deck) {
  const h = page.getByRole('heading', { name: deck.title, exact: true });
  await page.locator('button').filter({ has: h }).first().click();
  await page.getByText('学習モードを選択', { exact: true }).waitFor();
}
async function openBasic(page: Page) {
  await fresh(page);
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /例文（110）/ }).waitFor();
}
async function openBasicDeck(page: Page, deck: Deck, tests = false) {
  await openBasic(page);
  if (tests) await page.getByRole('button', { name: /公式穴埋め（54）/ }).click();
  await clickDeck(page, deck);
}
async function openVq(page: Page) {
  await fresh(page);
  await page.getByRole('button', { name: /VISION QUEST/ }).click();
  await page.getByRole('button', { name: '例文', exact: true }).waitFor();
}
async function openVqDeck(page: Page, deck: Deck, questions: boolean) {
  await openVq(page);
  if (questions) await page.getByRole('button', { name: '問題', exact: true }).click();
  const list = questions ? visionQuestQuestionDecks : visionQuestSentenceDecks;
  if (list.indexOf(deck) > 0) await page.getByRole('button', { name: /以前の範囲を見る/ }).click();
  await clickDeck(page, deck);
}
async function firstClickableCard(page: Page) {
  const el = page.locator('div.cursor-pointer').first();
  await el.waitFor({ state: 'visible', timeout: 10000 });
  return el;
}
function questionPrompt(card: Card, vq: boolean) { return vq ? card.front : `${card.front}\n${card.translation}`; }

async function auditVqQuestionStates(page: Page) {
  const deck = visionQuestQuestionDecks[0];
  const card = deck.cards[0];

  await openVqDeck(page, deck, true);
  await assertBodyIncludes(page, '問題カード', 'VQ menu question semantics');
  await assertTitleNotClipped(page, 'VQ question menu title');
  await assertNoOverflow(page, 'VQ question menu');
  await screenshot(page, 'vq-question-menu');

  await page.getByRole('button', { name: /問題カード/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ standard source prompt');
  const generic = card.translation;
  const cardText = norm(await (await firstClickableCard(page)).innerText());
  if (cardText === norm(generic) || (!cardText.includes(norm(card.front)))) add('critical', 'VQ standard source prompt', 'generic task label replaced the actual question', { generic, cardText, expected: card.front });
  await assertTitleNotClipped(page, 'VQ standard mobile title');
  await assertNoOverflow(page, 'VQ standard');
  await screenshot(page, 'vq-question-standard-front');

  // Favorite + yet controls should remain single-line on mobile and persist.
  await page.getByTitle('このカードをお気に入りに登録・解除').click();
  await page.getByTitle('このカードを「まだ」リストに登録・解除').click();
  await assertNoOverflow(page, 'VQ favorite/yet controls');
  await openVqDeck(page, deck, true);
  await page.getByRole('button', { name: /問題カード/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ persistence after reload and reopening deck');
  await assertBodyIncludes(page, '★登録中', 'favorite persisted');
  await assertBodyIncludes(page, 'まだ登録中', 'yet persisted');

  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.back, 'VQ standard answer');
  await screenshot(page, 'vq-question-standard-back');
  await page.getByRole('button', { name: '学習モード選択へ戻る' }).click();
  await page.getByRole('button', { name: '教材一覧へ戻る' }).click();
  await assertBodyIncludes(page, 'VISION QUEST', 'VQ home return');
  await page.getByRole('button', { name: /「まだ」のカードを復習する/ }).click();
  await assertBodyIncludes(page, '「まだ」の復習デッキ', 'VQ yet review menu');
  await page.getByRole('button', { name: '教材一覧へ戻る' }).click();
  await assertBodyIncludes(page, 'VISION QUEST', 'VQ yet review returns to VQ, not Hope home');

  // Memorize reverse check.
  await openVqDeck(page, deck, true);
  await page.getByRole('button', { name: /答えから覚える/ }).click();
  await assertBodyIncludes(page, card.back, 'VQ memorize answer front');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.front, 'VQ memorize source problem back');

  // Self-test source problem -> answer.
  await openVqDeck(page, deck, true);
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ self source problem');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.back, 'VQ self answer');

  // Order prompt includes source context.
  await openVqDeck(page, deck, true);
  await page.getByRole('button', { name: /並べ替えクイズ/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ order source problem');
  await assertNoOverflow(page, 'VQ order');

  // Time attack source problem.
  await openVqDeck(page, deck, true);
  await page.getByLabel('問題を考える時間').selectOption('15');
  await page.getByLabel('答えを表示する時間').selectOption('5');
  await page.getByRole('button', { name: /タイムアタック開始/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ time source problem');
  await assertNoOverflow(page, 'VQ time');
}

async function auditHopeOfficialQuestionStates(page: Page) {
  const deck = basicTestDecks[0];
  const card = deck.cards[0];
  await openBasicDeck(page, deck, true);
  await assertBodyIncludes(page, '問題カード', 'Hope official menu question semantics');
  await page.getByRole('button', { name: /問題カード/ }).click();
  await assertBodyIncludes(page, card.front, 'Hope standard blank prompt');
  await assertBodyIncludes(page, card.translation, 'Hope standard Japanese prompt');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.back, 'Hope standard answer');

  await openBasicDeck(page, deck, true);
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  await assertBodyIncludes(page, card.front, 'Hope self blank source prompt');
  await assertBodyIncludes(page, card.translation, 'Hope self Japanese source prompt');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.back, 'Hope self answer');

  await openBasicDeck(page, deck, true);
  await page.getByLabel('問題を考える時間').selectOption('15');
  await page.getByLabel('答えを表示する時間').selectOption('5');
  await page.getByRole('button', { name: /タイムアタック開始/ }).click();
  await assertBodyIncludes(page, card.front, 'Hope time blank source prompt');
  await assertBodyIncludes(page, card.translation, 'Hope time Japanese source prompt');
}

async function auditBasicExampleModes(page: Page) {
  const deck = basicExampleDecks[0];
  const card = deck.cards[0];
  await openBasicDeck(page, deck, false);
  await page.getByRole('button', { name: /単語カード/ }).click();
  await assertBodyIncludes(page, card.front, 'basic standard front');
  await assertBodyIncludes(page, card.translation, 'basic standard translation');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.back, 'basic standard back');

  await openBasicDeck(page, deck, false);
  await page.getByRole('button', { name: /答えから覚える/ }).click();
  await assertBodyIncludes(page, card.back, 'basic memorize English');

  await openBasicDeck(page, deck, false);
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  await assertBodyIncludes(page, card.back, 'basic self English');
  await (await firstClickableCard(page)).click();
  await assertBodyIncludes(page, card.translation, 'basic self Japanese');

  await openBasicDeck(page, deck, false);
  await page.getByRole('button', { name: /並べ替えクイズ/ }).click();
  await assertBodyIncludes(page, card.translation, 'basic order prompt');
}

async function auditResultScreen(page: Page) {
  const deck = [...basicTestDecks].sort((a,b) => a.cards.length - b.cards.length)[0];
  await openBasicDeck(page, deck, true);
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  for (let i = 0; i < deck.cards.length; i++) {
    await (await firstClickableCard(page)).click();
    await page.getByRole('button', { name: /わかった/ }).click();
    await page.waitForTimeout(25);
  }
  await assertBodyIncludes(page, 'テスト完了！', 'result screen');
  await assertBodyIncludes(page, '100%', 'result score');
  await screenshot(page, 'result-screen');
  await page.getByRole('button', { name: /メニューに戻る/ }).click();
  await assertBodyIncludes(page, '学習モードを選択', 'result return menu');
}

async function auditThemeAndOldRanges(page: Page) {
  await fresh(page, true);
  await page.getByRole('button', { name: /VISION QUEST/ }).click();
  const root = page.locator('html');
  await page.getByRole('button', { name: 'テーマ切り替え' }).click();
  const cls = await root.getAttribute('class');
  if (!cls?.includes('dark')) add('major', 'theme', 'dark mode class did not activate');
  await page.getByRole('button', { name: /以前の範囲を見る/ }).click();
  for (const d of visionQuestSentenceDecks) await assertBodyIncludes(page, d.title, `older sentence deck ${d.id}`);
  await page.getByRole('button', { name: '問題', exact: true }).click();
  for (const d of visionQuestQuestionDecks) await assertBodyIncludes(page, d.title, `older question deck ${d.id}`);
  await assertNoOverflow(page, 'VQ expanded older ranges');
}

async function runBrowser(browser: Browser, label: string, deep: boolean) {
  const context = await browser.newContext({ viewport: { width: 416, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await test(`${label}/VQ-question-states`, () => auditVqQuestionStates(page));
  if (deep) {
    await test(`${label}/Hope-official-question-states`, () => auditHopeOfficialQuestionStates(page));
    await test(`${label}/basic-example-modes`, () => auditBasicExampleModes(page));
    await test(`${label}/result-screen`, () => auditResultScreen(page));
    await test(`${label}/theme-old-ranges`, () => auditThemeAndOldRanges(page));
  }
  if (errors.length) add('critical', `${label}/runtime`, 'uncaught page errors', errors);
  if (consoleErrors.length) add('major', `${label}/console`, 'console errors', consoleErrors);
  await context.close();
}

const c = await chromium.launch({ headless: true });
await runBrowser(c, 'chromium-mobile', true);
await c.close();
const w = await webkit.launch({ headless: true });
await runBrowser(w, 'webkit-ios-like', false);
await w.close();

const bySeverity = findings.reduce<Record<string, number>>((a, f) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {});
const report = { generatedAt: new Date().toISOString(), baseUrl: BASE, checks, bySeverity, findings };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'summary.txt'), `checks=${checks.length}\npassed=${checks.filter(x=>x.ok).length}\nfailed=${checks.filter(x=>!x.ok).length}\ncritical=${bySeverity.critical||0}\nmajor=${bySeverity.major||0}\nminor=${bySeverity.minor||0}\n`);
console.log(JSON.stringify(report, null, 2));
if ((bySeverity.critical || 0) + (bySeverity.major || 0) > 0 || checks.some(x => !x.ok)) process.exit(1);
