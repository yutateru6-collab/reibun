import type { Card } from './cards';

const sourceComment = (source: string, note = '') => {
  const base = `【出典】${source}\n※英語・日本語・空欄は添付資料の表記を基準に収録しています。`;
  return note ? `${base}\n\n【原資料メモ】\n${note}` : base;
};

export const hopeLesson1Cards: Card[] = [
  { id: 4001, front: "There are many books on the president’s life.", translation: "大統領の生活についての本がたくさんある。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.1"), hint: "", back: "There are many books on the president’s life." },
  { id: 4002, front: "This biography has 200 pages.", translation: "この伝記は200ページある。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.2"), hint: "", back: "This biography has 200 pages." },
  { id: 4003, front: "We will experience many technological advances in our life.", translation: "私たちの生活で多くの技術の進歩を経験するだろう。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.3"), hint: "", back: "We will experience many technological advances in our life." },
  { id: 4004, front: "The internet enables us to find information quickly.", translation: "インターネットで情報を素早く見つけることができる。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.4"), hint: "", back: "The internet enables us to find information quickly." },
  { id: 4005, front: "One of my dreams is to go to the moon.", translation: "私の夢の１つは月に行くことだ。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.5"), hint: "", back: "One of my dreams is to go to the moon." },
  { id: 4006, front: "Studying abroad will be a good experience for you.", translation: "留学することはあなたにとって良い経験になるだろう。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.6"), hint: "", back: "Studying abroad will be a good experience for you." },
  { id: 4007, front: "To live is to learn.", translation: "生きることは学ぶことだ。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.7"), hint: "", back: "To live is to learn." },
  { id: 4008, front: "It’s a good idea for us to have clear goals in life.", translation: "人生の明確な目標を持つことは私たちにとって良い考えだ。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.8"), hint: "", back: "It’s a good idea for us to have clear goals in life." },
  { id: 4009, front: "It is clear that computer skills are useful.", translation: "コンピューターのスキルが役に立つことは明らかだ。", comment: sourceComment("Hope Example Bank Lesson 1 p.8 No.9"), hint: "", back: "It is clear that computer skills are useful." },
];

export const hopeLesson2Cards: Card[] = [
  { id: 4010, front: "Most students arrive at school around eight o’clock.", translation: "ほとんどの生徒は８時ごろ学校に到着する。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.1"), hint: "", back: "Most students arrive at school around eight o’clock." },
  { id: 4011, front: "The class remained quiet when the teacher was talking.", translation: "その先生が話していたとき，クラスは静かにしていた。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.2"), hint: "", back: "The class remained quiet when the teacher was talking." },
  { id: 4012, front: "Many students enjoy talking during breaks.", translation: "多くの学生は休憩時間中おしゃべりを楽しんでいる。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.3"), hint: "", back: "Many students enjoy talking during breaks." },
  { id: 4013, front: "You cannot enter school buildings at night.", translation: "夜間は学校の建物に入ることはできない。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.4"), hint: "", back: "You cannot enter school buildings at night." },
  { id: 4014, front: "Some classroom problems were discussed in homeroom.", translation: "ホームルームでクラスの問題について話し合われた。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.5"), hint: "", back: "Some classroom problems were discussed in homeroom." },
  { id: 4015, front: "The air conditioning in the classroom suddenly broke down.", translation: "教室のエアコンが突然故障した。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.6"), hint: "", back: "The air conditioning in the classroom suddenly broke down." },
  { id: 4016, front: "We looked after the exchange students on their first day of school.", translation: "私たちは学校初日の交換留学生を世話した。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.7"), hint: "", back: "We looked after the exchange students on their first day of school." },
  { id: 4017, front: "Some students’ homework was handed in one day late.", translation: "何人の生徒の宿題は１日遅れで提出された。", comment: sourceComment("Hope Example Bank Lesson 2 p.12 No.8"), hint: "", back: "Some students’ homework was handed in one day late." },
];

export const hopeLesson3Cards: Card[] = [
  { id: 4018, front: "Winter sports are very popular in Canada.", translation: "カナダでは冬のスポーツはとても人気がある。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.1"), hint: "", back: "Winter sports are very popular in Canada." },
  { id: 4019, front: "The Tigers and the Hawks are playing now.", translation: "タイガースとホークスは今，試合をしている。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.2"), hint: "", back: "The Tigers and the Hawks are playing now." },
  { id: 4020, front: "She has been a professional tennis player for five years.", translation: "彼女は5年間プロテニス選手である。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.3"), hint: "", back: "She has been a professional tennis player for five years." },
  { id: 4021, front: "Nakata Hidetoshi started playing soccer when he was eight.", translation: "中田英寿は8歳の時サッカーを始めた。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.4"), hint: "", back: "Nakata Hidetoshi started playing soccer when he was eight." },
  { id: 4022, front: "The team was training in the gym when the earthquake struck.", translation: "地震が起きたとき，そのチームはジムでトレーニングをしていた。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.5"), hint: "", back: "The team was training in the gym when the earthquake struck." },
  { id: 4023, front: "He had been the world record holder until last Sunday, but his record was broken by a rival runner.", translation: "彼は先週の日曜日まで世界記録保持者だったが，彼の記録はライバル走者によって破られた。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.6"), hint: "", back: "He had been the world record holder until last Sunday, but his record was broken by a rival runner." },
  { id: 4024, front: "The NBA regular season starts in October.", translation: "NBA のレギュラーシーズンは10月に始まる。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.7"), hint: "", back: "The NBA regular season starts in October." },
  { id: 4025, front: "He will surely win the next marathon.", translation: "彼はきっと次のマラソンで優勝するだろう。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.8"), hint: "", back: "He will surely win the next marathon." },
  { id: 4026, front: "The tournament is going to be held in Australia.", translation: "そのトーナメントはオーストラリアで開催される予定だ。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.9"), hint: "", back: "The tournament is going to be held in Australia." },
  { id: 4027, front: "The table tennis player will be playing in China next year.", translation: "その卓球選手は来年は中国でプレーしているだろう。", comment: sourceComment("Hope Example Bank Lesson 3 p.18 No.10"), hint: "", back: "The table tennis player will be playing in China next year." },
];

