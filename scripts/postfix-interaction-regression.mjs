import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/postfix-interactions';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const normalize = (value) => value.replace(/\s+/g, ' ').trim();
function assert(value, message) { if (!value) throw new Error(message); }
async function run(engine, name, fn) {
  try { await fn(); results.push({ engine, name, ok: true }); console.log(`PASS ${engine}: ${name}`); }
  catch (error) { const text = String(error?.stack || error); results.push({ engine, name, ok: false, error: text }); console.error(`FAIL ${engine}: ${name}`, error); }
}
async function domClick(locator) { await locator.waitFor({ state: 'visible', timeout: 10000 }); await locator.evaluate((el) => el.click()); }
async function simulateResume(context, page) {
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await context.setOffline(true); await page.waitForTimeout(120); await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
}
async function counter(page) {
  const all = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await all.count(); i += 1) if (await all.nth(i).isVisible().catch(() => false)) return normalize(await all.nth(i).innerText());
  return '';
}
async function goHome(page) { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 }); }
async function openBasic(page) { await goHome(page); await domClick(page.getByRole('button', { name: /基本例文.*マスター/s })); }
async function lesson1(page) {
  await openBasic(page);
  const h = page.getByRole('heading', { name: 'Lesson 1', exact: true });
  await domClick(page.locator('button').filter({ has: h }).first());
  await page.getByText('学習モードを選択', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
}
async function hopeTest1(page) {
  await openBasic(page);
  await domClick(page.getByRole('button', { name: /公式穴埋め/ }));
  const h = page.getByRole('heading', { name: /Test 1/ }).first();
  await domClick(page.locator('button').filter({ has: h }).first());
  await page.getByText('学習モードを選択', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
}
async function cardToBack(page) {
  const card = page.locator('div.cursor-pointer').first(); await card.waitFor({ state: 'visible', timeout: 10000 }); await domClick(card); await page.waitForTimeout(80);
}
async function openVqQuestion(page) {
  await goHome(page); await domClick(page.getByRole('button', { name: /VISION QUEST/ })); await domClick(page.getByRole('button', { name: '問題', exact: true }));
  const h = page.locator('h2').first(); await h.waitFor({ state: 'visible', timeout: 10000 });
  await domClick(page.locator('button').filter({ has: h }).first());
  await page.getByText('学習モードを選択', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
}

async function auditEngine(engine, browserType) {
  const browser = await browserType.launch({ headless: true });
  const newContext = () => browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await run(engine, 'standard mini survives resume and stays on same card', async () => {
    const context = await newContext(); const page = await context.newPage(); const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
    await lesson1(page); await domClick(page.getByRole('button', { name: /単語カード|問題カード/ })); await cardToBack(page);
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ }); await mini.waitFor(); const before = await counter(page);
    await simulateResume(context, page); await mini.click(); await page.getByText('タップして閉じる').waitFor(); await page.waitForTimeout(800);
    assert(await counter(page) === before, `card changed: ${before} -> ${await counter(page)}`);
    assert(await page.getByText('タップして閉じる').isVisible(), 'mini explanation did not remain open');
    assert(pageErrors.length===0, `page errors: ${pageErrors.join(' | ')}`);
    await page.screenshot({ path: `${OUT}/${engine}-standard-mini.png`, fullPage: true }); await context.close();
  });

  await run(engine, 'Hope official Test1 No.7 shows mini explanation instead of source panel', async () => {
    const context = await newContext(); const page = await context.newPage();
    await hopeTest1(page); await domClick(page.getByRole('button', { name: /単語カード|問題カード/ }));
    for (let i = 0; i < 6; i += 1) await domClick(page.getByRole('button', { name: '次のカードへ' }));
    assert(await counter(page) === '7 / 9', `expected Test1 No.7, got ${await counter(page)}`);
    const card = page.locator('div.cursor-pointer').filter({ hasText: /is to learn/ }).first();
    await domClick(card);
    await page.getByText('To live is to learn.', { exact: true }).waitFor();
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ }); await mini.waitFor();
    await simulateResume(context, page); await mini.click();
    await page.getByText(/To live と to learn/).waitFor();
    assert(await counter(page) === '7 / 9', 'opening Test1 No.7 mini explanation changed card');
    assert(!(await page.getByText(/【出典】/).isVisible().catch(() => false)), 'old source-only block is still visible');
    assert(!(await page.getByText(/Hope Test1 No\.7/).isVisible().catch(() => false)), 'Hope Test1 source metadata is still visible');
    await page.screenshot({ path: `${OUT}/${engine}-hope-test1-no7-mini.png`, fullPage: true });
    await context.close();
  });

  await run(engine, 'memorize mini survives resume', async () => {
    const context = await newContext(); const page = await context.newPage();
    await lesson1(page); await domClick(page.getByRole('button', { name: /答えから覚える/ }));
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ }); await mini.waitFor(); const before=await counter(page);
    await simulateResume(context,page); await mini.click(); await page.getByText('タップして閉じる').waitFor();
    assert(await counter(page)===before,'memorize mini changed card'); await context.close();
  });

  await run(engine, 'favorite and yet buttons never flip or navigate', async () => {
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await domClick(page.getByRole('button',{name:/単語カード|問題カード/})); await cardToBack(page);
    const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor(); const before=await counter(page);
    await domClick(page.getByTitle('このカードをお気に入りに登録・解除')); assert(await mini.isVisible(),'favorite flipped card'); assert(await counter(page)===before,'favorite changed card');
    await domClick(page.getByTitle('このカードを「まだ」リストに登録・解除')); assert(await mini.isVisible(),'yet flipped card'); assert(await counter(page)===before,'yet changed card');
    await context.close();
  });

  await run(engine, 'prev and next change exactly one card', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await domClick(page.getByRole('button',{name:/単語カード|問題カード/}));
    assert(await counter(page)==='1 / 9','did not start at 1 / 9'); await domClick(page.getByRole('button',{name:'次のカードへ'})); assert(await counter(page)==='2 / 9','next did not advance once');
    await domClick(page.getByRole('button',{name:'前のカードへ'})); assert(await counter(page)==='1 / 9','prev did not return once'); await context.close();
  });

  await run(engine, 'self-assessment mini does not submit or advance', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await domClick(page.getByRole('button',{name:/自己申告テスト/})); await cardToBack(page);
    const mini=page.getByRole('button',{name:/💡 ミニ解説/}); await mini.waitFor(); const before=await counter(page); await simulateResume(context,page); await mini.click(); await page.waitForTimeout(700);
    assert(await counter(page)===before,'self mini advanced'); assert(await page.getByRole('button',{name:/まだ/}).isVisible(),'まだ disappeared'); assert(await page.getByRole('button',{name:/わかった/}).isVisible(),'わかった disappeared');
    await domClick(page.getByRole('button',{name:/わかった/})); await page.waitForTimeout(250); assert(await counter(page)==='2 / 9','self answer did not advance once'); await context.close();
  });

  await run(engine, 'time attack pauses while mini is open then resumes', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByLabel('問題を考える時間').selectOption('3'); await page.getByLabel('答えを表示する時間').selectOption('3'); await domClick(page.getByRole('button',{name:/タイムアタック開始/}));
    await page.waitForTimeout(3300); const mini=page.getByRole('button',{name:/ミニ解説/}); await mini.waitFor(); const before=await counter(page); await mini.click(); await page.waitForTimeout(7000); assert(await counter(page)===before,'timer advanced while mini was open'); await page.getByText('タップして閉じる').click(); await page.waitForTimeout(3500); assert(await counter(page)!==before,'timer did not resume'); await context.close();
  });

  await run(engine, 'VQ point accordion never flips or advances', async()=>{
    const context=await newContext(); const page=await context.newPage(); await openVqQuestion(page); await domClick(page.getByRole('button',{name:/単語カード|問題カード/})); const before=await counter(page); const card=page.locator('div.cursor-pointer').first(); const front=normalize(await card.innerText()); const point=page.getByRole('button',{name:/ポイント解説/}); if(await point.count()){ await point.click(); await page.waitForTimeout(300); assert(await counter(page)===before,'point accordion advanced card'); assert(normalize(await card.innerText()).includes(front.slice(0,30)),'point accordion flipped card'); } await context.close();
  });

  await run(engine, 'freshness check never reloads an active study session', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await domClick(page.getByRole('button',{name:/単語カード|問題カード/})); await domClick(page.getByRole('button',{name:'次のカードへ'})); const before=await counter(page); await simulateResume(context,page); await page.waitForTimeout(1200); assert(await counter(page)===before,'resume reset or reloaded active study session'); await context.close();
  });

  await run(engine, 'word-order delayed callback is cancelled after leaving mode', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await domClick(page.getByRole('button',{name:/並べ替えクイズ/})); await page.waitForTimeout(120); const back=page.getByRole('button',{name:/学習モード選択へ戻る/}); if(await back.count()){ await domClick(back); await page.waitForTimeout(1500); assert(await page.getByText('学習モードを選択',{exact:true}).isVisible(),'delayed word-order callback changed mode after leaving'); } await context.close();
  });

  await browser.close();
}

await auditEngine('chromium-mobile', chromium);
await auditEngine('webkit-mobile', webkit);

const failed=results.filter(r=>!r.ok);
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify({total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
console.log(JSON.stringify({total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
if(failed.length)process.exit(1);
