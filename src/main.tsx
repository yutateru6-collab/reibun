import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ExamRangeGuide from './ExamRangeGuide.tsx';
import Workbook from './workbook/Workbook';
import SimpleGrammarCheck from './knowledge/SimpleGrammarCheck';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ExamRangeGuide />
    <Workbook />
    <SimpleGrammarCheck />
  </StrictMode>,
);