export const hopeLesson4Cards: Card[] = [
  { id: 4028, front: "We must be careful with our social media posts.", translation: "私たちは自分のソーシャルメディアの投稿に注意しなければならない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.1"), hint: "", back: "We must be careful with our social media posts." },
  { id: 4029, front: "You have to have your smartphone off during the movie.", translation: "上映中は携帯電話の電源を切っておかなければならない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.2"), hint: "", back: "You have to have your smartphone off during the movie." },
  { id: 4030, front: "I’ve got to reply to a message from my friend.", translation: "友人からのメッセージに返信しなければならない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.3"), hint: "", back: "I’ve got to reply to a message from my friend." },
  { id: 4031, front: "You’d better stop using your smartphone before going to bed.", translation: "寝る前に携帯電話を使うのをやめた方が良い。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.4"), hint: "", back: "You’d better stop using your smartphone before going to bed." },
  { id: 4032, front: "I think people should [ought to] reply to emails quickly.", translation: "私はメールには早く返事をすべきだと思う。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.5"), hint: "", back: "I think people should [ought to] reply to emails quickly." },
  { id: 4033, front: "We should not [ought not to] spend a lot of time checking social media.", translation: "ソーシャルメディアを確認するのに多くの時間を費やすべきではない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.6"), hint: "", back: "We should not [ought not to] spend a lot of time checking social media." },
  { id: 4034, front: "Using smartphones could affect our sleep.", translation: "携帯電話を使いすぎることは睡眠に影響を与える可能性がある。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.7"), hint: "", back: "Using smartphones could affect our sleep." },
  { id: 4035, front: "Social media may cause loneliness.", translation: "ソーシャルメディアは孤独をもたらすかもしれない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.8"), hint: "", back: "Social media may cause loneliness." },
  { id: 4036, front: "Social media might be useful to get the latest information.", translation: "ソーシャルメディアは最新の情報を得るのに役立つかもしれない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.9"), hint: "", back: "Social media might be useful to get the latest information." },
  { id: 4037, front: "I should have checked the email address before sending.", translation: "送信する前にメールアドレスを確認するべきだった。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.10"), hint: "", back: "I should have checked the email address before sending." },
  { id: 4038, front: "She might have sent the message to the wrong person.", translation: "彼女は間違った人にメッセージを送ってしまったかもしれない。", comment: sourceComment("Hope Example Bank Lesson 4 p.22 No.11"), hint: "", back: "She might have sent the message to the wrong person." },
];

export const hopeLesson5Cards: Card[] = [
  { id: 4039, front: "There is growing concern about climate change.", translation: "気候変動について懸念が高まっている。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.1"), hint: "", back: "There is growing concern about climate change." },
  { id: 4040, front: "This country depends on imported oil.", translation: "この国は輸入された石油に頼っている。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.2"), hint: "", back: "This country depends on imported oil." },
  { id: 4041, front: "There are some scientists studying new forms of energy.", translation: "新しい形のエネルギーを研究している科学者がいる。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.3"), hint: "", back: "There are some scientists studying new forms of energy." },
  { id: 4042, front: "Global warming is a serious problem caused by human activity.", translation: "地球温暖化は人間の行動によって引き起こされる深刻な問題だ。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.4"), hint: "", back: "Global warming is a serious problem caused by human activity." },
  { id: 4043, front: "Japan is a country with few energy resources.", translation: "日本はエネルギー資源がほとんどない国だ。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.5"), hint: "", back: "Japan is a country with few energy resources." },
  { id: 4044, front: "We couldn’t find evidence to support our theory.", translation: "私たちの理論を支える証拠が見つけられなかった。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.6"), hint: "", back: "We couldn’t find evidence to support our theory." },
  { id: 4045, front: "We have a lot of work to do to solve environmental problems.", translation: "環境問題を解決するためにするべき仕事がたくさんある。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.7"), hint: "", back: "We have a lot of work to do to solve environmental problems." },
  { id: 4046, front: "There are a variety of matters to be discussed at the next conference on forest destruction.", translation: "次の森林破壊に関する会議で話し合われるべきさまざまな問題がある。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.8"), hint: "", back: "There are a variety of matters to be discussed at the next conference on forest destruction." },
  { id: 4047, front: "They made an attempt to reduce the amount of plastic use.", translation: "彼らはプラスチックの使用量を減らそうとした。", comment: sourceComment("Hope Example Bank Lesson 5 p.28 No.9"), hint: "", back: "They made an attempt to reduce the amount of plastic use." },
];

