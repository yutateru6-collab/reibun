import { useLayoutEffect, useRef } from 'react';

/**
 * Enter a study screen with the card centred in the visible (not layout)
 * viewport. Normal navigation still starts at the top of the page.
 *
 * Only a new screen/card or an untouched viewport resize can recenter. Flips,
 * expanded explanations and manual scrolling must never be pulled back.
 */
export function useStudyCardFocus(active: boolean, navigationKey: string) {
  const screenRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const screen = screenRef.current;
    const card = screen?.querySelector<HTMLElement>('[data-ui="study-card-focus"]');
    if (!active || !screen || !card) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    const originalMinHeight = screen.style.minHeight;
    const originalAnchor = screen.style.overflowAnchor;
    const originalMargin = card.style.marginTop;
    let disposed = false;
    let userInteracted = false;
    let frame = 0;
    const viewport = window.visualViewport;
    screen.style.overflowAnchor = 'none';

    function centerCard() {
      if (disposed || userInteracted || !screen || !card || !card.isConnected) return;
      // Never undo a user's pinch zoom or scroll them away from a focused input.
      if (viewport && Math.abs(viewport.scale - 1) > 0.01) return;
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused.matches('input, textarea, select, [contenteditable="true"]')) return;

      // Always calculate from the natural layout; repeated resize events must
      // not accumulate blank space above or below the card.
      screen.style.minHeight = originalMinHeight;
      card.style.marginTop = originalMargin;
      const height = viewport?.height || window.innerHeight;
      const offset = viewport?.offsetTop || 0;
      const box = card.getBoundingClientRect();
      const desiredTop = offset + Math.max(16, (height - box.height) / 2);
      const documentTop = box.top + window.scrollY;
      const extraBefore = Math.max(0, desiredTop - documentTop);
      if (extraBefore > 0) {
        const baseMargin = parseFloat(getComputedStyle(card).marginTop) || 0;
        card.style.marginTop = `${baseMargin + extraBefore}px`;
      }

      const target = Math.max(0, card.getBoundingClientRect().top + window.scrollY - desiredTop);
      const scrolling = document.scrollingElement || document.documentElement;
      const maxScroll = Math.max(0, scrolling.scrollHeight - scrolling.clientHeight);
      // Leave enough room after the navigation controls to reach the centre
      // even when the card is the last substantial element on a short page.
      if (target > maxScroll) {
        const screenBox = screen.getBoundingClientRect();
        const screenTop = screenBox.top + window.scrollY;
        // Growing padding alone can be swallowed by min-height: 100vh's empty
        // space. Set the required total height instead, so scrolling can reach
        // the target on short cloze pages as well as long sentence pages.
        const neededHeight = target + scrolling.clientHeight - screenTop + 1;
        screen.style.minHeight = `${Math.ceil(Math.max(screenBox.height, neededHeight))}px`;
      }
      window.scrollTo({ top: target, left: window.scrollX, behavior: 'instant' });
      card.dataset.focusPosition = box.height > height - 32 ? 'top' : 'center';
    }

    function schedule() {
      if (disposed || userInteracted) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(centerCard);
    }
    function respectUser() {
      userInteracted = true;
      cancelAnimationFrame(frame);
    }

    // Before first paint, then once after the rest of the screen's effects.
    centerCard();
    schedule();
    void document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
    viewport?.addEventListener('resize', schedule);
    window.addEventListener('pointerdown', respectUser, { passive: true });
    window.addEventListener('touchmove', respectUser, { passive: true });
    window.addEventListener('wheel', respectUser, { passive: true });
    window.addEventListener('keydown', respectUser);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      viewport?.removeEventListener('resize', schedule);
      window.removeEventListener('pointerdown', respectUser);
      window.removeEventListener('touchmove', respectUser);
      window.removeEventListener('wheel', respectUser);
      window.removeEventListener('keydown', respectUser);
      screen.style.minHeight = originalMinHeight;
      screen.style.overflowAnchor = originalAnchor;
      card.style.marginTop = originalMargin;
      delete card.dataset.focusPosition;
    };
  }, [active, navigationKey]);

  return screenRef;
}
