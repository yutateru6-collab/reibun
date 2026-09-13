import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Home, ChevronLeft, ChevronRight, BookOpen, ArrowRight, Check, Circle, RotateCcw, Compass, Clock, History, Link, Repeat, Flag } from 'lucide-react';
import { useDialog } from '../workbook/useDialog';
import { QUESTIONS, BY_ID, STAGES, SETS, FORMATS, STORAGE_KEY, VERSION, readProgress, startSession, reviewIds, autoGrade, answerLabel, type Grade, type Response } from './model';
import { TOPICS, TOPIC_BY_NUMBER, TOPIC_SETS, LESSON_TITLES, pointsForSet, progressFor, recommendedStart, type Point } from './curriculum';
import './knowledge.css';

type View = 'setup' | 'guide' | 'practice' | 'result';
type Tab = 'path' | 'topics' | 'review';
const instructions = {
  tf: '正しければ○、間違いなら×を選ぼう。', teacher: '一番よい説明・答えを１つ選ぼう。',
  repair: '〔　〕の中だけを、正しい言葉に直そう。', classify: '現在完了形で表すときの意味を選ぼう。',
  parts: '空欄に合うパーツを１つ選ぼう。', timeline: '先に起きたものから順番にタップしよう。',
  match: '代表的な用法・形と対応させよう。', recall: '何も見ずに、空欄に入る言葉を答えよう。',
};
function Prompt({ text }: { text: string }) {
  return <>{text.split(/(〔[^〕]*〕|［[^］]*］)/g).map((part, i) => part.startsWith('〔') ? <strong className="tk-repair" key={i}>{part}</strong> : part.startsWith('［') ? <span className="tk-blank" key={i}>{part}</span> : <span key={i}>{part}</span>)}</>;
}
function TopicIcon({ kind }: { kind: string }) {
  const Icon = { compass: Compass, clock: Clock, history: History, link: Link, repeat: Repeat, arrow: ArrowRight, book: BookOpen }[kind] ?? BookOpen;
  return <Icon size={22} aria-hidden="true" />;
}
function Points({ points }: { points: Point[] }) {
  return <div className="tk-points">{points.map((point, i) => <div className="tk-point" key={point.label}><span className="tk-point-number">{i + 1}</span><div><h3>{point.label}</h3><p>{point.text}</p></div></div>)}</div>;
}
export default function KnowledgeQuiz() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#knowledge');
  const [view, setView] = useState<View>('setup');
  const [tab, setTab] = useState<Tab>('path');
  const [guide, setGuide] = useState<number | string>(1);
  const [progress, setProgress] = useState(readProgress);
  const [notice, setNotice] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const session = progress.session;
  const question = session ? BY_ID.get(session.ids[session.index]) : undefined;
  const response = question && session ? session.responses[question.id] ?? {} : {};
  const review = reviewIds(progress);
  const studied = Object.keys(progress.grades).length;
  const correct = Object.values(progress.grades).filter(g => g === 'correct').length;
  const recommended = recommendedStart(progress);
  const activeSet = session ? TOPIC_SETS.find(s => s.title === session.title && s.ids.join('|') === session.ids.join('|')) : undefined;
  const activeTopic = activeSet ? TOPICS.find(t => t.id === activeSet.topicId) : undefined;
  const guideTopic = typeof guide === 'string' ? TOPICS.find(t => t.id === guide) : undefined;
  const guideTitle = guideTopic?.title ?? LESSON_TITLES[Number(guide)]?.[0] ?? '要点を確認';
  const guidePoints = guideTopic?.points ?? pointsForSet(Number(guide));
  const isFinishedAll = studied === QUESTIONS.length;

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
    catch { setNotice('進み具合を保存できません。練習は続けられますが、再読み込みすると今回の記録が消えます。'); }
  }, [progress]);
  function close() {
    setOpen(false);
    if (location.hash === '#knowledge') history.replaceState(null, '', location.pathname + location.search);
  }
  useDialog(open, close, '[data-ui="knowledge-dialog"]');
  useLayoutEffect(() => {
    if (!open) return;
    mainRef.current?.scrollTo({ top: 0 }); headingRef.current?.focus({ preventScroll: true });
  }, [open, view, tab, guide, question?.id]);
  useLayoutEffect(() => {
    if (view === 'practice' && response.revealed) {
      feedbackRef.current?.focus({ preventScroll: true });
      feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [view, question?.id, response.revealed]);
  function launch() { setOpen(true); setView('setup'); history.replaceState(null, '', location.pathname + location.search + '#knowledge'); }
  function showGuide(value: number | string) { setGuide(value); setView('guide'); }
  function showList() { setView('setup'); }
  function begin(start: number) {
    const set = SETS.find(s => s.start === start); if (!set) return;
    const ids = QUESTIONS.filter(q => q.number >= set.start && q.number <= set.end).map(q => q.id);
    setProgress(p => ({ ...p, session: startSession(ids, LESSON_TITLES[start][0], set.end < 102 ? set.end + 1 : null) })); setView('practice');
  }
  function beginTopic(key: string) {
    const set = TOPIC_SETS.find(s => s.key === key); if (!set) return;
    setProgress(p => ({ ...p, session: startSession(set.ids, set.title) })); setView('practice');
  }
  function beginReview(ids = review.slice(0, 6)) {
    if (!ids.length) return;
    setProgress(p => ({ ...p, session: startSession(ids.slice(0, 6), '間違えた問題・△の復習') })); setView('practice');
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
    if (session.index === session.ids.length - 1) { setProgress(p => p.session ? { ...p, session: { ...p.session, finished: true } } : p); setView('result'); }
    else setProgress(p => p.session ? { ...p, session: { ...p.session, index: p.session.index + 1 } } : p);
  }
  function previous() { setProgress(p => p.session ? { ...p, session: { ...p.session, index: Math.max(0, p.session.index - 1) } } : p); }
  function toggleFlag() {
    if (!question) return;
    setProgress(p => ({ ...p, flagged: p.flagged.includes(question.id) ? p.flagged.filter(id => id !== question.id) : [...p.flagged, question.id] }));
  }
  const canCheck = !!question && !response.revealed && (question.mode === 'text' ? !!response.text?.trim() : autoGrade(question, response) !== null);
  const nextTopicSet = activeSet ? TOPIC_SETS.filter(s => s.topicId === activeSet.topicId)[TOPIC_SETS.filter(s => s.topicId === activeSet.topicId).findIndex(s => s.key === activeSet.key) + 1] : undefined;
  const sessionNeedsReview = session?.ids.filter(id => session.responses[id]?.grade === 'incorrect' || progress.flagged.includes(id)) ?? [];
  const launcher = target ? createPortal(<button type="button" data-ui="knowledge-launcher" onClick={launch} className="col-span-1 rounded-2xl sm:rounded-3xl border-2 border-violet-200 dark:border-violet-900/50 bg-white dark:bg-slate-800 p-4 sm:p-6 text-center shadow-sm hover:border-violet-500 transition-colors min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center">
    <span className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200 mb-2.5 flex items-center justify-center"><Brain size={26} /></span>
    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">文法の<br />知識チェック</span>
    <span className="mt-1 text-xs text-slate-600 dark:text-slate-300">要点をつかむ・クイズで確認</span>
  </button>, target) : null;

  return <>{launcher}{open && createPortal(<div className="tk-root" data-ui="knowledge-dialog" data-version={VERSION} data-design="knowledge-learning-hub-v2" role="dialog" aria-modal="true" aria-label="文法の知識チェック">
    <header className="tk-header"><div className="tk-header-inner">
      <button className="tk-title" type="button" onClick={showList} aria-label="知識チェックの一覧へ"><span className="tk-brand-icon"><BookOpen size={22} aria-hidden="true" /></span><span>文法の知識チェック<small>時制・完了形①②</small></span></button>
      <button className="tk-icon" type="button" onClick={close} aria-label="ホームへ戻る"><Home size={21} /></button>
    </div></header>
    <main className="tk-main" ref={mainRef}>
      <div className={`tk-container ${view === 'practice' ? 'tk-study-container' : ''}`}>
        {notice && <p className="tk-notice" role="status">{notice}</p>}
        {view === 'setup' && <>
          <section className="tk-intro">
            <div className="tk-intro-copy"><span className="tk-eyebrow">意味から学ぶ、時制のレッスン</span><h1 ref={headingRef} tabIndex={-1}>「なんとなく」を、<br className="tk-mobile-br" />「わかる」に。</h1><p>要点をつかむ。クイズで確かめる。<br />基本から、ひとつずつ進もう。</p></div>
            <div className="tk-next-card"><span className="tk-eyebrow">{session && !session.finished ? '前回のつづき' : isFinishedAll ? 'ひと通り確認できました' : studied ? '次のレッスン' : 'まずはここから'}</span><h2>{session && !session.finished ? session.title : isFinishedAll ? '気になるところを、もう一度。' : LESSON_TITLES[recommended][0]}</h2>
              {session && !session.finished ? <button type="button" className="tk-btn tk-primary" data-action="resume" onClick={() => setView('practice')}>続きから（第{question!.number}問）<ArrowRight size={18} /></button> : <button type="button" className="tk-btn tk-primary" onClick={() => isFinishedAll && review.length ? beginReview() : begin(recommended)}>{isFinishedAll && review.length ? '復習を始める' : recommended === 1 ? 'はじめの６問へ' : '次の６問へ'}<ArrowRight size={18} /></button>}
              <button type="button" className="tk-text-button" onClick={() => showGuide(session && !session.finished ? Math.floor((question!.number - 1) / 6) * 6 + 1 : recommended)}><BookOpen size={15} />先に要点を見る</button>
            </div>
          </section>
          <div className="tk-progress-summary"><div className="tk-stats"><strong>確認済み <b>{studied} / 102</b></strong><span>正答 {correct}問<span className="tk-desktop-only"> · 記述は自己採点</span></span></div><progress value={studied} max={102} aria-label="確認した問題数" /><button type="button" className="tk-review-link" data-action="review" disabled={!review.length} onClick={() => beginReview()}><RotateCcw size={16} />復習 {review.length}問</button></div>
          <nav className="tk-tabs" aria-label="学び方を選ぶ">{([['path', '基本から進む'], ['topics', '単元から選ぶ'], ['review', '復習する']] as const).map(([id, label]) => <button type="button" key={id} data-tab={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}{id === 'review' && review.length > 0 && <span className="tk-count">{review.length}</span>}</button>)}</nav>
          {tab === 'path' && <section className="tk-path" aria-label="基本から細かい知識へ"><div className="tk-section-heading"><h2>基本から、少しずつ。</h2><p>大きな考え方 → 形 → 使い分け → 注意点</p></div>
            <div className="tk-stage-grid">{STAGES.map(stage => {
              const count = QUESTIONS.filter(q => q.stage === stage.id && progress.grades[q.id]).length;
              return <section className="tk-stage" key={stage.id}><header className="tk-stage-heading"><span className="tk-stage-number">0{stage.id}</span><div><h3>{stage.title}</h3><p>{stage.description}</p></div><small>{count}/{stage.end - stage.start + 1}</small></header>
                <div className="tk-lessons">{SETS.filter(s => s.stage === stage.id).map(s => {
                  const status = progressFor(Array.from({ length: 6 }, (_, i) => s.start + i), progress);
                  return <div className={`tk-lesson-row ${recommended === s.start && !isFinishedAll ? 'is-next' : ''}`} key={s.start}>
                    <button type="button" className="tk-lesson" data-start={s.start} onClick={() => begin(s.start)}><span className={`tk-lesson-status ${status.done === 6 ? 'is-done' : ''}`}>{status.done === 6 ? <Check size={18} /> : <Circle size={16} />}</span><span className="tk-lesson-copy"><strong>{LESSON_TITLES[s.start][0]}</strong><small>{LESSON_TITLES[s.start][1]}</small><span className="tk-lesson-meta">６問<span>プリント {s.start}〜{s.end}</span>{status.done > 0 && <span>{status.done}/6 確認済み</span>}</span></span><ChevronRight size={17} /></button>
                    <button type="button" className="tk-guide-button" data-guide={s.start} aria-label={`${LESSON_TITLES[s.start][0]}の要点を見る`} onClick={() => showGuide(s.start)}><BookOpen size={17} /><span>要点</span></button>
                  </div>;
                })}</div></section>;
            })}</div>
          </section>}
          {tab === 'topics' && <section><div className="tk-section-heading"><h2>気になる単元から。</h2><p>要点を読んで、その単元だけ練習できます。</p></div><div className="tk-topic-grid">{TOPICS.map((topic, i) => {
            const status = progressFor(topic.numbers, progress);
            return <button type="button" className="tk-topic-card" key={topic.id} data-topic={topic.id} onClick={() => showGuide(topic.id)}><span className="tk-topic-top"><span className="tk-topic-icon"><TopicIcon kind={topic.icon} /></span><small>0{i + 1}</small></span><strong>{topic.title}</strong><span className="tk-topic-description">{topic.description}</span><span className="tk-topic-bottom"><span>{status.done} / {status.total}問を確認</span><ChevronRight size={18} /></span><progress value={status.done} max={status.total} aria-label={`${topic.title}の確認数`} /></button>;
          })}</div></section>}
          {tab === 'review' && <section><div className="tk-section-heading"><h2>つまずいたところだけ。</h2><p>間違えた問題と「△ 迷った」を単元別に整理。</p></div>{!review.length ? <div className="tk-empty"><Check size={30} /><h3>今は、復習する問題がありません。</h3><p>問題を解くと、間違えた問題がここに集まります。<br />迷った問題には△を付けておこう。</p><button type="button" className="tk-btn" onClick={() => setTab('path')}>基本から進む</button></div> : <div className="tk-review-grid">{TOPICS.map(topic => {
            const ids = review.filter(id => topic.numbers.includes(BY_ID.get(id)!.number));
            return ids.length ? <section className="tk-review-card" key={topic.id}><span className="tk-topic-icon"><TopicIcon kind={topic.icon} /></span><div><h3>{topic.title}</h3><p>{ids.length}問を復習</p><div className="tk-actions"><button type="button" className="tk-btn tk-primary" data-review-topic={topic.id} onClick={() => beginReview(ids)}>{Math.min(6, ids.length)}問で確認<ArrowRight size={16} /></button><button type="button" className="tk-text-button" onClick={() => showGuide(topic.id)}>要点を読む</button></div></div></section> : null;
          })}</div>}</section>}
          <p className="tk-storage-note">記録はこのブラウザに保存されます。端末間では同期しません。別のレッスンを始めると途中の入力は切り替わりますが、解答済みの記録と△は残ります。</p>
        </>}
        {view === 'guide' && <section className="tk-guide-page" data-ui="knowledge-guide"><button type="button" className="tk-text-button" onClick={showList}><ChevronLeft size={16} />学習一覧へ</button><div className="tk-guide-heading"><span className="tk-eyebrow">要点をつかむ → 問題で確かめる</span><h1 ref={headingRef} tabIndex={-1}>{guideTitle}</h1><p>{guideTopic?.description ?? LESSON_TITLES[Number(guide)]?.[1]}</p></div><div className="tk-guide-content"><div className="tk-points-card"><h2><BookOpen size={21} />このテーマの要点</h2><Points points={guidePoints} />{guideTopic?.id === 'future' && <p className="tk-small">代表的な使い方を整理しています。同じ場面を別の形で言える場合もあります。</p>}<p className="tk-small">ここは学習用のまとめです。自力で確かめたいときは、後でもう一度クイズを解こう。</p></div><div className="tk-guide-practice"><h2>問題で確かめよう</h2>{guideTopic ? <div className="tk-topic-sets">{TOPIC_SETS.filter(s => s.topicId === guideTopic.id).map(s => <button type="button" className="tk-course-set" key={s.key} data-topic-set={s.key} onClick={() => beginTopic(s.key)}><span><small>STEP {s.stage}</small><strong>{s.label}</strong></span><span>{s.ids.length}問 <ChevronRight size={17} /></span></button>)}</div> : <><p>プリント第{guide}〜{Number(guide) + 5}問</p><button type="button" className="tk-btn tk-primary" data-action="guide-start" onClick={() => begin(Number(guide))}>６問で確かめる<ArrowRight size={18} /></button></>}</div></div></section>}
        {view === 'practice' && session && question && <>
          <div className="tk-progress-row"><span>{activeTopic?.title ?? LESSON_TITLES[Math.floor((question.number - 1) / 6) * 6 + 1][0]}</span><strong>{session.index + 1} / {session.ids.length}</strong></div>
          <progress value={session.ids.filter(id => session.responses[id]?.grade).length} max={session.ids.length} aria-label="このセットの進み具合" />
          <article key={question.id} className="tk-question" data-question={question.number} data-format={question.format}>
            <div className="tk-qmeta"><span className="tk-format-tag">{FORMATS[question.format]}</span><span className="tk-paper-number">プリント {question.number}</span><label className="tk-flag"><input type="checkbox" checked={progress.flagged.includes(question.id)} onChange={toggleFlag} />△ 迷った</label></div>
            <p className="tk-instruction">{instructions[question.format]}</p><h1 className="tk-prompt" ref={headingRef} tabIndex={-1}><Prompt text={question.prompt} /></h1>
            {question.mode === 'choice' && <div className={`tk-choices ${question.format === 'tf' ? 'tk-tf' : ''} ${question.format === 'match' ? 'tk-match' : ''}`} role="group" aria-label="選択肢">{question.choices!.map((choice, i) => <button type="button" key={i} data-choice={i} className={`tk-choice ${response.choice === i ? 'is-selected' : ''} ${response.revealed && question.answer === i ? 'is-correct' : ''}`} disabled={!!response.revealed} aria-pressed={response.choice === i} onClick={() => patchResponse({ choice: i })}><b>{question.format === 'tf' ? choice : String.fromCharCode(65 + i)}</b>{question.format !== 'tf' && <span>{choice}</span>}{response.revealed && question.answer === i && <span className="tk-correct-label"><Check size={15} />正答</span>}</button>)}</div>}
            {question.mode === 'order' && <div className="tk-order"><div className="tk-order-result" aria-live="polite"><span>先 → 後</span><strong>{response.order?.length ? response.order.map(i => String.fromCharCode(65 + i)).join(' → ') : '順番に選ぼう'}</strong></div><div className="tk-choices">{question.choices!.map((choice, i) => <button type="button" key={i} data-order={i} className={`tk-choice ${response.order?.includes(i) ? 'is-selected' : ''}`} disabled={!!response.revealed || !!response.order?.includes(i)} onClick={() => patchResponse({ order: [...(response.order ?? []), i] })}><b>{String.fromCharCode(65 + i)}</b><span>{choice}</span></button>)}</div><button type="button" className="tk-text-button" disabled={!!response.revealed || !response.order?.length} onClick={() => patchResponse({ order: [] })}><RotateCcw size={15} />並びを選び直す</button></div>}
            {question.mode === 'text' && <label className="tk-input-label">あなたの答え<textarea value={response.text ?? ''} rows={2} maxLength={500} autoComplete="off" spellCheck={false} disabled={!!response.revealed} onChange={e => patchResponse({ text: e.target.value })} placeholder="短い言葉で答えよう" /></label>}
            {(question.format === 'match' || (question.number >= 61 && question.number <= 65)) && <p className="tk-small">代表的な使い方との対応です。同じ場面を別の形で言える場合もあります。</p>}
            {!response.revealed && <div className="tk-check-actions"><button type="button" className="tk-btn tk-primary" data-action="check" disabled={!canCheck} onClick={check}>答えを確かめる<Check size={18} /></button><button type="button" className="tk-text-button" data-action="unknown" onClick={() => grade('incorrect')}>まだわからない</button></div>}
            {response.revealed && <div className={`tk-feedback ${response.grade === 'incorrect' ? 'needs-review' : ''}`} data-ui="knowledge-feedback" ref={feedbackRef} tabIndex={-1} aria-live="polite"><h2>{response.grade === 'correct' ? <><Check size={20} />正解！</> : response.grade === 'incorrect' ? <><BookOpen size={20} />ここを確認しよう</> : <><BookOpen size={20} />答えを見比べよう</>}</h2><div className="tk-answer-block"><span className="tk-feedback-label">{question.mode === 'text' ? '解答例' : '答え'}</span><p className="tk-answer">{answerLabel(question)}</p></div><div className="tk-explanation-block"><span className="tk-feedback-label">{question.format === 'tf' && question.answer === 1 ? '正しくは、こう考える' : 'ここがポイント'}</span><p>{question.explanation}</p></div>{question.mode === 'text' && !response.grade && <div className="tk-self-mark"><p>同じ意味で答えられていれば正解です。</p><div className="tk-actions"><button type="button" className="tk-btn tk-primary" data-action="self-correct" onClick={() => grade('correct')}>答えられた</button><button type="button" className="tk-btn" data-action="self-incorrect" onClick={() => grade('incorrect')}>もう一度練習する</button></div></div>}<span className="tk-feedback-topic">{TOPIC_BY_NUMBER.get(question.number)?.title}</span></div>}
          </article>
        </>}
        {view === 'result' && session && <section className="tk-result"><span className="tk-result-icon"><Check size={28} /></span><span className="tk-eyebrow">今回のレッスン、おつかれさま。</span><h1 ref={headingRef} tabIndex={-1}>{session.ids.filter(id => session.responses[id]?.grade === 'correct').length} / {session.ids.length} 問正解</h1><p>{session.title}</p><p className="tk-small">記述問題は自己採点です。正答数だけでなく、理由も確認しよう。</p><div className="tk-actions tk-result-actions">{nextTopicSet ? <button type="button" className="tk-btn tk-primary" onClick={() => beginTopic(nextTopicSet.key)}>次へ：{nextTopicSet.label}<ArrowRight size={17} /></button> : session.nextStart ? <button type="button" className="tk-btn tk-primary" onClick={() => begin(session.nextStart!)}>次の６問へ<ArrowRight size={17} /></button> : activeTopic ? <button type="button" className="tk-btn tk-primary" onClick={() => showGuide(activeTopic.id)}>この単元に戻る</button> : null}{sessionNeedsReview.length > 0 && <button type="button" className="tk-btn" onClick={() => beginReview(sessionNeedsReview)}><RotateCcw size={17} />今回の間違い・△を復習</button>}<button type="button" className="tk-text-button" onClick={showList}>一覧へ戻る</button></div><div className="tk-result-list"><h2>答えとポイントを振り返る</h2>{session.ids.map(id => {
            const q = BY_ID.get(id)!; const gradeValue = session.responses[id]?.grade;
            return <details key={id}><summary><span className={gradeValue === 'correct' ? 'tk-status-good' : 'tk-status-review'}>{gradeValue === 'correct' ? '○' : '復習'}</span><span>プリント {q.number} · {TOPIC_BY_NUMBER.get(q.number)?.short}</span>{progress.flagged.includes(id) && <Flag size={15} />}<ChevronRight size={16} /></summary><p>{q.prompt}</p><div className="tk-result-answer"><strong>{answerLabel(q)}</strong><p>{q.explanation}</p></div></details>;
          })}</div></section>}
      </div>
    </main>
    {view === 'practice' && session && <footer className="tk-footer"><div className="tk-footer-inner"><button type="button" className="tk-text-button" onClick={showList}>中断・一覧</button><button type="button" className="tk-btn tk-back" aria-label="前の問題" disabled={session.index === 0} onClick={previous}><ChevronLeft size={20} /></button><button type="button" className="tk-btn tk-primary" data-action="next" disabled={!response.grade} onClick={next}>{session.index === session.ids.length - 1 ? '結果を見る' : '次の問題へ'}<ChevronRight size={18} /></button></div></footer>}
  </div>, document.body)}</>;
}
