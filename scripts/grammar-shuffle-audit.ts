import assert from 'node:assert/strict';
import {
  GRAMMAR_CATEGORIES_V3,
  answerPositionCounts,
} from '../src/knowledge/grammar_curriculum_v3';
import {
  GRAMMAR_SHUFFLE_VERSION,
  shuffleGrammarQuestions,
  shuffleRemainingGrammarQuestions,
} from '../src/knowledge/grammar_shuffle';

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

assert.equal(GRAMMAR_SHUFFLE_VERSION, 'level-block-question-shuffle-v1');

for (const category of GRAMMAR_CATEGORIES_V3) {
  const originalIds = category.questions.map((question) => question.id);
  const originalSnapshot = JSON.stringify(category.questions);
  const uniqueOrders = new Set<string>();

  for (let seed = 1; seed <= 50; seed += 1) {
    const shuffled = shuffleGrammarQuestions(category.questions, seeded(seed));
    const shuffledIds = shuffled.map((question) => question.id);
    uniqueOrders.add(shuffledIds.join(','));

    assert.equal(shuffled.length, category.questions.length);
    assert.deepEqual([...shuffledIds].sort(), [...originalIds].sort(), `${category.id}: shuffle lost or duplicated a question`);
    assert.ok(shuffled.slice(0, 16).every((question) => question.level === '基本'), `${category.id}: basic block broken`);
    assert.ok(shuffled.slice(16, 28).every((question) => question.level === '使い分け'), `${category.id}: usage block broken`);
    assert.ok(shuffled.slice(28).every((question) => question.level === '応用'), `${category.id}: application block broken`);
    assert.deepEqual(answerPositionCounts(shuffled), [10, 10, 10, 10], `${category.id}: answer balance changed`);
  }

  assert.ok(uniqueOrders.size >= 45, `${category.id}: insufficient shuffle diversity (${uniqueOrders.size}/50)`);
  assert.equal(JSON.stringify(category.questions), originalSnapshot, `${category.id}: source bank was mutated`);

  const first = shuffleGrammarQuestions(category.questions, seeded(77));
  const second = shuffleRemainingGrammarQuestions(first, 10, seeded(88));
  assert.deepEqual(second.slice(0, 10).map((q) => q.id), first.slice(0, 10).map((q) => q.id), `${category.id}: scored prefix moved`);
  assert.deepEqual([...second.slice(10).map((q) => q.id)].sort(), [...first.slice(10).map((q) => q.id)].sort(), `${category.id}: remaining shuffle changed membership`);
  assert.notDeepEqual(second.map((q) => q.id), first.map((q) => q.id), `${category.id}: remaining shuffle must visibly change order`);
}

console.log('Grammar shuffle audit PASS: 3 categories, 50 seeded runs each, level blocks preserved, no loss/duplication, A-D balance preserved, remaining-only shuffle verified.');
