export interface Card {
  id: number;
  front: string;
  translation: string;
  comment: string;
  hint: string;
  back: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}

const test1Cards: Card[] = [
  {
    id: 1,
    front: "“(　　) (　　) the hero?” “Mike (　　).”",
    translation: "「誰が主役を演じるのですか。」「マイクです。」",
    comment: "(どうせマイクは目立ちたがり屋のイケメン)",
    hint: "疑問詞「Who（誰が）」が主語の時は、直後にそのまま「動詞（単数扱い）」を置く！Mikeの後ろは、前の動詞の代わりをする省エネの「does」。",
    back: "“Who plays the hero?” “Mike does.”"
  },
  {
    id: 2,
    front: "“You are a student, (　　) (　　)?”",
    translation: "「あなたは学生ですよね。」",
    comment: "(夜のゲーセンで補導員に声かけられた時の絶望)",
    hint: "前が「肯定文（are）」なら、後ろは「否定の疑問（aren't you?）」にする！シーソーの法則。",
    back: "“You are a student, aren't you?”"
  },
  {
    id: 3,
    front: "“You don't like cheese, (　　) (　　)?”",
    translation: "「あなたはチーズが好きではないですよね。」",
    comment: "(Yesが「いいえ」になる日本人泣かせの引っかけ)",
    hint: "前が「否定（don't）」なら後ろは「肯定（do you?）」。答える時は前の否定に釣られず「チーズが好きなら Yes, I do.」！",
    back: "“You don't like cheese, do you?”"
  },
  {
    id: 4,
    front: "(　　) careful.",
    translation: "注意しなさい。",
    comment: "(先生に怒られる直前のやつ)",
    hint: "careful は「形容詞」。命令文は絶対に「動詞の原形」から始めるので、be動詞の原形「Be」を置く！",
    back: "Be careful."
  },
  {
    id: 5,
    front: "(　　) here.",
    translation: "ここに来なさい。",
    comment: "(体育教官室に呼ばれるやつ)",
    hint: "これも命令文。「来る（come）」の原形からド直球で始める。",
    back: "Come here."
  },
  {
    id: 6,
    front: "(　　) (　　) late.",
    translation: "遅れてはいけません。",
    comment: "(修学旅行で先生が100回言うセリフ)",
    hint: "「〜するな」は [Don't ＋ 動詞の原形]。lateは形容詞なので、[Don't be 〜] の形になる！",
    back: "Don't be late."
  },
  {
    id: 7,
    front: "(　　) (　　) the paintings.",
    translation: "絵に触れてはいけません。",
    comment: "(美術館での絶対ルール)",
    hint: "こちらも「〜するな」。触る（touch）は一般動詞なので、そのまま [Don't touch]！",
    back: "Don't touch the paintings."
  },
  {
    id: 8,
    front: "(　　) (　　) shopping.",
    translation: "買い物に行きましょう。",
    comment: "(テスト最終日の放課後テンション)",
    hint: "「〜しましょう」は [Let's ＋ 動詞の原形]。「買い物に行く」は [go 〜ing] のセット！",
    back: "Let's go shopping."
  },
  {
    id: 9,
    front: "(　　) (　　) this house is!",
    translation: "この家はなんて美しいんだろう！",
    comment: "(友達の家が豪邸すぎて格差に震える)",
    hint: "【How ＋ 形容詞/副詞 ＋ S V !】の形。Howの後ろは「beautiful」がすぐくっつく！",
    back: "How beautiful this house is!"
  },
  {
    id: 10,
    front: "(　　) (　　) (　　) (　　) this is!",
    translation: "これはなんて美しい家だろう！",
    comment: "(とにかく金持ち。上の文と同じ意味)",
    hint: "【What ＋ a/an ＋ 形容詞 ＋ 名詞 ＋ S V !】の形。Whatの時は「a beautiful house」の塊ごと前に出す！",
    back: "What a beautiful house this is!"
  },
  {
    id: 11,
    front: "(　　) (　　) a student.",
    translation: "私は学生です。",
    comment: "(知ってる。英語の例文の一発目は絶対コレ)",
    hint: "主語(S)と動詞(V)が1セットだけの文を「単文」と呼ぶ。「a」を忘れるな！",
    back: "I am a student."
  },
  {
    id: 12,
    front: "(　　) (　　) swimming.",
    translation: "あなたは泳ぐことが好きです。",
    comment: "(勝手に決めつけんな。顔つけるのも嫌だわ)",
    hint: "動詞(swim)にingをつけると「〜すること」という名詞に変身する！",
    back: "You like swimming."
  },
  {
    id: 13,
    front: "(　　) (　　) shopping, and (　　) (　　) new shoes.",
    translation: "私たちは買い物に行き、私は新しい靴を買いました。",
    comment: "(そして今月のお小遣いが完全に消滅)",
    hint: "対等な2つの文を「and（そして）」で繋いだ文を「重文」と呼ぶ。went と bought（過去形）を合わせる！",
    back: "We went shopping, and I bought new shoes."
  },
  {
    id: 14,
    front: "(　　) (　　) young, but (　　) (　　) over 40.",
    translation: "彼は若く見えるが、40歳を超えている。",
    comment: "(奇跡のアラフォー。美容代いくらかけてるの？)",
    hint: "[look ＋ 形容詞] で「〜に『見える』」。これも「but（しかし）」で繋いだ重文。",
    back: "He looks young, but he is over 40."
  },
  {
    id: 15,
    front: "(　　) (　　) sick, so (　　) (　　) home early.",
    translation: "私は体調が悪かったので、早く家に帰りました。",
    comment: "(仮病じゃないってば。保健室の先生信じて)",
    hint: "「so（だから）」で繋いだ重文。言い訳する時に超使える接続詞。",
    back: "I was sick, so I went home early."
  },
  {
    id: 16,
    front: "She says (that) (　　) (　　) new shoes.",
    translation: "彼女は新しい靴が欲しいと言っています。",
    comment: "(彼氏への「買って♡」という遠回しなおねだり)",
    hint: "文の中に「もう一つの文（S V）」が組み込まれているのを「複文」と呼ぶ。thatは省略OK！",
    back: "She says (that) she wants new shoes."
  },
  {
    id: 17,
    front: "I don't know if [whether] (　　) (　　) (　　).",
    translation: "トムが来るかどうかはわかりません。",
    comment: "(あいつ絶対ドタキャンするから期待しないで待つ)",
    hint: "ここでの if [whether] は「もし〜」ではなく、「〜かどうか」という意味になる！",
    back: "I don't know if [whether] Tom will come."
  },
  {
    id: 18,
    front: "She won't come if (　　) (　　) a fever.",
    translation: "もし熱があったら、彼女は来ない。",
    comment: "(そりゃそうだ。熱あったら絶対来るな)",
    hint: "こっちの if は「もし〜（条件）」。条件のifの中は、未来のことでも「現在形（has）」にする絶対ルール！",
    back: "She won't come if she has a fever."
  },
  {
    id: 19,
    front: "Kate (　　) in New York.",
    translation: "ケイトはニューヨークに住んでいる。",
    comment: "(毎日ハンバーガー食べてる図しか浮かばん)",
    hint: "[S ＋ V] だけで完結する第1文型。in New York はおまけ(M)なので要素に数えない！",
    back: "Kate lives in New York."
  },
  {
    id: 20,
    front: "He (　　) famous.",
    translation: "彼は有名だ。",
    comment: "(TikTokフォロワー100万人超えのインフルエンサー)",
    hint: "[S ＋ V ＋ C] の第2文型。He ＝ famous（イコール関係）が成り立つ！",
    back: "He is famous."
  },
  {
    id: 21,
    front: "He (　　) a doctor.",
    translation: "彼は医者になった。",
    comment: "(同窓会で一番チヤホヤされるやつ)",
    hint: "これも [He ＝ doctor] だから第2文型。「なった(became)」の過去形を忘れずに。",
    back: "He became a doctor."
  },
  {
    id: 22,
    front: "He (　　) a new watch yesterday.",
    translation: "彼は昨日、新しい腕時計を買った。",
    comment: "(絶対Apple Watch。授業中にLINE見る気満々)",
    hint: "[S ＋ V ＋ O] の第3文型。yesterdayはおまけ(M)なので要素に入れない！",
    back: "He bought a new watch yesterday."
  },
  {
    id: 23,
    front: "He (　　) Sally a ring.",
    translation: "彼はサリーに指輪をあげた。",
    comment: "(ヒューヒュー！ついにプロポーズか！？)",
    hint: "[S ＋ V ＋ O ＋ O] の第4文型。「誰に(人)」「何を(モノ)」の順番にただ並べるだけ！",
    back: "He gave Sally a ring."
  },
  {
    id: 24,
    front: "He (　　) Sally a ring.",
    translation: "彼はサリーに指輪を買ってあげた。",
    comment: "(わざわざ買った(課金した)感が強い)",
    hint: "buyの過去形はbought。これもgiveと同じく「人」→「モノ」の順（第4文型）！",
    back: "He bought Sally a ring."
  },
  {
    id: 25,
    front: "We (　　) our dog Elmo.",
    translation: "私たちは我が家の犬をエルモと呼ぶ。",
    comment: "(あの赤いモジャモジャのキャラに似てるのかな)",
    hint: "[S ＋ V ＋ O ＋ C] の第5文型。「our dog ＝ Elmo」にする、という意味！",
    back: "We call our dog Elmo."
  },
  {
    id: 26,
    front: "She (　　) the wall brown.",
    translation: "彼女は壁を茶色に塗った。",
    comment: "(DIY女子。賃貸なら退去時の敷金ヤバそう)",
    hint: "これも第5文型。「the wall ＝ brown」の状態にした、ということ！",
    back: "She painted the wall brown."
  },
  {
    id: 27,
    front: "(　　) (　　) a tree in the yard.",
    translation: "庭に一本の木がある。",
    comment: "(夏はセミが大量発生して地獄だぞ)",
    hint: "「There is / are 〜」の文。主語は後ろの「a tree（単数）」なので、動詞は「is」！",
    back: "There is a tree in the yard."
  },
  {
    id: 28,
    front: "(　　) (　　) three boys in the park.",
    translation: "公園に3人の少年がいる。",
    comment: "(だいたいSwitch持ち寄ってスマブラやってる)",
    hint: "こちらは主語が「three boys（複数）」なので、動詞は「are」になる！",
    back: "There are three boys in the park."
  },
  {
    id: 29,
    front: "We (　　) the matter.",
    translation: "我々はその問題について議論した。",
    comment: "(「今日の昼メシ何にするか」という重大な問題)",
    hint: "「〜について議論する(discuss)」は、後ろに「about」をつけたくなる罠単語！絶対につけない！",
    back: "We discussed the matter."
  },
  {
    id: 30,
    front: "He (　　) (　　) in bed now.",
    translation: "彼は今、ベッドに横になっている。",
    comment: "(スマホいじって今日一日絶対起きないやつ)",
    hint: "「横たわる(lie)」のing形は【lying】。形が変わりすぎて誰だか分からなくなるので注意！",
    back: "He is lying in bed now."
  },
  {
    id: 31,
    front: "I can't (　　) this weather.",
    translation: "この天気には我慢できない。",
    comment: "(日本の真夏の湿度のこと。マジで溶ける)",
    hint: "「stand」で「我慢する・耐える」の意味がある。「立ちっぱなしで耐える」イメージで覚えろ！",
    back: "I can't stand this weather."
  }
];

