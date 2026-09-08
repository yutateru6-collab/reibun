import assert from 'node:assert/strict';
import { highlightAnswers } from '../src/lib/highlight-answers';
import { decks } from '../src/data/cards';

assert.equal(highlightAnswers('I ( ) happy.', 'I am happy.'), 'I [am] happy.');
assert.equal(highlightAnswers('I ____ happy.', 'I am happy.'), 'I [am] happy.');
assert.equal(highlightAnswers('I ( am / is ) happy.', 'I am happy.'), 'I [am] happy.');
assert.equal(highlightAnswers('説明\nHe ( ) ( ) there.', 'He has been there.'), 'He [has been] there.');
assert.equal(highlightAnswers('I ( ) happy.', 'She was tired.'), 'She was tired.');
assert.equal(highlightAnswers('is ( )', 'Is it'), 'Is [it]');
for (const card of decks.flatMap(deck => deck.cards)) {
  const displayed = highlightAnswers(card.front, card.back);
  assert.equal(displayed.replace(/[\[\]]/g, ''), card.back.replace(/[\[\]]/g, ''), `answer wording changed: ${card.id}`);
}
console.log('PASS: placeholder regression cases and every answer preserve source wording without looping');
