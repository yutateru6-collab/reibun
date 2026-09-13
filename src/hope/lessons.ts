import { basicExampleDecks, basicTestDecks, type Deck } from '../data/cards';

export interface HopeLesson {
  id: string;
  title: string;
  examples: Deck;
  cloze?: Deck;
}

// A view over existing source decks, NOT a content or storage migration.
// Keep original sentence/question IDs, answer variants and stored review IDs intact.
export const HOPE_LESSONS: HopeLesson[] = basicExampleDecks.map(examples => ({
  id: examples.id,
  title: examples.title,
  examples,
  cloze: basicTestDecks.find(test => test.id === examples.id.replace('hope-lesson', 'hope-test')),
}));

const byDeckId = new Map<string, HopeLesson>();
for (const lesson of HOPE_LESSONS) {
  byDeckId.set(lesson.examples.id, lesson);
  if (lesson.cloze) byDeckId.set(lesson.cloze.id, lesson);
}

export function getHopeLessonForDeck(deck: Deck | null): HopeLesson | undefined {
  // Do not turn a custom favorites/mistakes subset back into a full lesson.
  return deck ? byDeckId.get(deck.id) : undefined;
}

export const HOPE_JAPANESE_FIRST_KEY = 'reibun:hope:japanese-first:v1';
