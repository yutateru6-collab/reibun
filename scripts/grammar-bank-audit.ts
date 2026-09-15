import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  GRAMMAR_ANSWER_LAYOUT_VERSION,
  GRAMMAR_CATEGORIES_V3,
  TOTAL_GRAMMAR_QUESTIONS_V3,
  answerPositionCounts,
} from '../src/knowledge/grammar_curriculum_v3';

const outDir = path.join('audit', 'grammar-bank');
fs.mkdirSync(outDir, { recursive: true });

assert.equal(GRAMMAR_ANSWER_LAYOUT_VERSION, 'balanced-answer-layout-40x3-v1');
assert.deepEqual(GRAMMAR_CATEGORIES_V3.map((category) => category.id), ['perfect', 'future', 'countable']);
assert.deepEqual(GRAMMAR_CATEGORIES_V3.map((category) => category.questions.length), [40, 40, 40]);
assert.equal(TOTAL_GRAMMAR_QUESTIONS_V3, 120);

const allQuestions = GRAMMAR_CATEGORIES_V3.flatMap((category) => category.questions);
assert.equal(new Set(allQuestions.map((question) => question.id)).size, 120, 'question IDs must be unique');
assert.equal(new Set(allQuestions.map((question) => question.prompt)).size, 120, 'question prompts must be unique');

const sectionRanges = [
  { label: '基本', start: 0, end: 16, expected: [4, 4, 4, 4] },
  { label: '使い分け', start: 16, end: 28, expected: [3, 3, 3, 3] },
  { label: '応用', start: 28, end: 40, expected: [3, 3, 3, 3] },
] as const;

function maxStreak(values: number[]): number {
  let max = 0;
  let current = 0;
  let previous = -1;
  for (const value of values) {
    current = value === previous ? current + 1 : 1;
    previous = value;
    max = Math.max(max, current);
  }
  return max;
}

const report = GRAMMAR_CATEGORIES_V3.map((category) => {
  const questions = category.questions;
  const overall = answerPositionCounts(questions);
  assert.deepEqual(overall, [10, 10, 10, 10], `${category.id}: A/B/C/D must each be correct exactly 10 times`);
  assert.ok(maxStreak(questions.map((question) => question.correctIndex)) <= 2, `${category.id}: answer-position streak is too long`);

  assert.equal(questions.filter((question) => question.level === '基本').length, 16, `${category.id}: basic count`);
  assert.equal(questions.filter((question) => question.level === '使い分け').length, 12, `${category.id}: usage count`);
  assert.equal(questions.filter((question) => question.level === '応用').length, 12, `${category.id}: application count`);
  assert.ok(questions.slice(0, 16).every((question) => question.level === '基本'), `${category.id}: basics must come first`);
  assert.ok(questions.slice(16, 28).every((question) => question.level === '使い分け'), `${category.id}: usage section order`);
  assert.ok(questions.slice(28).every((question) => question.level === '応用'), `${category.id}: application section order`);

  const sections = sectionRanges.map((section) => {
    const counts = answerPositionCounts(questions.slice(section.start, section.end));
    assert.deepEqual(counts, section.expected, `${category.id}/${section.label}: answer positions must be balanced`);
    return { label: section.label, counts };
  });

  for (const question of questions) {
    assert.ok(question.prompt.trim().length >= 4, `${question.id}: prompt too short`);
    assert.equal(question.choices.length, 4, `${question.id}: must have four choices`);
    assert.equal(new Set(question.choices.map((choice) => choice.trim())).size, 4, `${question.id}: duplicate choices`);
    assert.ok(question.choices.every((choice) => choice.trim().length > 0), `${question.id}: empty choice`);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex <= 3, `${question.id}: invalid correct index`);
    assert.ok(question.choices[question.correctIndex].trim().length > 0, `${question.id}: empty correct answer`);
    assert.ok(question.explanation.trim().length >= 8, `${question.id}: explanation too short`);
    assert.ok(question.example.trim().length >= 5, `${question.id}: missing example sentence`);
    assert.ok(/[A-Za-z]/.test(question.example), `${question.id}: example must contain English text`);
    assert.ok(!question.example.includes('\n'), `${question.id}: example must be one line / one sentence`);
  }

  return {
    id: category.id,
    title: category.title,
    questionCount: questions.length,
    answerPositions: { A: overall[0], B: overall[1], C: overall[2], D: overall[3] },
    maxSameAnswerPositionStreak: maxStreak(questions.map((question) => question.correctIndex)),
    sections,
  };
});

assert.equal(GRAMMAR_CATEGORIES_V3[0].questions[0].prompt, '現在完了形は、どんなときに使う？');
assert.equal(GRAMMAR_CATEGORIES_V3[0].questions[1].prompt, '現在完了形の3つの基本用法は？');
assert.equal(GRAMMAR_CATEGORIES_V3[1].questions[0].prompt, '未来のことを表すとき、最初に考えるべきことは？');
assert.equal(GRAMMAR_CATEGORIES_V3[2].questions[0].prompt, '可算名詞かどうかを考える最初のポイントは？');

fs.writeFileSync(
  path.join(outDir, 'report.json'),
  JSON.stringify({
    success: true,
    answerLayoutVersion: GRAMMAR_ANSWER_LAYOUT_VERSION,
    totalQuestions: TOTAL_GRAMMAR_QUESTIONS_V3,
    categories: report,
  }, null, 2),
);

console.log('Grammar bank audit PASS: 120 questions; each category A/B/C/D = 10/10/10/10; 16 basic questions first; every answer has an explanation and one-line English example.');
