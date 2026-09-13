import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Printer, Home, ChevronLeft } from 'lucide-react';
import { QUESTION_BANK } from './bank';
import { answerLabel, eligible, FORMATS, makeWorksheet, MISTAKES_KEY, ORIGINS, randomSeed, readHistory, readMistakes, saveHistory, UNITS, type Format, type Origin, type Selection, type Worksheet } from './model';
import PrintDocument, { type Paper, type PrintOutput } from './PrintDocument';
import { useDialog } from './useDialog';
import './workbook.css';

type View = 'setup' | 'practice' | 'result' | 'print';
type Grade = 'correct' | 'incorrect';
const ORIGIN_KEYS = Object.keys(ORIGINS) as Origin[];
const descriptions: Record<Origin, string> = { original: '元の英文・空欄・出題形式を維持', transformed: '基本例文を穴埋め・並べ替えに変更', application: '同じ文法範囲の新しい英文・会話' };
const defaultSelection: Selection = { unit: 'both', format: 'all', counts: { original: 10, transformed: 5, application: 5 }, shuffle: true, shuffleChoices: true, grouping: 'sections' };

export default function Workbook() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('setup');
  const [selection, setSelection] = useState<Selection>(defaultSelection);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [printSheet, setPrintSheet] = useState<Worksheet | null>(null);
  const [returnView, setReturnView] = useState<View>('setup');
  const [history, setHistory] = useState<Worksheet[]>(readHistory);
  const [mistakeIds, setMistakeIds] = useState<string[]>(readMistakes);
  const [notice, setNotice] = useState('');
  const [index, setIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [paper, setPaper] = useState<Paper>('a4');
  const [output, setOutput] = useState<PrintOutput>('questions');
  const [printReady, setPrintReady] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const pool = useMemo(() => eligible(QUESTION_BANK, selection), [selection]);
  const available = useMemo(() => Object.fromEntries(ORIGIN_KEYS.map(o => [o, pool.filter(q => q.origin === o).length])) as Record<Origin, number>, [pool]);
  const total = ORIGIN_KEYS.reduce((sum, o) => sum + (selection.counts[o] === -1 ? available[o] : selection.counts[o]), 0);
  const invalid = total === 0 || ORIGIN_KEYS.some(o => selection.counts[o] > available[o]);
  const question = worksheet?.questions[index];
  const mistakes = worksheet?.questions.filter(q => grades[q.id] === 'incorrect') ?? [];

  useEffect(() => {
    const sync = () => { const next = document.querySelector<HTMLElement>('[data-ui="compact-home-bento-v1"] .grid.grid-cols-2'); setTarget(prev => prev === next ? prev : next); };
    sync(); const observer = new MutationObserver(sync);
    const root = document.getElementById('root'); if (root) observer.observe(root, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, []);
  useDialog(open, () => setOpen(false), '[data-ui="workbook-dialog"]');
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [view, index]);
  useEffect(() => {
    if (view !== 'print' || !printSheet || !open) return;
    const previous = document.title; document.title = `${printSheet.id} ${output === 'answers' ? '解答' : '問題'} ${printSheet.title}`;
    return () => { document.title = previous; };
  }, [view, printSheet, output, open]);

  function store(sheet: Worksheet) {
    if (saveHistory(sheet)) setHistory(readHistory());
    else setNotice('このブラウザでは保存できませんでした。現在の問題は練習・印刷できますが、再読み込みすると消えます。');
  }
  function resetStudy(sheet: Worksheet) {
    setWorksheet(sheet); setIndex(0); setGrades({}); setResponses({}); setRevealed({}); setSelectedOptions({});
  }
  function openPrint(sheet: Worksheet, back: View) { setPrintSheet(sheet); setReturnView(back); setView('print'); setPrintReady(false); store(sheet); }
  function create(next: 'practice' | 'print') {
    try { setNotice(''); const sheet = makeWorksheet(QUESTION_BANK, selection); resetStudy(sheet); store(sheet); if (next === 'print') openPrint(sheet, 'setup'); else setView('practice'); }
    catch (e) { setNotice(e instanceof Error ? e.message : '問題セットを作成できませんでした。'); }
  }
  function changeFilter(patch: Partial<Selection>) {
    const next = { ...selection, ...patch }; const filtered = eligible(QUESTION_BANK, next);
    next.counts = Object.fromEntries(ORIGIN_KEYS.map(o => [o, Math.min(o === 'original' ? 10 : 5, filtered.filter(q => q.origin === o).length)])) as Record<Origin, number>;
    setSelection(next); setNotice('');
  }
  function grade(id: string, value: Grade) {
    setGrades(prev => ({ ...prev, [id]: value }));
    const ids = value === 'correct' ? mistakeIds.filter(x => x !== id) : [...new Set([...mistakeIds, id])];
    setMistakeIds(ids);
    try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(ids)); } catch { setNotice('復習リストを保存できませんでした。この画面での採点は続けられます。'); }
  }
  function reviewSheet() {
    if (!worksheet || !mistakes.length) return;
    const review = { ...worksheet, id: `${worksheet.id}-R${randomSeed().toString(16).slice(0, 4).toUpperCase()}`, title: `${worksheet.title}（間違えた問題）`, questions: JSON.parse(JSON.stringify(mistakes)) };
    openPrint(review, view);
  }
  function savedMistakes() {
    const questions = QUESTION_BANK.filter(q => mistakeIds.includes(q.id));
    if (!questions.length) return;
    const sheet: Worksheet = { ...makeWorksheet(QUESTION_BANK, { ...defaultSelection, counts: { original: 1, transformed: 0, application: 0 } }), title: 'Vision Quest II　間違えた問題の復習', questions: JSON.parse(JSON.stringify(questions)), selection: { ...defaultSelection, grouping: 'mixed' } };
    resetStudy(sheet); store(sheet); setView('practice');
  }

  const launcher = target ? createPortal(<button type="button" data-ui="workbook-launcher" onClick={() => { setOpen(true); setView('setup'); setNotice(''); }} className="col-span-1 rounded-2xl sm:rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-800 p-4 sm:p-6 text-center shadow-sm hover:border-indigo-500 transition-colors min-h-[148px] sm:min-h-[180px] flex flex-col items-center justify-center">
    <span className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 mb-2.5 flex items-center justify-center"><BookOpen size={26} /></span>
    <span className="block text-lg sm:text-xl font-black text-slate-900 dark:text-white">時制の練習問題</span>
    <span className="block mt-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">画面で解く・プリントを作る</span>
  </button>, target) : null;

  return <>{launcher}{open && createPortal(<div className="wb-root" data-ui="workbook-dialog" role="dialog" aria-modal="true" aria-label="時制の練習問題">
    <header className="wb-header">
      <div><h1>時制の練習問題</h1><small>Vision Quest II ｜ 時制・完了形</small></div>
      <div className="wb-row">
        {view !== 'setup' && <button className="wb-btn" onClick={() => setView(view === 'print' ? returnView : 'setup')} aria-label="前の画面へ戻る"><ChevronLeft size={18} /></button>}
        <button className="wb-btn" onClick={() => setOpen(false)} aria-label="ホームへ戻る"><Home size={18} /></button>
      </div>
    </header>
    {view === 'print' && printSheet ? <>
      <div className="wb-print-controls">
        <div className="wb-row">
          <label className="wb-field">用紙<select aria-label="用紙" value={paper} onChange={e => { setPrintReady(false); setPaper(e.target.value as Paper); }}><option value="a4">A4縦</option><option value="b4">B4横・2段組（JIS）</option></select></label>
          <label className="wb-field">出力内容<select aria-label="出力内容" value={output} onChange={e => { setPrintReady(false); setOutput(e.target.value as PrintOutput); }}><option value="questions">問題のみ</option><option value="answers">解答・解説のみ</option><option value="both">問題＋解答・解説</option></select></label>
          <button className="wb-btn wb-primary" data-action="print" disabled={!printReady} onClick={() => window.print()}><Printer size={18} style={{ display: 'inline', marginRight: 8 }} />{printReady ? '印刷／PDF保存' : 'レイアウトを準備中…'}</button>
          <button className="wb-btn" onClick={() => { if (worksheet?.id !== printSheet.id) resetStudy(printSheet); setView('practice'); }}>このセットで練習</button>
        </div>
        <p className="wb-muted">印刷画面で用紙サイズを合わせ、倍率100％・ヘッダーとフッターなしを選んでください。PDF保存はブラウザの印刷画面から行います。プレビューは横にスクロールできます。</p>
        {notice && <p className="wb-notice" role="status">{notice}</p>}
      </div>
      <div className="wb-print-scroll"><PrintDocument worksheet={printSheet} paper={paper} output={output} onReady={setPrintReady} /></div>
    </> : <main className="wb-main" ref={mainRef}><div className="wb-container">
      {notice && <div className="wb-notice" role="status">{notice}</div>}
      {view === 'setup' && <>
        <section className="wb-card">
          <h2>練習する問題を選ぶ</h2><p className="wb-muted">画面で解く問題も、紙に印刷する問題も同じセット。作成後の並び順と選択肢は変わりません。</p>
          <div className="wb-fields">
            <label className="wb-field">範囲<select aria-label="範囲" value={selection.unit} onChange={e => changeFilter({ unit: e.target.value as Selection['unit'] })}>{(['both', 'tense1', 'tense2', 'hope3'] as const).map(u => <option key={u} value={u}>{UNITS[u]}</option>)}</select></label>
            <label className="wb-field">出題形式<select aria-label="出題形式" value={selection.format} onChange={e => changeFilter({ format: e.target.value as Format | 'all' })}><option value="all">すべての形式</option>{Object.entries(FORMATS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          </div>
          <div className="wb-counts">{ORIGIN_KEYS.map(o => <label className="wb-count" key={o}><div><strong>{ORIGINS[o]}</strong><small>{descriptions[o]}<br />選べる問題：{available[o]}問</small></div><select aria-label={`${ORIGINS[o]}の問題数`} value={selection.counts[o]} onChange={e => setSelection({ ...selection, counts: { ...selection.counts, [o]: Number(e.target.value) } })}>{[...new Set([0, 3, 5, 10, 20, 30, selection.counts[o]])].filter(n => n >= 0 && n <= available[o]).sort((a, b) => a - b).map(n => <option key={n} value={n}>{n}問</option>)}{available[o] > 0 && <option value={-1}>全{available[o]}問</option>}</select></label>)}</div>
          <div className="wb-fields">
            <div><label className="wb-check"><input type="checkbox" checked={selection.shuffle} onChange={e => setSelection({ ...selection, shuffle: e.target.checked })} />小問の順番をシャッフル</label><label className="wb-check"><input type="checkbox" checked={selection.shuffleChoices} onChange={e => setSelection({ ...selection, shuffleChoices: e.target.checked })} />選択問題の選択肢もシャッフル</label></div>
            <label className="wb-field">問題の並べ方<select aria-label="問題の並べ方" value={selection.grouping} onChange={e => setSelection({ ...selection, grouping: e.target.value as Selection['grouping'] })}><option value="sections">種類ごとに部を分ける</option><option value="mixed">種類を混ぜる（各問に区分を表示）</option></select></label>
          </div>
          <p className="wb-muted">元の問題の英文・空欄・語群は変更しません。原資料に不整合がある設問には注記を付けます。画像が必要な未収録問題は出題しません。</p>
          {invalid && <p className="wb-notice">この条件では問題がありません。問題数や出題形式を変更してください。</p>}
          <div className="wb-actions"><button className="wb-btn wb-primary" disabled={invalid} onClick={() => create('practice')}><BookOpen size={18} style={{ display: 'inline', marginRight: 8 }} />{total}問で練習を始める</button><button className="wb-btn" disabled={invalid} onClick={() => create('print')}><Printer size={18} style={{ display: 'inline', marginRight: 8 }} />{total}問のプリントを作る</button></div>
        </section>
        <section className="wb-card"><h3>続き・復習</h3><p className="wb-muted">最近の8セットをこのブラウザに保存します。他の端末とは同期しません。解答欄と今回の採点結果は、この画面を開いている間のみ保持します。</p><div className="wb-actions"><button className="wb-btn" disabled={!worksheet} onClick={() => setView('practice')}>今のセットに戻る</button><button className="wb-btn" disabled={!mistakeIds.some(id => QUESTION_BANK.some(q => q.id === id))} onClick={savedMistakes}>間違えた問題を復習</button></div>
          <div className="wb-history" style={{ marginTop: 16 }}>{history.map(w => <button className="wb-btn" key={w.id} onClick={() => openPrint(w, 'setup')}><strong>{w.questions.length}問 ｜ {w.title}</strong><br /><small>{w.id}</small></button>)}</div>
        </section>
      </>}
      {view === 'practice' && worksheet && question && <>
        <div className="wb-row" style={{ justifyContent: 'space-between' }}><strong>{index + 1} / {worksheet.questions.length}問</strong><button className="wb-btn" onClick={() => openPrint(worksheet, 'practice')}>今回の問題を印刷</button></div>
        <progress className="wb-progress" value={index + 1} max={worksheet.questions.length} aria-label="学習の進み具合" />
        <article className="wb-card" data-ui="workbook-question" data-id={question.id}>
          <span className="wb-badge">{ORIGINS[question.origin]}</span><span className="wb-badge">{FORMATS[question.format]}</span>
          <p className="wb-instruction">{question.instruction}</p><div className="wb-stem">{question.prompt}</div>
          {question.tokens && <p className="wb-stem" style={{ fontSize: 18 }}>（ {question.tokens.join(' / ')} ）</p>}
          {question.note && <p className="wb-notice">※ {question.note}</p>}
          {question.choices ? <div className="wb-options">{question.choices.map((c, i) => <button className="wb-btn" key={c.id} disabled={!!selectedOptions[question.id]} data-state={selectedOptions[question.id] ? c.id === question.correctId ? 'correct' : c.id === selectedOptions[question.id] ? 'wrong' : 'other' : 'unanswered'} onClick={() => { if (selectedOptions[question.id]) return; setSelectedOptions(prev => ({ ...prev, [question.id]: c.id })); setRevealed(prev => ({ ...prev, [question.id]: true })); grade(question.id, c.id === question.correctId ? 'correct' : 'incorrect'); }}>{String.fromCharCode(65 + i)}.　{c.text}</button>)}</div> : <>
            <label className="wb-field">解答欄<textarea aria-label="解答欄" rows={3} value={responses[question.id] ?? ''} onChange={e => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))} placeholder="ここに解答を書くか、ノートに書いてから答えを確認してください。" autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
            <button className="wb-btn wb-primary" style={{ marginTop: 16 }} onClick={() => setRevealed(prev => ({ ...prev, [question.id]: !prev[question.id] }))}>{revealed[question.id] ? '答えを隠す' : '解答・解説を見る'}</button>
          </>}
          {revealed[question.id] && <section className="wb-answer" role="status"><p>{question.choices ? (grades[question.id] === 'correct' ? '正解！' : '答えを確認しよう') : '解答例'}</p><strong>{answerLabel(question)}</strong><p>{question.explanation}</p>{!question.choices && <><p className="wb-muted">記述は自動で誤答判定しません。別解や意味も確認して自己採点してください。</p><div className="wb-actions"><button className="wb-btn" aria-pressed={grades[question.id] === 'correct'} onClick={() => grade(question.id, 'correct')}>できた</button><button className="wb-btn" aria-pressed={grades[question.id] === 'incorrect'} onClick={() => grade(question.id, 'incorrect')}>もう一度練習</button></div>{grades[question.id] && <p>{grades[question.id] === 'correct' ? '「できた」で記録しました。' : '復習リストに入れました。'}</p>}</>}</section>}
          <div className="wb-actions"><button className="wb-btn" disabled={index === 0} onClick={() => setIndex(n => n - 1)}>前の問題</button><button className="wb-btn wb-primary" onClick={() => index + 1 === worksheet.questions.length ? setView('result') : setIndex(n => n + 1)}>{index + 1 === worksheet.questions.length ? '結果を見る' : '次の問題'}</button></div>
          {!grades[question.id] && <p className="wb-muted">採点せず進んだ問題は「未判定」として扱います。</p>}
        </article>
      </>}
      {view === 'result' && worksheet && <section className="wb-card"><h2>今回の練習結果</h2><p style={{ fontSize: 22, fontWeight: 700 }}>できた：{Object.values(grades).filter(g => g === 'correct').length}問 ／ 復習：{mistakes.length}問 ／ 未判定：{worksheet.questions.length - Object.keys(grades).length}問</p><p className="wb-muted">記述問題の「できた」は自己採点です。</p><div className="wb-actions"><button className="wb-btn wb-primary" onClick={() => openPrint(worksheet, 'result')}>今回の問題を印刷</button><button className="wb-btn" disabled={!mistakes.length} onClick={reviewSheet}>間違えた問題だけ印刷</button><button className="wb-btn" onClick={() => { resetStudy(worksheet); setView('practice'); }}>同じセットでもう一度</button><button className="wb-btn" onClick={() => setView('setup')}>問題を選び直す</button></div></section>}
    </div></main>}
  </div>, document.body)}</>;
}
