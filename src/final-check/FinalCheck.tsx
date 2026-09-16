import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Home,
  Layers3,
  RotateCcw,
  Shuffle,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useDialog } from '../workbook/useDialog';
import {
  FINAL_CHECK_FORMATS,
  FINAL_CHECK_QUESTIONS,
  FINAL_CHECK_SECTIONS,
  availableFor,
  displayFinalCheckSolution,
  makeFinalCheckSet,
  prepareFinalCheckSession,
  readFinalCheckMistakes,
  saveFinalCheckMistakes,
  shuffleWith,
  type FinalCheckGrade,
  type FinalCheckQuestion,
  type FinalCheckRange,
  type FinalCheckSection,
  type FinalCheckSelection,
  type FinalCheckStrategy,
} from './model';
import { BALANCED_CHOICE_LAYOUT_VERSION } from '../lib/balanced-choice-layout';

type View = 'setup' | 'practice' | 'result';

const RANGE_OPTIONS: Array<{ id: FinalCheckRange; label: string; description: string }> = [
  { id: 'all', label: '全範囲', description: '4分野・全200問から出題' },
  { id: 'tense1', label: '時制・完了形①', description: '52問から出題' },
  { id: 'tense2', label: '時制・完了形②', description: '52問から出題' },
  { id: 'verb1', label: '動詞①', description: '50問から出題' },
  { id: 'verb2', label: '動詞②', description: '46問から出題' },
];

