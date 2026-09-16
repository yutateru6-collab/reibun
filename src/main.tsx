import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ExamRangeGuide from './ExamRangeGuide.tsx';
import Workbook from './workbook/Workbook';
import SimpleGrammarCheckV3 from './knowledge/SimpleGrammarCheckV3';
import './index.css';

// Turn question-order shuffling on once for existing learners as well as new installs.
// After this one-time migration, the learner can still switch shuffle off manually.
try {
  const shuffleMigrationKey = 'flashcard-shuffle-default:v2';
  if (localStorage.getItem(shuffleMigrationKey) !== 'done') {
    localStorage.setItem('flashcard-shuffle', 'true');
    localStorage.setItem(shuffleMigrationKey, 'done');
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
