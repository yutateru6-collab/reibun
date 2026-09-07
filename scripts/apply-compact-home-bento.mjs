import fs from 'node:fs';

const path = 'src/App.tsx';
let app = fs.readFileSync(path, 'utf8');

if (app.includes('data-ui="compact-home-bento-v1"')) {
  console.log('compact-home-bento-v1 already applied');
  process.exit(0);
}

const topStart = app.indexOf('  // Top Screen (Course Selection)');
const topEnd = app.indexOf('  // Vision Quest Placeholder', topStart);
if (topStart < 0 || topEnd < 0) throw new Error('Top screen markers not found');

const compactTop = String.raw`  // Top Screen (Course Selection)
  if (appMode === 'top') {
    return (
      <div data-ui="compact-home-bento-v1" className="min-h-[100dvh] flex flex-col items-center px-3 py-3 sm:px-4 sm:py-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="テーマ切り替え"
              className="min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="テーマ切り替え"
            >
              {isDarkMode ? <Sun size={19} /> : <MoonStar size={19} />}
            </button>
          </div>

          <div className="text-center w-full max-w-2xl px-1 pt-1 sm:pt-2">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 pr-10 sm:pr-0 whitespace-nowrap" aria-label="中間試験対策">
              <span aria-hidden="true" className="text-lg sm:text-2xl">⚡️</span>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">中間試験対策</h1>
              <span aria-hidden="true" className="text-lg sm:text-2xl">⚡️</span>
            </div>

            <div className="mb-4 text-center py-2.5 sm:py-3 px-3 bg-white/60 dark:bg-slate-800/45 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm animate-fade-in backdrop-blur-md">
              <div className="inline-block mb-1.5 px-2.5 py-0.5 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 rounded-full text-[9px] sm:text-[10px] font-black border border-yellow-300 dark:border-yellow-800 tracking-wider">
                TODAY'S MOOD
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight leading-tight">
                {greeting.main}
              </h2>
              <p className="text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] sm:text-xs leading-snug max-w-xl mx-auto">
                {greeting.sub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-3xl">
            <button
              onClick={() => setAppMode('home')}
              className="group min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-sm border-2 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <GraduationCap size={26} />
              </div>
              <h2 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white mb-1 leading-tight">基本例文<br className="sm:hidden" />マスター</h2>
              <p className="text-slate-600 dark:text-slate-300 text-center text-[10px] sm:text-xs leading-snug">暗唱例文を反復</p>
            </button>

            <button
              onClick={() => setAppMode('vision_quest')}
              className="group min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-sm border-2 border-purple-100 dark:border-purple-900/40 hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Brain size={26} />
              </div>
              <h2 className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 mb-1 leading-tight tracking-wide">VISION<br className="sm:hidden" /> QUEST</h2>
              <p className="text-slate-600 dark:text-slate-300 text-center text-[10px] sm:text-xs leading-snug">今回範囲を集中</p>
            </button>
          </div>

          {yetList.length > 0 && (
            <button
              onClick={() => {
                setCurrentDeck({
                  id: 'yet-deck',
                  title: '「まだ」の集中復習',
                  description: '自己申告テスト等で「まだ」を選んだカードの復習',
                  cards: decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id))
                });
                setAppMode('menu');
              }}
              className="w-full max-w-3xl mt-3 min-h-11 flex items-center justify-between gap-3 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300"><Brain size={18} />「まだ」を集中復習</span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">{yetList.length}件 <ChevronRight size={14} className="inline" /></span>
            </button>
          )}

          <div className="w-full max-w-3xl mt-3 px-3 py-2 bg-slate-100/70 dark:bg-slate-800/45 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="truncate">学習データはこの端末に自動保存</span>
              </div>

              {(favorites.length > 0 || yetList.length > 0) && (
                !showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="shrink-0 min-h-9 px-2.5 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    初期化
                  </button>
                ) : (
                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setFavorites([]);
                        setYetList([]);
                        setShowResetConfirm(false);
                      }}
                      className="min-h-9 px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      消去
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="min-h-9 px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                    >
                      戻る
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

`;

app = app.slice(0, topStart) + compactTop + app.slice(topEnd);

const menuStart = app.indexOf('  // Menu Screen');
const menuEnd = app.indexOf('  // Study Screen (Standard & Memorize)', menuStart);
if (menuStart < 0 || menuEnd < 0) throw new Error('Menu screen markers not found');

const bentoMenu = String.raw`  // Menu Screen
  if (appMode === 'menu') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center py-3 sm:py-5 md:py-8 px-3 sm:px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl">
          <header className="flex items-center justify-between mb-3 sm:mb-5">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                aria-label="教材一覧へ戻る"
                onClick={() => {
                  const isVisionQuest = currentDeck?.id.startsWith('vq-');
                  setCurrentDeck(null);
                  setAppMode(isVisionQuest ? 'vision_quest' : 'home');
                }}
                className="shrink-0 min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">{currentDeck.title}</h1>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">学習モードを選択</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="テーマ切り替え"
              className="shrink-0 min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun size={19} /> : <MoonStar size={19} />}
            </button>
          </header>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              onClick={() => setAppMode('standard')}
              className="min-h-[132px] sm:min-h-[145px] flex flex-col items-start justify-between p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/40 hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </div>
              <div className="w-full">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-full mb-1">じっくり</span>
                <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">単語カード</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">おもて↔裏で確認</p>
              </div>
            </button>

            <button
              onClick={() => { setAppMode('memorize'); setIsFlipped(false); }}
              className="min-h-[132px] sm:min-h-[145px] flex flex-col items-start justify-between p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCcw size={22} />
              </div>
              <div className="w-full">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-full mb-1">インプット</span>
                <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">答えから覚える</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">英文→和訳で定着</p>
              </div>
            </button>

            <button
              onClick={() => startQuiz('order')}
              className="min-h-[132px] sm:min-h-[145px] flex flex-col items-start justify-between p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/40 hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shuffle size={22} />
              </div>
              <div className="w-full">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-full mb-1">語順</span>
                <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">並べ替えクイズ</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">単語を並べて仕上げ</p>
              </div>
            </button>

            <button
              onClick={() => startQuiz('self')}
              className="min-h-[132px] sm:min-h-[145px] flex flex-col items-start justify-between p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain size={22} />
              </div>
              <div className="w-full">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full mb-1">実力判定</span>
                <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">自己申告テスト</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">「まだ / わかった」で判定</p>
              </div>
            </button>

            <div className="col-span-2 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                  <Timer size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">タイムアタック</h2>
                    <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-full">自動</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug">秒数を決めて高速反復</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <label className="flex flex-col gap-1 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  考える時間
                  <select
                    aria-label="問題を考える時間"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="min-h-10 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                  >
                    <option value={3}>3秒</option>
                    <option value={5}>5秒</option>
                    <option value={10}>10秒</option>
                    <option value={15}>15秒</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  答え表示
                  <select
                    aria-label="答えを表示する時間"
                    value={resultDisplayTime}
                    onChange={(e) => setResultDisplayTime(Number(e.target.value))}
                    className="min-h-10 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                  >
                    <option value={1}>1秒</option>
                    <option value={2}>2秒</option>
                    <option value={3}>3秒</option>
                    <option value={5}>5秒</option>
                  </select>
                </label>
              </div>

              <button
                onClick={() => startQuiz('time')}
                className="w-full min-h-11 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-sm font-black shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                タイムアタック開始
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

`;

app = app.slice(0, menuStart) + bentoMenu + app.slice(menuEnd);

fs.writeFileSync(path, app);
console.log('Applied compact home + bento menu UI');
