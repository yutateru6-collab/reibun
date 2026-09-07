import fs from 'node:fs';

const file = 'src/App.tsx';
let s = fs.readFileSync(file, 'utf8');

function once(oldText, newText, label) {
  const parts = s.split(oldText);
  if (parts.length !== 2) throw new Error(`${label}: expected exactly 1 match, found ${parts.length - 1}`);
  s = parts[0] + newText + parts[1];
}

once(
  "    if (currentDeck.id === 'yet-deck') {\n      cards = decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id));\n    }",
  "    if (currentDeck.id.endsWith('yet-deck')) {\n      cards = decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id));\n    }",
  'make yet review dynamic for basic and VQ review decks'
);

const vqStart = s.indexOf("  if (appMode === 'vision_quest') {");
const homeStart = s.indexOf("  if (appMode === 'home') {", vqStart);
if (vqStart < 0 || homeStart < 0) throw new Error('VQ/Home screen boundaries not found');
let vqBlock = s.slice(vqStart, homeStart);
const vqOld = "                    id: 'yet-deck',\n                    title: '「まだ」の復習デッキ',\n                    description: '「まだ」と評価した例文の集中復習',\n                    cards: decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id))";
const vqNew = "                    id: 'vq-yet-deck',\n                    title: '「まだ」の復習デッキ',\n                    description: '「まだ」と評価した例文の集中復習',\n                    cards: decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id))";
if ((vqBlock.split(vqOld).length - 1) !== 1) throw new Error(`VQ yet deck: expected exactly 1 match inside VQ block`);
vqBlock = vqBlock.replace(vqOld, vqNew);
s = s.slice(0, vqStart) + vqBlock + s.slice(homeStart);

once(
  '      <div className="w-full max-w-2xl flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-3">\n        <div className="flex items-center gap-2 md:gap-3">',
  '      <div className="w-full max-w-2xl flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center mb-6 md:mb-8 gap-3">\n        <div className="w-full sm:w-auto flex items-center gap-2 md:gap-3">',
  'mobile study header layout'
);

once(
  '          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-none">\n            {currentDeck.title} {isMemorize && "(答えから)"}\n          </h1>',
  '          <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white leading-tight whitespace-normal break-words flex-1 min-w-0">\n            {currentDeck.title} {isMemorize && "(答えから)"}\n          </h1>',
  'show full study title on mobile'
);

once(
  '        <div className="flex items-center gap-1 md:gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">',
  '        <div className="self-end sm:self-auto flex items-center gap-1 md:gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">',
  'align mobile controls below title'
);

fs.writeFileSync(file, s);
console.log('Applied follow-up mobile header and VQ review navigation fixes.');
