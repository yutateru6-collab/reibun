import HopeStudyCard from '../hope/StudyCard';
import { useStudyCardFocus } from '../lib/use-study-card-focus';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, Moon, Star, Sun, GraduationCap, FilePenLine, Shuffle, ClipboardCheck } from 'lucide-react';
import { TOPICS, type Topic } from './grammar';
import { CLASSES, RELEASE, FAVORITES_KEY, NEW_FAVORITES_KEY, PROGRESS_KEY, HISTORY_KEY, YET_KEY,
  classItems, unitTitle, canonical, cloze, checkCloze, checkOrder, orderTokens, shuffled, finalSample,
  readStored, writeStored, acceptedAnswers, type ClassId, type Item, type Mode, type Progress, type Attempt, type History } from './model';

const btn='min-h-11 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-indigo-500';
const primary=btn+' bg-indigo-600 !border-indigo-600 text-white hover:!bg-indigo-700';
const panel='rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-sm';
type Screen='classes'|'range'|'menu'|'session'|'result';
type Question={item:Item;kind:'cloze'|'order'};

export default function TermRoot({children}:{children:ReactNode}) {
  const [legacy,setLegacy]=useState(()=>Boolean(window.location.hash));
  useEffect(()=>{const f=()=>setLegacy(Boolean(window.location.hash));window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f);},[]);
  const previous=()=>{window.location.hash='previous';setLegacy(true);};
  const current=()=>{window.location.hash='';setLegacy(false);};
  if(legacy)return <><div className="border-b border-slate-300 bg-white/95 dark:bg-slate-900 dark:text-white p-3 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">以前の範囲・全教材（中間試験対策）</span><button className={btn} onClick={current}>クラス選択へ</button></div>{children}</>;
  return <CurrentTerm onPrevious={previous}/>;
}

