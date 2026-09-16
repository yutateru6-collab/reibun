import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type Page } from 'playwright';
import { HOPE_LESSONS, HOPE_JAPANESE_FIRST_KEY } from '../src/hope/lessons';
import { CONTENT_VERSION } from '../src/data/exam_source_ledger';
import { QUESTION_BANK } from '../src/workbook/bank';
import { makeWorksheet, HISTORY_KEY, MISTAKES_KEY } from '../src/workbook/model';
const BASE=process.env.APP_URL || 'http://127.0.0.1:4173';
const OUT=process.env.QA_OUT || 'audit/unified-lessons';
const engine=process.env.BROWSER || 'chromium';
const FAV=`flashcard-favorites:${CONTENT_VERSION}`, YET=`flashcard-yet-list:${CONTENT_VERSION}`;
const favorites=[4001,4201,3301], yet=[4002,4202];
const history=makeWorksheet(QUESTION_BANK,{unit:'both',format:'all',counts:{original:3,transformed:1,application:1},shuffle:true,shuffleChoices:true,grouping:'sections'},123);
const historyJSON=JSON.stringify([history]);
const norm=(text:string)=>text.replace(/[\[\]]/g,'').replace(/\s+/g,' ').trim();
async function bodyIncludesAny(p:Page,texts:string[]) { const body=norm(await p.locator('body').innerText()); return texts.some(text=>body.includes(norm(text))); }
async function widthOK(p:Page) {
  const [viewport,width]=await p.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
  assert(width<=viewport+2,`horizontal overflow ${width}/${viewport}`);
}
async function menu(p:Page) { await p.getByRole('button',{name:'学習モード選択へ戻る',exact:true}).click(); await p.locator('[data-ui=hope-lesson-menu]').waitFor(); }
const report:object[]=[];
for(const [width,dark] of [[320,false],[390,true],[1280,false]] as const) {
  const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{});
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,locale:'ja-JP'});
  await ctx.addInitScript(({favKey,yetKey,historyKey,mistakesKey,historyValue,darkMode})=>{
    if(sessionStorage.getItem('unified-seeded'))return;
    localStorage.setItem(favKey,JSON.stringify([4001,4201,3301]));
    localStorage.setItem(yetKey,JSON.stringify([4002,4202]));
    localStorage.setItem('flashcard-dark-mode',JSON.stringify(darkMode));
    localStorage.setItem('flashcard-back-default','true'); // legacy setting must not reveal a new cloze answer
    localStorage.setItem('flashcard-shuffle','false');
    localStorage.setItem(historyKey,historyValue);
    localStorage.setItem(mistakesKey,JSON.stringify(['application-01']));
    sessionStorage.setItem('unified-seeded','1');
  },{favKey:FAV,yetKey:YET,historyKey:HISTORY_KEY,mistakesKey:MISTAKES_KEY,historyValue:historyJSON,darkMode:dark});
  const p=await ctx.newPage(); p.setDefaultTimeout(8000);
  const errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));
  const dir=path.join(OUT,`${engine}-${width}`); fs.mkdirSync(dir,{recursive:true});
  try {
    await p.goto(BASE); await p.locator('[data-ui=workbook-launcher]').waitFor();
    assert.match(await p.locator('[data-ui=workbook-launcher]').innerText(),/時制・完了形\s*強化練習/);
    assert.equal(await p.locator('[data-ui=exam-quiz-hub]').count(),0);
    await p.screenshot({path:path.join(dir,'home.png'),fullPage:true});
    await p.getByRole('button',{name:/基本例文.*マスター/s}).click();
    assert.equal(await p.locator('[data-ui=class29-previous-range] [data-previous-range]').count(),4);
    assert.match(await p.locator('[data-ui=class29-previous-range]').innerText(),/2-9 前回の暗唱範囲/);
    assert.match(await p.locator('[data-ui=class29-previous-range]').innerText(),/比較・関係詞・仮定法/);
    assert.match(await p.locator('[data-previous-range=class29-previous-all]').innerText(),/58文.*毎回シャッフル/s);
    assert.match(await p.locator('[data-ui=hope-section-header]').innerText(),/Hope 基本例文.*2-3用.*2-3の暗唱例文/s);
    assert.equal(await p.locator('[data-ui=hope-lesson-list] > button').count(),12);
    assert.equal(await p.getByRole('button',{name:/公式穴埋め（54）|例文（110）/}).count(),0);
    await p.screenshot({path:path.join(dir,'lesson-list.png'),fullPage:true});
    for(const [i,lesson] of HOPE_LESSONS.entries()) {
      await p.locator(`[data-ui=hope-lesson-list] [data-lesson="${lesson.id}"]`).click();
      const area=p.locator('[data-ui=hope-lesson-menu]');
      assert.equal(await area.getByRole('heading',{level:1}).innerText(),lesson.title);
      assert.equal(await p.locator('[data-ui=hope-primary-modes] button').count(),i<6?3:2);
      assert.equal(await p.getByRole('button',{name:/答えから覚える|単語カード/}).count(),0);
      assert.equal(await p.getByRole('button',{name:'タイムアタック開始',exact:true}).isVisible(),false);
      await widthOK(p);
      if(i===0||i===6) await p.screenshot({path:path.join(dir,`lesson-${i+1}.png`),fullPage:true});
      await p.locator('[data-mode=learn]').click();
      assert.equal(await p.locator('[data-ui=hope-study-card]').getAttribute('data-card-id'),String(lesson.examples.cards[0].id));
      assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(lesson.examples.cards[0].front));
      assert.equal(await p.locator('[data-ui=hope-card-secondary]').count(),0,'Japanese answer leaked on English-first question');
      await p.getByRole('button',{name:'タップして日本語訳を見る',exact:true}).click();
      assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(lesson.examples.cards[0].translation));
      await p.getByRole('button',{name:'ミニ解説を見る',exact:true}).click();
      assert.equal(await p.locator(`#hope-comment-${lesson.examples.cards[0].id}`).innerText(),lesson.examples.cards[0].comment);
      await widthOK(p);
      await menu(p);
      if(lesson.cloze) {
        await p.locator('[data-mode=cloze]').click();
        assert.equal(await p.getByRole('button',{name:'日本語から見る',exact:true}).count(),0);
        assert.equal(await p.locator('[data-ui=hope-study-card]').getAttribute('data-revealed'),'false');
        assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(lesson.cloze.cards[0].front));
        assert.equal(norm(await p.locator('[data-ui=hope-card-secondary]').innerText()),norm(lesson.cloze.cards[0].translation));
        await p.getByRole('button',{name:'タップして解答を見る',exact:true}).click();
        assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(lesson.cloze.cards[0].back.replace(/[\[\]]/g,'')));
        if(i===0) await p.screenshot({path:path.join(dir,'cloze-answer.png'),fullPage:true});
        await menu(p);
        assert.equal(await p.locator('[data-ui=hope-lesson-menu] h1').innerText(),lesson.title);
      }
      await p.locator('[data-mode=order]').click();
      // Starting order after cloze must use the full sentence in the same Lesson, not a stale test deck.
      assert(await bodyIncludesAny(p,lesson.examples.cards.map(card=>card.translation)),'order mode must stay inside the selected Lesson after shuffle');
      await menu(p);
      await p.getByRole('button',{name:'教材一覧へ戻る',exact:true}).click();
    }
    // Direction preference changes the face, not the index, and never overwrites old settings.
    await p.locator('[data-ui=hope-lesson-list] [data-lesson=hope-lesson1]').click();
    await p.locator('[data-mode=learn]').click();
    await p.getByRole('button',{name:'次のカードへ',exact:true}).click();
    await p.getByRole('button',{name:'日本語から見る',exact:true}).click();
    assert.equal(await p.locator('[data-ui=hope-study-card]').getAttribute('data-card-id'),'4002');
    assert.equal(await p.locator('[data-ui=hope-card-secondary]').count(),0);
    assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(HOPE_LESSONS[0].examples.cards[1].translation));
    await p.getByRole('button',{name:'タップして英文を見る',exact:true}).click();
    assert.equal(norm(await p.locator('[data-ui=hope-card-main]').innerText()),norm(HOPE_LESSONS[0].examples.cards[1].back));
    await p.getByRole('button',{name:'次のカードへ',exact:true}).click();
    assert.equal(await p.locator('[data-ui=hope-study-card]').getAttribute('data-revealed'),'false');
    await p.screenshot({path:path.join(dir,'japanese-first.png'),fullPage:true});
    await menu(p);
    await p.locator('[data-ui=hope-more-practice] summary').click();
    await p.getByLabel('その他の練習の出題内容').selectOption('cloze');
    await p.getByRole('button',{name:/自己申告テスト/}).click();
    assert(await bodyIncludesAny(p,HOPE_LESSONS[0].cloze!.cards.map(card=>card.front)),'self-test must show a cloze prompt from the selected Lesson after shuffle');
    await menu(p);
    await p.locator('[data-ui=hope-more-practice] summary').click();
    await p.getByLabel('その他の練習の出題内容').selectOption('cloze');
    await p.getByLabel('問題を考える時間').selectOption('3');
    await p.getByLabel('答えを表示する時間').selectOption('1');
    await p.getByRole('button',{name:'タイムアタック開始',exact:true}).click();
    assert(await bodyIncludesAny(p,HOPE_LESSONS[0].cloze!.cards.map(card=>card.front)),'time attack must show a cloze prompt from the selected Lesson after shuffle');
    await menu(p);
    await p.getByRole('button',{name:'ホームへ戻る',exact:true}).click();
    assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)!),FAV),favorites);
    assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)!),YET),yet);
    assert.equal(await p.evaluate(k=>localStorage.getItem(k),HISTORY_KEY),historyJSON);
    assert.equal(await p.evaluate(()=>localStorage.getItem('flashcard-back-default')),'true');
    await p.reload();
    await p.getByRole('button',{name:/基本例文.*マスター/s}).click();
    await p.locator('[data-ui=hope-lesson-list] [data-lesson=hope-lesson1]').click();
    await p.locator('[data-mode=learn]').click();
    assert.equal(await p.getByRole('button',{name:'日本語から見る',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await p.evaluate(k=>localStorage.getItem(k),HOPE_JAPANESE_FIRST_KEY),'true');
    // Keyboard access: the card itself is a real button, separate from the explanation controls.
    await p.getByRole('button',{name:'タップして英文を見る',exact:true}).focus();await p.keyboard.press('Enter');
    assert.equal(await p.locator('[data-ui=hope-study-card]').getAttribute('data-revealed'),'true');
    await widthOK(p);assert.deepEqual(errors,[]);
    report.push({engine,width,dark,ok:true,lessons:12,oldProgressPreserved:true});
    console.log(`PASS ${engine} ${width}: all lessons, directions, original cloze, advanced modes, storage`);
  } catch(e) { await p.screenshot({path:path.join(dir,'failure.png'),fullPage:true});report.push({engine,width,dark,ok:false,error:String(e),errors});console.error(e); }
  finally { await browser.close(); }
}
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,`${engine}-report.json`),JSON.stringify(report,null,2));
if(report.some((r:any)=>!r.ok))process.exit(1);
