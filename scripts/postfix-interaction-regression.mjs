import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/postfix-interactions';
fs.mkdirSync(OUT, { recursive: true });
const results = [];

function assert(value, message) { if (!value) throw new Error(message); }
async function counter(page) {
  const els = page.locator('span,div').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
  for (let i = 0; i < await els.count(); i++) {
    if (await els.nth(i).isVisible().catch(() => false)) return (await els.nth(i).innerText()).trim();
  }
  return '';
}
async function lesson1(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /Lesson 1/ }).first().click();
  await page.getByText('学習モードを選択').waitFor();
}
async function hopeTest1(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /基本例文.*マスター/s }).click();
  await page.getByRole('button', { name: /公式穴埋め/ }).click();
  await page.getByRole('button', { name: /Test 1/ }).first().click();
  await page.getByText('学習モードを選択').waitFor();
}
async function cardToBack(page) {
  const english = page.getByText('There are many books on the president’s life.', { exact: true }).first();
  await english.waitFor();
  await english.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]').click();
}
async function simulateResume(context, page) {
  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await page.waitForTimeout(250);
  await page.bringToFront();
  await page.waitForTimeout(500);
  await other.close();
}
async function run(engine, name, fn) {
  try {
    await fn();
    results.push({ engine, name, ok: true });
    console.log(`PASS ${engine}: ${name}`);
  } catch (error) {
    results.push({ engine, name, ok: false, error: String(error?.stack || error) });
    console.error(`FAIL ${engine}: ${name}`, error);
  }
}

