import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit } from 'playwright';
import {
  GRAMMAR_ANSWER_LAYOUT_VERSION,
  GRAMMAR_CATEGORIES_V3,
  answerPositionCounts,
} from '../src/knowledge/grammar_curriculum_v3.ts';
import { GRAMMAR_SHUFFLE_VERSION } from '../src/knowledge/grammar_shuffle.ts';

const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
const browserName = process.env.BROWSER || 'chromium';
const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const out = process.env.QA_OUT || `audit/knowledge/${browserName}`;
fs.mkdirSync(out, { recursive: true });

const browser = await engine.launch();
const errors = [];
let page;
const dlg = () => page.locator('[data-ui="knowledge-dialog"]');
const categoryMap = new Map(GRAMMAR_CATEGORIES_V3.map(category => [category.id, category]));

async function attach(context, direct = false) {
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(direct ? `${base}/#knowledge` : base, { waitUntil: 'networkidle' });
  if (!direct) await page.locator('[data-ui="knowledge-launcher"]').click();
  await dlg().waitFor();
  assert.equal(await dlg().getAttribute('data-design'), 'grammar-three-track-v4');
  assert.equal(await dlg().getAttribute('data-answer-layout'), GRAMMAR_ANSWER_LAYOUT_VERSION);
  assert.equal(await dlg().getAttribute('data-shuffle-version'), GRAMMAR_SHUFFLE_VERSION);
  assert.equal(await dlg().locator('[data-ui="grammar-category-list"] [data-category]').count(), 3);
}

async function bounds() {
  const value = await dlg().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, screen: innerWidth }));
  assert.ok(value.scroll <= value.width + 1, JSON.stringify(value));
  assert.ok(value.width <= value.screen + 1, JSON.stringify(value));
}

function questionFromId(category, id) {
  const question = category.questions.find(item => item.id === id);
  assert.ok(question, `missing question ${id} in ${category.id}`);
  return question;
}

function assertSessionOrder(category, ids) {
  assert.equal(ids.length, category.questions.length, `${category.id}: wrong session length`);
  assert.deepEqual([...ids].sort(), [...category.questions.map(q => q.id)].sort(), `${category.id}: session is not a full permutation`);
  const byId = new Map(category.questions.map(q => [q.id, q]));
  assert.ok(ids.slice(0, 16).every(id => byId.get(id)?.level === '基本'), `${category.id}: basic block was not preserved`);
  assert.ok(ids.slice(16, 28).every(id => byId.get(id)?.level === '使い分け'), `${category.id}: usage block was not preserved`);
  assert.ok(ids.slice(28).every(id => byId.get(id)?.level === '応用'), `${category.id}: application block was not preserved`);
}

async function currentOrder(section) {
  const raw = await section.getAttribute('data-question-order');
  assert.ok(raw, 'missing data-question-order');
  return raw.split(',').filter(Boolean);
}

async function finishCategory(id, title) {
  const category = categoryMap.get(id);
  assert.ok(category, `missing category ${id}`);
  assert.deepEqual(answerPositionCounts(category.questions), [10, 10, 10, 10]);

  await dlg().locator(`[data-category="${id}"]`).click();
  const section = dlg().locator('[data-ui="grammar-quiz-question"]');
  await section.waitFor();
  const order = await currentOrder(section);
  assertSessionOrder(category, order);
  const seen = new Set();

  for (let i = 1; i <= 40; i++) {
    await section.waitFor();
    assert.ok((await section.innerText()).includes(`${i} / 40`));
    const questionId = await section.getAttribute('data-question-id');
    assert.ok(questionId, `${id}: missing question id at ${i}`);
    const expected = questionFromId(category, questionId);
    seen.add(questionId);
    assert.ok((await section.locator('h2').innerText()).includes(expected.prompt));

    const article = section.locator('article');
    const choices = article.locator('[data-choice]');
    assert.equal(await choices.count(), 4);
    for (let choiceIndex = 0; choiceIndex < 4; choiceIndex++) {
      const text = await choices.nth(choiceIndex).innerText();
      assert.ok(text.includes(expected.choices[choiceIndex]), `${expected.id}: choice ${choiceIndex} mismatch`);
    }

    await choices.nth(expected.correctIndex).click();
    const feedback = article.locator('[data-ui="grammar-feedback"]');
    await feedback.waitFor();
    assert.match(await feedback.innerText(), /^正解/m, `${expected.id}: correct answer was not graded correct`);
    assert.ok((await feedback.innerText()).includes(expected.explanation), `${expected.id}: explanation mismatch`);

    const example = article.locator('[data-ui="grammar-example"]');
    await example.waitFor();
    assert.equal(await example.getByText('例文', { exact: true }).count(), 1);
    assert.equal((await example.locator('p').innerText()).trim(), expected.example, `${expected.id}: example mismatch`);

    await article.getByRole('button', { name: i === 40 ? /結果を見る/ : /次の問題/ }).click();
  }

  assert.equal(seen.size, 40, `${id}: shuffled run did not visit all 40 unique questions`);
  const result = dlg().locator('[data-ui="grammar-quiz-result"]');
  await result.waitFor();
  assert.ok((await result.innerText()).includes(title));
  assert.ok((await result.innerText()).includes('40 / 40'), `${id}: full-correct score must be 40 / 40`);
  assert.equal(await result.getByRole('button', { name: /もう一度（シャッフル）/ }).count(), 1);
  await result.getByRole('button', { name: '3分野に戻る', exact: true }).click();
}

