import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit, type Page } from 'playwright';
import {
  GRAMMAR_ANSWER_LAYOUT_VERSION,
  GRAMMAR_CATEGORIES_V3,
  TOTAL_GRAMMAR_QUESTIONS_V3,
  answerPositionCounts,
} from '../src/knowledge/grammar_curriculum_v3';

const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browserName = process.env.BROWSER || 'chromium';
const out = process.env.QA_OUT || `audit/knowledge-hub/${browserName}`;
fs.mkdirSync(out, { recursive: true });

assert.deepEqual(GRAMMAR_CATEGORIES_V3.map(category => category.id), ['perfect', 'future', 'countable']);
assert.deepEqual(GRAMMAR_CATEGORIES_V3.map(category => category.questions.length), [40, 40, 40]);
assert.equal(TOTAL_GRAMMAR_QUESTIONS_V3, 120);
const all = GRAMMAR_CATEGORIES_V3.flatMap(category => category.questions);
assert.equal(new Set(all.map(question => question.id)).size, 120);
assert.equal(new Set(all.map(question => question.prompt)).size, 120);

for (const category of GRAMMAR_CATEGORIES_V3) {
  assert.equal(category.questions.filter(question => question.level === '基本').length, 16);
  assert.equal(category.questions.filter(question => question.level === '使い分け').length, 12);
  assert.equal(category.questions.filter(question => question.level === '応用').length, 12);
  assert.ok(category.questions.slice(0, 16).every(question => question.level === '基本'));
  assert.ok(category.questions.slice(16, 28).every(question => question.level === '使い分け'));
  assert.ok(category.questions.slice(28).every(question => question.level === '応用'));
  assert.deepEqual(answerPositionCounts(category.questions), [10, 10, 10, 10]);
  assert.deepEqual(answerPositionCounts(category.questions.slice(0, 16)), [4, 4, 4, 4]);
  assert.deepEqual(answerPositionCounts(category.questions.slice(16, 28)), [3, 3, 3, 3]);
  assert.deepEqual(answerPositionCounts(category.questions.slice(28, 40)), [3, 3, 3, 3]);

  let streak = 0;
  let previous = -1;
  for (const question of category.questions) {
    streak = question.correctIndex === previous ? streak + 1 : 1;
    previous = question.correctIndex;
    assert.ok(streak <= 2, `${category.id}: answer-position streak > 2 at ${question.id}`);
    assert.ok(question.prompt.trim());
    assert.equal(question.choices.length, 4);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4);
    assert.ok(question.explanation.trim());
    assert.ok(question.example.trim(), `${question.id}: missing example`);
    assert.ok(!question.example.includes('\n'), `${question.id}: example must be one line`);
    assert.equal(new Set(question.choices).size, 4, question.id);
  }
}

assert.equal(GRAMMAR_CATEGORIES_V3[0].questions[0].prompt, '現在完了形は、どんなときに使う？');
assert.equal(GRAMMAR_CATEGORIES_V3[0].questions[1].prompt, '現在完了形の3つの基本用法は？');
assert.equal(GRAMMAR_CATEGORIES_V3[1].questions[0].prompt, '未来のことを表すとき、最初に考えるべきことは？');
assert.equal(GRAMMAR_CATEGORIES_V3[2].questions[0].prompt, '可算名詞かどうかを考える最初のポイントは？');

const browser = await (browserName === 'webkit' ? webkit : chromium).launch();
const errors: string[] = [];
let page: Page;
const dlg = () => page.locator('[data-ui="knowledge-dialog"]');

async function bounds() {
  const value = await dlg().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, screen: innerWidth }));
  assert.ok(value.scroll <= value.width + 1, JSON.stringify(value));
  assert.ok(value.width <= value.screen + 1, JSON.stringify(value));
}

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/#knowledge`, { waitUntil: 'networkidle' });
  await dlg().waitFor();
  assert.equal(await dlg().getAttribute('data-design'), 'grammar-three-track-v4');
  assert.equal(await dlg().getAttribute('data-answer-layout'), GRAMMAR_ANSWER_LAYOUT_VERSION);
  assert.equal(await dlg().locator('[data-ui="grammar-category-list"] [data-category]').count(), 3);
  assert.equal(await dlg().locator('[data-category="perfect"]').getByText('完了形', { exact: true }).count(), 1);
  assert.equal(await dlg().locator('[data-category="future"]').getByText('未来表現', { exact: true }).count(), 1);
  assert.equal(await dlg().locator('[data-category="countable"]').getByText('可算・不可算', { exact: true }).count(), 1);
  assert.equal(await dlg().getByText('前回のつづき').count(), 0);
  assert.equal(await dlg().getByText('基本から進む').count(), 0);
  await bounds();
  await page.screenshot({ path: `${out}/three-category-hub.png` });

  for (const category of GRAMMAR_CATEGORIES_V3) {
    await dlg().locator(`[data-category="${category.id}"]`).click();
    const question = dlg().locator('[data-ui="grammar-quiz-question"]');
    await question.waitFor();
    assert.ok((await question.innerText()).includes(`${category.title}　1 / 40`));
    assert.equal(await question.getAttribute('data-question-id'), category.questions[0].id);
    assert.ok((await question.innerText()).includes(category.questions[0].prompt));
    assert.ok((await question.innerText()).includes('基本'));

    const correct = category.questions[0];
    await question.locator(`[data-choice="${correct.correctIndex}"]`).click();
    const feedback = question.locator('[data-ui="grammar-feedback"]');
    await feedback.waitFor();
    assert.ok((await feedback.innerText()).includes('正解'));
    assert.ok((await feedback.innerText()).includes(correct.explanation));
    const example = question.locator('[data-ui="grammar-example"]');
    assert.equal(await example.getByText('例文', { exact: true }).count(), 1);
    assert.equal((await example.locator('p').innerText()).trim(), correct.example);
    await question.getByRole('button', { name: /次の問題/ }).click();
    assert.ok((await dlg().locator('[data-ui="grammar-quiz-question"]').innerText()).includes('2 / 40'));
    await dlg().getByRole('button', { name: '3分野', exact: true }).click();
  }

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await bounds();
  await page.screenshot({ path: `${out}/three-category-dark.png` });
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({
    success: true,
    browserName,
    answerLayoutVersion: GRAMMAR_ANSWER_LAYOUT_VERSION,
    categories: GRAMMAR_CATEGORIES_V3.map(category => ({
      id: category.id,
      count: category.questions.length,
      answerPositions: answerPositionCounts(category.questions),
    })),
    total: TOTAL_GRAMMAR_QUESTIONS_V3,
    basicsFirst: true,
    everyAnswerHasExample: true,
    errors,
  }, null, 2));
  await context.close();
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
    fs.writeFileSync(`${out}/failure.html`, await page.content().catch(() => ''));
  }
  fs.writeFileSync(`${out}/failure.txt`, String(error));
  throw error;
} finally {
  await browser.close();
}

console.log(`Grammar check hub PASS: ${browserName}, 3 categories, ${TOTAL_GRAMMAR_QUESTIONS_V3} questions, A/B/C/D balanced 10 each, basics first, examples on every answer.`);
