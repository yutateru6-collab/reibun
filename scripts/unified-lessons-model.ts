import assert from 'node:assert/strict';
import { HOPE_LESSONS, getHopeLessonForDeck } from '../src/hope/lessons';
import { basicExampleDecks, basicTestDecks } from '../src/data/cards';
const before = JSON.stringify({ basicExampleDecks, basicTestDecks });
assert.equal(HOPE_LESSONS.length, 12);
assert.equal(HOPE_LESSONS.reduce((n,l) => n+l.examples.cards.length,0),110);
assert.equal(HOPE_LESSONS.reduce((n,l) => n+(l.cloze?.cards.length??0),0),54);
HOPE_LESSONS.forEach((lesson,i) => {
  assert.equal(lesson.title, `Lesson ${i+1}`);
  assert.equal(lesson.examples,basicExampleDecks[i]);
  assert.equal(getHopeLessonForDeck(lesson.examples),lesson);
  if(i<6) {
    assert.equal(lesson.cloze,basicTestDecks[i]);
    assert.equal(getHopeLessonForDeck(lesson.cloze!),lesson);
    assert.deepEqual(lesson.cloze!.cards.map(c=>c.id-200),lesson.examples.cards.map(c=>c.id));
    lesson.cloze!.cards.forEach((c,n) => {
      // The supplied Test3 item 6 ends early; keep that original discrepancy instead of filling it in.
      if(c.id===4223) assert(lesson.examples.cards[n].back.startsWith(c.back));
      else assert.equal(c.back,lesson.examples.cards[n].back);
    });
  } else assert.equal(lesson.cloze,undefined);
});
assert.equal(getHopeLessonForDeck(null),undefined);
assert.equal(getHopeLessonForDeck({...basicExampleDecks[0],id:'favorite-deck'}),undefined);
assert.equal(getHopeLessonForDeck({...basicExampleDecks[0],id:'hope-lesson1-mistakes'}),undefined);
assert.equal(before,JSON.stringify({basicExampleDecks,basicTestDecks}));
console.log('PASS: 12 unified lessons / 110 unchanged examples / 54 unchanged cloze questions / no fabricated cloze for 7–12 / original IDs retained');