const test2Cards: Card[] = [
  {
    id: 32,
    front: "I (　　) you.",
    translation: "私はあなたを愛しています。",
    comment: "(英語の例文、いきなり愛の告白しがち。しかも激重)",
    hint: "現在形は「昔も今もこれからもずっと変わらない状態」を表す！",
    back: "I love you."
  },
  {
    id: 33,
    front: "I (　　) (　　) bread for breakfast.",
    translation: "私はたいてい朝食にパンを食べる。",
    comment: "(完全パン派。なんなら寝坊して何も食べない日もある)",
    hint: "「日々の習慣」は現在形。usually(たいてい)などの頻度を表す言葉がキーワード！",
    back: "I usually eat bread for breakfast."
  },
  {
    id: 34,
    front: "The sun (　　) in the east.",
    translation: "太陽は東から昇る。",
    comment: "(当たり前ポエムかよ。「知ってるわ！」ってツッコんでいい)",
    hint: "過去も未来も変わらない「不変の真理」は絶対に現在形にする掟！",
    back: "The sun rises in the east."
  },
  {
    id: 35,
    front: "She (　　) (　　) tennis (　　).",
    translation: "彼女は今、テニスをしている。",
    comment: "(今まさにラケットを振りかぶってるその一瞬を激写した感じ)",
    hint: "「今まさに〜している最中」は進行形 [be動詞 ＋ ing]。now が最大の目印！",
    back: "She is playing tennis now."
  },
  {
    id: 36,
    front: "She (　　) (　　) tennis (　　) (　　).",
    translation: "彼女は最近、テニスをしている。",
    comment: "(テニス部入ったばっかなのかな。そのうち日焼け気にして辞めそう)",
    hint: "「最近（一時的に）マイブームで〜している」という場合も進行形を使う！",
    back: "She is playing tennis these days."
  },
  {
    id: 37,
    front: "I (　　) him.",
    translation: "私は彼を愛していた。",
    comment: "(急に失恋の匂い。ポエムの冒頭みたいな哀愁が漂ってる)",
    hint: "過去形は「今はもう違う」という事実を表す。今はもう愛していないということ。",
    back: "I loved him."
  },
  {
    id: 38,
    front: "He (　　) baseball (　　) (　　).",
    translation: "彼は先週、野球をした。",
    comment: "(先週野球やったのに、今週はもう飽きて別のことしてそう)",
    hint: "last week, yesterday などの「明らかな過去の言葉」が来たら絶対過去形！",
    back: "He played baseball last week."
  },
  {
    id: 39,
    front: "He (　　) (　　) soccer after school.",
    translation: "彼はたいてい放課後にサッカーをした。",
    comment: "(今はもう引退して、放課後はコンビニ前でたむろしてるんだろうな)",
    hint: "usually があっても、過去の話なら過去形（played）にする！",
    back: "He usually played soccer after school."
  },
  {
    id: 40,
    front: "She (　　) (　　) tennis (　　) (　　) p.m.",
    translation: "彼女は午後4時ごろテニスをしていた。",
    comment: "(刑事ドラマの「昨日の午後4時、何してましたか？」に対するアリバイ証言)",
    hint: "過去のある時点で「〜している最中だった」は過去進行形 [was/were ＋ ing]！",
    back: "She was playing tennis around 4 p.m."
  },
  {
    id: 41,
    front: "I (　　) (　　) seventeen (　　) (　　).",
    translation: "私は来月17歳になる。",
    comment: "(ついに華のセブンティーン！でも心は中2から成長してない)",
    hint: "年齢や時間など「自然にやってくる未来」は will を使う。原形の「be」を忘れるな！",
    back: "I will be seventeen next month."
  },
  {
    id: 42,
    front: "I (　　) (　　) you (　　).",
    translation: "私は今夜、あなたに電話します。",
    comment: "(「あとで絶対LINE通話するわ！」っていうその場のノリの約束)",
    hint: "その場で決めた「〜するぞ！」という意思（意志未来）も will を使う！",
    back: "I will call you tonight."
  },
  {
    id: 43,
    front: "I (　　) (　　) (　　) go shopping (　　).",
    translation: "私は明日、買い物に行く予定です。",
    comment: "(明日絶対服買いに行くぞって、前からウキウキで計画してたやつ)",
    hint: "「前から決めていた予定」は [be going to ＋ 原形] を使う！",
    back: "I am going to go shopping tomorrow."
  },
  {
    id: 44,
    front: "Look at the sky. It (　　) (　　) (　　) rain.",
    translation: "空を見て。雨が降りそうだ。",
    comment: "(ヤバい、めっちゃ黒い雲見えてる！急いでチャリ漕いで帰らなきゃ！)",
    hint: "今の状況から見て「絶対そうなる！」という予測は will ではなく be going to を使う！",
    back: "Look at the sky. It is going to rain."
  },
  {
    id: 45,
    front: "The plane (　　) for New York (　　) (　　).",
    translation: "その飛行機は12時30分にニューヨークに向けて出発する。",
    comment: "(ニューヨーク行くとかどこのセレブ？お土産よろしく)",
    hint: "未来のことでも、交通機関などの「確定している時刻表」は現在形で表せる！",
    back: "The plane leaves for New York at 12:30."
  },
  {
    id: 46,
    front: "I (　　) (　　) for Los Angeles (　　).",
    translation: "私は明日、ロサンゼルスに向けて出発する。",
    comment: "(こっちはLAかよ。すでにパッキング終わってパスポート握りしめてる状態ね)",
    hint: "個人的な「準備・手配済みの近い未来の予定」は現在進行形（ing）で表すことがある！",
    back: "I am leaving for Los Angeles tomorrow."
  },
  {
    id: 47,
    front: "I (　　) (　　) (　　) the news.",
    translation: "私はちょうどその知らせを聞いたところだ。",
    comment: "(「えっマジで！？ウソでしょ！？」って顔でスマホの画面二度見してる)",
    hint: "【完了（ちょうど〜した）】は [have/has ＋ just ＋ 過去分詞]！",
    back: "I have just heard the news."
  },
  {
    id: 48,
    front: "I (　　) (　　) my cell phone.",
    translation: "私は携帯電話をなくしてしまった（今もない）。",
    comment: "(絶望。ポケットにない、カバンにもない、マジでどこいったの…)",
    hint: "【結果（〜してしまって今は…だ）】。完了形は「過去の出来事の影響が今に残っている」ことを表す！",
    back: "I have lost my cell phone."
  },
  {
    id: 49,
    front: "I (　　) (　　) Judy's brother (　　).",
    translation: "私はジュディーのお兄さんに2度会ったことがある。",
    comment: "(ジュディーの兄貴ね。あのちょっとイカつい人でしょ？顔は知ってるよ)",
    hint: "【経験（〜したことがある）】。twice や before が一緒に使われることが多い！",
    back: "I have met Judy's brother twice."
  },
  {
    id: 50,
    front: "She (　　) (　　) in Paris (　　) (　　) (　　).",
    translation: "彼女はパリに3年間住んでいる。",
    comment: "(「あ〜、パリのパン屋のクロワッサンが恋しい〜」とか言い出す帰国子女マウント)",
    hint: "【状態の継続（ずっと〜している）】。for（〜の間）や since（〜から）が目印！",
    back: "She has lived in Paris for three years."
  },
  {
    id: 51,
    front: "He (　　) (　　) (　　) TV (　　) (　　) (　　).",
    translation: "彼は今朝からずっとテレビを見続けている。",
    comment: "(親が「いつまでテレビ見てるの！」ってガチギレする5秒前)",
    hint: "【動作の継続】。「動作」がずっと続いている場合は進行形にして [have been 〜ing] にする！",
    back: "He has been watching TV since this morning."
  },
  {
    id: 52,
    front: "I (　　) (　　) him (　　).",
    translation: "私は最近彼に会っていない。",
    comment: "(あいつ最近全然学校来てなくない？部活もサボってるし)",
    hint: "lately や recently（最近）は、過去形ではなく現在完了形と一緒に使うキーワード！",
    back: "I haven't seen him lately."
  },
  {
    id: 53,
    front: "I (　　) a letter from him (　　) (　　) (　　).",
    translation: "私は6か月前に彼から手紙をもらった。",
    comment: "(今どき手紙ってエモいな。LINEじゃダメだったのか)",
    hint: "ago や yesterday のような「明確な過去の言葉」は絶対に過去形！完了形は使えない！",
    back: "I received a letter from him six months ago."
  },
  {
    id: 54,
    front: "The party (　　) (　　) (　　) when (　　) (　　).",
    translation: "私たちが到着した時、パーティーはすでに始まっていた。",
    comment: "(ドア開けたらもうみんな乾杯して盛り上がってた。最悪のタイミングでの遅刻)",
    hint: "過去のある時よりも「さらに前の出来事（大過去）」は過去完了 [had ＋ 過去分詞]！",
    back: "The party had already started when we arrived."
  },
  {
    id: 55,
    front: "I (　　) (　　) (　　) an opera until (　　) (　　) (　　).",
    translation: "私はイタリアを訪れるまで、オペラを見たことがありませんでした。",
    comment: "(日本に住んでてオペラ見る機会なんて、音楽の授業のビデオくらいでしょ)",
    hint: "過去のある時までの【経験】も過去完了 [had ＋ 過去分詞] 。never の位置に注意！",
    back: "I had never seen an opera until I visited Italy."
  },
  {
    id: 56,
    front: "She (　　) (　　) in Paris for three years before (　　) (　　) (　　) (　　).",
    translation: "彼女は日本に来る前に、パリに3年間住んでいた。",
    comment: "(このプリントの登場人物、パリに住みがち問題)",
    hint: "過去のある時までの【継続】。日本に来た（過去）より前の話だから過去完了（had）になる！",
    back: "She had lived in Paris for three years before she came to Japan."
  },
  {
    id: 57,
    front: "We (　　) (　　) (　　) soccer for an hour when (　　) (　　) (　　) (　　).",
    translation: "雨が降り出した時には、私たちは1時間（ずっと）サッカーをしていた。",
    comment: "(グラウンドどろどろ。ちょうどいい汗かいてきたところだったのに最悪)",
    hint: "過去のある時までずっと続いていた【動作】は過去完了進行形 [had been 〜ing]！",
    back: "We had been playing soccer for an hour when it started to rain."
  },
  {
    id: 58,
    front: "I (　　) that Fred (　　) (　　) to Canada.",
    translation: "フレッドはカナダに帰ったと聞きました。",
    comment: "(え、フレッドもう帰っちゃったの？お別れ会とかやってないんだけど！)",
    hint: "heard（聞いた）よりも returned（帰った）の方が古い話なので大過去（had）にする！",
    back: "I heard that Fred had returned to Canada."
  },
  {
    id: 59,
    front: "The party (　　) (　　) (　　) by the time (　　) (　　).",
    translation: "私たちが着くまでに、パーティーは始まっているだろう。",
    comment: "(「まだ電車乗ったとこ。絶対乾杯間に合わないわ」ってLINEしてる状況)",
    hint: "未来のある時までの【完了】は未来完了 [will have ＋ 過去分詞]！ by the time の後ろは現在形(arrive)！",
    back: "The party will have started by the time we arrive."
  },
  {
    id: 60,
    front: "I (　　) (　　) (　　) the movie three times if (　　) (　　) (　　) (　　).",
    translation: "その映画をもう一度見れば、私はそれを3回見たことになる。",
    comment: "(どんだけ好きなの？セリフ全部暗記してそう. 入場特典目当てだな？)",
    hint: "未来のある時までの【経験】。if の中が未来のことでも現在形(see)になるルールに注意！",
    back: "I'll have seen the movie three times if I see it again."
  },
  {
    id: 61,
    front: "They (　　) (　　) (　　) married for 20 years (　　) (　　).",
    translation: "彼らは来年で結婚して20年になる。",
    comment: "(20年も夫婦やってるってマジでリスペクト。うちの両親も見習ってほしい)",
    hint: "未来のある時までの【継続】。結婚している「状態」なので be married を使い、[will have been married] になる！",
    back: "They will have been married for 20 years next year."
  }
];

