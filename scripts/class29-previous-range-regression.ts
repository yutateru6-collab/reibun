import assert from 'node:assert/strict';
import { decks } from '../src/data/cards';
import {
  class29ComparisonCards,
  class29PreviousAllDeck,
  class29PreviousDecks,
  class29RelativeClauseCards,
  class29SubjunctiveCards,
} from '../src/data/class29_previous_examples';

assert.deepEqual(
  class29PreviousDecks.map(deck => [deck.title, deck.cards.length]),
  [['関係詞', 28], ['比較', 14], ['仮定法', 16]],
);
assert.equal(class29RelativeClauseCards[0].id, 171);
assert.equal(class29ComparisonCards[0].id, 199);
assert.equal(class29SubjunctiveCards[0].id, 213);
assert.equal(class29SubjunctiveCards.at(-1)?.id, 228);

const sourceCards = class29PreviousDecks.flatMap(deck => deck.cards);
assert.equal(sourceCards.length, 58);
assert.deepEqual(sourceCards.map(card => card.id), Array.from({ length: 58 }, (_, index) => 171 + index));
assert.deepEqual(class29PreviousAllDeck.cards, sourceCards);
assert.match(class29PreviousAllDeck.description, /比較・関係詞・仮定法/);

for (const deck of class29PreviousDecks) {
  assert.equal(decks.filter(active => active.id === deck.id).length, 1, `${deck.id} is missing from active content`);
}
assert.equal(decks.some(deck => deck.id === class29PreviousAllDeck.id), false, 'Combined view must not duplicate cards in storage');
assert.equal(new Set(sourceCards.map(card => card.id)).size, 58);
assert.ok(sourceCards.every(card => card.front.includes('　') || card.front.includes('(which)')), 'Every restored item must retain its original prompt');

console.log('PASS: 2-9 previous range restored as relative clauses 28 / comparison 14 / subjunctive 16 / combined 58');
