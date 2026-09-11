import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import {
  CURRENT_EXAM_RANGE_LABEL,
  GRAMMAR_UNITS,
  PERFECT_SUMMARY,
  type GrammarUnitId,
} from './data/grammar_review';

type GuideView = 'overview' | 'learn' | 'quiz' | 'perfect';

const TOP_SCREEN_GRID_SELECTOR = '[data-ui="compact-home-bento-v1"] .grid.grid-cols-2';

function unitById(id: GrammarUnitId) {
  return GRAMMAR_UNITS.find((unit) => unit.id === id) ?? GRAMMAR_UNITS[0];
}

export default function ExamRangeGuide() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<GuideView>('overview');
  const [unitId, setUnitId] = useState<GrammarUnitId>('tense-1');
  const [learnIndex, setLearnIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const selectedUnit = useMemo(() => unitById(unitId), [unitId]);
  const learnCard = selectedUnit.learnCards[learnIndex];
  const quizQuestion = selectedUnit.quizQuestions[quizIndex];

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const syncTarget = () => {
      const next = document.querySelector<HTMLElement>(TOP_SCREEN_GRID_SELECTOR);
      setPortalTarget((current) => (current === next ? current : next));
    };

    syncTarget();
    const observer = new MutationObserver(syncTarget);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const openOverview = () => {
    setView('overview');
    setIsOpen(true);
  };

  const openLearn = (nextUnitId: GrammarUnitId) => {
    setUnitId(nextUnitId);
    setLearnIndex(0);
    setShowAnswer(false);
    setView('learn');
    setIsOpen(true);
  };

  const openQuiz = (nextUnitId: GrammarUnitId) => {
    setUnitId(nextUnitId);
    setQuizIndex(0);
    setSelectedChoice(null);
    setQuizScore(0);
    setQuizFinished(false);
    setView('quiz');
    setIsOpen(true);
  };

  const answerQuiz = (choiceIndex: number) => {
    if (selectedChoice !== null || quizFinished) return;
    setSelectedChoice(choiceIndex);
    if (choiceIndex === quizQuestion.correctIndex) {
      setQuizScore((score) => score + 1);
    }
  };

  const advanceQuiz = () => {
    if (quizIndex >= selectedUnit.quizQuestions.length - 1) {
      setQuizFinished(true);
      return;
    }
    setQuizIndex((index) => index + 1);
    setSelectedChoice(null);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedChoice(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const topEntry = portalTarget
    ? createPortal(
        <button
          type="button"
          data-ui="exam-range-guide-entry"
          onClick={openOverview}
          aria-haspopup="dialog"
          className="order-first col-span-2 w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-fuchsia-200 dark:border-fuchsia-900/50 bg-gradient-to-br from-fuchsia-50 via-white to-indigo-50 dark:from-fuchsia-950/25 dark:via-slate-800 dark:to-indigo-950/25 p-4 sm:p-5 text-left shadow-sm hover:border-fuchsia-400 hover:shadow-md transition-all active:scale-[0.995]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/50 px-2.5 py-1 text-[10px] sm:text-xs font-black text-fuchsia-700 dark:text-fuchsia-300 mb-2">
                <Clock3 size={14} /> まず3分で全体像
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                今回の試験範囲 MAP
              </h2>
              <p className="mt-1 text-[11px] sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                覚える → 確かめる。画像を眺めるだけで終わらせない。
              </p>
            </div>
            <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-fuchsia-200 dark:shadow-none">
              <Brain size={23} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-700 px-2 py-2 text-center">
              <div className="text-[9px] sm:text-[10px] font-black text-purple-600 dark:text-purple-300">動詞②</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">S＝C / O＝C</div>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-700 px-2 py-2 text-center">
              <div className="text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-300">時制①</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">過去 ↔ 今</div>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-700 px-2 py-2 text-center">
              <div className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-300">時制②</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">未来の基準</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs sm:text-sm font-black text-fuchsia-700 dark:text-fuchsia-300">
            <span>{CURRENT_EXAM_RANGE_LABEL}</span>
            <span className="inline-flex items-center gap-1">開く <ChevronRight size={16} /></span>
          </div>
        </button>,
        portalTarget,
      )
    : null;

  return (
    <>
      {topEntry}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-slate-950/55 sm:p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="今回の試験範囲 学習ガイド"
            className="h-[100dvh] sm:h-[calc(100dvh-2rem)] sm:max-h-[900px] w-full sm:max-w-3xl sm:mx-auto bg-slate-50 dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <header className="shrink-0 px-3 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {view !== 'overview' ? (
                    <button
                      type="button"
                      onClick={() => setView('overview')}
                      aria-label="試験範囲MAPへ戻る"
                      className="min-w-11 min-h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center"
                    >
                      <ChevronLeft size={21} />
                    </button>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center shrink-0">
                      <Brain size={21} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] font-black tracking-wider text-fuchsia-600 dark:text-fuchsia-300">
                      {CURRENT_EXAM_RANGE_LABEL}
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white truncate">
                      {view === 'overview' && '今回の試験範囲 MAP'}
                      {view === 'learn' && `${selectedUnit.lesson} ${selectedUnit.title}｜覚える`}
                      {view === 'quiz' && `${selectedUnit.lesson} ${selectedUnit.title}｜確かめる`}
                      {view === 'perfect' && '完了形 30秒まとめ'}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="閉じる"
                  className="min-w-11 min-h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center"
                >
                  <X size={22} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 sm:py-5">
              {view === 'overview' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900/50 bg-fuchsia-50/80 dark:bg-fuchsia-950/20 p-4">
                    <div className="text-xs font-black text-fuchsia-700 dark:text-fuchsia-300 mb-1">最初にここだけ</div>
                    <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      ①ポイントを覚える → ②答えを隠して言えるか確認 → ③クイズで意味を使い分ける。
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      「用語を知っている」だけで終わらず、例文の中で判断できるところまで進めます。
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setView('perfect')}
                    className="w-full rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 p-4 text-left hover:border-rose-400 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black text-rose-600 dark:text-rose-300">画像の代わりにスマホで読める</div>
                        <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">完了形 30秒まとめ</div>
                        <div className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">現在完了・過去完了・未来完了を「基準時点」で比較</div>
                      </div>
                      <ChevronRight className="shrink-0 text-rose-500" size={24} />
                    </div>
                  </button>

                  <div className="space-y-3">
                    {GRAMMAR_UNITS.map((unit, unitIndex) => (
                      <div
                        key={unit.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black shrink-0">
                            {unitIndex + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-black text-purple-600 dark:text-purple-300">{unit.lesson}</div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{unit.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{unit.subtitle}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-3">
                          {unit.mapPoints.map((point) => (
                            <div key={point} className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                              {point}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => openLearn(unit.id)}
                            className="min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2"
                          >
                            <BookOpen size={17} /> 覚える
                          </button>
                          <button
                            type="button"
                            onClick={() => openQuiz(unit.id)}
                            className="min-h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={17} /> 確かめる
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'perfect' && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
                    <div className="text-xs font-black text-amber-700 dark:text-amber-300 mb-1">いちばん大事</div>
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      完了形は「どの時点を基準に見るか」で区別する。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PERFECT_SUMMARY.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.label}</h3>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-black text-slate-700 dark:text-slate-200">{item.form}</span>
                        </div>
                        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-3">
                          <div className="text-xs font-black text-fuchsia-700 dark:text-fuchsia-300">{item.reference}</div>
                          <div className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">{item.core}</div>
                          <div className="mt-2 text-center font-black tracking-wide text-xs sm:text-sm text-slate-700 dark:text-slate-200">{item.timeline}</div>
                        </div>
                        <div className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{item.example}</div>
                      </article>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-950 dark:text-blue-100 leading-relaxed">
                    <span className="font-black">未来完了の注意：</span> 開始点を「今」や「過去」に固定しない。未来のある時点を基準にして、「その時までにどうなっているか」を見る。
                  </div>
                </div>
              )}

              {view === 'learn' && learnCard && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-300">覚えるモード</div>
                    <div className="text-xs font-black text-slate-500 dark:text-slate-400">{learnIndex + 1} / {selectedUnit.learnCards.length}</div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${((learnIndex + 1) / selectedUnit.learnCards.length) * 100}%` }}
                    />
                  </div>

                  <article className="rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-sm">
                    <div className="text-[10px] font-black tracking-wider text-indigo-500 dark:text-indigo-300 mb-2">QUESTION</div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">{learnCard.prompt}</h3>

                    {!showAnswer ? (
                      <button
                        type="button"
                        onClick={() => setShowAnswer(true)}
                        className="mt-6 w-full min-h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base"
                      >
                        答えを見る
                      </button>
                    ) : (
                      <div className="mt-6 space-y-3 animate-in fade-in duration-200">
                        <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-200 dark:border-indigo-900/50 p-4">
                          <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 mb-1">ANSWER</div>
                          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">{learnCard.answer}</div>
                        </div>
                        {learnCard.example && (
                          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">EXAMPLE</div>
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">{learnCard.example}</div>
                          </div>
                        )}
                        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {learnCard.detail}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAnswer(false)}
                          className="w-full min-h-11 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-black text-slate-700 dark:text-slate-200"
                        >
                          もう一度隠す
                        </button>
                      </div>
                    )}
                  </article>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={learnIndex === 0}
                      onClick={() => {
                        setLearnIndex((index) => Math.max(0, index - 1));
                        setShowAnswer(false);
                      }}
                      className="min-h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-sm text-slate-700 dark:text-slate-200 disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      <ChevronLeft size={17} /> 前へ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (learnIndex >= selectedUnit.learnCards.length - 1) {
                          setLearnIndex(0);
                        } else {
                          setLearnIndex((index) => index + 1);
                        }
                        setShowAnswer(false);
                      }}
                      className="min-h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center gap-1"
                    >
                      {learnIndex >= selectedUnit.learnCards.length - 1 ? <><RotateCcw size={17} /> 最初から</> : <>次へ <ChevronRight size={17} /></>}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openQuiz(selectedUnit.id)}
                    className="w-full min-h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={17} /> 覚えたらクイズで確かめる
                  </button>
                </div>
              )}

              {view === 'quiz' && (
                <div className="space-y-4">
                  {!quizFinished && quizQuestion ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-300">確かめるモード</div>
                        <div className="text-xs font-black text-slate-500 dark:text-slate-400">{quizIndex + 1} / {selectedUnit.quizQuestions.length}</div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${((quizIndex + 1) / selectedUnit.quizQuestions.length) * 100}%` }}
                        />
                      </div>

                      <article className="rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-sm">
                        <div className="text-[10px] font-black tracking-wider text-emerald-600 dark:text-emerald-300 mb-2">QUIZ</div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">{quizQuestion.prompt}</h3>
                        {quizQuestion.example && (
                          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-3 text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                            {quizQuestion.example}
                          </div>
                        )}

                        <div className="mt-5 space-y-2">
                          {quizQuestion.choices.map((choice, choiceIndex) => {
                            const answered = selectedChoice !== null;
                            const isCorrectChoice = choiceIndex === quizQuestion.correctIndex;
                            const isSelected = choiceIndex === selectedChoice;
                            let choiceClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-emerald-400';
                            if (answered && isCorrectChoice) {
                              choiceClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                            } else if (answered && isSelected) {
                              choiceClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30';
                            } else if (answered) {
                              choiceClass = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 opacity-60';
                            }

                            return (
                              <button
                                type="button"
                                key={`${quizQuestion.id}-${choiceIndex}`}
                                disabled={answered}
                                onClick={() => answerQuiz(choiceIndex)}
                                className={`w-full min-h-12 rounded-xl border-2 px-3 py-3 text-left text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors ${choiceClass}`}
                              >
                                <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-2 text-xs font-black align-middle">
                                  {String.fromCharCode(65 + choiceIndex)}
                                </span>
                                {choice}
                              </button>
                            );
                          })}
                        </div>

                        {selectedChoice !== null && (
                          <div className="mt-5 animate-in fade-in duration-200">
                            <div className={`rounded-2xl border p-4 ${selectedChoice === quizQuestion.correctIndex ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20'}`}>
                              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                                {selectedChoice === quizQuestion.correctIndex ? <CheckCircle className="text-emerald-600" size={20} /> : <XCircle className="text-rose-600" size={20} />}
                                {selectedChoice === quizQuestion.correctIndex ? '正解' : `正解は ${String.fromCharCode(65 + quizQuestion.correctIndex)}`}
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{quizQuestion.explanation}</p>
                            </div>
                            <button
                              type="button"
                              onClick={advanceQuiz}
                              className="mt-3 w-full min-h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-1"
                            >
                              {quizIndex >= selectedUnit.quizQuestions.length - 1 ? '結果を見る' : <>次の問題 <ChevronRight size={17} /></>}
                            </button>
                          </div>
                        )}
                      </article>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-800 p-6 sm:p-8 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                        <CheckCircle size={32} />
                      </div>
                      <div className="mt-4 text-xs font-black text-emerald-600 dark:text-emerald-300">RESULT</div>
                      <div className="mt-1 text-4xl font-black text-slate-900 dark:text-white">{quizScore} / {selectedUnit.quizQuestions.length}</div>
                      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        点数だけで終わらず、迷った項目は「覚える」に戻って根拠を確認しよう。
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
                        <button
                          type="button"
                          onClick={restartQuiz}
                          className="min-h-12 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={17} /> もう一度
                        </button>
                        <button
                          type="button"
                          onClick={() => openLearn(selectedUnit.id)}
                          className="min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2"
                        >
                          <BookOpen size={17} /> 覚え直す
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