const test3Cards: Card[] = [
  {
    id: 62,
    front: "She (　　) (　　) the piano.",
    translation: "彼女はピアノが弾ける。",
    comment: "(絶対合唱コンクールで伴奏頼まれるタイプ。もはや宿命だよね)",
    hint: "「〜できる」という能力は can 。助動詞の後ろは必ず動詞の原形！",
    back: "She can play the piano."
  },
  {
    id: 63,
    front: "You (　　) (　　) my cell phone.",
    translation: "私の携帯電話を使ってもいいですよ。",
    comment: "(ギガ減るけどいいの？あと間違っても変な検索履歴見ないでよ絶対！)",
    hint: "「〜してもよい」という許可を表す can（または may）。ここでは2語なので can use が入る！",
    back: "You can use my cell phone."
  },
  {
    id: 64,
    front: "An accident (　　) (　　) at any time.",
    translation: "事故はいつでも起こり得る。",
    comment: "(教習所のビデオで絶対言われるやつ。フラグビンビンすぎる)",
    hint: "「〜の可能性がある、〜し得る」という潜在的な可能性を表す can。",
    back: "An accident can happen at any time."
  },
  {
    id: 65,
    front: "“(　　) I (　　) you a question?” “Sure.”",
    translation: "「質問してもよろしいですか。」「もちろんです。」",
    comment: "(授業終わりに先生捕まえる時の定番セリフ。この後めっちゃ長引くパターン)",
    hint: "相手に許可を求める丁寧な表現「〜してもよろしいですか」は May I 〜?",
    back: "“May I ask you a question?” “Sure.”"
  },
  {
    id: 66,
    front: "He (　　) (　　) at home.",
    translation: "彼は家にいるかもしれない。",
    comment: "(LINE既読つかないし。絶対布団の中でゴロゴロしてゲームしてるだけだろこれ)",
    hint: "「〜かもしれない」という半信半疑の推量は may や might を使う。後ろは原形の be！",
    back: "He may be at home."
  },
  {
    id: 67,
    front: "You (　　) (　　) some sleep.",
    translation: "あなたは少し寝ないといけません。",
    comment: "(目の下のクマやばいよ。エナジードリンク何本目？マジで一回寝て)",
    hint: "「〜しなければならない」という強い義務・必要性は must 。",
    back: "You must get some sleep."
  },
  {
    id: 68,
    front: "I (　　) (　　) (　　) to the dentist today.",
    translation: "今日、私は歯医者に行かなければなりません。",
    comment: "(あーあ、あのキュイイーンって音聞くの嫌だなぁ。憂鬱すぎる１日)",
    hint: "must と同じく「〜しなければならない」だが、客観的な事情による場合は have to を使う！",
    back: "I have to go to the dentist today."
  },
  {
    id: 69,
    front: "You (　　) (　　) (　　) pictures here.",
    translation: "ここで写真を撮ってはいけません。",
    comment: "(インスタ映え狙ってスマホ出したら係員に注意されるやつ。おとなしくしまおう)",
    hint: "「〜してはいけない」という強い禁止は must not。",
    back: "You must not take pictures here."
  },
  {
    id: 70,
    front: "You (　　) (　　) (　　) (　　) off your shoes.",
    translation: "靴を脱ぐ必要はありません。",
    comment: "(日本の家だと思ってうっかり脱ごうとしたら止められた。逆に土足で入るのめちゃくちゃ罪悪感あるよね)",
    hint: "「〜する必要はない」は don't have to。must not(禁止)と意味が全然違うので注意！",
    back: "You don't have to take off your shoes."
  },
  {
    id: 71,
    front: "He (　　) (　　) tired.",
    translation: "彼は疲れているに違いない。",
    comment: "(さっきからため息ばっかりだし、目が死んでる. 今日めっちゃバイトのシフト入ってたもんな)",
    hint: "「〜に違いない」という強い確信の推量は must 。（※義務の意味だけじゃない！）",
    back: "He must be tired."
  },
  {
    id: 72,
    front: "You (　　) (　　) more careful.",
    translation: "君はもっと気を付けるべきだ。",
    comment: "(階段でスマホ見ながらつまずいた直後の説教。いやホンマそれな)",
    hint: "「〜すべきだ」という義務・忠告は should や ought to。",
    back: "You should be more careful."
  },
  {
    id: 73,
    front: "They (　　) (　　) (　　) here soon.",
    translation: "彼らはもうすぐここに着くはずだ。",
    comment: "(さっき「いま駅着いた！」ってLINE来たし。いつもここからが長いんだけどね)",
    hint: "「〜するはずだ」という当然の推量も should (ought to) を使う。",
    back: "They ought to arrive here soon."
  },
  {
    id: 74,
    front: "You (　　) (　　) (　　) a doctor.",
    translation: "医者に診てもらいなさい。",
    comment: "(咳全然止まってないじゃん！気合で治すとか言ってないで早く病院行けって！)",
    hint: "「〜しなさい、〜したほうがいい（しないとヤバイよ）」という強い忠告・切迫感は had better。",
    back: "You had better see a doctor."
  },
  {
    id: 75,
    front: "You (　　) (　　) (　　) (　　) to school today.",
    translation: "あなたは今日学校に行ってはいけません。",
    comment: "(熱38度あるのに「今日小テストあるから」って行こうとするやつ。バイオテロだからやめて！)",
    hint: "had better の否定形は had better not。「〜しないほうがいい（するとヤバイよ）」。notの位置に超注意！",
    back: "You had better not go to school today."
  },
  {
    id: 76,
    front: "I (　　) (　　) my homework after dinner.",
    translation: "私は夕食後に宿題をするつもりです。",
    comment: "(出た！絶対やらないやつ！ご飯食べた後コタツで寝落ちする未来しか見えない)",
    hint: "自分の強い「意志（〜するつもりだ）」を表す will。",
    back: "I will do my homework after dinner."
  },
  {
    id: 77,
    front: "My little sister (　　) (　　) vegetables.",
    translation: "私の妹はどうしても野菜を食べようとしない。",
    comment: "(ピーマンだけ器用に皿の端っこに避けてる。親の「食べなさい！」との果てしないバトル)",
    hint: "「どうしても〜しようとしない」という強い【拒絶】は won't (will not)。",
    back: "My little sister won't eat vegetables."
  },
  {
    id: 78,
    front: "The door (　　) (　　).",
    translation: "そのドアはどうしても開かなかった。",
    comment: "(立て付け悪すぎ。渾身の力で引っ張ってたら急にバンッ！て開いて後ろに吹っ飛ぶやつ)",
    hint: "過去の強い【拒絶】は wouldn't (would not)。無生物（ドアなど）にも使える！",
    back: "The door wouldn't open."
  },
  {
    id: 79,
    front: "We (　　) (　　) (　　) to the movies.",
    translation: "私たちはよく映画を見に行ったものだ。",
    comment: "(昔はレイトショーとかよく行ったよね。今はもう家でサブスクで済ませちゃうけど)",
    hint: "過去の【よくした習慣】は would often。「〜したものだ」と訳す。",
    back: "We would often go to the movies."
  },
  {
    id: 80,
    front: "I (　　) (　　) (　　) to school with my friends.",
    translation: "私は（以前は）友だちと歩いて登校したものだ。",
    comment: "(毎朝待ち合わせして、くだらない話しながら行くのが楽しかったんだよなぁ。エモい)",
    hint: "「（以前は）〜したものだ（今は違う）」という過去の習慣は used to。wouldと違い「今はしていない」という対比が含まれる！",
    back: "I used to walk to school with my friends."
  },
  {
    id: 81,
    front: "There (　　) (　　) (　　) a theater in the town.",
    translation: "以前は町に劇場があった。",
    comment: "(今はもう取り壊されて、デカいイオンとかマンションになっちゃった。時の流れ残酷)",
    hint: "過去の【状態】「以前は〜だった（今は違う）」は絶対に used to を使う。※wouldは動作にしか使えない！",
    back: "There used to be a theater in the town."
  },
  {
    id: 82,
    front: "He (　　) (　　) (　　) a good rest.",
    translation: "彼は十分休息したに違いない。",
    comment: "(昨日の顔色の悪さが嘘みたいに今日めっちゃ肌ツヤいいじゃん。12時間くらい寝たな？)",
    hint: "過去の事に対する確信の推量「〜したに違いない」は [must have ＋ 過去分詞]！",
    back: "He must have had a good rest."
  },
  {
    id: 83,
    front: "I (　　) (　　) (　　) the key at home.",
    translation: "私は家に鍵を置き忘れたのかもしれない。",
    comment: "(カバンひっくり返しても出てこない。ヤバい、家入れない。親帰ってくるの夜遅いのに！)",
    hint: "過去の事に対する推量「〜したのかもしれない」は [may/might have ＋ 過去分詞]！",
    back: "I may have left the key at home."
  },
  {
    id: 84,
    front: "She (　　) (　　) (　　) such a mistake.",
    translation: "彼女がそんな間違いをしたはずがない。",
    comment: "(あの超絶真面目な学級委員長がそんな凡ミスする！？絶対誰かの罠だろ！)",
    hint: "過去の事に対する強い否定の推量「〜したはずがない」は [can't/couldn't have ＋ 過去分詞]！",
    back: "She can't have made such a mistake."
  },
  {
    id: 85,
    front: "He (　　) (　　) (　　) (　　) home by now.",
    translation: "彼は今ごろもう家に着いているはずだ。",
    comment: "(終電で帰ったのが1時間前だから、そろそろ家着いて布団ダイブしてる頃合いかな)",
    hint: "過去の事に対する当然の推量「（今ごろ）〜したはずだ」は [should/ought to have ＋ 過去分詞]！",
    back: "He should have arrived home by now."
  },
  {
    id: 86,
    front: "I (　　) (　　) (　　) his advice.",
    translation: "私は彼の忠告を聞くべきだったのに（聞かなかった）。",
    comment: "(「その話やめとけ」って言われたのに突っ走って大失敗。素直に聞いとけばよかったと激しく後悔)",
    hint: "過去の事に対する後悔・非難「〜すべきだったのに（しなかった）」は [should/ought to have ＋ 過去分詞]！",
    back: "I should have taken his advice."
  },
  {
    id: 87,
    front: "We (　　) (　　) (　　) (　　).",
    translation: "私たちは急ぐ必要はなかったのに（急いだ）。",
    comment: "(全力ダッシュで駅着いたのに、電車遅延してるじゃん！汗だくの努力返して！)",
    hint: "過去の不要な行動「〜する必要はなかったのに（してしまった）」は [needn't have ＋ 過去分詞]！",
    back: "We need not have hurried."
  },
  {
    id: 88,
    front: "I (　　) (　　) two tickets.",
    translation: "チケットを2枚欲しいのですが。",
    comment: "(デートの約束取り付ける前にフライングで買っちゃうやつ。断られたらどうすんの？)",
    hint: "丁寧な要望「〜が欲しいのですが」は would like 名詞。wantの丁寧版！",
    back: "I would like two tickets."
  },
  {
    id: 89,
    front: "I (　　) (　　) (　　) (　　) a reservation.",
    translation: "予約をしたいのですが。",
    comment: "(ちょっとお高めのレストランに電話してる。緊張して声高くなってるのバレバレ)",
    hint: "丁寧な希望「〜したいのですが」は would like to ＋ 動詞の原形。want to の丁寧版！",
    back: "I would like to make a reservation."
  },
  {
    id: 90,
    front: "I (　　) (　　) stay home (　　) go out.",
    translation: "私は外出するよりもむしろ家にいたい。",
    comment: "(インドア派の極み。休日にわざわざ人混み行くとか意味わかんない。ネトフリしか勝たん)",
    hint: "「（…するより）むしろ〜したい」は [would rather 動詞の原形 (than 動詞の原形)]！",
    back: "I would rather stay home than go out."
  }
];

