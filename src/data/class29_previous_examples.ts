import type { Card, Deck } from './cards';

export const class29RelativeClauseCards: Card[] = [
  {
    id: 171,
    front: "I met a woman (　　) spoke French well.",
    translation: "私はフランス語を上手に話す女性に出会った。",
    comment: "(八幡イオンのスタバで、いきなり流暢なフランス語で電話し始めたマダム。フラペチーノ飲んでた周りの高校生が一斉に「えっ、何者？」ってガン見する瞬間)",
    hint: "先行詞が「人(woman)」で、後ろの文の主語が欠けている（いきなり動詞 spoke が来ている）ので【主格の who】が入る！",
    back: "I met a woman who spoke French well."
  },
  {
    id: 172,
    front: "She was reading a novel (　　) was popular with teenagers.",
    translation: "彼女は10代に人気がある小説を読んでいた。",
    comment: "(朝の読書の時間、クラスの半分くらいが同じボカロ系小説かラノベ読んでる現象。「それ面白いん？」って聞いたら無言で貸してくるやつ)",
    hint: "先行詞が「モノ(novel)」で、後ろが動詞(was)から始まっているから【主格の which】！",
    back: "She was reading a novel which was popular with teenagers."
  },
  {
    id: 173,
    front: "The people (　　) I met in Korea were nice.",
    translation: "私が韓国で出会った人々は親切だった。",
    comment: "(推し活の聖地巡礼でソウルに行き、地下鉄で迷子になった時、カタコトの英語と身振り手振りで助けてくれた現地のおばちゃん。優しさにガチ泣きしそうになる)",
    hint: "後ろの文が「I(S) met(V) 誰を？」と目的語が欠けている。先行詞が人なので【目的格の whom (またはwho)】！",
    back: "The people whom [who] I met in Korea were nice."
  },
  {
    id: 174,
    front: "This is the book (　　) he wrote.",
    translation: "これが彼の書いた本です。",
    comment: "(ブックオフで「これずっと探してたやつ！」って即買いした参考書. 家で開いたら、前の持ち主の謎の落書き（パラパラ漫画）が完成してて集中できない)",
    hint: "後ろが he(S) wrote(V) 目的語なし。先行詞がモノなので【目的格の which】。目的格は省略可能！",
    back: "This is the book (which) he wrote."
  },
  {
    id: 175,
    front: "I met a woman (　　) (　　) is a cartoonist.",
    translation: "私は姉［妹］が漫画家である女性に出会った。",
    comment: "(「うちの姉ちゃん、某有名ジャンプ作品のアシスタントやってるんよ」って聞いた瞬間の、「え！サインもらえる！？」っていう現金すぎる態度の変化)",
    hint: "「彼女の(her)姉」という所有の関係。先行詞と後ろの名詞が「〜の」で繋がる時は、人でもモノでも【所有格の whose】を使う！後ろは無冠詞の名詞(sister)が来るのが目印。",
    back: "I met a woman whose sister is a cartoonist."
  },
  {
    id: 176,
    front: "She was reading a novel (　　) was popular with teenagers.",
    translation: "彼女は10代に人気がある小説を読んでいた。",
    comment: "(TikTokでバズって一瞬で本屋から消えたあの小説。図書室の予約待ちリストがエグいことになってて、自分に回ってくるの来年の春休みになりそう)",
    hint: "who や which の代わりに使える万能選手【that】！",
    back: "She was reading a novel that was popular with teenagers."
  },
  {
    id: 177,
    front: "The people (　　) I met in Korea were nice.",
    translation: "私が韓国で出会った人々は親切だった。",
    comment: "(韓国のライブ会場でソンムル（お土産）交換してくれたファンの子たち。「これ推しのアクスタです！」って神対応されて尊死)",
    hint: "目的格の whom の代わりにも【that】が使える！もちろん省略もOK。",
    back: "The people (that) I met in Korea were nice."
  },
  {
    id: 178,
    front: "This is the CD (　　) I told you (　　).",
    translation: "これが私が君に話したCDです。",
    comment: "(「絶対泣けるから！」って友達にゴリ押しされて貸されたけど、ケース開けたら中身のディスク入ってなかった時の「おい」ってなるやつ)",
    hint: "tell 人 about 〜（〜について話す）。about の目的語が欠けている目的格。",
    back: "This is the CD (which) I told you about."
  },
  {
    id: 179,
    front: "This is the CD (　　) (　　) I told you.",
    translation: "これが私が君に話したCDです。",
    comment: "(上の文のフォーマル版。サブスク全盛期に、どうしても初回限定盤のボーナストラックが聴きたくて小倉のアミュプラザまで探しに行ったあのCD)",
    hint: "後ろに残った前置詞(about)は、関係代名詞の【直前】に移動させることができる！[前置詞 ＋ which/whom] の形。※この時 that は使えないので注意！",
    back: "This is the CD about which I told you."
  },
  {
    id: 180,
    front: "This is the CD (　　) I've been (　　) (　　).",
    translation: "これが私が探していたCDです。",
    comment: "(ジ・アウトレットを歩き回って、ついに見つけたヴィンテージ物のCD。値段見たら想像の3倍して、そっと棚に戻す悲しみ)",
    hint: "look for（〜を探す）という「群動詞（セットで1つの意味になる動詞）」の時は、for だけを前にもっていくことはできない！後ろに残すのがルール。",
    back: "This is the CD (which) I've been looking for."
  },
  {
    id: 181,
    front: "(　　) is needed is change.",
    translation: "必要とされるのは変化だ。",
    comment: "(生徒会選挙の演説で毎回誰かが言うセリフ。「私が校則を変えます！」って言って当選したのに、結局スマホ持ち込み禁止のまま卒業していくあるある)",
    hint: "「〜すること/もの」という意味を持つ関係代名詞 【what】。先行詞 the thing を自分の中に含んでいるため、前に名詞がいらない！",
    back: "What is needed is change."
  },
  {
    id: 182,
    front: "I didn't hear (　　) she said.",
    translation: "私は彼女が言ったことが聞こえなかった。",
    comment: "(枝光駅からのあの狂気の激坂(通称：九国坂)をチャリ押して登ってる時、後ろから話しかけられたけど、息切れと強風で「え？何？」って3回聞き返して気まずくなるやつ)",
    hint: "動詞 hear の目的語になる名詞のカタマリを作る what。she(S) said(V) の後ろに目的語がない不完全な文が続く！",
    back: "I didn't hear what she said."
  },
  {
    id: 183,
    front: "That's (　　) I want to know.",
    translation: "それが私の知りたいことだ。",
    comment: "(テスト返却時、先生が「ここ、半分以上の人が間違えてました」ってドヤ顔で言うから「いや、だから正解は何なん？」ってクラス全員が心の中で突っ込んでる瞬間)",
    hint: "be動詞の補語(C)になる what。これも know の後ろの目的語が欠けている！",
    back: "That's what I want to know."
  },
  {
    id: 184,
    front: "She has two sons (　　) became actors.",
    translation: "彼女には俳優になった息子が2人いる。",
    comment: "(スーパーのレジのパートのおばちゃんが、実は有名なイケメン俳優の母だというジモティの噂。でも「他にも（俳優じゃない）息子がいるかもね」という含みがある文)",
    hint: "カンマなしの【制限用法】。後ろから修飾して「（いっぱいいる息子の中で）俳優になった息子が2人いる」という意味！",
    back: "She has two sons who became actors."
  },
  {
    id: 185,
    front: "She has two sons, (　　) became actors.",
    translation: "彼女には息子が2人いて、（2人とも）俳優になった。",
    comment: "(「うちの息子2人とも東京で役者やってるのよ〜」って、資さんうどんの順番待ちしてる時に急に自慢してくる見知らぬおばあちゃん)",
    hint: "カンマありの【非制限用法】。「息子は（全部で）2人しかいなくて、そしてその2人は〜」と、前から順に情報を追加していく訳し方になる！",
    back: "She has two sons, who became actors."
  },
  {
    id: 186,
    front: "We went to a restaurant (　　) served delicious food.",
    translation: "私たちはおいしい料理を出すレストランに行った。",
    comment: "(テスト終わりのご褒美に、アウトレットの中にあるいつも行列できてるあの店に並ぶ。1時間待った後のハンバーグはマジで神)",
    hint: "カンマなし。世の中に星の数ほどあるレストランの中から「美味しい料理を出す」レストランを特定している！",
    back: "We went to a restaurant which served delicious food."
  },
  {
    id: 187,
    front: "We went to Sailors Restaurant, (　　) served delicious food.",
    translation: "私たちはセイラーズ・レストランに行ったのだが、そこはおいしい料理を出した。",
    comment: "(部活帰りに北九州のソウルフード「資さんうどん(この英文ではセイラーズ)」に寄ったのだが、疲れた体に染み渡る肉ごぼ天うどんと、シメのぼた餅のコンボは最強だった)",
    hint: "カンマありの非制限用法. 先行詞が【固有名詞（すでに世界に1つと特定されているもの）】の時は、必ずカンマを打って補足説明の形にする！",
    back: "We went to Sailors Restaurant, which served delicious food."
  },
  {
    id: 188,
    front: "The hotel (　　) we stayed was wonderful.",
    translation: "私たちが泊まったホテルはすばらしかった。",
    comment: "(修学旅行のホテル。部屋が無駄に広くてテンション上がり、夜中にみんなでカードゲームしてたら見回りの先生にドアぶち破る勢いで怒られるまでがテンプレ)",
    hint: "後ろが we(S) stayed(V) で「完全な文（欠けている名詞がない）」になっているため、場所を表す関係副詞【where】を使う！(in which に書き換え可能)",
    back: "The hotel where we stayed was wonderful."
  },
  {
    id: 189,
    front: "I remember the day (　　) I first met you.",
    translation: "私は初めてあなたに出会った日を覚えている。",
    comment: "(「入学式の時、前の席で消しゴム落としたの拾ってくれたじゃん？」っていう少女漫画みたいな展開。しかし本人は全く覚えてなくて「え、そうだっけ？」で終わる悲劇)",
    hint: "先行詞が時(the day)で、後ろが完全な文なので関係副詞【when】！",
    back: "I remember the day when I first met you."
  },
  {
    id: 190,
    front: "Tell me (the reason) (　　) you were late.",
    translation: "あなたが遅れた理由を言いなさい。",
    comment: "(「いや、九国坂の途中でチャリのチェーン外れまして…」というどうしようもない理由. 先生もあの坂のヤバさを知ってるから「あそこなら仕方ない」ってちょっと同情してくれる)",
    hint: "先行詞が the reason（理由）の時は、関係副詞【why】！ the reason か why のどちらかを省略することが多い。",
    back: "Tell me (the reason) why you were late."
  },
  {
    id: 191,
    front: "(　　) (　　) (　　) the accident happened.",
    translation: "そのようにして事故は起こった。",
    comment: "(昼休み、食堂へのダッシュ競争で滑って転んでカレーをぶちまけた一部始終を、防犯カメラ風の冷徹なトーンで語る目撃者A)",
    hint: "「そのようにして（それが〜した方法だ）」は【That's how 〜】！ the way how という形は絶対に存在しない（並べて使えない）ので注意！",
    back: "That's how the accident happened."
  },
  {
    id: 192,
    front: "We stayed in Paris, (　　) we met Tom.",
    translation: "私たちはパリに滞在し、そこでトムに出会った。",
    comment: "(皿倉山に夜景見に行ったら、そこでまさかの元カノと新しい彼氏に遭遇。「あ…ども…」って気まずすぎて夜景どころじゃない地獄の空気)",
    hint: "場所の固有名詞(Paris)なのでカンマを打つ。「、そしてそこで(and there)」と訳すのがコツ！",
    back: "We stayed in Paris, where we met Tom."
  },
  {
    id: 193,
    front: "In 2008, (　　) I lived in Tokyo, I met Maria.",
    translation: "2008年に私は東京に住んでいたが、その時マリアに出会った。",
    comment: "(「中3の時、同じ塾通ってたよね？」っていう成人式での突然のエンカウント。名前全然出てこないけど「あー！お久しぶり！」って全力で知ってるフリをする)",
    hint: "年号(In 2008)も特定されているのでカンマを打つ。「、そしてその時(and then)」と訳す！",
    back: "In 2008, when I lived in Tokyo, I met Maria."
  },
  {
    id: 194,
    front: "I'll give you (　　) you want.",
    translation: "あなたが欲しいものは何でもあげますよ。",
    comment: "(「え、マジで？じゃあシロヤのサニーパン100個買ってきて！」って無茶振りしたら、本当に紙袋パンパンに練乳まみれのパン買ってくる狂気の親友)",
    hint: "give O1 O2 の O2(名詞のカタマリ)になる。「〜するものは何でも」の【whatever】！ (anything that に書き換え可)",
    back: "I'll give you whatever you want."
  },
  {
    id: 195,
    front: "He is always calm, (　　) happens.",
    translation: "何が起ころうとも、彼はいつも冷静だ。",
    comment: "(授業中にスズメバチが入ってきてクラス中が大パニックになってるのに、一人だけ微動だにせずノートを取り続けるガリ勉の佐藤。メンタル鋼かよ)",
    hint: "カンマで区切られた副詞のカタマリ（譲歩）。「何が〜しようとも」の【whatever】！ (no matter what に書き換え可)",
    back: "He is always calm, whatever happens."
  },
  {
    id: 196,
    front: "I see Lisa (　　) I go to Tokyo.",
    translation: "東京に行く時はいつでも私はリサと会う。",
    comment: "(博多に遊びに行く時はいつでも地下鉄で絶対迷う。「あれ、ここ天神？どっち乗るの？」ってパニックになって毎回同じ友達に救助要請する田舎者)",
    hint: "「〜する時はいつでも」という時を表す【whenever】！ (every time などに書き換え可)",
    back: "I see Lisa whenever I go to Tokyo."
  },
  {
    id: 197,
    front: "(　　) he goes, he always has two bodyguards.",
    translation: "どこへ行こうとも、いつも彼はボディーガードを2人連れている。",
    comment: "(トイレ行く時すら「俺も行く！」って絶対3人組で行動する男子。別にボディーガードじゃないけど、単独行動できない病気なの？)",
    hint: "「どこへ〜しようとも」という場所の譲歩を表す【wherever】！ (no matter where に書き換え可)",
    back: "Wherever he goes, he always has two bodyguards."
  },
  {
    id: 198,
    front: "He never gives up, (　　) (　　) the situation is.",
    translation: "どんなに状況が困難でも、彼は決してあきらめない。",
    comment: "(部活のキツいランニングメニュー。足つりかけて限界なのに「あと1周！！」って叫びながら走るキャプテンの熱血ぶりが完全に松岡修造)",
    hint: "「どんなに〜でも」の【however ＋ 形容詞/副詞 ＋ S ＋ V】！ (no matter how に書き換え可)。後ろにすぐ形容詞(difficult)を引っ張ってくる語順に超注意！",
    back: "He never gives up, however difficult the situation is."
  }
];