export const hopeLesson6Cards: Card[] = [
  { id: 4048, front: "In Singapore, people who throw trash on the road will be fined.", translation: "シンガポールでは，道にごみを捨てる人は罰金を課せられる。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.1"), hint: "", back: "In Singapore, people who throw trash on the road will be fined." },
  { id: 4049, front: "There are some countries which have several official languages.", translation: "公用語が複数ある国がある。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.2"), hint: "", back: "There are some countries which have several official languages." },
  { id: 4050, front: "Switzerland is a country whose natural beauty attracts many tourists.", translation: "スイスは自然の美しさが多くの観光客を魅了している国だ。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.3"), hint: "", back: "Switzerland is a country whose natural beauty attracts many tourists." },
  { id: 4051, front: "What is famous about Japan is its manga culture.", translation: "日本について有名なのは漫画文化だ。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.4"), hint: "", back: "What is famous about Japan is its manga culture." },
  { id: 4052, front: "India is a country where a wide variety of religions and cultures can be found.", translation: "インドは多種多様な宗教や文化が見られる国だ。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.5"), hint: "", back: "India is a country where a wide variety of religions and cultures can be found." },
  { id: 4053, front: "In Japan, Golden Week is a time when many people travel.", translation: "日本ではゴールデンウイークは多くの人が旅行をする時期だ。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.6"), hint: "", back: "In Japan, Golden Week is a time when many people travel." },
  { id: 4054, front: "One reason why you should learn about local cultures is to make a trip more enjoyable.", translation: "地域の文化を学ぶべき１つの理由は旅をより楽しくすることだ。", comment: sourceComment("Hope Example Bank Lesson 6 p.32 No.7"), hint: "", back: "One reason why you should learn about local cultures is to make a trip more enjoyable." },
];

export const hopeLesson7Cards: Card[] = [
  { id: 4055, front: "Misaki uses a paper dictionary to look up English words.", translation: "美咲は英単語を調べるために紙の辞書を使う。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.1"), hint: "", back: "Misaki uses a paper dictionary to look up English words." },
  { id: 4056, front: "I’m glad to find some useful language learning websites.", translation: "役に立つ言語学習サイトをいくつか見つけられてうれしい。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.2"), hint: "", back: "I’m glad to find some useful language learning websites." },
  { id: 4057, front: "I often send emails to my friend in the U.S.", translation: "私はしばしばアメリカの友人にメールを送る。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.3"), hint: "", back: "I often send emails to my friend in the U.S." },
  { id: 4058, front: "Surprisingly, our teacher can speak several languages.", translation: "驚いたことに，私たちの先生は複数の言語を話せる。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.4"), hint: "", back: "Surprisingly, our teacher can speak several languages." },
  { id: 4059, front: "My father manages to read Portuguese with a dictionary at his side.", translation: "父は傍らに辞書を置いてポルトガル語をなんとか読むことができる。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.5"), hint: "", back: "My father manages to read Portuguese with a dictionary at his side." },
  { id: 4060, front: "English is so widespread that it is hard to deny its usefulness.", translation: "英語はとても普及しているのでその有用性を否定するのは難しい。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.6"), hint: "", back: "English is so widespread that it is hard to deny its usefulness." },
  { id: 4061, front: "Although she has never been to Russia, she knows some Russian.", translation: "彼女はロシアに行ったことはないが，いくつかのロシア語を知っている。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.7"), hint: "", back: "Although she has never been to Russia, she knows some Russian." },
  { id: 4062, front: "The Canadian teacher talked about his hometown, using photos.", translation: "写真を使いながら，そのカナダ人の先生は故郷について話した。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.8"), hint: "", back: "The Canadian teacher talked about his hometown, using photos." },
  { id: 4063, front: "Written in plain English, this novel is good for beginners in the language.", translation: "わかりやすい英語で書かれているので，この小説は英語初心者に良い。", comment: sourceComment("Hope Example Bank Lesson 7 p.38 No.9"), hint: "", back: "Written in plain English, this novel is good for beginners in the language." },
];

