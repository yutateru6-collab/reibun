import { readFileSync } from 'node:fs';
import { basicExampleDecks } from '../src/data/cards';
import { hopeExampleCards } from '../src/data/hope_example_bank';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const total = basicExampleDecks.reduce((sum, deck) => sum + deck.cards.length, 0);
assert(basicExampleDecks.length === 12, `Expected 12 Hope lesson decks, got ${basicExampleDecks.length}`);
assert(total === 110, `Expected exactly 110 attached Hope examples, got ${total}`);
assert(hopeExampleCards.length === 110, `Hope source must contain exactly 110 examples, got ${hopeExampleCards.length}`);

const activeCards = basicExampleDecks.flatMap((deck) => deck.cards);
const activeIds = activeCards.map((card) => card.id);
const expectedIds = Array.from({ length: 110 }, (_, index) => 4001 + index);
assert(
  JSON.stringify(activeIds) === JSON.stringify(expectedIds),
  'Active memorization examples must be exactly Hope IDs 4001-4110 in source order.'
);

const sourceById = new Map(hopeExampleCards.map((card) => [card.id, card]));
for (const deck of basicExampleDecks) {
  assert(deck.id.startsWith('hope-lesson'), `Unexpected memorization deck: ${deck.id}`);
  for (const card of deck.cards) {
    const source = sourceById.get(card.id);
    assert(source, `Card ${card.id} does not exist in the attached Hope Example Bank source.`);
    assert(card.front === source.front, `Card ${card.id} English differs from the attached Hope source.`);
    assert(card.translation === source.translation, `Card ${card.id} Japanese differs from the attached Hope source.`);
    assert(card.back === source.back, `Card ${card.id} answer differs from the attached Hope source.`);
  }
}

const cardsSource = readFileSync('src/data/cards.ts', 'utf8');
const forbiddenLegacyMarkers = [
  'const test1Cards',
  "id: 'test1'",
  'Test 1 (文の種類)',
  'Who plays the hero?',
  "You don't like cheese, do you?",
];

for (const marker of forbiddenLegacyMarkers) {
  assert(!cardsSource.includes(marker), `Legacy memorization content is still present in cards.ts: ${marker}`);
}

console.log(JSON.stringify({
  replacementVerification: 'passed',
  activeMemorizationDecks: basicExampleDecks.length,
  activeMemorizationCards: total,
  idRange: `${activeIds[0]}-${activeIds[activeIds.length - 1]}`,
  sourceDataMatchedExactly: true,
  legacyExampleBankPresent: false,
}, null, 2));
