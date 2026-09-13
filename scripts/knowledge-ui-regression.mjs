import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit } from 'playwright';
const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
const browserName = process.env.BROWSER || 'chromium';
const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const out = process.env.QA_OUT || `audit/knowledge/${browserName}`;
fs.mkdirSync(out, { recursive: true });
const raw = JSON.parse(fs.readFileSync('src/knowledge/questions.json', 'utf8'));
const browser = await engine.launch();
const errors = [];
let page;
async function attach(context) {
  page = await context.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-ui="knowledge-launcher"]').click();
  await page.locator('[data-ui="knowledge-dialog"]').waitFor();
  assert.equal(await page.locator('[data-start]').count(), 17);
}
const dlg = () => page.locator('[data-ui="knowledge-dialog"]');
async function start(n) { await dlg().locator(`[data-start="${n}"]`).click(); await dlg().locator(`[data-question="${n}"]`).waitFor(); }
async function checkCurrent(n) {
  const [format, prompt, choices, answer, explanation] = raw[n - 1];
  const article = dlg().locator(`[data-question="${n}"]`); await article.waitFor();
  assert.equal(await article.getAttribute('data-format'), format);
  assert.equal(await article.locator('.tk-prompt').innerText(), prompt);
  assert.equal(await article.locator('[data-action="check"]').isEnabled(), false);
  assert.equal(await dlg().locator('[data-action="next"]').isEnabled(), false);
  if (format === 'timeline') {
    for (const i of answer) await article.locator(`[data-order="${i}"]`).click();
  } else if (choices) {
    assert.equal(await article.locator('[data-choice]').count(), choices.length);
    await article.locator(`[data-choice="${answer}"]`).click();
  } else await article.locator('textarea').fill(answer);
  await article.locator('[data-action="check"]').click();
  await article.locator('[data-ui="knowledge-feedback"]').waitFor();
  assert.ok((await article.locator('[data-ui="knowledge-feedback"]').innerText()).includes(explanation));
  if (!choices) {
    assert.equal(await dlg().locator('[data-action="next"]').isEnabled(), false);
    await article.locator('[data-action="self-correct"]').click();
  }
  assert.equal(await dlg().locator('[data-action="next"]').isEnabled(), true);
}
async function bounds() {
  const m = await dlg().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, screen: innerWidth, height: innerHeight, footer: el.querySelector('.tk-footer')?.getBoundingClientRect().bottom ?? 0 }));
  assert.ok(m.scroll <= m.width + 1, JSON.stringify(m)); assert.ok(m.width <= m.screen + 1); assert.ok(m.footer <= m.height + 1);
}
try {
  // Mobile: incorrect answer, flag, persisted session and no double grading.
  let context = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ja-JP' });
  await attach(context);
  await page.evaluate(() => localStorage.setItem('knowledge-qa:existing-feature-sentinel', 'preserved'));
  await page.screenshot({ path: `${out}/mobile-start.png` });
  await start(1);
  await dlg().locator('[data-choice="1"]').click();
  await dlg().locator('[data-action="check"]').click();
  await dlg().locator('[data-ui="knowledge-feedback"]').waitFor();
  assert.ok((await dlg().locator('[data-ui="knowledge-feedback"]').innerText()).includes('ここを確認しよう'));
  assert.equal(await dlg().locator('[data-choice="0"]').isEnabled(), false);
  await bounds(); await page.screenshot({ path: `${out}/mobile-feedback.png` });
  await dlg().locator('[data-action="next"]').click();
  await dlg().locator('[data-question="2"]').waitFor();
  await dlg().locator('.tk-flag input').check();
  await page.waitForTimeout(200); await page.reload({ waitUntil: 'networkidle' });
  await dlg().locator('[data-action="resume"]').click();
  await dlg().locator('[data-question="2"]').waitFor();
  assert.equal(await dlg().locator('.tk-flag input').isChecked(), true);
  for (let n = 2; n <= 6; n++) { await checkCurrent(n); await dlg().locator('[data-action="next"]').click(); }
  await dlg().locator('.tk-result').waitFor();
  assert.match(await dlg().locator('.tk-result h1').innerText(), /5\s*\/\s*6/);
  await dlg().getByRole('button', { name: '一覧へ戻る', exact: true }).click();
  await dlg().locator('[data-action="review"]').click();
  await dlg().locator('[data-question="1"]').waitFor();
  await dlg().locator('[data-action="unknown"]').click();
  await dlg().locator('[data-action="next"]').click();
  await dlg().locator('[data-question="2"]').waitFor();
  await dlg().getByRole('button', { name: '中断・一覧', exact: true }).click();
  // Repair / recall: free Japanese text, reveal and self-mark persisted independently.
  await start(25);
  for (let n = 25; n <= 26; n++) { await checkCurrent(n); await dlg().locator('[data-action="next"]').click(); }
  await dlg().locator('[data-question="27"] textarea').fill('している');
  await dlg().locator('[data-action="check"]').click();
  assert.equal(await dlg().locator('[data-action="next"]').isEnabled(), false);
  await page.waitForTimeout(150); await page.reload({ waitUntil: 'networkidle' });
  await dlg().locator('[data-action="resume"]').click();
  await dlg().locator('[data-question="27"]').waitFor();
  assert.equal(await dlg().locator('textarea').inputValue(), 'している');
  assert.equal(await dlg().locator('[data-action="next"]').isEnabled(), false);
  await dlg().locator('[data-action="self-correct"]').click();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await bounds(); await page.screenshot({ path: `${out}/mobile-dark-recall.png` });
  assert.equal(await page.evaluate(() => localStorage.getItem('knowledge-qa:existing-feature-sentinel')), 'preserved');
  await dlg().getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
  assert.equal(await page.locator('[data-ui="knowledge-dialog"]').count(), 0);
  assert.equal(await page.locator('#root').evaluate(el => el.inert), false);
  await context.close();
  // Fresh desktop: every rendered question and answer in all 17 six-question sets.
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ja-JP' });
  await attach(context); await page.screenshot({ path: `${out}/desktop-start.png` });
  const visited = [];
  for (let s = 1; s <= 97; s += 6) {
    await start(s);
    for (let n = s; n < s + 6; n++) {
      await checkCurrent(n); visited.push(n);
      if ([13, 31, 49, 61, 91, 102].includes(n)) { await bounds(); await page.screenshot({ path: `${out}/question-${n}.png` }); }
      await dlg().locator('[data-action="next"]').click();
    }
    await dlg().locator('.tk-result').waitFor();
    assert.match(await dlg().locator('.tk-result h1').innerText(), /6\s*\/\s*6/);
    await dlg().getByRole('button', { name: '一覧へ戻る', exact: true }).click();
  }
  assert.equal(visited.length, 102); assert.equal(new Set(visited).size, 102);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('reibun:tense-knowledge-102:v1')));
  assert.equal(Object.keys(stored.grades).length, 102);
  assert.equal(Object.values(stored.grades).filter(v => v === 'correct').length, 102);
  await page.screenshot({ path: `${out}/desktop-complete.png` });
  // Deep link opens the same app and the same saved progress.
  await page.goto(base + '/#knowledge', { waitUntil: 'networkidle' });
  await dlg().waitFor(); assert.ok((await dlg().locator('.tk-stats').innerText()).includes('102 / 102'));
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({ success: true, browser: browserName, base, visited, errors, resume: true, selfMarking: true, mistakeReview: true, existingSentinelPreserved: true }, null, 2));
  await context.close();
} catch (e) {
  if (page && !page.isClosed()) { await page.screenshot({ path: `${out}/failure.png` }).catch(() => {}); fs.writeFileSync(`${out}/failure.html`, await page.content().catch(() => '')); }
  fs.writeFileSync(`${out}/failure.txt`, String(e.stack || e)); throw e;
} finally { await browser.close(); }
console.log(`Knowledge UI PASS (${browserName}): 102 questions, mobile/desktop, resume, self-marking and review.`);
