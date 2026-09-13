import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { QUESTIONS, STAGES, SETS, FORMATS, VERSION, BY_ID, autoGrade, answerLabel, emptyProgress, sanitizeProgress, startSession, reviewIds } from '../src/knowledge/model';

const raw = JSON.parse(readFileSync('src/knowledge/questions.json', 'utf8'));
const hash = createHash('sha256').update(JSON.stringify(raw)).digest('hex');
// The Word and PDF documents were generated from this exact ordered data, including answers.
assert.equal(hash, 'e7396c010644e040ca7f1a37fa3ba7a274b78efbeb0e463999ba5136be6dfc77');
assert.equal(QUESTIONS.length, 102);
assert.equal(BY_ID.size, 102);
assert.deepEqual(STAGES.map(s => QUESTIONS.filter(q => q.stage === s.id).length), [12, 30, 36, 24]);
assert.equal(SETS.length, 17);
assert.equal(new Set(QUESTIONS.map(q => q.format)).size, 8);
assert.deepEqual(QUESTIONS.map(q => q.number), Array.from({ length: 102 }, (_, i) => i + 1));
const counts: Record<string, number> = {};
const choicePositions = [0, 0, 0, 0];
for (const q of QUESTIONS) {
  counts[q.format] = (counts[q.format] ?? 0) + 1;
  assert.ok(FORMATS[q.format]); assert.ok(q.prompt.trim()); assert.ok(q.explanation.trim()); assert.ok(q.source.trim()); assert.ok(answerLabel(q));
  if (q.mode === 'choice') {
    const length = q.format === 'tf' ? 2 : q.format === 'match' ? 6 : q.format === 'classify' ? 3 : 4;
    assert.equal(q.choices!.length, length); assert.equal(new Set(q.choices).size, length);
    assert.equal(typeof q.answer, 'number'); assert.ok((q.answer as number) >= 0 && (q.answer as number) < length);
    assert.equal(autoGrade(q, {}), null);
    assert.equal(autoGrade(q, { choice: q.answer as number }), 'correct');
    assert.equal(autoGrade(q, { choice: ((q.answer as number) + 1) % length }), 'incorrect');
    if (length === 4) choicePositions[q.answer as number]++;
  } else if (q.mode === 'order') {
    assert.deepEqual([...(q.answer as number[])].sort(), [0, 1]);
    assert.equal(q.choices!.length, 2);
    assert.equal(autoGrade(q, { order: [0] }), null);
    assert.equal(autoGrade(q, { order: q.answer as number[] }), 'correct');
    assert.equal(autoGrade(q, { order: [...q.answer as number[]].reverse() }), 'incorrect');
  } else {
    assert.equal(typeof q.answer, 'string'); assert.equal(q.choices, null);
    assert.equal(autoGrade(q, { text: String(q.answer) }), null);
    if (q.format === 'repair') assert.equal((q.prompt.match(/〔[^〕]+〕/g) ?? []).length, 1);
  }
}
assert.deepEqual(counts, { tf: 12, teacher: 30, parts: 8, classify: 6, recall: 16, match: 12, timeline: 6, repair: 12 });
assert.ok(Math.max(...choicePositions) - Math.min(...choicePositions) <= 1);
for (const start of [1, 79]) assert.equal(QUESTIONS.slice(start - 1, start + 5).filter(q => q.answer === 0).length, 3);
assert.deepEqual(sanitizeProgress(null), emptyProgress());
assert.deepEqual(sanitizeProgress({ version: 'old', grades: { 'tk-001': 'correct' } }), emptyProgress());
const s = startSession(QUESTIONS.slice(0, 6).map(q => q.id), 'test', 7);
s.responses['tk-001'] = { choice: 1, revealed: true, grade: 'incorrect' };
s.index = 1;
const p = sanitizeProgress({ version: VERSION, grades: { 'tk-001': 'incorrect', 'not-a-question': 'correct' }, flagged: ['tk-004', 'tk-004', 'bad'], session: s });
assert.equal(p.session!.index, 1); assert.equal(p.session!.responses['tk-001'].grade, 'incorrect');
assert.deepEqual(p.grades, { 'tk-001': 'incorrect' }); assert.deepEqual(p.flagged, ['tk-004']);
assert.deepEqual(reviewIds(p), ['tk-001', 'tk-004']);
assert.equal(sanitizeProgress({ ...p, session: { ...s, index: 99 } }).session, null);
assert.equal(sanitizeProgress({ ...p, session: { ...s, ids: ['tk-001', 'tk-001'] } }).session, null);
assert.throws(() => startSession(['bad-id'], 'bad'));
assert.throws(() => startSession(['tk-001', 'tk-001'], 'duplicate'));
const orderState = startSession(['tk-049'], 'order');
orderState.responses['tk-049'] = { order: [1, 1], revealed: true };
assert.equal(sanitizeProgress({ ...emptyProgress(), session: orderState }).session!.responses['tk-049'].order, undefined);
mkdirSync('audit/knowledge', { recursive: true });
writeFileSync('audit/knowledge/model.json', JSON.stringify({ success: true, questions: QUESTIONS.length, stages: [12, 30, 36, 24], formats: counts, choicePositions, bankHash: hash, sets: SETS.length }, null, 2));
console.log('Knowledge model PASS:', counts, choicePositions, hash);
