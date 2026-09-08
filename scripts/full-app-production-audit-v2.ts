import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type BrowserContext, type Locator, type Page } from 'playwright';
import {
  basicExampleDecks,
  basicTestDecks,
  visionQuestSentenceDecks,
  visionQuestQuestionDecks,
  type Card,
  type Deck,
} from '../src/data/cards';

const BASE = process.env.APP_URL || 'https://reibun.itisnowornever271.workers.dev/?full_audit=20260908v3';
const OUT = 'audit/full-app-production-v2';
fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true });

type Severity = 'critical' | 'major' | 'minor';
type Finding = { severity: Severity; scope: string; message: string; details?: unknown };
const findings: Finding[] = [];
const passes: string[] = [];
const failures: string[] = [];

const norm = (s: string) => s.replace(/[\[\]]/g, '').replace(/[　\s]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
const add = (severity: Severity, scope: string, message: string, details?: unknown) => {
  findings.push({ severity, scope, message, details });
  console.error(`${severity.toUpperCase()} ${scope}: ${message}`);
};

async function runWithPage(context: BrowserContext, scope: string, fn: (page: Page) => Promise<void>) {
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  try {
    await fn(page);
    if (pageErrors.length) add('critical', `${scope}/runtime`, 'uncaught page errors', pageErrors);
    if (consoleErrors.length) add('major', `${scope}/console`, 'console errors', consoleErrors);
    passes.push(scope);
    console.log(`PASS ${scope}`);
  } catch (e) {
    const message = String((e as Error)?.stack || e);
    failures.push(scope);
    add('major', scope, message);
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function fresh(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
}

async function domClick(locator: Locator) {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.evaluate((el) => (el as HTMLElement).click());
}

async function noHorizontalOverflow(page: Page, scope: string) {
  const m = await page.evaluate(() => ({ w: innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  if (Math.max(m.doc, m.body) > m.w + 2) add('major', scope, 'horizontal overflow', m);
}

async function titleNotClipped(page: Page, scope: string) {
  const h = page.locator('h1').first();
  if (!(await h.count())) return;
  const m = await h.evaluate((e) => {
    const x = e as HTMLElement;
    const cs = getComputedStyle(x);
    return {
      text: x.innerText,
      sw: x.scrollWidth,
      cw: x.clientWidth,
      sh: x.scrollHeight,
      ch: x.clientHeight,
      overflow: cs.overflow,
      textOverflow: cs.textOverflow,
      whiteSpace: cs.whiteSpace,
    };
  });
  if (m.sw > m.cw + 2 || m.sh > m.ch + 2 || (m.textOverflow === 'ellipsis' && m.overflow === 'hidden')) {
    add('minor', scope, 'page title is clipped/truncated', m);
  }
}

async function counter(page: Page) {
  const all = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await all.count(); i++) {
    if (await all.nth(i).isVisible().catch(() => false)) return norm(await all.nth(i).innerText());
  }
  return '';
}

async function outerCard(page: Page) {
  const card = page.locator('div.cursor-pointer').first();
  await card.waitFor({ state: 'visible', timeout: 10000 });
  return card;
}

async function openBasic(page: Page) {
  await fresh(page);
  await domClick(page.getByRole('button', { name: /基本例文.*マスター/s }));
  await page.getByRole('button', { name: /例文（110）/ }).waitFor({ state: 'visible', timeout: 10000 });
}

async function openVq(page: Page) {
  await fresh(page);
  await domClick(page.getByRole('button', { name: /VISION QUEST/ }));
  await page.getByRole('button', { name: '例文', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
}

async function clickDeck(page: Page, title: string) {
  const h = page.getByRole('heading', { name: title, exact: true });
  await domClick(page.locator('button').filter({ has: h }).first());
  await page.getByText('学習モードを選択', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
}

async function openDeck(page: Page, kind: 'basic-example' | 'basic-test' | 'vq-sentence' | 'vq-question', deck: Deck, index: number) {
  if (kind.startsWith('basic')) {
    await openBasic(page);
    if (kind === 'basic-test') await domClick(page.getByRole('button', { name: /公式穴埋め（54）/ }));
  } else {
    await openVq(page);
    if (kind === 'vq-question') await domClick(page.getByRole('button', { name: '問題', exact: true }));
    if (index > 0) await domClick(page.getByRole('button', { name: /以前の範囲を見る/ }));
  }
  await clickDeck(page, deck.title);
}

function frontExpected(kind: string, card: Card) {
  return kind === 'vq-question' ? card.front : kind === 'vq-sentence' ? card.translation : card.front;
}

async function auditDeck(page: Page, kind: 'basic-example' | 'basic-test' | 'vq-sentence' | 'vq-question', deck: Deck, deckIndex: number) {
  const scope = `${kind}/${deck.id}`;
  await openDeck(page, kind, deck, deckIndex);
  await noHorizontalOverflow(page, `${scope}/menu`);
  await titleNotClipped(page, `${scope}/menu`);
  await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__menu.png`), fullPage: true });

  await domClick(page.getByRole('button', { name: /単語カード|問題カード/ }));
  await outerCard(page);

  for (let i = 0; i < deck.cards.length; i++) {
    const c = deck.cards[i];
    const count = await counter(page);
    if (count !== `${i + 1} / ${deck.cards.length}`) {
      add('major', `${scope}/counter/${i + 1}`, 'counter mismatch', { count, expected: `${i + 1} / ${deck.cards.length}` });
    }

    const card = await outerCard(page);
    const rendered = norm(await card.innerText());
    const expected = norm(frontExpected(kind, c));
    if (!rendered.includes(expected)) {
      add(kind === 'vq-question' ? 'critical' : 'major', `${scope}/front/${i + 1}`, 'front does not show the actual required content', { expected, rendered, taskLabel: c.translation });
    }
    if (kind === 'vq-question' && rendered === norm(c.translation)) {
      add('critical', `${scope}/front/${i + 1}`, 'question card shows only a generic task label instead of the source problem', { rendered, sourceFront: c.front });
    }
    if (i === 0) await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__front.png`), fullPage: true });

    await domClick(card);
    await page.waitForTimeout(30);
    const backText = norm(await (await outerCard(page)).innerText());
    if (!backText.includes(norm(c.back))) {
      add('major', `${scope}/back/${i + 1}`, 'answer side is missing the complete answer', { expected: c.back, rendered: backText });
    }
    if (i === 0) await page.screenshot({ path: path.join(OUT, 'screenshots', `${scope.replaceAll('/', '__')}__back.png`), fullPage: true });

    if (i < deck.cards.length - 1) {
      await domClick(page.getByRole('button', { name: '次のカードへ' }));
      await page.waitForTimeout(20);
    }
  }
  await noHorizontalOverflow(page, `${scope}/standard`);
}

async function auditVqQuestionModes(page: Page, deck: Deck, deckIndex: number) {
  const card = deck.cards[0];
  const scope = `vq-question/${deck.id}`;

  await openDeck(page, 'vq-question', deck, deckIndex);
  await domClick(page.getByRole('button', { name: /答えから覚える/ }));
  let body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(card.back))) add('major', `${scope}/memorize/front`, 'memorize mode does not show answer');
  await domClick(await outerCard(page));
  await page.waitForTimeout(40);
  body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(card.front))) {
    add('critical', `${scope}/memorize/back`, 'memorize mode never shows the source problem', { sourceFront: card.front, rendered: body.slice(0, 1000) });
  }

  await openDeck(page, 'vq-question', deck, deckIndex);
  await domClick(page.getByRole('button', { name: /自己申告テスト/ }));
  body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(card.front))) {
    add('critical', `${scope}/self/front`, 'self-test does not present the source problem', { sourceFront: card.front, rendered: body.slice(0, 1000) });
  }

  await openDeck(page, 'vq-question', deck, deckIndex);
  await domClick(page.getByRole('button', { name: /並べ替えクイズ/ }));
  body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(card.front))) {
    add('major', `${scope}/order/front`, 'word-order mode lacks the source problem/context', { sourceFront: card.front, rendered: body.slice(0, 1000) });
  }

  await openDeck(page, 'vq-question', deck, deckIndex);
  await page.getByLabel('問題を考える時間').selectOption('3');
  await page.getByLabel('答えを表示する時間').selectOption('3');
  await domClick(page.getByRole('button', { name: /タイムアタック開始/ }));
  body = norm(await page.locator('body').innerText());
  if (!body.includes(norm(card.front))) {
    add('critical', `${scope}/time/front`, 'time attack does not present the source problem', { sourceFront: card.front, rendered: body.slice(0, 1000) });
  }
}