export const class29ComparisonCards: Card[] = [
  {
    id: 199,
    front: "She plays tennis (　　) (　　) (　　) her sister (does).",
    translation: "彼女は彼女の姉［妹］と同じくらいテニスが上手だ。",
    comment: "(姉妹揃ってインターハイ常連校のレギュラー。地元の中学では「あの無敵の〇〇姉妹」として語り継がれている伝説の2人)",
    hint: "「同じくらい〜だ」は [as ＋ 原級 ＋ as]。well（上手に）という副詞の原級をそのまま挟む！",
    back: "She plays tennis as well as her sister (does)."
  },
  {
    id: 200,
    front: "She does (　　) play tennis (　　) (　　) (　　) her sister (does).",
    translation: "彼女は彼女の姉［妹］ほどテニスが上手ではない。",
    comment: "(「お姉ちゃんはもっと上手かったのにね」って顧問に無神経な比較をされて、部室の隅でタオル被って泣いてる妹の苦悩。先生それ一番言っちゃダメなやつ)",
    hint: "[not as(so) 〜 as] は「…と同じくらい〜ではない」ではなく「…ほど〜ではない」と訳すのが鉄則！姉には及ばないという意味。",
    back: "She doesn't play tennis as well as her sister (does)."
  },
  {
    id: 201,
    front: "I have (　　) (　　) books (　　) my brother (does).",
    translation: "私は兄［弟］と同じくらいの数の本を持っている。",
    comment: "(九国生の毎日のカバンの重さマジで異常。教科書と参考書でパンパンすぎて、もはや筋トレの領域。枝光駅からあの坂登るの苦行すぎる)",
    hint: "名詞の数を比べる時は [as many ＋ 複数名詞 ＋ as]。books を as の外に出さないように注意！",
    back: "I have as many books as my brother (does)."
  },
  {
    id: 202,
    front: "Russia is (　　) (　　) (　　) (　　) Brazil.",
    translation: "ロシアはブラジルの2倍の大きさだ。",
    comment: "(世界地図見た時の「ロシアのラスボス感」ヤバいよね。ちなみに面積の話だけど、北九州市も政令指定都市の中では結構デカいんよ)",
    hint: "倍数を表す表現は [倍数 ＋ as 〜 as]。twice(2倍) や three times(3倍) は必ず最初の as の【前】に置く！",
    back: "Russia is twice as large as Brazil."
  },
  {
    id: 203,
    front: "My mother drives (　　) (　　) (　　) my father (does).",
    translation: "母は父よりも慎重に運転する。",
    comment: "(お父さんが運転する時、前の車がちょっと遅いとすぐ舌打ちするから助手席のお母さんがガチギレする、休日の3号線あるある)",
    hint: "carefully のように長めの副詞（-lyで終わるものなど）は、er ではなく more を前につけて比較級にする！",
    back: "My mother drives more carefully than my father (does)."
  },
  {
    id: 204,
    front: "Tony is (　　) (　　) (　　) John.",
    translation: "トニーはジョンよりもずっと背が高い。",
    comment: "(入学式の整列で「前へ倣え」した時、一人だけ頭一つ飛び抜けてて後ろのやつが完全に視界を遮られる現象)",
    hint: "比較級を強調する「ずっと、はるかに」は much または far を使う！very taller は絶対NGなので要注意！",
    back: "Tony is much [far] taller than John."
  },
  {
    id: 205,
    front: "She is (　　) (　　) (　　) (　　) her sister.",
    translation: "彼女は妹よりも2歳年上だ。",
    comment: "(「あんたまた私の服勝手に着たでしょ！」っていう姉妹の不毛な争い。2歳差くらいだとサイズ感一緒だから絶対起こる悲劇)",
    hint: "「どれくらい」差があるのかを具体的に言う時は、[数値(two years) ＋ 比較級 ＋ than] の語順！",
    back: "She is two years older than her sister."
  },
  {
    id: 206,
    front: "It's getting (　　) (　　) (　　).",
    translation: "だんだん暑くなってきている。",
    comment: "(八幡の盆地特有の、あのまとわりつくような夏の湿気。教室のクーラーの効きが悪い席になった時の絶望感たるや)",
    hint: "「だんだん〜になる、ますます〜になる」は [比較級 and 比較級]！hotter の t は重ねる！",
    back: "It's getting hotter and hotter."
  },
  {
    id: 207,
    front: "(　　) (　　) you go, (　　) (　　) (　　) the view becomes.",
    translation: "高く上れば上るほど、ますます景色が美しくなる。",
    comment: "(完全に皿倉山のケーブルカーからの景色。カップルだらけの山頂展望台で、男同士で夜景見ながら「俺ら何やってんだろ…」って虚無になる瞬間)",
    hint: "「〜すればするほど、ますます…」は [The 比較級 〜, the 比較級 …] という超重要構文！the を絶対忘れるな！",
    back: "The higher you go, the more beautiful the view becomes."
  },
  {
    id: 208,
    front: "Canada is (　　) (　　) (　　) (　　) in the world.",
    translation: "カナダは世界で2番目に大きな国だ。",
    comment: "(なんでも1番しか覚えられない人間の性。「日本で2番目に高い山は？」って聞かれて誰も答えられないあの現象と同じ)",
    hint: "「○番目に〜だ」は [the ＋ 序数(second/thirdなど) ＋ 最上級]。",
    back: "Canada is the second largest country in the world."
  },
  {
    id: 209,
    front: "He is (　　) (　　) (　　) (　　) (　　) (　　) in the world.",
    translation: "彼は世界でも最も有名な芸術家の1人だ。",
    comment: "(教科書に載ってる偉人の写真に、鉛筆でヒゲとかメガネとか落書きされて原形をとどめていない被害者の一人)",
    hint: "「最も〜な…の一つ(一人)」は [one of the 最上級 ＋ 複数名詞]。最後を artists と複数形にするのを死ぬほど忘れやすいので警戒せよ！",
    back: "He is one of the most famous artists in the world."
  },
  {
    id: 210,
    front: "(　　) (　　) (　　) in the world is (　　) (　　) (　　) Russia.",
    translation: "世界にはロシアほど大きな国はない。",
    comment: "(No.14までの3問は全て「ロシアが世界で一番デカい」ということを言いたいだけの文。同じこと何度も言わされてる感)",
    hint: "[No (other) 単数名詞 〜 as 原級 as A]。「Aと同じくらい〜な名詞は他に一つもない」＝「Aが一番」という論理！",
    back: "No (other) country in the world is as large as Russia."
  },
  {
    id: 211,
    front: "(　　) (　　) (　　) in the world is (　　) (　　) Russia.",
    translation: "世界にはロシアよりも大きい国はない。",
    comment: "(マトリョーシカ開けても開けても同じ顔が出てくる時の謎の恐怖と似た、ロシアの底知れなさ)",
    hint: "[No (other) 単数名詞 〜 比較級 than A]。「Aよりも〜な名詞は他に一つもない」＝「Aが一番」！",
    back: "No (other) country in the world is larger than Russia."
  },
  {
    id: 212,
    front: "Russia is (　　) (　　) (　　) (　　) (　　) in the world.",
    translation: "ロシアは世界のほかのどの国よりも大きい。",
    comment: "(比較級の書き換えテストで100%出題される、いわゆる「ラスボス問題」。これ書けたらドヤ顔していい)",
    hint: "[比較級 than any other 単数名詞]。「他のいかなる名詞よりも〜だ」。any の後ろなのに country(単数形)になるのが最大の落とし穴！",
    back: "Russia is larger than any other country in the world."
  }
];