export const hopeLesson8Cards: Card[] = [
  { id: 4064, front: "My father said to me, “You are free to decide how to lead your life.”", translation: "父は私に「どう生きるかは好きに決めていい」と言った。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.1"), hint: "", back: "My father said to me, “You are free to decide how to lead your life.”" },
  { id: 4065, front: "My father told me that I was free to decide how to lead my life.", translation: "父は私がどう生きるかは好きに決めていいと言った。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.2"), hint: "", back: "My father told me that I was free to decide how to lead my life." },
  { id: 4066, front: "Our teacher told us to consider our social responsibilities.", translation: "私たちの先生は社会的責任について考えるよう私たちに言った。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.3"), hint: "", back: "Our teacher told us to consider our social responsibilities." },
  { id: 4067, front: "My father advised me not to depend on the internet too much.", translation: "父は私にインターネットに頼りすぎないように助言した。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.4"), hint: "", back: "My father advised me not to depend on the internet too much." },
  { id: 4068, front: "She suggested that I take part in a local community event.", translation: "彼女は私が地域のイベントに参加するよう提案した。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.5"), hint: "", back: "She suggested that I take part in a local community event." },
  { id: 4069, front: "He asked me what my neighborhood looked like.", translation: "彼は私の近所はどのようなものかと尋ねた。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.6"), hint: "", back: "He asked me what my neighborhood looked like." },
  { id: 4070, front: "According to the report, more and more people want to come to Japan to work.", translation: "報告によると，ますます多くの人が日本に働きに来たいと思っている。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.7"), hint: "", back: "According to the report, more and more people want to come to Japan to work." },
  { id: 4071, front: "They say that Japan has a rapidly aging population.", translation: "日本は急速な高齢化社会である言われている。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.8"), hint: "", back: "They say that Japan has a rapidly aging population." },
  { id: 4072, front: "It is said that the crime rate in the city has increased this year.", translation: "今年，この街の犯罪率は増加したと言われている。", comment: sourceComment("Hope Example Bank Lesson 8 p.42 No.9"), hint: "", back: "It is said that the crime rate in the city has increased this year." },
];

export const hopeLesson9Cards: Card[] = [
  { id: 4073, front: "If it is fine tomorrow, I want to have a barbecue.", translation: "もし明日，晴れたら，バーベキューをしたい。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.1"), hint: "", back: "If it is fine tomorrow, I want to have a barbecue." },
  { id: 4074, front: "If you go to a foreign country, you can learn firsthand about the culture.", translation: "もし外国に行けば，あなたはその文化について直接，学ぶことができる。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.2"), hint: "", back: "If you go to a foreign country, you can learn firsthand about the culture." },
  { id: 4075, front: "If you were a foreign tourist, where in Japan would you visit?", translation: "もしあなたが外国人観光客だったなら，日本のどこを訪れますか。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.3"), hint: "", back: "If you were a foreign tourist, where in Japan would you visit?" },
  { id: 4076, front: "If you went to the moon, what would you do?", translation: "もし月に行ったら，何をしますか。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.4"), hint: "", back: "If you went to the moon, what would you do?" },
  { id: 4077, front: "I could have had a chance to study abroad if I had studied harder.", translation: "もしもっと勉強していたなら，留学に行く機会を得ることができていたのに。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.5"), hint: "", back: "I could have had a chance to study abroad if I had studied harder." },
  { id: 4078, front: "If he hadn’t saved enough money, he wouldn’t be here in Norway now.", translation: "もし十分なお金を貯めていなかったなら，彼は今ここノルウェーにいなかっただろう。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.6"), hint: "", back: "If he hadn’t saved enough money, he wouldn’t be here in Norway now." },
  { id: 4079, front: "I wish I could save people around the world from poverty.", translation: "世界中の人々を貧困から救えたら良いのに。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.7"), hint: "", back: "I wish I could save people around the world from poverty." },
  { id: 4080, front: "If you were to live abroad, which country would you like to live in?", translation: "もし外国に住むことになったら，あなたはどの国に住みたいですか。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.8"), hint: "", back: "If you were to live abroad, which country would you like to live in?" },
  { id: 4081, front: "He acted as if he had been in England for a long time.", translation: "彼は長い間イングランドにいたかのように振舞った。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.9"), hint: "", back: "He acted as if he had been in England for a long time." },
  { id: 4082, front: "Without my family’s support, I couldn’t have studied abroad.", translation: "家族の助けなしでは，私は留学することができなかった。", comment: sourceComment("Hope Example Bank Lesson 9 p.48 No.10"), hint: "", back: "Without my family’s support, I couldn’t have studied abroad." },
];

export const hopeLesson10Cards: Card[] = [
  { id: 4083, front: "The robot can speak three languages.", translation: "そのロボットは３ヵ国語話せる。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.1"), hint: "", back: "The robot can speak three languages." },
  { id: 4084, front: "We can access large amounts of information with browsers.", translation: "ブラウザを通してたくさんの情報にアクセスできる。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.2"), hint: "", back: "We can access large amounts of information with browsers." },
  { id: 4085, front: "Technology will improve dramatically within a few years.", translation: "技術は数年のうちに劇的に進化するだろう。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.3"), hint: "", back: "Technology will improve dramatically within a few years." },
  { id: 4086, front: "Almost all the students in this class use online dictionaries.", translation: "このクラスのほとんどすべての生徒がオンライン辞書を使っている。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.4"), hint: "", back: "Almost all the students in this class use online dictionaries." },
  { id: 4087, front: "A number of jobs are done by robots now.", translation: "現在，いくつかの仕事がロボットによってなされている。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.5"), hint: "", back: "A number of jobs are done by robots now." },
  { id: 4088, front: "Machine translation has made a great deal of progress.", translation: "機械翻訳はかなりの進歩を遂げた。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.6"), hint: "", back: "Machine translation has made a great deal of progress." },
  { id: 4089, front: "The ratio of robots to humans in this factory is 3 to 2.", translation: "この工場ではロボットと人間の比率は３対２だ。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.7"), hint: "", back: "The ratio of robots to humans in this factory is 3 to 2." },
  { id: 4090, front: "The number of teleworkers increased sharply.", translation: "在宅ワーカーの数は急激に増えた。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.8"), hint: "", back: "The number of teleworkers increased sharply." },
  { id: 4091, front: "The amount of face-to-face communication is gradually decreasing.", translation: "対面のコミュニケーションの量が段々と少なくなっている。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.9"), hint: "", back: "The amount of face-to-face communication is gradually decreasing." },
];