async function landingAudit(page: Page) {
  await fresh(page);
  await noHorizontalOverflow(page, 'top');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'top.png'), fullPage: true });

  await openBasic(page);
  await noHorizontalOverflow(page, 'basic-home');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'basic-home.png'), fullPage: true });
  await domClick(page.getByRole('button', { name: /公式穴埋め（54）/ }));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'basic-tests.png'), fullPage: true });

  await openVq(page);
  await noHorizontalOverflow(page, 'vq-home');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-home.png'), fullPage: true });
  await domClick(page.getByRole('button', { name: '問題', exact: true }));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-questions.png'), fullPage: true });
  await domClick(page.getByRole('button', { name: /以前の範囲を見る/ }));
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'vq-questions-older.png'), fullPage: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 416, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

await runWithPage(context, 'landings', page => landingAudit(page));
for (const [i, d] of basicExampleDecks.entries()) await runWithPage(context, `basic-example/${d.id}`, page => auditDeck(page, 'basic-example', d, i));
for (const [i, d] of basicTestDecks.entries()) await runWithPage(context, `basic-test/${d.id}`, page => auditDeck(page, 'basic-test', d, i));
for (const [i, d] of visionQuestSentenceDecks.entries()) await runWithPage(context, `vq-sentence/${d.id}`, page => auditDeck(page, 'vq-sentence', d, i));
for (const [i, d] of visionQuestQuestionDecks.entries()) await runWithPage(context, `vq-question/${d.id}`, page => auditDeck(page, 'vq-question', d, i));
for (const [i, d] of visionQuestQuestionDecks.entries()) await runWithPage(context, `vq-question-modes/${d.id}`, page => auditVqQuestionModes(page, d, i));

