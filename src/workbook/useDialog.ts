import { useEffect, useRef } from 'react';
// Shared by the quiz and workbook overlays. Keep background controls out of the tab order.
export function useDialog(open: boolean, close: () => void, selector: string) {
  const callback = useRef(close); callback.current = close;
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    const wasInert = root?.inert ?? false;
    const overflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...(document.querySelector(selector)?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? [])].filter(e => e.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); callback.current(); }
      if (e.key !== 'Tab') return;
      const list = focusables(); if (!list.length) { e.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !list.includes(document.activeElement as HTMLElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !list.includes(document.activeElement as HTMLElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handle);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', handle); if (root) root.inert = wasInert; document.body.style.overflow = overflow; before?.focus(); };
  }, [open, selector]);
}
