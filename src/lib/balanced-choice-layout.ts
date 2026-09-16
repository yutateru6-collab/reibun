export const BALANCED_CHOICE_LAYOUT_VERSION = 'balanced-session-choice-layout-v1' as const;

export interface ChoiceLayoutQuestion {
  choices?: readonly string[];
  correctIndex?: number;
}

function shuffleWith<T>(values: readonly T[], rng: () => number): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

/**
 * Build a balanced sequence of A-D answer positions for one quiz session.
 * Counts differ by at most one and the same position never appears three
 * times in a row. Randomness only decides which positions receive the
 * remainder and how ties are resolved.
 */
export function balancedAnswerPositions(
  count: number,
  rng: () => number = Math.random,
): number[] {
  if (!Number.isInteger(count) || count < 0) throw new Error('選択問題数が不正です。');

  const positionOrder = shuffleWith([0, 1, 2, 3], rng);
  const remaining = [0, 1, 2, 3].map(() => Math.floor(count / 4));
  for (let index = 0; index < count % 4; index += 1) remaining[positionOrder[index]] += 1;

  const positions: number[] = [];
  let previous = -1;
  let streak = 0;

  while (positions.length < count) {
    const allowed = remaining
      .map((amount, position) => ({ amount, position }))
      .filter(({ amount, position }) => amount > 0 && !(position === previous && streak >= 2));
    if (!allowed.length) throw new Error('正答位置を均等に配置できませんでした。');

    const greatestRemaining = Math.max(...allowed.map(({ amount }) => amount));
    const candidates = allowed.filter(({ amount }) => amount === greatestRemaining);
    const selected = candidates[Math.floor(rng() * candidates.length)].position;
    positions.push(selected);
    remaining[selected] -= 1;
    if (selected === previous) streak += 1;
    else {
      previous = selected;
      streak = 1;
    }
  }

  return positions;
}

/**
 * Return a session-only copy whose four choice texts are merely reordered.
 * The source objects and every question/choice/explanation string remain
 * untouched. Correctness follows the original choice identity, not its old
 * A-D index.
 */
export function balanceFourChoicePositions<T extends ChoiceLayoutQuestion>(
  questions: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const choiceQuestions = questions.filter(question => question.choices !== undefined);
  for (const question of choiceQuestions) {
    if (question.choices?.length !== 4) throw new Error('均等配置できるのは4択問題だけです。');
    if (!Number.isInteger(question.correctIndex) || question.correctIndex! < 0 || question.correctIndex! > 3) {
      throw new Error('4択問題の正答位置が不正です。');
    }
  }

  const targets = balancedAnswerPositions(choiceQuestions.length, rng);
  let choiceCursor = 0;

  return questions.map(question => {
    if (!question.choices) return { ...question };

    const originalChoices = question.choices.map((text, sourceIndex) => ({ sourceIndex, text }));
    const correctChoice = originalChoices[question.correctIndex!];
    const distractors = shuffleWith(
      originalChoices.filter(choice => choice.sourceIndex !== correctChoice.sourceIndex),
      rng,
    );
    const targetIndex = targets[choiceCursor];
    choiceCursor += 1;
    distractors.splice(targetIndex, 0, correctChoice);

    return {
      ...question,
      choices: distractors.map(choice => choice.text),
      correctIndex: targetIndex,
    } as T;
  });
}

export function answerPositionCounts(questions: readonly ChoiceLayoutQuestion[]): [number, number, number, number] {
  const counts: [number, number, number, number] = [0, 0, 0, 0];
  for (const question of questions) {
    if (question.choices && question.correctIndex !== undefined) counts[question.correctIndex] += 1;
  }
  return counts;
}

export function maxAnswerPositionStreak(questions: readonly ChoiceLayoutQuestion[]): number {
  let maximum = 0;
  let current = 0;
  let previous = -1;
  for (const question of questions) {
    if (!question.choices || question.correctIndex === undefined) continue;
    current = question.correctIndex === previous ? current + 1 : 1;
    previous = question.correctIndex;
    maximum = Math.max(maximum, current);
  }
  return maximum;
}
