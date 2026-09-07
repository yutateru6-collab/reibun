import fs from 'node:fs';

const appPath = 'src/App.tsx';
const indexPath = 'index.html';
const manifestPath = 'public/manifest.json';
const miniPath = 'src/data/hope_mini_explanations.ts';

let app = fs.readFileSync(appPath, 'utf8');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
let mini = fs.readFileSync(miniPath, 'utf8');

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly 1 match, got ${count}`);
  }
  return source.replace(from, to);
}

function replaceAllChecked(source, from, to, label, min = 1) {
  const count = source.split(from).length - 1;
  if (count < min) {
    throw new Error(`${label}: expected at least ${min} matches, got ${count}`);
  }
  return source.split(from).join(to);
}

// 0) Explicit preservation guard: the user asked to keep the current Hope card face
// behavior (English + Japanese visible together) unchanged for now.
const preservedFaceMarker = `(!isMemorize && !isFlipped) || (isMemorize && isFlipped) ? (`;
if (!app.includes(preservedFaceMarker) || !app.includes('{currentCard.front}') || !app.includes('{currentCard.translation}')) {
  throw new Error('Could not verify the intentionally preserved normal-card face behavior.');
}

// 1) Midterm wording + responsive heading.
app = replaceOnce(
  app,
  '<h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">⚡️期末試験対策⚡️</h1>',
  '<h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 px-10 sm:px-0">⚡️中間試験対策⚡️</h1>',
  'midterm responsive title'
);

// 2) Keep older Vision Quest units available, but collapsed by default.
app = replaceOnce(
  app,
  "  const [basicTab, setBasicTab] = useState<'sentences' | 'tests'>('sentences');",
  "  const [basicTab, setBasicTab] = useState<'sentences' | 'tests'>('sentences');\n  const [showOlderVisionQuest, setShowOlderVisionQuest] = useState(false);",
  'older Vision Quest state'
);

app = replaceAllChecked(
  app,
  'visionQuestSentenceDecks.map((deck) => (',
  'visionQuestSentenceDecks.slice(0, showOlderVisionQuest ? undefined : 1).map((deck) => (',
  'sentence deck collapse map'
);
app = replaceAllChecked(
  app,
  'visionQuestQuestionDecks.map((deck) => (',
  'visionQuestQuestionDecks.slice(0, showOlderVisionQuest ? undefined : 1).map((deck) => (',
  'question deck collapse map'
);

app = replaceOnce(
  app,
  "          {visionQuestTab === 'sentences' && (",
  `          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowOlderVisionQuest((prev) => !prev)}
              aria-expanded={showOlderVisionQuest}
              className="min-h-11 px-5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-sm font-bold text-purple-700 dark:text-purple-300 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              {showOlderVisionQuest ? '以前の範囲を閉じる ▲' : '以前の範囲を見る ▼'}
            </button>
          </div>

          {visionQuestTab === 'sentences' && (`,
  'older Vision Quest toggle'
);

// 3) Basic lesson cards: compact, show counts, remove the dead placeholder.
app = replaceOnce(
  app,
  'className="group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"',
  'className="group relative bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"',
  'compact basic lesson card'
);
app = replaceOnce(
  app,
  `                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.title}
                </h2>
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400">`,
  `                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  {deck.description} ・ {deck.cards.length}{basicTab === 'sentences' ? '文' : '問'}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">`,
  'basic lesson metadata'
);
app = replaceOnce(
  app,
  `            
            {/* Placeholder for future decks */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center opacity-60">
              <p className="text-slate-400 dark:text-slate-500 font-medium italic">
                新しいデッキを準備中...
              </p>
            </div>`,
  '',
  'remove future deck placeholder'
);
app = replaceOnce(
  app,
  '現在 {favorites.length} 個 of カードがお気に入りに登録されています。',
  '現在 {favorites.length} 個のカードがお気に入りに登録されています。',
  'favorites Japanese typo'
);

// 4) Word-order mode: use a canonical answer for bracketed alternatives while preserving display text.
app = replaceOnce(
  app,
  'const GREETING_MESSAGES = [',
  `function canonicalQuizAnswer(answer: string): string {
  return answer
    .replace(/\\s*\\[[^\\]]+\\]/g, '')
    .replace(/\\s+/g, ' ')
    .trim();
}

const GREETING_MESSAGES = [`,
  'canonical quiz helper'
);
app = replaceOnce(
  app,
  "    const words = card.back.split(' ').map((word, index) => ({ id: index, word }));",
  "    const words = canonicalQuizAnswer(card.back).split(' ').map((word, index) => ({ id: index, word }));",
  'word pool canonical answer'
);
app = replaceOnce(
  app,
  '    const currentSentence = quizCards[quizIndex].back;',
  '    const currentSentence = canonicalQuizAnswer(quizCards[quizIndex].back);',
  'word order checking canonical answer'
);

