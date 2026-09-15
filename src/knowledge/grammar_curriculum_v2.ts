import {
  GRAMMAR_CATEGORIES as BASE_CATEGORIES,
  type GrammarCategoryId,
  type GrammarLevel,
  type GrammarQuestion,
} from './grammar_sets';

export interface GrammarQuestionV2 extends GrammarQuestion {
  example: string;
}

export interface GrammarCategoryV2 {
  id: GrammarCategoryId;
  title: string;
  questions: GrammarQuestionV2[];
}

const extra = (
  id: string,
  prompt: string,
  choices: [string, string, string, string],
  correctIndex: number,
  explanation: string,
  example: string,
  level: GrammarLevel = '基本',
): GrammarQuestionV2 => ({ id, prompt, choices, correctIndex, explanation, example, level });

const EXTRA: Record<GrammarCategoryId, GrammarQuestionV2[]> = {
  perfect: [
    extra(
      'pf-core-01',
      '現在完了形は、どんなときに使う？',
      ['過去のことを「今とのつながり」から述べるとき', '未来の予定だけを述べるとき', '過去の出来事を今と完全に切り離すとき', '動作の途中だけを表すとき'],
      0,
      '現在完了形は、過去の出来事・状態を「今とのつながり」からとらえるときに使う。',
      'I have just finished reading this book.',
    ),
    extra(
      'pf-core-02',
      '現在完了形の3つの基本用法は？',
      ['継続・経験・完了／結果', '現在・過去・未来', '習慣・予定・命令', '意志・推量・義務'],
      0,
      '今回の範囲では、現在完了形を「継続」「経験」「完了／結果」の3つに整理する。',
      'I have been to Tokyo several times.',
    ),
    extra(
      'pf-core-03',
      '現在完了の「継続」は、どんな意味？',
      ['過去から今までずっと続いている', '未来まで必ず続く', '過去の1回だけの出来事', '今だけ一瞬起きている'],
      0,
      '継続は、過去のある時点から現在まで状態・動作が続いていることを表す。',
      'Mr. and Mrs. Smith have lived in Kyoto since 2020.',
    ),
    extra(
      'pf-core-04',
      '現在完了の「完了／結果」は、どんな考え方？',
      ['過去の出来事の結果が今につながっている', '未来の予定だけを表す', '毎日の習慣を表す', '過去を今と完全に切り離す'],
      0,
      '完了／結果では、過去に起こったことが現在の状態につながっている点を見る。',
      'He has hurt his knee and is in the hospital now.',
    ),
  ],
  future: [
    extra(
      'fu-core-01',
      '未来のことを表すとき、最初に考えるべきことは？',
      ['どんな未来としてとらえるか', '必ず will を使うこと', '必ず現在形を使うこと', '主語が三人称単数かだけ'],
      0,
      '英語には単一の「未来形」があるわけではなく、意志・計画・確定した予定など、未来のとらえ方で形を選ぶ。',
      'My family is going to visit Paris this December.',
    ),
    extra(
      'fu-core-02',
      '「その場で決めた意志」を表す代表的な形は？',
      ['will + 動詞の原形', 'had + 過去分詞', 'have been + doing', 'was / were + doing'],
      0,
      'その場で決めた意志には will を使うのが基本。',
      'I will call you tonight.',
    ),
    extra(
      'fu-core-03',
      '「前から進んでいる計画」を表す代表的な形は？',
      ['be going to + 動詞の原形', 'had + 過去分詞', '現在完了だけ', '過去進行形だけ'],
      0,
      '前から計画している未来には be going to が使える。',
      'My family is going to visit Paris this December.',
    ),
    extra(
      'fu-core-04',
      '今回の範囲で扱う未来表現の組み合わせとして正しいのは？',
      ['will / be going to / 現在進行形 / 現在形 / 未来進行形 / 未来完了形', '過去形だけ', '現在完了だけ', 'will と would だけ'],
      0,
      '今回の範囲では、未来を表す複数の形を場面に応じて使い分ける。',
      'The concert starts at six.',
    ),
  ],
  countable: [
    extra(
      'cu-core-01',
      '可算名詞かどうかを考える最初のポイントは？',
      ['そのまま「1つ、2つ…」と数えられるか', '必ず長い単語か', '動詞の後ろにあるか', '文の最初にあるか'],
      0,
      '可算名詞は、その名詞自体を1つ、2つ…と数えられる名詞。',
      'Five families live in this apartment building.',
    ),
    extra(
      'cu-core-02',
      '不可算名詞を数えたいときは、どうする？',
      ['a piece of / a cup of など単位・容器を使う', '必ず -s を付ける', '必ず an を付ける', '何も付けず数字を直接置く'],
      0,
      '不可算名詞は、そのまま1つ、2つ…と数えず、単位や容器を表す語を使う。',
      'Can you pass me two pieces of paper?',
    ),
    extra(
      'cu-core-03',
      '不特定の「1つの可算名詞」を表すときの基本は？',
      ['a / an + 単数可算名詞', 'a / an + 不可算名詞', '必ず複数形', '必ず無冠詞'],
      0,
      '不特定の1つの可算名詞には、基本的に a / an を付ける。',
      'I want a computer.',
    ),
    extra(
      'cu-core-04',
      '不可算名詞の基本的な扱いとして正しいのは？',
      ['単数扱いで、通常は複数の -s を付けない', '必ず複数扱いにする', '必ず a を付ける', '必ず the を付ける'],
      0,
      '不可算名詞は基本的に単数扱いで、そのまま複数形にはしない。',
      'All the furniture is made of wood.',
    ),
  ],
};

