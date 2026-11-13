import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {PROGRESS_KEY,HISTORY_KEY,classItems} from '../src/current-term/model';
const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
try {
 for(const width of [360,390,1440]){
 const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();
 for(const c of ['2-9','2-3'] as const){
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4173/');
 await page.getByRole('button',{name:c==='2-9'?/2年9組/:/2年3組/}).click();
 assert.equal(await page.getByRole('button',{name:/暗唱①/}).isVisible(),false);
 await page.getByRole('button',{name:'今日の練習を始める',exact:true}).click();
 let ids:string[]=[];
 for(let step=0;step<2;step++){
 for(let i=0;i<5;i++){
 const id=await page.locator('article').getAttribute('data-item-id');if(step===0)ids.push(id!);else assert.equal(id,ids[i]);
 const item=classItems(c).find(x=>x.id===id)!;assert.ok(item);
 assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),step===0?item.en:item.ja);
 await page.getByRole('button',{name:/タップして(日本語訳|英文)を見る/}).click();
 await page.getByRole('button',{name:'確認できた',exact:true}).click();
 }
 await page.getByRole('button',{name:step===0?'次へ：日本語から言う・書く':'次へ：確認問題',exact:true}).click();
 }
 for(let i=0;i<5;i++){
 await page.getByRole('button',{name:'解答を見る',exact:true}).click();
 await page.getByRole('button',{name:i===4?'結果を見る':'次の問題へ',exact:true}).click();
 }
 await page.getByRole('button',{name:'次へ：間違い直し',exact:true}).click();
 for(let i=0;i<5;i++){
 await page.getByRole('button',{name:/タップして(日本語訳|英文)を見る/}).click();
 await page.getByRole('button',{name:'確認できた',exact:true}).click();
 }
 await page.getByRole('button',{name:'今日の練習を終了',exact:true}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),PROGRESS_KEY);
 ids.forEach(id=>assert.equal(saved[id].attempts,4));
 await page.reload();
 const history=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),HISTORY_KEY);
 assert.ok(history.filter((h:any)=>h.classId===c).length>=4);
 }
 await context.close();
 }
 console.log('PASS guided 4 steps, both classes, 360/390/1440 widths, exact same five items, progress persistence');
}finally{await browser.close();}
