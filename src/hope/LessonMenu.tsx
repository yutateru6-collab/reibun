import { useState } from 'react';
import { BookOpen, Brain, ChevronLeft, ChevronRight, FilePenLine, Home, MoonStar, Shuffle, Sun, Timer } from 'lucide-react';
import type { Deck } from '../data/cards';
import type { HopeLesson } from './lessons';

type PracticeMode = 'order' | 'self' | 'time';
interface Props {
  lesson: HopeLesson;
  startWithCloze: boolean;
  dark: boolean;
  shuffle: boolean;
  timeLimit: number;
  answerTime: number;
  onBack: () => void;
  onHome: () => void;
  onTheme: () => void;
  onShuffle: (value: boolean) => void;
  onTimeLimit: (value: number) => void;
  onAnswerTime: (value: number) => void;
  onStudy: (deck: Deck) => void;
  onQuiz: (mode: PracticeMode, deck: Deck) => void;
}
const iconButton = 'min-w-11 min-h-11 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500';
const action = 'w-full min-h-[104px] flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left shadow-sm hover:border-indigo-400 dark:hover:border-indigo-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500';
const selectClass = 'w-full min-h-11 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2.5 text-base font-semibold text-slate-900 dark:text-slate-100';

export default function HopeLessonMenu(props: Props) {
  const { lesson, dark, onStudy, onQuiz } = props;
  const [useCloze, setUseCloze] = useState(props.startWithCloze && Boolean(lesson.cloze));
  const quizDeck = useCloze && lesson.cloze ? lesson.cloze : lesson.examples;
  return <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-900 px-4 py-4 sm:py-7 text-slate-900 dark:text-slate-100" data-ui="hope-lesson-menu" data-lesson={lesson.id}>
    <main className="w-full max-w-2xl mx-auto">
      <header className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" className={iconButton} aria-label="教材一覧へ戻る" onClick={props.onBack}><ChevronLeft size={22} /></button>
          <div><h1 className="text-xl sm:text-2xl font-black">{lesson.title}</h1><p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">{lesson.examples.cards.length}例文{lesson.cloze ? ` ・ 穴埋め${lesson.cloze.cards.length}問` : ''}</p></div>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={iconButton} aria-label="ホームへ戻る" onClick={props.onHome}><Home size={20} /></button>
          <button type="button" className={iconButton} aria-label="テーマ切り替え" onClick={props.onTheme}>{dark ? <Sun size={20} /> : <MoonStar size={20} />}</button>
        </div>
      </header>
      <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">同じ例文を、練習方法を変えて</h2>
      <div className="space-y-3" data-ui="hope-primary-modes">
        <button type="button" className={action} data-mode="learn" onClick={() => onStudy(lesson.examples)}>
          <span className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"><BookOpen size={27} /></span>
          <span className="flex-1 min-w-0"><span className="block text-lg sm:text-xl font-black">例文を覚える</span><span className="block text-sm text-slate-600 dark:text-slate-300 mt-1">英語から・日本語から切り替え</span></span><ChevronRight size={20} className="shrink-0 text-slate-400" />
        </button>
        {lesson.cloze && <button type="button" className={action} data-mode="cloze" onClick={() => onStudy(lesson.cloze!)}>
          <span className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"><FilePenLine size={27} /></span>
          <span className="flex-1 min-w-0"><span className="block text-lg sm:text-xl font-black">穴埋めで確認</span><span className="block text-sm text-slate-600 dark:text-slate-300 mt-1">元のテストと同じ空欄で練習</span></span><ChevronRight size={20} className="shrink-0 text-slate-400" />
        </button>}
        <button type="button" className={action} data-mode="order" onClick={() => onQuiz('order', lesson.examples)}>
          <span className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"><Shuffle size={27} /></span>
          <span className="flex-1 min-w-0"><span className="block text-lg sm:text-xl font-black">並べ替えで確認</span><span className="block text-sm text-slate-600 dark:text-slate-300 mt-1">同じ英文を語順から組み立てる</span></span><ChevronRight size={20} className="shrink-0 text-slate-400" />
        </button>
      </div>
      {!lesson.cloze && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-3">このLessonの元の穴埋め問題は未収録です。例文と並べ替えで練習できます。</p>}
      <label className="min-h-11 flex items-center gap-2.5 py-3 mt-2 text-sm font-semibold cursor-pointer"><input className="w-5 h-5 accent-indigo-600" type="checkbox" checked={props.shuffle} onChange={e => props.onShuffle(e.target.checked)} />カード表示順をシャッフル</label>
      <p className="-mt-1 mb-2 text-xs text-slate-500 dark:text-slate-400">※クイズはこの設定に関係なく、毎回問題順をシャッフルします。</p>
      <details className="mt-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" data-ui="hope-more-practice">
        <summary className="min-h-14 p-4 cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-indigo-500">その他の練習<span className="block text-xs font-normal text-slate-600 dark:text-slate-300 mt-1 ml-4">自己申告テスト・タイムアタック</span></summary>
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
          {lesson.cloze && <label className="block text-sm font-bold">出題内容<select className={`${selectClass} mt-2`} aria-label="その他の練習の出題内容" value={useCloze ? 'cloze' : 'examples'} onChange={e => setUseCloze(e.target.value === 'cloze')}><option value="examples">例文</option><option value="cloze">穴埋め（元の問題）</option></select></label>}
          <button type="button" onClick={() => onQuiz('self', quizDeck)} className="w-full min-h-14 flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 p-3 text-left focus-visible:outline-2 focus-visible:outline-emerald-500"><Brain size={23} /><span><strong className="block">自己申告テスト</strong><span className="block text-sm">「まだ・わかった」で確認</span></span><ChevronRight size={18} className="ml-auto" /></button>
          <section aria-label="タイムアタック設定"><h3 className="font-bold flex items-center gap-2 mb-3"><Timer size={21} />タイムアタック</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="text-sm font-semibold">考える時間<select className={`${selectClass} mt-1`} aria-label="問題を考える時間" value={props.timeLimit} onChange={e => props.onTimeLimit(Number(e.target.value))}>{[3,5,10,15].map(n => <option key={n} value={n}>{n}秒</option>)}</select></label>
              <label className="text-sm font-semibold">答え表示<select className={`${selectClass} mt-1`} aria-label="答えを表示する時間" value={props.answerTime} onChange={e => props.onAnswerTime(Number(e.target.value))}>{[1,2,3,5].map(n => <option key={n} value={n}>{n}秒</option>)}</select></label>
            </div>
            <button type="button" onClick={() => onQuiz('time', quizDeck)} className="w-full min-h-12 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold p-3 focus-visible:outline-2 focus-visible:outline-rose-400">タイムアタック開始</button>
          </section>
        </div>
      </details>
    </main>
  </div>;
}