await context.close();
await browser.close();

const wb = await webkit.launch({ headless: true });
const wc = await wb.newContext({ viewport: { width: 416, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await runWithPage(wc, 'webkit-current-range-question', async page => {
  await openDeck(page, 'vq-question', visionQuestQuestionDecks[0], 0);
  await domClick(page.getByRole('button', { name: /単語カード|問題カード/ }));
  const c = visionQuestQuestionDecks[0].cards[0];
  const text = norm(await (await outerCard(page)).innerText());
  if (!text.includes(norm(c.front))) {
    add('critical', 'webkit/current-range/front', 'iOS-like browser reproduces missing question', { sourceFront: c.front, rendered: text });
  }
  await titleNotClipped(page, 'webkit/current-range/title');
  await noHorizontalOverflow(page, 'webkit/current-range');
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'webkit-current-range-question.png'), fullPage: true });
});
await wc.close();
await wb.close();

const counts = findings.reduce<Record<string, number>>((a, f) => {
  a[f.severity] = (a[f.severity] || 0) + 1;
  return a;
}, {});
const sourceCardsVisited = [...basicExampleDecks, ...basicTestDecks, ...visionQuestSentenceDecks, ...visionQuestQuestionDecks].reduce((n, d) => n + d.cards.length, 0);
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  sourceCardsVisited,
  deckCounts: {
    basicExamples: basicExampleDecks.length,
    basicTests: basicTestDecks.length,
    vqSentences: visionQuestSentenceDecks.length,
    vqQuestions: visionQuestQuestionDecks.length,
  },
  checks: { passed: passes.length, failed: failures.length, failures },
  findings: counts,
  totalFindings: findings.length,
  items: findings,
};
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'summary.txt'), JSON.stringify({ sourceCardsVisited, checks: report.checks, findings: counts, totalFindings: findings.length }, null, 2));
console.log(JSON.stringify(report, null, 2));
if ((counts.critical || 0) + (counts.major || 0) > 0 || failures.length) process.exit(1);