export const hopeLesson11Cards: Card[] = [
  { id: 4092, front: "Salty food is as unhealthy as fried food.", translation: "塩辛い食べ物は揚げ物と同じくらい不健康だと言われている。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.1"), hint: "", back: "Salty food is as unhealthy as fried food." },
  { id: 4093, front: "I have been doing twice as much exercise as I used to.", translation: "私は以前の２倍の運動を行っている。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.2"), hint: "", back: "I have been doing twice as much exercise as I used to." },
  { id: 4094, front: "As many as 1,000 people ran a marathon yesterday.", translation: "昨日，千人もの人がマラソンを走った。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.3"), hint: "", back: "As many as 1,000 people ran a marathon yesterday." },
  { id: 4095, front: "John looks healthier than before.", translation: "ジョンは以前より健康的に見える。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.4"), hint: "", back: "John looks healthier than before." },
  { id: 4096, front: "Running is a more popular form of exercise than it was.", translation: "ランニングは昔より人気のある運動形態です。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.5"), hint: "", back: "Running is a more popular form of exercise than it was." },
  { id: 4097, front: "Erin exercises much more often than her brother.", translation: "エリンは彼女の兄よりずっと運動する。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.6"), hint: "", back: "Erin exercises much more often than her brother." },
  { id: 4098, front: "These days, more and more people are caring about their health.", translation: "最近，だんだん多くの人が健康に気を付けている。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.7"), hint: "", back: "These days, more and more people are caring about their health." },
  { id: 4099, front: "The more exercise you do, the happier you will be.", translation: "運動すればするほど，ますます幸せになるだろう。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.8"), hint: "", back: "The more exercise you do, the happier you will be." },
  { id: 4100, front: "I think rugby is the most exciting sport in the world.", translation: "私はラグビーは世界で最もはらはらするスポーツだと思う。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.9"), hint: "", back: "I think rugby is the most exciting sport in the world." },
  { id: 4101, front: "Sleeping enough is one of the most effective ways to live well.", translation: "十分な睡眠は健康的に生きるのに最も効果的な方法の１つだ。", comment: sourceComment("Hope Example Bank Lesson 11 p.58 No.10"), hint: "", back: "Sleeping enough is one of the most effective ways to live well." },
];

export const hopeLesson12Cards: Card[] = [
  { id: 4102, front: "The salesperson had no sales this month.", translation: "その販売員は今月まったく売り上げがなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.1"), hint: "", back: "The salesperson had no sales this month." },
  { id: 4103, front: "No one selected the cheapest goods.", translation: "誰も最安値の商品を選ばなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.2"), hint: "", back: "No one selected the cheapest goods." },
  { id: 4104, front: "None of the colleagues came up with good ideas.", translation: "どの同僚も良い考えを思いつかなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.3"), hint: "", back: "None of the colleagues came up with good ideas." },
  { id: 4105, front: "Expensive products are not always good.", translation: "高価な商品が必ずしも良いとは限らない。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.4"), hint: "", back: "Expensive products are not always good." },
  { id: 4106, front: "The company could not satisfy all their consumers.", translation: "その企業は全ての消費者を満足させることはできなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.5"), hint: "", back: "The company could not satisfy all their consumers." },
  { id: 4107, front: "He didn’t like both of the products.", translation: "彼はその商品のどちらも好きというわけではなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.6"), hint: "", back: "He didn’t like both of the products." },
  { id: 4108, front: "Very few people know how to update the app to the latest version.", translation: "そのアプリケーションの最新版への更新方法を知っている人はほとんどいない。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.7"), hint: "", back: "Very few people know how to update the app to the latest version." },
  { id: 4109, front: "The customer had little satisfaction with the new product.", translation: "その顧客は新しい商品にほとんど満足していなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.8"), hint: "", back: "The customer had little satisfaction with the new product." },
  { id: 4110, front: "The business team hardly got any information about their target customers.", translation: "そのビジネスチームはターゲットとなる顧客についての情報をほとんど得ていなかった。", comment: sourceComment("Hope Example Bank Lesson 12 p.62 No.9"), hint: "", back: "The business team hardly got any information about their target customers." },
];

