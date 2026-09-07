export interface Card {
  id: number;
  front: string;
  translation: string;
  comment: string;
  hint: string;
  back: string;
}

import { vq1_1_QuestionsCards, vq1_2_QuestionsCards, vq2_1_QuestionsCards } from './questions';
import { vq1_Cards, vq1_1_Cards, vq1_2_Cards, vq2_Cards, vq2_1_Cards } from './vision_quest_sentences';
import { hopeMiniExplanations } from './hope_mini_explanations';
import {
  hopeLesson1Cards,
  hopeLesson2Cards,
  hopeLesson3Cards,
  hopeLesson4Cards,
  hopeLesson5Cards,
  hopeLesson6Cards,
  hopeLesson7Cards,
  hopeLesson8Cards,
  hopeLesson9Cards,
  hopeLesson10Cards,
  hopeLesson11Cards,
  hopeLesson12Cards,
  hopeTest1Cards,
  hopeTest2Cards,
  hopeTest3Cards,
  hopeTest4Cards,
  hopeTest5Cards,
  hopeTest6Cards,
} from './hope_example_bank';
import {
  vq2_2_Cards,
  vq3_1_Cards,
  vq3_2_Cards,
  vq2_2_QuestionsCards,
  vq3_1_QuestionsCards,
  vq3_2_QuestionsCards,
} from './vision_quest_exam_2026';

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}

const withHopeMiniExplanations = (cards: Card[]): Card[] =>
  cards.map((card) => ({
    ...card,
    comment: hopeMiniExplanations[card.id] ?? card.comment,
  }));

// Hope Test 1〜6 は Hope Example Bank Lesson 1〜6 と同じ54例文に対応する。
// Test card IDs 4201〜4254 は対応する Example Bank IDs 4001〜4054 のちょうど +200 なので、
// 公式穴埋めでも同じミニ解説を表示する。原資料の英文・和訳・空欄・正答は変更しない。
const withHopeOfficialTestMiniExplanations = (cards: Card[]): Card[] =>
  cards.map((card) => ({
    ...card,
    comment: hopeMiniExplanations[card.id - 200] ?? card.comment,
  }));

// 暗唱例文は、今回添付された Hope Example Bank 110文だけを正式データとして使用する。
// 追加前に入っていた旧 Test 1〜10 の暗唱例文データは削除済み。
// 表示用の comment は、暗記のフックになる「ミニ解説」に差し替える。
export const basicExampleDecks: Deck[] = [
  { id: 'hope-lesson1', title: 'Lesson 1', description: 'Example Bank p.8', cards: withHopeMiniExplanations(hopeLesson1Cards) },
  { id: 'hope-lesson2', title: 'Lesson 2', description: 'Example Bank p.12', cards: withHopeMiniExplanations(hopeLesson2Cards) },
  { id: 'hope-lesson3', title: 'Lesson 3', description: 'Example Bank p.18', cards: withHopeMiniExplanations(hopeLesson3Cards) },
  { id: 'hope-lesson4', title: 'Lesson 4', description: 'Example Bank p.22', cards: withHopeMiniExplanations(hopeLesson4Cards) },
  { id: 'hope-lesson5', title: 'Lesson 5', description: 'Example Bank p.28', cards: withHopeMiniExplanations(hopeLesson5Cards) },
  { id: 'hope-lesson6', title: 'Lesson 6', description: 'Example Bank p.32', cards: withHopeMiniExplanations(hopeLesson6Cards) },
  { id: 'hope-lesson7', title: 'Lesson 7', description: 'Example Bank p.38', cards: withHopeMiniExplanations(hopeLesson7Cards) },
  { id: 'hope-lesson8', title: 'Lesson 8', description: 'Example Bank p.42', cards: withHopeMiniExplanations(hopeLesson8Cards) },
  { id: 'hope-lesson9', title: 'Lesson 9', description: 'Example Bank p.48', cards: withHopeMiniExplanations(hopeLesson9Cards) },
  { id: 'hope-lesson10', title: 'Lesson 10', description: 'Example Bank p.52', cards: withHopeMiniExplanations(hopeLesson10Cards) },
  { id: 'hope-lesson11', title: 'Lesson 11', description: 'Example Bank p.58', cards: withHopeMiniExplanations(hopeLesson11Cards) },
  { id: 'hope-lesson12', title: 'Lesson 12', description: 'Example Bank p.62', cards: withHopeMiniExplanations(hopeLesson12Cards) },
];

