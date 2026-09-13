export const WORKBOOK_VERSION = 'tense-workbook-v1';
export type Origin = 'original' | 'transformed' | 'application';
export type Unit = 'tense1' | 'tense2' | 'hope3';
export type Format = 'fill' | 'wordbank' | 'order' | 'translation' | 'choice' | 'correction' | 'rewrite' | 'timeline' | 'meaning' | 'dialogue' | 'classification' | 'reading';
export const ORIGINS: Record<Origin, string> = { original: '元の問題', transformed: '形式変更', application: '応用問題〔新作〕' };
export const UNITS: Record<Unit | 'both', string> = { tense1: '時制・完了形①', tense2: '時制・完了形②', both: '時制・完了形①＋②', hope3: '暗唱例文 Test3' };
export const FORMATS: Record<Format, string> = { fill: '空欄補充・語形変化', wordbank: '語句を選び形を変える', order: '並べ替え', translation: '英作文', choice: '選択問題', correction: '誤文訂正', rewrite: '書き換え', timeline: '時系列', meaning: '意味の比較', dialogue: '会話', classification: '用法の判別', reading: 'ミニ文章' };
export interface Option { id: string; text: string }
export interface Question {
  id: string;
  origin: Origin;
  unit: Unit;
  format: Format;
  instruction: string;
  prompt: string;
  answer: string;
  explanation: string;
  choices?: Option[];
  correctId?: string;
  tokens?: string[];
  note?: string;
  // Private provenance: never printed as a student-facing source citation.
  sourceId?: number;
}
export interface Selection {
  unit: Unit | 'both';
  format: Format | 'all';
  counts: Record<Origin, number>; // -1 means all available.
  shuffle: boolean;
  shuffleChoices: boolean;
  grouping: 'sections' | 'mixed';
}
export interface Worksheet {
  version: typeof WORKBOOK_VERSION;
  id: string;
  createdAt: string;
  title: string;
  selection: Selection;
  questions: Question[];
}
export const HISTORY_KEY = 'reibun:workbook:history:v1';
export const MISTAKES_KEY = 'reibun:workbook:mistakes:v1';
export function randomSeed(): number {
  if (globalThis.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0];
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
export function seeded(seed: number): () => number {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function shuffled<T>(values: readonly T[], rng: () => number): T[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function eligible(bank: Question[], selection: Selection): Question[] {
  return bank.filter(q => (selection.unit === 'both' ? q.unit !== 'hope3' : q.unit === selection.unit) && (selection.format === 'all' || q.format === selection.format));
}
export function makeWorksheet(bank: Question[], selection: Selection, seed = randomSeed(), now = new Date()): Worksheet {
  const pool = eligible(bank, selection);
  const rng = seeded(seed);
  const questions: Question[] = [];
  for (const origin of Object.keys(ORIGINS) as Origin[]) {
    const available = pool.filter(q => q.origin === origin);
    const wanted = selection.counts[origin];
    if (!Number.isInteger(wanted) || wanted < -1 || wanted > available.length) throw new Error(`${ORIGINS[origin]}は${available.length}問までです。`);
    const ordered = selection.shuffle ? shuffled(available, rng) : available;
    questions.push(...ordered.slice(0, wanted === -1 ? available.length : wanted));
  }
  if (questions.length === 0) throw new Error('問題を1問以上選んでください。');
  // Clone once: practice, preview and answer keys share this immutable snapshot.
  let chosen: Question[] = JSON.parse(JSON.stringify(questions));
  if (selection.grouping === 'mixed' && selection.shuffle) chosen = shuffled(chosen, rng);
  for (const q of chosen) {
    if (q.choices && selection.shuffleChoices) q.choices = shuffled(q.choices, rng);
    if (q.tokens) {
      q.tokens = shuffled(q.tokens, rng);
      if (q.tokens.join(' ') === q.answer) q.tokens = [...q.tokens.slice(1), q.tokens[0]];
    }
  }
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now).replaceAll('-', '');
  return { version: WORKBOOK_VERSION, id: `WB-${day}-${seed.toString(16).padStart(8, '0').toUpperCase()}`, createdAt: now.toISOString(), title: `Vision Quest II　${UNITS[selection.unit]}　練習プリント`, selection: JSON.parse(JSON.stringify(selection)), questions: chosen };
}
export function answerLabel(q: Question): string {
  if (!q.choices) return q.answer;
  const index = q.choices.findIndex(c => c.id === q.correctId);
  if (index < 0) throw new Error(`正解選択肢がありません: ${q.id}`);
  return `${String.fromCharCode(65 + index)}　${q.choices[index].text}`;
}
export function validWorksheet(value: unknown): value is Worksheet {
  if (!value || typeof value !== 'object') return false;
  const w = value as Worksheet;
  return w.version === WORKBOOK_VERSION && typeof w.id === 'string' && typeof w.title === 'string' && typeof w.createdAt === 'string'
    && !!w.selection && ['sections', 'mixed'].includes(w.selection.grouping) && w.selection.unit in UNITS
    && Array.isArray(w.questions) && w.questions.length > 0 && w.questions.length <= 300
    && new Set(w.questions.map(q => q?.id)).size === w.questions.length
    && w.questions.every(q => q && typeof q.id === 'string' && q.origin in ORIGINS && q.unit in UNITS && q.format in FORMATS
      && ['prompt', 'instruction', 'answer', 'explanation'].every(k => typeof q[k] === 'string')
      && (q.note === undefined || typeof q.note === 'string')
      && (q.tokens === undefined || Array.isArray(q.tokens) && q.tokens.every(t => typeof t === 'string'))
      && (q.choices === undefined || Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.every(c => c && typeof c.id === 'string' && typeof c.text === 'string') && new Set(q.choices.map(c => c.id)).size === q.choices.length && q.choices.some(c => c.id === q.correctId)));
}
export function readHistory(): Worksheet[] {
  try { const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); return Array.isArray(saved) ? saved.filter(validWorksheet).slice(0, 8) : []; } catch { return []; }
}
export function readMistakes(): string[] {
  try { const saved = JSON.parse(localStorage.getItem(MISTAKES_KEY) ?? '[]'); return Array.isArray(saved) ? saved.filter(x => typeof x === 'string') : []; } catch { return []; }
}
export function saveHistory(w: Worksheet): boolean {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify([w, ...readHistory().filter(old => old.id !== w.id)].slice(0, 8))); return true; } catch { return false; }
}