const test4Cards: Card[] = [
  {
    id: 91,
    front: "She (　　) (　　) by the kids.",
    translation: "彼女は子どもたちに愛されている。",
    comment: "(保育園のお迎えの時間。両足にちびっ子たちがしがみついて離れない、天性のカリスマ保育士さん。エプロンのポケットには常にどんぐりが入ってる)",
    hint: "受動態の基本形は [be動詞 ＋ 過去分詞 ＋ by(〜によって)]！主語(She)が単数なので is になる。",
    back: "She is loved by the kids."
  },
  {
    id: 92,
    front: "German (　　) (　　) in Austria.",
    translation: "オーストリアではドイツ語が話されている。",
    comment: "(世界史の授業あるある。「え、オーストリア語ってないの？」って最初絶対思うやつ。ノートの端っこにオーストラリアと間違えないようにメモする)",
    hint: "話す主体が by people (一般的な人々) などの場合、by〜 は省略されるのが普通！",
    back: "German is spoken in Austria."
  },
  {
    id: 93,
    front: "We (　　) (　　) (　　) to the party.",
    translation: "私たちはパーティーに招待されなかった。",
    comment: "(インスタのストーリーで知る地獄。「え、昨日みんなでタコパやってたの？ウチら呼ばれてないんだけど…」というスマホを握りしめる手が震える静かな絶望)",
    hint: "受動態の【否定文】は、be動詞の直後に not を置く！過去の話なので were not になる。",
    back: "We were not invited to the party."
  },
  {
    id: 94,
    front: "(　　) you (　　) to the party?",
    translation: "あなたはパーティーに招待されましたか。",
    comment: "(翌日の教室。傷口に塩を塗るような無慈悲な質問。聞かれた相手も気まずそうに「あ、うん…ごめん」って目を逸らす、あの地獄の空気感)",
    hint: "受動態の【疑問文】は、be動詞を主語の前に出すだけ！[Were ＋ 主語 ＋ 過去分詞 ?]",
    back: "Were you invited to the party?"
  },
  {
    id: 95,
    front: "Who (　　) (　　) to the party?",
    translation: "誰がパーティーに招待されましたか。",
    comment: "(犯人探しの始まり。裏で新しいLINEグループが作られていたことを突き止めようとする、名探偵ばりの執念。もう誰も信じられない)",
    hint: "疑問詞（Who）が主語の疑問文は、[Who ＋ was ＋ 過去分詞] の語順になる！Whoは三人称単数扱いなので was。",
    back: "Who was invited to the party?"
  },
  {
    id: 96,
    front: "This essay (　　) (　　) (　　) by tomorrow.",
    translation: "この作文は明日までに仕上げなければならない。",
    comment: "(現在時刻、日曜日の夜11時。「読書感想文、まだあと原稿用紙3枚残ってるんだけど！」という徹夜確定フラグ。親が呆れて麦茶持ってくる)",
    hint: "【助動詞 ＋ 受動態】の形。助動詞の後ろは必ず「原形の be」になる！ [must be ＋ 過去分詞]",
    back: "This essay must be finished by tomorrow."
  },
  {
    id: 97,
    front: "The fireworks (　　) (　　) (　　) from my house.",
    translation: "私の家から花火は見えない。",
    comment: "(不動産屋「ベランダから花火大会見えますよ！」→ 実際に入居したら目の前にデカいタワマン建ってて、ドーン！っていう爆音しか聞こえない詐欺)",
    hint: "【助動詞の否定 ＋ 受動態】。[cannot(can't) be ＋ 過去分詞]。「見られない」＝「見えない」と訳すのが自然。",
    back: "The fireworks can't be seen from my house."
  },
  {
    id: 98,
    front: "A new building (　　) (　　) (　　) on the corner.",
    translation: "新しい建物が角のところで建設中だ。",
    comment: "(通学路の空き地。「次こそスタバかマックできないかな〜」って毎朝期待してたら、結局ただの学習塾ができて全員がっかりするやつ)",
    hint: "【進行形の受動態】（〜されている最中だ）。[be動詞 ＋ being ＋ 過去分詞]！ 真ん中の being を絶対忘れるな！",
    back: "A new building is being built on the corner."
  },
  {
    id: 99,
    front: "The wall (　　) just (　　) (　　).",
    translation: "壁はペンキが塗られたばかりだ。",
    comment: "(絶対「ペンキ塗りたて（Wet Paint）」の注意書きあるのに、うっかり触って指先がベッタリ白くなるおっちょこちょいがクラスに1人はいる)",
    hint: "【現在完了の受動態】（〜されたところだ）。[have/has ＋ been ＋ 過去分詞]！just は has と been の間に挟む。",
    back: "The wall has just been painted."
  },
  {
    id: 100,
    front: "Mary (　　) (　　) a gold medal.",
    translation: "メアリーは金メダルを授与された。",
    comment: "(表彰台の真ん中で涙ぐみながらメダルを噛むメアリー。フラッシュの嵐。一方、隣の銀メダリストの「くそっ…」っていう絶妙な表情までカメラは抜いている)",
    hint: "SVOO(第4文型)の受動態で【人（Mary）】を主語にしたパターン。後ろに残ったモノ(a gold medal)は、過去分詞の後にそのまま下ろす！",
    back: "Mary was given a gold medal."
  },
  {
    id: 101,
    front: "The gold medal (　　) (　　) (　　) Mary.",
    translation: "その金メダルはメアリーに授与された。",
    comment: "(スポーツドキュメンタリーの重厚なナレーション。「数々の激闘、そして挫折…。その末に、ついに栄光の証は彼女の手に渡ったのです」)",
    hint: "SVOO(第4文型)の受動態で【モノ（The gold medal）】を主語にしたパターン。残った人(Mary)の前には「to」が必要になる！",
    back: "The gold medal was given to Mary."
  },
  {
    id: 102,
    front: "The baby (　　) (　　) Catherine by her parents.",
    translation: "その赤ちゃんは両親にキャサリンと名付けられた。",
    comment: "(キラキラネームじゃなくて安心する親族一同。おくるみに包まれたキャサリンちゃん、寝顔がマジで天使。将来絶対美人になるわこれ)",
    hint: "SVOC(第5文型)の受動態。[name A B (AをBと名付ける)] のAが主語になった形。残ったB(Catherine)はそのまま過去分詞の後ろに置く！",
    back: "The baby was named Catherine by her parents."
  },
  {
    id: 103,
    front: "(　　) (　　) (　　) (　　) he is very rich.",
    translation: "彼はとても金持ちだと言われている。",
    comment: "(田舎のデカい屋敷の前をチャリで通る時の地元民の噂話。「あそこの爺さん、裏の山３つ丸ごと持ってるらしいで…」みたいな都市伝説)",
    hint: "【It is said that 〜】（〜だと言われている）。that節の中(he is very rich)は普通の文のままでOK！",
    back: "It is said that he is very rich."
  },
  {
    id: 104,
    front: "He (　　) (　　) (　　) be very rich.",
    translation: "彼はとても金持ちだと言われている。",
    comment: "(上の文と同じ状況だけど、こっちは週刊誌の記者が彼本人にフォーカスして密着取材してる感。「渦中の彼ですが、総資産はなんと…」)",
    hint: "上の文を【He(彼)】を主語にして書き換えた形。[主語 ＋ is said to ＋ 動詞の原形]。この書き換えはテストにめちゃくちゃ出る！",
    back: "He is said to be very rich."
  },
  {
    id: 105,
    front: "She (　　) (　　) (　　) in New York.",
    translation: "彼女はニューヨークで育った。",
    comment: "(自己紹介で「あ、私中3までNYだったんで」って言った瞬間、周りの女子の間に「あ〜、はいはい（謎のマウント察し）」っていう絶妙な空気が流れる)",
    hint: "【群動詞（動詞＋副詞）】の受動態。bring up（育てる）はこれで1つの動詞とみなすため、引き離さずに [was brought up] とセットで使う！",
    back: "She was brought up in New York."
  },
  {
    id: 106,
    front: "The road (　　) (　　) (　　) snow.",
    translation: "道路は雪で覆われている。",
    comment: "(朝起きてカーテン開けたら一面の銀世界。「よっしゃ！電車止まれ！今日学校休み確定！」ってパジャマのままテンション爆上がりする雪国の朝)",
    hint: "「〜で覆われている」は [be covered with 〜] 。by ではないので注意！",
    back: "The road is covered with snow."
  },
  {
    id: 107,
    front: "We (　　) (　　) (　　) the news.",
    translation: "私たちはその知らせに驚いた。",
    comment: "(公式アカウントから『いつも応援してくださる皆様へ、大切なお知らせ』という世界一嫌なタイトルのURLが投下された瞬間。スマホを持ったまま膝から崩れ落ちる地獄絵図)",
    hint: "感情を表す動詞はもともと「驚かせる」という意味。自分が驚くときは受動態になる！前置詞は at を使う。[be surprised at 〜]",
    back: "We were surprised at the news."
  },
  {
    id: 108,
    front: "He (　　) (　　) (　　) last night's game.",
    translation: "彼は昨夜の試合でけがをした。",
    comment: "(エースが膝を押さえてピッチに倒れ込むスローモーション映像。観客席の悲鳴。明日からどうすんだよ…キャプテン涙目)",
    hint: "「けがをする」という被害も受動態で表す。[be injured in 〜] 。これも by は使わない！",
    back: "He was injured in last night's game."
  }
];

