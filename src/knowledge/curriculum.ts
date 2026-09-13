import { QUESTIONS, SETS, STAGES, type Progress } from './model';

// Presentation metadata only. Question text, answers, IDs and saved progress remain unchanged.
// Points below summarize the existing explanations, not additional exam material.
export type Point = { label: string; text: string };
export type Topic = { id: string; title: string; short: string; description: string; icon: string; numbers: number[]; points: Point[] };
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const TOPICS: Topic[] = [
  { id: 'overview', title: '時制の全体像', short: '全体像', description: 'まず「何を表す形？」から。', icon: 'compass', numbers: range(1, 12), points: [
    { label: '現在形と進行形', text: 'ふだんの習慣は現在形。進行形の基本は「動作の途中」。' },
    { label: '現在完了形', text: '過去と今のつながりを見る。継続・経験・完了と結果を表せる。' },
    { label: '未来の表現', text: 'willだけではない。予定や伝えたい意味に合わせて、いくつかの形を使う。' },
  ] },
  { id: 'present', title: '現在形と進行形', short: '現在・進行形', description: '習慣・状態と、動作の途中を区別。', icon: 'clock', numbers: [13, 14, 30, 43, 44, 45, 55, 56, 57, 70, 73, 74, 81], points: [
    { label: '習慣・状態', text: '「毎週する」は今の習慣。「知っている」のknowは状態を表し、通常は進行形にしない。' },
    { label: '進行形の作り方', text: 'be動詞＋動詞のing形。現在ならam / is / are、過去ならwas / wereを使う。' },
    { label: '語尾だけで決めない', text: '「学校が終わった」でも、今の状態に注目するbe overなら現在形。日本語の語尾だけでは形は決まらない。' },
  ] },
  { id: 'past', title: '過去形と過去完了形', short: '過去・過去完了', description: '過去のどの時点から見る？', icon: 'history', numbers: [16, 48, ...range(49, 54), 59, 71, 76], points: [
    { label: '過去形', text: '今とは切り離して、過去の事実を伝える。過去の習慣も表せる。' },
    { label: '過去完了形', text: 'had＋過去分詞。過去のある時点を基準に、それより前のことを見る。' },
    { label: '時間の順番', text: '「到着したとき、映画はすでに始まっていた」なら、映画の開始が先、到着が後。' },
  ] },
  { id: 'perfect', title: '現在完了形', short: '現在完了', description: '「今とのつながり」と３つの意味。', icon: 'link', numbers: [15, ...range(21, 29), 46, 47, 58, 68, 75, 79, 80, 97, 98, 102], points: [
    { label: '基本の形', text: 'have / has＋過去分詞。過去のことを、今とのつながりから見る。' },
    { label: '３つの意味', text: '継続＝ずっと〜している。経験＝〜したことがある。完了・結果＝もう〜した／〜してしまって今…だ。訳は代表例。' },
    { label: 'forとsince', text: 'forは「３年間」のような期間の長さ。sinceは「2020年以来」のような出発点。' },
  ] },
  { id: 'continuous', title: '完了進行形', short: '完了進行形', description: '前から、いつまで続いている？', icon: 'repeat', numbers: [19, 20, 67, 69, 78, 82], points: [
    { label: '今まで続く動作', text: '現在完了進行形はhave / has been＋動詞のing形。前から今まで続いた動作に注目する。' },
    { label: '過去の時点まで', text: '過去完了進行形はhad been＋動詞のing形。「バスが来たとき」など、過去の時点までの動作の継続を見る。' },
    { label: '注意点', text: 'study・waitなどは、現在完了形でも動作の継続を表せる場合がある。' },
  ] },
  { id: 'future', title: '未来の６タイプ', short: '未来の表現', description: '意志・計画・予定・完了を整理。', icon: 'arrow', numbers: [17, 18, ...range(31, 42), 60, ...range(61, 66), 72, 77, 83, 84], points: [
    { label: 'will / be going to', text: 'willは予測や意志。be going toは前からの計画や、今の状況からの予測に使う。' },
    { label: '現在形 / 現在進行形', text: '教材では、公的な予定は現在形、準備が進んだ予定は現在進行形に対応させる。' },
    { label: '未来進行形 / 未来完了形', text: 'will be＋ing形で予定の成り行き。will have＋過去分詞で、未来の時点までの完了・経験・継続。' },
  ] },
  { id: 'expressions', title: '時のルールと関連表現', short: 'ルール・表現', description: '「〜したら」「今にも〜する」など。', icon: 'book', numbers: [...range(85, 96), 99, 100, 101], points: [
    { label: '未来でも現在形', text: '「家に着いたら」「夢がかなうまで」「もし行けば」など、時・条件を表す部分は、未来のことも基本的に現在形。' },
    { label: '未来の関連表現', text: 'be about to＋原形＝まさに〜しようとしている。be expected to＋原形＝〜すると予測されている。' },
    { label: '変化・考えていること', text: 'have / has come to＋原形＝〜するようになってきた。be thinking of＋ing形＝〜しようと思っている。' },
  ] },
];
export const LESSON_TITLES: Record<number, [string, string]> = {
  1: ['時制の全体像をつかもう', '習慣・途中・今とのつながり'],
  7: ['意味から形を見分けよう', 'どの時点に注目する？'],
  13: ['進行形・完了形を組み立てよう', '形を作るパーツを確認'],
  19: ['続いている？ 経験した？', '完了進行形と、現在完了の意味'],
  25: ['意味・名前・形をつなごう', '用語を自分で思い出す'],
  31: ['未来を表す６つの形', '名前と作り方を対応させる'],
  37: ['未来の６タイプの使い分け', '意志・計画・予定を整理'],
  43: ['日本語の語尾だけで決めない', '習慣・状態・途中・今との関係'],
  49: ['過去の出来事を並べよう', 'どちらが先に起きた？'],
  55: ['まちがいを直して整理しよう', '似た形の混同をほどく'],
  61: ['未来の場面を見分けよう', 'どんな未来を伝えたい？'],
  67: ['「途中」と「継続」を比べよう', 'いつから、いつまでを見る？'],
  73: ['大事なことを思い出そう', '選択肢なしで基本を確認'],
  79: ['よくある思い込みをチェック', 'for・sinceと、細かい注意点'],
  85: ['時のルールと関連表現', '「〜したら」「今にも〜する」'],
  91: ['細かい表現を直してみよう', '形と日本語の意味をもう一度'],
  97: ['最後の仕上げチェック', '期間・出発点・関連表現'],
};
export const TOPIC_BY_NUMBER = new Map(TOPICS.flatMap(t => t.numbers.map(n => [n, t] as const)));
export function pointsForSet(start: number): Point[] {
  const numbers = range(start, Math.min(start + 5, 102));
  const topics = TOPICS.filter(t => t.numbers.some(n => numbers.includes(n)));
  if (topics.length === 1) return topics[0].points;
  return topics.slice(0, 3).map(t => ({ label: t.title, text: t.points[0].text }));
}
export const TOPIC_SETS = TOPICS.flatMap(topic => STAGES.flatMap(stage => {
  const ids = QUESTIONS.filter(q => topic.numbers.includes(q.number) && q.stage === stage.id).map(q => q.id);
  return Array.from({ length: Math.ceil(ids.length / 6) }, (_, i) => ({
    key: `${topic.id}-${stage.id}-${i}`, topicId: topic.id, stage: stage.id,
    title: `${topic.title}｜${stage.title}${ids.length > 6 ? ` ${i + 1}` : ''}`,
    label: `${['', '全体像をつかむ', '意味と形', '使い分け', '注意点'][stage.id]}${ids.length > 6 ? ` ${i + 1}` : ''}`,
    ids: ids.slice(i * 6, i * 6 + 6),
  }));
}));
export function recommendedStart(progress: Progress): number {
  return SETS.find(s => QUESTIONS.some(q => q.number >= s.start && q.number <= s.end && !progress.grades[q.id]))?.start ?? 1;
}
export function progressFor(numbers: number[], progress: Progress) {
  const questions = QUESTIONS.filter(q => numbers.includes(q.number));
  return {
    done: questions.filter(q => !!progress.grades[q.id]).length,
    review: questions.filter(q => progress.grades[q.id] === 'incorrect' || progress.flagged.includes(q.id)).length,
    total: questions.length,
  };
}
