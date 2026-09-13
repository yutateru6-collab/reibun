import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { answerLabel, FORMATS, ORIGINS, type Question, type Worksheet } from './model';
export type Paper = 'a4' | 'b4';
export type PrintOutput = 'questions' | 'answers' | 'both';
interface Entry { q: Question; number: number; section?: string; solution: boolean }
interface Page { columns: Entry[][]; solution: boolean }
function Item({ entry }: { entry: Entry; key?: string }) {
  const { q, number, section, solution } = entry;
  return <article className="wp-item" data-id={q.id} data-number={number} data-choice={!!q.choices}>
    {section && <h2 className="wp-section">{section}</h2>}
    <h3>{number}.　〔{ORIGINS[q.origin]}〕　{FORMATS[q.format]}</h3>
    {solution ? <>
      <div className="wp-solution">{answerLabel(q)}</div>
      <p className="wp-explanation">{q.explanation}</p>
    </> : <>
      <p className="wp-instruction">{q.instruction}</p>
      <div className="wp-prompt">{q.prompt}</div>
      {q.tokens && <p className="wp-pool">（ {q.tokens.join(' / ')} ）</p>}
      {q.choices && <div className="wp-options">{q.choices.map((c, i) => <div key={c.id}>{String.fromCharCode(65 + i)}.　{c.text}</div>)}</div>}
      {q.note && <p className="wp-note">※ {q.note}</p>}
      <div className="wp-line" />
      {(!q.choices && ['translation', 'rewrite', 'correction', 'order', 'reading'].includes(q.format)) && <div className="wp-line" />}
    </>}
  </article>;
}
export default function PrintDocument({ worksheet, paper, output, onReady }: { worksheet: Worksheet; paper: Paper; output: PrintOutput; onReady: (ready: boolean) => void }) {
  const measure = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState('');
  const entries = useMemo(() => {
    const parts: Entry[][] = [];
    for (const solution of [false, true]) {
      if (output === 'questions' && solution || output === 'answers' && !solution) continue;
      let previous = '';
      parts.push(worksheet.questions.map((q, i) => {
        const section = worksheet.selection.grouping === 'sections' && previous !== q.origin ? ORIGINS[q.origin] : undefined;
        previous = q.origin;
        return { q, number: i + 1, section, solution };
      }));
    }
    return parts;
  }, [worksheet, output]);
  useLayoutEffect(() => {
    let alive = true;
    onReady(false);
    const paginate = () => {
      if (!alive || !measure.current || window.matchMedia('print').matches) return;
      const limit = measure.current.querySelector<HTMLElement>('.wp-measure-height')!.getBoundingClientRect().height - 3;
      const measured = [...measure.current.querySelectorAll<HTMLElement>('.wp-item')];
      let offset = 0;
      const result: Page[] = [];
      const columnCount = paper === 'b4' ? 2 : 1;
      let tooTall = false;
      for (const part of entries) {
        let page: Page = { columns: [[]], solution: part[0]?.solution ?? false };
        let column = 0, used = 0;
        for (const entry of part) {
          const h = measured[offset++]?.getBoundingClientRect().height ?? limit + 1;
          if (h > limit) tooTall = true;
          if (used + h > limit && page.columns[column].length) {
            if (column + 1 < columnCount) { column++; page.columns.push([]); }
            else { result.push(page); page = { columns: [[]], solution: entry.solution }; column = 0; }
            used = 0;
          }
          page.columns[column].push(entry); used += h;
        }
        if (page.columns[0].length) result.push(page);
      }
      setError(tooTall ? '1問がページの高さを超えています。別の用紙・問題数で作成してください。' : '');
      setPages(result); onReady(!tooTall && result.length > 0);
    };
    // Await font settlement before enabling print, so pagination cannot change mid-print.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => { if (alive) paginate(); });
    return () => { alive = false; };
  }, [entries, paper, onReady]);
  return <div className="wp-document" data-paper={paper} data-ready={pages.length > 0 && !error}>
    <style>{`@page { size: ${paper === 'b4' ? '364mm 257mm' : '210mm 297mm'}; margin: 0; }`}</style>
    {error && <p className="wb-notice" role="alert">{error}</p>}
    <div className="wp-measure" ref={measure} aria-hidden="true"><div className="wp-measure-height" />{entries.flat().map(e => <Item key={`${e.solution}-${e.q.id}`} entry={e} />)}</div>
    {pages.map((page, i) => <section className="wp-page" key={i} data-part={page.solution ? 'answers' : 'questions'}>
      <header className="wp-pageheader">
        <h2>{worksheet.title}</h2>
        <div className="wp-meta">{page.solution ? '解答・解説' : '問題'}　｜　全{worksheet.questions.length}問　｜　{worksheet.id}</div>
        {!page.solution && <div className="wp-name">年　　　組　　　番　　　氏名：＿＿＿＿＿＿＿＿＿＿＿＿</div>}
      </header>
      <div className="wp-columns">{page.columns.map((column, c) => <div className="wp-column" key={c}>{column.map(e => <Item key={e.q.id} entry={e} />)}</div>)}</div>
      <footer className="wp-footer"><span>{worksheet.id}　{page.solution ? '解答・解説' : '問題'}</span><span>{i + 1} / {pages.length}</span></footer>
    </section>)}
  </div>;
}