const test5Cards: Card[] = [
  {
    id: 109,
    front: "(　　) is important (　　) (　　) enough sleep.",
    translation: "十分な睡眠をとることが大事だ。",
    comment: "(深夜2時までゲームして翌日の授業で口開けて爆睡してる生徒に、先生が呆れ顔で言うお説教。お前だよお前)",
    hint: "形式主語の It。長すぎる主語を後ろに回し、It で始める鉄板の形！[It is 〜 to ＋ 動詞の原形]。",
    back: "It is important to get enough sleep."
  },
  {
    id: 110,
    front: "Her dream is (　　) (　　) a singer.",
    translation: "彼女の夢は歌手になることだ。",
    comment: "(卒業文集の将来の夢ランキング常連。数年後、地元のイオンモールで熱唱している姿を見かけて謎の感動を覚えるやつ)",
    hint: "名詞用法「〜すること」。be動詞の直後に来て、主語とイコール（夢＝なること）の関係を作る！",
    back: "Her dream is to be a singer."
  },
  {
    id: 111,
    front: "I hope (　　) (　　) to university.",
    translation: "私は大学にいくことを希望しています。",
    comment: "(三者面談で急に意識高いこと言って親を驚かせる瞬間。とりあえず今の偏差値から目をそらさないで)",
    hint: "名詞用法。動詞 hope の目的語になる。「〜することを望む」は hope to 〜！",
    back: "I hope to go to university."
  },
  {
    id: 112,
    front: "Luckily, he had friends (　　) (　　) him.",
    translation: "幸運なことに、彼には助けてくれる友人がいた。",
    comment: "(RPGでHP1の絶体絶命のピンチに、仲間が回復魔法かけてくれた瞬間。「やっぱ持つべきものは友！」って叫びたくなる)",
    hint: "形容詞用法. 前の名詞(friends)を後ろから修飾する。「〜するための、〜してくれる（名詞）」と訳す！",
    back: "Luckily, he had friends to help him."
  },
  {
    id: 113,
    front: "I have a lot of things (　　) (　　) today.",
    translation: "今日、私にはするべきことがたくさんある。",
    comment: "(夏休み最終日の絶望。宿題、自由研究、読書感想文…え、何から手つければいいの？現実逃避して部屋の掃除始めちゃうやつ)",
    hint: "形容詞用法の超定番フレーズ。things to do で「するべきこと」！",
    back: "I have a lot of things to do today."
  },
  {
    id: 114,
    front: "I made a promise (　　) (　　) to the movie with her.",
    translation: "彼女と一緒に映画に行く約束をした。",
    comment: "(ニヤニヤが止まらない。昨日から「服何着ていくか」でずっと鏡の前で一人ファッションショーやってるだろ)",
    hint: "形容詞用法。promise(約束)という名詞の具体的な内容を「〜するという」と説明する形！",
    back: "I made a promise to go to the movie with her."
  },
  {
    id: 115,
    front: "I got up early (　　) (　　) the 6:30 train.",
    translation: "私は6時30分の列車に乗るために早く起きた。",
    comment: "(修学旅行の朝. 普段は絶対起きないのに、こういう日だけは目覚まし鳴る前に目パッチリ開いてる謎の覚醒モード)",
    hint: "副詞用法（目的）。文の要素が揃った後にくっついて「〜するために」という動作の目的を表す！",
    back: "I got up early to catch the 6:30 train."
  },
  {
    id: 116,
    front: "I'm glad (　　) (　　) you.",
    translation: "私はあなたに会えてうれしいです。",
    comment: "(マッチングアプリで1ヶ月やり取りして、ついに駅前で初対面した時のテンプレ第一声。写真と実物ちょっと違くて内心焦ってる)",
    hint: "副詞用法（感情の原因）。glad, happy, sad などの感情の形容詞の後ろに置き、「〜して（嬉しい/悲しい）」を表す！",
    back: "I'm glad to see you."
  },
  {
    id: 117,
    front: "He must be clever (　　) (　　) that question",
    translation: "あの問題を解くなんて、彼は賢いに違いない。",
    comment: "(クラスの誰も解けなかった黒板の激ムズ数学を、寝起きでサラッと解いて席に戻るガリ勉キャラ。かっこよすぎかよ)",
    hint: "副詞用法（判断の根拠）。must be(〜に違いない)と相性抜群。「〜するなんて」と訳すのがコツ！",
    back: "He must be clever to answer that question."
  },
  {
    id: 118,
    front: "It is dangerous (　　) the children (　　) (　　) here.",
    translation: "子どもたちがここにとどまるのは危険だ。",
    comment: "(特撮ヒーローが怪人と戦い始める直前に言うセリフ。「ここは危ない、早く逃げるんだ！」って言いながらシールド張ってくれる)",
    hint: "不定詞の動作をする「意味上の主語」は [for ＋ 人] で表す！[It is 〜 for 人 to 動詞] の鉄板構文！",
    back: "It is dangerous for the children to stay here."
  },
  {
    id: 119,
    front: "(　　) was kind (　　) you (　　) (　　) me.",
    translation: "私を助けてくれるなんてあなたは親切だった。→ ご親切にも助けてくださり、ありがとうございました。",
    comment: "(道端でばらまいたプリントを一緒に拾ってくれた先輩へのキュンとするお礼。手が触れ合ってここから恋が始まる少女漫画フラグ)",
    hint: "kind, nice, stupid などの「人の性質」を表す形容詞の時は、for ではなく絶対に [of ＋ 人] を使う！超ひっかけポイント！",
    back: "It was kind of you to help me."
  },
  {
    id: 120,
    front: "I turned on the TV (　　) (　　) the news.",
    translation: "私はニュースを見るためにテレビをつけた。",
    comment: "(「今日俺の推しがキャスターやるんよ！」ってリモコン奪い取ってテレビの前で正座待機してるガチオタク)",
    hint: "これも副詞用法（目的）の「〜するために」。",
    back: "I turned on the TV to watch the news."
  },
  {
    id: 121,
    front: "I (　　) (　　) (　　) (　　) to tomorrow's party.",
    translation: "私はあなたに明日のパーティーに来てほしい。",
    comment: "(「お前が来ないと盛り上がんないんだよ〜」って言われて断れなくなるやつ。幹事の巧妙な罠)",
    hint: "[want ＋ 人 ＋ to 動詞] で「人に〜してほしい」。人に頼む時の超重要表現！",
    back: "I want you to come to tomorrow's party."
  },
  {
    id: 122,
    front: "My parents won't (　　) (　　) (　　) (　　) abroad.",
    translation: "両親は私が留学するのを許さないだろう。",
    comment: "(夕飯の時に「オレ、アメリカ行くわ」って急に言い出して、お父さんの箸がピタッと止まる緊迫の食卓)",
    hint: "[allow ＋ 人 ＋ to 動詞] で「人が〜するのを許す」。",
    back: "My parents won't allow me to study abroad."
  },
  {
    id: 123,
    front: "My mother (　　) (　　) (　　) my room.",
    translation: "母は私に部屋の掃除をさせた。",
    comment: "(週末の朝、「いつまで寝てるの！足の踏み場もないじゃない！」って強制的に掃除機ガーガーかけられるイベント)",
    hint: "【使役動詞 make】。[make ＋ 人 ＋ 動詞の原形] で「（強制的に）〜させる」。to は絶対に入れない（原形不定詞）！",
    back: "My mother made me clean my room."
  },
  {
    id: 124,
    front: "I (　　) (　　) (　　) (　　) my baggage.",
    translation: "私はポーターに荷物を運んでもらった。",
    comment: "(海外の高級ホテルでチップをスッと渡す大人な対応。内心（え、いくら渡せばいいんだっけ…）ってドギマギしてる)",
    hint: "【使役動詞 have】。[have ＋ 人 ＋ 動詞の原形] で「（仕事として当然）〜してもらう」。これも to なし！",
    back: "I had the porter carry my baggage."
  },
  {
    id: 125,
    front: "My father (　　) (　　) (　　) to the movies.",
    translation: "父は私を映画に行かせてくれた。",
    comment: "(「門限は8時だぞ」って５千円札と一緒に送り出してくれる優しいパパ。ありがとう、一生ついていく)",
    hint: "【使役動詞 let】。[let ＋ 人 ＋ 動詞の原形] で「（望み通りに）〜させてあげる」。to なし！",
    back: "My father let me go to the movies."
  },
  {
    id: 126,
    front: "I (　　) (　　) (　　) (　　) out of the car.",
    translation: "私はその男が車から降りるのを見た。",
    comment: "(黒塗りのベンツからグラサンかけたイカつい人が出てきて、思わず電柱の陰にサッと隠れる市民Aの視点)",
    hint: "【知覚動詞 see】。[see ＋ 人 ＋ 動詞の原形] で「人が〜するのを見る」。使役動詞と同じく to のない原形不定詞！",
    back: "I saw the man get out of the car."
  },
  {
    id: 127,
    front: "She told me (　　) (　　) (　　) late.",
    translation: "彼女は私に遅れないようにと言った。",
    comment: "(「次遅刻したら絶交だからね」って静かにキレてる彼女。背筋がスッと冷たくなる最恐の宣告)",
    hint: "【不定詞の否定形】。not は必ず to の直前に置く！[tell 人 not to 〜] で「〜しないように言う」。",
    back: "She told me not to be late."
  },
  {
    id: 128,
    front: "He seems (　　) (　　) ill.",
    translation: "彼は病気であると思われる。",
    comment: "(ずっとゴホゴホ咳してるし顔面蒼白なのに「大丈夫、花粉症だから」って言い張るブラック企業の社畜。早く帰れ)",
    hint: "[seem to ＋ 動詞の原形] で「（今）〜であると思われる」。現在の状態！",
    back: "He seems to be ill."
  },
  {
    id: 129,
    front: "He seems (　　) (　　) (　　) ill.",
    translation: "彼は病気だったと思われる。",
    comment: "(昨日学校休んでたあいつ、今日来てるけどめっちゃゲッソリしてる。昨日ガチでヤバかったんだな…)",
    hint: "【完了不定詞】。[seem to have ＋ 過去分詞]で「（過去に）〜だったと思われる」。主節の時制より前の事を表す！",
    back: "He seems to have been ill."
  },
  {
    id: 130,
    front: "She seems (　　) (　　) (　　) her holiday.",
    translation: "彼女は休日を楽しんでいるようだ。",
    comment: "(インスタのストーリーがハワイの海、パンケーキ、水着で埋め尽くされてる。リア充アピール全開で画面が眩しい)",
    hint: "【進行形の不定詞】。[to be 〜ing] で「（まさに今）〜している最中のようだ」。",
    back: "She seems to be enjoying her holiday."
  },
  {
    id: 131,
    front: "Children need (　　) (　　) (　　) by an adult.",
    translation: "子どもは大人に同行してもらう必要がある。",
    comment: "(遊園地の絶叫マシーンの入り口で、「大人の人と一緒じゃないと乗れないよ〜」って止められてギャン泣きしてる小学生)",
    hint: "【受動態の不定詞】。[to be ＋ 過去分詞] で「〜されること」。",
    back: "Children need to be accompanied by an adult."
  },
  {
    id: 132,
    front: "I'm (　　) tired (　　) (　　).",
    translation: "私はあまりにも疲れていて歩けない。",
    comment: "(ディズニーで朝から晩まで遊び倒して、帰りの舞浜駅に向かう時の足の重さ。もう一歩も動きたくない、誰かおんぶして)",
    hint: "【too 〜 to 動詞】構文。「あまりに〜すぎて…できない」。not が無いのに「できない」と否定で訳す魔法の形！",
    back: "I'm too tired to walk."
  },
  {
    id: 133,
    front: "He is smart (　　) (　　) (　　) the puzzle.",
    translation: "彼はそのパズルを解くほど賢い。",
    comment: "(ルービックキューブをシャカシャカっと10秒で全面揃えてドヤ顔する天才児。周りの大人はポカーン)",
    hint: "【形容詞/副詞 ＋ enough to 動詞】。「〜するほど十分に…だ」。語順に超注意！(smart が enough の前に来る)",
    back: "He is smart enough to solve the puzzle."
  },
  {
    id: 134,
    front: "We arrived early (　　) (　　) (　　) (　　) good seats.",
    translation: "私たちは良い席を確保するために早く到着した。",
    comment: "(推しのライブ。アリーナ最前列を狙って始発でドームに並ぶガチ勢の執念。冬場の物販列は寒さとの戦い)",
    hint: "目的を強調する表現 [in order to 動詞]。ただの to よりもフォーマルで「絶対に〜するために！」という強い意志を感じる形。",
    back: "We arrived early in order to get good seats."
  },
  {
    id: 135,
    front: "(　　) (　　) (　　) (　　) (　　), I woke up late this morning.",
    translation: "実を言うと、今朝は寝坊したのです。",
    comment: "(先生に「電車が遅延しまして…」って言い訳しようとしたけど、先生の鋭い眼光に負けて1秒で自白した瞬間)",
    hint: "【独立不定詞】。文全体を修飾する決まり文句。To tell (you) the truth はそのまま丸暗記！",
    back: "To tell you the truth, I woke up late this morning."
  }
];

