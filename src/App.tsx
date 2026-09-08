import React, { useState, useEffect, useMemo, useRef } from 'react';
import { decks, Card, Deck, basicExampleDecks, basicTestDecks, visionQuestSentenceDecks, visionQuestQuestionDecks } from './data/cards';
import { highlightAnswers } from './lib/highlight-answers';
import { readBoolean, readIds, saveSetting } from './lib/settings';
import { CONTENT_VERSION } from './data/exam_source_ledger';
import { Moon, Sun, MoonStar, Shuffle, Star, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, MessageCircle, Home, BookOpen, GraduationCap, Brain, List, Timer, CheckCircle, XCircle, Settings } from 'lucide-react';

type AppMode = 'top' | 'vision_quest' | 'home' | 'menu' | 'standard' | 'memorize' | 'self' | 'order' | 'time' | 'result';

const FAVORITES_STORAGE_KEY = `flashcard-favorites:${CONTENT_VERSION}`;
const YET_STORAGE_KEY = `flashcard-yet-list:${CONTENT_VERSION}`;

const HOPE_CARD_IDS = new Set([...basicExampleDecks, ...basicTestDecks].flatMap(deck => deck.cards.map(card => card.id)));
const isHopeCard = (card?: Card) => Boolean(card && HOPE_CARD_IDS.has(card.id));

const VISION_QUEST_QUESTION_CARD_IDS = new Set(
  visionQuestQuestionDecks.flatMap(deck => deck.cards.map(card => card.id))
);
const VISION_QUEST_CARD_IDS = new Set(
  [...visionQuestSentenceDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))
);
const OFFICIAL_QUESTION_CARD_IDS = new Set(
  [...basicTestDecks, ...visionQuestQuestionDecks].flatMap(deck => deck.cards.map(card => card.id))
);

const isVisionQuestQuestionCard = (card?: Card) => Boolean(card && VISION_QUEST_QUESTION_CARD_IDS.has(card.id));
const isVisionQuestCard = (card?: Card) => Boolean(card && VISION_QUEST_CARD_IDS.has(card.id));
const isOfficialQuestionCard = (card?: Card) => Boolean(card && OFFICIAL_QUESTION_CARD_IDS.has(card.id));
// The legacy field can contain either a task label or the Japanese question.
// Preserve both fields: a Japanese instruction in front does not imply that
// it already contains the Japanese sentence needed to solve the question.
const HIDDEN_VQ_TASK_LABELS = new Set(['日本語に合うように空欄補充']);
const vqQuestionPrompt = (card: Card) =>
  HIDDEN_VQ_TASK_LABELS.has(card.translation) || card.front.includes(card.translation)
    ? card.front
    : card.translation + '\n' + card.front;
const sourcePromptOrTranslation = (card: Card) => isVisionQuestQuestionCard(card) ? vqQuestionPrompt(card) : card.translation;
const officialQuestionPrompt = (card: Card) => isVisionQuestQuestionCard(card) ? vqQuestionPrompt(card) : card.front + '\n' + card.translation;
const answerMeaning = (card: Card) => isOfficialQuestionCard(card) ? highlightAnswers(card.front, card.back) : card.translation;