export const hopeTest1Cards: Card[] = [
  { id: 4201, front: "There are (　　)(　　) on the president’s life.", translation: "大統領の生活についての本がたくさんある。", comment: sourceComment("Hope Test1 No.1", ""), hint: "", back: "There are many books on the president’s life." },
  { id: 4202, front: "(　　)(　　) has 200 pages.", translation: "この伝記は200ページある。", comment: sourceComment("Hope Test1 No.2", ""), hint: "", back: "This biography has 200 pages." },
  { id: 4203, front: "(　　) will experience many technological advances in our life.", translation: "私たちの生活で多くの技術の進歩を経験するだろう。", comment: sourceComment("Hope Test1 No.3", ""), hint: "", back: "We will experience many technological advances in our life." },
  { id: 4204, front: "(　　)(　　) enables us to find information quickly.", translation: "インターネットで情報を素早く見つけることができる。", comment: sourceComment("Hope Test1 No.4", ""), hint: "", back: "The internet enables us to find information quickly." },
  { id: 4205, front: "(　　)(　　)(　　)(　　) is to go to the moon.", translation: "私の夢の１つは月に行くことだ。", comment: sourceComment("Hope Test1 No.5", ""), hint: "", back: "One of my dreams is to go to the moon." },
  { id: 4206, front: "(　　)(　　) will be a good experience for you.", translation: "留学することはあなたにとって良い経験になるだろう。", comment: sourceComment("Hope Test1 No.6", ""), hint: "", back: "Studying abroad will be a good experience for you." },
  { id: 4207, front: "(　　)(　　) is to learn.", translation: "生きることは学ぶことだ。", comment: sourceComment("Hope Test1 No.7", ""), hint: "", back: "To live is to learn." },
  { id: 4208, front: "(　　) is a good idea for us to have clear goals in life.", translation: "人生の明確な目標を持つことは私たちにとって良い考えだ。", comment: sourceComment("Hope Test1 No.8", ""), hint: "", back: "It’s a good idea for us to have clear goals in life." },
  { id: 4209, front: "(　　) is clear that computer skills are useful.", translation: "コンピューターのスキルが役に立つことは明らかだ。", comment: sourceComment("Hope Test1 No.9", ""), hint: "", back: "It is clear that computer skills are useful." },
];

export const hopeTest2Cards: Card[] = [
  { id: 4210, front: "Most students (　　) at school around eight o’clock.", translation: "ほとんどの生徒は８時ごろ学校に到着する。", comment: sourceComment("Hope Test2 No.1", ""), hint: "", back: "Most students arrive at school around eight o’clock." },
  { id: 4211, front: "The class (　　) quiet when the teacher was talking.", translation: "その先生が話していたとき，クラスは静かにしていた。", comment: sourceComment("Hope Test2 No.2", ""), hint: "", back: "The class remained quiet when the teacher was talking." },
  { id: 4212, front: "Many students (　　) talking during breaks.", translation: "多くの学生は休憩時間中おしゃべりを楽しんでいる。", comment: sourceComment("Hope Test2 No.3", ""), hint: "", back: "Many students enjoy talking during breaks." },
  { id: 4213, front: "You cannot (　　) school buildings at night.", translation: "夜間は学校の建物に入ることはできない。", comment: sourceComment("Hope Test2 No.4", ""), hint: "", back: "You cannot enter school buildings at night." },
  { id: 4214, front: "Some classroom problems (　　)(　　) in homeroom.", translation: "ホームルームでクラスの問題について話し合われた。", comment: sourceComment("Hope Test2 No.5", ""), hint: "", back: "Some classroom problems were discussed in homeroom." },
  { id: 4215, front: "The air conditioning in the classroom suddenly (　　)(　　).", translation: "教室のエアコンが突然故障した。", comment: sourceComment("Hope Test2 No.6", ""), hint: "", back: "The air conditioning in the classroom suddenly broke down." },
  { id: 4216, front: "We (　　)(　　) the exchange students on their first day of school.", translation: "私たちは学校初日の交換留学生を世話した。", comment: sourceComment("Hope Test2 No.7", ""), hint: "", back: "We looked after the exchange students on their first day of school." },
  { id: 4217, front: "Some students’ homework (　　)(　　)(　　) one day late.", translation: "何人の生徒の宿題は１日遅れで提出された。", comment: sourceComment("Hope Test2 No.8", ""), hint: "", back: "Some students’ homework was handed in one day late." },
];

