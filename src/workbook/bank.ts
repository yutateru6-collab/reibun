import { vq3_1_Cards, vq3_2_Cards, vq3_1_QuestionsCards, vq3_2_QuestionsCards } from '../data/vision_quest_exam_2026';
import { basicTestDecks } from '../data/cards';
import type { Card } from '../data/cards';
import type { Question, Unit, Format } from './model';
import { originalPoints } from './originalPoints';

const instructions: Record<string, string> = {
  '日本語に合うように空欄補充': '日本語に合うように、空欄に適切な語を入れなさい。',
  '下線部補充': '日本語に合うように、下線部に適切な語句を補いなさい。',
  '語句を選び形を変える': '［ ］内から適切な語句を選び、形を変えて下線部に入れなさい。',
  '並べ替え': '日本語に合うように、（ ）内の語句を並べ替えて英文を完成させなさい。',
  '英作文': '次の日本語を英語にしなさい。',
};
const sourceNotes: Record<number, string> = {
  2302: '原問題では空欄の後にも is があります。原文を維持しているため、解答例と空欄が一致しません。解答確認時に文全体を確認してください。',
  2303: '原問題の空欄は3個ですが、資料の代表解答は2語です。原文どおりに表示しています。',
  4223: '原テストでは後半の英文が省略されています。解答には基本例文の全文を表示します。',
};
function original(card: Card, unit: Unit): Question {
  const isHope = unit === 'hope3';
  const format: Format = isHope ? 'fill' : card.translation === '英作文' ? 'translation' : card.translation === '並べ替え' ? 'order' : card.translation === '語句を選び形を変える' ? 'wordbank' : 'fill';
  return { id: `original-${card.id}`, origin: 'original', unit, format,
    instruction: isHope ? '日本語に合うように、空欄に適切な語を入れなさい。' : (instructions[card.translation] ?? ''),
    // The original question/word bank is not regenerated or silently corrected.
    prompt: isHope ? `${card.front}\n${card.translation}` : card.front,
    answer: card.back, explanation: [originalPoints[card.id], card.comment].filter(Boolean).join('\n\n'), sourceId: card.id, note: sourceNotes[card.id] };
}
export const originalQuestions: Question[] = [
  ...vq3_1_QuestionsCards.map(c => original(c, 'tense1')),
  ...vq3_2_QuestionsCards.map(c => original(c, 'tense2')),
  ...(basicTestDecks.find(d => d.id === 'hope-test3')?.cards ?? []).map(c => original(c, 'hope3')),
];

// One derivative per numbered example, linked to its exact original sentence.
const targetPhrases: Record<number, string> = {
  3301: 'washes', 3302: 'knows', 3303: 'are', 3304: 'is', 3305: 'is playing',
  3306: 'are causing', 3307: 'have just finished', 3308: 'climbed', 3309: 'was',
  3310: 'was blowing', 3311: 'had already started', 3312: 'had left',
  3313: 'have come', 3314: 'had visited',
  3401: 'get', 3402: 'is going to visit', 3403: 'is leaving', 3404: 'starts',
  3405: 'will be showing', 3406: 'have finished', 3407: 'rises', 3408: 'lived',
  3409: 'have lived', 3410: 'have been learning', 3411: 'have passed',
  3412: 'has hurt', 3413: 'had been waiting', 3414: 'is about to begin',
  3415: 'is expected to arrive', 3416: 'is thinking of having', 3417: 'have been',
  3418: "It's been",
};
export const transformedQuestions: Question[] = [...vq3_1_Cards, ...vq3_2_Cards].map((c, i) => {
  const order = i % 2 === 0;
  const target = targetPhrases[c.id];
  if (!target || !c.back.includes(target)) throw new Error(`変換対象が原文にありません: ${c.id}`);
  return { id: `transformed-${c.id}`, origin: 'transformed', unit: c.id < 3400 ? 'tense1' : 'tense2',
    format: order ? 'order' : 'fill', sourceId: c.id,
    instruction: order ? '日本語に合うように、すべての語句を並べ替えて英文を作りなさい。文頭の大文字・句読点も整えなさい。' : '日本語に合うように、空欄に適切な語句を入れなさい。',
    prompt: order ? c.translation : `${c.translation}\n${c.back.replace(target, '________________')}`,
    tokens: order ? c.back.split(/\s+/) : undefined,
    answer: c.back, explanation: `${c.comment}\n解答は元の基本例文です。記述は文法と意味が合う別の表現もあり得るため、解答例と比較して自己採点してください。` };
});

