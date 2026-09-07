import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/interactions';
fs.mkdirSync(OUT, { recursive: true });
const results = [];

function ok(v, m) { if (!v) throw new Error(m); }
async function count(page) {
  const els = page.locator('span,div').filter({hasText:/^\d+\s*\/\s*\d+$/});
  for (let i=0;i<await els.count();i++) if (await els.nth(i).isVisible().catch(()=>false)) return (await els.nth(i).innerText()).trim();
  return '';
}
async function lesson1(page) {
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:/基本例文.*マスター/s}).click();
  await page.getByRole('button',{name:/Lesson 1/}).first().click();
}
async function resume(ctx,page) {
  const p2=await ctx.newPage(); await p2.goto('about:blank'); await p2.bringToFront(); await page.waitForTimeout(200); await page.bringToFront(); await page.waitForTimeout(400); await p2.close();
}
async function run(engine,name,fn) {
  try { await fn(); results.push({engine,name,ok:true}); console.log('PASS',engine,name); }
  catch(e){ results.push({engine,name,ok:false,error:String(e?.stack||e)}); console.error('FAIL',engine,name,e); }
}

async function audit(engine,type) {
  const browser=await type.launch({headless:true});
  const newCtx=()=>browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});

  await run(engine,'standard mini after resume',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click();
    const text=page.getByText('There are many books on the president’s life.',{exact:true}).first();
    await text.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]').click();
    const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor(); const before=await count(page);
    await resume(ctx,page); await mini.click(); await page.getByText('タップして閉じる').waitFor(); await page.waitForTimeout(700);
    ok(await count(page)===before,'mini changed card'); ok(await page.getByText('タップして閉じる').isVisible(),'mini did not stay open');
    await page.screenshot({path:`${OUT}/${engine}-standard-mini.png`,fullPage:true}); await ctx.close();
  });

  await run(engine,'favorite/yet controls do not flip',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click();
    const text=page.getByText('There are many books on the president’s life.',{exact:true}).first(); await text.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]').click();
    const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor(); const before=await count(page);
    await page.getByRole('button',{name:/お気に入り登録/}).click(); ok(await mini.isVisible(),'favorite flipped card'); ok(await count(page)===before,'favorite advanced');
    await page.getByRole('button',{name:/「まだ」リスト追加/}).click(); ok(await mini.isVisible(),'yet flipped card'); ok(await count(page)===before,'yet advanced'); await ctx.close();
  });

  await run(engine,'self mini does not submit',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await lesson1(page); await page.getByRole('button',{name:/自己申告テスト/}).click();
    const text=page.getByText('There are many books on the president’s life.',{exact:true}).first(); await text.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]').click();
    const mini=page.getByRole('button',{name:/💡 ミニ解説/}); await mini.waitFor(); const before=await count(page); await resume(ctx,page); await mini.click(); await page.waitForTimeout(600);
    ok(await count(page)===before,'self mini advanced'); ok(await page.getByRole('button',{name:/まだ/}).isVisible(),'self controls lost');
    await page.getByRole('button',{name:/わかった/}).click(); await page.waitForTimeout(250); ok(await count(page)==='2 / 9','self advanced wrong count'); await ctx.close();
  });

  await run(engine,'time mini pauses advance',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await lesson1(page);
    await page.getByLabel('問題を考える時間').selectOption('3'); await page.getByLabel('答えを表示する時間').selectOption('5'); await page.getByRole('button',{name:/タイムアタック開始/}).click();
    const mini=page.getByRole('button',{name:/💡 ミニ解説/}); await mini.waitFor({timeout:7000}); const before=await count(page); await mini.click(); await page.waitForTimeout(6200);
    ok(await count(page)===before,`advanced while mini open: ${before} -> ${await count(page)}`); await page.screenshot({path:`${OUT}/${engine}-time-mini.png`,fullPage:true}); await ctx.close();
  });

  await run(engine,'VQ point accordion safe',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await page.goto(BASE,{waitUntil:'networkidle'}); await page.getByRole('button',{name:/VISION QUEST/}).click();
    await page.getByRole('button',{name:/今回の試験範囲/}).first().click(); await page.getByRole('button',{name:/単語カード/}).click();
    const card=page.locator('div.cursor-pointer').filter({hasText:/タップして完成文を見る/}).first(); await card.click(); const p=page.getByRole('button',{name:/💡 ぽいんと/}); await p.waitFor(); const before=await count(page); await resume(ctx,page); await p.click(); await page.waitForTimeout(500);
    ok(await count(page)===before,'VQ point changed card'); ok(await page.getByText(/タップで折りたたむ/).isVisible(),'VQ point not open'); await ctx.close();
  });

  await run(engine,'freshness check must not reset active study',async()=>{
    const ctx=await newCtx(), page=await ctx.newPage(); await lesson1(page); await page.getByRole('button',{name:/単語カード/}).click();
    const text=page.getByText('There are many books on the president’s life.',{exact:true}).first(); await text.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]').click(); const mini=page.getByRole('button',{name:/ミニ解説を見る/}); await mini.waitFor();
    await page.route('**/?__ui_check=*',r=>r.fulfill({status:200,contentType:'text/html',body:'<script type="module" src="/assets/fake-new.js"></script>'})); await page.evaluate(()=>window.dispatchEvent(new Event('focus'))); await page.waitForTimeout(900);
    ok(await mini.isVisible().catch(()=>false),'freshness check reloaded active session'); await ctx.close();
  });

  await browser.close();
}

await audit('chromium',chromium);
await audit('webkit',webkit);
const failed=results.filter(r=>!r.ok);
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify({total:results.length,failed:failed.length,results},null,2));
console.log(JSON.stringify({total:results.length,failed:failed.length,results},null,2));
if(failed.length) process.exit(1);