export const class29SubjunctiveCards: Card[] = [
  {
    id: 213,
    front: "(　　) I (　　) free, I (　　) (　　) with you.",
    translation: "暇があれば、君と一緒に行けるのに。",
    comment: "(放課後、友達がジ・アウトレット北九州に遊びに行くのを見送りながら、自分は課外授業と塾のハシゴへ向かう悲しき九国生の背中)",
    hint: "今の事実とは違う妄想【仮定法過去】。今の話だけど動詞は「過去形」にする！be動詞は主語に関わらず were を使うのがルール。",
    back: "If I were free, I could go with you."
  },
  {
    id: 214,
    front: "(　　) I (　　) his phone number, I (　　) (　　) him.",
    translation: "彼の電話番号を知っていれば、彼に電話するのに。",
    comment: "(好きな人の連絡先、LINEすら知らなくてインスタの裏垢からこっそりストーリー眺めることしかできない奥手女子の嘆き)",
    hint: "これも【仮定法過去】。If節の中は過去形(knew)、主節は [助動詞の過去形(would/could) ＋ 原形]！",
    back: "If I knew his phone number, I would call him."
  },
  {
    id: 215,
    front: "(　　) I (　　) (　　) free, I (　　) (　　) (　　) with you.",
    translation: "暇があったなら、君と一緒に行けたのに。",
    comment: "(昨日、本当は家でゴロゴロYouTube見てただけなんだけど、誘いを断った罪悪感から「ごめん昨日マジで忙しくてさ〜」と嘘つくやつ)",
    hint: "過去の事実とは違う後悔【仮定法過去完了】。If節の中は [had ＋ 過去分詞]、主節は [助動詞の過去形 ＋ have ＋ 過去分詞]！",
    back: "If I had been free, I could have gone with you."
  },
  {
    id: 216,
    front: "(　　) I (　　) (　　) his phone number, I (　　) (　　) (　　) him.",
    translation: "彼の電話番号を知っていたなら、彼に電話したのに。",
    comment: "(財布拾ってあげたイケメン、お礼言われてそのままバイバイしちゃった。「あの時連絡先聞いとけば…！」と夜のベッドでジタバタするやつ)",
    hint: "これも【仮定法過去完了】。時制を一つ昔にズラすのが仮定法の掟！",
    back: "If I had known his phone number, I would have called him."
  },
  {
    id: 217,
    front: "(　　) he (　　) (　　) the team, he (　　) (　　) a star now.",
    translation: "そのチームに入っていたなら、今ごろ彼はスターになっているだろうに。",
    comment: "(中学の時オレの方がサッカー上手かったのに、あいつ強豪校行って今や国立のピッチ立ってんの…という、テレビ見ながらの苦いビール)",
    hint: "混合型！前半は過去の後悔(If he had joined)、でも後半は【今(now)】のことだから [would ＋ 原形] にする！これテストの超ひっかけ！",
    back: "If he had joined the team, he would be a star now."
  },
  {
    id: 218,
    front: "(　　) you (　　) (　　) (　　) a book, what (　　) it (　　) about?",
    translation: "仮にあなたが本を書くとしたら、何についての本ですか。",
    comment: "(絶対書くわけないけど、深夜テンションで「オレの波乱万丈な人生、映画化できるっしょ」とか語り出す痛いヤンキー)",
    hint: "あり得ない未来の妄想は [If S ＋ were to 原形]。可能性がほぼゼロのこと！",
    back: "If you were to write a book, what would it be about?"
  },
  {
    id: 219,
    front: "(　　) he (　　) (　　) his mind, he (　　) (　　) us know.",
    translation: "万一、気が変われば、彼は私たちに知らせるだろう。",
    comment: "(「絶対行かない」ってヘソ曲げてる頑固オヤジ。でも一応席は一つ空けておいてあげる家族の優しさ)",
    hint: "万が一の未来の仮定は [If S ＋ should 原形]。were to よりは少しだけ起こる可能性がある。",
    back: "If he should change his mind, he would let us know."
  },
  {
    id: 220,
    front: "I (　　) I (　　) his phone number.",
    translation: "彼の電話番号を知っていればなあ。",
    comment: "(席替えで隣になったのに、一言も喋れないまま学期末を迎えようとしている。神様、プリント回す時だけじゃなくて連絡先ください)",
    hint: "今の叶わぬ願望は [I wish ＋ S ＋ 過去形]。「〜であればいいのに」",
    back: "I wish I knew his phone number."
  },
  {
    id: 221,
    front: "I (　　) I (　　) (　　) more.",
    translation: "もっと勉強していたらなあ。",
    comment: "(定期テスト返却日。赤点スレスレの答案用紙を素早く裏返し、天井を見上げながら呟く全高校生共通のセリフ)",
    hint: "過去への後悔は [I wish ＋ S ＋ had ＋ 過去分詞]。「〜しておけばよかったなあ」",
    back: "I wish I had studied more."
  },
  {
    id: 222,
    front: "He treats me (　　) (　　) I (　　) a little child.",
    translation: "彼はまるで私を幼い子どものように扱う。",
    comment: "(高3にもなって、親戚のおじちゃんに「ほーら、お年玉だよ！ジュース買いな！」って頭撫でられる羞恥心)",
    hint: "「まるで〜であるかのように」は [as if ＋ 仮定法過去]！今の事実と違うので、be動詞は were！",
    back: "He treats me as if I were a little child."
  },
  {
    id: 223,
    front: "I feel (　　) (　　) I (　　) (　　) a horrible nightmare.",
    translation: "私はまるで恐ろしい悪夢でも見たかのような気分だ。",
    comment: "(数学のテスト中、裏面があることに残り5分で気づいた時のあの血の気が引く感覚。あれは夢だと言ってくれ)",
    hint: "前に起きた出来事の例えは [as if ＋ 仮定法過去完了(had ＋ 過去分詞)]！",
    back: "I feel as if I had had a horrible nightmare."
  },
  {
    id: 224,
    front: "(　　) your help, I (　　) not (　　) able to do this job.",
    translation: "あなたの助けがなければ、私はこの仕事ができないだろう。",
    comment: "(文化祭の前日、ベニヤ板とペンキまみれになりながら一人で準備してる実行委員長を、最後まで手伝ってくれた親友へのマジ感謝)",
    hint: "If it were not for 〜 の1語バージョン。【Without 〜】で「もし〜がなければ（今の妄想）」を表せる！",
    back: "Without your help, I would not be able to do this job."
  },
  {
    id: 225,
    front: "(　　) a little more money, I (　　) (　　) another coat.",
    translation: "もう少しお金があれば、コートをもう1着買えるのに。",
    comment: "(財布の中身と値札を何度も往復して見つめる冬のバーゲン。アミュプラザのショーウィンドウの前で5分フリーズ)",
    hint: "Without の逆。【With 〜】で「もし〜があれば」という条件を表せる！後ろに would/could があるのが仮定法の目印。",
    back: "With a little more money, I could buy another coat."
  },
  {
    id: 226,
    front: "(　　) (　　) I (　　) rich!",
    translation: "私がお金持ちでありさえすればなあ！",
    comment: "(推しのライブのVIP席の値段（数万円）を見て、静かにスマホの画面を閉じた時の心の叫び。石油王と結婚したい)",
    hint: "I wish の強調バージョン。【If only ＋ 仮定法】で「〜でありさえすればなあ！」。感嘆符(!)と相性良し。",
    back: "If only I were rich!"
  },
  {
    id: 227,
    front: "(　　) (　　) (　　) (　　) you (　　) to bed.",
    translation: "もう（そろそろ）寝る時間だよ。",
    comment: "(深夜1時、資さんうどんで「ごぼ天うどん」と「ぼた餅」の凶悪コンボをキメてる高校生に、店員さんが心の中で思ってること)",
    hint: "「もう〜してもよい時間だ」は [It is (about) time ＋ S ＋ 過去形]。過去形(went)にするのが超重要！",
    back: "It's (about) time you went to bed."
  },
  {
    id: 228,
    front: "We know Jim very well; (　　) we (　　) not (　　) him.",
    translation: "私たちはジムのことをとてもよく知っている。そうでなければ彼を信用したりしないだろう。",
    comment: "(「あいついっつもお調子者だけど、本当は誰よりも友達想いなんだぜ」っていう、少年マンガの相棒ポジションのやつが言うセリフ)",
    hint: "【otherwise】（そうでなければ）。この1語の中に「もしよく知っていなかったら」というIf節の意味がまるっと込められている！",
    back: "We know Jim very well; otherwise we would not trust him."
  }
];

// 2-9の前回暗唱範囲。旧データのIDを維持し、端末に残る学習履歴も引き継ぐ。
export const class29PreviousDecks: Deck[] = [
  {
    id: 'class29-previous-relative',
    title: '関係詞',
    description: '前回の暗唱例文 Test 8・28文',
    cards: class29RelativeClauseCards,
  },
  {
    id: 'class29-previous-comparison',
    title: '比較',
    description: '前回の暗唱例文 Test 9・14文',
    cards: class29ComparisonCards,
  },
  {
    id: 'class29-previous-subjunctive',
    title: '仮定法',
    description: '前回の暗唱例文 Test 10・16文',
    cards: class29SubjunctiveCards,
  },
];

export const class29PreviousAllDeck: Deck = {
  id: 'class29-previous-all',
  title: '2-9 前回範囲まとめ',
  description: '比較・関係詞・仮定法／全58文',
  cards: [
    ...class29RelativeClauseCards,
    ...class29ComparisonCards,
    ...class29SubjunctiveCards,
  ],
};

