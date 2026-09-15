import type { GrammarQuestionV3 } from './grammar_curriculum_v3';

export const GRAMMAR_SHUFFLE_VERSION = 'level-block-question-shuffle-v1';

const LEVEL_ORDER: GrammarQuestionV3['level'][] = ['基本', '使い分け', '応用'];

function shuffledCopy<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sameOrder(a: readonly GrammarQuestionV3[], b: readonly GrammarQuestionV3[]): boolean {
  return a.length === b.length && a.every((item, index) => item.id === b[index]?.id);
}

function forceVisibleChange(
  questions: GrammarQuestionV3[],
  reference: readonly GrammarQuestionV3[],
): GrammarQuestionV3[] {
  if (!sameOrder(questions, reference) || questions.length < 2) return questions;

  const copy = [...questions];
  for (let i = 0; i < copy.length - 1; i += 1) {
    if (copy[i].level === copy[i + 1].level) {
      [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
      return copy;
    }
  }
  return copy;
}

/**
 * Randomize question order without destroying the pedagogical progression.
 * Basic questions stay before usage questions, and usage stays before application.
 * Within each level block the order changes on every new session.
 */
export function shuffleGrammarQuestions(
  questions: readonly GrammarQuestionV3[],
  random: () => number = Math.random,
): GrammarQuestionV3[] {
  const shuffled = LEVEL_ORDER.flatMap((level) => shuffledCopy(
    questions.filter((question) => question.level === level),
    random,
  ));
  return forceVisibleChange(shuffled, questions);
}

/**
 * Keep already-scored questions fixed and reshuffle only the unanswered remainder.
 * This lets a learner press “シャッフル” mid-session without corrupting the score.
 */
export function shuffleRemainingGrammarQuestions(
  questions: readonly GrammarQuestionV3[],
  currentIndex: number,
  random: () => number = Math.random,
): GrammarQuestionV3[] {
  const safeIndex = Math.max(0, Math.min(currentIndex, questions.length));
  const prefix = questions.slice(0, safeIndex);
  const remaining = questions.slice(safeIndex);
  return [...prefix, ...shuffleGrammarQuestions(remaining, random)];
}
