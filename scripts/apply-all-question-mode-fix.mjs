import fs from 'node:fs';

const file = 'src/App.tsx';
let s = fs.readFileSync(file, 'utf8');

function once(oldText, newText, label) {
  const parts = s.split(oldText);
  if (parts.length !== 2) throw new Error(`${label}: expected exactly 1 match, found ${parts.length - 1}`);
  s = parts[0] + newText + parts[1];
}

once(
`const VISION_QUEST_CARD_IDS = new Set(
  [...visionQuestSentenceDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))
);

const isVisionQuestQuestionCard = (card?: Card) => Boolean(card && VISION_QUEST_QUESTION_CARD_IDS.has(card.id));
const isVisionQuestCard = (card?: Card) => Boolean(card && VISION_QUEST_CARD_IDS.has(card.id));
const sourcePromptOrTranslation = (card: Card) => isVisionQuestQuestionCard(card) ? card.front : card.translation;
const answerMeaning = (card: Card) => isVisionQuestQuestionCard(card) ? highlightAnswers(card.front, card.back) : card.translation;`,
`const VISION_QUEST_CARD_IDS = new Set(
  [...visionQuestSentenceDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))
);
const OFFICIAL_QUESTION_CARD_IDS = new Set(
  [...basicTestDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))
);

const isVisionQuestQuestionCard = (card?: Card) => Boolean(card && VISION_QUEST_QUESTION_CARD_IDS.has(card.id));
const isVisionQuestCard = (card?: Card) => Boolean(card && VISION_QUEST_CARD_IDS.has(card.id));
const isOfficialQuestionCard = (card?: Card) => Boolean(card && OFFICIAL_QUESTION_CARD_IDS.has(card.id));
const sourcePromptOrTranslation = (card: Card) => isVisionQuestQuestionCard(card) ? card.front : card.translation;
const officialQuestionPrompt = (card: Card) => isVisionQuestQuestionCard(card) ? card.front : card.front + '\\n' + card.translation;
const answerMeaning = (card: Card) => isOfficialQuestionCard(card) ? highlightAnswers(card.front, card.back) : card.translation;`,
'question card helpers');

once(
`  const currentCard = activeCards[currentIndex];
  const isCurrentDeckVqQuestion = currentDeck ? currentDeck.cards.length > 0 && currentDeck.cards.every(card => isVisionQuestQuestionCard(card)) : false;`,
`  const currentCard = activeCards[currentIndex];
  const isCurrentDeckQuestion = currentDeck ? currentDeck.cards.length > 0 && currentDeck.cards.every(card => isOfficialQuestionCard(card)) : false;`,
'current deck question semantics');

s = s.replaceAll('isCurrentDeckVqQuestion', 'isCurrentDeckQuestion');

s = s.replaceAll("{isVisionQuestQuestionCard(quizCard) ? '問題' : '英語'}", "{isOfficialQuestionCard(quizCard) ? '問題' : '英語'}");
s = s.replaceAll("{isVisionQuestQuestionCard(quizCard) ? quizCard.front : quizCard.back}", "{isOfficialQuestionCard(quizCard) ? officialQuestionPrompt(quizCard) : quizCard.back}");
s = s.replaceAll("{isVisionQuestQuestionCard(quizCard) ? '解答' : '日本語訳'}", "{isOfficialQuestionCard(quizCard) ? '解答' : '日本語訳'}");
s = s.replaceAll("{isVisionQuestQuestionCard(quizCard) ? '解答' : '日本語での意味'}", "{isOfficialQuestionCard(quizCard) ? '解答' : '日本語での意味'}");

fs.writeFileSync(file, s);
console.log('Applied official-question semantics to VQ questions and Hope official tests.');
