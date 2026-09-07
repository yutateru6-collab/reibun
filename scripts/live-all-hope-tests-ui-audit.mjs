import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const BASE = process.env.APP_URL || 'https://reibun.itisnowornever271.workers.dev/?all54=1';
const OUT = 'audit/all-hope-test-explanations';
fs.mkdirSync(OUT, { recursive: true });

const testCounts = [9, 8, 10, 11, 9, 7];
const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function visibleCounter(page) {
  const loc = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await loc.count(); i += 1) {
    if (await loc.nth(i).isVisible().catch(() => false)) return (await loc.nth(i).innerText()).trim();
  }
  return '';
}

async function openTest(page, testNo) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /公式穴埋め/ }).click();
  await page.getByRole('button', { name: new RegExp(`Test ${testNo}`) }).first().click();
  await page.getByText('学習モードを選択').waitFor();
  await page.getByRole('button', { name: /単語カード/ }).click();
}

async function auditEngine(engineName, browserType) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  let checked = 0;
  for (let testNo = 1; testNo <= 6; testNo += 1) {
    const count = testCounts[testNo - 1];
    await openTest(page, testNo);

    for (let cardNo = 1; cardNo <= count; cardNo += 1) {
      const expectedCounter = `${cardNo} / ${count}`;
      assert(await visibleCounter(page) === expectedCounter, `${engineName} Test${testNo} No.${cardNo}: counter mismatch`);

      // Reveal the completed answer if the card is still on its front face.
      let mini = page.getByRole('button', { name: /ミニ解説を見る/ });
      if (!(await mini.isVisible().catch(() => false))) {
        const card = page.locator('div.cursor-pointer').first();
        await card.click();
        mini = page.getByRole('button', { name: /ミニ解説を見る/ });
      }
      await mini.waitFor({ state: 'visible' });

      // Open the explanation and verify the old source-only panel cannot appear.
      await mini.click();
      await page.getByText('タップして閉じる').waitFor({ state: 'visible' });
      const bodyText = await page.locator('body').innerText();
      assert(bodyText.includes('💡ミニ解説'), `${engineName} Test${testNo} No.${cardNo}: mini-explanation heading missing`);
      assert(!bodyText.includes('【出典】Hope Test'), `${engineName} Test${testNo} No.${cardNo}: old source-only panel visible`);
      assert(!bodyText.includes('※英語・日本語・空欄は添付資料の表記を基準に収録しています。'), `${engineName} Test${testNo} No.${cardNo}: old source note visible`);
      assert(await visibleCounter(page) === expectedCounter, `${engineName} Test${testNo} No.${cardNo}: opening explanation changed card`);

      // Explicitly protect the user-reported card.
      if (testNo === 1 && cardNo === 7) {
        assert(bodyText.includes('To live is to learn.'), 'Reported Test1 No.7 answer missing');
        assert(bodyText.includes('To live と to learn'), 'Reported Test1 No.7 mapped mini explanation missing');
        await page.screenshot({ path: `${OUT}/${engineName}-test1-no7.png`, fullPage: true });
      }

      checked += 1;
      results.push({ engine: engineName, testNo, cardNo, ok: true });

      // Move on; currentIndex change closes explanation and resets the face.
      if (cardNo < count) await page.getByRole('button', { name: '次のカードへ' }).click();
    }
  }

  assert(checked === 54, `${engineName}: expected 54 cards checked, got ${checked}`);
  assert(pageErrors.length === 0, `${engineName}: page errors: ${pageErrors.join(' | ')}`);
  await context.close();
  await browser.close();
  console.log(`PASS ${engineName}: all ${checked}/54 Hope official-test cards show mini explanations`);
}

await auditEngine('chromium-mobile', chromium);
await auditEngine('webkit-mobile', webkit);

const summary = {
  totalChecks: results.length,
  expected: 108,
  passed: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).length,
  all54PerEngine: results.length === 108,
  results,
};
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, results: undefined }, null, 2));
if (summary.failed || summary.totalChecks !== 108) process.exit(1);
