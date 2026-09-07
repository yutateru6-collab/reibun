import { createHash } from 'node:crypto';
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

const normalizeSourceText = (value: string) => value.replace(/\s+/g, ' ').trim();
const hashHopeLesson = (cards: { front: string; translation: string }[]) => {
  const canonical = cards
    .map((card) => `${normalizeSourceText(card.front)}\0${normalizeSourceText(card.translation)}`)
    .join('\n');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
};

const expectedHopeLessonCounts = [9, 8, 10, 11, 9, 7, 9, 9, 10, 9, 10, 9];
const expectedHopeTestCounts = [9, 8, 10, 11, 9, 7];

// Calculated directly from the attached Hope DOCX table (English + Japanese pairs),
// after collapsing whitespace only. This catches line-wrap loss without silently correcting source text.
const expectedHopeLessonHashes = [
  '4893c28ce1649e5da496cccf2bb3634efcdb58be93dbe176235af8bfc22c448d',
  'f2f62f9698cdcda680d51ae25e02b3c85f84ba9fe9ee883df13ed040c462d4c1',
  'ff7bbd2a454498bd1838152189203ee73e776a1fd7c99e01656bf27e65af3247',
  '2dee150a1a39a9dc907d910e43660d1e761488d3d35877eebab685c2ac584ab4',
  'bbef834c8ac37904a9998369b04bb6bb2a99262c99a20f7faffbd6c6cffff754',
  'e4bcfecd8a1bfdea2ee7bd4c2ae272736c18a2f23e54f957255b2b748d6bf754',
  'f1727d46469efd67d2539bef75b3a4480c2fccefb1f43e0abcb81499cc51f674',
  'd6a30cb93c18ef6dde81352a33d4ee85753a0243e227112e7aec284465b6ec85',
  '0fcc66f64b8643b4dc09232909ab7cac37eefdca932639737f68493abbab43cd',
  'c3fcb2b39b57a95f952dcf4b86c3a452d27c05f6e16e6d4100094bef91a02a0a',
  '125260336993cb8688e9feb815b3ba408ccee4496e9a0a3d203d6d6253bd89e4',
  'bcac43624d391ace04f811278307a25e9e3bf2732fc527ae6ef09e88127f63d4',
];

assert(CONTENT_VERSION === '2026-midterm-v1', 'Unexpected content version.');
assert(basicExampleDecks.length === 12, `Hope lesson deck count: ${basicExampleDecks.length}`);
assert(basicTestDecks.length === 6, `Hope official test deck count: ${basicTestDecks.length}`);

basicExampleDecks.forEach((deck, index) => {
  assert(deck.cards.length === expectedHopeLessonCounts[index], `${deck.id}: expected ${expectedHopeLessonCounts[index]}, got ${deck.cards.length}`);
  const actualHash = hashHopeLesson(deck.cards);
  assert(
    actualHash === expectedHopeLessonHashes[index],
    `${deck.id}: attached Hope DOCX source hash mismatch (${actualHash})`
  );
  deck.cards.forEach((card) => {
    assert(card.back === card.front, `${deck.id} card ${card.id}: Hope Example Bank back must exactly match front.`);
  });
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
assert(rangeSentenceDeck?.cards.length === 45, 'Current-range sentence deck must contain 45 cards.');
assert(rangeQuestionDeck?.cards.length === 66, 'Current-range question deck must contain 66 cards.');

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
  hopeSourceHashVerification: 'passed',
}, null, 2));
