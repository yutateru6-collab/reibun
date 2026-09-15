export type GrammarCategoryId = 'perfect' | 'future' | 'countable';
export type GrammarLevel = '基本' | '使い分け' | '応用';

export interface GrammarQuestion {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  level: GrammarLevel;
}

export interface GrammarCategory {
  id: GrammarCategoryId;
  title: string;
  questions: GrammarQuestion[];
}

const q = (
  id: string,
  prompt: string,
  choices: [string, string, string, string],
  correctIndex: number,
  explanation: string,
  level: GrammarLevel,
): GrammarQuestion => ({ id, prompt, choices, correctIndex, explanation, level });

const perfect: GrammarQuestion[] = [
  q('pf-01', '現在完了形はどうやって作る？', ['have / has + 過去分詞', 'had + 過去分詞', 'will + 動詞の原形', 'be + 動詞のing形'], 0, '現在完了形の基本形は〈have / has + 過去分詞〉。', '基本'),
  q('pf-02', '過去完了形はどうやって作る？', ['have / has + 過去分詞', 'had + 過去分詞', 'will have + 過去分詞', 'was / were + 動詞のing形'], 1, '過去完了形の基本形は〈had + 過去分詞〉。', '基本'),
  q('pf-03', '未来完了形はどうやって作る？', ['will + 動詞の原形', 'will be + 動詞のing形', 'will have + 過去分詞', 'have been + 動詞のing形'], 2, '未来完了形は〈will have + 過去分詞〉。', '基本'),
  q('pf-04', '現在完了進行形はどうやって作る？', ['have / has been + 動詞のing形', 'had been + 動詞のing形', 'will be + 動詞のing形', 'have / has + 動詞のing形'], 0, '現在完了進行形は〈have / has been + doing〉。', '基本'),
  q('pf-05', '過去完了進行形はどうやって作る？', ['have been + 動詞のing形', 'had been + 動詞のing形', 'was + 過去分詞', 'will have been + 過去分詞'], 1, '過去のある時点まで続いていた動作は〈had been + doing〉で表せる。', '基本'),
  q('pf-06', '現在完了形の中心イメージは？', ['現在と切り離された過去', '過去と現在とのつながり', '未来だけを見る', '動作の途中だけを見る'], 1, '教材では、現在完了形を「過去と現在とのつながり」を表す形として整理している。', '基本'),
  q('pf-07', '過去完了形は、どこを基準に考える？', ['現在', '未来のある時点', '過去のある時点', '時点は考えない'], 2, '過去完了は、過去のある時点よりさらに前を振り返る。', '基本'),
  q('pf-08', '未来完了形は、どこを基準に考える？', ['未来のある時点', '現在だけ', '過去だけ', '基準時点はない'], 0, '未来完了は、未来のある時点までの完了・経験・継続を見る。', '基本'),
  q('pf-09', 'since が表すのは？', ['期間の長さ', '継続の出発点', '未来の予定', '過去の回数'], 1, 'since は「〜以来」と継続の出発点を表す。', '基本'),
  q('pf-10', 'for が表すのは？', ['期間の長さ', '継続の出発点', '未来の時刻', '経験の回数'], 0, 'for は「〜の間」と期間の長さを表す。', '基本'),
  q('pf-11', '〈have been to 〜〉の意味は？', ['〜へ行く予定だ', '〜へ行ったことがある', '〜へ行っている途中だ', '〜から戻れない'], 1, '〈have been to 〜〉は「〜に行ったことがある」という経験を表す。', '基本'),
  q('pf-12', '「過去から今まで動作が続いている」ことを強く表す形は？', ['現在完了進行形', '過去進行形', '未来進行形', '単純過去形'], 0, '動作の継続には〈have / has been + doing〉がよく使われる。', '基本'),

  q('pf-13', 'I (　　　) reading this book.「ちょうどこの本を読み終えた」', ['have just finished', 'just finished yesterday', 'had just finish', 'will just finished'], 0, '「今は読み終えている」という現在とのつながりに焦点があるため現在完了。', '使い分け'),
  q('pf-14', 'I (　　　) this book last week.「先週この本を読み終えた」', ['have finished', 'finished', 'had finished now', 'have been finishing'], 1, 'last week のように現在と切り離された過去の時点があるので過去形。', '使い分け'),
  q('pf-15', 'Mr. and Mrs. Smith (　　　) in Kyoto since 2020.', ['lived', 'have lived', 'will live', 'had lived tomorrow'], 1, '2020年から現在まで続く状態なので現在完了の継続。', '使い分け'),
  q('pf-16', 'I (　　　) English for seven years.「7年間ずっと英語を習っている」', ['have been learning', 'had learned yesterday', 'will learn', 'am learned'], 0, '過去から現在まで続く動作なので現在完了進行形が適切。', '使い分け'),
  q('pf-17', 'I (　　　) David for ten years.「デイビッドを10年間知っている」', ['have known', 'have been knowing', 'am knowing', 'knew tomorrow'], 0, 'know は状態動詞なので、この継続は現在完了形〈have known〉で表す。', '使い分け'),
  q('pf-18', 'The movie (　　　) when I got to the theater.', ['has already started', 'had already started', 'will have started', 'is starting every day'], 1, '映画が始まったのは「映画館に着いた」という過去の基準時点より前なので過去完了。', '使い分け'),
  q('pf-19', 'I realized that I (　　　) my cell phone at home.', ['have left', 'had left', 'will leave', 'am leaving'], 1, '「家に忘れた」のは「気付いた」より前なので過去完了。', '使い分け'),
  q('pf-20', 'Ryan (　　　) for half an hour when the bus came.', ['has been waiting', 'had been waiting', 'will be waiting', 'is waited'], 1, 'バスが来た過去の時点まで待つ動作が続いていたので過去完了進行形。', '使い分け'),
  q('pf-21', 'He (　　　) his knee and is in the hospital now.', ['has hurt', 'hurt last year', 'had hurt tomorrow', 'is hurting always'], 0, 'けがをした結果が「今入院している」という現在の状態につながっている。', '使い分け'),
  q('pf-22', 'I (　　　) to Tokyo several times.', ['have been', 'have gone yesterday', 'had been tomorrow', 'am being'], 0, '「何度か行ったことがある」は経験なので〈have been to 〜〉。', '使い分け'),
  q('pf-23', 'Recently, I (　　　) to like tea.', ['have come', 'had come tomorrow', 'will came', 'am come'], 0, '「最近〜するようになってきた」は〈have / has come to do〉で表す。', '使い分け'),
  q('pf-24', 'It was the first time I (　　　) a foreign country.', ['have visited', 'had visited', 'will visit', 'am visiting'], 1, '過去の時点からさらに前の経験を振り返るので〈It was the first time S had done〉。', '使い分け'),

  q('pf-25', 'My father lived in Holland for five years. から自然に読み取れるのは？', ['今も住んでいることが必ず分かる', 'その5年間を現在と切り離された過去として述べている', '未来に5年間住む予定だ', '5年間ずっと今も住んでいることしか表せない'], 1, '過去形 lived は、その期間を現在とは切り離された過去として述べる。', '応用'),
  q('pf-26', 'My father has lived in Holland for five years. の教材上の読み方は？', ['今も住んでいる状態につながる', '5年前に住むのをやめた', '未来に住み始める', '一度だけ訪れた'], 0, '現在完了は現在とのつながりを持つため、「今も住んでいる」という継続を表せる。', '応用'),
  q('pf-27', '「スミス夫妻は2020年から京都に住んでいる」で since 2020 が示すのは？', ['期間の長さ', '継続の開始点', '未来の締切', '経験の回数'], 1, 'since 2020 は「2020年から」という開始点。', '応用'),
  q('pf-28', 'Will you (　　　) the work by six?', ['finish yesterday', 'have finished', 'had finished now', 'be finished every day'], 1, '未来の6時までの完了を見るので〈will have + 過去分詞〉。will の後ろに入るのは have finished。', '応用'),
  q('pf-29', '「この歌を聞くのは久しぶりだ」に対応する基本パターンは？', ["It's been a long time since S last + 過去形", 'S had been + doing by tomorrow', 'S will + 過去分詞', 'S is + 過去分詞 since'], 0, '教材では〈It has [It\'s] been a long time since + S + last + 過去形〉を扱う。', '応用'),
  q('pf-30', '「経験」を表す現在完了として最も適切なのは？', ['I have been to Tokyo several times.', 'I went to Tokyo yesterday.', 'I am going to Tokyo tomorrow.', 'I was going to Tokyo at six.'], 0, 'several times とともに「行ったことがある」という経験を現在完了で表している。', '応用'),
  q('pf-31', '「継続」を表す現在完了として最も適切なのは？', ['I have known David for ten years.', 'I knew David yesterday.', 'I will know David tomorrow.', 'I am knowing David now.'], 0, '状態動詞 know の過去から現在までの継続は〈have known〉。', '応用'),
  q('pf-32', '「完了・結果」の考え方に最も近いのは？', ['過去の出来事が今の状態につながっている', '未来の予定だけを表す', '毎日の習慣だけを表す', '過去の出来事を現在から完全に切り離す'], 0, '現在完了の完了・結果は、過去の出来事と現在の状態のつながりを見る。', '応用'),
  q('pf-33', '「過去のある時点まで、ずっと待っていた」に最も合う形は？', ['had been waiting', 'have been waiting', 'will be waiting', 'is waiting'], 0, '過去の基準時点まで続いた動作は過去完了進行形。', '応用'),
  q('pf-34', '「今までずっと学び続けている」に最も合う形は？', ['have been learning', 'had been learning when', 'will have learned by', 'learned yesterday'], 0, '今まで続く動作に注目するので現在完了進行形。', '応用'),
  q('pf-35', '過去完了を使う判断として最も重要なのは？', ['過去の出来事が2つあり、一方が基準時点より前かを見る', '文に yesterday があれば必ず使う', '日本語が「〜した」なら必ず使う', '主語が三人称単数かだけを見る'], 0, '過去完了は「過去の基準時点よりさらに前」という時間関係を表す。', '応用'),
  q('pf-36', '現在完了と過去形を区別するとき、最初に見るべき考え方は？', ['現在とのつながりがあるか', '英文の長さ', '主語が人か物か', '目的語があるか'], 0, '教材の中心整理は「現在完了＝過去と現在のつながり」「過去形＝現在と切り離された過去」。', '応用'),
];

