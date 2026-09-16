import assert from 'node:assert/strict';
import { GRAMMAR_UNITS, type GrammarQuizQuestion } from '../src/data/grammar_review';
import {
  FINAL_CHECK_QUESTIONS,
  displayFinalCheckSolution,
  makeFinalCheckSet,
  prepareFinalCheckSession,
  type FinalCheckQuestion,
  type FinalCheckRange,
} from '../src/final-check/model';
import {
  BALANCED_CHOICE_LAYOUT_VERSION,
  answerPositionCounts,
  balanceFourChoicePositions,
  maxAnswerPositionStreak,
} from '../src/lib/balanced-choice-layout';

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function assertBalanced(questions: readonly { choices?: readonly string[]; correctIndex?: number }[], label: string) {
  const choiceCount = questions.filter(question => question.choices).length;
  const counts = answerPositionCounts(questions);
  assert.equal(counts.reduce((sum, count) => sum + count, 0), choiceCount, `${label}: choice count`);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${label}: unbalanced ${counts}`);
  assert.ok(maxAnswerPositionStreak(questions) <= 2, `${label}: three-position streak`);
}

function sorted(values: readonly string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function assertFinalContentUnchanged(
  source: readonly FinalCheckQuestion[],
  session: readonly FinalCheckQuestion[],
) {
  assert.deepEqual(session.map(question => question.id), source.map(question => question.id));
  const sourceById = new Map(source.map(question => [question.id, question]));
  for (const question of session) {
    const original = sourceById.get(question.id)!;
    assert.equal(question.prompt, original.prompt, `${question.id}: prompt changed`);
    assert.equal(question.solution, original.solution, `${question.id}: raw solution changed`);
    assert.equal(question.round, original.round, `${question.id}: round changed`);
    assert.equal(question.section, original.section, `${question.id}: section changed`);
    assert.equal(question.number, original.number, `${question.id}: number changed`);
    assert.equal(question.format, original.format, `${question.id}: format changed`);
    assert.equal(question.underlinedText, original.underlinedText, `${question.id}: underline changed`);
    if (!original.choices) {
      assert.equal(question.choices, undefined, `${question.id}: choices were added`);
      assert.equal(question.correctIndex, undefined, `${question.id}: correct index was added`);
      assert.equal(displayFinalCheckSolution(question), original.solution, `${question.id}: written solution display changed`);
      continue;
    }

    assert.deepEqual(sorted(question.choices!), sorted(original.choices), `${question.id}: choice text changed`);
    assert.equal(
      question.choices![question.correctIndex!],
      original.choices[original.correctIndex!],
      `${question.id}: correct answer text changed`,
    );
    const displayed = displayFinalCheckSolution(question);
    const [answerLine, ...bodyLines] = displayed.split('\n');
    assert.equal(answerLine, `正解：${String.fromCharCode(65 + question.correctIndex!)}`, `${question.id}: answer label`);
    assert.equal(
      bodyLines.join('\n'),
      original.solution.replace(/[①②③④]/, '').trimStart(),
      `${question.id}: explanation body changed`,
    );
  }
}

function assertGrammarContentUnchanged(
  source: readonly GrammarQuizQuestion[],
  session: readonly GrammarQuizQuestion[],
) {
  assert.deepEqual(session.map(question => question.id), source.map(question => question.id));
  const sourceById = new Map(source.map(question => [question.id, question]));
  for (const question of session) {
    const original = sourceById.get(question.id)!;
    assert.equal(question.prompt, original.prompt, `${question.id}: prompt changed`);
    assert.equal(question.example, original.example, `${question.id}: example changed`);
    assert.equal(question.explanation, original.explanation, `${question.id}: explanation changed`);
    assert.deepEqual(sorted(question.choices), sorted(original.choices), `${question.id}: choice text changed`);
    assert.equal(
      question.choices[question.correctIndex],
      original.choices[original.correctIndex],
      `${question.id}: correct answer text changed`,
    );
  }
}

assert.equal(BALANCED_CHOICE_LAYOUT_VERSION, 'balanced-session-choice-layout-v1');
const finalSourceSnapshot = JSON.stringify(FINAL_CHECK_QUESTIONS);
const grammarQuestions = GRAMMAR_UNITS.flatMap(unit => unit.quizQuestions);
const grammarSourceSnapshot = JSON.stringify(grammarQuestions);

const firstFullFinal = prepareFinalCheckSession(FINAL_CHECK_QUESTIONS, seeded(1));
assert.deepEqual(answerPositionCounts(firstFullFinal), [14, 14, 14, 14]);
assertBalanced(firstFullFinal, 'final/full');
assertFinalContentUnchanged(FINAL_CHECK_QUESTIONS, firstFullFinal);

const firstGrammar = balanceFourChoicePositions(grammarQuestions, seeded(2));
assertBalanced(firstGrammar, 'guide/all');
assertGrammarContentUnchanged(grammarQuestions, firstGrammar);

const ranges: FinalCheckRange[] = ['all', 'tense1', 'tense2', 'verb1', 'verb2'];
for (let seed = 0; seed < 10_000; seed += 1) {
  const fullFinal = prepareFinalCheckSession(FINAL_CHECK_QUESTIONS, seeded(seed));
  assert.deepEqual(answerPositionCounts(fullFinal), [14, 14, 14, 14], `final/full seed=${seed}`);
  assert.ok(maxAnswerPositionStreak(fullFinal) <= 2, `final/full streak seed=${seed}`);

  const range = ranges[seed % ranges.length];
  const available = range === 'all' ? 200 : FINAL_CHECK_QUESTIONS.filter(question => question.section === range).length;
  const count = Math.min([10, 20, 30, 50, 100, 200][seed % 6], available);
  const selected = makeFinalCheckSet(
    { range, strategy: seed % 2 ? 'random' : 'balanced', count },
    seeded(seed + 20_000),
  );
  assertBalanced(prepareFinalCheckSession(selected, seeded(seed + 30_000)), `final/${range}/${count}/seed=${seed}`);

  const guide = balanceFourChoicePositions(grammarQuestions, seeded(seed + 40_000));
  assertBalanced(guide, `guide/all/seed=${seed}`);
}

for (let seed = 0; seed < 100; seed += 1) {
  assertFinalContentUnchanged(FINAL_CHECK_QUESTIONS, prepareFinalCheckSession(FINAL_CHECK_QUESTIONS, seeded(seed)));
  assertGrammarContentUnchanged(grammarQuestions, balanceFourChoicePositions(grammarQuestions, seeded(seed)));
  assertBalanced(balanceFourChoicePositions(grammarQuestions.slice(0, 3), seeded(seed)), `guide/quick3/seed=${seed}`);
}

assert.equal(JSON.stringify(FINAL_CHECK_QUESTIONS), finalSourceSnapshot, 'final-check source bank was mutated');
assert.equal(JSON.stringify(grammarQuestions), grammarSourceSnapshot, 'grammar source bank was mutated');

console.log(JSON.stringify({
  status: 'passed',
  version: BALANCED_CHOICE_LAYOUT_VERSION,
  seededLayouts: 10_000,
  finalCheckChoices: FINAL_CHECK_QUESTIONS.filter(question => question.choices).length,
  finalCheckFullDistribution: answerPositionCounts(firstFullFinal),
  guideQuestions: grammarQuestions.length,
  sourceContentUnchanged: true,
  maximumAnswerPositionStreak: 2,
}, null, 2));