async function auditEngine(engine, browserType) {
  const browser = await browserType.launch({ headless: true });
  const newContext = () => browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await run(engine, 'standard mini survives resume and stays on same card', async () => {
    const context = await newContext(); const page = await context.newPage(); const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
    await lesson1(page); await page.getByRole('button', { name: /単語カード|問題カード/ }).click(); await cardToBack(page);
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ }); await mini.waitFor(); const before = await counter(page);
    await simulateResume(context, page); await mini.click(); await page.getByText('タップして閉じる').waitFor(); await page.waitForTimeout(800);
    assert(await counter(page) === before, `card changed: ${before} -> ${await counter(page)}`);
    assert(await page.getByText('タップして閉じる').isVisible(), 'mini explanation did not remain open');
    assert(pageErrors.length===0, `page errors: ${pageErrors.join(' | ')}`);
    await page.screenshot({ path: `${OUT}/${engine}-standard-mini.png`, fullPage: true }); await context.close();
  });

  await run(engine, 'Hope official Test1 No.7 shows mini explanation instead of source panel', async () => {
    const context = await newContext(); const page = await context.newPage();
    await hopeTest1(page); await page.getByRole('button', { name: /単語カード|問題カード/ }).click();
    for (let i = 0; i < 6; i += 1) await page.getByRole('button', { name: '次のカードへ' }).click();
    assert(await counter(page) === '7 / 9', `expected Test1 No.7, got ${await counter(page)}`);
    const card = page.locator('div.cursor-pointer').filter({ hasText: /is to learn/ }).first();
    await card.click();
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
    await lesson1(page); await page.getByRole('button', { name: /答えから覚える/ }).click();
    const mini = page.getByRole('button', { name: /ミニ解説を見る/ }); await mini.waitFor(); const before=await counter(page);
    await simulateResume(context,page); await mini.click(); await page.getByText('タップして閉じる').waitFor();
    assert(await counter(page)===before,'memorize mini changed card'); await context.close();
  });

  await run(engine, 'favorite and yet buttons never flip or navigate', async () => {
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click(); await cardToBack(page);
    const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor(); const before=await counter(page);
    await page.getByTitle('このカードをお気に入りに登録・解除').click(); assert(await mini.isVisible(),'favorite flipped card'); assert(await counter(page)===before,'favorite changed card');
    await page.getByTitle('このカードを「まだ」リストに登録・解除').click(); assert(await mini.isVisible(),'yet flipped card'); assert(await counter(page)===before,'yet changed card');
    await context.close();
  });

  await run(engine, 'prev and next change exactly one card', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click();
    assert(await counter(page)==='1 / 9','did not start at 1 / 9'); await page.getByRole('button',{name:'次のカードへ'}).click(); assert(await counter(page)==='2 / 9','next did not advance once');
    await page.getByRole('button',{name:'前のカードへ'}).click(); assert(await counter(page)==='1 / 9','prev did not return once'); await context.close();
  });

  await run(engine, 'self-assessment mini does not submit or advance', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByRole('button',{name:/自己申告テスト/}).click(); await cardToBack(page);
    const mini=page.getByRole('button',{name:/💡 ミニ解説/}); await mini.waitFor(); const before=await counter(page); await simulateResume(context,page); await mini.click(); await page.waitForTimeout(700);
    assert(await counter(page)===before,'self mini advanced'); assert(await page.getByRole('button',{name:/まだ/}).isVisible(),'まだ disappeared'); assert(await page.getByRole('button',{name:/わかった/}).isVisible(),'わかった disappeared');
    await page.getByRole('button',{name:/わかった/}).click(); await page.waitForTimeout(250); assert(await counter(page)==='2 / 9','self answer did not advance once'); await context.close();
  });

  await run(engine, 'time attack pauses while mini is open then resumes', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page);
    await page.getByLabel('問題を考える時間').selectOption('3'); await page.getByLabel('答えを表示する時間').selectOption('5'); await page.getByRole('button',{name:/タイムアタック開始/}).click();
    const mini=page.getByRole('button',{name:/💡 ミニ解説/}); await mini.waitFor({timeout:7000}); const before=await counter(page); await mini.click();
    await page.getByText('解説確認中（停止）').waitFor(); await page.waitForTimeout(6200); assert(await counter(page)===before,`advanced while open: ${before} -> ${await counter(page)}`);
    await page.getByRole('button',{name:/💡 ミニ解説/}).click(); await page.waitForTimeout(5600); assert(await counter(page)==='2 / 9','timer did not resume after closing explanation');
    await page.screenshot({path:`${OUT}/${engine}-time-pause.png`,fullPage:true}); await context.close();
  });

  await run(engine, 'VQ point accordion never flips or advances', async()=>{
    const context=await newContext(); const page=await context.newPage(); await page.goto(BASE,{waitUntil:'networkidle'}); await page.getByRole('button',{name:/VISION QUEST/}).click();
    await page.getByRole('button',{name:/今回の試験範囲/}).first().click(); await page.getByRole('button',{name:/単語カード/}).click();
    const card=page.locator('div.cursor-pointer').filter({hasText:/タップして完成文を見る/}).first(); await card.click(); const point=page.getByRole('button',{name:/💡 ぽいんと/}); await point.waitFor(); const before=await counter(page);
    await simulateResume(context,page); await point.click(); await page.waitForTimeout(600); assert(await counter(page)===before,'VQ point advanced'); assert(await page.getByText(/タップで折りたたむ/).isVisible(),'VQ point did not open'); await context.close();
  });

  await run(engine, 'freshness check never reloads an active study session', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click(); await cardToBack(page); const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor();
    await page.route('**/?__ui_check=*', route=>route.fulfill({status:200,contentType:'text/html',body:'<script type="module" src="/assets/fake-new-bundle.js"></script>'}));
    await page.evaluate(()=>window.dispatchEvent(new Event('focus'))); await page.waitForTimeout(1200); assert(await mini.isVisible().catch(()=>false),'freshness check reloaded active session'); assert(await counter(page)==='1 / 9','freshness check lost study position'); await context.close();
  });

  await run(engine, 'word-order delayed callback is cancelled after leaving mode', async()=>{
    const context=await newContext(); const page=await context.newPage(); await lesson1(page); await page.getByRole('button',{name:/並べ替えクイズ/}).click();
    const words=['There','are','many','books','on','the','president’s','life.'];
    for(const word of words){ const re=new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`); await page.locator('button.border-2').filter({hasText:re}).first().click(); }
    await page.getByRole('button',{name:/解答する/}).click(); await page.getByText(/正解/).waitFor(); await page.getByRole('button',{name:'学習モード選択へ戻る'}).click(); await page.getByText('学習モードを選択').waitFor();
    await page.waitForTimeout(2400); assert(await page.getByText('学習モードを選択').isVisible(),'delayed order callback navigated after leaving mode'); await context.close();
  });

  await browser.close();
}

await auditEngine('chromium-mobile',chromium);
await auditEngine('webkit-mobile',webkit);
const failed=results.filter(r=>!r.ok);
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify({total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
console.log(JSON.stringify({total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
if(failed.length) process.exit(1);
