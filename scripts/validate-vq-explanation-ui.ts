import fs from 'node:fs';
import {
  vq2_2_Cards,
  vq3_1_Cards,
  vq3_2_Cards,
  vq2_2_QuestionsCards,
  vq3_1_QuestionsCards,
  vq3_2_QuestionsCards,
} from '../src/data/vision_quest_exam_2026';
import { VISION_QUEST_POINT_COUNT } from '../src/data/vision_quest_points';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const sentenceCards = [...vq2_2_Cards, ...vq3_1_Cards, ...vq3_2_Cards];
const questionCards = [...vq2_2_QuestionsCards, ...vq3_1_QuestionsCards, ...vq3_2_QuestionsCards];

assert(sentenceCards.length === 45, `Expected 45 current-range example cards, got ${sentenceCards.length}`);
assert(VISION_QUEST_POINT_COUNT === 45, `Expected 45 mapped explanation points, got ${VISION_QUEST_POINT_COUNT}`);
for (const card of sentenceCards) {
  assert(card.comment.trim().length > 0, `Missing explanation point at sentence card ${card.id}`);
  assert(!card.comment.includes('【出典】'), `Source label leaked into sentence card ${card.id}`);
}

for (const card of questionCards) {
  assert(!card.comment.includes('【出典】'), `Source label leaked into question card ${card.id}`);
}

const card42 = sentenceCards.find(card => card.id === 3201);
assert(card42, 'Card 3201 was not found');
assert(card42.comment.includes('seem'), 'Card 3201 explanation does not explain seem');
assert(card42.comment.includes('SVC'), 'Card 3201 explanation does not identify SVC');

const app = fs.readFileSync('src/App.tsx', 'utf8');
assert(app.includes("HIDDEN_VQ_TASK_LABELS = new Set(['日本語に合うように空欄補充'])"), 'Redundant VQ task label is not configured to be hidden');
assert(app.includes('HIDDEN_VQ_TASK_LABELS.has(card.translation)'), 'VQ prompt does not use hidden task-label guard');

console.log(JSON.stringify({
  visionQuestExplanationUiValidation: 'passed',
  sentenceCards: sentenceCards.length,
  questionCards: questionCards.length,
  mappedPoints: VISION_QUEST_POINT_COUNT,
  sourceLabelsVisible: false,
  hiddenTaskLabel: '日本語に合うように空欄補充',
}, null, 2));
