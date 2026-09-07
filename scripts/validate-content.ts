import {
  decks,
  basicExampleDecks,
  basicTestDecks,
  visionQuestSentenceBaseDecks,
  visionQuestQuestionBaseDecks,
  visionQuestSentenceDecks,
  visionQuestQuestionDecks,
} from '../src/data/cards';
import { hopeExampleCards, hopeTestCards } from '../src/data/hope_example_bank';
import {
  vq2_2_Cards,
  vq3_1_Cards,
  vq3_2_Cards,
  vq2_2_QuestionsCards,
  vq3_1_QuestionsCards,
  vq3_2_QuestionsCards,
} from '../src/data/vision_quest_exam_2026';
import { CONTENT_VERSION, examSourceLedger } from '../src/data/exam_source_ledger';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const expectedHopeLessonCounts = [9, 8, 10, 11, 9, 7, 9, 9, 10, 9, 10, 9];
const expectedHopeTestCounts = [9, 8, 10, 11, 9, 7];

assert(CONTENT_VERSION === '2026-midterm-v1', 'Unexpected content version.');
assert(basicExampleDecks.length === 12, `Hope lesson deck count: ${basicExampleDecks.length}`);
assert(basicTestDecks.length === 6, `Hope official test deck count: ${basicTestDecks.length}`);

basicExampleDecks.forEach((deck, index) => {
  assert(deck.cards.length === expectedHopeLessonCounts[index], `${deck.id}: expected ${expectedHopeLessonCounts[index]}, got ${deck.cards.length}`);
});
basicTestDecks.forEach((deck, index) => {
  assert(deck.cards.length === expectedHopeTestCounts[index], `${deck.id}: expected ${expectedHopeTestCounts[index]}, got ${deck.cards.length}`);
});

assert(hopeExampleCards.length === 110, `Hope Example Bank count: ${hopeExampleCards.length}`);
assert(hopeTestCards.length === 54, `Hope official test count: ${hopeTestCards.length}`);

assert(vq2_2_Cards.length === 13, `VQ 2-2 core count: ${vq2_2_Cards.length}`);
assert(vq3_1_Cards.length === 14, `VQ 3-1 core count: ${vq3_1_Cards.length}`);
assert(vq3_2_Cards.length === 18, `VQ 3-2 core count: ${vq3_2_Cards.length}`);
assert(vq2_2_Cards.length + vq3_1_Cards.length + vq3_2_Cards.length === 45, 'VQ core total must be 45.');

assert(vq2_2_QuestionsCards.length === 20, `VQ 2-2 visible exercise count: ${vq2_2_QuestionsCards.length}`);
assert(vq3_1_QuestionsCards.length === 23, `VQ 3-1 visible exercise count: ${vq3_1_QuestionsCards.length}`);
assert(vq3_2_QuestionsCards.length === 23, `VQ 3-2 visible exercise count: ${vq3_2_QuestionsCards.length}`);
assert(
  vq2_2_QuestionsCards.length + vq3_1_QuestionsCards.length + vq3_2_QuestionsCards.length === 66,
  'VQ visible exercise total must be 66.'
);

assert(examSourceLedger.counts.hopeExampleBank === 110, 'Ledger Hope count mismatch.');
assert(examSourceLedger.counts.hopeOfficialTests === 54, 'Ledger Hope test count mismatch.');
assert(examSourceLedger.counts.vqCore === 45, 'Ledger VQ core count mismatch.');
assert(examSourceLedger.counts.vqExercisesTotal === 75, 'Ledger VQ exercise total mismatch.');
assert(examSourceLedger.counts.vqExercisesVisible === 66, 'Ledger VQ visible count mismatch.');
assert(examSourceLedger.counts.vqExercisesBlockedByMissingImages === 9, 'Ledger blocked count mismatch.');
assert(examSourceLedger.blockedDescriptionItems.length === 9, 'Blocked Description list must contain 9 items.');
assert(examSourceLedger.supportItems.length === 18, 'Support ledger must contain 18 items.');
assert(examSourceLedger.sourceWarnings.length >= 5, 'Known source warnings must remain recorded.');

const allCards = decks.flatMap((deck) => deck.cards);
const ids = allCards.map((card) => card.id);
assert(ids.length === new Set(ids).size, 'Card IDs in active content decks must be globally unique.');

for (const card of allCards) {
  assert(Number.isInteger(card.id), `Non-integer card id: ${card.id}`);
  assert(card.front.trim().length > 0, `Empty front: ${card.id}`);
  assert(card.back.trim().length > 0, `Empty back: ${card.id}`);
  assert(card.translation.trim().length > 0, `Empty translation: ${card.id}`);
}

const rangeSentenceDeck = visionQuestSentenceDecks.find((deck) => deck.id === 'vq-current-range');
const rangeQuestionDeck = visionQuestQuestionDecks.find((deck) => deck.id === 'vq-current-range-q');
assert(rangeSentenceDeck?.cards.length === 45, `Current-range sentence deck must contain 45 cards.`);
assert(rangeQuestionDeck?.cards.length === 66, `Current-range question deck must contain 66 cards.`);

assert(
  visionQuestSentenceBaseDecks.some((deck) => deck.id === 'vq-lesson2-2') &&
  visionQuestSentenceBaseDecks.some((deck) => deck.id === 'vq-lesson3-1') &&
  visionQuestSentenceBaseDecks.some((deck) => deck.id === 'vq-lesson3-2'),
  'New VQ sentence decks are missing.'
);
assert(
  visionQuestQuestionBaseDecks.some((deck) => deck.id === 'vq-lesson2-2-q') &&
  visionQuestQuestionBaseDecks.some((deck) => deck.id === 'vq-lesson3-1-q') &&
  visionQuestQuestionBaseDecks.some((deck) => deck.id === 'vq-lesson3-2-q'),
  'New VQ question decks are missing.'
);

assert(
  !visionQuestSentenceBaseDecks.some((deck) => deck.id.startsWith('vq-lesson4')),
  'Lesson 4 must not be added to the current VQ range implementation.'
);

console.log(JSON.stringify({
  contentVersion: CONTENT_VERSION,
  hopeExamples: hopeExampleCards.length,
  hopeOfficialTests: hopeTestCards.length,
  vqCore: 45,
  vqVisibleExercises: 66,
  vqBlockedDescriptions: examSourceLedger.blockedDescriptionItems.length,
  activeCards: allCards.length,
}, null, 2));
