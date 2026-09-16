import assert from 'node:assert/strict';
import generated from '../src/final-check/questions.generated.json';
import {
  FINAL_CHECK_FORMATS,
  FINAL_CHECK_QUESTIONS,
  FINAL_CHECK_SECTIONS,
  availableFor,
  makeFinalCheckSet,
  type FinalCheckSection,
} from '../src/final-check/model';

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

assert.equal(generated.meta.total, 200);
assert.equal(FINAL_CHECK_QUESTIONS.length, 200);
assert.equal(new Set(FINAL_CHECK_QUESTIONS.map(question => question.id)).size, 200);
assert.equal(generated.meta.questionSourceSha256, 'a20c7c355c390540e2c3ddf3a10000b150b47e18eae9ca8ddaa6e6f305f6432b');
assert.equal(generated.meta.answerSourceSha256, '54ce94f05afda0bb6994faa6e5d2e91984338acaa7d212c7e9d79c89bfa0d793');

const expectedPerRound: Record<FinalCheckSection, number> = { tense1: 26, tense2: 26, verb1: 25, verb2: 23 };
for (const round of [1, 2] as const) {
  for (const section of Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[]) {
    const scoped = FINAL_CHECK_QUESTIONS.filter(question => question.round === round && question.section === section);
    assert.equal(scoped.length, expectedPerRound[section]);
    assert.deepEqual(scoped.map(question => question.number), Array.from({ length: scoped.length }, (_, index) => index + 1));
  }
}

assert.deepEqual(
  Object.fromEntries((Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[]).map(section => [section, availableFor(section)])),
  { tense1: 52, tense2: 52, verb1: 50, verb2: 46 },
);
assert.equal(availableFor('all'), 200);

const formatCounts = Object.fromEntries(Object.keys(FINAL_CHECK_FORMATS).map(format => [
  format,
  FINAL_CHECK_QUESTIONS.filter(question => question.format === format).length,
]));
assert.deepEqual(formatCounts, { choice: 56, order: 49, fill: 44, correction: 42, rewrite: 6, written: 3 });

for (const question of FINAL_CHECK_QUESTIONS) {
  assert.ok(question.prompt.trim(), question.id);
  assert.ok(question.solution.trim(), question.id);
  if (question.choices) {
    assert.ok(question.choices.length >= 2, question.id);
    assert.equal(new Set(question.choices).size, question.choices.length, question.id);
    assert.ok(Number.isInteger(question.correctIndex), question.id);
    assert.ok(question.correctIndex! >= 0 && question.correctIndex! < question.choices.length, question.id);
  } else {
    assert.equal(question.correctIndex, undefined, question.id);
  }
}

for (let seed = 0; seed < 100; seed += 1) {
  for (const count of [10, 20, 30, 50, 100, 200]) {
    const set = makeFinalCheckSet({ range: 'all', strategy: 'balanced', count }, seeded(seed));
    assert.equal(set.length, count);
    assert.equal(new Set(set.map(question => question.id)).size, count);
    const counts = (Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[]).map(section => set.filter(question => question.section === section).length);
    if (count < 200) assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `unbalanced seed=${seed} count=${count}: ${counts}`);
    else assert.deepEqual(counts.sort((a, b) => a - b), [46, 50, 52, 52]);
  }
  const random = makeFinalCheckSet({ range: 'all', strategy: 'random', count: 50 }, seeded(seed));
  assert.equal(random.length, 50);
  assert.equal(new Set(random.map(question => question.id)).size, 50);
}

for (const section of Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[]) {
  const set = makeFinalCheckSet({ range: section, strategy: 'random', count: availableFor(section) }, seeded(9));
  assert.ok(set.every(question => question.section === section));
}

assert.throws(() => makeFinalCheckSet({ range: 'verb2', strategy: 'random', count: 47 }));
assert.throws(() => makeFinalCheckSet({ range: 'all', strategy: 'random', count: 0 }));

console.log(JSON.stringify({
  status: 'passed',
  total: FINAL_CHECK_QUESTIONS.length,
  sectionCounts: generated.meta.counts,
  formatCounts,
  balancedSeeds: 100,
}, null, 2));
