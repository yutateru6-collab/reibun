import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ExamRangeGuide from './ExamRangeGuide.tsx';
import Workbook from './workbook/Workbook';
import SimpleGrammarCheckV2 from './knowledge/SimpleGrammarCheckV2';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ExamRangeGuide />
    <Workbook />
    <SimpleGrammarCheckV2 />
  </StrictMode>,
);
