import generated from './questions.generated.json';

export const FINAL_CHECK_VERSION = 'vq2-final-check-2026-v1' as const;

export const FINAL_CHECK_SECTIONS = {
  tense1: { label: '時制・完了形①', short: '時制①', color: 'indigo' },
  tense2: { label: '時制・完了形②', short: '時制②', color: 'blue' },
  verb1: { label: '動詞①', short: '動詞①', color: 'emerald' },
  verb2: { label: '動詞②', short: '動詞②', color: 'amber' },
} as const;

export const FINAL_CHECK_FORMATS = {
  choice: '選択問題',
  order: '並べ替え',
  fill: '空所補充',
  correction: '誤文訂正',
  rewrite: '書き換え',
  written: '記述問題',
} as const;

export type FinalCheckSection = keyof typeof FINAL_CHECK_SECTIONS;
export type FinalCheckFormat = keyof typeof FINAL_CHECK_FORMATS;
export type FinalCheckRange = FinalCheckSection | 'all';
export type FinalCheckStrategy = 'balanced' | 'random';
export type FinalCheckGrade = 'correct' | 'incorrect';

export interface FinalCheckQuestion {
  id: string;
  round: 1 | 2;
  section: FinalCheckSection;
  number: number;
  format: FinalCheckFormat;
  prompt: string;
  solution: string;
  choices?: string[];
  correctIndex?: number;
}

export interface FinalCheckSelection {
  range: FinalCheckRange;
  strategy: FinalCheckStrategy;
  count: number;
}

export const FINAL_CHECK_MISTAKES_KEY = `reibun:final-check:mistakes:${FINAL_CHECK_VERSION}`;

function isSection(value: unknown): value is FinalCheckSection {
  return typeof value === 'string' && value in FINAL_CHECK_SECTIONS;
}

function isFormat(value: unknown): value is FinalCheckFormat {
  return typeof value === 'string' && value in FINAL_CHECK_FORMATS;
}

function parseQuestion(value: unknown): FinalCheckQuestion {
  if (!value || typeof value !== 'object') throw new Error('最終チェック問題の形式が不正です。');
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string'
    || (item.round !== 1 && item.round !== 2)
    || !isSection(item.section)
    || !Number.isInteger(item.number)
    || !isFormat(item.format)
    || typeof item.prompt !== 'string'
    || typeof item.solution !== 'string'
  ) throw new Error(`最終チェック問題の必須項目が不足しています: ${String(item.id)}`);

  const choices = item.choices;
  const correctIndex = item.correctIndex;
  if (choices !== undefined) {
    if (!Array.isArray(choices) || choices.length < 2 || choices.some(choice => typeof choice !== 'string')) {
      throw new Error(`選択肢が不正です: ${item.id}`);
    }
    if (!Number.isInteger(correctIndex) || Number(correctIndex) < 0 || Number(correctIndex) >= choices.length) {
      throw new Error(`正答位置が不正です: ${item.id}`);
    }
  } else if (correctIndex !== undefined) {
    throw new Error(`選択肢のない問題に正答位置があります: ${item.id}`);
  }

  return {
    id: item.id,
    round: item.round,
    section: item.section,
    number: Number(item.number),
    format: item.format,
    prompt: item.prompt,
    solution: item.solution,
    choices: choices as string[] | undefined,
    correctIndex: correctIndex as number | undefined,
  };
}

export const FINAL_CHECK_QUESTIONS: readonly FinalCheckQuestion[] = generated.questions.map(parseQuestion);

if (generated.meta.version !== FINAL_CHECK_VERSION) throw new Error('最終チェック問題のバージョンが一致しません。');
if (FINAL_CHECK_QUESTIONS.length !== 200) throw new Error('最終チェック問題は200問である必要があります。');
if (new Set(FINAL_CHECK_QUESTIONS.map(question => question.id)).size !== FINAL_CHECK_QUESTIONS.length) {
  throw new Error('最終チェック問題のIDが重複しています。');
}

for (const [section, expected] of Object.entries(generated.meta.counts)) {
  const actual = FINAL_CHECK_QUESTIONS.filter(question => question.section === section).length;
  if (actual !== expected) throw new Error(`${section}の問題数が一致しません。`);
}

export function shuffleWith<T>(values: readonly T[], rng: () => number = Math.random): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function availableFor(range: FinalCheckRange): number {
  return range === 'all'
    ? FINAL_CHECK_QUESTIONS.length
    : FINAL_CHECK_QUESTIONS.filter(question => question.section === range).length;
}

export function makeFinalCheckSet(
  selection: FinalCheckSelection,
  rng: () => number = Math.random,
): FinalCheckQuestion[] {
  const available = availableFor(selection.range);
  if (!Number.isInteger(selection.count) || selection.count < 1 || selection.count > available) {
    throw new Error(`この範囲は1〜${available}問で指定してください。`);
  }

  if (selection.range !== 'all' || selection.strategy === 'random') {
    const pool = selection.range === 'all'
      ? FINAL_CHECK_QUESTIONS
      : FINAL_CHECK_QUESTIONS.filter(question => question.section === selection.range);
    return shuffleWith(pool, rng).slice(0, selection.count);
  }

  const sectionOrder = shuffleWith(Object.keys(FINAL_CHECK_SECTIONS) as FinalCheckSection[], rng);
  const pools = Object.fromEntries(sectionOrder.map(section => [
    section,
    shuffleWith(FINAL_CHECK_QUESTIONS.filter(question => question.section === section), rng),
  ])) as Record<FinalCheckSection, FinalCheckQuestion[]>;
  const selected: FinalCheckQuestion[] = [];
  let cursor = 0;
  while (selected.length < selection.count) {
    const section = sectionOrder[cursor % sectionOrder.length];
    const next = pools[section].shift();
    if (next) selected.push(next);
    cursor += 1;
  }
  return shuffleWith(selected, rng);
}

export function readFinalCheckMistakes(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FINAL_CHECK_MISTAKES_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    const validIds = new Set(FINAL_CHECK_QUESTIONS.map(question => question.id));
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))];
  } catch {
    return [];
  }
}

export function saveFinalCheckMistakes(ids: readonly string[]): boolean {
  try {
    localStorage.setItem(FINAL_CHECK_MISTAKES_KEY, JSON.stringify([...new Set(ids)]));
    return true;
  } catch {
    return false;
  }
}