const future: GrammarQuestion[] = [
  q('fu-01', '英語に、現在形・過去形と同じような単一の「未来形」はある？', ['ある', 'ない', 'will だけが未来形', 'be going to だけが未来形'], 1, '教材では、英語に単一の「未来形」はなく、未来の捉え方によってさまざまな形を使うと説明している。', '基本'),
  q('fu-02', 'will の後ろに置く動詞の形は？', ['原形', '過去形', '過去分詞', 'ing形だけ'], 0, 'will は助動詞なので、後ろは動詞の原形。', '基本'),
  q('fu-03', 'be going to の後ろに置く動詞の形は？', ['原形', '過去形', '過去分詞', 'ing形'], 0, '基本形は〈be going to + 動詞の原形〉。', '基本'),
  q('fu-04', '未来進行形はどうやって作る？', ['will be + 動詞のing形', 'will have + 過去分詞', 'have been + 動詞のing形', 'be going + 過去分詞'], 0, '未来進行形は〈will be + doing〉。', '基本'),
  q('fu-05', '未来完了形はどうやって作る？', ['will + 原形', 'will be + doing', 'will have + 過去分詞', 'had + 過去分詞'], 2, '未来完了形は〈will have + 過去分詞〉。', '基本'),
  q('fu-06', 'will が表す代表的な意味は？', ['予測・意志', '過去の習慣だけ', '完了だけ', '経験だけ'], 0, 'will は未来の予測や意志を表す。', '基本'),
  q('fu-07', 'be going to が表す代表的な意味は？', ['前から進んでいる計画・状況からの予測', '過去より前の出来事', '現在までの経験', '不変の真理だけ'], 0, '教材では、前からの計画や、状況から判断する近い未来の予測を be going to で表す。', '基本'),
  q('fu-08', '公的なスケジュールなどの確定的な未来に使える形は？', ['現在形', '過去完了形だけ', '現在完了進行形だけ', '過去進行形だけ'], 0, '時刻表・公的な予定などは現在形で表すことがある。', '基本'),
  q('fu-09', '準備が進んでいる近い未来の予定に使える形は？', ['現在進行形', '過去形だけ', '過去完了形だけ', '現在完了だけ'], 0, 'すでに計画・準備が進んでいる予定には現在進行形を使える。', '基本'),
  q('fu-10', '時を表す when / until 節の中で、未来のことは基本的に何形？', ['現在形', 'will + 原形', '過去完了形', '未来完了形'], 0, '時を表す副詞節の中では、未来のことでも現在形を使う。', '基本'),
  q('fu-11', '〈be about to + 原形〉の意味は？', ['まさに〜しようとしている', '〜したことがある', '〜し続けていた', '〜する必要がない'], 0, 'be about to do は差し迫った未来を表す。', '基本'),
  q('fu-12', '〈be thinking of + doing〉の意味は？', ['〜しようと思っている', '〜したことがある', '〜すべきだった', '〜される予定だっただけ'], 0, 'be thinking of doing で「〜しようと思っている」。', '基本'),

  q('fu-13', 'I (　　　) you when I get home.', ['will call', 'called', 'have called yesterday', 'had called tomorrow'], 0, '主節は未来の意志なので will call。when 節の get は現在形。', '使い分け'),
  q('fu-14', 'I will call you when I (　　　) home.', ['will get', 'get', 'got yesterday', 'had got'], 1, '未来のことでも、時を表す when 節の中は現在形 get。', '使い分け'),
  q('fu-15', 'My family (　　　) Paris this December.「前から計画している」', ['is going to visit', 'visited', 'has visited yesterday', 'had visited tomorrow'], 0, '前から計画が進んでいる未来なので be going to が合う。', '使い分け'),
  q('fu-16', 'My father (　　　) for France tomorrow.「準備が進んでいる予定」', ['is leaving', 'left yesterday', 'has left last year', 'had left tomorrow'], 0, '具体的な準備が進んでいる近い未来は現在進行形で表せる。', '使い分け'),
  q('fu-17', 'The concert (　　　) at six.「公的な予定」', ['starts', 'started yesterday', 'has started at six yesterday', 'had started tomorrow'], 0, '確定的なスケジュールは現在形で表せる。', '使い分け'),
  q('fu-18', 'This theater (　　　) Titanic from next week.', ['will be showing', 'had shown tomorrow', 'has shown last week', 'was showing every tomorrow'], 0, '未来進行形で「予定どおりなら〜することになっている」という未来を表す。', '使い分け'),
  q('fu-19', 'Will you (　　　) the work by six?', ['have finished', 'finished yesterday', 'be finish', 'had finishing'], 0, '未来の6時までの完了を見るので will have finished。', '使い分け'),
  q('fu-20', 'I (　　　) give up until my dream comes true.', ["won't", "didn't", "haven't", "hadn't tomorrow"], 0, '未来に対する意志の否定なので won\'t。until 節の comes は現在形。', '使い分け'),
  q('fu-21', 'They (　　　) this problem on Friday morning.', ['will be discussing', 'had discussed tomorrow', 'have discussed yesterday', 'were discuss'], 0, 'すでに確定している未来の予定を未来進行形で表せる。', '使い分け'),
  q('fu-22', '空を見て「まもなく雨が降りそうだ」と状況から予測するなら？', ['It is going to rain soon.', 'It rained tomorrow.', 'It has rained tomorrow.', 'It had rain soon.'], 0, '現在の状況から判断する近い未来の予測は be going to を使える。', '使い分け'),
  q('fu-23', 'The final game (　　　).「まさに始まろうとしている」', ['is about to begin', 'has begun yesterday', 'had begin tomorrow', 'will been beginning'], 0, '差し迫った未来は〈be about to + 原形〉。', '使い分け'),
  q('fu-24', 'This plane (　　　) at Narita Airport at 7 p.m.「到着すると予測されている」', ['is expected to arrive', 'has expected arriving', 'will expected to arrived', 'had expecting arrive'], 0, '「〜すると予測されている」は〈be expected to do〉。', '使い分け'),

  q('fu-25', 'She (　　　) a dog.「犬を飼おうと思っている」', ['is thinking of having', 'is thinking to have', 'has thought having yesterday', 'will thinking of have'], 0, '〈be thinking of doing〉を使うので having。', '応用'),
  q('fu-26', 'will と be going to の違いとして教材の説明に合うのは？', ['will はその場の意志、be going to は前から進んでいる計画を表せる', '両者は常に完全に同じ', 'will は過去専用', 'be going to は経験専用'], 0, '教材では、will の意志と、be going to の前からの計画を対比している。', '応用'),
  q('fu-27', '現在進行形で未来を表しやすい動詞として教材が挙げるものは？', ['come / go / leave / arrive', 'know / resemble だけ', 'have（所有）だけ', 'be だけ'], 0, '往来・発着を表す come, go, leave, arrive などで未来の予定を現在進行形にすることが多い。', '応用'),
  q('fu-28', '「この電車は東京駅に到着します」で、準備が進んでいる近い未来を表すなら？', ['This train is arriving at Tokyo Station.', 'This train arrived tomorrow.', 'This train has arrived tomorrow.', 'This train had arrive soon.'], 0, '近い未来の具体的な予定を現在進行形で表している。', '応用'),
  q('fu-29', '「来週、当然の成り行きとして市長に会うことになっている」に近い形は？', ['will be meeting', 'had met', 'has met yesterday', 'meets last week'], 0, '未来進行形は、予定どおりの成り行きとして起こる未来を表せる。', '応用'),
  q('fu-30', '「6時までに終えているだろう」で by six が示す役割は？', ['未来完了の基準となる未来の時点', '過去完了の基準だけ', '現在の習慣', '経験の回数'], 0, 'by six は「6時までに」という未来の基準時点を示す。', '応用'),
  q('fu-31', '「夢がかなうまで諦めない」の until 節で comes と現在形を使う理由は？', ['時を表す副詞節だから', '過去の話だから', '現在完了だから', '主語が三人称単数だからという理由だけ'], 0, '未来の内容でも、時を表す until 節の中では現在形を使う。', '応用'),
  q('fu-32', '「コンサートは6時に始まる」で現在形を使える理由は？', ['確定的な公的スケジュールだから', '過去の経験だから', '動作が今進行中だから', '過去より前だから'], 0, '公的なスケジュールなどの確定的な未来は現在形で表せる。', '応用'),
  q('fu-33', 'be going to が「予測」を表すのはどんなとき？', ['今の状況・根拠から近い未来を判断するとき', '過去より前だけ', '経験を数えるとき', '不変の真理を言うときだけ'], 0, '教材では「〜しそうだ」と状況から判断した近い未来の予測に be going to を使う。', '応用'),
  q('fu-34', '〈be expected to do〉の中心的な意味は？', ['〜すると予測されている', '〜したことがある', '〜し続けている', '〜するのは初めてだった'], 0, 'be expected to do は「〜すると予測されている」。', '応用'),
  q('fu-35', '〈plan to do〉は教材では何を表す表現として紹介されている？', ['〜する計画だ', '〜したことがある', '〜し終えた', '〜するべきだった'], 0, 'plan to do は「〜する計画だ」と未来の予定を表す。', '応用'),
  q('fu-36', '未来表現を選ぶとき、最も大切な考え方は？', ['未来をどう捉えて伝えたいか', '日本語が「〜する」なら必ず will', '文が長ければ未来完了', '主語が人なら現在進行形'], 0, '英語では未来をどう思い描くかにより、will・be going to・現在進行形・現在形などを使い分ける。', '応用'),
];