export const hopeTest3Cards: Card[] = [
  { id: 4218, front: "Winter sports (　　) very popular in Canada.", translation: "カナダでは冬のスポーツはとても人気がある。", comment: sourceComment("Hope Test3 No.1", ""), hint: "", back: "Winter sports are very popular in Canada." },
  { id: 4219, front: "The Tigers and the Hawks (　　)(　　) now.", translation: "タイガースとホークスは今，試合をしている。", comment: sourceComment("Hope Test3 No.2", ""), hint: "", back: "The Tigers and the Hawks are playing now." },
  { id: 4220, front: "She (　　)(　　) a professional tennis player for five years.", translation: "彼女は5年間プロテニス選手である。", comment: sourceComment("Hope Test3 No.3", ""), hint: "", back: "She has been a professional tennis player for five years." },
  { id: 4221, front: "Nakata Hidetoshi (　　) playing soccer when he was eight.", translation: "中田英寿は8歳の時サッカーを始めた。", comment: sourceComment("Hope Test3 No.4", ""), hint: "", back: "Nakata Hidetoshi started playing soccer when he was eight." },
  { id: 4222, front: "The team (　　)(　　) in the gym when the earthquake struck.", translation: "地震が起きたとき，そのチームはジムでトレーニングをしていた。", comment: sourceComment("Hope Test3 No.5", ""), hint: "", back: "The team was training in the gym when the earthquake struck." },
  { id: 4223, front: "He (　　)(　　) the world record holder until last Sunday", translation: "彼は先週の日曜日まで世界記録保持者だったが，彼の記録はライバル走者によって破られた。", comment: sourceComment("Hope Test3 No.6", "Test3原本では英文が前半のみで終わっています。日本語には後半（記録が破られた内容）もありますが、問題文は原本どおり保持しています。"), hint: "", back: "He had been the world record holder until last Sunday" },
  { id: 4224, front: "The NBA regular season (　　) in October.", translation: "NBA のレギュラーシーズンは10月に始まる。", comment: sourceComment("Hope Test3 No.7", ""), hint: "", back: "The NBA regular season starts in October." },
  { id: 4225, front: "He (　　) surely win the next marathon.", translation: "彼はきっと次のマラソンで優勝するだろう。", comment: sourceComment("Hope Test3 No.8", ""), hint: "", back: "He will surely win the next marathon." },
  { id: 4226, front: "The tournament (　　)(　　)(　　) be held in Australia.", translation: "そのトーナメントはオーストラリアで開催される予定だ。", comment: sourceComment("Hope Test3 No.9", ""), hint: "", back: "The tournament is going to be held in Australia." },
  { id: 4227, front: "The table tennis player (　　)(　　)(　　) in China next year.", translation: "その卓球選手は来年は中国でプレーしているだろう。", comment: sourceComment("Hope Test3 No.10", ""), hint: "", back: "The table tennis player will be playing in China next year." },
];

export const hopeTest4Cards: Card[] = [
  { id: 4228, front: "We (　　)be careful with our social media posts.", translation: "私たちは自分のソーシャルメディアの投稿に注意しなければならない。", comment: sourceComment("Hope Test4 No.1", ""), hint: "", back: "We must be careful with our social media posts." },
  { id: 4229, front: "You (　　)(　　)have your smartphone off during the movie.", translation: "上映中は携帯電話の電源を切っておかなければならない。", comment: sourceComment("Hope Test4 No.2", ""), hint: "", back: "You have to have your smartphone off during the movie." },
  { id: 4230, front: "I’ve (　　)(　　) reply to a message from my friend.", translation: "友人からのメッセージに返信しなければならない。", comment: sourceComment("Hope Test4 No.3", ""), hint: "", back: "I’ve got to reply to a message from my friend." },
  { id: 4231, front: "You’d (　　) stop using your smartphone before going to bed.", translation: "寝る前に携帯電話を使うのをやめた方が良い。", comment: sourceComment("Hope Test4 No.4", ""), hint: "", back: "You’d better stop using your smartphone before going to bed." },
  { id: 4232, front: "I think people (　　)(　　) reply to emails quickly.", translation: "私はメールには早く返事をすべきだと思う。", comment: sourceComment("Hope Test4 No.5", ""), hint: "", back: "I think people should [ought to] reply to emails quickly." },
  { id: 4233, front: "We (　　)(　　) spend a lot of time checking social media.", translation: "ソーシャルメディアを確認するのに多くの時間を費やすべきではない。", comment: sourceComment("Hope Test4 No.6", ""), hint: "", back: "We should not [ought not to] spend a lot of time checking social media." },
  { id: 4234, front: "Using smartphones (　　)(　　) affect our sleep.", translation: "携帯電話を使いすぎることは睡眠に影響を与える可能性がある。", comment: sourceComment("Hope Test4 No.7", "Test4原本では空欄が2つありますが、Example Bank本文の該当箇所は could の1語です。空欄数は原本どおり保持しています。"), hint: "", back: "Using smartphones could affect our sleep." },
  { id: 4235, front: "Social media (　　) cause loneliness.", translation: "ソーシャルメディアは孤独をもたらすかもしれない。", comment: sourceComment("Hope Test4 No.8", ""), hint: "", back: "Social media may cause loneliness." },
  { id: 4236, front: "Social media (　　) be useful to get the latest information.", translation: "ソーシャルメディアは最新の情報を得るのに役立つかもしれない。", comment: sourceComment("Hope Test4 No.9", ""), hint: "", back: "Social media might be useful to get the latest information." },
  { id: 4237, front: "I (　　)(　　)(　　) the email address before sending.", translation: "送信する前にメールアドレスを確認するべきだった。", comment: sourceComment("Hope Test4 No.10", ""), hint: "", back: "I should have checked the email address before sending." },
  { id: 4238, front: "She (　　)(　　)(　　) the message to the wrong person.", translation: "彼女は間違った人にメッセージを送ってしまったかもしれない。", comment: sourceComment("Hope Test4 No.11", ""), hint: "", back: "She might have sent the message to the wrong person." },
];

