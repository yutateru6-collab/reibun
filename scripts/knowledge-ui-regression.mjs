import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit } from 'playwright';
import {
  GRAMMAR_ANSWER_LAYOUT_VERSION,
  GRAMMAR_CATEGORIES_V3,
  answerPositionCounts,
} from '../src/knowledge/grammar_curriculum_v3.ts';

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
  assert.equal(await dlg().locator('[data-ui="grammar-category-list"] [data-category]').count(), 3);
}

async function bounds() {
  const value = await dlg().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, screen: innerWidth }));
  assert.ok(value.scroll <= value.width + 1, JSON.stringify(value));
  assert.ok(value.width <= value.screen + 1, JSON.stringify(value));
}

async function finishCategory(id, title) {
  const category = categoryMap.get(id);
  assert.ok(category, `missing category ${id}`);
  assert.deepEqual(answerPositionCounts(category.questions), [10, 10, 10, 10]);

  await dlg().locator(`[data-category="${id}"]`).click();
  for (let i = 1; i <= 40; i++) {
    const expected = category.questions[i - 1];
    const section = dlg().locator('[data-ui="grammar-quiz-question"]');
    await section.waitFor();
    assert.ok((await section.innerText()).includes(`${i} / 40`));
    assert.equal(await section.getAttribute('data-question-id'), expected.id);
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

  const result = dlg().locator('[data-ui="grammar-quiz-result"]');
  await result.waitFor();
  assert.ok((await result.innerText()).includes(title));
  assert.ok((await result.innerText()).includes('40 / 40'), `${id}: full-correct score must be 40 / 40`);
  await result.getByRole('button', { name: '3分野に戻る', exact: true }).click();
}

try {
  let context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  await attach(context);
  assert.equal(await dlg().locator('[data-category="perfect"]').innerText().then(t => t.includes('完了形') && t.includes('40問')), true);
  assert.equal(await dlg().locator('[data-category="future"]').innerText().then(t => t.includes('未来表現') && t.includes('40問')), true);
  assert.equal(await dlg().locator('[data-category="countable"]').innerText().then(t => t.includes('可算・不可算') && t.includes('40問')), true);
  assert.equal(await dlg().getByText('「なんとなく」を、「わかる」に。').count(), 0);
  await bounds();
  await page.screenshot({ path: `${out}/mobile-three-categories.png` });

  // Deliberately answer the first question incorrectly. In the balanced layout,
  // the correct answer is not A, so this catches regressions back to "Aばかり".
  const firstPerfect = GRAMMAR_CATEGORIES_V3[0].questions[0];
  assert.notEqual(firstPerfect.correctIndex, 0);
  await dlg().locator('[data-category="perfect"]').click();
  let section = dlg().locator('[data-ui="grammar-quiz-question"]');
  await section.waitFor();
  await section.locator('[data-choice="0"]').click();
  let feedback = section.locator('[data-ui="grammar-feedback"]');
  await feedback.waitFor();
  const expectedLetter = String.fromCharCode(65 + firstPerfect.correctIndex);
  assert.ok((await feedback.innerText()).includes(`正解：${expectedLetter} ${firstPerfect.choices[firstPerfect.correctIndex]}`));
  const storedAfterWrong = await page.evaluate(() => JSON.parse(localStorage.getItem('reibun:grammar-check:mistakes:v1') ?? '[]'));
  assert.ok(storedAfterWrong.includes(firstPerfect.id));
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
    categories: GRAMMAR_CATEGORIES_V3.map(category => ({
      id: category.id,
      questionCount: category.questions.length,
      answerPositions: answerPositionCounts(category.questions),
    })),
    totalAccessible: 120,
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

console.log(`Grammar check UI PASS (${browserName}): 120/120 questions, exact A/B/C/D balance, correct scoring, examples, mistakes, mobile/desktop.`);
