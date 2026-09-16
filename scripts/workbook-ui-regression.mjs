import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, webkit } from 'playwright';
const KEY='reibun:workbook:history:v1';
async function ready(p) { await p.waitForFunction(()=>document.querySelector('[data-action=print]')?.disabled===false); }
async function ids(p,part='questions') { return p.locator(`.wp-page[data-part=${part}] .wp-item`).evaluateAll(es=>es.map(e=>e.dataset.id)); }
async function noOverflow(p) {
 const bad=await p.locator('.wp-page .wp-item').evaluateAll(items=>items.flatMap(e=>{const a=e.getBoundingClientRect(),c=e.closest('.wp-column').getBoundingClientRect(),f=e.closest('.wp-page').querySelector('.wp-footer').getBoundingClientRect();return a.right>c.right+2||a.bottom>c.bottom+2||a.bottom>f.top+2?[{id:e.dataset.id,a:{bottom:a.bottom,right:a.right},c:{bottom:c.bottom,right:c.right},footer:f.top}]:[];}));
 assert.deepEqual(bad,[],'Printed question or explanation crosses its column/footer');
}
export async function runWorkbookChecks(p,OUT) {
 fs.mkdirSync(OUT,{recursive:true});
 await p.waitForSelector('[data-ui="workbook-launcher"]');
 assert.equal(await p.locator('[data-ui="quiz-launcher"]').count(),1);
 assert.equal(await p.locator('[data-ui="exam-quiz-hub"]').count(),0,'Quiz list must not appear on home');
 await p.screenshot({path:path.join(OUT,'home-mobile.png'),animations:'disabled'});
 await p.locator('[data-ui="quiz-launcher"]').click();
 assert.equal(await p.locator('[data-ui="quiz-dialog"]').getAttribute('data-answer-layout'),'balanced-session-choice-layout-v1');
 await p.getByRole('button',{name:'3問クイック',exact:true}).click();
 const quickAnswerPositions=[];
 for(let i=0;i<3;i++){
  const choices=p.locator('[data-ui="quiz-dialog"] article button[data-choice-index]');
  await choices.first().click();
  const correct=p.locator('[data-ui="quiz-dialog"] article button[data-state="correct"]');
  await correct.waitFor();
  quickAnswerPositions.push(Number(await correct.getAttribute('data-choice-index')));
  await p.getByRole('button',{name:i===2?'結果を見る':'次の問題',exact:true}).click();
 }
 assert.equal(new Set(quickAnswerPositions).size,3,`Quick quiz answer positions are not balanced: ${quickAnswerPositions}`);
 await p.getByRole('button',{name:'一覧へ戻る',exact:true}).click();
 await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
 assert.equal(await p.locator('[data-ui="exam-quiz-hub"]').count(),0);
 await p.locator('[data-ui="workbook-launcher"]').click();
 assert.equal(await p.locator('#root').evaluate(e=>e.inert),true);
 await p.screenshot({path:path.join(OUT,'setup-mobile.png'),animations:'disabled'});
 await p.getByRole('button',{name:'20問で練習を始める',exact:true}).click();
 const sheet=await p.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],KEY);
 assert.equal(sheet.questions.length,20);
 assert.equal(await p.locator('[data-ui="workbook-question"]').getAttribute('data-id'),sheet.questions[0].id);
 await p.getByLabel('解答欄',{exact:true}).fill('practice answer');
 await p.getByRole('button',{name:'解答・解説を見る',exact:true}).click();
 await p.getByRole('button',{name:'もう一度練習',exact:true}).click();
 await p.getByRole('button',{name:'次の問題',exact:true}).click();
 await p.getByRole('button',{name:'前の問題',exact:true}).click();
 assert.equal(await p.getByLabel('解答欄',{exact:true}).inputValue(),'practice answer');
 await p.getByRole('button',{name:'今回の問題を印刷',exact:true}).click();await ready(p);
 assert.deepEqual(await ids(p),sheet.questions.map(q=>q.id));
 assert.equal(await p.locator('.wp-page .wp-solution').count(),0,'Question-only printing leaks answers');
 await p.getByLabel('出力内容',{exact:true}).selectOption('both');await ready(p);
 assert.deepEqual(await ids(p,'answers'),sheet.questions.map(q=>q.id));await noOverflow(p);
 const a4Pages=await p.locator('.wp-page').count();
 if(p.context().browser().browserType().name()==='chromium') await p.pdf({path:path.join(OUT,'sample-a4.pdf'),preferCSSPageSize:true,printBackground:false});
 assert.equal(await p.locator('.wp-page').count(),a4Pages,'Printing changed pagination');
 await p.getByLabel('用紙',{exact:true}).selectOption('b4');await ready(p);
 await noOverflow(p);assert.deepEqual(await ids(p),sheet.questions.map(q=>q.id));
 const b4Pages=await p.locator('.wp-page').count();
 if(p.context().browser().browserType().name()==='chromium') await p.pdf({path:path.join(OUT,'sample-b4.pdf'),preferCSSPageSize:true,printBackground:false});
 assert.equal(await p.locator('.wp-page').count(),b4Pages);
 await p.getByRole('button',{name:'このセットで練習',exact:true}).click();
 assert.equal(await p.locator('[data-ui="workbook-question"]').getAttribute('data-id'),sheet.questions[0].id);
 assert.equal(await p.getByLabel('解答欄',{exact:true}).inputValue(),'practice answer');
 // Returning from print must preserve answers, grading and exact question order.
 for(let i=0;i<20;i++) await p.getByRole('button',{name:i===19?'結果を見る':'次の問題',exact:true}).click();
 await p.getByRole('button',{name:'間違えた問題だけ印刷',exact:true}).click();await ready(p);
 assert.deepEqual(await ids(p),[sheet.questions[0].id]);
 await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
 assert.equal(await p.locator('#root').evaluate(e=>e.inert),false);
 await p.getByRole('button',{name:'テーマ切り替え',exact:true}).click();
 await p.screenshot({path:path.join(OUT,'home-dark.png'),animations:'disabled'});
 await p.locator('[data-ui="workbook-launcher"]').click();
 await p.screenshot({path:path.join(OUT,'setup-dark.png'),animations:'disabled'});
 await p.getByLabel('出題形式',{exact:true}).selectOption('choice');
 await p.getByLabel('応用問題〔新作〕の問題数',{exact:true}).selectOption('3');
 await p.getByRole('button',{name:'3問で練習を始める',exact:true}).click();
 const mc=await p.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],KEY);
 const correctIndex=mc.questions[0].choices.findIndex(c=>c.id===mc.questions[0].correctId);
 await p.locator('.wb-options button').nth(correctIndex).click();
 assert.ok((await p.locator('.wb-answer').innerText()).includes('正解！'));
 assert.ok((await p.locator('.wb-answer strong').innerText()).startsWith(String.fromCharCode(65+correctIndex)));
 await p.screenshot({path:path.join(OUT,'practice-dark.png'),animations:'disabled'});
 await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
 await p.locator('[data-ui="workbook-launcher"]').click();
 await p.getByLabel('範囲',{exact:true}).selectOption('hope3');
 assert.ok(await p.getByRole('button',{name:'0問のプリントを作る',exact:true}).isDisabled());
 await p.getByLabel('出題形式',{exact:true}).selectOption('all');
 await p.getByRole('button',{name:'10問のプリントを作る',exact:true}).click();await ready(p);
 await noOverflow(p);assert.equal((await ids(p)).length,10);
 await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
 await p.locator('[data-ui="workbook-launcher"]').click();await p.getByLabel('範囲',{exact:true}).selectOption('both');
 for(const name of ['元の問題','形式変更','応用問題〔新作〕']) await p.getByLabel(`${name}の問題数`,{exact:true}).selectOption('-1');
 await p.getByRole('button',{name:'118問のプリントを作る',exact:true}).click();await ready(p);
 await noOverflow(p); assert.equal((await ids(p)).length,118);assert.equal((await ids(p,'answers')).length,118);
 await p.getByLabel('用紙',{exact:true}).selectOption('a4');await ready(p);await noOverflow(p);
 await p.getByLabel('出力内容',{exact:true}).selectOption('answers');await ready(p);assert.equal((await ids(p)).length,0);assert.equal((await ids(p,'answers')).length,118);await noOverflow(p);
 await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
 await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:path.join(OUT,'home-desktop.png'),animations:'disabled'});
 console.log(JSON.stringify({workbookUI:'passed',a4Pages,b4Pages,allQuestions:118,originalHope:10,snapshotStable:true,answerKeysMatched:true},null,2));
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({workbookUI:'passed',a4Pages,b4Pages,allQuestions:118},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true});
 const p=await browser.newPage({viewport:{width:393,height:852}});p.setDefaultTimeout(15000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.APP_URL||'http://127.0.0.1:4173',{waitUntil:'networkidle'});
 try {
   await runWorkbookChecks(p,process.env.QA_OUT||'audit/workbook');
   const saved=await p.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],KEY);
   await p.reload({waitUntil:'networkidle'});
   await p.locator('[data-ui=workbook-launcher]').click();
   await p.locator('.wb-history button').first().click(); await ready(p);
   assert.deepEqual(await ids(p),saved.questions.map(q=>q.id),'Reload changed the saved worksheet');
   await p.evaluate(key=>localStorage.setItem(key,'{broken'),KEY);
   await p.reload({waitUntil:'networkidle'});
   await p.locator('[data-ui=workbook-launcher]').click();
   assert.equal(await p.locator('.wb-history button').count(),0);
   assert.deepEqual(errors,[]);
 }
 finally {await browser.close();}
}
