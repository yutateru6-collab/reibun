export type GrammarUnitId = 'verbs-2' | 'tense-1' | 'tense-2';

export interface GrammarLearnCard {
  id: string;
  prompt: string;
  answer: string;
  example?: string;
  detail: string;
}

export interface GrammarQuizQuestion {
  id: string;
  prompt: string;
  example?: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarUnit {
  id: GrammarUnitId;
  lesson: string;
  title: string;
  subtitle: string;
  mapPoints: string[];
  learnCards: GrammarLearnCard[];
  quizQuestions: GrammarQuizQuestion[];
}

export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    id: 'verbs-2',
    lesson: 'Lesson 2-2',
    title: '動詞②',
    subtitle: 'SVC・SVOC・群動詞を整理',
    mapPoints: ['SVC：S＝C', 'SVOC：O＝C', '群動詞：2語以上で1つの動詞'],
    learnCards: [
      {
        id: 'v2-svc',
        prompt: 'SVCでは、C（補語）は何を説明する？',
        answer: 'CはS（主語）を説明し、S＝Cの関係になる。',
        example: 'This question seems quite easy.',
        detail: '「この問題＝かなり簡単」の関係。seem / look / become / get などもSVCで使われる。',
      },
      {
        id: 'v2-svoc',
        prompt: 'SVOCでは、C（補語）は何を説明する？',
        answer: 'CはO（目的語）を説明し、O＝Cの関係になる。',
        example: 'Many people call him a genius at languages.',
        detail: '「him＝a genius at languages」の関係。call + O + C で「OをCと呼ぶ」。',
      },
      {
        id: 'v2-make',
        prompt: 'make + O + C の基本イメージは？',
        answer: '「OをCにする」。',
        example: 'It makes me angry when I see someone smoking in a public place.',
        detail: 'この文では me＝angry。Cには名詞・形容詞・過去分詞・動詞の原形などがくる。',
      },
      {
        id: 'v2-keep',
        prompt: 'keep + O + C は何を表す？',
        answer: '「OをCのままにしておく」。',
        example: 'Jacob keeps his drawer locked at all times.',
        detail: 'his drawer と locked は「引き出しが鍵を掛けられた状態」という関係。',
      },
      {
        id: 'v2-phrasal',
        prompt: '群動詞とは？',
        answer: '動詞が前置詞や副詞などと一緒になり、2語以上で1つの動詞の働きをするもの。',
        example: 'show up / take care of / bring up',
        detail: 'show up「現れる」、take care of「〜の世話をする」、bring up「〜を育てる」。',
      },
      {
        id: 'v2-look-forward',
        prompt: 'look forward to の後ろに動詞を置くなら？',
        answer: '動名詞（doing）を置く。',
        example: "I'm looking forward to hearing from you.",
        detail: 'ここでの to は不定詞の to ではないため、動詞の原形ではなく doing にする。',
      },
    ],
    quizQuestions: [
      {
        id: 'v2-q1',
        prompt: 'SVCのC（補語）について正しい説明は？',
        choices: ['Sを説明し、S＝Cになる', 'Oを説明し、O＝Cになる', 'Vの時制だけを説明する', '文全体の理由だけを表す'],
        correctIndex: 0,
        explanation: 'SVCではCがSの内容・状態を説明するので、S＝Cの関係が成り立つ。',
      },
      {
        id: 'v2-q2',
        prompt: '次の文で me と angry の関係は？',
        example: 'It makes me angry.',
        choices: ['me＝angry', 'It＝angry', 'makes＝angry', 'me と angry に文法上の関係はない'],
        correctIndex: 0,
        explanation: 'make + O + C なので、Oの me をCの angry が説明している。',
      },
      {
        id: 'v2-q3',
        prompt: '次の文の locked は何を説明している？',
        example: 'Jacob keeps his drawer locked.',
        choices: ['Jacob', 'keeps', 'his drawer', 'at all times'],
        correctIndex: 2,
        explanation: 'keep + O + C の形で、locked はOの his drawer の状態を説明する。',
      },
      {
        id: 'v2-q4',
        prompt: '空欄に入る形として適切なのは？',
        example: "I'm looking forward to (     ) from you.",
        choices: ['hear', 'hearing', 'heard', 'have heard'],
        correctIndex: 1,
        explanation: 'look forward to の to の後ろには名詞または動名詞がくるため hearing。',
      },
    ],
  },
  {
    id: 'tense-1',
    lesson: 'Lesson 3-1',
    title: '時制・完了形①',
    subtitle: '現在・過去・現在完了・過去完了',
    mapPoints: ['現在形：習慣・状態', '現在完了：過去と現在のつながり', '過去完了：過去よりさらに前'],
    learnCards: [
      {
        id: 't1-present',
        prompt: '現在形が表す中心イメージは？',
        answer: '現在を中心に、過去・現在・未来を含む広い範囲の時。',
        example: 'My brother washes his car every Sunday.',
        detail: '習慣的な動作や、ある程度続く状態を現在形で表す。',
      },
      {
        id: 't1-progressive',
        prompt: '「今まさに〜している」は何で表す？',
        answer: '現在進行形〈be + doing〉。',
        example: 'Ayaka is playing tennis now.',
        detail: 'その瞬間に進行中の動作だけでなく、ある程度長く進行中の事柄にも使える。',
      },
      {
        id: 't1-perfect-core',
        prompt: '現在完了とは、そもそも何を表す？',
        answer: '「過去と現在とのつながり」を表す。',
        example: 'I have just finished reading this book.',
        detail: '単なる過去の事実ではなく、「今は読み終えている」という現在の状況に焦点がある。',
      },
      {
        id: 't1-past',
        prompt: '過去形の中心イメージは？',
        answer: '現在とは切り離された過去。',
        example: 'I climbed Mt. Fuji with my family two summers ago.',
        detail: '過去の1回の出来事、過去の状態、過去の習慣などを表す。',
      },
      {
        id: 't1-past-progressive',
        prompt: '過去のある時点で進行中だった動作は？',
        answer: '過去進行形〈was / were + doing〉。',
        example: 'The wind was blowing hard when we reached the top of the mountain.',
        detail: 'when節など、過去の基準時点と一緒に使われることが多い。',
      },
      {
        id: 't1-past-perfect',
        prompt: '過去完了の基準時点はどこ？',
        answer: '過去のある時点。そこよりさらに前を振り返る。',
        example: 'The movie had already started when I got to the theater.',
        detail: '「映画が始まった」のは「映画館に着いた」より前なので had started を使う。',
      },
    ],
    quizQuestions: [
      {
        id: 't1-q1',
        prompt: '現在完了の核となる考え方は？',
        choices: ['過去と現在とのつながり', '現在とは切り離された過去', '未来のある時点だけを見る', '過去の動作をすべて進行形にする'],
        correctIndex: 0,
        explanation: 'この教材では、現在完了を「過去と現在とのつながり」を表す形として整理している。',
      },
      {
        id: 't1-q2',
        prompt: '次の現在完了で中心になっているのは？',
        example: 'I have just finished reading this book.',
        choices: ['いつ本を買ったか', '今は読み終えているという状態', '毎日読む習慣', '未来に読み終える予定'],
        correctIndex: 1,
        explanation: '「読み終えた」という過去の動作と、「今は読み終えている」という現在の状態がつながっている。',
      },
      {
        id: 't1-q3',
        prompt: 'had started が使われる理由は？',
        example: 'The movie had already started when I got to the theater.',
        choices: ['映画が今も続いているから', '映画が始まったのが、映画館に着いた時より前だから', '未来の予定だから', '習慣だから'],
        correctIndex: 1,
        explanation: '過去の基準時点「映画館に着いた時」よりさらに前の出来事なので過去完了。',
      },
      {
        id: 't1-q4',
        prompt: '「学校が終わった」を School is over. とする考え方は？',
        choices: ['今、学校が終わった状態である', '過去の1回の出来事だけを述べる', '未来の予定を述べる', '進行中の動作を述べる'],
        correctIndex: 0,
        explanation: '日本語では過去形の訳でも、英語では「現在、終わった状態である」と捉えて現在形にする。',
      },
    ],
  },
  {
    id: 'tense-2',
    lesson: 'Lesson 3-2',
    title: '時制・完了形②',
    subtitle: '未来の表現・時の広がり・完了進行形',
    mapPoints: ['未来はwillだけではない', '未来完了：未来の基準時点まで', '継続：完了形・完了進行形'],
    learnCards: [
      {
        id: 't2-future-variety',
        prompt: '英語に「未来形」という単一の形はある？',
        answer: '単一の「未来形」はなく、未来の捉え方によってさまざまな形を使う。',
        example: 'will / be going to / 現在進行形 / 現在形 / 未来進行形 / 未来完了',
        detail: '意志・計画・準備済みの予定・公的な予定など、意味によって使い分ける。',
      },
      {
        id: 't2-time-clause',
        prompt: 'when / until など「時」を表す副詞節の中で、未来のことは何形？',
        answer: '現在形で表す。',
        example: 'I will call you when I get home.',
        detail: '未来のことでも when 節の中は get と現在形にする。',
      },
      {
        id: 't2-future-perfect',
        prompt: '未来完了は、どこを基準に見る？',
        answer: '未来のある時点を基準に、その時までにどうなっているかを見る。',
        example: 'Will you have finished the work by six?',
        detail: '形は〈will have + 過去分詞〉。開始時点を「今」や「過去」に固定するのではなく、未来の基準時点までを見る。',
      },
      {
        id: 't2-truth',
        prompt: '変わることのない事実・真理は何形？',
        answer: '現在形。',
        example: 'The sun rises in the east and sets in the west.',
        detail: '過去・現在・未来を通して変わらない事実を現在形で表す。',
      },
      {
        id: 't2-past-period',
        prompt: '「父は5年間オランダに住んでいた」が過去形になるときの意味は？',
        answer: 'その5年間を、現在とは切り離された過去として述べる。',
        example: 'My father lived in Holland for five years.',
        detail: '今も住んでいる継続を表すなら、教材では現在完了との対比で説明されている。',
      },
      {
        id: 't2-present-perfect-progressive',
        prompt: '過去から現在まで「動作」が続いていることを強く表す形は？',
        answer: '現在完了進行形〈have / has been + doing〉。',
        example: 'I have been learning English for seven years.',
        detail: '動作動詞を使って現在までの継続を表すときに使う。',
      },
      {
        id: 't2-past-perfect-progressive',
        prompt: '過去のある時点まで動作が続いていたことは？',
        answer: '過去完了進行形〈had been + doing〉。',
        example: 'Ryan had been waiting at the bus stop for half an hour when the bus came.',
        detail: '「バスが来た」という過去の基準時点まで、待つ動作が続いていた。',
      },
    ],
    quizQuestions: [
      {
        id: 't2-q1',
        prompt: '空欄に入る形として適切なのは？',
        example: 'I will call you when I (     ) home.',
        choices: ['get', 'will get', 'got', 'have got'],
        correctIndex: 0,
        explanation: 'when が導く時を表す副詞節では、未来のことでも現在形を使う。',
      },
      {
        id: 't2-q2',
        prompt: '公的なスケジュールとして「コンサートは6時に始まります」は？',
        choices: ['The concert starts at six.', 'The concert started at six.', 'The concert has started at six.', 'The concert had started at six.'],
        correctIndex: 0,
        explanation: '公的な予定・時刻表など、確定的な未来は現在形で表すことがある。',
      },
      {
        id: 't2-q3',
        prompt: '未来完了の基準として正しいのは？',
        choices: ['未来のある時点', '必ず現在だけ', '必ず過去だけ', '時点は考えない'],
        correctIndex: 0,
        explanation: '未来完了は未来のある時点を基準に、その時までの完了・経験・継続を見る。',
      },
      {
        id: 't2-q4',
        prompt: '「太陽は東から昇り西に沈む」に現在形を使う理由は？',
        choices: ['今だけ起きているから', '変わることのない事実・真理だから', '過去の出来事だから', '未来の計画だから'],
        correctIndex: 1,
        explanation: '過去・現在・未来を通して変わらない事実や真理は現在形で表す。',
      },
      {
        id: 't2-q5',
        prompt: '「7年間ずっと英語を習っている」のような動作の継続を表す形は？',
        example: 'I have been learning English for seven years.',
        choices: ['現在完了進行形', '過去進行形', '未来進行形', '過去完了'],
        correctIndex: 0,
        explanation: '過去から現在まで続く動作は〈have been + doing〉で表せる。',
      },
    ],
  },
];

export const PERFECT_SUMMARY = [
  {
    id: 'present-perfect',
    label: '現在完了',
    form: 'have / has + 過去分詞',
    reference: '基準：今',
    core: '過去と現在とのつながり',
    timeline: '過去  ─────▶  今',
    example: 'I have just finished reading this book.',
  },
  {
    id: 'past-perfect',
    label: '過去完了',
    form: 'had + 過去分詞',
    reference: '基準：過去のある時点',
    core: 'その時点よりさらに前を振り返る',
    timeline: 'さらに前  ─────▶  過去の基準時点',
    example: 'The movie had already started when I got to the theater.',
  },
  {
    id: 'future-perfect',
    label: '未来完了',
    form: 'will have + 過去分詞',
    reference: '基準：未来のある時点',
    core: 'その時までにどうなっているかを見る',
    timeline: 'それ以前  ─────▶  未来の基準時点',
    example: 'Will you have finished the work by six?',
  },
] as const;

export const CURRENT_EXAM_RANGE_LABEL = 'Lesson 2-2 / 3-1 / 3-2';
