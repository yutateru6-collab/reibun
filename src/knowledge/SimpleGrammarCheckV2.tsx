import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Link,
  ListChecks,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useDialog } from '../workbook/useDialog';
import {
  GRAMMAR_ANSWER_LAYOUT_VERSION,
  GRAMMAR_CATEGORIES_V3,
  type GrammarCategoryV3,
  type GrammarQuestionV3,
} from './grammar_curriculum_v3';

const TOP_SCREEN_GRID_SELECTOR = '[data-ui="compact-home-bento-v1"] .grid.grid-cols-2';
const STORAGE_KEY = 'reibun:grammar-check:mistakes:v1';
type View = 'hub' | 'quiz' | 'result';

function readMistakes(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

const icons = {
  perfect: Link,
  future: Clock,
  countable: ListChecks,
} as const;

export default function SimpleGrammarCheckV2() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#knowledge');
  const [view, setView] = useState<View>('hub');
  const [category, setCategory] = useState<GrammarCategoryV3 | null>(null);
  const [questions, setQuestions] = useState<GrammarQuestionV3[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakeIds, setMistakeIds] = useState<string[]>(readMistakes);
  const mainRef = useRef<HTMLElement>(null);

  const question = questions[index];
  const sessionMistakes = useMemo(
    () => questions.filter((item) => mistakeIds.includes(item.id)),
    [questions, mistakeIds],
  );

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const sync = () => {
      const next = document.querySelector<HTMLElement>(TOP_SCREEN_GRID_SELECTOR);
      setTarget((current) => current === next ? current : next);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#knowledge') {
        setOpen(true);
        setView('hub');
      } else {
        setOpen(false);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakeIds));
    } catch {
      // Private browsing can make localStorage unavailable.
    }
  }, [mistakeIds]);

  useLayoutEffect(() => {
    if (!open) return;
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [open, view, index]);

  const close = () => {
    setOpen(false);
    if (window.location.hash === '#knowledge') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  useDialog(open, close, '[data-ui="knowledge-dialog"]');

  const launch = () => {
    setOpen(true);
    setView('hub');
    history.replaceState(null, '', window.location.pathname + window.location.search + '#knowledge');
  };

  const begin = (nextCategory: GrammarCategoryV3, nextQuestions = nextCategory.questions) => {
    setCategory(nextCategory);
    setQuestions(nextQuestions);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setView('quiz');
  };

  const answer = (choiceIndex: number) => {
    if (!question || selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === question.correctIndex) {
      setScore((value) => value + 1);
      setMistakeIds((ids) => ids.filter((id) => id !== question.id));
    } else {
      setMistakeIds((ids) => ids.includes(question.id) ? ids : [...ids, question.id]);
    }
  };

  const next = () => {
    if (selected === null) return;
    if (index >= questions.length - 1) {
      setView('result');
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  const launcher = target ? createPortal(
    <button
      type="button"
      data-ui="knowledge-launcher"
      onClick={launch}
      className="col-span-1 rounded-2xl sm:rounded-3xl border-2 border-violet-200 dark:border-violet-900/50 bg-white dark:bg-slate-800 p-4 sm:p-6 text-center shadow-sm hover:border-violet-500 transition-colors min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center"
    >
      <span className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200 mb-2.5 flex items-center justify-center"><Brain size={26} /></span>
      <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">文法チェック</span>
      <span className="mt-1 text-xs text-slate-600 dark:text-slate-300">完了形・未来表現・可算／不可算</span>
    </button>,
    target,
  ) : null;

  return <>{launcher}{open && createPortal(
    <div
      className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      data-ui="knowledge-dialog"
      data-design="grammar-three-track-v4"
      data-answer-layout={GRAMMAR_ANSWER_LAYOUT_VERSION}
      role="dialog"
      aria-modal="true"
      aria-label="文法チェック"
    >
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <button type="button" onClick={() => setView('hub')} className="min-w-0 text-left" aria-label="3分野の一覧へ戻る">
              <div className="font-black text-lg sm:text-xl leading-tight">文法チェック</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">完了形・未来表現・可算／不可算</div>
            </button>
            <button type="button" onClick={close} aria-label="ホームへ戻る" className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center"><Home size={21} /></button>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-4 py-5 sm:py-8">
          <div className="max-w-2xl mx-auto">
            {view === 'hub' && (
              <div className="grid gap-3" data-ui="grammar-category-list">
                {GRAMMAR_CATEGORIES_V3.map((item) => {
                  const Icon = icons[item.id];
                  return <button
                    key={item.id}
                    type="button"
                    data-category={item.id}
                    onClick={() => begin(item)}
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 flex items-center gap-4 text-left shadow-sm hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
                  >
                    <span className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/35 text-violet-700 dark:text-violet-200 flex items-center justify-center shrink-0"><Icon size={28} /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-2xl sm:text-3xl font-black">{item.title}</strong>
                      <span className="block mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{item.questions.length}問</span>
                    </span>
                    <ChevronRight size={28} className="text-slate-400 shrink-0" />
                  </button>;
                })}
              </div>
            )}

            {view === 'quiz' && category && question && (
              <section data-ui="grammar-quiz-question" data-question-id={question.id}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button type="button" onClick={() => setView('hub')} className="min-h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-1 text-sm font-bold"><ChevronLeft size={18} />3分野</button>
                  <div className="text-right">
                    <div className="font-black">{category.title}　{index + 1} / {questions.length}</div>
                    <div className={`text-xs font-black mt-0.5 ${question.level === '基本' ? 'text-emerald-600 dark:text-emerald-300' : question.level === '使い分け' ? 'text-amber-600 dark:text-amber-300' : 'text-violet-600 dark:text-violet-300'}`}>{question.level}</div>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-6" aria-hidden="true"><div className="h-full bg-violet-500 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>

                <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-black leading-relaxed whitespace-pre-wrap">{question.prompt}</h2>
                  <div className="grid gap-3 mt-6">
                    {question.choices.map((choice, choiceIndex) => {
                      const answered = selected !== null;
                      const correct = choiceIndex === question.correctIndex;
                      const picked = selected === choiceIndex;
                      const stateClass = !answered
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-violet-400'
                        : correct
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : picked
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 opacity-65';
                      return <button
                        key={choiceIndex}
                        type="button"
                        data-choice={choiceIndex}
                        disabled={answered}
                        onClick={() => answer(choiceIndex)}
                        className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-bold text-base sm:text-lg transition-colors ${stateClass}`}
                      >
                        <span className="inline-block w-7 text-slate-400">{String.fromCharCode(65 + choiceIndex)}</span>{choice}
                      </button>;
                    })}
                  </div>

                  {selected !== null && (
                    <div className={`mt-6 rounded-2xl p-4 ${selected === question.correctIndex ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}`} role="status" data-ui="grammar-feedback">
                      <div className="flex items-center gap-2 font-black text-lg">
                        {selected === question.correctIndex ? <CheckCircle2 size={22} className="text-emerald-600" /> : <XCircle size={22} className="text-rose-600" />}
                        {selected === question.correctIndex ? '正解' : `正解：${String.fromCharCode(65 + question.correctIndex)} ${question.choices[question.correctIndex]}`}
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-black tracking-wide text-slate-500 dark:text-slate-400">解説</div>
                        <p className="mt-1 leading-relaxed text-sm sm:text-base text-slate-700 dark:text-slate-200">{question.explanation}</p>
                      </div>
                      <div className="mt-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-slate-900/55 p-3" data-ui="grammar-example">
                        <div className="text-xs font-black text-violet-600 dark:text-violet-300">例文</div>
                        <p className="mt-1 text-base sm:text-lg font-bold leading-relaxed">{question.example}</p>
                      </div>
                      <button type="button" onClick={next} className="mt-4 w-full min-h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black flex items-center justify-center gap-2">
                        {index === questions.length - 1 ? '結果を見る' : '次の問題'}<ChevronRight size={19} />
                      </button>
                    </div>
                  )}
                </article>
              </section>
            )}

            {view === 'result' && category && (
              <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-9 text-center shadow-sm" data-ui="grammar-quiz-result">
                <div className="text-sm font-black text-violet-600 dark:text-violet-300">{category.title}</div>
                <h2 className="mt-2 text-4xl sm:text-5xl font-black">{score} / {questions.length}</h2>
                <div className="mt-6 grid gap-3">
                  {sessionMistakes.length > 0 && <button type="button" onClick={() => begin(category, sessionMistakes)} className="min-h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center justify-center gap-2"><RotateCcw size={18} />間違えた{sessionMistakes.length}問だけ</button>}
                  <button type="button" onClick={() => begin(category)} className="min-h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black">もう一度</button>
                  <button type="button" onClick={() => setView('hub')} className="min-h-12 rounded-xl border border-slate-300 dark:border-slate-700 font-black">3分野に戻る</button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>,
    document.body,
  )}</>;
}