const test6Cards: Card[] = [
  {
    id: 136,
    front: "(　　) baseball is [×are] fun.",
    translation: "野球をすることは楽しい。",
    comment: "(素振り100回とかキツい練習の時は「辞めてやる！」って思うのに、試合でヒット打った瞬間のあの快感で全部チャラになる野球部マジック)",
    hint: "動名詞(〜ing)が主語になった形。「〜すること」は【単数扱い】になるため、動詞は are ではなく is を使う！",
    back: "Playing baseball is fun."
  },
  {
    id: 137,
    front: "My favorite pastime is (　　) movies.",
    translation: "私のいちばん好きな娯楽は映画を見ることです。",
    comment: "(就活の面接で無難な趣味を聞かれた時のテンプレ回答。「最近見た映画は？」って深掘りされて「あ、コナンです」って答えて微妙な空気になるまでがセット)",
    hint: "be動詞の直後に来て、主語とイコールの関係を作る「〜すること（補語）」。不定詞の名詞用法(to watch)に書き換え可能！",
    back: "My favorite pastime is watching movies."
  },
  {
    id: 138,
    front: "I like (　　) to music.",
    translation: "私は音楽を聴くことが好きです。",
    comment: "(電車内でAirPods装着して、窓の外を眺めながら自分がMVの主人公になったかのように物憂げな表情を作ってる中二病患者)",
    hint: "動詞(like)の目的語になる「〜すること」。これも不定詞(to listen)に書き換え可能！",
    back: "I like listening to music."
  },
  {
    id: 139,
    front: "Thank you for (　　) today.",
    translation: "今日は来てくれてありがとう。",
    comment: "(アイドルの握手会. 推しから両手握られてこのセリフ言われた瞬間、今までのCD積んだ苦労が全て報われて脳内麻薬ドバドバ出るやつ)",
    hint: "【前置詞の後ろは必ず動名詞】！for to come のように前置詞＋不定詞は絶対NG！テストで超狙われるポイント。",
    back: "Thank you for coming today."
  },
  {
    id: 140,
    front: "I don't like (　　) (　　) out at night.",
    translation: "私は彼が夜に外出することを好まない。",
    comment: "(深夜のコンビニにジャージとサンダルでフラッと出かけていく彼氏に、「また誰かと会ってんじゃないの？」と疑心暗鬼になるメンヘラ彼女の視点)",
    hint: "動名詞の「意味上の主語」。動名詞の動作をする人を明確にしたい時、〜ingの直前に【目的格(him)または所有格(his)】を置く！",
    back: "I don't like him going out at night."
  },
  {
    id: 141,
    front: "I don't like (　　) out at night.",
    translation: "私は夜に外出することを好まない。",
    comment: "(「夜は危ないから出ちゃダメ！」っていう親の言いつけを真面目に守る、箱入り息子の模範解答)",
    hint: "意味上の主語を置かない場合は、「文の主語(私)」が夜に外出するという意味になる！",
    back: "I don't like going out at night."
  },
  {
    id: 142,
    front: "(　　) regular exercise is a good habit.",
    translation: "定期的な運動をすることは良い習慣だ。",
    comment: "(健康診断で「中性脂肪ヤバいですね」って医者に脅されて、慌ててジムに入会したけど結局幽霊会員になってるお父さんへの戒め)",
    hint: "これも主語になる動名詞。Getting の t を重ねるスペルミスに注意！",
    back: "Getting regular exercise is a good habit."
  },
  {
    id: 143,
    front: "I'm sorry for (　　) (　　) sooner.",
    translation: "もっと早く手紙を書かなくてすみません。",
    comment: "(夏休みの宿題で「おじいちゃんおばあちゃんへの手紙」を提出日前日に慌ててでっち上げてる小学生の言い訳テンプレ第一文)",
    hint: "【動名詞の否定形】。not は必ず 〜ing の直前に置く！for not writing の語順が鉄則。",
    back: "I'm sorry for not writing sooner."
  },
  {
    id: 144,
    front: "My little sister is tired (　　) (　　) (　　) like a child.",
    translation: "私の妹は子ども扱いされることにうんざりしている。",
    comment: "(親戚の集まりで「〇〇ちゃん、また背伸びた〜？お小遣いあげるね〜」って高2の自分に幼児語で話しかけてくるおばちゃんに対する冷めた目線)",
    hint: "【受動態の動名詞】。[being ＋ 過去分詞] で「〜されること」。前置詞 of の後ろなので動名詞になる！",
    back: "My little sister is tired of being treated like a child."
  },
  {
    id: 145,
    front: "She is proud of (　　) a nurse.",
    translation: "彼女は看護師であることを誇りに思っている。",
    comment: "(「夜勤キツいし腰痛いけど、やっぱ患者さんが笑顔になって退院していくの見ると辞められないんだよね」って居酒屋で熱く語る白衣の天使)",
    hint: "be proud of 〜（〜を誇りに思う）。主節(is)と動名詞(being)の「時制が同じ（現在＝現在）」パターン。",
    back: "She is proud of being a nurse."
  },
  {
    id: 146,
    front: "She was proud of (　　) a nurse.",
    translation: "彼女は看護師であることを誇りに思っていた。",
    comment: "(「昔はやりがい感じてたんだけどね…」という過去の栄光。今は人間関係に疲れて寿退社を狙っているリアルな現実)",
    hint: "主節(was)と動名詞(being)の「時制が同じ（過去＝過去）」パターン。",
    back: "She was proud of being a nurse."
  },
  {
    id: 147,
    front: "She is proud of (　　) (　　) a nurse.",
    translation: "彼女は看護師だったことを誇りに思っている。",
    comment: "(定年退職したおばあちゃんが、昔のナース服の写真を見ながら孫に「おばあちゃんは昔、たくさんの命を救ったのよ」とドヤ顔する心温まるシーン)",
    hint: "【完了動名詞】。[having ＋ 過去分詞]。主節の時制(is:現在)よりも「前の出来事(過去)」を表す！",
    back: "She is proud of having been a nurse."
  },
  {
    id: 148,
    front: "She was proud of (　　) (　　) a nurse.",
    translation: "彼女は看護師だったことを誇りに思っていた。",
    comment: "(昔書かれた偉人伝の1ページみたいな状況。「彼女はかつて前線で働いていた事実を、誇りに思っていたのだ」という重厚なナレーション)",
    hint: "これも完了動名詞. 主節(was:過去)よりも「さらに前の出来事(大過去)」を表す。",
    back: "She was proud of having been a nurse."
  },
  {
    id: 149,
    front: "We (　　) (　　) cards.",
    translation: "私たちはトランプをして楽しんだ。",
    comment: "(修学旅行の夜、消灯時間過ぎてるのに布団の中でスマホのライト照らしながらやる大富豪。先生の見回りの足音が聞こえた時のあの一体感)",
    hint: "動名詞(〜ing)しか目的語にとれない動詞【メガフェプス(MEGAFEPS)】の筆頭、enjoy！enjoy to play は絶対NG！",
    back: "We enjoyed playing cards."
  },
  {
    id: 150,
    front: "I (　　) (　　) (　　) soccer. / I (　　) (　　) soccer.",
    translation: "私はサッカーをすることが好きです。",
    comment: "(ボールは友達！って言いながら、ドリブルの練習よりもスパイクのメーカーとか髪型ばっかり気にしてる万年ベンチの補欠)",
    hint: "like や start, begin などは、後ろに不定詞(to do)と動名詞(〜ing)のどちらを置いても意味が変わらない！",
    back: "I like to play soccer. / I like playing soccer."
  },
  {
    id: 151,
    front: "I am (　　) (　　) (　　) (　　) from you.",
    translation: "あなたからの便りを楽しみに待っています。",
    comment: "(推しのVTuberにスパチャ投げて「名前呼んでくれないかな…」って画面に齧り付いてる深夜3時。もはや便りというかレスポンス待ち)",
    hint: "超頻出熟語【look forward to ＋ 〜ing】！この to は前置詞なので、後ろは絶対に原形ではなく動名詞(〜ing)が来る！引っかけ問題の王者。",
    back: "I am looking forward to hearing from you."
  },
  {
    id: 152,
    front: "I (　　) (　　) him at the party.",
    translation: "私はパーティーで彼に会ったのを覚えている。",
    comment: "(「あ、あの時の！パリピの集まりで一人だけ部屋の隅でウーロン茶飲みながらスマホいじってた人ですよね！」っていう気まずい再会)",
    hint: "remember ＋ 〜ing は「（過去に）〜したことを覚えている」。過去の記憶！",
    back: "I remember seeing him at the party."
  },
  {
    id: 153,
    front: "(　　) (　　) (　　) off the lights.",
    translation: "忘れずに照明を消してね。",
    comment: "(「あんたまた電気つけっぱなし！電気代いくらだと思ってんの！」というオカンの怒号。家を出る時の一番の重要ミッション)",
    hint: "remember ＋ to 動詞 は「忘れずに〜する（これから〜することを覚えている）」。未来へのやるべきミッション！〜ingと意味が真逆になるので注意！",
    back: "Remember to turn off the lights."
  }
];

