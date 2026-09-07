import fs from 'node:fs';

const file = 'src/App.tsx';
let s = fs.readFileSync(file, 'utf8');

function once(oldText, newText, label) {
  const parts = s.split(oldText);
  if (parts.length !== 2) throw new Error(`${label}: expected exactly 1 match, found ${parts.length - 1}`);
  s = parts[0] + newText + parts[1];
}
function first(oldText, newText, label) {
  const i = s.indexOf(oldText);
  if (i < 0) throw new Error(`${label}: pattern not found`);
  s = s.slice(0, i) + newText + s.slice(i + oldText.length);
}

once(
  "const YET_STORAGE_KEY = `flashcard-yet-list:${CONTENT_VERSION}`;\n",
  "const YET_STORAGE_KEY = `flashcard-yet-list:${CONTENT_VERSION}`;\n\nconst VISION_QUEST_QUESTION_CARD_IDS = new Set(\n  visionQuestQuestionDecks.flatMap(deck => deck.cards.map(card => card.id))\n);\nconst VISION_QUEST_CARD_IDS = new Set(\n  [...visionQuestSentenceDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))\n);\n\nconst isVisionQuestQuestionCard = (card?: Card) => Boolean(card && VISION_QUEST_QUESTION_CARD_IDS.has(card.id));\nconst isVisionQuestCard = (card?: Card) => Boolean(card && VISION_QUEST_CARD_IDS.has(card.id));\nconst sourcePromptOrTranslation = (card: Card) => isVisionQuestQuestionCard(card) ? card.front : card.translation;\nconst answerMeaning = (card: Card) => isVisionQuestQuestionCard(card) ? highlightAnswers(card.front, card.back) : card.translation;\n",
  'insert VQ card helpers'
);

once(
  "  const currentCard = activeCards[currentIndex];\n",
  "  const currentCard = activeCards[currentIndex];\n  const isCurrentDeckVqQuestion = currentDeck ? currentDeck.cards.length > 0 && currentDeck.cards.every(card => isVisionQuestQuestionCard(card)) : false;\n",
  'insert current deck question flag'
);

once(
  '<h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">{currentDeck.title}</h1>',
  '<h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-tight whitespace-normal break-words">{currentDeck.title}</h1>',
  'mobile menu title should wrap instead of truncate'
);

once(
  '<h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">単語カード</h2>\n                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">おもて↔裏で確認</p>',
  '<h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{isCurrentDeckVqQuestion ? \'問題カード\' : \'単語カード\'}</h2>\n                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">{isCurrentDeckVqQuestion ? \'問題→解答で確認\' : \'おもて↔裏で確認\'}</p>',
  'context aware standard mode label'
);

once(
  '<p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">英文→和訳で定着</p>',
  '<p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">{isCurrentDeckVqQuestion ? \'解答→元の問題で逆確認\' : \'英文→和訳で定着\'}</p>',
  'context aware memorize mode label'
);

once(
  "            {currentDeck.id.startsWith('vq-') ? (\n              // --- Vision Quest デッキ用の表示 ---",
  "            {isVisionQuestCard(currentCard) ? (\n              // --- Vision Quest デッキ用の表示 ---",
  'render VQ cards correctly even from mixed review decks'
);

once(
  '                    // 通常単語カード（和 ➔ 英）：表面は日本語訳のみ\n                    <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 my-8 leading-relaxed">\n                      {currentCard.translation}\n                    </p>',
  '                    // 通常カード。VQ問題デッキは公式の問題文そのものを表示する。\n                    <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 my-8 leading-relaxed whitespace-pre-wrap">\n                      {sourcePromptOrTranslation(currentCard)}\n                    </p>',
  'VQ standard front must show actual problem'
);

once(
  '                    タップして{isMemorize ? "日本語訳" : "完成文"}を見る',
  '                    タップして{isMemorize ? (isVisionQuestQuestionCard(currentCard) ? "元の問題" : "日本語訳") : (isVisionQuestQuestionCard(currentCard) ? "解答" : "完成文")}を見る',
  'VQ card tap label'
);

first(
  '<span className="text-xl md:text-2xl">✅</span> 完成文',
  '<span className="text-xl md:text-2xl">✅</span> {isVisionQuestQuestionCard(currentCard) ? \'解答\' : \'完成文\'}',
  'VQ back heading'
);

first(
  '<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-8">\n                    {currentCard.translation}\n                  </p>',
  '<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-8 whitespace-pre-wrap">\n                    {sourcePromptOrTranslation(currentCard)}\n                  </p>',
  'VQ answer side source prompt'
);

once(
  '<span className="text-xs font-extrabold tracking-wider">\n                  {favorites.includes(currentCard.id) ? \'お気に入り登録中\' : \'お気に入り登録\'}\n                </span>',
  '<span className="text-[10px] sm:text-xs font-extrabold tracking-tight sm:tracking-wider whitespace-nowrap">\n                  <span className="sm:hidden">{favorites.includes(currentCard.id) ? \'★登録中\' : \'お気に入り\'}</span>\n                  <span className="hidden sm:inline">{favorites.includes(currentCard.id) ? \'お気に入り登録中\' : \'お気に入り登録\'}</span>\n                </span>',
  'favorite mobile label'
);

