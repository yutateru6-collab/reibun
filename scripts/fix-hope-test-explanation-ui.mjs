import fs from 'node:fs';

const path = 'src/App.tsx';
let app = fs.readFileSync(path, 'utf8');
const from = "currentDeck.id.startsWith('hope-lesson')";
const to = "currentDeck.id.startsWith('hope-')";
const count = app.split(from).length - 1;

if (count < 4) {
  throw new Error(`Expected at least 4 Hope lesson UI predicates, found ${count}`);
}

app = app.split(from).join(to);
if (app.includes(from)) throw new Error('Not all Hope lesson UI predicates were replaced');

fs.writeFileSync(path, app);
console.log(JSON.stringify({ replacedHopeLessonPredicates: count, newPredicate: to }, null, 2));
