import { createHash } from 'node:crypto';
import {
  vq2_2_QuestionsCards,
  vq3_1_QuestionsCards,
  vq3_2_QuestionsCards,
} from '../src/data/vision_quest_exam_2026';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const digest = (cards: { front: string; back: string }[]) => {
  const canonical = cards
    .map((card) => `${normalize(card.front)}\0${normalize(card.back)}`)
    .join('\n');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
};

// These SHA-256 values were independently calculated from the supplied
// `vision quest2 教科書.txt` exercise source after collapsing whitespace only.
// Description items that require missing illustrations are intentionally excluded.
const expected = [
  {
    lesson: '2-2',
    count: 20,
    hash: '6e29437c93a3092772dec94da4e77fd0bedb57430ac394e1907c4baecd7b8f1d',
    cards: vq2_2_QuestionsCards,
  },
  {
    lesson: '3-1',
    count: 23,
    hash: 'f84ede629340f799e02a4053bd8a79c6f6b85628255e24f23e5f5ddc647c9081',
    cards: vq3_1_QuestionsCards,
  },
  {
    lesson: '3-2',
    count: 23,
    hash: 'e4fed1d197c5580135debcc51725a4f6b55794b2fccde22338e5707d1d2a6aec',
    cards: vq3_2_QuestionsCards,
  },
];

for (const group of expected) {
  assert(group.cards.length === group.count, `${group.lesson}: exercise count mismatch`);
  const actual = digest(group.cards);
  assert(actual === group.hash, `${group.lesson}: exercise source hash mismatch (${actual})`);

  for (const card of group.cards) {
    assert(card.front.trim().length > 0, `${group.lesson}: empty question front at ${card.id}`);
    assert(card.back.trim().length > 0, `${group.lesson}: empty official answer at ${card.id}`);
    assert(card.translation.trim().length > 0, `${group.lesson}: empty task label at ${card.id}`);
    assert(!card.comment.includes('【出典】'), `${group.lesson}: source label must not be exposed at ${card.id}`);
  }
}

assert(
  expected.reduce((sum, group) => sum + group.cards.length, 0) === 66,
  'Visible Vision Quest exercise total must be 66.'
);

console.log(JSON.stringify({
  vqExerciseSourceHashVerification: 'passed',
  lesson2_2: 20,
  lesson3_1: 23,
  lesson3_2: 23,
  visibleTotal: 66,
}, null, 2));