// 5) Hope mini explanations in self-assessment and time attack too; keep official-test source blocks out.
app = replaceAllChecked(
  app,
  "(currentDeck.id.startsWith('vq-') && quizCard.comment)",
  "((currentDeck.id.startsWith('vq-') || currentDeck.id.startsWith('hope-lesson')) && quizCard.comment)",
  'quiz mini explanation condition',
  2
);
app = replaceAllChecked(
  app,
  '<span>💡 ぽいんと</span>',
  `<span>{currentDeck.id.startsWith('hope-lesson') ? '💡 ミニ解説' : '💡 ぽいんと'}</span>`,
  'quiz explanation labels',
  2
);

// 6) Rename Hope's "hint" affordance and improve mini explanation readability without changing content.
app = replaceOnce(
  app,
  `                        <Lightbulb size={18} />
                        ヒント`,
  `                        <Lightbulb size={18} />
                        {currentDeck.id.startsWith('hope-lesson') ? 'ミニ解説を見る' : 'ヒント'}`,
  'mini explanation button label'
);
app = replaceOnce(
  app,
  'className="text-sm md:text-base font-bold italic whitespace-pre-wrap"',
  'className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed"',
  'mini explanation typography'
);
app = replaceOnce(
  app,
  `{currentCard.comment.replace(/^\\(|\\)$/g, '')}`,
  `{currentDeck.id.startsWith('hope-lesson')
                              ? currentCard.comment.replace(/^\\(|\\)$/g, '').replace(/\\n([^\\n]+)$/, '\\n\\n$1')
                              : currentCard.comment.replace(/^\\(|\\)$/g, '')}`,
  'mini explanation spacing'
);

// 7) Touch targets, readable microcopy, contrast.
app = replaceAllChecked(
  app,
  'className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700',
  'className="min-w-11 min-h-11 p-2.5 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700',
  'theme touch targets'
);
app = replaceAllChecked(
  app,
  'className="shrink-0 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700',
  'className="shrink-0 min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700',
  'home back touch target'
);
app = replaceAllChecked(
  app,
  'className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"',
  'className="min-w-11 min-h-11 p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"',
  'study back touch target'
);
app = replaceAllChecked(
  app,
  'p-1 md:p-1.5 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[46px] md:min-w-[52px]',
  'p-1.5 md:p-2 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[48px] min-h-11 md:min-w-[54px]',
  'study control touch targets',
  3
);
app = replaceAllChecked(
  app,
  'flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all active:scale-95',
  'flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-xl border transition-all active:scale-95',
  'favorite and yet touch targets',
  2
);
app = replaceAllChecked(app, 'text-[9px]', 'text-[11px]', '9px microcopy');
app = replaceAllChecked(app, 'text-[10px]', 'text-xs', '10px microcopy');
app = replaceAllChecked(
  app,
  'text-slate-500 dark:text-slate-400',
  'text-slate-600 dark:text-slate-300',
  'subtle text contrast'
);
app = replaceAllChecked(
  app,
  'text-slate-400 dark:text-slate-500',
  'text-slate-600 dark:text-slate-400',
  'muted text contrast'
);
app = replaceAllChecked(
  app,
  'text-slate-300 dark:text-slate-600',
  'text-slate-500 dark:text-slate-400',
  'very muted text contrast'
);
app = replaceAllChecked(
  app,
  'text-emerald-500 dark:text-emerald-400',
  'text-emerald-700 dark:text-emerald-300',
  'emerald text contrast'
);
app = replaceAllChecked(
  app,
  'bg-rose-500 hover:bg-rose-600 text-white',
  'bg-rose-700 hover:bg-rose-800 text-white',
  'rose button contrast'
);

