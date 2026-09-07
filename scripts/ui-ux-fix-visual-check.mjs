import fs from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.env.PUBLIC_URL || 'http://127.0.0.1:4173';
const outDir = 'audit/ui-ux-fixes';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function axeSummary(page, name) {
  const scan = await new AxeBuilder({ page }).analyze();
  const critical = scan.violations.filter(v => v.impact === 'critical');
  results.push({ name, violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) });
  if (critical.length) {
    throw new Error(`${name}: critical accessibility violations: ${critical.map(v => v.id).join(', ')}`);
  }
}

async function assertNoHorizontalOverflow(page, name) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  if (metrics.scrollWidth > metrics.innerWidth) {
    throw new Error(`${name}: horizontal overflow ${metrics.scrollWidth - metrics.innerWidth}px`);
  }
}

async function mobileFlow(width, height, prefix) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });

  await page.screenshot({ path: `${outDir}/${prefix}-01-top.png`, fullPage: true });
  await assertNoHorizontalOverflow(page, `${prefix}-top`);
  const title = page.getByRole('heading', { name: /中間試験対策/ });
  await title.waitFor();
  const titleBox = await title.boundingBox();
  if (!titleBox || titleBox.width > width - 24) throw new Error(`${prefix}: title too wide`);
  await axeSummary(page, `${prefix}-top`);

  await page.getByRole('button', { name: /基本例文マスター/ }).click();
  await page.getByRole('heading', { name: '基本例文マスター' }).waitFor();
  await page.screenshot({ path: `${outDir}/${prefix}-02-basic-list.png`, fullPage: true });
  await assertNoHorizontalOverflow(page, `${prefix}-basic-list`);
  if (await page.getByText('新しいデッキを準備中...').count()) throw new Error('dead placeholder still visible');
  const lesson1 = page.getByRole('button').filter({ hasText: 'Lesson 1' }).first();
  await lesson1.waitFor();
  const lesson1Text = await lesson1.innerText();
  if (!lesson1Text.includes('9文')) throw new Error(`Lesson 1 count missing: ${lesson1Text}`);
  await axeSummary(page, `${prefix}-basic-list`);

  await lesson1.click();
  await page.getByRole('heading', { name: 'Lesson 1' }).waitFor();
  await page.screenshot({ path: `${outDir}/${prefix}-03-mode-menu.png`, fullPage: true });
  await axeSummary(page, `${prefix}-mode-menu`);

  await page.getByRole('button', { name: /単語カード/ }).click();
  await page.getByText('There are many books on the president’s life.', { exact: true }).waitFor();
  await page.getByText('大統領の生活についての本がたくさんある。', { exact: true }).waitFor();
  // This is the one UX item intentionally kept on hold: both remain visible on the card face.
  await page.screenshot({ path: `${outDir}/${prefix}-04-held-card-face.png`, fullPage: true });
  await assertNoHorizontalOverflow(page, `${prefix}-held-card-face`);

  const card = page.locator('div.cursor-pointer').filter({ hasText: 'There are many books on the president’s life.' }).first();
  await card.click();
  await page.getByRole('button', { name: /ミニ解説を見る/ }).waitFor();
  await page.getByRole('button', { name: /ミニ解説を見る/ }).click();
  await page.getByText('大統領ともなると、人生だけで本が何冊もできる。', { exact: true }).waitFor();
  if (await page.getByText(/【出典】/).count()) throw new Error('source block leaked into Hope memorization UI');
  await page.screenshot({ path: `${outDir}/${prefix}-05-mini-explanation.png`, fullPage: true });
  await assertNoHorizontalOverflow(page, `${prefix}-mini-explanation`);
  await axeSummary(page, `${prefix}-mini-explanation`);

  await page.getByRole('button', { name: '学習モード選択へ戻る' }).click();
  await page.getByRole('button', { name: /自己申告テスト/ }).click();
  await page.getByText('There are many books on the president’s life.', { exact: true }).waitFor();
  await page.locator('div.cursor-pointer').filter({ hasText: 'There are many books on the president’s life.' }).first().click();
  await page.getByRole('button', { name: /ミニ解説/ }).waitFor();
  await page.screenshot({ path: `${outDir}/${prefix}-06-self-mini-explanation.png`, fullPage: true });

  await context.close();
}

await mobileFlow(320, 568, 'small320');
await mobileFlow(390, 844, 'mobile390');

const vqContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const vqPage = await vqContext.newPage();
await vqPage.goto(baseURL, { waitUntil: 'networkidle' });
await vqPage.getByRole('button', { name: /VISION QUEST/ }).click();
await vqPage.getByText('今回の試験範囲まとめ', { exact: true }).waitFor();
await vqPage.getByRole('button', { name: '以前の範囲を見る ▼' }).waitFor();
if (await vqPage.getByRole('button').filter({ hasText: 'Lesson 1' }).count()) {
  throw new Error('Older VQ lessons should be collapsed by default');
}
await vqPage.screenshot({ path: `${outDir}/mobile390-07-vq-collapsed.png`, fullPage: true });
await vqPage.getByRole('button', { name: '以前の範囲を見る ▼' }).click();
await vqPage.getByRole('button').filter({ hasText: 'Lesson 1' }).first().waitFor();
await vqPage.screenshot({ path: `${outDir}/mobile390-08-vq-expanded.png`, fullPage: true });
await assertNoHorizontalOverflow(vqPage, 'vq-expanded');
await axeSummary(vqPage, 'vq-expanded');
await vqContext.close();

fs.writeFileSync(`${outDir}/summary.json`, JSON.stringify({ baseURL, results }, null, 2));
await browser.close();
console.log(JSON.stringify({ visualUxValidation: 'passed', screenshots: fs.readdirSync(outDir).filter(f => f.endsWith('.png')).length }, null, 2));
