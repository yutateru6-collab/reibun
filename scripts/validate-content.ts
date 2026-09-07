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

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
const normalizeSourceText = (value: string) => value.replace(/\s+/g, ' ').trim();
const hashBilingualCards = (cards: { front: string; translation: string }[]) => {
  const canonical = cards
    .map((card) => `${normalizeSourceText(card.front)}\0${normalizeSourceText(card.translation)}`)
    .join('\n');
  return sha256(canonical);
};

const normalizeHopeTestFront = (value: string) =>
  value
    .replace(/\(\s*\)/g, '()')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+([.,?!])/g, '$1')
    .replace(/\)\s+\(/g, ')(');
const normalizeJapaneseNoWhitespace = (value: string) => value.replace(/\s+/g, '');
const hashHopeTest = (cards: { front: string; translation: string }[]) => {
  const canonical = cards
    .map((card) => `${normalizeHopeTestFront(card.front)}\0${normalizeJapaneseNoWhitespace(card.translation)}`)
    .join('\n');
  return sha256(canonical);
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

// Calculated from the six attached Hope Test PDFs. Blank widths and whitespace are normalized,
// but the printed wording, blank count and Japanese wording remain source-controlled.
const expectedHopeTestHashes = [
  '25fea2db8730b3d6cf6bd777b34fcb6931dd698b807dd7550a28abe0b0fbf237',
  '39f3aa3559a001f6a7809658a8875fff0ad8416d5697b50b9829e1ee1484c87f',
  '88a636c22fa6e3e06c26db06880f46483d481b3ef171966d3c8c5ad7ba5a50c7',
  '7ae7ad5f86d49f99af1235aea1c6be90293ecbed8f56e8fa1cc61fea33de58eb',
  'afb744c1a4ea09783483635f294d463baf780e0c67ab26fe24f5dba247854c28',
  '83fc38d8542207061cdb39ef88d396c49c8847bca8edae416a2bf62018a2dbab',
];

// Calculated from numbered basic examples 42-86 in the attached Vision Quest source text.
const expectedVqCoreHashes = [
  '95437600c9eaa9dd7206237592e5eb855ef1d4297195afb71835ca3a4754af75',
  '3a992dbdfb763799a3e49c626bc3e730975b2a2853f7a0a9c78205958219010b',
  '6b04179b5ef6624dd9c40b7960e6f95b751d82acbbccac527f72d51430e28cd3',
];

assert(CONTENT_VERSION === '2026-midterm-v1', 'Unexpected content version.');
assert(basicExampleDecks.length === 12, `Hope lesson deck count: ${basicExampleDecks.length}`);
assert(basicTestDecks.length === 6, `Hope official test deck count: ${basicTestDecks.length}`);

basicExampleDecks.forEach((deck, index) => {
  assert(deck.cards.length === expectedHopeLessonCounts[index], `${deck.id}: expected ${expectedHopeLessonCounts[index]}, got ${deck.cards.length}`);
  const actualHash = hashBilingualCards(deck.cards);
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
  const actualHash = hashHopeTest(deck.cards);
  assert(
    actualHash === expectedHopeTestHashes[index],
    `${deck.id}: attached Hope Test PDF source hash mismatch (${actualHash})`
  );
  deck.cards.forEach((card, cardIndex) => {
    const example = basicExampleDecks[index].cards[cardIndex];
    assert(
      card.back === example.front,
      `${deck.id} card ${card.id}: answer must match the corresponding Hope Example Bank sentence.`
    );
  });
});

assert(hopeExampleCards.length === 110, `Hope Example Bank count: ${hopeExampleCards.length}`);
assert(hopeTestCards.length === 54, `Hope official test count: ${hopeTestCards.length}`);

const vqCoreDecks = [vq2_2_Cards, vq3_1_Cards, vq3_2_Cards];
vqCoreDecks.forEach((cards, index) => {
  const actualHash = hashBilingualCards(cards);
  assert(
    actualHash === expectedVqCoreHashes[index],
    `VQ core source hash mismatch for group ${index + 1} (${actualHash})`
  );
  cards.forEach((card) => assert(card.back === card.front, `VQ core card ${card.id}: back must exactly match front.`));
});

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
  hopeDocxHashVerification: 'passed',
  hopeTestPdfHashVerification: 'passed',
  vqCoreHashVerification: 'passed',
}, null, 2));