try {
  let context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  await attach(context);
  assert.equal(await dlg().locator('[data-category="perfect"]').innerText().then(t => t.includes('完了形') && t.includes('40問') && t.includes('毎回シャッフル')), true);
  assert.equal(await dlg().locator('[data-category="future"]').innerText().then(t => t.includes('未来表現') && t.includes('40問') && t.includes('毎回シャッフル')), true);
  assert.equal(await dlg().locator('[data-category="countable"]').innerText().then(t => t.includes('可算・不可算') && t.includes('40問') && t.includes('毎回シャッフル')), true);
  assert.equal(await dlg().getByText('「なんとなく」を、「わかる」に。').count(), 0);
  await bounds();
  await page.screenshot({ path: `${out}/mobile-three-categories.png` });

  const perfect = categoryMap.get('perfect');
  assert.ok(perfect);

  // A fresh session must get a new question order while preserving level blocks.
  await dlg().locator('[data-category="perfect"]').click();
  let section = dlg().locator('[data-ui="grammar-quiz-question"]');
  await section.waitFor();
  const sessionOne = await currentOrder(section);
  assertSessionOrder(perfect, sessionOne);
  await dlg().getByRole('button', { name: '3分野', exact: true }).click();
  await dlg().locator('[data-category="perfect"]').click();
  section = dlg().locator('[data-ui="grammar-quiz-question"]');
  await section.waitFor();
  const sessionTwo = await currentOrder(section);
  assertSessionOrder(perfect, sessionTwo);
  assert.notDeepEqual(sessionTwo, sessionOne, 'two fresh grammar sessions should not have the same order');

  // The visible shuffle button must reshuffle the unanswered remainder immediately.
  const beforeManualShuffle = await currentOrder(section);
  await section.locator('[data-ui="grammar-shuffle"]').click();
  const afterManualShuffle = await currentOrder(section);
  assertSessionOrder(perfect, afterManualShuffle);
  assert.notDeepEqual(afterManualShuffle, beforeManualShuffle, 'manual shuffle did not change question order');

  // Deliberately answer the current shuffled question incorrectly and verify feedback/storage.
  let currentId = await section.getAttribute('data-question-id');
  assert.ok(currentId);
  let current = questionFromId(perfect, currentId);
  const wrongIndex = (current.correctIndex + 1) % 4;
  await section.locator(`[data-choice="${wrongIndex}"]`).click();
  let feedback = section.locator('[data-ui="grammar-feedback"]');
  await feedback.waitFor();
  const expectedLetter = String.fromCharCode(65 + current.correctIndex);
  assert.ok((await feedback.innerText()).includes(`正解：${expectedLetter} ${current.choices[current.correctIndex]}`));
  const storedAfterWrong = await page.evaluate(() => JSON.parse(localStorage.getItem('reibun:grammar-check:mistakes:v1') ?? '[]'));
  assert.ok(storedAfterWrong.includes(current.id));
  assert.equal(await section.locator('[data-ui="grammar-shuffle"]').isDisabled(), true, 'shuffle must be disabled after scoring the current question');
  await dlg().getByRole('button', { name: '3分野', exact: true }).click();

  await finishCategory('perfect', '完了形');
  await finishCategory('future', '未来表現');
  await finishCategory('countable', '可算・不可算');
  await bounds();
  await page.screenshot({ path: `${out}/mobile-complete.png` });

  const storedAfterCorrectRuns = await page.evaluate(() => JSON.parse(localStorage.getItem('reibun:grammar-check:mistakes:v1') ?? '[]'));
  assert.deepEqual(storedAfterCorrectRuns, [], 'correct retries should clear stored mistakes');
  await dlg().getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
  assert.equal(await page.locator('[data-ui="knowledge-dialog"]').count(), 0);
  await context.close();

  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ja-JP' });
  await attach(context, true);
  await bounds();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: `${out}/desktop-dark-three-categories.png` });
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({
    success: true,
    browser: browserName,
    shuffleVersion: GRAMMAR_SHUFFLE_VERSION,
    categories: GRAMMAR_CATEGORIES_V3.map(category => ({
      id: category.id,
      questionCount: category.questions.length,
      answerPositions: answerPositionCounts(category.questions),
    })),
    totalAccessible: 120,
    freshSessionShuffleVerified: true,
    manualRemainingShuffleVerified: true,
    levelBlocksPreserved: true,
    everyAnswerHasExample: true,
    fullCorrectScoringVerified: true,
    wrongAnswerFeedbackVerified: true,
    mistakePersistenceVerified: true,
    directHash: true,
    errors,
  }, null, 2));
  await context.close();
} catch (e) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
    fs.writeFileSync(`${out}/failure.html`, await page.content().catch(() => ''));
  }
  fs.writeFileSync(`${out}/failure.txt`, String(e.stack || e));
  throw e;
} finally {
  await browser.close();
}

console.log(`Grammar check UI PASS (${browserName}): 120/120 shuffled questions, A/B/C/D balance, level blocks, scoring, examples, mistakes, mobile/desktop.`);