// 8) Accessibility names. Repeated theme buttons all get an explicit accessible name.
app = replaceAllChecked(
  app,
  'onClick={() => setIsDarkMode(!isDarkMode)}\n',
  'onClick={() => setIsDarkMode(!isDarkMode)}\n              aria-label="テーマ切り替え"\n',
  'theme aria labels'
);
app = replaceOnce(
  app,
  `onClick={() => { 
                  const isVisionQuest = currentDeck?.id.startsWith('vq-');`,
  `onClick={() => { 
                  const isVisionQuest = currentDeck?.id.startsWith('vq-');`,
  'menu back marker'
);
// Add aria-label to the menu back button using its unique class boundary.
app = replaceOnce(
  app,
  `              <button 
                onClick={() => { 
                  const isVisionQuest = currentDeck?.id.startsWith('vq-');`,
  `              <button 
                aria-label="教材一覧へ戻る"
                onClick={() => { 
                  const isVisionQuest = currentDeck?.id.startsWith('vq-');`,
  'menu back aria label'
);
app = replaceOnce(
  app,
  `          <button 
            onClick={() => { setAppMode('menu'); }}
            className="min-w-11 min-h-11 p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"`,
  `          <button 
            aria-label="学習モード選択へ戻る"
            onClick={() => { setAppMode('menu'); }}
            className="min-w-11 min-h-11 p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"`,
  'study back aria label'
);
app = replaceAllChecked(
  app,
  `<button onClick={() => setAppMode('menu')} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">`,
  `<button aria-label="学習モード選択へ戻る" onClick={() => setAppMode('menu')} className="min-w-11 min-h-11 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">`,
  'quiz back aria labels',
  3
);
app = replaceOnce(
  app,
  `            <button 
              onClick={handlePrev}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"`,
  `            <button 
              aria-label="前のカードへ"
              onClick={handlePrev}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"`,
  'previous card aria label'
);
app = replaceOnce(
  app,
  `            <button 
              onClick={handleNext}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"`,
  `            <button 
              aria-label="次のカードへ"
              onClick={handleNext}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"`,
  'next card aria label'
);
app = replaceOnce(
  app,
  `<select 
                    value={timeLimit}`,
  `<select 
                    aria-label="問題を考える時間"
                    value={timeLimit}`,
  'time limit select label'
);
app = replaceOnce(
  app,
  `<select 
                    value={resultDisplayTime}`,
  `<select 
                    aria-label="答えを表示する時間"
                    value={resultDisplayTime}`,
  'result display select label'
);

// 9) One mini-explanation wording fix identified during review.
mini = replaceOnce(
  mini,
  'couldn’t have studied で「勉強できなかっただろう」',
  'couldn’t have studied abroad で「留学できなかっただろう」',
  'Without support mini explanation accuracy'
);

// 10) Mobile zoom + Japanese/PWA metadata. No change to learning card face.
indexHtml = replaceOnce(indexHtml, '<html lang="en">', '<html lang="ja">', 'html lang');
indexHtml = replaceOnce(
  indexHtml,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  'mobile viewport zoom'
);
indexHtml = replaceOnce(
  indexHtml,
  '<link rel="apple-touch-icon" href="https://picsum.photos/seed/flashcard/192/192" />',
  '<link rel="icon" href="/icon.svg" type="image/svg+xml" />',
  'local app icon'
);
indexHtml = replaceOnce(indexHtml, '<title>Flashcard App</title>', '<title>例文マスター｜中間試験対策</title>', 'document title');

const manifest = {
  name: '例文マスター｜中間試験対策',
  short_name: '例文マスター',
  description: '暗唱例文とVision Questの試験範囲を、カード・穴埋め・語順・タイムアタックで反復できる学習アプリ。',
  start_url: '/',
  display: 'standalone',
  background_color: '#f8fafc',
  theme_color: '#4f46e5',
  icons: [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any maskable'
    }
  ]
};

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="例文マスター">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f46e5"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <rect x="104" y="118" width="304" height="276" rx="48" fill="#fff" opacity=".96"/>
  <path d="M162 201h188M162 256h152M162 311h172" stroke="#4f46e5" stroke-width="26" stroke-linecap="round"/>
  <path d="M339 118 279 240h62l-72 154 139-184h-68l63-92z" fill="#facc15"/>
</svg>\n`;

// 11) Preservation guard again after modifications.
if (!app.includes(preservedFaceMarker)) {
  throw new Error('Preserved card-face marker changed unexpectedly.');
}
const normalDeckBlockStart = app.indexOf('// --- 通常のデッキ用の表示（既存のロジック） ---');
const normalDeckBlock = app.slice(normalDeckBlockStart, normalDeckBlockStart + 1800);
if (!normalDeckBlock.includes('{currentCard.front}') || !normalDeckBlock.includes('{currentCard.translation}')) {
  throw new Error('Normal Hope card face no longer contains both English and Japanese; this change is intentionally on hold.');
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(indexPath, indexHtml);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(miniPath, mini);
fs.writeFileSync('public/icon.svg', iconSvg);

console.log(JSON.stringify({
  applied: true,
  preservedOnHoldItem: 'Hope normal-card face still shows English + Japanese together',
  fixes: [
    'midterm responsive title',
    'older VQ ranges collapsed by default',
    'compact lesson list with counts',
    'canonical word-order answers for bracketed alternatives',
    'Hope mini explanations in self/time modes',
    'mini explanation affordance and typography',
    'larger touch targets and microcopy',
    'contrast improvements',
    'accessible button/select names',
    'mobile zoom re-enabled',
    'Japanese/PWA metadata and local icon',
    'one mini-explanation wording correction'
  ]
}, null, 2));
