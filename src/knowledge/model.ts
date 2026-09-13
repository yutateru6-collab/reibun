import raw from './questions.json';

export const VERSION = 'tense-knowledge-102-v1';
export const STORAGE_KEY = 'reibun:tense-knowledge-102:v1';
export const FORMATS = { tf: '○×チェック', teacher: '先生役の４択', repair: 'まちがい直し', classify: '仲間分け', parts: 'パーツ選び', timeline: '時間の並べかえ', match: 'ペア合わせ', recall: '穴埋め' } as const;
export type Format = keyof typeof FORMATS;
export type Grade = 'correct' | 'incorrect';
type Row = [Format, string, string[] | null, number | string | number[], string, string];
export type Question = { id: string; number: number; stage: number; format: Format; mode: 'choice' | 'text' | 'order'; prompt: string; choices: string[] | null; answer: number | string | number[]; explanation: string; source: string };
export const STAGES = [
  { id: 1, title: 'まず、大きな考え方', start: 1, end: 12, description: '何を表す形なのかを、日本語でつかむ。' },
  { id: 2, title: '基本の意味と作り方', start: 13, end: 42, description: '意味・名前・形を結びつける。' },
  { id: 3, title: '似たものを比べる', start: 43, end: 78, description: '場面や時間の関係から、違いを説明する。' },
  { id: 4, title: '細かい知識まで確認', start: 79, end: 102, description: '基本を使って、教材の注意点まで確かめる。' },
] as const;
export const QUESTIONS: Question[] = (raw as Row[]).map(([format, prompt, choices, answer, explanation, source], i) => ({ id: `tk-${String(i + 1).padStart(3, '0')}`, number: i + 1, stage: STAGES.find(s => i + 1 >= s.start && i + 1 <= s.end)!.id, format, mode: format === 'timeline' ? 'order' : choices ? 'choice' : 'text', prompt, choices, answer, explanation, source }));
export const BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));
export const SETS = STAGES.flatMap(s => Array.from({ length: (s.end - s.start + 1) / 6 }, (_, i) => ({ stage: s.id, start: s.start + i * 6, end: s.start + i * 6 + 5 })));
export type Response = { choice?: number; text?: string; order?: number[]; revealed?: boolean; grade?: Grade };
export type Session = { ids: string[]; index: number; title: string; responses: Record<string, Response>; finished: boolean; nextStart: number | null };
export type Progress = { version: string; grades: Record<string, Grade>; flagged: string[]; session: Session | null };
export function emptyProgress(): Progress { return { version: VERSION, grades: {}, flagged: [], session: null }; }
const isGrade = (v: unknown): v is Grade => v === 'correct' || v === 'incorrect';
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

// Persist only this feature's data. Existing examples, favorites and worksheets are untouched.
export function sanitizeProgress(value: unknown): Progress {
  const clean = emptyProgress();
  if (!record(value) || value.version !== VERSION) return clean;
  if (record(value.grades)) for (const [id, grade] of Object.entries(value.grades)) if (BY_ID.has(id) && isGrade(grade)) clean.grades[id] = grade;
  if (Array.isArray(value.flagged)) clean.flagged = [...new Set(value.flagged.filter((id): id is string => typeof id === 'string' && BY_ID.has(id)))];
  const s = value.session;
  if (!record(s) || !Array.isArray(s.ids) || !s.ids.length || s.ids.length > QUESTIONS.length || s.ids.some(id => typeof id !== 'string' || !BY_ID.has(id)) || new Set(s.ids).size !== s.ids.length) return clean;
  if (!Number.isInteger(s.index) || (s.index as number) < 0 || (s.index as number) >= s.ids.length) return clean;
  const ids = s.ids as string[];
  const responses: Record<string, Response> = {};
  if (record(s.responses)) for (const id of ids) {
    const r = s.responses[id]; const q = BY_ID.get(id)!;
    if (!record(r)) continue;
    const next: Response = {};
    if (typeof r.text === 'string') next.text = r.text.slice(0, 500);
    if (Number.isInteger(r.choice) && q.choices && (r.choice as number) >= 0 && (r.choice as number) < q.choices.length) next.choice = r.choice as number;
    if (Array.isArray(r.order) && q.choices && r.order.length <= q.choices.length && r.order.every(n => Number.isInteger(n) && n >= 0 && n < q.choices!.length) && new Set(r.order).size === r.order.length) next.order = r.order as number[];
    if (r.revealed === true) { next.revealed = true; if (isGrade(r.grade)) next.grade = r.grade; }
    responses[id] = next;
  }
  clean.session = { ids, index: s.index as number, title: typeof s.title === 'string' ? s.title.slice(0, 100) : '知識チェック', responses, finished: s.finished === true && ids.every(id => !!responses[id]?.grade), nextStart: Number.isInteger(s.nextStart) && SETS.some(set => set.start === s.nextStart) ? s.nextStart as number : null };
  return clean;
}
export function readProgress(): Progress {
  try { return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')); }
  catch { return emptyProgress(); }
}
export function answerLabel(q: Question): string {
  if (q.mode === 'choice') return q.format === 'tf' ? q.choices![q.answer as number] : `${String.fromCharCode(65 + (q.answer as number))}　${q.choices![q.answer as number]}`;
  if (q.mode === 'order') return (q.answer as number[]).map(n => `${String.fromCharCode(65 + n)} ${q.choices![n]}`).join(' → ');
  return q.answer as string;
}
export function autoGrade(q: Question, r: Response): Grade | null {
  if (q.mode === 'text') return null; // Japanese paraphrases must not be rejected by strict string matching.
  if (q.mode === 'choice') return r.choice === undefined ? null : r.choice === q.answer ? 'correct' : 'incorrect';
  if (!r.order || r.order.length !== q.choices!.length) return null;
  return JSON.stringify(r.order) === JSON.stringify(q.answer) ? 'correct' : 'incorrect';
}
export function startSession(ids: string[], title: string, nextStart: number | null = null): Session {
  if (!ids.length || ids.some(id => !BY_ID.has(id)) || new Set(ids).size !== ids.length) throw new Error('問題セットを作成できません。');
  return { ids: [...ids], index: 0, title, responses: {}, finished: false, nextStart };
}
export function reviewIds(progress: Progress): string[] {
  return QUESTIONS.filter(q => progress.grades[q.id] === 'incorrect' || progress.flagged.includes(q.id)).map(q => q.id);
}
