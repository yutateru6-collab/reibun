import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
const browserName = process.env.BROWSER || 'chromium';
const base = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const out = process.env.QA_OUT || `audit/knowledge/${browserName}`;
fs.mkdirSync(out, { recursive: true });

const browser = await engine.launch();
const errors = [];
let page;
const dlg = () => page.locator('[data-ui="knowledge-dialog"]');

async function attach(context, direct = false) {
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(direct ? `${base}/#knowledge` : base, { waitUntil: 'networkidle' });
  if (!direct) await page.locator('[data-ui="knowledge-launcher"]').click();
  await dlg().waitFor();
  assert.equal(await dlg().getAttribute('data-design'), 'grammar-three-track-v3');
  assert.equal(await dlg().locator('[data-ui="grammar-category-list"] [data-category]').count(), 3);
}

async function bounds() {
  const value = await dlg().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, screen: innerWidth }));
  assert.ok(value.scroll <= value.width + 1, JSON.stringify(value));
  assert.ok(value.width <= value.screen + 1, JSON.stringify(value));
}

async function finishCategory(id, title) {
  await dlg().locator(`[data-category="${id}"]`).click();
  for (let i = 1; i <= 40; i++) {
    const section = dlg().locator('[data-ui="grammar-quiz-question"]');
    await section.waitFor();
    assert.ok((await section.innerText()).includes(`${i} / 40`));
    const article = section.locator('article');
    const choices = article.locator('[data-choice]');
    assert.equal(await choices.count(), 4);
    await choices.first().click();
    await article.locator('[data-ui="grammar-feedback"]').waitFor();
    const example = article.locator('[data-ui="grammar-example"]');
    await example.waitFor();
    assert.ok((await example.innerText()).includes('例文'));
    assert.ok((await example.locator('p').innerText()).trim().split(/\s+/).length >= 2);
    await article.getByRole('button', { name: i === 40 ? /結果を見る/ : /次の問題/ }).click();
  }
  const result = dlg().locator('[data-ui="grammar-quiz-result"]');
  await result.waitFor();
  assert.ok((await result.innerText()).includes(title));
  assert.ok((await result.innerText()).includes('/ 40'));
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

  await finishCategory('perfect', '完了形');
  await finishCategory('future', '未来表現');
  await finishCategory('countable', '可算・不可算');
  await bounds();
  await page.screenshot({ path: `${out}/mobile-complete.png` });
  assert.equal(await page.evaluate(() => Array.isArray(JSON.parse(localStorage.getItem('reibun:grammar-check:mistakes:v1') ?? '[]'))), true);
  await dlg().getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
  assert.equal(await page.locator('[data-ui="knowledge-dialog"]').count(), 0);
  await context.close();

  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ja-JP' });
  await attach(context, true);
  await bounds();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: `${out}/desktop-dark-three-categories.png` });
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({ success: true, browser: browserName, categories: 3, questionsPerCategory: 40, totalAccessible: 120, everyAnswerHasExample: true, directHash: true, errors }, null, 2));
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

console.log(`Grammar check UI PASS (${browserName}): 3 categories, 120 questions, every answer has an example.`);
