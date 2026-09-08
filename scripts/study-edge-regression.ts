import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium, webkit, type Page } from 'playwright';
import { basicExampleDecks, visionQuestQuestionDecks } from '../src/data/cards';
import { CONTENT_VERSION } from '../src/data/exam_source_ledger';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT = 'audit/study-edges'; fs.mkdirSync(OUT, {recursive:true});
const FAV = `flashcard-favorites:${CONTENT_VERSION}`, YET = `flashcard-yet-list:${CONTENT_VERSION}`;
const vq = visionQuestQuestionDecks[0].cards[0], hope = basicExampleDecks[0].cards[0];
const results: {name:string;ok:boolean;error?:string}[]=[];
const card = (p:Page) => p.locator('div.cursor-pointer').first();
async function basic(p:Page) { await p.goto(BASE); await p.getByRole('button',{name:/基本例文.*マスター/s}).click(); }
async function review(p:Page,kind:'favorite'|'yet') {
  await basic(p);
  await p.getByRole('button',{name:kind==='favorite'?'お気に入りだけを復習する':'「まだ」のカードを復習する',exact:true}).click();
}
for (const [engine,type,width] of [['chromium-small',chromium,320],['webkit-mobile',webkit,390],['chromium-desktop',chromium,1280]] as const) {
  const browser=await type.launch();
  async function run(name:string,seed:Record<string,string>,fn:(p:Page)=>Promise<void>) {
    const ctx=await browser.newContext({viewport:{width,height:850},isMobile:width<600,hasTouch:width<600});
    await ctx.addInitScript(values=>{for(const [k,v] of Object.entries(values))localStorage.setItem(k,v)},seed);
    const page=await ctx.newPage(); page.setDefaultTimeout(7000);
    const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
    try {
      await fn(page);
      assert.deepEqual(errors,[]);
      const widths=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
      assert(widths[1]<=widths[0]+2,`${name}: horizontal overflow ${widths}`);
      await page.screenshot({path:`${OUT}/${engine}-${name}.png`,fullPage:true});
      results.push({name:`${engine}/${name}`,ok:true});
      console.log(`PASS ${engine}/${name}`);
    } catch(e) {results.push({name:`${engine}/${name}`,ok:false,error:String(e)});console.error(`FAIL ${engine}/${name}`,e)}
    finally {await ctx.close()}
  }
  await run('corrupt-storage',{'flashcard-dark-mode':'{broken','flashcard-shuffle':'null',[FAV]:'{}',[YET]:'null',app_greeting_queue:'[999]'},async p=>{
    await basic(p); await p.getByRole('button',{name:/Lesson 1 /}).first().click();
    await p.getByRole('button',{name:/単語カード/}).click();assert((await card(p).innerText()).includes(hope.front));
  });
  await run('mixed-favorites',{[FAV]:JSON.stringify([hope.id,vq.id])},async p=>{
    await review(p,'favorite');await p.getByRole('button',{name:/単語カード|問題カード/}).click();
    assert((await card(p).innerText()).includes(hope.front));
    await card(p).click(); await p.getByRole('button',{name:'ミニ解説を見る',exact:true}).click();
    await p.getByRole('button',{name:'次のカードへ'}).click();assert((await card(p).innerText()).includes(vq.front));
    await card(p).click();assert((await card(p).innerText()).replace(/[\[\]]/g,'').includes(vq.back));
    await p.getByTitle('このカードをお気に入りに登録・解除').click();
    await p.getByTitle('このカードをお気に入りに登録・解除').click();
    await p.getByText('お気に入りがありません').waitFor();
  });
  await run('vq-yet-clear',{[YET]:JSON.stringify([vq.id])},async p=>{
    await p.goto(BASE);await p.getByRole('button',{name:/VISION QUEST/}).click();
    await p.getByRole('button',{name:'「まだ」のカードを復習する',exact:true}).click();
    await p.getByRole('button',{name:/自己申告テスト/}).click(); await card(p).click();
    await p.getByRole('button',{name:'わかった',exact:true}).click();
    await p.getByText('100%').waitFor();
    assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),YET),[]);
  });
  await run('time-completion',{[FAV]:JSON.stringify([vq.id])},async p=>{
    await review(p,'favorite');
    await p.getByLabel('問題を考える時間').selectOption('3');await p.getByLabel('答えを表示する時間').selectOption('1');
    await p.getByRole('button',{name:'タイムアタック開始',exact:true}).click();
    await p.getByText('1問の確認が完了しました').waitFor();
    assert(!(await p.locator('body').innerText()).includes('正答率'));
  });
  await run('mistake-review',{[YET]:JSON.stringify([hope.id,vq.id])},async p=>{
    await review(p,'yet');await p.getByRole('button',{name:/自己申告テスト/}).click();
    await card(p).click();await p.getByRole('button',{name:'まだ',exact:true}).click();
    await card(p).click();await p.getByRole('button',{name:'わかった',exact:true}).click();
    await p.getByText('50%').waitFor();
    await p.getByRole('button',{name:'間違えた問題だけを復習する',exact:true}).click();
    await p.getByRole('button',{name:/単語カード|問題カード/}).click();
    assert((await card(p).innerText()).includes(hope.front));
    assert((await p.locator('body').innerText()).includes('1 / 1'));
  });
  await browser.close();
}
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify({total:results.length,passed:results.filter(x=>x.ok).length,results},null,2));
if(results.some(x=>!x.ok))process.exit(1);
