import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit, type Page } from 'playwright';
import { TOPICS, TOPIC_SETS, TOPIC_BY_NUMBER, LESSON_TITLES, pointsForSet } from '../src/knowledge/curriculum';
import { QUESTIONS, SETS, VERSION, STORAGE_KEY, startSession } from '../src/knowledge/model';

const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browserName = process.env.BROWSER || 'chromium';
const out = process.env.QA_OUT || `audit/knowledge-hub/${browserName}`;
fs.mkdirSync(out, { recursive: true });
assert.equal(TOPICS.length, 7);
const numbers = TOPICS.flatMap(t => t.numbers);
assert.equal(numbers.length, 102);
assert.equal(new Set(numbers).size, 102);
assert.deepEqual([...numbers].sort((a, b) => a - b), QUESTIONS.map(q => q.number));
assert.equal(TOPIC_BY_NUMBER.size, 102);
assert.equal(new Set(TOPIC_SETS.flatMap(s => s.ids)).size, 102);
assert.equal(TOPIC_SETS.flatMap(s => s.ids).length, 102);
assert.equal(new Set(TOPIC_SETS.map(s => s.title)).size, TOPIC_SETS.length);
for (const s of SETS) { assert.ok(LESSON_TITLES[s.start]?.[0]); assert.ok(pointsForSet(s.start).length); }
for (const s of TOPIC_SETS) {
  assert.ok(s.ids.length >= 1 && s.ids.length <= 6);
  assert.ok(s.ids.every(id => QUESTIONS.find(q => q.id === id)?.stage === s.stage));
}
const browser = await (browserName === 'webkit' ? webkit : chromium).launch();
const errors: string[] = [];
let page: Page;
const dlg = () => page.locator('[data-ui="knowledge-dialog"]');
async function bounds() {
  const value = await dlg().evaluate(el => {
    const bad = [...el.querySelectorAll('button,textarea,.tk-prompt,.tk-point')].filter(n => n.getClientRects().length).filter(n => { const r = n.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(n => (n.textContent ?? '').slice(0, 40));
    return { width: innerWidth, scroll: el.scrollWidth, client: el.clientWidth, bad, footer: el.querySelector('.tk-footer')?.getBoundingClientRect().bottom ?? 0, height: innerHeight };
  });
  assert.ok(value.scroll <= value.client + 1, JSON.stringify(value));
  assert.deepEqual(value.bad, [], JSON.stringify(value));
  assert.ok(value.footer <= value.height + 1, JSON.stringify(value));
}
async function answerCurrent() {
  const article = dlg().locator('[data-question]');
  const n = Number(await article.getAttribute('data-question'));
  const q = QUESTIONS[n - 1];
  assert.equal(await article.locator('.tk-prompt').innerText(), q.prompt);
  if (q.mode === 'choice') await article.locator(`[data-choice="${q.answer}"]`).click();
  else if (q.mode === 'order') for (const i of q.answer as number[]) await article.locator(`[data-order="${i}"]`).click();
  else await article.locator('textarea').fill(String(q.answer));
  await article.locator('[data-action="check"]').click();
  await article.locator('[data-ui="knowledge-feedback"]').waitFor();
  assert.equal(await article.locator('.tk-explanation-block p').innerText(), q.explanation);
  assert.ok(await article.locator('.tk-feedback-label').count() >= 2);
  if (q.mode === 'text') await article.locator('[data-action="self-correct"]').click();
}
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/#knowledge', { waitUntil: 'networkidle' });
  await dlg().waitFor();
  assert.equal(await dlg().getAttribute('data-design'), 'knowledge-learning-hub-v2');
  assert.equal(await dlg().locator('[data-start]').count(), 17);
  await bounds(); await page.screenshot({ path: `${out}/mobile-home.png` });
  // An actual previous-version session must survive the redesign; summary navigation must not replace it.
  const legacy = startSession(QUESTIONS.slice(0, 6).map(q => q.id), '第1〜6問', 7);
  legacy.index = 1; legacy.responses['tk-001'] = { choice: 1, revealed: true, grade: 'incorrect' };
  const old = { version: VERSION, grades: { 'tk-001': 'incorrect' }, flagged: ['tk-002'], session: legacy };
  await page.evaluate(({ key, old }) => { localStorage.setItem(key, JSON.stringify(old)); localStorage.setItem('knowledge-hub:sentinel', 'keep-existing-features'); }, { key: STORAGE_KEY, old });
  await page.reload({ waitUntil: 'networkidle' });
  await dlg().locator('[data-guide="1"]').click();
  await dlg().locator('[data-ui="knowledge-guide"]').waitFor();
  assert.equal(await dlg().locator('.tk-point').count(), 3);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  assert.deepEqual(saved, old);
  await dlg().getByRole('button', { name: '知識チェックの一覧へ', exact: true }).click();
  await dlg().locator('[data-action="resume"]').click();
  await dlg().locator('[data-question="2"]').waitFor();
  assert.ok(await dlg().locator('.tk-flag input').isChecked());
  await answerCurrent();
  await dlg().getByRole('button', { name: '中断・一覧', exact: true }).click();
  // Topics have descriptive guides and a basic-to-detail sequence; every ID appears once.
  await dlg().locator('[data-tab="topics"]').click();
  assert.equal(await dlg().locator('[data-topic]').count(), 7);
  await bounds(); await page.screenshot({ path: `${out}/mobile-topics.png` });
  for (const topic of TOPICS) {
    await dlg().locator(`[data-topic="${topic.id}"]`).click();
    assert.equal(await dlg().locator('[data-ui="knowledge-guide"] h1').innerText(), topic.title);
    assert.equal(await dlg().locator('[data-topic-set]').count(), TOPIC_SETS.filter(s => s.topicId === topic.id).length);
    assert.ok(!(await dlg().locator('[data-question]').count()));
    await bounds();
    if (topic.id === 'perfect') await page.screenshot({ path: `${out}/mobile-perfect-guide.png` });
    await dlg().getByRole('button', { name: '知識チェックの一覧へ', exact: true }).click();
  }
  await dlg().locator('[data-topic="perfect"]').click();
  const course = TOPIC_SETS.filter(s => s.topicId === 'perfect');
  await dlg().locator(`[data-topic-set="${course[0].key}"]`).click();
  for (const id of course[0].ids) {
    await dlg().locator(`[data-question="${QUESTIONS.find(q => q.id === id)!.number}"]`).waitFor();
    await answerCurrent(); await dlg().locator('[data-action="next"]').click();
  }
  await dlg().locator('.tk-result').waitFor();
  await dlg().getByRole('button', { name: `次へ：${course[1].label}`, exact: true }).click();
  const nextNumber = QUESTIONS.find(q => q.id === course[1].ids[0])!.number;
  await dlg().locator(`[data-question="${nextNumber}"]`).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await dlg().locator('[data-action="resume"]').click();
  await dlg().locator(`[data-question="${nextNumber}"]`).waitFor();
  // All layouts, including the smallest mobile screen, must keep controls reachable.
  await dlg().getByRole('button', { name: '中断・一覧', exact: true }).click();
  for (const [width, height, label] of [[320, 640, 'small'], [768, 1024, 'tablet'], [1440, 1000, 'desktop']] as const) {
    await page.setViewportSize({ width, height });
    await dlg().locator('[data-tab="path"]').click();
    await bounds(); await page.screenshot({ path: `${out}/${label}-home.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const n of [1, 13, 31, 43, 49, 55, 91]) {
    await dlg().locator(`[data-start="${n}"]`).click();
    await dlg().locator(`[data-question="${n}"]`).waitFor();
    await bounds(); await page.screenshot({ path: `${out}/mobile-question-${n}.png` });
    await answerCurrent(); await bounds();
    if (n === 55) await page.screenshot({ path: `${out}/mobile-feedback.png` });
    await dlg().getByRole('button', { name: '中断・一覧', exact: true }).click();
  }
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await bounds(); await page.screenshot({ path: `${out}/mobile-dark-home.png` });
  await dlg().locator('[data-tab="review"]').click();
  assert.ok(await dlg().locator('[data-review-topic]').count() > 0);
  await bounds(); await page.screenshot({ path: `${out}/mobile-review.png` });
  const reviewTopic = await dlg().locator('[data-review-topic]').first().getAttribute('data-review-topic');
  await dlg().locator('[data-review-topic]').first().click();
  const reviewQ = Number(await dlg().locator('[data-question]').getAttribute('data-question'));
  assert.ok(TOPICS.find(t => t.id === reviewTopic)!.numbers.includes(reviewQ));
  await bounds(); await page.screenshot({ path: `${out}/mobile-dark-question.png` });
  assert.equal(await page.evaluate(() => localStorage.getItem('knowledge-hub:sentinel')), 'keep-existing-features');
  await dlg().getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
  assert.equal(await page.locator('[data-ui="knowledge-dialog"]').count(), 0);
  assert.equal(await page.locator('#root').evaluate(el => el.inert), false);
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({ success: true, browserName, base, topics: TOPICS.map(t => ({ title: t.title, count: t.numbers.length })), uniqueQuestions: numbers.length, legacySessionPreserved: true, topicResume: true, guideDoesNotResetProgress: true, sourceTextPreserved: true, errors }, null, 2));
  await context.close();
} catch (e) {
  if (page && !page.isClosed()) { await page.screenshot({ path: `${out}/failure.png` }).catch(() => {}); fs.writeFileSync(`${out}/failure.html`, await page.content().catch(() => '')); }
  fs.writeFileSync(`${out}/failure.txt`, String(e)); throw e;
} finally { await browser.close(); }
console.log(`Knowledge learning hub PASS: ${browserName}, 7 topics, 102 unique questions, existing progress, responsive UI.`);
