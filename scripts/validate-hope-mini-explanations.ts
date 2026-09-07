import { basicExampleDecks, basicTestDecks } from '../src/data/cards';
import { hopeMiniExplanations } from '../src/data/hope_mini_explanations';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const cards = basicExampleDecks.flatMap((deck) => deck.cards);
const testCards = basicTestDecks.flatMap((deck) => deck.cards);
const ids = cards.map((card) => card.id);
const testIds = testCards.map((card) => card.id);
const explanationIds = Object.keys(hopeMiniExplanations).map(Number).sort((a, b) => a - b);

assert(basicExampleDecks.length === 12, `Expected 12 Hope lesson decks, got ${basicExampleDecks.length}.`);
assert(cards.length === 110, `Expected 110 Hope memorization cards, got ${cards.length}.`);
assert(basicTestDecks.length === 6, `Expected 6 Hope official-test decks, got ${basicTestDecks.length}.`);
assert(testCards.length === 54, `Expected 54 Hope official-test cards, got ${testCards.length}.`);
assert(explanationIds.length === 110, `Expected 110 mini explanations, got ${explanationIds.length}.`);
assert(new Set(ids).size === 110, 'Hope memorization card IDs must be unique.');
assert(new Set(testIds).size === 54, 'Hope official-test card IDs must be unique.');

for (let id = 4001; id <= 4110; id += 1) {
  assert(explanationIds.includes(id), `Missing mini explanation for Hope card ${id}.`);
}

for (const card of cards) {
  const expected = hopeMiniExplanations[card.id];
  assert(expected, `No mini explanation mapped for Hope card ${card.id}.`);
  assert(card.comment === expected, `Displayed comment does not use the mini explanation for card ${card.id}.`);
  assert(card.comment.startsWith('💡ミニ解説\n'), `Card ${card.id} must start with the mini-explanation label.`);
  assert(!card.comment.includes('【出典】'), `Card ${card.id} still exposes a source block in the memorization UI.`);
  assert(!card.comment.includes('Hope Example Bank Lesson'), `Card ${card.id} still exposes source metadata in the memorization UI.`);
  assert(card.comment.split('\n').length >= 3, `Card ${card.id} should include explanation plus a natural closing line.`);
  assert(card.comment.length >= 45, `Card ${card.id} explanation is too thin.`);
}

// Hope Test 1〜6 correspond one-to-one with Example Bank Lesson 1〜6.
// Test card ID = corresponding Example Bank card ID + 200.
for (let id = 4201; id <= 4254; id += 1) {
  assert(testIds.includes(id), `Missing Hope official-test card ${id}.`);
}

for (const card of testCards) {
  const sourceExampleId = card.id - 200;
  const expected = hopeMiniExplanations[sourceExampleId];
  assert(expected, `No source mini explanation mapped for Hope Test card ${card.id} -> Example ${sourceExampleId}.`);
  assert(card.comment === expected, `Hope Test card ${card.id} still does not display its mapped mini explanation.`);
  assert(card.comment.startsWith('💡ミニ解説\n'), `Hope Test card ${card.id} must start with the mini-explanation label.`);
  assert(!card.comment.includes('【出典】'), `Hope Test card ${card.id} still exposes the old source-only block.`);
  assert(!card.comment.includes('Hope Test'), `Hope Test card ${card.id} still exposes source metadata instead of the mini explanation.`);
  assert(card.comment.split('\n').length >= 3, `Hope Test card ${card.id} should include explanation plus a natural closing line.`);
  assert(card.comment.length >= 45, `Hope Test card ${card.id} explanation is too thin.`);
}

// The exact card reported from the live app must be protected explicitly.
const reportedCard = testCards.find((card) => card.id === 4207);
assert(reportedCard, 'Reported Hope Test1 No.7 card 4207 is missing.');
assert(reportedCard.back === 'To live is to learn.', 'Reported Test1 No.7 answer changed unexpectedly.');
assert(reportedCard.comment === hopeMiniExplanations[4007], 'Reported Test1 No.7 is not using the Lesson1 No.7 mini explanation.');
assert(!reportedCard.comment.includes('【出典】'), 'Reported Test1 No.7 still shows the source-only panel.');

// Representative checks across the 12 lessons to prevent accidental generic/filler replacement.
const representativeFragments: Record<number, string> = {
  4004: 'enable 人 to do',
  4015: 'break down',
  4026: 'is going to be held',
  4037: 'should have + 過去分詞',
  4046: 'to be discussed',
  4050: 'whose',
  4060: 'so + 形容詞 + that',
  4068: 'suggest that S + 動詞原形',
  4078: '混合仮定',
  4090: 'The number of',
  4099: 'The more',
  4110: 'hardly',
};

for (const [idText, fragment] of Object.entries(representativeFragments)) {
  const id = Number(idText);
  assert(hopeMiniExplanations[id].includes(fragment), `Card ${id} lost its intended grammar hook: ${fragment}`);
}

console.log(JSON.stringify({
  hopeMiniExplanationVerification: 'passed',
  lessonDecks: basicExampleDecks.length,
  memorizationCards: cards.length,
  officialTestDecks: basicTestDecks.length,
  officialTestCards: testCards.length,
  sourceMiniExplanations: explanationIds.length,
  hopeCardsShowingMiniExplanations: cards.length + testCards.length,
  sourceBlocksVisibleInHopeComments: 0,
  reportedTest1No7Protected: true,
}, null, 2));
