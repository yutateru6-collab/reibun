import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit, type Page } from 'playwright';
import { GRAMMAR_CATEGORIES_V2, TOTAL_GRAMMAR_QUESTIONS } from '../src/knowledge/grammar_curriculum_v2';

const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browserName = process.env.BROWSER || 'chromium';
const out = process.env.QA_OUT || `audit/knowledge-hub/${browserName}`;
fs.mkdirSync(out, { recursive: true });

assert.deepEqual(GRAMMAR_CATEGORIES_V2.map(category => category.id), ['perfect', 'future', 'countable']);
assert.deepEqual(GRAMMAR_CATEGORIES_V2.map(category => category.questions.length), [40, 40, 40]);
assert.equal(TOTAL_GRAMMAR_QUESTIONS, 120);
const all = GRAMMAR_CATEGORIES_V2.flatMap(category => category.questions);
assert.equal(new Set(all.map(question => question.id)).size, 120);
for (const category of GRAMMAR_CATEGORIES_V2) {
  assert.equal(category.questions.filter(question => question.level === '基本').length, 16);
  assert.equal(category.questions.filter(question => question.level === '使い分け').length, 12);
  assert.equal(category.questions.filter(question => question.level === '応用').length, 12);
  assert.ok(category.questions.slice(0, 16).every(question => question.level === '基本'));
  for (const question of category.questions) {
    assert.ok(question.prompt.trim());
    assert.equal(question.choices.length, 4);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4);
    assert.ok(question.explanation.trim());
    assert.ok(question.example.trim(), `${question.id}: missing example`);
    assert.equal(new Set(question.choices).size, 4, question.id);
  }
}
assert.equal(GRAMMAR_CATEGORIES_V2[0].questions[0].prompt, '現在完了形は、どんなときに使う？');
assert.equal(GRAMMAR_CATEGORIES_V2[0].questions[1].prompt, '現在完了形の3つの基本用法は？');
assert.equal(GRAMMAR_CATEGORIES_V2[1].questions[0].prompt, '未来のことを表すとき、最初に考えるべきことは？');
assert.equal(GRAMMAR_CATEGORIES_V2[2].questions[0].prompt, '可算名詞かどうかを考える最初のポイントは？');

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
  assert.equal(await dlg().getAttribute('data-design'), 'grammar-three-track-v3');
  assert.equal(await dlg().locator('[data-ui="grammar-category-list"] [data-category]').count(), 3);
  assert.equal(await dlg().locator('[data-category="perfect"]').getByText('完了形', { exact: true }).count(), 1);
  assert.equal(await dlg().locator('[data-category="future"]').getByText('未来表現', { exact: true }).count(), 1);
  assert.equal(await dlg().locator('[data-category="countable"]').getByText('可算・不可算', { exact: true }).count(), 1);
  assert.equal(await dlg().getByText('前回のつづき').count(), 0);
  assert.equal(await dlg().getByText('基本から進む').count(), 0);
  await bounds();
  await page.screenshot({ path: `${out}/three-category-hub.png` });

  for (const category of GRAMMAR_CATEGORIES_V2) {
    await dlg().locator(`[data-category="${category.id}"]`).click();
    const question = dlg().locator('[data-ui="grammar-quiz-question"]');
    await question.waitFor();
    assert.ok((await question.innerText()).includes(`${category.title}　1 / 40`));
    assert.ok((await question.innerText()).includes(category.questions[0].prompt));
    assert.ok((await question.innerText()).includes('基本'));
    await question.locator('[data-choice]').nth(category.questions[0].correctIndex).click();
    assert.ok((await question.locator('article').innerText()).includes('正解'));
    assert.ok((await question.locator('article').innerText()).includes(category.questions[0].explanation));
    const example = question.locator('[data-ui="grammar-example"]');
    assert.equal(await example.getByText('例文', { exact: true }).count(), 1);
    assert.equal((await example.locator('p').innerText()).trim(), category.questions[0].example);
    await question.getByRole('button', { name: /次の問題/ }).click();
    assert.ok((await dlg().locator('[data-ui="grammar-quiz-question"]').innerText()).includes('2 / 40'));
    await dlg().getByRole('button', { name: '3分野', exact: true }).click();
  }

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await bounds();
  await page.screenshot({ path: `${out}/three-category-dark.png` });
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({ success: true, browserName, categories: GRAMMAR_CATEGORIES_V2.map(category => ({ id: category.id, count: category.questions.length })), total: TOTAL_GRAMMAR_QUESTIONS, basicsFirst: true, everyAnswerHasExample: true, errors }, null, 2));
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

console.log(`Grammar check hub PASS: ${browserName}, 3 categories, ${TOTAL_GRAMMAR_QUESTIONS} questions, basics first, examples on every answer.`);