export const hopeTest5Cards: Card[] = [
  { id: 4239, front: "There is (　　) concern about climate change.", translation: "気候変動について懸念が高まっている。", comment: sourceComment("Hope Test5 No.1", ""), hint: "", back: "There is growing concern about climate change." },
  { id: 4240, front: "This country depends on (　　) oil.", translation: "この国は輸入された石油に頼っている。", comment: sourceComment("Hope Test5 No.2", ""), hint: "", back: "This country depends on imported oil." },
  { id: 4241, front: "There are some scientists (　　)(　　)(　　)(　　) energy.", translation: "新しい形のエネルギーを研究している科学者がいる。", comment: sourceComment("Hope Test5 No.3", ""), hint: "", back: "There are some scientists studying new forms of energy." },
  { id: 4242, front: "Global warming is a serious problem (　　)(　　)(　　)(　　).", translation: "地球温暖化は人間の行動によって引き起こされる深刻な問題だ。", comment: sourceComment("Hope Test5 No.4", ""), hint: "", back: "Global warming is a serious problem caused by human activity." },
  { id: 4243, front: "Japan is a country (　　) few energy resources.", translation: "日本はエネルギー資源がほとんどない国だ。", comment: sourceComment("Hope Test5 No.5", ""), hint: "", back: "Japan is a country with few energy resources." },
  { id: 4244, front: "We couldn’t find evidence (　　)(　　)(　　)(　　).", translation: "私たちの理論を支える証拠が見つけられなかった。", comment: sourceComment("Hope Test5 No.6", ""), hint: "", back: "We couldn’t find evidence to support our theory." },
  { id: 4245, front: "We have a lot of work (　　)(　　) to solve environmental problems.", translation: "環境問題を解決するためにするべき仕事がたくさんある。", comment: sourceComment("Hope Test5 No.7", ""), hint: "", back: "We have a lot of work to do to solve environmental problems." },
  { id: 4246, front: "There are a variety of matters (　　)(　　)(　　) at the next conference on forest destruction.", translation: "次の森林破壊に関する会議で話し合われるべきさまざまな問題がある。", comment: sourceComment("Hope Test5 No.8", ""), hint: "", back: "There are a variety of matters to be discussed at the next conference on forest destruction." },
  { id: 4247, front: "They made an attempt (　　)(　　)(　　)(　　)(　　)(　　) use.", translation: "彼らはプラスチックの使用量を減らそうとした。", comment: sourceComment("Hope Test5 No.9", ""), hint: "", back: "They made an attempt to reduce the amount of plastic use." },
];

export const hopeTest6Cards: Card[] = [
  { id: 4248, front: "In Singapore, people (　　) throw trash on the road will be fined.", translation: "シンガポールでは，道にごみを捨てる人は罰金を課せられる。", comment: sourceComment("Hope Test6 No.1", ""), hint: "", back: "In Singapore, people who throw trash on the road will be fined." },
  { id: 4249, front: "There are some countries (　　) have several official languages.", translation: "公用語が複数ある国がある。", comment: sourceComment("Hope Test6 No.2", ""), hint: "", back: "There are some countries which have several official languages." },
  { id: 4250, front: "Switzerland is a country (　　) natural beauty attracts many tourists.", translation: "スイスは自然の美しさが多くの観光客を魅了している国だ。", comment: sourceComment("Hope Test6 No.3", ""), hint: "", back: "Switzerland is a country whose natural beauty attracts many tourists." },
  { id: 4251, front: "(　　) is famous about Japan is its manga culture.", translation: "日本について有名なのは漫画文化だ。", comment: sourceComment("Hope Test6 No.4", ""), hint: "", back: "What is famous about Japan is its manga culture." },
  { id: 4252, front: "India is a country (　　) a wide variety of religions and cultures can be found.", translation: "インドは多種多様な宗教や文化が見られる国だ。", comment: sourceComment("Hope Test6 No.5", ""), hint: "", back: "India is a country where a wide variety of religions and cultures can be found." },
  { id: 4253, front: "In Japan, Golden Week is a time (　　) many people travel.", translation: "日本ではゴールデンウイークは多くの人が旅行をする時期だ。", comment: sourceComment("Hope Test6 No.6", ""), hint: "", back: "In Japan, Golden Week is a time when many people travel." },
  { id: 4254, front: "One reason (　　) you should learn about local cultures is to make a trip more enjoyable.", translation: "地域の文化を学ぶべき１つの理由は旅をより楽しくすることだ。", comment: sourceComment("Hope Test6 No.7", ""), hint: "", back: "One reason why you should learn about local cultures is to make a trip more enjoyable." },
];

export const hopeExampleCards: Card[] = [...hopeLesson1Cards, ...hopeLesson2Cards, ...hopeLesson3Cards, ...hopeLesson4Cards, ...hopeLesson5Cards, ...hopeLesson6Cards, ...hopeLesson7Cards, ...hopeLesson8Cards, ...hopeLesson9Cards, ...hopeLesson10Cards, ...hopeLesson11Cards, ...hopeLesson12Cards];
export const hopeTestCards: Card[] = [...hopeTest1Cards, ...hopeTest2Cards, ...hopeTest3Cards, ...hopeTest4Cards, ...hopeTest5Cards, ...hopeTest6Cards];
