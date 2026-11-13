import assert from 'node:assert/strict';
import { chromium, webkit, type Page } from 'playwright';
import fs from 'node:fs/promises';
import { RELEASE, classItems, FAVORITES_KEY, YET_KEY, PROGRESS_KEY, HISTORY_KEY, type ClassId, type Item } from '../src/current-term/model';
const base=process.env.APP_URL||'http://127.0.0.1:4173/';
const browserName=process.env.BROWSER||'chromium';
const out=process.env.QA_OUT||`audit/current-term-${browserName}`;
await fs.mkdir(out,{recursive:true});
const browser=await (browserName==='webkit'?webkit:chromium).launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const results:object[]=[];
async function noOverflow(page:Page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');}
async function classHome(page:Page,c:ClassId){await page.goto(base);await page.getByRole('button',{name:c==='2-9'?/2年9組/:/2年3組/}).click();await page.getByRole('button',{name:'範囲から選ぶ',exact:true}).click();await page.getByText('その他の練習・学習記録',{exact:true}).click();}
async function answer(page:Page,items:Item[],wrong=false){
  const article=page.locator('article[data-item-id]');
  const id=await article.getAttribute('data-item-id');
  const item=items.find(x=>x.id===id);assert.ok(item,'class-scoped question '+id);
  if(await page.locator('#answer').count()) {
    await page.locator('#answer').fill(wrong?'incorrect answer':(item.alternatives.find(x=>x.length>0)||item.focus));
    await page.getByRole('button',{name:'答え合わせ',exact:true}).click();
  } else {
    const count=await page.locator('[data-token-id]').count();
    assert.equal(count,item.en.replace(/\s*\[[^\]]+\]/g,'').trim().split(/\s+/).length);
    await page.locator('[data-token-id="0"]').click();
    await page.getByTestId('ordered-answer').getByRole('button').first().click();
    for(let n=0;n<count;n++)await page.locator(`[data-token-id="${n}"]`).click();
    await page.getByRole('button',{name:'答え合わせ',exact:true}).click();
  }
  await page.getByText(wrong?'解答を確認':'正解',{exact:true}).waitFor();
  await noOverflow(page);
  return id;
}
try {
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:viewport.width<600,locale:'ja-JP'});const page=await context.newPage();const errors:string[]=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base);
  await page.locator(`[data-current-term="${RELEASE}"]`).waitFor();
  await page.evaluate(({f,y,p})=>{localStorage.setItem(f,JSON.stringify([1,4001,4039]));localStorage.setItem(y,JSON.stringify([3,4010]));localStorage.setItem(p,JSON.stringify({'sentinel-old':{correct:2,attempts:3,lastCorrect:false}}));localStorage.setItem('legacy-progress-sentinel','keep');},{f:FAVORITES_KEY,y:YET_KEY,p:PROGRESS_KEY});
  await page.reload();
  await noOverflow(page);await page.screenshot({path:`${out}/${viewport.width}-classes.png`,fullPage:true});
  for(const c of ['2-9','2-3'] as ClassId[]){
    const items=classItems(c);await classHome(page,c);
    const range=await page.locator('[data-current-term]').innerText();
    assert.ok(range.includes(c==='2-9'?'暗唱 38文':'暗唱 34文'));
    assert.equal(await page.getByRole('button',{name:/暗唱[①②③④]/}).count(),c==='2-9'?4:0);
    assert.equal(await page.getByRole('button',{name:/暗唱[⑤⑥⑦⑧]/}).count(),c==='2-3'?4:0);
    assert.equal(await page.getByRole('button',{name:/Lesson 4 助動詞/}).count(),c==='2-9'?1:0);
    assert.equal(await page.getByRole('button',{name:/Lesson 6 関係詞/}).count(),c==='2-3'?1:0);
    await page.getByText('資料・範囲の確認状況',{exact:true}).click();
    if(c==='2-3')await page.getByText(/正式な範囲表そのものは未確認/).waitFor();
    await noOverflow(page);await page.screenshot({path:`${out}/${viewport.width}-${c}-range.png`,fullPage:true});
    // Original card text, translation, both directions and existing bookmark.
    await page.getByRole('button',{name:c==='2-9'?/暗唱① 主語/:/暗唱⑤ 形容詞/}).click();
    await noOverflow(page);await page.screenshot({path:`${out}/${viewport.width}-${c}-menu.png`,fullPage:true});
    await page.getByText('練習方法を自分で選ぶ・設定',{exact:true}).click();await page.getByRole('button',{name:/例文を覚える/}).click();
    const first=items[0];assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),first.en);
    await page.getByRole('button',{name:'お気に入り解除',exact:true}).waitFor();
    await noOverflow(page);await page.screenshot({path:`${out}/${viewport.width}-${c}-card.png`,fullPage:true});
    await page.getByRole('button',{name:/タップして(日本語訳|英文)を見る/}).click();assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),first.ja);
    await page.getByRole('button',{name:'日本語から見る',exact:true}).click();assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),first.ja);
    await page.getByRole('button',{name:/タップして(日本語訳|英文)を見る/}).click();assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),first.en);
    await page.getByRole('button',{name:'ミニ解説を見る',exact:true}).click();await page.getByText(first.explanation,{exact:true}).waitFor();
    await page.getByRole('button',{name:'次のカードへ',exact:true}).click();await page.getByRole('button',{name:'前のカードへ',exact:true}).click();
    assert.equal(await page.locator('[data-ui=hope-card-main]').innerText(),first.ja);
    await page.getByRole('button',{name:/タップして英文を見る/}).click();
    await page.getByRole('button',{name:'確認できた',exact:true}).click();
    await page.getByRole('button',{name:'戻る',exact:true}).click();await page.getByRole('button',{name:'学習を終了',exact:true}).click();
    // Complete every original recitation cloze and preserve all source answers.
    for(const unit of [...new Set(items.filter(x=>x.source==='recitation').map(x=>x.unit))]){
      await classHome(page,c);
      const number=Number(unit.split('-')[1]);const symbol=['','①','②','③','④','⑤','⑥','⑦','⑧'][number];
      await page.getByRole('button',{name:new RegExp(`暗唱${symbol} `)}).click();
      await page.getByText('練習方法を自分で選ぶ・設定',{exact:true}).click();await page.getByRole('button',{name:/穴埋めで確認/}).click();
      const count=items.filter(x=>x.unit===unit).length;
      for(let i=0;i<count;i++){await answer(page,items);await page.getByRole('button',{name:i===count-1?'結果を見る':'次の問題へ',exact:true}).click();}
      await page.getByRole('heading',{name:'学習結果',exact:true}).waitFor();
    }
    // Ten final questions, both formats, every scoped unit, one real error and retry.
    await classHome(page,c);await page.getByRole('button',{name:'試験前の最終チェック',exact:true}).click();
    await page.getByRole('combobox',{name:'問題数'}).selectOption('10');await page.getByRole('button',{name:'学習を始める',exact:true}).click();
    const seen:string[]=[];
    for(let i=0;i<10;i++){
      seen.push((await answer(page,items,i===0))!);
      if(i<2)await page.screenshot({path:`${out}/${viewport.width}-${c}-${i===0?'cloze':'order'}.png`,fullPage:true});
      await page.getByRole('button',{name:i===9?'結果を見る':'次の問題へ',exact:true}).click();
    }
    await page.getByRole('heading',{name:'学習結果',exact:true}).waitFor();
    assert.equal(new Set(seen.map(id=>items.find(x=>x.id===id)!.unit)).size,new Set(items.map(x=>x.unit)).size);
    assert.match(await page.locator('section').innerText(),/9\s*\/\s*10/);
    await noOverflow(page);await page.screenshot({path:`${out}/${viewport.width}-${c}-result.png`,fullPage:true});
    await page.getByRole('button',{name:'間違えた問題を解き直す',exact:true}).click();await answer(page,items);await page.getByRole('button',{name:'結果を見る',exact:true}).click();
    await page.getByRole('button',{name:'今回の試験範囲に戻る',exact:true}).click();await page.getByText('その他の練習・学習記録',{exact:true}).click();await page.getByRole('heading',{name:'最近の学習記録'}).waitFor();
    await page.reload();await page.getByRole('button',{name:c==='2-9'?/2年9組/:/2年3組/}).click();await page.getByText('その他の練習・学習記録',{exact:true}).click();await page.getByRole('heading',{name:'最近の学習記録'}).waitFor();
    results.push({browser:browserName,viewport,class:c,originalCloze:items.filter(x=>x.source==='recitation').length,final:10,retry:1,units:new Set(items.map(x=>x.unit)).size});
  }
  const saved=await page.evaluate(({f,y,p,h})=>({f:JSON.parse(localStorage.getItem(f)!),y:JSON.parse(localStorage.getItem(y)!),p:JSON.parse(localStorage.getItem(p)!),h:JSON.parse(localStorage.getItem(h)!),legacy:localStorage.getItem('legacy-progress-sentinel')}),{f:FAVORITES_KEY,y:YET_KEY,p:PROGRESS_KEY,h:HISTORY_KEY});
  assert.deepEqual(saved.f,[1,4001,4039]);assert.ok(saved.y.includes(3)&&saved.y.includes(4010));assert.equal(saved.p['sentinel-old'].correct,2);assert.equal(saved.legacy,'keep');assert.ok(saved.h.length>=12);
  await page.getByRole('button',{name:'以前の範囲・全教材',exact:true}).click();await page.getByText('以前の範囲・全教材（中間試験対策）',{exact:true}).waitFor();
  await page.getByRole('button',{name:'クラス選択へ',exact:true}).click();await page.locator(`[data-current-term="${RELEASE}"]`).waitFor();
  assert.deepEqual(errors,[]);await context.close();
 }
 await fs.writeFile(`${out}/report.json`,JSON.stringify({base,passed:true,results},null,2));
 console.log(JSON.stringify({base,passed:true,results},null,2));
} finally {await browser.close();}