once(
  '<span className="text-xs font-extrabold tracking-wider">\n                  {yetList.includes(currentCard.id) ? \'「まだ」登録中\' : \'「まだ」リスト追加\'}\n                </span>',
  '<span className="text-[10px] sm:text-xs font-extrabold tracking-tight sm:tracking-wider whitespace-nowrap">\n                  <span className="sm:hidden">{yetList.includes(currentCard.id) ? \'まだ登録中\' : \'まだ追加\'}</span>\n                  <span className="hidden sm:inline">{yetList.includes(currentCard.id) ? \'「まだ」登録中\' : \'「まだ」リスト追加\'}</span>\n                </span>',
  'yet mobile label'
);

// SELF TEST: VQ question cards must present the source exercise first and reveal its answer.
first(
  '<span className="text-lg">📢</span> 英語\n              </div>\n              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed">\n                {quizCard.back}\n              </p>\n              <p className="text-sm text-slate-400 mt-12 animate-pulse font-medium">タップして日本語訳を見る</p>',
  '<span className="text-lg">📢</span> {isVisionQuestQuestionCard(quizCard) ? \'問題\' : \'英語\'}\n              </div>\n              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed whitespace-pre-wrap">\n                {isVisionQuestQuestionCard(quizCard) ? quizCard.front : quizCard.back}\n              </p>\n              <p className="text-sm text-slate-400 mt-12 animate-pulse font-medium">タップして{isVisionQuestQuestionCard(quizCard) ? \'解答\' : \'日本語訳\'}を見る</p>',
  'self test question front'
);
first(
  '<span className="text-lg">💡</span> 日本語での意味\n              </div>\n              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed">\n                {quizCard.translation}\n              </p>\n              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>\n              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-12">\n                {quizCard.back}\n              </p>',
  '<span className="text-lg">💡</span> {isVisionQuestQuestionCard(quizCard) ? \'解答\' : \'日本語での意味\'}\n              </div>\n              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed whitespace-pre-wrap">\n                {answerMeaning(quizCard)}\n              </p>\n              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>\n              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-12 whitespace-pre-wrap">\n                {isVisionQuestQuestionCard(quizCard) ? quizCard.front : quizCard.back}\n              </p>',
  'self test answer'
);

// TIME ATTACK: same source-question semantics.
first(
  '<span className="text-lg">📢</span> 英語\n              </div>\n              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed">\n                {quizCard.back}\n              </p>\n              <p className="text-sm font-bold text-rose-500 mt-12 animate-pulse">時間内に日本語訳を思い出せ！</p>',
  '<span className="text-lg">📢</span> {isVisionQuestQuestionCard(quizCard) ? \'問題\' : \'英語\'}\n              </div>\n              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed whitespace-pre-wrap">\n                {isVisionQuestQuestionCard(quizCard) ? quizCard.front : quizCard.back}\n              </p>\n              <p className="text-sm font-bold text-rose-500 mt-12 animate-pulse">時間内に{isVisionQuestQuestionCard(quizCard) ? \'解答\' : \'日本語訳\'}を思い出せ！</p>',
  'time attack question front'
);
first(
  '<span className="text-lg">💡</span> 日本語での意味\n              </div>\n              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed">\n                {quizCard.translation}\n              </p>\n              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>\n              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-8">\n                {quizCard.back}\n              </p>',
  '<span className="text-lg">💡</span> {isVisionQuestQuestionCard(quizCard) ? \'解答\' : \'日本語での意味\'}\n              </div>\n              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed whitespace-pre-wrap">\n                {answerMeaning(quizCard)}\n              </p>\n              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>\n              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-8 whitespace-pre-wrap">\n                {isVisionQuestQuestionCard(quizCard) ? quizCard.front : quizCard.back}\n              </p>',
  'time attack answer'
);

once(
  '<p className="text-slate-600 dark:text-slate-400 mb-4">{quizCard.translation}</p>',
  '<p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">{sourcePromptOrTranslation(quizCard)}</p>',
  'order mode prompt'
);

// Quiz comments and highlighted answers must follow the card type, not the container deck id.
s = s.replaceAll("((currentDeck.id.startsWith('vq-') || currentDeck.id.startsWith('hope-')) && quizCard.comment)", "((isVisionQuestCard(quizCard) || currentDeck.id.startsWith('hope-')) && quizCard.comment)");
s = s.replaceAll("{currentDeck.id.startsWith('vq-') ? highlightAnswers(quizCard.front, quizCard.back) : quizCard.back}", "{isVisionQuestCard(quizCard) ? highlightAnswers(quizCard.front, quizCard.back) : quizCard.back}");

fs.writeFileSync(file, s);
console.log('Applied VQ question rendering + mobile layout fixes to src/App.tsx');
