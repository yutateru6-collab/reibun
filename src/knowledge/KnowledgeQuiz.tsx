import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Home, ChevronLeft } from 'lucide-react';
import { useDialog } from '../workbook/useDialog';
import { QUESTIONS, BY_ID, STAGES, SETS, FORMATS, STORAGE_KEY, VERSION, readProgress, startSession, reviewIds, autoGrade, answerLabel, type Grade, type Response } from './model';
import './knowledge.css';

const instructions = {
  tf: '正しければ○、間違いなら×を選ぼう。',
  teacher: '一番よい説明・答えを１つ選ぼう。',
  repair: '〔　〕の中だけを、正しい言葉に直そう。',
  classify: '現在完了形で表すときの意味を選ぼう。',
  parts: '空欄に合うパーツを１つ選ぼう。',
  timeline: '先に起きたものから順番にタップしよう。',
  match: '教材の代表的な用法・形と対応させよう。',
  recall: '何も見ずに、空欄に入る言葉を答えよう。',
};
function Prompt({ text }: { text: string }) {
  return <>{text.split(/(〔[^〕]*〕)/g).map((part, i) => part.startsWith('〔') ? <strong className="tk-repair" key={i}>{part}</strong> : <span key={i}>{part}</span>)}</>;
}
export default function KnowledgeQuiz() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#knowledge');
  const [view, setView] = useState<'setup' | 'practice' | 'result'>('setup');
  const [progress, setProgress] = useState(readProgress);
  const [notice, setNotice] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const session = progress.session;
  const question = session ? BY_ID.get(session.ids[session.index]) : undefined;
  const response = question && session ? session.responses[question.id] ?? {} : {};
  const review = reviewIds(progress);
  const studied = Object.keys(progress.grades).length;
  const correct = Object.values(progress.grades).filter(g => g === 'correct').length;

  useEffect(() => {
    const sync = () => { const node = document.querySelector<HTMLElement>('[data-ui="compact-home-bento-v1"] .grid.grid-cols-2'); setTarget(old => old === node ? old : node); };
    sync(); const observer = new MutationObserver(sync); const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onHash = () => { if (location.hash === '#knowledge') { setOpen(true); setView('setup'); } else setOpen(false); };
    window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { setNotice('このブラウザでは進み具合を保存できません。練習は続けられますが、画面を再読み込みすると消えます。'); }
  }, [progress]);
  function close() {
    setOpen(false);
    if (location.hash === '#knowledge') history.replaceState(null, '', location.pathname + location.search);
  }
  useDialog(open, close, '[data-ui="knowledge-dialog"]');
  // Finish navigation focus before the next paint. A delayed animation-frame
  // focus can steal an input event when the next question is answered quickly.
  useLayoutEffect(() => {
    if (!open) return;
    mainRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [open, view, question?.id]);
  function launch() { setOpen(true); setView('setup'); history.replaceState(null, '', location.pathname + location.search + '#knowledge'); }
  function begin(start: number) {
    const set = SETS.find(s => s.start === start); if (!set) return;
    const ids = QUESTIONS.filter(q => q.number >= set.start && q.number <= set.end).map(q => q.id);
    setProgress(p => ({ ...p, session: startSession(ids, `第${set.start}〜${set.end}問`, set.end < 102 ? set.end + 1 : null) }));
    setView('practice');
  }
  function beginReview(ids = review.slice(0, 6)) {
    if (!ids.length) return;
    setProgress(p => ({ ...p, session: startSession(ids, '間違えた問題・△の復習') })); setView('practice');
  }
  function patchResponse(patch: Partial<Response>) {
    setProgress(p => {
      const s = p.session; if (!s) return p; const id = s.ids[s.index]; const old = s.responses[id] ?? {};
      if (old.revealed) return p;
      return { ...p, session: { ...s, responses: { ...s.responses, [id]: { ...old, ...patch } } } };
    });
  }
  function grade(value: Grade) {
    setProgress(p => {
      const s = p.session; if (!s) return p; const id = s.ids[s.index]; const old = s.responses[id] ?? {};
      if (old.grade) return p;
      return { ...p, grades: { ...p.grades, [id]: value }, session: { ...s, responses: { ...s.responses, [id]: { ...old, revealed: true, grade: value } } } };
    });
  }
  function check() {
    if (!question || response.revealed) return;
    if (question.mode === 'text') { if (response.text?.trim()) patchResponse({ revealed: true }); return; }
    const result = autoGrade(question, response); if (result) grade(result);
  }
  function next() {
    if (!session || !response.grade) return;
    if (session.index === session.ids.length - 1) {
      setProgress(p => p.session ? { ...p, session: { ...p.session, finished: true } } : p); setView('result');
    } else setProgress(p => p.session ? { ...p, session: { ...p.session, index: p.session.index + 1 } } : p);
  }
  function previous() { setProgress(p => p.session ? { ...p, session: { ...p.session, index: Math.max(0, p.session.index - 1) } } : p); }
  function toggleFlag() {
    if (!question) return;
    setProgress(p => ({ ...p, flagged: p.flagged.includes(question.id) ? p.flagged.filter(id => id !== question.id) : [...p.flagged, question.id] }));
  }
  const canCheck = !!question && !response.revealed && (question.mode === 'text' ? !!response.text?.trim() : autoGrade(question, response) !== null);
  const launcher = target ? createPortal(<button type="button" data-ui="knowledge-launcher" onClick={launch} className="col-span-1 rounded-2xl sm:rounded-3xl border-2 border-violet-200 dark:border-violet-900/50 bg-white dark:bg-slate-800 p-4 sm:p-6 text-center shadow-sm hover:border-violet-500 transition-colors min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center">
    <span className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200 mb-2.5 flex items-center justify-center"><Brain size={26} /></span>
    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">文法の<br />知識チェック</span>
    <span className="mt-1 text-xs text-slate-600 dark:text-slate-300">時制102問・日本語で確認</span>
  </button>, target) : null;

  return <>{launcher}{open && createPortal(<div className="tk-root" data-ui="knowledge-dialog" data-version={VERSION} role="dialog" aria-modal="true" aria-label="文法の知識チェック">
    <header className="tk-header">
      <button className="tk-title" type="button" onClick={() => setView('setup')} aria-label="知識チェックの一覧へ">文法の知識チェック<small>時制・完了形①②｜102問</small></button>
      <button className="tk-icon" type="button" onClick={close} aria-label="ホームへ戻る"><Home size={23} /></button>
    </header>
    <main className="tk-main" ref={mainRef}>
      <div className="tk-container">
        {notice && <p className="tk-notice" role="status">{notice}</p>}
        {view === 'setup' && <>
          <section className="tk-intro">
            <span className="tk-eyebrow">大きな考え方 → 基本 → 使い分け → 注意点</span>
            <h1 ref={headingRef} tabIndex={-1}>まずは６問。<br />意味から、少しずつ。</h1>
            <p>英文を作る前の知識を、日本語で確かめよう。プリントと同じ問題番号・内容で進めます。</p>
            <div className="tk-stats"><strong>確認した問題　{studied} / 102</strong><span>現在の正答 {correct}問（記述は自己採点）</span></div>
            <progress value={studied} max={102} aria-label="確認した問題数" />
            <div className="tk-actions">
              {session && !session.finished && <button type="button" className="tk-btn tk-primary" data-action="resume" onClick={() => setView('practice')}>続きから（第{BY_ID.get(session.ids[session.index])!.number}問）</button>}
              <button type="button" className={`tk-btn ${session && !session.finished ? '' : 'tk-primary'}`} onClick={() => begin(1)}>はじめの６問へ</button>
              <button type="button" className="tk-btn" disabled={!review.length} data-action="review" onClick={() => beginReview()}>間違い・△を復習（{Math.min(6, review.length)}問）</button>
            </div>
            <p className="tk-small">○×・４択・まちがい直し・仲間分け・パーツ・並べかえ・ペア合わせ・穴埋め。速さは競いません。</p>
          </section>
          <div className="tk-stage-grid">{STAGES.map(stage => {
            const pool = QUESTIONS.filter(q => q.stage === stage.id); const count = pool.filter(q => !!progress.grades[q.id]).length;
            return <section className="tk-stage" key={stage.id}>
              <span className="tk-eyebrow">STEP {stage.id}　{pool.length}問</span>
              <h2>{stage.title}</h2><p>{stage.description}</p>
              <progress max={pool.length} value={count} aria-label={`STEP ${stage.id}の確認数`} /><small>{count} / {pool.length}問を確認</small>
              <div className="tk-sets">{SETS.filter(s => s.stage === stage.id).map(s => <button type="button" className="tk-btn" key={s.start} data-start={s.start} onClick={() => begin(s.start)}>{s.start}〜{s.end}問</button>)}</div>
            </section>;
          })}</div>
          <p className="tk-small">別のセットを始めると、途中の入力はそのセットに切り替わります。解答済みの記録と△は残ります。保存先はこのブラウザのみで、端末間では同期しません。</p>
        </>}
        {view === 'practice' && session && question && <>
          <div className="tk-progress-row"><span>STEP {question.stage} · {session.title}</span><strong>{session.index + 1} / {session.ids.length}</strong></div>
          <progress value={session.ids.filter(id => session.responses[id]?.grade).length} max={session.ids.length} aria-label="このセットの進み具合" />
          <article key={question.id} className="tk-question" data-question={question.number} data-format={question.format}>
            <div className="tk-qmeta"><span>第{question.number}問　{FORMATS[question.format]}</span><label className="tk-flag"><input type="checkbox" checked={progress.flagged.includes(question.id)} onChange={toggleFlag} />△ 迷った</label></div>
            <p className="tk-instruction">{instructions[question.format]}</p>
            <h1 className="tk-prompt" ref={headingRef} tabIndex={-1}><Prompt text={question.prompt} /></h1>
            {question.mode === 'choice' && <div className={`tk-choices ${question.format === 'tf' ? 'tk-tf' : ''}`} role="group" aria-label="選択肢">{question.choices!.map((choice, i) => <button type="button" key={i} data-choice={i} className={`tk-choice ${response.choice === i ? 'is-selected' : ''} ${response.revealed && question.answer === i ? 'is-correct' : ''}`} disabled={!!response.revealed} aria-pressed={response.choice === i} onClick={() => patchResponse({ choice: i })}><b>{question.format === 'tf' ? choice : String.fromCharCode(65 + i)}</b>{question.format !== 'tf' && <span>{choice}</span>}{response.revealed && question.answer === i && <span className="tk-correct-label">正答</span>}</button>)}</div>}
            {question.mode === 'order' && <div className="tk-order">
              <div className="tk-order-result" aria-live="polite">先 → 後：{response.order?.length ? response.order.map(i => String.fromCharCode(65 + i)).join(' → ') : 'まだ選んでいません'}</div>
              <div className="tk-choices">{question.choices!.map((choice, i) => <button type="button" key={i} data-order={i} className={`tk-choice ${response.order?.includes(i) ? 'is-selected' : ''}`} disabled={!!response.revealed || !!response.order?.includes(i)} onClick={() => patchResponse({ order: [...(response.order ?? []), i] })}><b>{String.fromCharCode(65 + i)}</b><span>{choice}</span></button>)}</div>
              <button type="button" className="tk-btn" disabled={!!response.revealed || !response.order?.length} onClick={() => patchResponse({ order: [] })}>並びを選び直す</button>
            </div>}
            {question.mode === 'text' && <label className="tk-input-label">あなたの答え<textarea value={response.text ?? ''} rows={2} maxLength={500} autoComplete="off" spellCheck={false} disabled={!!response.revealed} onChange={e => patchResponse({ text: e.target.value })} placeholder="短い言葉で答えよう" /></label>}
            {(question.format === 'match' || (question.number >= 61 && question.number <= 65)) && <p className="tk-small">教材の代表的な使い方との対応です。同じ場面を別の形で言える場合もあります。</p>}
            {!response.revealed && <div className="tk-actions"><button type="button" className="tk-btn tk-primary" data-action="check" disabled={!canCheck} onClick={check}>答えを確かめる</button><button type="button" className="tk-btn" data-action="unknown" onClick={() => grade('incorrect')}>わからない・解説を見る</button></div>}
            {response.revealed && <section className={`tk-feedback ${response.grade === 'incorrect' ? 'needs-review' : ''}`} data-ui="knowledge-feedback" role="status">
              <h2>{response.grade === 'correct' ? '正解！' : response.grade === 'incorrect' ? 'ここを確認しよう' : '答えを見比べよう'}</h2>
              <p className="tk-answer"><strong>{question.mode === 'text' ? '解答例：' : '正答：'}{answerLabel(question)}</strong></p>
              <p>{question.explanation}</p>
              {question.mode === 'text' && !response.grade && <><p className="tk-small">自己採点：表現が違っても、意味が合っていれば正解にしよう。</p><div className="tk-actions"><button type="button" className="tk-btn tk-primary" data-action="self-correct" onClick={() => grade('correct')}>合っていた</button><button type="button" className="tk-btn" data-action="self-incorrect" onClick={() => grade('incorrect')}>もう一度練習する</button></div></>}
            </section>}
          </article>
        </>}
        {view === 'result' && session && <section className="tk-result">
          <span className="tk-eyebrow">{session.title}　おつかれさま！</span>
          <h1 ref={headingRef} tabIndex={-1}>{session.ids.filter(id => session.responses[id]?.grade === 'correct').length} / {session.ids.length} 問 正解</h1>
          <p>記述問題の結果には自己採点を含みます。間違えたところは、説明を見直してからもう一度。</p>
          <div className="tk-actions">
            {session.nextStart && <button type="button" className="tk-btn tk-primary" onClick={() => begin(session.nextStart!)}>次の６問へ</button>}
            <button type="button" className="tk-btn" disabled={!session.ids.some(id => session.responses[id]?.grade === 'incorrect')} onClick={() => beginReview(session.ids.filter(id => session.responses[id]?.grade === 'incorrect'))}>今回の間違いを復習</button>
            <button type="button" className="tk-btn" onClick={() => setView('setup')}>一覧へ戻る</button>
          </div>
          <div className="tk-result-list">{session.ids.map(id => { const q = BY_ID.get(id)!; return <details key={id}><summary>第{q.number}問　{session.responses[id]?.grade === 'correct' ? '○' : '要復習'}　{FORMATS[q.format]}</summary><p><Prompt text={q.prompt} /></p><p><strong>{answerLabel(q)}</strong></p><p>{q.explanation}</p></details>; })}</div>
        </section>}
      </div>
    </main>
    {view === 'practice' && session && <footer className="tk-footer"><button type="button" className="tk-btn" onClick={() => setView('setup')}>中断・一覧</button><button type="button" className="tk-btn tk-back" aria-label="前の問題" disabled={session.index === 0} onClick={previous}><ChevronLeft size={20} /></button><button type="button" className="tk-btn tk-primary" data-action="next" disabled={!response.grade} onClick={next}>{session.index === session.ids.length - 1 ? '結果を見る' : '次の問題へ'}</button></footer>}
  </div>, document.body)}</>;
}