function CurrentTerm({onPrevious}:{onPrevious:()=>void}) {
  const [screen,setScreen]=useState<Screen>('classes');
  const [classId,setClassId]=useState<ClassId>('2-3');
  const [unit,setUnit]=useState('all');
  const [mode,setMode]=useState<Mode>('cards');
  const [direction,setDirection]=useState(false);
  const [random,setRandom]=useState(false);
  const [amount,setAmount]=useState(20);
  const [questions,setQuestions]=useState<Question[]>([]);
  const [index,setIndex]=useState(0);
  const [input,setInput]=useState('');
  const [tokens,setTokens]=useState<{id:number;text:string}[]>([]);
  const [chosen,setChosen]=useState<number[]>([]);
  const [revealed,setRevealed]=useState(false);
  const [commentOpen,setCommentOpen]=useState(false);
  const [verdict,setVerdict]=useState<boolean|null>(null);
  const [selfChecked,setSelfChecked]=useState(false);
  const [attempts,setAttempts]=useState<Attempt[]>([]);
  const [progress,setProgress]=useState<Progress>(()=>readStored(PROGRESS_KEY,{}));
  const [favorites,setFavorites]=useState<number[]>(()=>readStored(FAVORITES_KEY,[]));
  const [newFavorites,setNewFavorites]=useState<string[]>(()=>readStored(NEW_FAVORITES_KEY,[]));
  const [history,setHistory]=useState<History[]>(()=>readStored(HISTORY_KEY,[]));
  const [storageWarning,setStorageWarning]=useState(false);
  const [dark,setDark]=useState(()=>readStored('flashcard-dark-mode',false));
  const [exitConfirm,setExitConfirm]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const config=CLASSES[classId];
  const all=classItems(classId);
  const favorite=(item:Item)=>item.originalId?favorites.includes(item.originalId):newFavorites.includes(item.id);
  const selected=all.filter(item=>unit==='all'||unit===item.unit||(unit==='favorites'&&favorite(item))||(unit==='wrong'&&progress[item.id]?.lastCorrect===false));
  const q=questions[index];
  const current=q?.item;
  const studyRef=useStudyCardFocus(screen==='session'&&mode==='cards',`${screen}:${mode}:${current?.id}:${index}`);
  const unitName=unit==='all'?'全範囲':unit==='favorites'?'お気に入り':unit==='wrong'?'間違えた問題':unitTitle(unit);
  const save=(key:string,value:unknown)=>{if(!writeStored(key,value))setStorageWarning(true);};
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);writeStored('flashcard-dark-mode',dark);},[dark]);
  useEffect(()=>{heading.current?.focus();window.scrollTo(0,0);},[screen]);
  function resetQuestion(item:Item) {
    setInput('');setRevealed(false);setVerdict(null);setChosen([]);setSelfChecked(false);setCommentOpen(false);
    setTokens(shuffled(orderTokens(item).map((text,id)=>({id,text}))));
  }
  function start(items=selected,chosenMode:Mode=mode) {
    if(!items.length)return;
    const picked=chosenMode==='final'?finalSample(items,amount):(random?shuffled(items):items);
    setQuestions(picked.map((item,i)=>({item,kind:chosenMode==='order'?'order':chosenMode==='final'&&i%2===1?'order':'cloze'})));
    resetQuestion(picked[0]);setMode(chosenMode);setIndex(0);setAttempts([]);setScreen('session');setExitConfirm(false);
  }
  function record(correct:boolean,manual=false) {
    const entry={id:current.id,correct,kind:q.kind,selfChecked:manual};
    const nextProgress={...progress,[current.id]:{correct:(progress[current.id]?.correct||0)+(correct?1:0),attempts:(progress[current.id]?.attempts||0)+1,lastCorrect:correct}};
    setProgress(nextProgress);save(PROGRESS_KEY,nextProgress);
    if(!correct&&current.originalId){const yet=readStored<number[]>(YET_KEY,[]);if(!yet.includes(current.originalId))save(YET_KEY,[...yet,current.originalId]);}
    const next=[...attempts,entry];setAttempts(next);
    if(index+1<questions.length){resetQuestion(questions[index+1].item);setIndex(index+1);}
    else {
      const h=[{classId,date:new Date().toISOString(),correct:next.filter(a=>a.correct).length,total:next.length,mode},...history].slice(0,30);
      setHistory(h);save(HISTORY_KEY,h);setScreen('result');
    }
  }
  function toggleFavorite(item:Item){
    if(item.originalId){const next=favorite(item)?favorites.filter(x=>x!==item.originalId):[...favorites,item.originalId];setFavorites(next);save(FAVORITES_KEY,next);}
    else {const next=favorite(item)?newFavorites.filter(x=>x!==item.id):[...newFavorites,item.id];setNewFavorites(next);save(NEW_FAVORITES_KEY,next);}
  }
  const title=screen==='classes'?'例文マスター':screen==='range'?config.title:screen==='menu'?unitName:screen==='result'?'学習結果':mode==='cards'?'例文を覚える':mode==='final'?'試験前の最終チェック':mode==='cloze'?'穴埋めで確認':'並べ替えで確認';
  function back(){
    if(screen==='session'){setExitConfirm(true);return;}
    setScreen(screen==='range'?'classes':screen==='menu'?'range':'menu');
  }
  return <div ref={studyRef} className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 px-4 py-5 sm:py-8" data-current-term={RELEASE}>
    <div className={`mx-auto ${screen==='classes'||screen==='range'?'max-w-4xl':'max-w-2xl'}`}>
      <header className="flex items-center gap-3 mb-7">
        {screen!=='classes'&&<button aria-label="戻る" className={btn+' !px-3'} onClick={back}><ArrowLeft size={20}/></button>}
        <div className="flex-1 min-w-0"><p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-1">{screen==='classes'?'九国生徒用':`${config.title} ・ 今回の試験範囲`}</p><h1 ref={heading} tabIndex={-1} className="text-xl sm:text-2xl font-bold outline-none break-words">{title}</h1></div>
        <button aria-label="テーマ切り替え" className={btn+' !px-3'} onClick={()=>setDark(!dark)}>{dark?<Sun size={20}/>:<Moon size={20}/>}</button>
      </header>
      {storageWarning&&<p role="alert" className="mb-4 rounded-lg bg-amber-100 text-amber-900 p-3">このブラウザでは記録を保存できません。画面を閉じると今回の記録が失われる場合があります。</p>}
      {screen==='classes'&&<>
        <p className="mb-5 text-slate-600 dark:text-slate-300">クラスを選んでください。</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">{(Object.keys(CLASSES) as ClassId[]).map(c=><button key={c} onClick={()=>{setClassId(c);setUnit('all');setScreen('range');}} className={panel+' !p-4 sm:!p-7 min-h-[180px] flex flex-col items-center justify-center text-center !border-2 hover:border-indigo-500 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-indigo-500'}><span className={`p-3 rounded-2xl mb-3 ${c==='2-3'?'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300':'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}><GraduationCap size={28}/></span><h2 className="text-xl sm:text-2xl font-black mb-2">{CLASSES[c].title}</h2><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{CLASSES[c].range}</p><span className="flex items-center mt-5 text-sm text-indigo-700 dark:text-indigo-300 font-bold">今回の試験範囲 <ChevronRight size={18}/></span></button>)}</div>
        <button className={btn+' mt-6'} onClick={onPrevious}>以前の範囲・全教材</button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">学習記録はこの端末・ブラウザに保存されます。</p>
      </>}
      {screen==='range'&&<>
        <section className={panel+' mb-5'}><h2 className="font-bold text-lg mb-2">今回の試験範囲</h2><p className="leading-7">{config.range}</p><p className="text-sm text-slate-600 dark:text-slate-300 mt-2">暗唱 {all.filter(x=>x.source==='recitation').length}文 ／ 文法の新作練習 {all.filter(x=>x.source==='original').length}文</p><div className="flex flex-wrap gap-2 mt-4"><button className={primary} onClick={()=>{setUnit('all');setMode('final');setScreen('menu');}}>試験前の最終チェック</button><button className={btn} onClick={()=>{setUnit('all');setMode('cards');setScreen('menu');}}>全範囲を学習</button></div></section>
        <h2 className="text-lg font-bold mb-3">暗唱例文</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">{config.lessons.map(l=><button key={l} className={panel+' !p-4 text-left hover:border-indigo-500'} onClick={()=>{setUnit(`hope-${l}`);setMode('cards');setScreen('menu');}}><span className="font-bold">{unitTitle(`hope-${l}`)}</span><span className="block text-sm text-slate-600 dark:text-slate-300 mt-1">原資料の例文 {all.filter(x=>x.lesson===l).length}文</span></button>)}</div>
        <h2 className="text-lg font-bold mb-3">文法の確認と練習</h2>
        <div className="space-y-3">{config.topics.map(t=><button key={t} className={panel+' !p-4 w-full text-left hover:border-indigo-500'} onClick={()=>{setUnit(t);setMode('cards');setScreen('menu');}}><span className="font-bold">{TOPICS[t].title}</span><span className="block text-sm text-slate-600 dark:text-slate-300 mt-1">{TOPICS[t].source}の項目に対応・新作{all.filter(x=>x.unit===t).length}文</span></button>)}</div>
        <div className="flex flex-wrap gap-2 mt-6">{(['favorites','wrong'] as const).map(f=><button key={f} className={btn} onClick={()=>{setUnit(f);setMode('cloze');setScreen('menu');}}>{f==='favorites'?'お気に入り':'間違えた問題'}</button>)}<button className={btn} onClick={onPrevious}>以前の範囲・全教材</button></div>
        {history.some(x=>x.classId===classId)&&<section className="mt-6"><h2 className="font-bold mb-2">最近の学習記録</h2><ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">{history.filter(x=>x.classId===classId).slice(0,5).map((h,i)=><li key={i}>{new Date(h.date).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}　{h.mode==='cards'?'確認できた':h.mode==='final'?'最終チェック':'練習'} {h.correct} / {h.total}</li>)}</ul></section>}
        <details className="mt-6 text-sm text-slate-600 dark:text-slate-300"><summary className="cursor-pointer min-h-11 py-3">資料・範囲の確認状況</summary><div className="space-y-2 leading-7"><p>暗唱例文：VQⅡ Hope 基本例文一覧＆日本語訳。英文・和訳・番号は原資料の表記を保持しています。穴埋め・並べ替えは原文の形式変更です。</p><p>文法の説明・確認例文・練習文は独自作成です。教科書の暗唱例文には含めません。</p><p>{classId==='2-9'?'11月3日受領の範囲表画像と、教科書の見出しを照合。範囲表画像の切り抜きにはクラス名の記載はありません。':'形容詞・関係詞は11月7日の本人指示、暗唱⑤〜⑧はクラス別教材案内と今回の指定に基づきます。正式な範囲表そのものは未確認です。'}</p><p>⑦・⑧を含め、暗唱の指定範囲と文法の指定範囲は別々に扱っています。原資料の和訳に不自然な表現がある場合も、本文を勝手に修正していません。</p></div></details>
      </>}
      {screen==='menu'&&<>
        {TOPICS[unit as Topic]&&<section className={panel+' mb-5'}><h2 className="font-bold mb-2">確認ポイント</h2><p className="leading-8">{TOPICS[unit as Topic].summary}</p></section>}
        <p className="text-sm mb-4 text-slate-600 dark:text-slate-300">{selected.length}文を学習します。{unit.startsWith('hope-')?'暗唱の英文・和訳は原資料のままです。':''}</p>
        <div className="space-y-3">{([['cards','例文を覚える','英語・日本語を切り替えて確認'],['cloze','穴埋めで確認','空欄に入る語句を入力'],['order','並べ替えで確認','語句を選んで英文を組み立てる'],['final','試験前の最終チェック','穴埋めと並べ替えを出題']] as const).map(([m,label,desc])=><button key={m} disabled={!selected.length} className={panel+` block w-full !p-4 text-left ${mode===m?'!border-indigo-600 ring-1 ring-indigo-600':''}`} onClick={()=>m==='final'?setMode(m):start(selected,m)}><span className={`flex items-center gap-4 ${m==='cards'?'text-blue-700 dark:text-blue-300':m==='cloze'?'text-emerald-700 dark:text-emerald-300':m==='order'?'text-amber-700 dark:text-amber-300':'text-purple-700 dark:text-purple-300'}`}><span className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900">{m==='cards'?<BookOpen size={27}/>:m==='cloze'?<FilePenLine size={27}/>:m==='order'?<Shuffle size={27}/>:<ClipboardCheck size={27}/>}</span><span className="flex-1"><span className="block text-lg font-black text-slate-900 dark:text-slate-100">{label}</span><span className="block text-sm font-normal text-slate-600 dark:text-slate-300 mt-1">{desc}</span></span><ChevronRight size={20}/></span></button>)}</div>
        <div className={panel+' mt-5 space-y-4'}>
          {mode==='final'?<label className="flex items-center gap-3">問題数<select aria-label="問題数" value={Math.min(amount,selected.length||1)} onChange={e=>setAmount(Number(e.target.value))} className="min-h-11 rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3">{selected.length>10&&<option value={10}>10問</option>}{selected.length>20&&<option value={20}>20問</option>}<option value={selected.length||1}>すべて（{selected.length}問）</option></select></label>:<label className="flex gap-3 items-center min-h-11"><input type="checkbox" checked={random} onChange={e=>setRandom(e.target.checked)} className="size-5"/>順番をシャッフル</label>}
          {mode==='cards'&&<label className="flex gap-3 items-center min-h-11"><input type="checkbox" checked={direction} onChange={e=>setDirection(e.target.checked)} className="size-5"/>日本語から確認する</label>}
          {mode==='final'&&<button disabled={!selected.length} className={primary+' w-full'} onClick={()=>start()}>学習を始める</button>}
          {!selected.length&&<p role="status" className="text-sm">対象の問題はありません。</p>}
        </div>
      </>}
      {screen==='session'&&current&&<>
        {exitConfirm&&<div role="alert" className={panel+' mb-4'}><p className="mb-3">途中で学習を終了しますか。確定済みの解答の記録は残ります。</p><div className="flex gap-2"><button className={btn} onClick={()=>setExitConfirm(false)}>続ける</button><button className={btn} onClick={()=>{setExitConfirm(false);setScreen('menu');}}>学習を終了</button></div></div>}
        <div className="flex items-center gap-3 mb-3"><p className="flex-1 text-sm text-slate-600 dark:text-slate-300">{index+1} / {questions.length}　{mode==='final'?(q.kind==='cloze'?'穴埋め':'並べ替え'):''}</p><button className={btn+' !px-3'} aria-label={favorite(current)?'お気に入り解除':'お気に入り登録'} aria-pressed={favorite(current)} onClick={()=>toggleFavorite(current)}><Star size={20} fill={favorite(current)?'currentColor':'none'}/></button></div>
        <progress aria-label="進み具合" value={index+1} max={questions.length} className="w-full h-2 mb-5 accent-indigo-600"/>
        <article className={mode==='cards'?'':panel} data-item-id={current.id}>
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">{current.source==='recitation'?'暗唱例文・原資料':'文法練習・新作'}{mode!=='cards'&&current.source==='recitation'?'（形式変更）':''}</div>
          <h2 className="font-bold mb-5">{current.label}<span className="block text-xs font-normal mt-1 text-slate-500 dark:text-slate-400">{unitTitle(current.unit)}</span></h2>
          {mode==='cards'?<>
            <div className="flex gap-2 mb-5" role="group" aria-label="例文の表示方向">{[false,true].map(japanese=><button key={String(japanese)} aria-pressed={direction===japanese} className={(direction===japanese?primary:btn)+' flex-1'} onClick={()=>{setDirection(japanese);setRevealed(false);setCommentOpen(false);}}>{japanese?'日本語から見る':'英語から見る'}</button>)}</div>
            <div data-ui="study-card-focus"><HopeStudyCard card={{id:current.originalId||100000+index,front:current.en,back:current.en,translation:current.ja,comment:current.explanation,hint:''}} cloze={false} japaneseFirst={direction} revealed={revealed} commentOpen={commentOpen} onFlip={()=>{setRevealed(!revealed);setCommentOpen(false);}} onComment={()=>setCommentOpen(!commentOpen)}/></div>
            <div className="flex items-center justify-between gap-4 mt-5"><button aria-label="前のカードへ" className={btn+' !rounded-full !p-4'} onClick={()=>{const n=(index-1+questions.length)%questions.length;resetQuestion(questions[n].item);setIndex(n);}}><ArrowLeft size={24}/></button><button aria-label="次のカードへ" className={primary+' !rounded-full !p-4'} onClick={()=>{const n=(index+1)%questions.length;resetQuestion(questions[n].item);setIndex(n);}}><ChevronRight size={24}/></button></div>
          </>:<>
            <p className="leading-8 mb-5">{current.ja}</p>
            {q.kind==='cloze'?<form onSubmit={e=>{e.preventDefault();if(verdict===null){setVerdict(checkCloze(current,input));setRevealed(true);}}}>
              <p className="text-xl sm:text-2xl leading-relaxed break-words mb-5" data-testid="cloze-prompt">{cloze(current)}</p>
              <label className="block text-sm mb-2" htmlFor="answer">空欄に入る語句</label><input id="answer" value={input} readOnly={verdict!==null} onChange={e=>setInput(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} className="w-full rounded-xl border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 px-4 py-3 text-lg"/>
              {current.alternatives.includes('')&&<p className="text-xs text-slate-500 dark:text-slate-400 mt-2">省略できる場合は「省略」と入力してください。</p>}
              {verdict===null&&<div className="flex gap-2 mt-4"><button className={primary} type="submit" disabled={!input.trim()}>答え合わせ</button><button type="button" className={btn} onClick={()=>{setVerdict(false);setRevealed(true);}}>解答を見る</button></div>}
            </form>:<>
              <p className="text-sm mb-3 text-slate-600 dark:text-slate-300">すべての語句を1回ずつ使ってください。選んだ語句を押すと戻せます。</p>
              <div data-testid="ordered-answer" aria-label="組み立てた英文" className="min-h-24 p-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 flex gap-2 flex-wrap mb-4">{chosen.map(id=><button key={id} disabled={verdict!==null} className={btn+' bg-indigo-50 dark:bg-indigo-950'} onClick={()=>setChosen(chosen.filter(x=>x!==id))}>{tokens.find(t=>t.id===id)?.text}</button>)}</div>
              <div aria-label="語群" className="flex flex-wrap gap-2">{tokens.map(t=><button key={t.id} data-token-id={t.id} disabled={chosen.includes(t.id)||verdict!==null} className={btn} onClick={()=>setChosen([...chosen,t.id])}>{t.text}</button>)}</div>
              {verdict===null&&<div className="flex flex-wrap gap-2 mt-5"><button className={primary} disabled={chosen.length!==tokens.length} onClick={()=>{setVerdict(checkOrder(current,chosen.map(id=>tokens.find(t=>t.id===id)!.text)));setRevealed(true);}}>答え合わせ</button><button className={btn} onClick={()=>setChosen([])}>並べ直す</button><button className={btn} onClick={()=>{setVerdict(false);setRevealed(true);}}>解答を見る</button></div>}
            </>}
          </>}
          {revealed&&mode!=='cards'&&<div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-600" aria-live="polite">
            {mode!=='cards'&&<><p className={`font-bold mb-3 ${verdict?'text-emerald-700 dark:text-emerald-300':'text-amber-700 dark:text-amber-300'}`}>{verdict?(selfChecked?'別解として自己確認済み':'正解'):'解答を確認'}</p><p className="text-lg leading-8 break-words" data-testid="model-answer">{canonical(current.en)}</p>{q.kind==='cloze'&&<p className="text-sm mt-3 leading-7">空欄：{acceptedAnswers(current).map(x=>x||'（省略）').join(' ／ ')}</p>}</>}
            <p className="text-sm leading-7 mt-3">{current.explanation}</p>
            {mode!=='cards'&&!verdict&&<div className="mt-4"><p className="text-xs leading-6 text-slate-600 dark:text-slate-300">登録解答と違う別解も考えられます。文法・意味・指定語句を確認し、正しい場合は自己確認として記録できます。</p><button className={btn+' mt-2'} onClick={()=>{setVerdict(true);setSelfChecked(true);}}>別解として正解にする（自己確認）</button></div>}
          </div>}
        </article>
        <div className="mt-5">{mode==='cards'?<div className="flex gap-3 mt-6"><button className={btn+' flex-1'} disabled={!revealed} onClick={()=>record(false,true)}>もう一度</button><button className={primary+' flex-1'} disabled={!revealed} onClick={()=>record(true,true)}>確認できた</button></div>:<button disabled={verdict===null} className={primary+' w-full'} onClick={()=>record(verdict===true,selfChecked)}>{index+1===questions.length?'結果を見る':'次の問題へ'}</button>}</div>
      </>}
      {screen==='result'&&<>
        <section className={panel}><div className="flex items-center gap-3"><Check className="text-indigo-600"/><h2 className="font-bold text-lg">{mode==='cards'?'確認できた文':'正解した問題'}</h2></div><p className="text-4xl font-bold mt-5 mb-3">{attempts.filter(x=>x.correct).length}<span className="text-lg text-slate-500"> / {attempts.length}</span></p><p className="text-sm text-slate-600 dark:text-slate-300">{attempts.filter(x=>x.selfChecked&&x.correct).length}件は自己確認を含みます。</p>
          <div className="mt-5 overflow-x-auto"><table className="w-full text-sm text-left"><caption className="sr-only">単元別の結果</caption><thead><tr><th className="py-3">単元</th><th className="py-3 whitespace-nowrap">正解／出題</th></tr></thead><tbody>{[...new Set<string>(questions.map(x=>x.item.unit))].map(u=>{const ids=new Set(questions.filter(x=>x.item.unit===u).map(x=>x.item.id));const a=attempts.filter(x=>ids.has(x.id));return <tr key={u} className="border-t border-slate-200 dark:border-slate-600"><th className="py-3 pr-3 font-normal">{unitTitle(u)}</th><td>{a.filter(x=>x.correct).length} / {a.length}</td></tr>;})}</tbody></table></div>
        </section>
        <div className="grid sm:grid-cols-2 gap-3 mt-5"><button className={primary} disabled={!attempts.some(x=>!x.correct)} onClick={()=>start(questions.filter(x=>attempts.some(a=>a.id===x.item.id&&!a.correct)).map(x=>x.item),mode)}>間違えた問題を解き直す</button><button className={btn} onClick={()=>setScreen('range')}>今回の試験範囲に戻る</button></div>
      </>}
    </div>
  </div>;
}