const countable: GrammarQuestion[] = [
  q('cu-01', '可算名詞とは？', ['1つ、2つ…と数えられる名詞', '絶対に複数形にならない名詞', '動詞の種類', '未来を表す名詞'], 0, '可算名詞は「1、2…」と数えられる名詞。', '基本'),
  q('cu-02', '不可算名詞とは？', ['そのままでは1つ、2つ…と数えない名詞', '必ず複数形になる名詞', '人名だけ', '過去を表す名詞'], 0, '不可算名詞は、そのままでは数えず、必要なら容器・単位などを使って数える。', '基本'),
  q('cu-03', '不可算名詞は基本的に文法上どう扱う？', ['単数扱い', '必ず複数扱い', '動詞を使わない', '冠詞 the を必ず付ける'], 0, '教材では、不可算名詞は常に単数形として扱うと説明している。', '基本'),
  q('cu-04', 'water「水」は？', ['可算名詞', '不可算名詞', '必ず複数名詞', '固有名詞'], 1, 'water は物質を表す不可算名詞。', '基本'),
  q('cu-05', 'ice「氷」は？', ['可算名詞', '不可算名詞', '人名', '必ず複数形'], 1, 'ice は物質を表す不可算名詞。', '基本'),
  q('cu-06', 'family「家族」は教材ではどう扱う？', ['可算名詞', '不可算名詞', '常に単数しかない', '動詞'], 0, 'family は可算名詞なので families のように複数形にできる。', '基本'),
  q('cu-07', 'woman の複数形は？', ['womans', 'women', 'womanses', 'womanes'], 1, 'woman の複数形は不規則変化で women。', '基本'),
  q('cu-08', 'bread「パン」は？', ['可算名詞', '不可算名詞', '必ず複数形', '固有名詞'], 1, 'bread は物質を表す不可算名詞。', '基本'),
  q('cu-09', 'information「情報」は？', ['可算名詞', '不可算名詞', '複数形 informations が基本', '必ず an を付ける'], 1, 'information は抽象名詞で不可算。an information とはしない。', '基本'),
  q('cu-10', 'advice「アドバイス」は？', ['可算名詞', '不可算名詞', '必ず advices', '動詞だけ'], 1, 'advice は不可算名詞。', '基本'),
  q('cu-11', 'furniture「家具」は？', ['可算名詞', '不可算名詞', '必ず furnitures', '固有名詞'], 1, 'furniture は集合的に家具をまとめて指す不可算名詞。', '基本'),
  q('cu-12', 'homework「宿題」は？', ['可算名詞', '不可算名詞', '必ず homeworks', '人名'], 1, 'homework は不可算名詞。', '基本'),

  q('cu-13', 'Five (　　　) live in this apartment building.', ['family', 'families', 'familys', 'familyes'], 1, 'family は可算名詞。Five があるので複数形 families。', '使い分け'),
  q('cu-14', 'There (　　　) room for improvement.', ['are', 'is', 'were always', 'be'], 1, 'room が「余地」の意味では不可算名詞なので単数扱いで is。', '使い分け'),
  q('cu-15', '「彼の芸術作品はすばらしい」で work は？', ['works と複数にできる', '常に不可算で works は不可', '必ず a work of job', '動詞としてしか使えない'], 0, 'work は「作品」の意味では可算名詞。教材では His works of art ... としている。', '使い分け'),
  q('cu-16', '「仕事」という意味の work は教材では？', ['可算名詞', '不可算名詞', '必ず works', '固有名詞'], 1, 'work は「仕事」の意味では抽象名詞として不可算。意味によって可算・不可算が変わる。', '使い分け'),
  q('cu-17', '「1つのアドバイス」に最も適切なのは？', ['an advice', 'a piece of advice', 'one advices', 'an advise'], 1, 'advice は不可算なので、数えるときは a piece of advice。', '使い分け'),
  q('cu-18', 'Playing video (　　　) is fun.', ['game', 'games', 'gamees', 'a funs'], 1, 'game は可算名詞で、一般に複数のゲームを指すので games。fun は不可算。', '使い分け'),
  q('cu-19', 'All the furniture (　　　) made of wood.', ['are', 'is', 'were be', 'have'], 1, 'furniture も wood も不可算名詞。furniture は単数扱いなので is。', '使い分け'),
  q('cu-20', '「家具を1点」と数えるときに使える表現は？', ['a piece of furniture', 'a furniture', 'one furnitures', 'an furniture'], 0, 'furniture は不可算なので a piece of furniture のように単位表現を使う。', '使い分け'),
  q('cu-21', 'paper が「紙」という物質を表すときは？', ['可算名詞', '不可算名詞', '必ず papers', '動詞だけ'], 1, '「紙」という物質としての paper は不可算名詞。', '使い分け'),
  q('cu-22', '「紙を2枚」に最も適切なのは？', ['two papers only', 'two pieces of paper', 'two paper', 'a two paper'], 1, '不可算名詞 paper は two pieces of paper のように数える。', '使い分け'),
  q('cu-23', 'paper が「新聞」の意味で使われるときは？', ['可算名詞として使える', '必ず不可算', '複数形にできない', '必ず冠詞なし'], 0, 'paper / newspaper が「新聞」の意味なら可算名詞として使える。', '使い分け'),
  q('cu-24', 'chicken が「鶏肉」を表すときは？', ['可算名詞', '不可算名詞', '必ず chickens', '固有名詞'], 1, '「鶏肉」の chicken は不可算。「ニワトリ」の意味では可算。', '使い分け'),

  q('cu-25', 'fish が「魚肉」を表すときは？', ['不可算名詞として使える', '必ず複数形 fishes', '必ず a fish', '動詞だけ'], 0, '「魚肉」の fish は不可算として使う。', '応用'),
  q('cu-26', 'damage「損害」は教材では？', ['可算名詞', '不可算名詞', '必ず damages', '人名'], 1, 'damage は「損害」の意味では不可算名詞。', '応用'),
  q('cu-27', 'food が「食べ物全体」を表すときは？', ['不可算名詞', '必ず複数 foods', '必ず a food', '固有名詞'], 0, '食べ物全体を指す food は不可算名詞。', '応用'),
  q('cu-28', 'garbage「ごみ」は教材では？', ['不可算名詞', '可算名詞で garbages が基本', '必ず an garbage', '動詞'], 0, 'garbage は不可算名詞で、教材では複数形はないと説明している。', '応用'),
  q('cu-29', 'Can you lend me (　　　) money? 肯定の答えを期待している依頼', ['some', 'a', 'an', 'many'], 0, 'money は不可算。教材の例では、肯定の答えを期待する依頼なので some money。', '応用'),
  q('cu-30', '「紅茶を1杯」に最も適切なのは？', ['a tea', 'a cup of tea', 'one teas', 'an tea'], 1, 'tea は不可算なので a cup of tea のように容器を使って数える。', '応用'),
  q('cu-31', 'Butter (　　　) made from milk.', ['are', 'is', 'were always', 'have'], 1, 'butter と milk は不可算名詞で、butter は単数扱いなので is。', '応用'),
  q('cu-32', '「たくさんの宿題」に教材で使える表現は？', ['a lot of homework', 'many homeworks', 'an homework', 'a homework'], 0, 'homework は不可算なので a lot of homework。教材では much homework も挙げている。', '応用'),
  q('cu-33', 'information を使う英文として適切なのは？', ['I found new information online.', 'I found an information online.', 'I found informations online.', 'I found a informations online.'], 0, 'information は不可算なので an や複数形 -s を付けない。', '応用'),
  q('cu-34', 'room の可算・不可算はどう決まる？', ['意味によって変わることがある', '常に可算', '常に不可算', '文の長さで決まる'], 0, '同じ名詞でも意味によって可算・不可算が変わる。教材では room「余地」を不可算として扱う。', '応用'),
  q('cu-35', 'work の可算・不可算について正しいのは？', ['「作品」は可算、「仕事」は不可算になり得る', '常に可算', '常に不可算', '複数形を作れない'], 0, '教材では works of art「作品」と work「仕事」を対比している。', '応用'),
  q('cu-36', '不可算名詞を数えたいときの基本的な考え方は？', ['容器・単位を表す語を使う', '必ず -s を付ける', '必ず an を付ける', '必ず the を付ける'], 0, '不可算名詞は a piece of / a cup of など、容器・単位を表す語を使って数える。', '応用'),
];

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  { id: 'perfect', title: '完了形', questions: perfect },
  { id: 'future', title: '未来表現', questions: future },
  { id: 'countable', title: '可算・不可算', questions: countable },
];

export const GRAMMAR_QUESTION_COUNT = GRAMMAR_CATEGORIES.reduce((sum, category) => sum + category.questions.length, 0);
