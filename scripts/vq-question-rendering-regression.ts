import fs from 'node:fs';
import { chromium, webkit, type BrowserType, type Page } from 'playwright';
import { basicTestDecks, visionQuestQuestionDecks, type Card, type Deck } from '../src/data/cards';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/vq-question-regression';
fs.mkdirSync(OUT, { recursive: true });

type Result = { engine: string; check: string; ok: boolean; error?: string };
const results: Result[] = [];
const normalize = (value: string) => value.replace(/[\[\]]/g, '').replace(/[　\s]+/g, ' ').trim();
const assert = (value: unknown, message: string): asserts value => { if (!value) throw new Error(message); };

async function run(engine: string, check: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ engine, check, ok: true });
    console.log(`PASS ${engine}: ${check}`);
  } catch (error) {
    const text = String((error as Error)?.stack || error);
    results.push({ engine, check, ok: false, error: text });
    console.error(`FAIL ${engine}: ${check}\n${text}`);
  }
}

async function noHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert(Math.max(metrics.documentWidth, metrics.bodyWidth) <= metrics.innerWidth + 2, `${label}: horizontal overflow ${JSON.stringify(metrics)}`);
}

async function titleIsNotEllipsized(page: Page, label: string) {
  const h1 = page.locator('h1').first();
  await h1.waitFor({ state: 'visible' });
  const metrics = await h1.evaluate((element) => {
    const node = element as HTMLElement;
    const style = getComputedStyle(node);
    return {
      text: node.innerText,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      scrollHeight: node.scrollHeight,
      clientHeight: node.clientHeight,
      overflow: style.overflow,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
    };
  });
  assert(!(metrics.textOverflow === 'ellipsis' && metrics.overflow === 'hidden'), `${label}: title still uses ellipsis ${JSON.stringify(metrics)}`);
  assert(metrics.scrollWidth <= metrics.clientWidth + 2 && metrics.scrollHeight <= metrics.clientHeight + 2, `${label}: title is clipped ${JSON.stringify(metrics)}`);
}

async function openVqHome(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /VISION QUEST/ }).click();
  await page.getByRole('button', { name: '例文', exact: true }).waitFor();
}

async function openDeck(page: Page, deck: Deck, kind: 'vq-question' | 'hope-test') {
  if (kind === 'vq-question') {
    await openVqHome(page);
    await page.getByRole('button', { name: '問題', exact: true }).click();
  } else {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
    await page.getByRole('button', { name: /公式穴埋め/ }).click();
  }
  const heading = page.getByRole('heading', { name: deck.title, exact: true });
  await page.locator('button').filter({ has: heading }).first().click();
  await page.getByText('学習モードを選択', { exact: true }).waitFor();
}

async function firstCard(page: Page) {
  const card = page.locator('div.cursor-pointer').first();
  await card.waitFor({ state: 'visible' });
  return card;
}

function assertActualQuestion(rendered: string, card: Card, label: string) {
  const actual = normalize(rendered);
  const prompt = normalize(card.front);
  const generic = normalize(card.translation);
  assert(actual.includes(prompt), `${label}: actual source problem is missing. expected=${JSON.stringify(prompt)} rendered=${JSON.stringify(actual)}`);
  assert(actual !== generic, `${label}: only the generic task label is visible: ${JSON.stringify(generic)}`);
}

