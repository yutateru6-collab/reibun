import React, { useState, useEffect, useMemo } from 'react';
import { decks, Card, Deck } from './data/cards';
import { Moon, Sun, Shuffle, Star, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, MessageCircle, Home, BookOpen, GraduationCap, Brain, List, Timer, CheckCircle, XCircle, Settings } from 'lucide-react';

type AppMode = 'home' | 'menu' | 'standard' | 'memorize' | 'self' | 'choice' | 'order' | 'time' | 'result';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('flashcard-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [isShuffle, setIsShuffle] = useState(() => {
    const saved = localStorage.getItem('flashcard-shuffle');
    return saved ? JSON.parse(saved) : false;
  });
  const [isBackDefault, setIsBackDefault] = useState(() => {
    const saved = localStorage.getItem('flashcard-back-default');
    return saved ? JSON.parse(saved) : false;
  });
  const [reviewFavoritesOnly, setReviewFavoritesOnly] = useState(false);
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('flashcard-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  // New state variables for test modes
  const [appMode, setAppMode] = useState<AppMode>('home');
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [resultDisplayTime, setResultDisplayTime] = useState<number>(3);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Card[]>([]);
  const [quizCards, setQuizCards] = useState<Card[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [choices, setChoices] = useState<Card[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<Card | null>(null);
  const [wordPool, setWordPool] = useState<{id: number, word: string}[]>([]);
  const [selectedWords, setSelectedWords] = useState<{id: number, word: string}[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flashcard-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Save settings to local storage
  useEffect(() => {
    localStorage.setItem('flashcard-shuffle', JSON.stringify(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('flashcard-back-default', JSON.stringify(isBackDefault));
  }, [isBackDefault]);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('flashcard-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Determine which cards to show
  const activeCards = useMemo(() => {
    if (!currentDeck) return [];
    
    let cards = currentDeck.cards;
    if (reviewFavoritesOnly) {
      cards = cards.filter(c => favorites.includes(c.id));
    }
    
    if (cards.length === 0) return [];

    if (isShuffle) {
      // Create a shuffled array of indices if not already done or if length changed
      if (shuffledOrder.length !== cards.length) {
        const order = Array.from({ length: cards.length }, (_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        setShuffledOrder(order);
        return order.map(i => cards[i]);
      }
      return shuffledOrder.map(i => cards[i]);
    }
    
    return cards;
  }, [currentDeck, isShuffle, reviewFavoritesOnly, favorites, shuffledOrder]);

  // Reset state when changing deck or settings
  useEffect(() => {
    setShuffledOrder([]);
    setCurrentIndex(0);
    setIsFlipped(isBackDefault);
    setShowHint(false);
  }, [currentDeck, isShuffle, reviewFavoritesOnly, isBackDefault]);

  const handleNext = () => {
    if (activeCards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
    setIsFlipped(isBackDefault);
    setShowHint(false);
  };

  const handlePrev = () => {
    if (activeCards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
    setIsFlipped(isBackDefault);
    setShowHint(false);
  };

  const currentCard = activeCards[currentIndex];

  // --- Quiz Logic ---
  const generateChoices = (correctCard: Card, allCards: Card[]) => {
    const distractors = allCards.filter(c => c.id !== correctCard.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const newChoices = [correctCard, ...distractors].sort(() => Math.random() - 0.5);
    setChoices(newChoices);
    setSelectedChoice(null);
    setIsCorrect(null);
  };

  const generateWordPool = (card: Card) => {
    // Split by spaces, keep punctuation attached for simplicity
    const words = card.back.split(' ').map((word, index) => ({ id: index, word }));
    setWordPool(words.sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setIsCorrect(null);
  };

  const startQuiz = (mode: AppMode) => {
    if (!currentDeck || activeCards.length === 0) return;
    const cardsToUse = isShuffle ? [...activeCards].sort(() => Math.random() - 0.5) : [...activeCards];
    
    setQuizCards(cardsToUse);
    setQuizIndex(0);
    setScore(0);
    setMistakes([]);
    setAppMode(mode);
    setIsFlipped(false);
    setShowHint(false);
    setIsCorrect(null);

    if (mode === 'choice') {
      generateChoices(cardsToUse[0], currentDeck.cards);
    }
    if (mode === 'order') {
      generateWordPool(cardsToUse[0]);
    }
    if (mode === 'time') {
      setTimeLeft(timeLimit);
    }
  };

  const nextQuizCard = () => {
    if (quizIndex + 1 < quizCards.length) {
      const nextCard = quizCards[quizIndex + 1];
      setQuizIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      setIsCorrect(null);
      
      if (appMode === 'choice') {
        generateChoices(nextCard, currentDeck!.cards);
      }
      if (appMode === 'order') {
        generateWordPool(nextCard);
      }
      if (appMode === 'time') {
        setTimeLeft(timeLimit);
      }
    } else {
      setAppMode('result');
    }
  };

  const handleSelfAssess = (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => [...prev, quizCards[quizIndex]]);
    }
    nextQuizCard();
  };

  const handleChoiceSelect = (choice: Card | null) => {
    if (selectedChoice !== null || isCorrect !== null) return; // Prevent multiple clicks
    
    setSelectedChoice(choice);
    const correct = choice?.id === quizCards[quizIndex].id;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => [...prev, quizCards[quizIndex]]);
    }
    
    // Auto-advance after a delay
    setTimeout(() => {
      nextQuizCard();
    }, 1500);
  };

  const handleWordSelect = (wordObj: {id: number, word: string}) => {
    if (isCorrect !== null) return;
    setWordPool(prev => prev.filter(w => w.id !== wordObj.id));
    setSelectedWords(prev => [...prev, wordObj]);
  };

  const handleWordDeselect = (wordObj: {id: number, word: string}) => {
    if (isCorrect !== null) return;
    setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
    setWordPool(prev => [...prev, wordObj]);
  };

  const checkWordOrder = () => {
    const currentSentence = quizCards[quizIndex].back;
    const userSentence = selectedWords.map(w => w.word).join(' ');
    const correct = currentSentence === userSentence;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => [...prev, quizCards[quizIndex]]);
    }
    
    setTimeout(() => {
      nextQuizCard();
    }, 2000);
  };

  // Time Attack Timer
  useEffect(() => {
    if (appMode === 'time' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (appMode === 'time' && timeLeft === 0) {
      if (!isFlipped) {
        // Thinking phase ended -> Show answer
        setIsFlipped(true);
        setTimeLeft(resultDisplayTime);
      } else {
        // Result phase ended -> Next card
        nextQuizCard();
      }
    }
  }, [appMode, timeLeft, isFlipped, resultDisplayTime]);


  // Home Screen
  if (!currentDeck) {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 md:py-12 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-4xl">
          <header className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-indigo-600 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">基本例文マスター</h1>
                <p className="text-xs md:text-sm text-slate-50 dark:text-slate-400">必ず役立つ基本セット</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  setCurrentDeck(deck);
                  setAppMode('menu');
                }}
                className="group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={60} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.title}
                </h2>
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  <span>学習を始める</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
            
            {/* Placeholder for future decks */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center opacity-60">
              <p className="text-slate-400 dark:text-slate-500 font-medium italic">
                新しいデッキを準備中...
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-4">
                <Star className="text-amber-500 fill-current" size={24} />
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">お気に入りの復習</h3>
              </div>
              <p className="text-amber-800/70 dark:text-amber-200/60 text-sm mb-6">
                現在 {favorites.length} 個のカードがお気に入りに登録されています。
              </p>
              <button 
                onClick={() => {
                  setCurrentDeck(decks[0]); // Default to first deck for now, or implement multi-deck favorite review
                  setReviewFavoritesOnly(true);
                  setAppMode('menu');
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                お気に入りだけを復習する
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Menu Screen
  if (appMode === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 md:py-12 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl">
          <header className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => { setCurrentDeck(null); setAppMode('home'); }}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{currentDeck.title}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">学習モードを選択してください</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => { setAppMode('standard'); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">単語カード</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">通常のフラッシュカードで<br/>じっくり学習</p>
            </button>

            <button 
              onClick={() => { setAppMode('memorize'); setIsFlipped(false); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RotateCcw size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">答えから覚える</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">英文を先に見て<br/>内容をインプット</p>
            </button>

            <button 
              onClick={() => startQuiz('choice')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <List size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">4択クイズ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">正しい英文を<br/>4つの選択肢から選ぶ</p>
            </button>

            <button 
              onClick={() => startQuiz('order')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shuffle size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">並べ替えクイズ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">バラバラの単語を<br/>正しい語順に並べる</p>
            </button>

            <button 
              onClick={() => startQuiz('self')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">自己申告テスト</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">わかったか・わからないかを<br/>自分で判定</p>
            </button>

            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                  <Timer size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">タイムアタック</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">制限時間内に頭で答えを出すサバイバル</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">考える時間:</span>
                  <select 
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value={3}>3秒 (神速)</option>
                    <option value={5}>5秒 (超上級)</option>
                    <option value={10}>10秒 (標準)</option>
                    <option value={15}>15秒 (じっくり)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">答えを表示する時間:</span>
                  <select 
                    value={resultDisplayTime} 
                    onChange={(e) => setResultDisplayTime(Number(e.target.value))}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value={1}>1秒 (一瞬)</option>
                    <option value={2}>2秒 (高速)</option>
                    <option value={3}>3秒 (標準)</option>
                    <option value={5}>5秒 (じっくり)</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => startQuiz('time')}
                className="w-full max-w-sm py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
              >
                タイムアタック開始！
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Study Screen (Standard & Memorize)
  if (appMode === 'standard' || appMode === 'memorize') {
    const isMemorize = appMode === 'memorize';
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="w-full max-w-2xl flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => { setAppMode('menu'); }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-none">
            {currentDeck.title} {isMemorize && "(答えから)"}
          </h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${isShuffle ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Shuffle size={18} />
          </button>

          {!isMemorize && (
            <button 
              onClick={() => setIsBackDefault(!isBackDefault)}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${isBackDefault ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              <RotateCcw size={18} />
            </button>
          )}

          <button 
            onClick={() => setReviewFavoritesOnly(!reviewFavoritesOnly)}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${reviewFavoritesOnly ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Star size={18} className={reviewFavoritesOnly ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Flashcard Area */}
      {activeCards.length > 0 ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 px-1 md:px-2">
            <span className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              {currentIndex + 1} / {activeCards.length}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentCard.id);
              }}
              className={`p-2 transition-all active:scale-125 ${favorites.includes(currentCard.id) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'}`}
            >
              <Star size={24} md:size={28} className={favorites.includes(currentCard.id) ? "fill-current" : ""} />
            </button>
          </div>

          {/* Card */}
          <div 
            className="w-full bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-12 min-h-[350px] md:min-h-[450px] flex flex-col justify-center items-center cursor-pointer transition-all hover:shadow-2xl relative overflow-hidden active:scale-[0.99]"
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (isFlipped) setShowHint(false); // Reset hint when flipping back to front
            }}
          >
            {(!isMemorize && !isFlipped) || (isMemorize && isFlipped) ? (
              <div className="flex flex-col items-center text-center w-full animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-6 md:mb-8 leading-relaxed">
                  {currentCard.front}
                </p>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 md:mb-10">
                  {currentCard.translation}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center w-full animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute top-6 md:top-8 left-6 md:left-8 text-emerald-500 dark:text-emerald-400 flex items-center gap-2 font-black tracking-wider uppercase text-xs md:text-sm">
                  <span className="text-xl md:text-2xl">✅</span> 完成文
                </div>
                <p className="text-2xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-10 md:mt-12 mb-6 md:mb-8">
                  {currentCard.back}
                </p>
                <div className="h-1 w-16 md:w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6 md:mb-8"></div>
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-8">
                  {currentCard.translation}
                </p>

                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  {!showHint ? (
                    <button 
                      onClick={() => setShowHint(true)}
                      className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl md:rounded-2xl transition-colors text-sm md:text-base font-bold"
                    >
                      <Lightbulb size={18} />
                      ヒント
                    </button>
                  ) : (
                    <div 
                      onClick={() => setShowHint(false)}
                      className="w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4 text-slate-600 dark:text-slate-400">
                        <MessageCircle size={18} md:size={22} className="shrink-0 mt-1" />
                        <p className="text-sm md:text-base font-bold italic">
                          {currentCard.comment.replace(/^\(|\)$/g, '')}
                        </p>
                      </div>
                      <div className="flex items-start gap-2 md:gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <span className="text-lg md:text-xl shrink-0">💡</span>
                        <p className="text-sm md:text-base leading-relaxed font-medium">{currentCard.hint}</p>
                      </div>
                      <p className="text-[10px] text-center text-slate-300 dark:text-slate-600 mt-2 font-medium">タップして閉じる</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-8 md:mt-10 w-full">
            <button 
              onClick={handlePrev}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"
            >
              <ChevronLeft size={24} md:size={32} />
            </button>
            
            <button 
              onClick={handleNext}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"
            >
              <ChevronRight size={24} md:size={32} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Star size={48} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">お気に入りがありません</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
            星マークをクリックして、復習したいカードを追加してください。
          </p>
          <button 
            onClick={() => setReviewFavoritesOnly(false)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
          >
            すべてのカードを表示
          </button>
        </div>
      )}
    </div>
    );
  }

  // --- Quiz Modes ---
  const quizCard = quizCards[quizIndex];

  if (appMode === 'self') {
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl flex items-center justify-between mb-8">
          <button onClick={() => setAppMode('menu')} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft size={24} />
          </button>
          <div className="font-bold text-slate-500">{quizIndex + 1} / {quizCards.length}</div>
          <div className="w-10"></div>
        </div>

        <div 
          className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center cursor-pointer transition-all hover:shadow-2xl relative"
          onClick={() => setIsFlipped(true)}
        >
          {!isFlipped ? (
            <div className="text-center animate-in fade-in zoom-in-95">
              <p className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8">{quizCard.front}</p>
              <p className="text-lg text-slate-600 dark:text-slate-300">{quizCard.translation}</p>
              <p className="text-sm text-slate-400 mt-12 animate-pulse">タップして答えを見る</p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in-95 w-full">
              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">{quizCard.back}</p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">{quizCard.translation}</p>
              
              <div className="flex gap-4 justify-center w-full mt-8" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => handleSelfAssess(false)}
                  className="flex-1 py-4 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle size={24} /> まだ
                </button>
                <button 
                  onClick={() => handleSelfAssess(true)}
                  className="flex-1 py-4 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={24} /> わかった
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (appMode === 'choice' || appMode === 'time') {
    const isTimeMode = appMode === 'time';
    
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <button onClick={() => setAppMode('menu')} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft size={24} />
          </button>
          {isTimeMode && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-lg ${isFlipped ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : (timeLeft <= 3 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700')}`}>
              <Timer size={20} />
              <span>{isFlipped ? "答え確認中: " : ""}{timeLeft}秒</span>
            </div>
          )}
          <div className="font-bold text-slate-500">{quizIndex + 1} / {quizCards.length}</div>
        </div>

        <div className={`w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center transition-all ${isTimeMode && isFlipped ? 'border-emerald-500 dark:border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}>
          {!isFlipped ? (
            <div className="text-center animate-in fade-in zoom-in-95">
              <p className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed">{quizCard.front}</p>
              <p className="text-lg text-slate-600 dark:text-slate-300">{quizCard.translation}</p>
              {isTimeMode && <p className="text-sm font-bold text-rose-500 mt-12">時間内に答えを思い出せ！</p>}
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in-95 w-full">
              <div className="text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-2 font-black tracking-wider uppercase text-sm mb-6">
                <span className="text-2xl">✅</span> 完成文
              </div>
              <p className="text-2xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight mb-8">
                {quizCard.back}
              </p>
              <div className="h-1 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto mb-8"></div>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                {quizCard.translation}
              </p>
            </div>
          )}
        </div>

        {!isTimeMode && (
          <div className="w-full max-w-2xl grid grid-cols-1 gap-3 mt-6">
            {choices.map((choice, idx) => {
              let btnClass = "p-4 text-left rounded-2xl border-2 transition-all font-medium text-slate-700 dark:text-slate-200 ";
              if (selectedChoice) {
                if (choice.id === quizCard.id) {
                  btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500";
                } else if (selectedChoice.id === choice.id) {
                  btnClass += "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500";
                } else {
                  btnClass += "bg-white border-slate-200 opacity-50 dark:bg-slate-800 dark:border-slate-700";
                }
              } else {
                btnClass += "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500";
              }

              return (
                <button 
                  key={idx} 
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={selectedChoice !== null || isCorrect !== null}
                  className={btnClass}
                >
                  {choice.back}
                </button>
              );
            })}
          </div>
        )}
        
        {!isTimeMode && isCorrect !== null && (
          <div className={`mt-8 text-2xl font-black animate-in zoom-in ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isCorrect ? '⭕️ 正解！' : '❌ 残念...'}
          </div>
        )}
      </div>
    );
  }

  if (appMode === 'order') {
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <button onClick={() => setAppMode('menu')} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft size={24} />
          </button>
          <div className="font-bold text-slate-500">{quizIndex + 1} / {quizCards.length}</div>
          <div className="w-10"></div>
        </div>

        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">{quizCard.translation}</p>
          
          {/* Answer Area */}
          <div className="min-h-[80px] p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap gap-2 items-center justify-center mb-6">
            {selectedWords.length === 0 && <span className="text-slate-400">単語をタップして並べる</span>}
            {selectedWords.map((w) => (
              <button 
                key={w.id} 
                onClick={() => handleWordDeselect(w)}
                disabled={isCorrect !== null}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {w.word}
              </button>
            ))}
          </div>

          {/* Word Pool */}
          <div className="flex flex-wrap gap-2 justify-center">
            {wordPool.map((w) => (
              <button 
                key={w.id} 
                onClick={() => handleWordSelect(w)}
                disabled={isCorrect !== null}
                className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:border-indigo-400 transition-colors"
              >
                {w.word}
              </button>
            ))}
          </div>
        </div>

        {wordPool.length === 0 && isCorrect === null && (
          <button 
            onClick={checkWordOrder}
            className="w-full max-w-2xl py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg animate-in fade-in slide-in-from-bottom-4"
          >
            解答する
          </button>
        )}

        {isCorrect !== null && (
          <div className="w-full max-w-2xl text-center animate-in zoom-in mt-4">
            <div className={`text-2xl font-black mb-4 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isCorrect ? '⭕️ 正解！' : '❌ 残念...'}
            </div>
            {!isCorrect && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mb-1">正解は：</p>
                <p className="text-lg text-rose-700 dark:text-rose-300 font-bold">{quizCard.back}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (appMode === 'result') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">テスト完了！</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">お疲れ様でした！</p>
          
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 mb-8">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">正答率</p>
            <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
              {Math.round((score / quizCards.length) * 100)}<span className="text-2xl">%</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {quizCards.length}問中 {score}問 正解
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {mistakes.length > 0 && (
              <button 
                onClick={() => {
                  setQuizCards(mistakes);
                  setQuizIndex(0);
                  setScore(0);
                  setMistakes([]);
                  setAppMode(appMode); // Wait, appMode is 'result'. We need to know the previous mode.
                  // Actually, let's just go back to menu for now, or retry mistakes in standard mode.
                  setCurrentDeck({ ...currentDeck!, cards: mistakes, title: `${currentDeck!.title} (復習)` });
                  setAppMode('menu');
                }}
                className="w-full py-4 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl font-bold transition-colors"
              >
                間違えた問題だけを復習する
              </button>
            )}
            <button 
              onClick={() => setAppMode('menu')}
              className="w-full py-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold shadow-lg transition-colors"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


