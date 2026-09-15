import {
  GRAMMAR_CATEGORIES_V2,
  type GrammarCategoryV2,
  type GrammarQuestionV2,
} from './grammar_curriculum_v2';

export type GrammarQuestionV3 = GrammarQuestionV2;
export type GrammarCategoryV3 = GrammarCategoryV2;

export const GRAMMAR_ANSWER_LAYOUT_VERSION = 'balanced-answer-layout-40x3-v1';

// 40 questions per category. The pattern is deliberately non-cyclic, but each
// 16/12/12 section is perfectly balanced across A/B/C/D:
// basic: 4 each, usage: 3 each, application: 3 each => 10 each overall.
const ANSWER_POSITION_PATTERN = [
  2, 0, 3, 1, 1, 3, 0, 2, 3, 2, 1, 0, 0, 1, 2, 3,
  1, 0, 3, 2, 2, 3, 1, 0, 3, 0, 2, 1,
  0, 2, 1, 3, 1, 2, 0, 3, 2, 1, 3, 0,
] as const;

const CATEGORY_OFFSET: Record<GrammarCategoryV3['id'], number> = {
  perfect: 0,
  future: 1,
  countable: 2,
};

function moveCorrectChoice(question: GrammarQuestionV2, targetIndex: number): GrammarQuestionV3 {
  if (question.correctIndex === targetIndex) return { ...question, choices: [...question.choices] };

  const choices = [...question.choices] as [string, string, string, string];
  [choices[question.correctIndex], choices[targetIndex]] = [choices[targetIndex], choices[question.correctIndex]];

  return {
    ...question,
    choices,
    correctIndex: targetIndex,
  };
}

function balanceCategory(category: GrammarCategoryV2): GrammarCategoryV3 {
  const offset = CATEGORY_OFFSET[category.id];
  return {
    ...category,
    questions: category.questions.map((question, index) => {
      const targetIndex = (ANSWER_POSITION_PATTERN[index] + offset) % 4;
      return moveCorrectChoice(question, targetIndex);
    }),
  };
}

export const GRAMMAR_CATEGORIES_V3: GrammarCategoryV3[] = GRAMMAR_CATEGORIES_V2.map(balanceCategory);

export const TOTAL_GRAMMAR_QUESTIONS_V3 = GRAMMAR_CATEGORIES_V3.reduce(
  (sum, category) => sum + category.questions.length,
  0,
);

export function answerPositionCounts(questions: GrammarQuestionV3[]): [number, number, number, number] {
  const counts: [number, number, number, number] = [0, 0, 0, 0];
  for (const question of questions) counts[question.correctIndex] += 1;
  return counts;
}
