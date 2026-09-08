import fs from 'node:fs';
import { chromium } from 'playwright';
import {
  basicExampleDecks,
  basicTestDecks,
  visionQuestSentenceDecks,
  visionQuestQuestionDecks,
} from '../src/data/cards.ts';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const GROUP = process.env.AUDIT_GROUP || 'basic-example';
const OUT = `audit/every-card/${GROUP}`;
fs.mkdirSync(OUT, { recursive: true });

const groups = {
  'basic-example': { decks: basicExampleDecks, kind: 'basic-example' },
  'basic-test': { decks: basicTestDecks, kind: 'basic-test' },
  'vq-sentence': { decks: visionQuestSentenceDecks, kind: 'vq-sentence' },
  'vq-question': { decks: visionQuestQuestionDecks, kind: 'vq-question' },
};
if (!groups[GROUP]) throw new Error(`Unknown AUDIT_GROUP=${GROUP}`);
const { decks, kind } = groups[GROUP];

const norm = (s) => s.replace(/[\[\]]/g, '').replace(/[　\s]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
const results = [];
const failures = [];
function assert(ok, message, details) {
  if (!ok) {
    const error = { message, details };
    failures.push(error);
    console.error('FAIL', message, details || '');
  }
}
async function domClick(locator) {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.evaluate((el) => el.click());
}
async function counter(page) {
  const all = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await all.count(); i++) {
    if (await all.nth(i).isVisible().catch(() => false)) return norm(await all.nth(i).innerText());
  }
  return '';
}
async function card(page) {
  const el = page.locator('div.cursor-pointer').first();
  await el.waitFor({ state: 'visible', timeout: 10000 });
  return el;
}
async function openRoot(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
}
async function openDeck(page, deck, index) {
  await openRoot(page);
  if (kind.startsWith('basic')) {
    await domClick(page.getByRole('button', { name: /基本例文.*マスター/s }));
    await page.getByRole('button', { name: /例文（110）/ }).waitFor({ state: 'visible', timeout: 10000 });
    if (kind === 'basic-test') await domClick(page.getByRole('button', { name: /公式穴埋め/ }));
  } else {
    await domClick(page.getByRole('button', { name: /VISION QUEST/ }));
    await page.getByRole('button', { name: '例文', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    if (kind === 'vq-question') await domClick(page.getByRole('button', { name: '問題', exact: true }));
    if (index > 0) await domClick(page.getByRole('button', { name: /以前の範囲を見る/ }));
  }
  const heading = page.getByRole('heading', { name: deck.title, exact: true });
  await domClick(page.locator('button').filter({ has: heading }).first());
  await page.getByText('学習モードを選択', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
  await domClick(page.getByRole('button', { name: /単語カード|問題カード/ }));
  await card(page);
}
function expectedFront(c) {
  if (kind === 'vq-question') return c.front;
  if (kind === 'vq-sentence') return c.translation;
  return c.front;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

for (let di = 0; di < decks.length; di++) {
  const deck = decks[di];
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  try {
    await openDeck(page, deck, di);
    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 2, `${deck.id}: horizontal overflow`, { overflow });

    for (let ci = 0; ci < deck.cards.length; ci++) {
      const source = deck.cards[ci];
      const position = await counter(page);
      assert(position === `${ci + 1} / ${deck.cards.length}`, `${deck.id} card ${ci + 1}: counter mismatch`, { position });

      const frontEl = await card(page);
      const frontText = norm(await frontEl.innerText());
      const expected = norm(expectedFront(source));
      assert(frontText.includes(expected), `${deck.id} card ${ci + 1}: front content mismatch`, { expected, rendered: frontText });
      if (kind === 'vq-question') {
        assert(frontText !== norm(source.translation), `${deck.id} card ${ci + 1}: generic task label replaced source problem`, { sourceProblem: source.front, generic: source.translation });
      }

      await domClick(frontEl);
      await page.waitForTimeout(15);
      const backText = norm(await (await card(page)).innerText());
      assert(backText.includes(norm(source.back)), `${deck.id} card ${ci + 1}: completed answer missing`, { expected: source.back, rendered: backText });

      results.push({ deck: deck.id, card: source.id, front: true, back: true });
      if (ci < deck.cards.length - 1) {
        await domClick(page.getByRole('button', { name: '次のカードへ' }));
        await page.waitForTimeout(10);
      }
    }
    assert(pageErrors.length === 0, `${deck.id}: uncaught page errors`, { pageErrors });
    await page.screenshot({ path: `${OUT}/${deck.id}.png`, fullPage: true });
    console.log(`PASS ${GROUP} ${deck.id}: ${deck.cards.length} cards`);
  } catch (error) {
    failures.push({ message: `${deck.id}: audit crashed`, details: String(error?.stack || error) });
    console.error(`FAIL ${deck.id}`, error);
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();

const expectedVisits = decks.reduce((n, d) => n + d.cards.length, 0);
assert(results.length === expectedVisits, `${GROUP}: not every card was visited`, { expectedVisits, actualVisits: results.length });
const report = { group: GROUP, decks: decks.length, expectedVisits, actualVisits: results.length, failures, results };
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ group: GROUP, decks: decks.length, expectedVisits, actualVisits: results.length, failures: failures.length }, null, 2));
if (failures.length) process.exit(1);
