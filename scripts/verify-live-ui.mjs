import fs from 'node:fs';
import { chromium } from 'playwright';

const url = 'https://reibun.itisnowornever271.workers.dev';
fs.mkdirSync('audit/live-ui', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const response = await page.goto(url, { waitUntil: 'networkidle' });

const diagnostics = {
  status: response?.status() ?? null,
  finalUrl: page.url(),
  title: await page.title(),
  text: (await page.locator('body').innerText()).slice(0, 2000),
  html: (await page.content()).slice(0, 5000),
};
fs.writeFileSync('audit/live-ui/diagnostics.json', JSON.stringify(diagnostics, null, 2));
await page.screenshot({ path: 'audit/live-ui/live-initial.png', fullPage: true });
console.log(JSON.stringify(diagnostics, null, 2));

const basic = page.getByRole('button', { name: /基本例文マスター/ });
const vq = page.getByRole('button', { name: /VISION QUEST/ });
const basicCount = await basic.count();
const vqCount = await vq.count();
if (!basicCount || !vqCount) {
  throw new Error(`Top choices missing in live production: basic=${basicCount}, vq=${vqCount}`);
}
const [basicBox, vqBox] = await Promise.all([basic.boundingBox(), vq.boundingBox()]);
if (!basicBox || !vqBox) throw new Error('Could not measure top choice cards.');

const sameRow = Math.abs(basicBox.y - vqBox.y) < 12;
await page.screenshot({ path: 'audit/live-ui/live-top.png', fullPage: true });

await basic.click();
await page.getByRole('button').filter({ hasText: 'Lesson 1' }).first().click();
await page.getByRole('button', { name: /単語カード/ }).waitFor({ timeout: 10000 });
const modeButtons = [
  page.getByRole('button', { name: /単語カード/ }),
  page.getByRole('button', { name: /答えから覚える/ }),
  page.getByRole('button', { name: /並べ替えクイズ/ }),
  page.getByRole('button', { name: /自己申告テスト/ }),
];
const boxes = await Promise.all(modeButtons.map(b => b.boundingBox()));
const firstTwoSameRow = boxes[0] && boxes[1] && Math.abs(boxes[0].y - boxes[1].y) < 12;
const secondTwoSameRow = boxes[2] && boxes[3] && Math.abs(boxes[2].y - boxes[3].y) < 12;
await page.screenshot({ path: 'audit/live-ui/live-bento.png', fullPage: true });

const result = {
  url,
  sameRow,
  firstTwoSameRow: Boolean(firstTwoSameRow),
  secondTwoSameRow: Boolean(secondTwoSameRow),
  top: { basicBox, vqBox },
  modeBoxes: boxes,
};
fs.writeFileSync('audit/live-ui/result.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

if (!sameRow || !firstTwoSameRow || !secondTwoSameRow) {
  throw new Error('Live production is still serving the old non-bento layout.');
}

await context.close();
await browser.close();