let next = 0;
function written(unit: Unit, format: Format, instruction: string, prompt: string, answer: string, explanation: string): Question {
  return { id: `application-${String(++next).padStart(2, '0')}`, origin: 'application', unit, format, instruction, prompt, answer, explanation };
}
function choose(unit: Unit, format: Format, prompt: string, choices: string[], correct: number, explanation: string): Question {
  const q = written(unit, format, '文脈や指示に合う答えを1つ選びなさい。', prompt, choices[correct], explanation);
  q.choices = choices.map((text, i) => ({ id: `${q.id}-${i}`, text })); q.correctId = q.choices[correct].id;
  return q;
}
// New sentences, not transcriptions. All targeted grammar is limited to Lesson 3-1/3-2.
export const applicationQuestions: Question[] = [
  choose('tense1', 'choice', '妹は毎朝、牛乳を飲みます。\nMy sister (　　) milk every morning.', ['drink', 'drinks', 'drank', 'is drink'], 1, '現在の習慣を現在形で表す。主語が My sister なので drinks。'),
  choose('tense1', 'choice', 'I (　　) Yuki at the library yesterday.', ['have seen', 'see', 'saw', 'will see'], 2, 'yesterday は現在から切り離された過去の時点。ここでは過去形 saw を使う。'),
  choose('tense2', 'choice', 'I (　　) Rina for ten years. We are still good friends.', ['have known', 'have been knowing', 'am knowing', 'know'], 0, '過去から現在まで「知っている」という状態の継続は have known。know はこの意味では進行形にしない。'),
  choose('tense2', 'choice', 'I will text you when I (　　) at the station.', ['will arrive', 'arrive', 'arrived', 'am arrive'], 1, 'この when 節は「駅に着いたら」という時を表す副詞節。未来の到着でも現在形を使う。'),
  choose('tense2', 'choice', '普段から成り立つこととして述べています。\nTwo and three (　　) five.', ['are making', 'have made', 'make', 'made'], 2, 'いつでも成り立つ事柄は現在形で表す。'),
  choose('tense2', 'choice', '「明日の正午までには仕事を終えているだろう」という意味にしなさい。\nI will (　　) the work by noon tomorrow.', ['has finished', 'have finished', 'had finished', 'be finish'], 1, '未来の基準時までの完了は will have + 過去分詞。空欄は have finished。'),
  choose('tense1', 'choice', '今、まさに赤ちゃんが泣いています。\nThe baby (　　) now.', ['is crying', 'crying', 'is cry', 'has crying'], 0, '今進行中の動作は be + -ing。単数の主語なので is crying。'),
  choose('tense1', 'choice', 'I (　　) sixteen years old last year.', ['am', 'have been', 'will be', 'was'], 3, 'last year の状態を述べるので be 動詞の過去形 was。'),

  written('tense1', 'correction', '誤っている動詞部分を直し、文全体を書きなさい。', 'I have visited the museum yesterday.', 'I visited the museum yesterday.', 'yesterday という過去の時点が指定されている。have visited を visited に直す。'),
  written('tense1', 'correction', '誤っている動詞部分を直し、文全体を書きなさい。', 'She is knowing the answer.', 'She knows the answer.', '「答えを知っている」という状態は knows。is knowing にはしない。'),
  written('tense2', 'correction', '「着いたら電話する」という意味になるように、誤りを直して文全体を書きなさい。', 'I will call you when I will arrive.', 'I will call you when I arrive.', '時を表す when 節では、単純な未来の出来事を現在形で表す。主節の will は残す。'),
  written('tense2', 'correction', '主語と動詞の関係に注意して、誤りを直して文全体を書きなさい。', 'They has been waiting for an hour.', 'They have been waiting for an hour.', '主語 They に対応する完了形の助動詞は have。継続を表す have been waiting の形にする。'),

  written('tense2', 'rewrite', '現在完了形（進行形ではない形）を使って、空欄を補いなさい。', 'I started living here in 2021, and I still live here.\n→ I __________________ here since 2021.', 'have lived', '2021年から今まで住んでいるので have lived。現在完了進行形も文脈上は可能だが、この設問では進行形ではない形を指定している。'),
  written('tense2', 'rewrite', 'ほぼ同じ意味になるように、空欄を補いなさい。', 'Five years have passed since I first met Ken.\n→ It __________________ five years since I first met Ken.', 'has been（is も可）', '経過した時間は It has been ... since ... または It is ... since ... で表せる。'),
  written('tense2', 'rewrite', '現在完了形を使って、空欄を補いなさい。', 'I last saw her two years ago.\n→ I __________________ for two years.', 'have not seen her / haven\'t seen her', '最後に会ってから2年間会っていない。have not seen と for two years を組み合わせる。'),
  written('tense1', 'rewrite', '過去の場面を振り返る文にしなさい。', 'It is the first time I have cooked dinner.\n→ It was the first time I __________________ dinner.', 'had cooked', '「その時が初めてだった」は It was the first time + 主語 + had + 過去分詞。'),

  choose('tense1', 'timeline', 'The train had already left when I arrived at the station.\n出来事が起きた順序は？', ['私が到着 → 電車が出発', '電車が出発 → 私が到着', '両方ともこれから', '順序はこの文からは分からない'], 1, '到着した時点より前に出発が完了していたことを had already left が示している。'),
  written('tense2', 'timeline', '次の時系列に合うように、過去完了進行形を使って補いなさい。', '午後6時：読書を開始 → 読み続ける → 午後7時：友人から電話\nI __________________ for an hour when my friend called.（read）', 'had been reading', '電話が来た過去の時点まで1時間続いていた動作を、had been reading で表す。'),
  choose('tense2', 'timeline', 'Mina has lived in this town since 2022.\nこの文の「住んでいる期間」に合うのは？', ['2022年から今まで', '2022年より前だけ', '明日から先だけ', '今この瞬間だけ'], 0, 'since 2022 は継続の開始点。has lived で現在までの状態の継続を表す。'),
  written('tense2', 'timeline', '未来完了形を使って空欄を補いなさい。', '明日：午後6時までに宿題を完了 → 午後7時に出かける予定\nBy seven tomorrow evening, I __________________ my homework.（finish）', 'will have finished', '未来の午後7時を基準にして、それまでに宿題を終えていることを表す。'),

  choose('tense2', 'meaning', 'A: I lived in Osaka for three years.\nB: I have lived in Osaka for three years.\nBの継続の読み方に合う説明は？', ['過去の3年間だけを切り離して述べる', '3年前に住み始め、今まで続いている', '3年後に住み始める', '今初めて到着した'], 1, 'Bは過去から現在までの継続。Aは過去の一定期間の居住を述べるが、この一文だけで現在の居住地までは断定しない。'),
  choose('tense1', 'meaning', 'A: When I came home, he was eating dinner.\nB: When I came home, he had eaten dinner.\n帰宅時には夕食を食べ終えていたことを表すのは？', ['A', 'B'], 1, 'was eating は帰宅時に食べている途中。had eaten は帰宅より前に食べることが完了していた。'),
  choose('tense2', 'meaning', 'I am leaving for Kyoto tomorrow.\nこの進行形が表す内容は？', ['今まさに移動中という意味だけ', '手配などが進んでいる未来の予定', '過去の経験', '過去の習慣'], 1, 'tomorrow とともに使われている現在進行形は、準備や手配が進んでいる未来の予定を表す。'),
  choose('tense1', 'meaning', 'The lesson is over.\nこの英文の捉え方は？', ['今、授業が終わった状態にある', 'これから授業が始まる', '授業が始まった経験がある', '授業が続いている途中だ'], 0, 'is over は現在の状態。「終わった」という日本語だけを見て過去形と判断しない。'),

  choose('tense2', 'dialogue', 'A: I am thirsty.\nB: Really? (　　) you some water.\nBはその場で水を取ってくると決めました。', ['I had brought', 'I will get', 'I have been getting', 'I was getting'], 1, 'この場面では、その場で決めた意志を I will get で表す。will がすべての文脈で「その場の決定」だけを表すわけではない。'),
  choose('tense2', 'dialogue', 'A: What time does the film start?\nB: It (　　) at seven, according to the schedule.', ['starting', 'has start', 'starts', 'is start'], 2, '時刻表・公的な予定を現在形 starts で表せる。他の正しい未来表現を一律に誤りにしないため、ここでは形の成立しない選択肢と区別する。'),
  written('tense2', 'dialogue', '現在完了進行形を使って、Bの空欄を補いなさい。', 'A: How long have you been waiting?\nB: I __________________ for thirty minutes.（wait）', 'have been waiting', '過去から今まで続いている「待つ」という動作を、指定された現在完了進行形で表す。'),
  written('tense2', 'dialogue', 'be going to を使って、Bの空欄を補いなさい。', 'A: Do you have any plans for Sunday?\nB: Yes. I __________________ my grandparents.（visit）', 'am going to visit', '前からの予定を be going to + 原形で表す。主語が I なので am。現在進行形や will が常に誤りという意味ではなく、この設問は形を指定している。'),

  choose('tense2', 'classification', 'I have known her since I was ten.\nこの現在完了形の用法は？', ['経験', '継続', '完了・結果'], 1, '10歳の時から今まで「知っている」という状態が続いている。'),
  choose('tense2', 'classification', 'I have been to that museum three times.\nこの現在完了形の用法は？', ['継続', '完了・結果', '経験'], 2, 'three times とともに、これまでに3回行った経験を述べている。'),
  choose('tense1', 'classification', 'I have just finished my homework.\nこの現在完了形の用法は？', ['経験', '継続', '完了・結果'], 2, 'ちょうど宿題を終えたところで、今は終わっているという状況に焦点がある。'),
  choose('tense2', 'classification', 'I have lost my key, so I cannot open the door now.\nこの現在完了形の用法は？', ['継続', '経験', '完了・結果'], 2, '鍵をなくした結果が、今ドアを開けられないという状況につながっている。'),

  written('tense2', 'translation', 'be about to を使って、英語にしなさい。', '私は今、まさに外出しようとしています。', 'I am about to go out.', '差し迫った未来を be about to + 動詞の原形で表す。I\'m about to go out. も可。'),
  written('tense2', 'translation', 'be thinking of を使って、英語にしなさい。', '彼女は新しい自転車を買おうと思っています。', 'She is thinking of buying a new bicycle.', 'be thinking of の後ろの動詞は -ing。a new bike も可。'),
  written('tense2', 'translation', '過去完了形を使って、英語にしなさい。', '私はその時まで京都に行ったことがありませんでした。', 'I had never been to Kyoto until then.', '過去のその時までの経験を、過去完了の否定で表す。I had not been to Kyoto until then. も可。'),
  written('tense2', 'translation', '未来完了形を使って、英語にしなさい。', 'もう一度その博物館に行けば、3回行ったことになるでしょう。', 'I will have been to that museum three times if I go there again.', '未来のある時点までの経験は will have been to。if 節では未来のことも go と現在形にする。'),

  written('tense1', 'reading', '日本語の状況に合うように、動詞の形を補いなさい。', '昨日午後8時、私は読書の途中でした。その時、電話が鳴りました。\nAt eight last night, I (1) __________________ a book. Suddenly, my phone (2) __________________.\n(1) read　(2) ring', '(1) was reading　(2) rang', '(1) 過去のある時点で進行中だった動作。(2) その途中で起きた1回の出来事。'),
  written('tense1', 'reading', '（1）は現在形、（2）は現在進行形を使って補いなさい。', 'My brother usually (1) __________________ tennis on Sundays. Today, however, he (2) __________________ for a test at home.\n(1) play　(2) study', '(1) plays　(2) is studying', '普段の習慣と、今日進行中の動作を区別する。主語 My brother に合わせて plays / is studying。'),
  written('tense2', 'reading', '（1）は現在完了形、（2）は現在形を使って補いなさい。', 'I (1) __________________ Ken since 2020. We (2) __________________ at the same school now.\n(1) know　(2) be', '(1) have known　(2) are', '(1) 過去から現在までの知り合いという状態。(2) 今、同じ学校にいるという現在の状態。'),
  written('tense2', 'reading', '（1）は未来完了形、（2）は時を表す副詞節に合う形を使いなさい。', '明日、私は午後6時までに荷造りを終える予定です。妹が午後7時に帰宅したら一緒に夕食を取ります。\nI (1) __________________ my packing by six tomorrow. When my sister (2) __________________ home at seven, we will have dinner together.\n(1) finish　(2) get', '(1) will have finished　(2) gets', '(1) 未来の時点までの完了。(2) 未来のことでも時を表す when 節では現在形。主語が my sister なので gets。'),
];
export const QUESTION_BANK: Question[] = [...originalQuestions, ...transformedQuestions, ...applicationQuestions];
