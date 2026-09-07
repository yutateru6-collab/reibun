import fs from 'node:fs';

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

const heldMarker = `(!isMemorize && !isFlipped) || (isMemorize && isFlipped) ? (`;
if (!app.includes(heldMarker)) {
  throw new Error('Held Hope card-face behavior could not be verified.');
}

const oldTitle = '<h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 px-10 sm:px-0">⚡️中間試験対策⚡️</h1>';
const newTitle = `<div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 px-12 sm:px-0 whitespace-nowrap" aria-label="中間試験対策">
              <span aria-hidden="true" className="text-2xl sm:text-3xl md:text-4xl">⚡️</span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">中間試験対策</h1>
              <span aria-hidden="true" className="text-2xl sm:text-3xl md:text-4xl">⚡️</span>
            </div>`;

if (app.includes(oldTitle)) {
  app = app.replace(oldTitle, newTitle);
} else if (!app.includes('aria-label="中間試験対策"')) {
  throw new Error('Could not find either old or already-fixed responsive title.');
}

const blockStart = app.indexOf('// --- 通常のデッキ用の表示（既存のロジック） ---');
const block = app.slice(blockStart, blockStart + 1800);
if (!block.includes('{currentCard.front}') || !block.includes('{currentCard.translation}')) {
  throw new Error('Held item changed unexpectedly: Hope normal-card face must still show English + Japanese together.');
}

fs.writeFileSync(appPath, app);
console.log(JSON.stringify({ responsiveTitle: 'fixed', heldCardFace: 'unchanged' }, null, 2));