function canonicalQuizAnswer(answer: string): string {
  return answer
    .replace(/\s*\[[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const GREETING_MESSAGES = [
  { main: "生きててエライ！", sub: "勉強しようとアプリを開いただけで、今日の徳は積まれました。" },
  { main: "伝説の勇者、現る。", sub: "睡魔という魔王を倒して、レベル上げを始めましょう。" },
  { main: "脳内メモリを解放せよ。", sub: "無駄な情報の代わりに、最強の知識をインストールします。" },
  { main: "正直、寝たいよね。", sub: "わかる。でも、今の10分が未来のあなたを救う（はず）。" },
  { main: "スマホ依存 of ザ・イヤー。", sub: "SNSを見る指を止めてここに来たあなた、完全に「勝ち組」です。" },
  { main: "筋肉は裏切るが、知識も……", sub: "いや、知識は裏切りません！たぶん。信じて突き進もう。" },
  { main: "【朗報】神、降臨。", sub: "あなたが作業を始めると、全米が（私が）泣きだします。" },
  { main: "さて、一丁やりますか。", sub: "集中力ブースト中。今のあなたなら、なんでもいける気がする。" },
  { main: "現実逃避へようこそ！", sub: "他の作業から逃げてきた？OK、ここで一緒に戦おう。" },
  { main: "おかえり！天才。", sub: "おっと、才能が溢れ出ていますね。さっさと終わらせちゃいましょう。" },
  { main: "脳のアップデート開始。", sub: "バグ修正：昨日の「ど忘れ」を修正し、情報処理を最適化します。" },
  { main: "逆襲、はじまる。", sub: "できすぎて困る準備はできていますか？" },
  { main: "ここは精神と時の部屋。", sub: "外の世界の1時間は、ここでの集中10分分に相当します（諸説あり）。" },
  { main: "おっと、努力の天才か？", sub: "ログインボーナス：私の「熱い視線」を差し上げます。" },
  { main: "全俺が泣いた。", sub: "あなたが戻ってくるのを、サーバーも震えて待っていました。" },
  { main: "「忘れた」とは言わせない。", sub: "エビングハウス（忘却曲線）の鼻を明かしてやりましょう。" },
  { main: "ガチャの時間です。", sub: "今日は「SSR：一生忘れない最高の一日」が出る確率100%（願望）。" },
  { main: "さて、無双しますか。", sub: "周りの奴らがスマホで遊んでいる間に、こっそり最強になりましょう。" },
  { main: "これはもはや「推し」だと思え。", sub: "眺めているだけで幸せ……にはなりませんが、力にはなります。" },
  { main: "あ、意識高い人だ！", sub: "画面の反射で自分の顔を見てごらん。……うん、いい顔してる。" },
  { main: "諦めるには早すぎる。", sub: "諦めようかなと思った瞬間にこそ、次のブレイクスルーが隠されています。" },
  { main: "全自動学習マシーンへ。", sub: "余計な思考をオフにして、手を動かすマシーンになりきろう！" },
  { main: "限界は自分が決めた幻想。", sub: "あなたの潜在能力は、まだ1%も発揮されていません。本気出す？" },
  { main: "とりあえず、1文字だけ。", sub: "1文字書いたら勝ち。ハードルを極限まで下げて始めましょう。" },
  { main: "未来のあなたからお礼状。", sub: "「あの時サボらず勉強してくれてサンキュー！」との手紙が届いています。" },
  { main: "天才は、習慣の別名。", sub: "やる気が出ない？大丈夫。やる気なんてただの幻、行動がすべてです。" },
  { main: "脳みそが喜びの叫び。", sub: "新しい知識を吸収するたび、脳のニューロンが大歓声を上げています。" },
  { main: "世界を驚かせる準備。", sub: "今は静かに牙を研ぐ時間。いつか周囲を「あっ」と言わせてやりましょう。" },
  { main: "今ここ、全集中。", sub: "雑音をすべてシャットアウト。自分だけの知の宇宙へダイブ！" },
  { main: "睡魔とのラストバトル。", sub: "まぶたが重い？冷たい水を飲むか、深呼吸を3回して物理攻撃だ！" },
  { main: "最高のインプット体験。", sub: "このアプリ、実はあなたを賢くするためだけに生まれてきたんです。" },
  { main: "一歩進めば昨日超え。", sub: "たとえ10秒でも勉強したなら、昨日の自分を軽々と超えています。" },
  { main: "眠れる獅子、覚醒。", sub: "まだ本気を出していないだけ？今がその「本気」を解放する瞬間です。" },
  { main: "エビデンスに基づく努力。", sub: "努力は裏切らない。脳科学的にも、反復学習こそが最強の武器。" },
  { main: "スマホを裏返してみよう。", sub: "通知はすべて無視。今だけは、自分を高める時間。さあ裏返して！" },
  { main: "これは無敵のロードマップ。", sub: "覚えた分だけ強くなる。完全にゲームのレベル上げと同じです。" },
  { main: "心臓の鼓動を高めよ。", sub: "合格の瞬間、目的達成の瞬間を想像して。ワクワクしてきたでしょ？" },
  { main: "神対応：毎日学習中。", sub: "学んでいる時のあなたの横顔、信じられないほど輝いてますよ。" },
  { main: "宇宙一エラい学習者。", sub: "こんな時間（または合間）に勉強しようとするなんて、ノーベル平和賞もの。" },
  { main: "おめでとう、本日一歩目。", sub: "最初の一歩が最も重い。それをクリアしたあなたに、拍手を送ります！" }
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return readBoolean('flashcard-dark-mode');
  });
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [isShuffle, setIsShuffle] = useState(() => {
    return readBoolean('flashcard-shuffle');
  });
  const [isBackDefault, setIsBackDefault] = useState(() => {
    return readBoolean('flashcard-back-default');
  });
  const [reviewFavoritesOnly, setReviewFavoritesOnly] = useState(false);
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    return readIds(FAVORITES_STORAGE_KEY);
  });

  const [yetList, setYetList] = useState<number[]>(() => {
    return readIds(YET_STORAGE_KEY);
  });

  const addYet = (id: number) => {
    setYetList(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const removeYet = (id: number) => {
    setYetList(prev => prev.filter(yId => yId !== id));
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  // New state variables for test modes
  const [appMode, setAppMode] = useState<AppMode>('top');
  const [visionQuestTab, setVisionQuestTab] = useState<'sentences' | 'questions'>('sentences');
  const [basicTab, setBasicTab] = useState<'sentences' | 'tests'>('sentences');
  const [showOlderVisionQuest, setShowOlderVisionQuest] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [resultDisplayTime, setResultDisplayTime] = useState<number>(3);
  const [score, setScore] = useState(0);
  const [lastQuizMode, setLastQuizMode] = useState<AppMode>('self');
  const [mistakes, setMistakes] = useState<Card[]>([]);
  const [quizCards, setQuizCards] = useState<Card[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [choices, setChoices] = useState<Card[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<Card | null>(null);
  const [wordPool, setWordPool] = useState<{id: number, word: string}[]>([]);
  const [selectedWords, setSelectedWords] = useState<{id: number, word: string}[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const orderAdvanceTimerRef = useRef<number | null>(null);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isQuizCommentOpen, setIsQuizCommentOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [greeting, setGreeting] = useState(() => {
    const STORAGE_KEY = 'app_greeting_queue';
    const totalMessages = GREETING_MESSAGES.length;
    
    let queue: number[] = [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        queue = JSON.parse(stored);
      }
    } catch (e) {
      queue = [];
    }

    // キューが空か、無効な場合は新しいシャッフル配列を作成
    if (!Array.isArray(queue) || queue.length === 0 || queue.some(id => !Number.isInteger(id) || id < 0 || id >= totalMessages)) {
      queue = Array.from({ length: totalMessages }, (_, i) => i);
      
      // フィッシャー・イェーツ（Fisher-Yates）シャッフル
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }

    // キューから1個取り出す
    const nextIndex = queue.pop();
    
    try {
      saveSetting(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to save greeting queue to localStorage", e);
    }

    return GREETING_MESSAGES[nextIndex ?? 0];
  });

  // 他のページにいって、トップにもどったら毎回確実にメッセージを変更する
  useEffect(() => {
    if (appMode === 'top') {
      const STORAGE_KEY = 'app_greeting_queue';
      const totalMessages = GREETING_MESSAGES.length;
      
      let queue: number[] = [];
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          queue = JSON.parse(stored);
        }
      } catch (e) {
        queue = [];
      }

      if (!Array.isArray(queue) || queue.length === 0 || queue.some(id => !Number.isInteger(id) || id < 0 || id >= totalMessages)) {
        queue = Array.from({ length: totalMessages }, (_, i) => i);
        
        for (let i = queue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [queue[i], queue[j]] = [queue[j], queue[i]];
        }
      }

      const nextIndex = queue.pop();
      
      try {
        saveSetting(STORAGE_KEY, JSON.stringify(queue));
      } catch (e) {
        console.warn("Failed to save greeting queue to localStorage", e);
      }

      setGreeting(GREETING_MESSAGES[nextIndex ?? 0]);
    }
  }, [appMode]);

  // 画面遷移やデッキ選択、カード切り替え、クイズ進捗などのタイミングでスクロール位置を最上部に戻す
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appMode, currentDeck, currentIndex, quizIndex]);

  // カード切り替え、表面に戻る、デッキ選択等のタイミングでアコーディオンを閉じる
  useEffect(() => {
    setIsCommentOpen(false);
  }, [currentIndex, currentDeck, isFlipped]);

  // クイズ切り替え、回答フェーズ、クイズモード変更などのタイミングでクイズのアコーディオンを閉じる
  useEffect(() => {
    setIsQuizCommentOpen(false);
  }, [quizIndex, isFlipped, appMode]);

  // Keep long-lived mobile/in-app browser tabs in sync with the latest deployed Vite bundle.
  // Never force a reload while the learner is inside a study/test screen; defer it until top.
  useEffect(() => {
    let checking = false;

    const checkForFreshBundle = async () => {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const response = await fetch(`/?__ui_check=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const html = await response.text();
        const latestMatch = html.match(/<script[^>]+src=["']([^"']+\.js)["']/i);
        const currentScript = document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.getAttribute('src');
        const latestScript = latestMatch?.[1];

        if (latestScript && currentScript && latestScript !== currentScript && appMode === 'top') {
          const freshUrl = new URL(window.location.href);
          freshUrl.searchParams.set('__ui_v', latestScript);
          window.location.replace(freshUrl.toString());
        }
      } catch (error) {
        console.warn('UI freshness check failed', error);
      } finally {
        checking = false;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void checkForFreshBundle();
    };

    window.addEventListener('focus', checkForFreshBundle);
    document.addEventListener('visibilitychange', handleVisibility);
    const timer = window.setInterval(checkForFreshBundle, 60_000);
    void checkForFreshBundle();

    return () => {
      window.removeEventListener('focus', checkForFreshBundle);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(timer);
    };
  }, [appMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSetting('flashcard-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Save settings to local storage
  useEffect(() => {
    saveSetting('flashcard-shuffle', JSON.stringify(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    saveSetting('flashcard-back-default', JSON.stringify(isBackDefault));
  }, [isBackDefault]);

  // Save favorites to local storage
  useEffect(() => {
    saveSetting(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Save yetList to local storage
  useEffect(() => {
    saveSetting(YET_STORAGE_KEY, JSON.stringify(yetList));
  }, [yetList]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Determine which cards to show
  const activeCards = useMemo(() => {
    if (!currentDeck) return [];
    
    let cards = currentDeck.cards;
    if (currentDeck.id.endsWith('yet-deck')) {
      cards = decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id));
    }
    
    if (currentDeck.id === 'favorite-deck') {
      cards = cards.filter(c => favorites.includes(c.id));
    }

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
  }, [currentDeck, isShuffle, reviewFavoritesOnly, favorites, yetList, shuffledOrder]);

  // Adjust currentIndex if cards are dynamically removed during review
  useEffect(() => {
    if (currentIndex >= activeCards.length && activeCards.length > 0) {
      setCurrentIndex(activeCards.length - 1);
    }
  }, [activeCards.length, currentIndex]);

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

  // Filtering/removing the last visible card changes the array before effects run.
  // Keep this render in bounds as well as updating the stored index in the effect.
  const visibleIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[visibleIndex];
  const isCurrentDeckQuestion = currentDeck ? currentDeck.cards.length > 0 && currentDeck.cards.every(card => isOfficialQuestionCard(card)) : false;

  // --- Quiz Logic ---
  const generateWordPool = (card: Card) => {
    // Split by spaces, keep punctuation attached for simplicity
    const words = canonicalQuizAnswer(card.back).split(' ').map((word, index) => ({ id: index, word }));
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
    setLastQuizMode(mode);
    setAppMode(mode);
    setIsFlipped(false);
    setShowHint(false);
    setIsCorrect(null);

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
    const currentQuizCard = quizCards[quizIndex];
    if (correct) {
      setScore(prev => prev + 1);
      if (currentDeck?.id.endsWith('yet-deck')) {
        removeYet(currentQuizCard.id);
      }
    } else {
      setMistakes(prev => [...prev, currentQuizCard]);
      addYet(currentQuizCard.id);
    }
    nextQuizCard();
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

  const resetWordOrder = () => {
    if (isCorrect !== null) return;
    generateWordPool(quizCards[quizIndex]);
  };

  const checkWordOrder = () => {
    const currentSentence = canonicalQuizAnswer(quizCards[quizIndex].back);
    const userSentence = selectedWords.map(w => w.word).join(' ');
    const correct = currentSentence === userSentence;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => [...prev, quizCards[quizIndex]]);
      addYet(quizCards[quizIndex].id);
    }
    
    if (orderAdvanceTimerRef.current !== null) {
      window.clearTimeout(orderAdvanceTimerRef.current);
    }
    orderAdvanceTimerRef.current = window.setTimeout(() => {
      orderAdvanceTimerRef.current = null;
      nextQuizCard();
    }, 2000);
  };

  // Prevent a delayed word-order result from navigating after the learner has left that mode.
  useEffect(() => {
    if (appMode !== 'order' && orderAdvanceTimerRef.current !== null) {
      window.clearTimeout(orderAdvanceTimerRef.current);
      orderAdvanceTimerRef.current = null;
    }
  }, [appMode]);

  useEffect(() => () => {
    if (orderAdvanceTimerRef.current !== null) {
      window.clearTimeout(orderAdvanceTimerRef.current);
    }
  }, []);

  // Time Attack Timer. Opening the explanation pauses the countdown/auto-advance.
  useEffect(() => {
    if (appMode === 'time' && isQuizCommentOpen) return;
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
  }, [appMode, timeLeft, isFlipped, resultDisplayTime, isQuizCommentOpen]);


  // Top Screen (Course Selection)
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

  // Vision Quest Placeholder
  if (appMode === 'vision_quest') {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 md:py-12 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <header className="flex justify-between items-center w-full mb-8 md:mb-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppMode('top')}
                className="shrink-0 min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="トップへ戻る"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-purple-600 rounded-xl md:rounded-2xl shadow-lg shadow-purple-200 dark:shadow-none hidden md:flex">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 tracking-wide font-sans">VISION QUEST</h1>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">Next Level Training</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="テーマ切り替え"
              className="min-w-11 min-h-11 p-2.5 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="テーマ切り替え"
            >
              {isDarkMode ? <Sun size={20} /> : <MoonStar size={20} />}
            </button>
          </header>

          <div className="flex justify-center mb-8 w-full max-w-sm">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full">
              <button 
                onClick={() => setVisionQuestTab('sentences')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all text-center ${visionQuestTab === 'sentences' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                例文
              </button>
              <button 
                onClick={() => setVisionQuestTab('questions')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all text-center ${visionQuestTab === 'questions' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                問題
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowOlderVisionQuest((prev) => !prev)}
              aria-expanded={showOlderVisionQuest}
              className="min-h-11 px-5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-sm font-bold text-purple-700 dark:text-purple-300 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              {showOlderVisionQuest ? '以前の範囲を閉じる ▲' : '以前の範囲を見る ▼'}
            </button>
          </div>

          {visionQuestTab === 'sentences' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              {visionQuestSentenceDecks.slice(0, showOlderVisionQuest ? undefined : 1).map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => {
                    setCurrentDeck(deck);
                    setAppMode('menu');
                  }}
                  className={`group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border text-left transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    deck.id === 'vq-current-range'
                      ? 'border-purple-400 dark:border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/40'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {deck.id === 'vq-current-range' && (
                    <span className="inline-flex mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black tracking-wide">
                      今回の試験範囲
                    </span>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {deck.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {deck.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400 mt-4">
                    <span>学習を始める</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {visionQuestTab === 'questions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              {visionQuestQuestionDecks.slice(0, showOlderVisionQuest ? undefined : 1).map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => {
                    setCurrentDeck(deck);
                    setAppMode('menu');
                  }}
                  className={`group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border text-left transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    deck.id === 'vq-current-range-q'
                      ? 'border-purple-400 dark:border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/40'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {deck.id === 'vq-current-range-q' && (
                    <span className="inline-flex mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black tracking-wide">
                      今回の試験範囲
                    </span>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {deck.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {deck.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400 mt-4">
                    <span>問題に挑戦する</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {yetList.length > 0 && (
            <div className="mt-12 p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-rose-500" size={24} />
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100">「まだ」の集中復習</h3>
              </div>
              <p className="text-rose-800/70 dark:text-rose-200/60 text-sm mb-6">
                自己申告テスト等で「まだ」と評価した例文や未習熟リストに登録されている例文が <span className="font-bold text-rose-600 dark:text-rose-400">{yetList.length}</span> 個あります。
              </p>
              <button 
                onClick={() => {
                  setReviewFavoritesOnly(false);
                  setCurrentDeck({
                    id: 'vq-yet-deck',
                    title: '「まだ」の復習デッキ',
                    description: '「まだ」と評価した例文の集中復習',
                    cards: decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id))
                  });
                  setAppMode('menu');
                }}
                className="w-full py-4 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
              >
                「まだ」のカードを復習する
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Home Screen (Basic Sentence Master)
  if (appMode === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 md:py-12 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-4xl">
          <header className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppMode('top')}
                className="shrink-0 min-w-11 min-h-11 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="トップへ戻る"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-indigo-600 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hidden md:flex">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">基本例文マスター</h1>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">必ず役立つ基本セット</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="テーマ切り替え"
              className="min-w-11 min-h-11 p-2.5 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="テーマ切り替え"
            >
              {isDarkMode ? <Sun size={20} /> : <MoonStar size={20} />}
            </button>
          </header>

          <div className="flex justify-center mb-8 w-full">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full max-w-md">
              <button
                onClick={() => setBasicTab('sentences')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all text-center ${
                  basicTab === 'sentences'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                例文（110）
              </button>
              <button
                onClick={() => setBasicTab('tests')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all text-center ${
                  basicTab === 'tests'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                公式穴埋め（54）
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {(basicTab === 'sentences' ? basicExampleDecks : basicTestDecks).map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  setCurrentDeck(deck);
                  setAppMode('menu');
                }}
                className="group relative bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  {deck.description} ・ {deck.cards.length}{basicTab === 'sentences' ? '文' : '問'}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  <span>学習を始める</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

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
                  setCurrentDeck({
                    id: 'favorite-deck',
                    title: 'お気に入りの復習',
                    description: '登録したカードを全教材からまとめて復習',
                    cards: decks.flatMap(d => d.cards).filter(c => favorites.includes(c.id))
                  });
                  setReviewFavoritesOnly(false);
                  setAppMode('menu');
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
              >
                お気に入りだけを復習する
              </button>
            </div>
          )}

          {yetList.length > 0 && (
            <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-rose-500" size={24} />
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100">「まだ」の集中復習</h3>
              </div>
              <p className="text-rose-800/70 dark:text-rose-200/60 text-sm mb-6">
                自己申告テスト等で「まだ」と評価した例文や未習熟リストに登録されている例文が <span className="font-bold text-rose-600 dark:text-rose-400">{yetList.length}</span> 個あります。
              </p>
              <button 
                onClick={() => {
                  setReviewFavoritesOnly(false);
                  setCurrentDeck({
                    id: 'yet-deck',
                    title: '「まだ」の復習デッキ',
                    description: '「まだ」と評価した例文の集中復習',
                    cards: decks.flatMap(d => d.cards).filter(c => yetList.includes(c.id))
                  });
                  setAppMode('menu');
                }}
                className="w-full py-4 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
              >
                「まだ」のカードを復習する
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
                <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-tight whitespace-normal break-words">{currentDeck.title}</h1>
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
                <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{isCurrentDeckQuestion ? '問題カード' : '単語カード'}</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">{isCurrentDeckQuestion ? '問題→解答で確認' : 'おもて↔裏で確認'}</p>
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
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">{isCurrentDeckQuestion ? '解答→元の問題で逆確認' : '英文→和訳で定着'}</p>
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

  // Study Screen (Standard & Memorize)
  if (appMode === 'standard' || appMode === 'memorize') {
    const isMemorize = appMode === 'memorize';
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center mb-6 md:mb-8 gap-3">
        <div className="w-full sm:w-auto flex items-center gap-2 md:gap-3">
          <button 
            aria-label="学習モード選択へ戻る"
            onClick={() => { setAppMode('menu'); }}
            className="min-w-11 min-h-11 p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white leading-tight whitespace-normal break-words flex-1 min-w-0">
            {currentDeck.title} {isMemorize && "(答えから)"}
          </h1>
        </div>
        
        <div className="self-end sm:self-auto flex items-center gap-1 md:gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="テーマ切り替え"
            className={`p-1.5 md:p-2 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[48px] min-h-11 md:min-w-[54px] ${isDarkMode ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            {isDarkMode ? <Sun size={16} /> : <MoonStar size={16} />}
            <span className="text-[11px] font-extrabold mt-0.5 tracking-tighter opacity-80">
              {isDarkMode ? 'ライト' : 'ダーク'}
            </span>
          </button>
          
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1.5 md:p-2 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[48px] min-h-11 md:min-w-[54px] ${isShuffle ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Shuffle size={16} />
            <span className="text-[11px] font-extrabold mt-0.5 tracking-tighter opacity-80">
              {isShuffle ? 'シャッフル' : '順序'}
            </span>
          </button>

          {!isMemorize && (
            <button 
              onClick={() => setIsBackDefault(!isBackDefault)}
              className={`p-1.5 md:p-2 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[48px] min-h-11 md:min-w-[54px] ${isBackDefault ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              <RotateCcw size={16} />
              <span className="text-[11px] font-extrabold mt-0.5 tracking-tighter opacity-80 whitespace-nowrap">
                {isBackDefault ? '裏から' : '表から'}
              </span>
            </button>
          )}

          <button 
            onClick={() => setReviewFavoritesOnly(!reviewFavoritesOnly)}
            className={`p-1.5 md:p-2 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[48px] min-h-11 md:min-w-[54px] ${reviewFavoritesOnly ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            title="お気に入りカードのみを絞り込んで学習"
          >
            <Star size={16} className={reviewFavoritesOnly ? "fill-current text-amber-500" : ""} />
            <span className="text-[11px] font-extrabold mt-0.5 tracking-tighter opacity-80 whitespace-nowrap">
              {reviewFavoritesOnly ? '★限定' : 'すべて'}
            </span>
          </button>
        </div>
      </div>

      {/* Flashcard Area */}
      {activeCards.length > 0 ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="w-full flex flex-wrap gap-2 justify-between items-center mb-4 px-1 md:px-2">
            <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              {visibleIndex + 1} / {activeCards.length}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentCard.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-xl border transition-all active:scale-95 ${favorites.includes(currentCard.id) ? 'text-amber-500 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 font-extrabold' : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 bg-white dark:bg-slate-800'}`}
                title="このカードをお気に入りに登録・解除"
              >
                <Star size={14} className={favorites.includes(currentCard.id) ? "fill-current" : ""} />
                <span className="text-[10px] sm:text-xs font-extrabold tracking-tight sm:tracking-wider whitespace-nowrap">
                  <span className="sm:hidden">{favorites.includes(currentCard.id) ? '★登録中' : 'お気に入り'}</span>
                  <span className="hidden sm:inline">{favorites.includes(currentCard.id) ? 'お気に入り登録中' : 'お気に入り登録'}</span>
                </span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (yetList.includes(currentCard.id)) {
                    removeYet(currentCard.id);
                  } else {
                    addYet(currentCard.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-xl border transition-all active:scale-95 ${yetList.includes(currentCard.id) ? 'text-rose-600 border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/20 font-extrabold' : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800'}`}
                title="このカードを「まだ」リストに登録・解除"
              >
                <div className={`w-2 h-2 rounded-full ${yetList.includes(currentCard.id) ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                <span className="text-[10px] sm:text-xs font-extrabold tracking-tight sm:tracking-wider whitespace-nowrap">
                  <span className="sm:hidden">{yetList.includes(currentCard.id) ? 'まだ登録中' : 'まだ追加'}</span>
                  <span className="hidden sm:inline">{yetList.includes(currentCard.id) ? '「まだ」登録中' : '「まだ」リスト追加'}</span>
                </span>
              </button>
            </div>
          </div>

          {/* Card */}
          <div 
            className="w-full bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-12 min-h-[350px] md:min-h-[450px] flex flex-col justify-center items-center cursor-pointer transition-all hover:shadow-2xl relative overflow-hidden active:scale-[0.99]"
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (isFlipped) setShowHint(false); // Reset hint when flipping back to front
            }}
          >
            {isVisionQuestCard(currentCard) ? (
              // --- Vision Quest デッキ用の表示 ---
              !isFlipped ? (
                // 表面（めくる前）
                <div className="flex flex-col items-center text-center w-full animate-in fade-in zoom-in-95 duration-200">
                  {isMemorize ? (
                    // 答えから覚える（英 ➔ 和）：表面は完成英文のみ
                    <p className="text-2xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 leading-tight my-8">
                      {currentCard.back}
                    </p>
                  ) : (
                    // 通常カード。VQ問題デッキは公式の問題文そのものを表示する。
                    <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 my-8 leading-relaxed whitespace-pre-wrap">
                      {sourcePromptOrTranslation(currentCard)}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-6 md:mt-10 animate-pulse">
                    タップして{isMemorize ? (isVisionQuestQuestionCard(currentCard) ? "元の問題" : "日本語訳") : (isVisionQuestQuestionCard(currentCard) ? "解答" : "完成文")}を見る
                  </p>
                </div>
              ) : (
                // 裏面（めくった後：回答とコメント）
                <div className="flex flex-col items-center text-center w-full animate-in fade-in zoom-in-95 duration-200">
                  <div className="absolute top-6 md:top-8 left-6 md:left-8 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-black tracking-wider uppercase text-xs md:text-sm">
                    <span className="text-xl md:text-2xl">✅</span> {isVisionQuestQuestionCard(currentCard) ? '解答' : '完成文'}
                  </div>
                  <p className="text-2xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-10 md:mt-12 mb-6 md:mb-8">
                    {highlightAnswers(currentCard.front, currentCard.back)}
                  </p>
                  <div className="h-1 w-16 md:w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6 md:mb-8"></div>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-8 whitespace-pre-wrap">
                    {sourcePromptOrTranslation(currentCard)}
                  </p>

                  {currentCard.comment && (
                    <div 
                      className="w-full text-left" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsCommentOpen(!isCommentOpen); }}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-purple-50/80 hover:bg-purple-100/80 text-purple-600 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-xl md:rounded-2xl transition-all duration-200 text-sm md:text-base font-bold shadow-sm border border-purple-100/50 dark:border-purple-900/30 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle size={18} className="text-purple-500 shrink-0" />
                          <span>{isHopeCard(currentCard) ? '💡 ミニ解説' : '💡 ぽいんと'}</span>
                        </div>
                        <span className="text-xs text-purple-400 font-bold shrink-0">
                          {isCommentOpen ? "タップで折りたたむ ▲" : "タップで表示 ▼"}
                        </span>
                      </button>

                      {isCommentOpen && (
                        <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-start gap-2 md:gap-3">
                            <p className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                              {currentCard.comment}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              // --- 通常のデッキ用の表示（既存のロジック） ---
              (!isMemorize && !isFlipped) || (isMemorize && isFlipped) ? (
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
                  <div className="absolute top-6 md:top-8 left-6 md:left-8 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-black tracking-wider uppercase text-xs md:text-sm">
                    <span className="text-xl md:text-2xl">✅</span> 完成文
                  </div>
                  <p className="text-2xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-10 md:mt-12 mb-6 md:mb-8">
                    {currentCard.back}
                  </p>
                  <div className="h-1 w-16 md:w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6 md:mb-8"></div>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-8">
                    {currentCard.translation}
                  </p>

                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    {!showHint ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                        className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl md:rounded-2xl transition-colors text-sm md:text-base font-bold"
                      >
                        <Lightbulb size={18} />
                        {isHopeCard(currentCard) ? 'ミニ解説を見る' : 'ヒント'}
                      </button>
                    ) : (
                      <div 
                        onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4 text-slate-600 dark:text-slate-400">
                          <MessageCircle size={18} md:size={22} className="shrink-0 mt-1" />
                          <p className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                            {isHopeCard(currentCard)
                              ? currentCard.comment.replace(/^\(|\)$/g, '').replace(/\n([^\n]+)$/, '\n\n$1')
                              : currentCard.comment.replace(/^\(|\)$/g, '')}
                          </p>
                        </div>
                        {currentCard.hint && (
                          <div className="flex items-start gap-2 md:gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <span className="text-lg md:text-xl shrink-0">💡</span>
                            <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{currentCard.hint}</p>
                          </div>
                        )}
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">タップして閉じる</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-8 md:mt-10 w-full">
            <button 
              aria-label="前のカードへ"
              onClick={handlePrev}
              className="p-4 md:p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"
            >
              <ChevronLeft size={24} md:size={32} />
            </button>
            
            <button 
              aria-label="次のカードへ"
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
            <Star size={48} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">{reviewFavoritesOnly || currentDeck.id === 'favorite-deck' ? 'お気に入りがありません' : '復習するカードがありません'}</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-xs mx-auto mb-8">
            教材一覧から、復習したいカードを追加できます。
          </p>
          <button 
            onClick={() => reviewFavoritesOnly ? setReviewFavoritesOnly(false) : setAppMode(currentDeck.id.startsWith('vq-') ? 'vision_quest' : 'home')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
          >
            {reviewFavoritesOnly ? 'すべてのカードを表示' : '教材一覧へ戻る'}
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
          <button aria-label="学習モード選択へ戻る" onClick={() => setAppMode('menu')} className="min-w-11 min-h-11 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">
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
              <div className="text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-2 font-black tracking-wider uppercase text-xs mb-6">
                <span className="text-lg">📢</span> {isOfficialQuestionCard(quizCard) ? '問題' : '英語'}
              </div>
              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed whitespace-pre-wrap">
                {isOfficialQuestionCard(quizCard) ? officialQuestionPrompt(quizCard) : quizCard.back}
              </p>
              <p className="text-sm text-slate-400 mt-12 animate-pulse font-medium">タップして{isOfficialQuestionCard(quizCard) ? '解答' : '日本語訳'}を見る</p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in-95 w-full">
              <div className="text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 font-black tracking-wider uppercase text-xs mb-6">
                <span className="text-lg">💡</span> {isOfficialQuestionCard(quizCard) ? '解答' : '日本語での意味'}
              </div>
              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed whitespace-pre-wrap">
                {answerMeaning(quizCard)}
              </p>
              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-12 whitespace-pre-wrap">
                {isOfficialQuestionCard(quizCard) ? officialQuestionPrompt(quizCard) : quizCard.back}
              </p>
                
                {((isVisionQuestCard(quizCard) || isHopeCard(quizCard)) && quizCard.comment) && (
                  <div 
                    className="w-full text-left mb-8" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsQuizCommentOpen(!isQuizCommentOpen); }}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-purple-50/80 hover:bg-purple-100/80 text-purple-600 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-xl md:rounded-2xl transition-all duration-200 text-sm md:text-base font-bold shadow-sm border border-purple-100/50 dark:border-purple-900/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} className="text-purple-500 shrink-0" />
                        <span>{isHopeCard(quizCard) ? '💡 ミニ解説' : '💡 ぽいんと'}</span>
                      </div>
                      <span className="text-xs text-purple-400 font-bold shrink-0">
                        {isQuizCommentOpen ? "タップで折りたたむ ▲" : "タップで表示 ▼"}
                      </span>
                    </button>

                    {isQuizCommentOpen && (
                      <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-2 md:gap-3">
                          <p className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                            {quizCard.comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-4 justify-center w-full mt-4" onClick={e => e.stopPropagation()}>
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

  if (appMode === 'time') {
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <button aria-label="学習モード選択へ戻る" onClick={() => setAppMode('menu')} className="min-w-11 min-h-11 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">
            <ChevronLeft size={24} />
          </button>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-lg ${isFlipped ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : (timeLeft <= 3 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700')}`}>
            <Timer size={20} />
            <span>{isQuizCommentOpen ? '解説確認中（停止）' : `${isFlipped ? '答え確認中: ' : ''}${timeLeft}秒`}</span>
          </div>
          <div className="font-bold text-slate-500">{quizIndex + 1} / {quizCards.length}</div>
        </div>

        <div className={`w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center transition-all ${isFlipped ? 'border-emerald-500 dark:border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}>
          {!isFlipped ? (
            <div className="text-center animate-in fade-in zoom-in-95">
              <div className="text-rose-500 dark:text-rose-400 flex items-center justify-center gap-2 font-black tracking-wider uppercase text-xs mb-6">
                <span className="text-lg">📢</span> {isOfficialQuestionCard(quizCard) ? '問題' : '英語'}
              </div>
              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed whitespace-pre-wrap">
                {isOfficialQuestionCard(quizCard) ? officialQuestionPrompt(quizCard) : quizCard.back}
              </p>
              <p className="text-sm font-bold text-rose-500 mt-12 animate-pulse">時間内に{isOfficialQuestionCard(quizCard) ? '解答' : '日本語訳'}を思い出せ！</p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in-95 w-full">
              <div className="text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 font-black tracking-wider uppercase text-xs mb-6">
                <span className="text-lg">💡</span> {isOfficialQuestionCard(quizCard) ? '解答' : '日本語での意味'}
              </div>
              <p className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 leading-relaxed whitespace-pre-wrap">
                {answerMeaning(quizCard)}
              </p>
              <div className="h-px w-24 bg-slate-100 dark:bg-slate-700/50 mx-auto mb-8"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-8 whitespace-pre-wrap">
                {isOfficialQuestionCard(quizCard) ? officialQuestionPrompt(quizCard) : quizCard.back}
              </p>
              
              {((isVisionQuestCard(quizCard) || isHopeCard(quizCard)) && quizCard.comment) && (
                <div 
                  className="w-full text-left" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsQuizCommentOpen(!isQuizCommentOpen); }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-purple-50/80 hover:bg-purple-100/80 text-purple-600 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-xl md:rounded-2xl transition-all duration-200 text-sm md:text-base font-bold shadow-sm border border-purple-100/50 dark:border-purple-900/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-purple-500 shrink-0" />
                      <span>{isHopeCard(quizCard) ? '💡 ミニ解説' : '💡 ぽいんと'}</span>
                    </div>
                    <span className="text-xs text-purple-400 font-bold shrink-0">
                      {isQuizCommentOpen ? "タップで折りたたむ ▲" : "タップで表示 ▼"}
                    </span>
                  </button>

                  {isQuizCommentOpen && (
                    <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-start gap-2 md:gap-3">
                        <p className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                          {quizCard.comment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (appMode === 'order') {
    return (
      <div className="min-h-screen flex flex-col items-center py-6 md:py-8 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <button aria-label="学習モード選択へ戻る" onClick={() => setAppMode('menu')} className="min-w-11 min-h-11 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">
            <ChevronLeft size={24} />
          </button>
          <div className="font-bold text-slate-500">{quizIndex + 1} / {quizCards.length}</div>
          <div className="w-10"></div>
        </div>

        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">{sourcePromptOrTranslation(quizCard)}</p>
          
          {/* Answer Area */}
          <div className="min-h-[80px] p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap gap-2 items-center justify-center mb-4">
            {selectedWords.length === 0 && <span className="text-slate-400">単語をタップして並べる</span>}
            {selectedWords.map((w) => (
              <button 
                key={w.id} 
                onClick={() => handleWordDeselect(w)}
                disabled={isCorrect !== null}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                title="タップして戻す"
              >
                {w.word}
              </button>
            ))}
          </div>

          <div className="flex justify-end mb-6">
            <button 
              onClick={resetWordOrder}
              disabled={selectedWords.length === 0 || isCorrect !== null}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors disabled:opacity-0"
            >
              <RotateCcw size={14} />
              すべてやり直し
            </button>
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
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 mb-4">
                <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mb-1">正解は：</p>
                <p className="text-lg text-rose-700 dark:text-rose-300 font-bold">
                  {isVisionQuestCard(quizCard) ? highlightAnswers(quizCard.front, quizCard.back) : quizCard.back}
                </p>
              </div>
            )}
            
            {((isVisionQuestCard(quizCard) || isHopeCard(quizCard)) && quizCard.comment) && (
              <div 
                className="w-full text-left" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setIsQuizCommentOpen(!isQuizCommentOpen); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-purple-50/80 hover:bg-purple-100/80 text-purple-600 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-xl md:rounded-2xl transition-all duration-200 text-sm md:text-base font-bold shadow-sm border border-purple-100/50 dark:border-purple-900/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-purple-500 shrink-0" />
                    <span>{isHopeCard(quizCard) ? '💡 ミニ解説' : '💡 ぽいんと'}</span>
                  </div>
                  <span className="text-xs text-purple-400 font-bold shrink-0">
                    {isQuizCommentOpen ? "タップで折りたたむ ▲" : "タップで表示 ▼"}
                  </span>
                </button>

                {isQuizCommentOpen && (
                  <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left border border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-2 md:gap-3">
                      <p className="text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                        {quizCard.comment}
                      </p>
                    </div>
                  </div>
                )}
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
          <p className="text-slate-600 dark:text-slate-300 mb-8">お疲れ様でした！</p>
          
          {lastQuizMode === 'time' ? (
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">{quizCards.length}問の確認が完了しました</p>
          ) : <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 mb-8">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">正答率</p>
            <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
              {Math.round((score / quizCards.length) * 100)}<span className="text-2xl">%</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {quizCards.length}問中 {score}問 正解
            </p>
          </div>}

          <div className="flex flex-col gap-3">
            {mistakes.length > 0 && (
              <button 
                onClick={() => {
                  setQuizCards(mistakes);
                  setQuizIndex(0);
                  setScore(0);
                  setMistakes([]);
                  setCurrentDeck({ ...currentDeck!, id: `${currentDeck!.id}-mistakes`, cards: mistakes, title: `${currentDeck!.title} (復習)` });
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