// こちらは今回添付された Hope Test 1〜6 の公式穴埋め。旧暗唱例文とは別データ。
// 出題文は公式穴埋めを維持しつつ、答え確認時の comment は対応するミニ解説を表示する。
export const basicTestDecks: Deck[] = [
  { id: 'hope-test1', title: 'Test 1', description: '適切な主語を用いる', cards: withHopeOfficialTestMiniExplanations(hopeTest1Cards) },
  { id: 'hope-test2', title: 'Test 2', description: '適切な動詞を用いる', cards: withHopeOfficialTestMiniExplanations(hopeTest2Cards) },
  { id: 'hope-test3', title: 'Test 3', description: 'Hope公式穴埋め', cards: withHopeOfficialTestMiniExplanations(hopeTest3Cards) },
  { id: 'hope-test4', title: 'Test 4', description: 'Hope公式穴埋め', cards: withHopeOfficialTestMiniExplanations(hopeTest4Cards) },
  { id: 'hope-test5', title: 'Test 5', description: 'Hope公式穴埋め', cards: withHopeOfficialTestMiniExplanations(hopeTest5Cards) },
  { id: 'hope-test6', title: 'Test 6', description: 'Hope公式穴埋め', cards: withHopeOfficialTestMiniExplanations(hopeTest6Cards) },
];

export const visionQuestSentenceBaseDecks: Deck[] = [
  { id: 'vq-lesson1', title: 'Lesson 1', description: '主語', cards: vq1_Cards },
  { id: 'vq-lesson1-1', title: 'Lesson 1-1', description: '主語①', cards: vq1_1_Cards },
  { id: 'vq-lesson1-2', title: 'Lesson 1-2', description: '主語②', cards: vq1_2_Cards },
  { id: 'vq-lesson2', title: 'Lesson 2', description: '動詞', cards: vq2_Cards },
  { id: 'vq-lesson2-1', title: 'Lesson 2-1', description: '動詞①', cards: vq2_1_Cards },
  { id: 'vq-lesson2-2', title: 'Lesson 2-2', description: '動詞②', cards: vq2_2_Cards },
  { id: 'vq-lesson3-1', title: 'Lesson 3-1', description: '時制・完了形①', cards: vq3_1_Cards },
  { id: 'vq-lesson3-2', title: 'Lesson 3-2', description: '時制・完了形②', cards: vq3_2_Cards },
];

export const visionQuestQuestionBaseDecks: Deck[] = [
  { id: 'vq-lesson1-1-q', title: 'Lesson 1-1', description: '主語①', cards: vq1_1_QuestionsCards },
  { id: 'vq-lesson1-2-q', title: 'Lesson 1-2', description: '主語②', cards: vq1_2_QuestionsCards },
  { id: 'vq-lesson2-1-q', title: 'Lesson 2-1', description: '動詞①', cards: vq2_1_QuestionsCards },
  { id: 'vq-lesson2-2-q', title: 'Lesson 2-2 問題', description: '動詞②（画像依存3問は未収録）', cards: vq2_2_QuestionsCards },
  { id: 'vq-lesson3-1-q', title: 'Lesson 3-1 問題', description: '時制・完了形①（画像依存3問は未収録）', cards: vq3_1_QuestionsCards },
  { id: 'vq-lesson3-2-q', title: 'Lesson 3-2 問題', description: '時制・完了形②（画像依存3問は未収録）', cards: vq3_2_QuestionsCards },
];

const currentRangeSentenceDeck: Deck = {
  id: 'vq-current-range',
  title: '今回の試験範囲まとめ',
  description: 'Lesson 2-2 / 3-1 / 3-2・基本例文45文',
  cards: [...vq2_2_Cards, ...vq3_1_Cards, ...vq3_2_Cards],
};

const currentRangeQuestionDeck: Deck = {
  id: 'vq-current-range-q',
  title: '今回の試験範囲まとめ',
  description: 'Lesson 2-2 / 3-1 / 3-2・出題可能66問',
  cards: [...vq2_2_QuestionsCards, ...vq3_1_QuestionsCards, ...vq3_2_QuestionsCards],
};

export const visionQuestSentenceDecks: Deck[] = [
  currentRangeSentenceDeck,
  ...visionQuestSentenceBaseDecks,
];

export const visionQuestQuestionDecks: Deck[] = [
  currentRangeQuestionDeck,
  ...visionQuestQuestionBaseDecks,
];

// Active content registry. Combined “current range” decks are views only and are intentionally
// excluded here so favorites / “まだ” lists do not duplicate the same card IDs.
export const decks: Deck[] = [
  ...basicExampleDecks,
  ...basicTestDecks,
  ...visionQuestSentenceBaseDecks,
  ...visionQuestQuestionBaseDecks,
];