const test7Cards: Card[] = [
  {
    id: 154,
    front: "Firefighters entered the (　　) house.",
    translation: "消防士たちは燃えている家に入った。",
    comment: "(ハリウッド映画のクライマックス。崩れ落ちる梁を間一髪で避けながら、逃げ遅れた子犬を抱きかかえてスローモーションで出てくるやつ。背中には爆発の炎)",
    hint: "「燃えている（能動・進行）」という意味の【現在分詞（〜ing）】。1語で名詞(house)を修飾する場合は、名詞の【前】に置く！",
    back: "Firefighters entered the burning house."
  },
  {
    id: 155,
    front: "Be careful of the (　　) glass.",
    translation: "割れたガラスに注意しなさい。",
    comment: "(飲み会終盤。誰かがジョッキをガチャンと落として一瞬静まり返る店内。店員さんが「あ、そのままで大丈夫ですよ！」ってホウキとチリトリ持って駆けつけてくる気まずい時間)",
    hint: "「割られた、割れた（受動・完了）」という意味の【過去分詞】。これも1語なので名詞(glass)の【前】！",
    back: "Be careful of the broken glass."
  },
  {
    id: 156,
    front: "Do you know the girl (　　) to Sally?",
    translation: "サリーと話している少女を知っていますか。",
    comment: "(新学期、クラスのヒエラルキートップの女子(サリー)に果敢に話しかけてる転校生を見て、「あの子、度胸あるな…」と遠巻きに観察してるモブ生徒の視点)",
    hint: "「〜している（能動）」の現在分詞。talking to Sally のように【2語以上】のカタマリで修飾する場合は、名詞(the girl)の【後ろ】に置く！",
    back: "Do you know the girl talking to Sally?"
  },
  {
    id: 157,
    front: "They have a son (　　) Chris.",
    translation: "彼らにはクリスと名付けられた息子がいる。",
    comment: "(ホームステイ先のホストファミリーの紹介文。「クリスは日本のアニメが大好きです」って書いてあったのに、実際会ったらガチのマッチョでアメフト部キャプテンだった時のギャップ)",
    hint: "「〜と名付けられた（受動）」の過去分詞。named Chris というカタマリなので、名詞(a son)の【後ろ】から修飾！",
    back: "They have a son named Chris."
  },
  {
    id: 158,
    front: "The mall will remain (　　) until Thursday.",
    translation: "そのショッピングモールは木曜日まで閉まったままだろう。",
    comment: "(台風直撃でシャッターに「臨時休業」の張り紙。それを知らずに気合い入れておしゃれして来ちゃったカップルが、強風に煽られながら途方に暮れてる哀愁)",
    hint: "【SVC（第2文型）】。remain（〜のままである）の補語。モールは「閉められる」側なので、受動の意味の過去分詞(closed)を使う！",
    back: "The mall will remain closed until Thursday."
  },
  {
    id: 159,
    front: "She kept me (　　) for an hour.",
    translation: "彼女は私を1時間待たせた。",
    comment: "(真冬のハチ公前。「ごめん今メイク終わった！」という絶望のLINEを受信。足の感覚がなくなる中、隣で同じように震えてる同志(見知らぬ男)と謎の連帯感が生まれる)",
    hint: "【SVOC（第5文型）】。[keep ＋ O ＋ 〜ing] で「Oを〜させたままにしておく」。私(me)が自ら「待つ(能動)」ので現在分詞！",
    back: "She kept me waiting for an hour."
  },
  {
    id: 160,
    front: "I (　　) Steve (　　) for a bus.",
    translation: "私はスティーブがバスを待っているのを見かけた。",
    comment: "(休日の駅前。普段はビシッと制服着てるスティーブが、ダサめの私服に寝癖爆発でぼーっと立ってるのを発見。「声かけるべきか…」と5秒悩んで見なかったことにする)",
    hint: "【知覚動詞のSVOC】。[see ＋ O ＋ 〜ing] で「Oが〜している（最中な）のを見る」。一部始終ではなく「その瞬間」を見たニュアンス！",
    back: "I saw Steve waiting for a bus."
  },
  {
    id: 161,
    front: "I (　　) the book (　　) in the paper.",
    translation: "私はその本が新聞で広告されているのを見かけた。",
    comment: "(実家の新聞の下のほうにある「〇〇で人生が変わった！」みたいな胡散臭い自己啓発本の全面広告。親が真剣に切り抜いて机に貼ってた時の「やめとけって…」という複雑な感情)",
    hint: "これも【知覚動詞のSVOC】。ただし、本(the book)は「広告される（受動）」側なので、過去分詞(advertised)が使われる！",
    back: "I saw the book advertised in the paper."
  },
  {
    id: 162,
    front: "She (　　) her hair (　　).",
    translation: "彼女は髪を切ってもらった。",
    comment: "(失恋してバッサリ切ったのかと思いきや、本人は「毛先3ミリ揃えてトリートメントしただけ〜」って言うやつ。男子には絶対わからない微妙な変化)",
    hint: "【使役動詞のSVOC】。[have/get ＋ O ＋ 過去分詞] で「Oを〜してもらう（使役）」。髪は美容師に「切られる」側なので過去分詞の cut (※過去分詞もcut)！",
    back: "She had her hair cut."
  },
  {
    id: 163,
    front: "She (　　) her bag (　　).",
    translation: "彼女はバッグを盗まれた。",
    comment: "(海外旅行の初日、広場でハトに餌やってキャッキャしてる間に置き引きに遭う悲劇。パスポートも財布も消滅し、大使館への行き方を公衆電話で泣きながら調べてる修羅場)",
    hint: "上と同じ [have/get ＋ O ＋ 過去分詞] の形だが、文脈から「Oを〜される（被害）」と訳す！バッグは「盗まれる」側だから stolen！",
    back: "She had her bag stolen."
  },
  {
    id: 164,
    front: "We sat up all night, (　　) on the phone.",
    translation: "電話で話しながら、私たちは夜を明かした。",
    comment: "(中学生の初カノとの長電話。「そっちから切ってよ〜」「え〜やだ〜」の不毛なラリーが午前3時まで続く。翌朝、親に「あんた誰とあんなに話してたの！」と尋問される)",
    hint: "【分詞構文（付帯状況）】。「〜しながら」という同時進行の動作を表す。後ろにカンマを打って 〜ing をくっつける形が多い！",
    back: "We sat up all night, talking on the phone."
  },
  {
    id: 165,
    front: "(　　) soccer, he hurt his leg.",
    translation: "サッカーをしている時に、彼は脚にけがをした。",
    comment: "(体育の授業で女子の視線を意識しすぎて、無理なスライディングをキメて自爆。保健室へ肩を貸されながら運ばれていく時の「やっちまった…」という痛々しい背中)",
    hint: "【分詞構文（時）】。When he was playing soccer, の When he was が省略され、〜ing だけで「〜している時」を表している！",
    back: "Playing soccer, he hurt his leg."
  },
  {
    id: 166,
    front: "(　　) in plain English, this book is easy to read.",
    translation: "わかりやすい英語で書かれているので、この本は読みやすい。",
    comment: "(TOEIC対策コーナーの隅にある「サルでもわかる！」系の参考書。表紙のポップなイラストに釣られて買ったけど、結局最初の3ページしか読まずにメルカリに出品される運命)",
    hint: "【過去分詞から始まる分詞構文（原因）】。Because it is written の Because it is が省略されている。「書かれているので（受動）」という意味！",
    back: "Written in plain English, this book is easy to read."
  },
  {
    id: 167,
    front: "I just stood there, (　　) (　　) what to do.",
    translation: "何をしてよいかわからないまま、私はただそこに立っていた。",
    comment: "(バイト初日。店長から「適当に仕事見つけてやってて！」と丸投げされ、レジ横で完全にフリーズしている新人。お客さんと目が合うたびに愛想笑いだけ精一杯する)",
    hint: "【分詞構文の否定形】。not は必ず 〜ing の直前に置く！「〜しないで、〜しないまま」と訳す。",
    back: "I just stood there, not knowing what to do."
  },
  {
    id: 168,
    front: "(　　) (　　) my homework, I went to bed.",
    translation: "宿題を終えてから、私は寝た。",
    comment: "(夏休み最終日の朝焼け。徹夜でプリントの山を消化し終え、謎の達成感とともに布団へダイブする瞬間。「もう二度と溜めない」と誓うが、来年も絶対同じことを繰り返す)",
    hint: "【完了形の分詞構文】。[Having ＋ 過去分詞]。主節の動作(寝た)よりも、分詞の動作(宿題を終えた)が「前に起きた」ことを明確にする形！",
    back: "Having finished my homework, I went to bed."
  },
  {
    id: 169,
    front: "(　　) from this picture, he is very tall.",
    translation: "この写真から判断すると、彼はとても背が高い。",
    comment: "(マッチングアプリのプロフ写真分析会議。隣に写ってる自販機の高さから身長を逆算し、「これ絶対170ないって！」と友人と粗探しをしている深夜の女子会)",
    hint: "【独立分詞構文（慣用表現）】。主語が誰であろうと関係なく使う決まり文句。Judging from 〜（〜から判断すると）は丸暗記必須！",
    back: "Judging from this picture, he is very tall."
  },
  {
    id: 170,
    front: "He waited for her to come back (　　) (　　) (　　) (　　).",
    translation: "車のエンジンをかけたまま、彼は彼女が戻ってくるのを待った。",
    comment: "(逃走車で待機するルパン一味の次元大介のポジション。銀行の警報機が鳴り響く中、タバコをくわえながら「遅えな、何やってんだアイツは」とハンドルを握る渋いワンシーン)",
    hint: "【with ＋ O ＋ 分詞】（付帯状況）。「Oを〜した状態で」。エンジンは「（自ら）動いている・かかっている」ので現在分詞(running)を使う！超頻出！",
    back: "He waited for her to come back with the engine running."
  }
];

