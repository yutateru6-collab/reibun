import { ChevronDown, Lightbulb, RotateCcw } from 'lucide-react';
import type { Card } from '../data/cards';
import { highlightAnswers } from '../lib/highlight-answers';

interface Props {
  card: Card;
  cloze: boolean;
  japaneseFirst: boolean;
  revealed: boolean;
  commentOpen: boolean;
  onFlip: () => void;
  onComment: () => void;
}

export default function HopeStudyCard({ card, cloze, japaneseFirst, revealed, commentOpen, onFlip, onComment }: Props) {
  const front = japaneseFirst ? card.translation : card.front;
  const answer = japaneseFirst ? card.back : card.translation;
  const cue = revealed ? 'タップして問題に戻る' : cloze ? 'タップして解答を見る' : japaneseFirst ? 'タップして英文を見る' : 'タップして日本語訳を見る';
  return <section className="w-full rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden" data-ui="hope-study-card" data-card-id={card.id} data-revealed={revealed}>
    <button type="button" onClick={onFlip} aria-label={cue} className="w-full min-h-[300px] sm:min-h-[350px] p-6 sm:p-9 flex flex-col items-center justify-center text-center focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-[-4px]">
      <span className="block text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-5">{cloze ? (revealed ? '解答' : '穴埋め｜元の問題') : (revealed ? (japaneseFirst ? '英語' : '日本語') : (japaneseFirst ? '日本語' : '英語'))}</span>
      <span data-ui="hope-card-main" className={`block w-full text-2xl sm:text-3xl font-bold leading-relaxed whitespace-pre-wrap break-words ${revealed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100'}`}>
        {cloze ? (revealed ? highlightAnswers(card.front, card.back) : card.front) : (revealed ? answer : front)}
      </span>
      {(cloze || revealed) && <span data-ui="hope-card-secondary" className="block mt-6 text-lg sm:text-xl leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{cloze ? card.translation : front}</span>}
      <span className="mt-7 flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400"><RotateCcw size={15} />{cue}</span>
    </button>
    {revealed && card.comment && <div className="px-5 pb-5 sm:px-8 sm:pb-7">
      <button type="button" onClick={onComment} aria-expanded={commentOpen} aria-controls={`hope-comment-${card.id}`} className="w-full min-h-12 flex items-center justify-between gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 font-bold text-sm focus-visible:outline-2 focus-visible:outline-purple-400"><span className="flex items-center gap-2"><Lightbulb size={18} />{commentOpen ? 'ミニ解説を閉じる' : 'ミニ解説を見る'}</span><ChevronDown size={18} className={commentOpen ? 'rotate-180' : ''} /></button>
      {commentOpen && <p id={`hope-comment-${card.id}`} className="mt-3 text-base leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">{card.comment}</p>}
    </div>}
  </section>;
}
