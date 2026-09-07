import fs from 'node:fs';
import { chromium } from 'playwright';

const url = 'https://reibun.itisnowornever271.workers.dev';
fs.mkdirSync('audit/live-ui', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

const basic = page.getByRole('button', { name: /基本例文マスター/ });
const vq = page.getByRole('button', { name: /VISION QUEST/ });
await basic.waitFor();
await vq.waitFor();
const [basicBox, vqBox] = await Promise.all([basic.boundingBox(), vq.boundingBox()]);
if (!basicBox || !vqBox) throw new Error('Could not measure top choice cards.');

const sameRow = Math.abs(basicBox.y - vqBox.y) < 12;
const topScreenshot = 'audit/live-ui/live-top.png';
await page.screenshot({ path: topScreenshot, fullPage: true });

await basic.click();
await page.getByRole('button').filter({ hasText: 'Lesson 1' }).first().click();
await page.getByRole('button', { name: /単語カード/ }).waitFor();
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