const test8Cards: Card[] = [
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

const test9Cards: Card[] = [
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

const test10Cards: Card[] = [
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

export const decks: Deck[] = [
  {
    id: 'test1',
    title: 'Test 1 (文の種類)',
    description: '',
    cards: test1Cards
  },
  {
    id: 'test2',
    title: 'Test 2 (時制)',
    description: '',
    cards: test2Cards
  },
  {
    id: 'test3',
    title: 'Test 3 (助動詞)',
    description: '',
    cards: test3Cards
  },
  {
    id: 'test4',
    title: 'Test 4 (受動態)',
    description: '',
    cards: test4Cards
  },
  {
    id: 'test5',
    title: 'Test 5 (不定詞)',
    description: '',
    cards: test5Cards
  },
  {
    id: 'test6',
    title: 'Test 6 (動名詞)',
    description: '',
    cards: test6Cards
  },
  {
    id: 'test7',
    title: 'Test 7 (分詞)',
    description: '',
    cards: test7Cards
  },
  {
    id: 'test8',
    title: 'Test 8 (関係詞)',
    description: '',
    cards: test8Cards
  },
  {
    id: 'test9',
    title: 'Test 9 (比較)',
    description: '',
    cards: test9Cards
  },
  {
    id: 'test10',
    title: 'Test 10 (仮定法)',
    description: '',
    cards: test10Cards
  }
];