async function auditVqQuestion(page: Page, engine: string) {
  const deck = visionQuestQuestionDecks[0];
  const card = deck.cards[0];

  await openDeck(page, deck, 'vq-question');
  await page.getByRole('button', { name: /問題カード/ }).waitFor();
  await titleIsNotEllipsized(page, `${engine}/VQ menu`);
  await noHorizontalOverflow(page, `${engine}/VQ menu`);

  await page.getByRole('button', { name: /問題カード/ }).click();
  let cardEl = await firstCard(page);
  assertActualQuestion(await cardEl.innerText(), card, `${engine}/VQ standard front`);
  await titleIsNotEllipsized(page, `${engine}/VQ study header`);
  await noHorizontalOverflow(page, `${engine}/VQ standard`);
  await page.screenshot({ path: `${OUT}/${engine}-vq-standard-front.png`, fullPage: true });

  await cardEl.click();
  cardEl = await firstCard(page);
  assert(normalize(await cardEl.innerText()).includes(normalize(card.back)), `${engine}/VQ standard back: completed answer missing`);

  await openDeck(page, deck, 'vq-question');
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  cardEl = await firstCard(page);
  assertActualQuestion(await cardEl.innerText(), card, `${engine}/VQ self-test front`);
  await cardEl.click();
  assert(normalize(await (await firstCard(page)).innerText()).includes(normalize(card.back)), `${engine}/VQ self-test back: answer missing`);

  await openDeck(page, deck, 'vq-question');
  await page.getByRole('button', { name: /並べ替えクイズ/ }).click();
  assertActualQuestion(await page.locator('body').innerText(), card, `${engine}/VQ word-order prompt`);

  await openDeck(page, deck, 'vq-question');
  await page.getByLabel('問題を考える時間').selectOption('15');
  await page.getByLabel('答えを表示する時間').selectOption('5');
  await page.getByRole('button', { name: /タイムアタック開始/ }).click();
  cardEl = await firstCard(page);
  assertActualQuestion(await cardEl.innerText(), card, `${engine}/VQ time-attack front`);
}

async function auditHopeOfficialQuestion(page: Page, engine: string) {
  const deck = basicTestDecks[0];
  const card = deck.cards[0];
  await openDeck(page, deck, 'hope-test');
  await page.getByRole('button', { name: /問題カード/ }).waitFor();

  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  const cardEl = await firstCard(page);
  const rendered = normalize(await cardEl.innerText());
  assert(rendered.includes(normalize(card.front)), `${engine}/Hope self-test: blank question missing`);
  assert(rendered.includes(normalize(card.translation)), `${engine}/Hope self-test: Japanese prompt missing`);

  await openDeck(page, deck, 'hope-test');
  await page.getByLabel('問題を考える時間').selectOption('15');
  await page.getByLabel('答えを表示する時間').selectOption('5');
  await page.getByRole('button', { name: /タイムアタック開始/ }).click();
  const timeCard = await firstCard(page);
  const timeRendered = normalize(await timeCard.innerText());
  assert(timeRendered.includes(normalize(card.front)), `${engine}/Hope time-attack: blank question missing`);
  assert(timeRendered.includes(normalize(card.translation)), `${engine}/Hope time-attack: Japanese prompt missing`);
}

async function auditVqYetNavigation(page: Page, engine: string) {
  const deck = visionQuestQuestionDecks[0];
  await openDeck(page, deck, 'vq-question');
  await page.getByRole('button', { name: /問題カード/ }).click();
  await page.getByTitle('このカードを「まだ」リストに登録・解除').click();
  await page.getByRole('button', { name: '学習モード選択へ戻る' }).click();
  await page.getByRole('button', { name: '教材一覧へ戻る' }).click();
  await page.getByRole('button', { name: /「まだ」のカードを復習する/ }).click();
  await page.getByText('「まだ」の復習デッキ', { exact: true }).waitFor();
  await page.getByRole('button', { name: '教材一覧へ戻る' }).click();
  await page.getByRole('button', { name: '例文', exact: true }).waitFor();
  assert((await page.locator('body').innerText()).includes('VISION QUEST'), `${engine}/VQ yet review returned to the wrong home`);
}

async function auditEngine(engine: string, browserType: BrowserType) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await run(engine, 'VQ source question appears in every question-facing mode', () => auditVqQuestion(page, engine));
  await run(engine, 'Hope official tests remain question-first in self/time modes', () => auditHopeOfficialQuestion(page, engine));
  await run(engine, 'VQ yet-review returns to VISION QUEST', () => auditVqYetNavigation(page, engine));
  await run(engine, 'No uncaught page errors', async () => assert(pageErrors.length === 0, pageErrors.join(' | ')));

  await context.close();
  await browser.close();
}

await auditEngine('chromium-mobile', chromium);
await auditEngine('webkit-ios-like', webkit);

const failed = results.filter(result => !result.ok);
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length }, null, 2));
if (failed.length) process.exit(1);
