import fs from 'node:fs';
import { chromium } from 'playwright';

const baseURL = process.env.PUBLIC_URL || 'http://127.0.0.1:4173';
const outDir = 'audit/compact-bento';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function noOverflow(page, label) {
  const m = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (m.scrollWidth > m.innerWidth) throw new Error(`${label}: horizontal overflow ${m.scrollWidth - m.innerWidth}px`);
}

async function assertVisibleWithoutScroll(locator, viewportHeight, label) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${label}: no bounding box`);
  if (box.y < 0 || box.y + box.height > viewportHeight) {
    throw new Error(`${label}: not fully visible before scrolling (bottom=${box.y + box.height}, viewport=${viewportHeight})`);
  }
  return box;
}

// 390px: top and full bento menu
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('[data-ui="compact-home-bento-v1"]').waitFor();
  await noOverflow(page, '390-top');

  const basic = page.getByRole('button', { name: /基本例文/ }).first();
  const vq = page.getByRole('button', { name: /VISION/ }).first();
  const basicBox = await assertVisibleWithoutScroll(basic, 844, '390 basic menu');
  const vqBox = await assertVisibleWithoutScroll(vq, 844, '390 VQ menu');
  if (Math.abs(basicBox.y - vqBox.y) > 4) throw new Error('390 top menus are not side-by-side');
  if (basicBox.x >= vqBox.x) throw new Error('390 menu column order is unexpected');
  await page.screenshot({ path: `${outDir}/390-top.png`, fullPage: true });

  await basic.click();
  const lesson1 = page.getByRole('button').filter({ hasText: 'Lesson 1' }).first();
  await lesson1.click();
  await page.getByText('学習モードを選択', { exact: true }).waitFor();

  const standard = page.getByRole('button', { name: /単語カード/ });
  const memorize = page.getByRole('button', { name: /答えから覚える/ });
  const order = page.getByRole('button', { name: /並べ替えクイズ/ });
  const self = page.getByRole('button', { name: /自己申告テスト/ });
  const time = page.getByRole('button', { name: 'タイムアタック開始' });

  const s = await assertVisibleWithoutScroll(standard, 844, 'standard bento');
  const m = await assertVisibleWithoutScroll(memorize, 844, 'memorize bento');
  const o = await assertVisibleWithoutScroll(order, 844, 'order bento');
  const se = await assertVisibleWithoutScroll(self, 844, 'self bento');
  await assertVisibleWithoutScroll(time, 844, 'time bento');
  if (Math.abs(s.y - m.y) > 4 || Math.abs(o.y - se.y) > 4) throw new Error('bento cards are not arranged in two columns');
  await noOverflow(page, '390-bento');
  await page.screenshot({ path: `${outDir}/390-bento-menu.png`, fullPage: true });
  await context.close();
}

// 320px: both primary choices must still be visible without scrolling and side-by-side.
{
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const basic = page.getByRole('button', { name: /基本例文/ }).first();
  const vq = page.getByRole('button', { name: /VISION/ }).first();
  const basicBox = await assertVisibleWithoutScroll(basic, 568, '320 basic menu');
  const vqBox = await assertVisibleWithoutScroll(vq, 568, '320 VQ menu');
  if (Math.abs(basicBox.y - vqBox.y) > 4) throw new Error('320 top menus are not side-by-side');
  await noOverflow(page, '320-top');
  await page.screenshot({ path: `${outDir}/320-top.png`, fullPage: true });
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ compactHomeBentoValidation: 'passed', screenshots: 3 }, null, 2));