const SECTION_TONES: Record<FinalCheckSection, string> = {
  tense1: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
  tense2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  verb1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  verb2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

const defaultSelection: FinalCheckSelection = { range: 'all', strategy: 'balanced', count: 20 };

function countOptions(range: FinalCheckRange): number[] {
  const available = availableFor(range);
  const options = [10, 20, 30, 50, 100, 200].filter(count => count <= available);
  if (!options.includes(available)) options.push(available);
  return options;
}

function sectionResult(
  questions: readonly FinalCheckQuestion[],
  grades: Record<string, FinalCheckGrade>,
  section: FinalCheckSection,
) {
  const scoped = questions.filter(question => question.section === section);
  const correct = scoped.filter(question => grades[question.id] === 'correct').length;
  const incorrect = scoped.filter(question => grades[question.id] === 'incorrect').length;
  return { total: scoped.length, correct, incorrect, ungraded: scoped.length - correct - incorrect };
}

function PromptText({ question }: { question: FinalCheckQuestion }) {
  if (!question.underlinedText) return <>{question.prompt}</>;
  const index = question.prompt.indexOf(question.underlinedText);
  const before = question.prompt.slice(0, index);
  const after = question.prompt.slice(index + question.underlinedText.length);
  return <>{before}<u data-ui="final-check-underlined" className="font-black decoration-[3px] decoration-orange-600 underline-offset-[5px] dark:decoration-orange-400">{question.underlinedText}</u>{after}</>;
}

export default function FinalCheck() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('setup');
  const [selection, setSelection] = useState<FinalCheckSelection>(defaultSelection);
  const [questions, setQuestions] = useState<FinalCheckQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, FinalCheckGrade>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [mistakeIds, setMistakeIds] = useState<string[]>(readFinalCheckMistakes);
  const [notice, setNotice] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  const question = questions[index];
  const correctCount = Object.values(grades).filter(grade => grade === 'correct').length;
  const incorrectCount = Object.values(grades).filter(grade => grade === 'incorrect').length;
  const ungradedCount = questions.length - Object.keys(grades).filter(id => questions.some(questionItem => questionItem.id === id)).length;
  const savedMistakes = useMemo(
    () => FINAL_CHECK_QUESTIONS.filter(questionItem => mistakeIds.includes(questionItem.id)),
    [mistakeIds],
  );

  useEffect(() => {
    const sync = () => {
      const next = document.querySelector<HTMLElement>('[data-ui="compact-home-bento-v1"] .grid.grid-cols-2');
      setTarget(previous => previous === next ? previous : next);
    };
    sync();
    const observer = new MutationObserver(sync);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, []);

  useDialog(open, () => setOpen(false), '[data-ui="final-check-dialog"]');
  useEffect(() => { mainRef.current?.scrollTo({ top: 0, behavior: 'auto' }); }, [view, index]);

  const close = () => setOpen(false);

  const launch = () => {
    setOpen(true);
    setView('setup');
    setNotice('');
  };

  const resetSession = (nextQuestions: FinalCheckQuestion[]) => {
    setQuestions(prepareFinalCheckSession(nextQuestions));
    setIndex(0);
    setGrades({});
    setResponses({});
    setRevealed({});
    setSelectedOptions({});
    setNotice('');
    setView('practice');
  };

  const begin = () => {
    try {
      resetSession(makeFinalCheckSet(selection));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '問題を作成できませんでした。');
    }
  };

  const beginMistakes = () => {
    if (!savedMistakes.length) return;
    resetSession(shuffleWith(savedMistakes));
  };

  const changeRange = (range: FinalCheckRange) => {
    const available = availableFor(range);
    setSelection(previous => ({ ...previous, range, count: Math.min(20, available) }));
    setNotice('');
  };

  const grade = (id: string, gradeValue: FinalCheckGrade) => {
    setGrades(previous => ({ ...previous, [id]: gradeValue }));
    setMistakeIds(previous => {
      const next = gradeValue === 'correct'
        ? previous.filter(savedId => savedId !== id)
        : [...new Set([...previous, id])];
      if (!saveFinalCheckMistakes(next)) setNotice('この端末では復習記録を保存できませんでした。');
      return next;
    });
  };

  const goNext = () => {
    if (index + 1 >= questions.length) setView('result');
    else setIndex(previous => previous + 1);
  };

  const launcher = target ? createPortal(
    <button
      type="button"
      data-ui="final-check-launcher"
      onClick={launch}
      className="col-span-1 rounded-2xl sm:rounded-3xl border-2 border-orange-200 dark:border-orange-900/60 bg-white dark:bg-slate-800 p-4 sm:p-6 text-center shadow-sm hover:border-orange-500 transition-colors min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center"
    >
      <span className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/35 text-orange-700 dark:text-orange-200 mb-2.5 flex items-center justify-center"><ClipboardCheck size={26} /></span>
      <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">試験前<br className="sm:hidden" />最終チェック</span>
      <span className="mt-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">4分野・全200問から総仕上げ</span>
    </button>,
    target,
  ) : null;

  return <>{launcher}{open && createPortal(
    <div
      className="fixed inset-0 z-[130] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      data-ui="final-check-dialog"
      data-answer-layout={BALANCED_CHOICE_LAYOUT_VERSION}
      role="dialog"
      aria-modal="true"
      aria-label="試験前 最終チェック"
    >
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {view !== 'setup' && <button type="button" onClick={() => setView('setup')} aria-label="設定画面へ戻る" className="w-11 h-11 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center"><ChevronLeft size={21} /></button>}
              <div className="min-w-0">
                <h1 className="font-black text-lg sm:text-xl leading-tight truncate">試験前 最終チェック</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">時制・完了形①②／動詞①②</p>
              </div>
            </div>
            <button type="button" onClick={close} aria-label="ホームへ戻る" className="w-11 h-11 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center"><Home size={21} /></button>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-8">
          <div className="max-w-3xl mx-auto">
            {notice && <div role="status" className="mb-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm font-bold text-amber-900 dark:text-amber-100">{notice}</div>}

            {view === 'setup' && <div className="space-y-4" data-ui="final-check-setup">
              <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 text-white p-5 sm:p-7 shadow-lg">
                <div className="flex items-start gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Trophy size={30} /></span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black">試験前の仕上がりを確認</h2>
                    <p className="mt-2 text-sm sm:text-base text-orange-50 leading-relaxed">添付教材の200問から、分野別または全範囲シャッフルで出題します。</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black mb-3">1．範囲を選ぶ</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {RANGE_OPTIONS.map(option => <button
                    key={option.id}
                    type="button"
                    data-range={option.id}
                    aria-pressed={selection.range === option.id}
                    onClick={() => changeRange(option.id)}
                    className={`rounded-2xl border-2 p-3 sm:p-4 text-left transition-colors ${option.id === 'all' ? 'col-span-2' : ''} ${selection.range === option.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/25' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
                  >
                    <strong className="block text-base sm:text-lg font-black">{option.label}</strong>
                    <span className="block mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                  </button>)}
                </div>
              </section>

              {selection.range === 'all' && <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black mb-3">2．出し方を選ぶ</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {([
                    { id: 'balanced' as FinalCheckStrategy, label: '4分野バランス', description: '各分野からほぼ均等に出題', icon: Layers3 },
                    { id: 'random' as FinalCheckStrategy, label: '完全ランダム', description: '全200問を完全にシャッフル', icon: Shuffle },
                  ]).map(option => {
                    const Icon = option.icon;
                    return <button
                      key={option.id}
                      type="button"
                      data-strategy={option.id}
                      aria-pressed={selection.strategy === option.id}
                      onClick={() => setSelection(previous => ({ ...previous, strategy: option.id }))}
                      className={`rounded-2xl border-2 p-4 flex items-center gap-3 text-left transition-colors ${selection.strategy === option.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/25' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
                    >
                      <span className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/35 text-orange-700 dark:text-orange-200 flex items-center justify-center shrink-0"><Icon size={22} /></span>
                      <span><strong className="block font-black">{option.label}</strong><span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400">{option.description}</span></span>
                    </button>;
                  })}
                </div>
              </section>}

              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black mb-3">{selection.range === 'all' ? '3' : '2'}．問題数を選ぶ</h2>
                <div className="flex flex-wrap gap-2">
                  {countOptions(selection.range).map(count => {
                    const isAll = count === availableFor(selection.range);
                    return <button
                      key={count}
                      type="button"
                      data-count={count}
                      aria-pressed={selection.count === count}
                      onClick={() => setSelection(previous => ({ ...previous, count }))}
                      className={`min-h-11 px-4 rounded-xl border-2 font-black transition-colors ${selection.count === count ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-300'}`}
                    >{isAll ? `全${count}問` : `${count}問`}</button>;
                  })}
                </div>
                <button type="button" onClick={begin} className="mt-5 w-full min-h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2">{selection.count}問で最終チェックを始める<ArrowRight size={21} /></button>
              </section>

              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
                <h2 className="font-black text-lg">間違えた問題の復習</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">この端末に保存されている復習問題：{savedMistakes.length}問</p>
                <button type="button" disabled={!savedMistakes.length} onClick={beginMistakes} className="mt-3 min-h-11 px-4 rounded-xl border-2 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-black disabled:opacity-40 disabled:cursor-not-allowed">間違えた問題だけ解く</button>
              </section>
            </div>}

            {view === 'practice' && question && <div data-ui="final-check-practice">
              <div className="flex items-center justify-between gap-3 mb-3">
                <strong className="text-sm sm:text-base">{index + 1}／{questions.length}問</strong>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">できた {correctCount}　復習 {incorrectCount}</span>
              </div>
              <progress className="w-full h-2 accent-orange-600 mb-4" value={index + 1} max={questions.length} aria-label="最終チェックの進み具合" />

              <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-7 shadow-sm" data-ui="final-check-question" data-id={question.id} data-section={question.section} data-round={question.round} data-format={question.format}>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${SECTION_TONES[question.section]}`}>{FINAL_CHECK_SECTIONS[question.section].label}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{FINAL_CHECK_FORMATS[question.format]}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">第{question.round}ラウンド No.{question.number}</span>
                </div>

                <div className="whitespace-pre-wrap text-lg sm:text-xl leading-relaxed font-semibold text-slate-900 dark:text-white" data-ui="final-check-prompt"><PromptText question={question} /></div>

                {question.choices ? <div className="mt-6 grid gap-2.5" data-ui="final-check-choices">
                  {question.choices.map((choice, choiceIndex) => {
                    const selected = selectedOptions[question.id];
                    const answered = selected !== undefined;
                    const isCorrect = choiceIndex === question.correctIndex;
                    const isWrongSelection = answered && choiceIndex === selected && !isCorrect;
                    const stateClass = answered && isCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100'
                      : isWrongSelection
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 bg-white dark:bg-slate-900';
                    return <button
                      key={`${question.id}-${choiceIndex}`}
                      type="button"
                      disabled={answered}
                      data-choice-index={choiceIndex}
                      data-state={answered ? isCorrect ? 'correct' : isWrongSelection ? 'wrong' : 'other' : 'unanswered'}
                      onClick={() => {
                        if (answered) return;
                        setSelectedOptions(previous => ({ ...previous, [question.id]: choiceIndex }));
                        setRevealed(previous => ({ ...previous, [question.id]: true }));
                        grade(question.id, choiceIndex === question.correctIndex ? 'correct' : 'incorrect');
                      }}
                      className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors disabled:cursor-default ${stateClass}`}
                    ><span className="inline-block w-7 text-slate-400">{String.fromCharCode(65 + choiceIndex)}.</span>{choice}</button>;
                  })}
                </div> : <div className="mt-6">
                  <label className="block font-black text-sm mb-2" htmlFor={`answer-${question.id}`}>自分の解答</label>
                  <textarea
                    id={`answer-${question.id}`}
                    aria-label="自分の解答"
                    rows={4}
                    value={responses[question.id] ?? ''}
                    onChange={event => setResponses(previous => ({ ...previous, [question.id]: event.target.value }))}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="ここに入力するか、ノートに書いてから解答を確認してください。"
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-base focus:outline-none focus:border-orange-500"
                  />
                  <button type="button" onClick={() => setRevealed(previous => ({ ...previous, [question.id]: !previous[question.id] }))} className="mt-3 min-h-12 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black">{revealed[question.id] ? '解答・解説を隠す' : '解答・解説を見る'}</button>
                </div>}

                {revealed[question.id] && <section className="mt-5 rounded-2xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/25 p-4 sm:p-5" data-ui="final-check-solution" aria-live="polite">
                  <h2 className="font-black text-orange-900 dark:text-orange-100">解答・解説</h2>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed font-semibold text-slate-800 dark:text-slate-100">{displayFinalCheckSolution(question)}</p>
                  {!question.choices && <div className="mt-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">記述問題は別解があるため、解答例と比較して自己採点してください。</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" aria-pressed={grades[question.id] === 'correct'} onClick={() => grade(question.id, 'correct')} className={`min-h-12 rounded-xl border-2 font-black flex items-center justify-center gap-2 ${grades[question.id] === 'correct' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}><CheckCircle2 size={19} />できた</button>
                      <button type="button" aria-pressed={grades[question.id] === 'incorrect'} onClick={() => grade(question.id, 'incorrect')} className={`min-h-12 rounded-xl border-2 font-black flex items-center justify-center gap-2 ${grades[question.id] === 'incorrect' ? 'border-rose-600 bg-rose-600 text-white' : 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'}`}><XCircle size={19} />もう一度</button>
                    </div>
                  </div>}
                </section>}

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button type="button" disabled={index === 0} onClick={() => setIndex(previous => previous - 1)} className="min-h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black disabled:opacity-40">前の問題</button>
                  <button type="button" onClick={goNext} className="min-h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black">{index + 1 === questions.length ? '結果を見る' : '次の問題'}</button>
                </div>
                {!grades[question.id] && <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">採点せず進んだ問題は「未判定」になります。</p>}
              </article>
            </div>}

            {view === 'result' && <section className="space-y-4" data-ui="final-check-result">
              <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 text-white p-6 sm:p-8 text-center shadow-lg">
                <Trophy size={46} className="mx-auto mb-3" />
                <h2 className="text-2xl sm:text-3xl font-black">最終チェック完了</h2>
                <div className="mt-4 text-5xl font-black">{questions.length ? Math.round((correctCount / questions.length) * 100) : 0}<span className="text-2xl">%</span></div>
                <p className="mt-2 text-sm font-bold text-orange-50">できた {correctCount}問　／　復習 {incorrectCount}問　／　未判定 {ungradedCount}問</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-black mb-3">分野別の結果</h2>
                <div className="grid gap-2.5">
                  {(Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[]).map(section => {
                    const result = sectionResult(questions, grades, section);
                    if (!result.total) return null;
                    return <div key={section} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 flex items-center justify-between gap-3">
                      <span><strong className="block font-black">{FINAL_CHECK_SECTIONS[section].label}</strong><span className="text-xs text-slate-500 dark:text-slate-400">復習 {result.incorrect}・未判定 {result.ungraded}</span></span>
                      <span className="text-lg font-black">{result.correct}／{result.total}</span>
                    </div>;
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm grid gap-2.5">
                <button type="button" disabled={!incorrectCount} onClick={() => resetSession(shuffleWith(questions.filter(questionItem => grades[questionItem.id] === 'incorrect')))} className="min-h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><RotateCcw size={19} />今回間違えた問題だけ解く</button>
                <button type="button" onClick={begin} className="min-h-12 rounded-xl border-2 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-black">別の問題で同じ条件に挑戦</button>
                <button type="button" onClick={() => setView('setup')} className="min-h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black">範囲と問題数を選び直す</button>
              </div>
            </section>}
          </div>
        </main>
      </div>
    </div>,
    document.body,
  )}</>;
}
