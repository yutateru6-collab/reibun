import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ExamRangeGuide from './ExamRangeGuide.tsx';
import Workbook from './workbook/Workbook';
import SimpleGrammarCheckV3 from './knowledge/SimpleGrammarCheckV3';
import './index.css';

// The v2 rollout briefly forced ordinary study cards into random order.
// Quiz modes now shuffle independently, so restore normal study order once for learners
// who received that migration. They can still turn card shuffling on themselves.
try {
  const forcedShuffleKey = 'flashcard-shuffle-default:v2';
  const rollbackKey = 'flashcard-shuffle-default-rollback:v3';
  if (localStorage.getItem(forcedShuffleKey) === 'done' && localStorage.getItem(rollbackKey) !== 'done') {
    localStorage.setItem('flashcard-shuffle', 'false');
    localStorage.setItem(rollbackKey, 'done');
  }
} catch {
  // Storage can be unavailable (for example in restricted/private contexts).
  // The app continues to work with its in-memory defaults.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ExamRangeGuide />
    <Workbook />
    <SimpleGrammarCheckV3 />
  </StrictMode>,
);