const PRIORITY: Record<GrammarCategoryId, string[]> = {
  perfect: ['pf-06', 'pf-09', 'pf-10', 'pf-11', 'pf-12', 'pf-01', 'pf-04', 'pf-02', 'pf-05', 'pf-03', 'pf-07', 'pf-08'],
  future: ['fu-01', 'fu-06', 'fu-07', 'fu-08', 'fu-09', 'fu-10', 'fu-11', 'fu-12', 'fu-02', 'fu-03', 'fu-04', 'fu-05'],
  countable: ['cu-01', 'cu-02', 'cu-03', 'cu-04', 'cu-05', 'cu-06', 'cu-08', 'cu-09', 'cu-10', 'cu-11', 'cu-12', 'cu-07'],
};

const LEVEL_RANK: Record<GrammarLevel, number> = { 基本: 0, 使い分け: 1, 応用: 2 };

function exampleFor(category: GrammarCategoryId, question: GrammarQuestion): string {
  const text = `${question.prompt} ${question.explanation}`;

  if (category === 'perfect') {
    if (text.includes('過去完了進行')) return 'Ryan had been waiting at the bus stop for half an hour when the bus came.';
    if (text.includes('現在完了進行') || text.includes('動作が続')) return 'I have been learning English for seven years.';
    if (text.includes('過去完了') || text.includes('基準時点より前') || text.includes('さらに前')) return 'The movie had already started when I got to the theater.';
    if (text.includes('未来完了') || text.includes('by six')) return 'Will you have finished the work by six?';
    if (text.includes('since')) return 'Mr. and Mrs. Smith have lived in Kyoto since 2020.';
    if (text.includes('for')) return 'I have known David for ten years.';
    if (text.includes('have been to') || text.includes('経験')) return 'I have been to Tokyo several times.';
    if (text.includes('come to')) return 'Recently, I have come to like her.';
    if (text.includes('first time')) return 'It was the first time she had tried the tea ceremony.';
    if (text.includes('久しぶり')) return "It's been a long time since I last saw my elementary school teacher.";
    if (text.includes('last week') || text.includes('切り離された過去')) return 'I finished reading this book last week.';
    if (text.includes('完了') || text.includes('結果') || text.includes('現在とのつながり') || text.includes('今とのつながり')) return 'I have just finished reading this book.';
    return 'I have just finished reading this book.';
  }

  if (category === 'future') {
    if (text.includes('be going to') || text.includes('前から') || text.includes('状況から')) return 'My family is going to visit Paris this December.';
    if (text.includes('現在進行形') || text.includes('準備が進')) return 'My father is leaving for France tomorrow.';
    if (text.includes('公的') || text.includes('スケジュール') || text.includes('時刻表')) return 'The concert starts at six.';
    if (text.includes('未来進行')) return 'This theater will be showing Titanic from next week.';
    if (text.includes('未来完了') || text.includes('by six')) return 'Will you have finished the work by six?';
    if (text.includes('when') || text.includes('until') || text.includes('副詞節')) return 'I will call you when I get home.';
    if (text.includes('be about to') || text.includes('差し迫')) return 'The final game is about to begin.';
    if (text.includes('expected')) return 'This plane is expected to arrive at Narita Airport at 7 p.m.';
    if (text.includes('thinking of')) return 'She is thinking of having a dog.';
    if (text.includes('will')) return 'I will call you tonight.';
    return 'My family is going to visit Paris this December.';
  }

  if (text.includes('advice')) return 'Could I give you a piece of advice?';
  if (text.includes('information')) return "I'll find new information online.";
  if (text.includes('furniture')) return 'All the furniture is made of wood.';
  if (text.includes('paper')) return 'Can you pass me two pieces of paper?';
  if (text.includes('homework')) return 'Our teacher gave us a lot of homework.';
  if (text.includes('money')) return 'Could you lend me some money?';
  if (text.includes('tea')) return 'Could I have a cup of tea, please?';
  if (text.includes('butter') || text.includes('milk')) return 'Butter is made from milk.';
  if (text.includes('room')) return 'There is room for improvement in our work.';
  if (text.includes('work')) return 'His works of art are wonderful.';
  if (text.includes('family') || text.includes('families')) return 'Five families live in this apartment building.';
  if (text.includes('water') || text.includes('ice')) return 'Water freezes into ice at zero degrees Celsius.';
  if (text.includes('game') || text.includes('fun')) return 'Playing video games is fun.';
  if (text.includes('sheep')) return 'There are some sheep on the farm.';
  if (text.includes('chicken') || text.includes('fish')) return 'Which would you like, chicken or fish?';
  if (text.includes('garbage')) return 'Please put the garbage into the plastic bag.';
  if (text.includes('pencil') || text.includes('eraser')) return 'Do you have a pencil and an eraser?';
  return 'I want a computer.';
}

function orderBase(id: GrammarCategoryId, questions: GrammarQuestion[]): GrammarQuestion[] {
  const priority = new Map(PRIORITY[id].map((questionId, index) => [questionId, index]));
  return [...questions].sort((a, b) => {
    const levelDiff = LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
    if (levelDiff !== 0) return levelDiff;
    const pa = priority.get(a.id);
    const pb = priority.get(b.id);
    if (pa !== undefined || pb !== undefined) return (pa ?? 999) - (pb ?? 999);
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

export const GRAMMAR_CATEGORIES_V2: GrammarCategoryV2[] = BASE_CATEGORIES.map((category) => ({
  id: category.id,
  title: category.title,
  questions: [
    ...EXTRA[category.id],
    ...orderBase(category.id, category.questions).map((question) => ({
      ...question,
      example: exampleFor(category.id, question),
    })),
  ],
}));

export const TOTAL_GRAMMAR_QUESTIONS = GRAMMAR_CATEGORIES_V2.reduce((sum, category) => sum + category.questions.length, 0);
