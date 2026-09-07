import fs from 'node:fs';

const path = 'src/App.tsx';
let app = fs.readFileSync(path, 'utf8');

function replaceOnce(from, to, label) {
  const count = app.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly 1 match, got ${count}`);
  app = app.replace(from, to);
}

function replaceAll(from, to, label, expectedMin = 1) {
  const count = app.split(from).length - 1;
  if (count < expectedMin) throw new Error(`${label}: expected at least ${expectedMin} matches, got ${count}`);
  app = app.split(from).join(to);
  console.log(`${label}: replaced ${count}`);
}

replaceOnce(
  "import React, { useState, useEffect, useMemo } from 'react';",
  "import React, { useState, useEffect, useMemo, useRef } from 'react';",
  'useRef import'
);

replaceOnce(
  "  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);\n\n  const [isCommentOpen, setIsCommentOpen] = useState(false);",
  "  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);\n  const orderAdvanceTimerRef = useRef<number | null>(null);\n\n  const [isCommentOpen, setIsCommentOpen] = useState(false);",
  'order timer ref'
);

replaceOnce(
  "  // Keep long-lived mobile/in-app browser tabs in sync with the latest deployed Vite bundle.\n  useEffect(() => {",
  "  // Keep long-lived mobile/in-app browser tabs in sync with the latest deployed Vite bundle.\n  // Never force a reload while the learner is inside a study/test screen; defer it until top.\n  useEffect(() => {",
  'freshness comment'
);

replaceOnce(
  "        if (latestScript && currentScript && latestScript !== currentScript) {\n          const freshUrl = new URL(window.location.href);\n          freshUrl.searchParams.set('__ui_v', latestScript);\n          window.location.replace(freshUrl.toString());\n        }",
  "        if (latestScript && currentScript && latestScript !== currentScript && appMode === 'top') {\n          const freshUrl = new URL(window.location.href);\n          freshUrl.searchParams.set('__ui_v', latestScript);\n          window.location.replace(freshUrl.toString());\n        }",
  'safe freshness reload condition'
);

replaceOnce(
  "  }, []);\n\n  useEffect(() => {\n    if (isDarkMode) {",
  "  }, [appMode]);\n\n  useEffect(() => {\n    if (isDarkMode) {",
  'freshness appMode dependency'
);

replaceOnce(
  "    setTimeout(() => {\n      nextQuizCard();\n    }, 2000);",
  "    if (orderAdvanceTimerRef.current !== null) {\n      window.clearTimeout(orderAdvanceTimerRef.current);\n    }\n    orderAdvanceTimerRef.current = window.setTimeout(() => {\n      orderAdvanceTimerRef.current = null;\n      nextQuizCard();\n    }, 2000);",
  'tracked order advance timeout'
);

replaceOnce(
  "  // Time Attack Timer\n  useEffect(() => {\n    if (appMode === 'time' && timeLeft > 0) {",
  "  // Prevent a delayed word-order result from navigating after the learner has left that mode.\n  useEffect(() => {\n    if (appMode !== 'order' && orderAdvanceTimerRef.current !== null) {\n      window.clearTimeout(orderAdvanceTimerRef.current);\n      orderAdvanceTimerRef.current = null;\n    }\n  }, [appMode]);\n\n  useEffect(() => () => {\n    if (orderAdvanceTimerRef.current !== null) {\n      window.clearTimeout(orderAdvanceTimerRef.current);\n    }\n  }, []);\n\n  // Time Attack Timer. Opening the explanation pauses the countdown/auto-advance.\n  useEffect(() => {\n    if (appMode === 'time' && isQuizCommentOpen) return;\n    if (appMode === 'time' && timeLeft > 0) {",
  'timer guards and order cleanup'
);

replaceOnce(
  "  }, [appMode, timeLeft, isFlipped, resultDisplayTime]);",
  "  }, [appMode, timeLeft, isFlipped, resultDisplayTime, isQuizCommentOpen]);",
  'time timer dependencies'
);

replaceAll(
  "onClick={() => setIsCommentOpen(!isCommentOpen)}",
  "onClick={(e) => { e.stopPropagation(); setIsCommentOpen(!isCommentOpen); }}",
  'standard VQ comment click guard'
);
replaceAll(
  "onClick={() => setIsQuizCommentOpen(!isQuizCommentOpen)}",
  "onClick={(e) => { e.stopPropagation(); setIsQuizCommentOpen(!isQuizCommentOpen); }}",
  'quiz comment click guards',
  2
);
replaceOnce(
  "onClick={() => setShowHint(true)}",
  "onClick={(e) => { e.stopPropagation(); setShowHint(true); }}",
  'Hope mini open guard'
);
replaceOnce(
  "onClick={() => setShowHint(false)}\n                        className=\"w-full bg-slate-50",
  "onClick={(e) => { e.stopPropagation(); setShowHint(false); }}\n                        className=\"w-full bg-slate-50",
  'Hope mini close guard'
);

replaceOnce(
  "<span>{isFlipped ? \"答え確認中: \" : \"\"}{timeLeft}秒</span>",
  "<span>{isQuizCommentOpen ? '解説確認中（停止）' : `${isFlipped ? '答え確認中: ' : ''}${timeLeft}秒`}</span>",
  'time paused label'
);

fs.writeFileSync(path, app);
console.log('Interaction regression fixes applied.');
