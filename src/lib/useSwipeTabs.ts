import { useRef, type TouchEvent } from "react";

/** Mindeststrecke in px, ab der ein Wisch den Tab wechselt */
const MIN_DISTANCE = 70;

/**
 * Nach links/rechts wischen wechselt zum nächsten/vorherigen Tab. Senkrechtes Scrollen,
 * Eingabefelder und waagerecht scrollbare Bereiche (z. B. die Marken-Chips) bleiben unberührt.
 */
export function useSwipeTabs(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number; ignore: boolean } | null>(null);

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const ignore = !!target.closest("input, textarea, select, .brand-chips, .sheet, .whatsnew, [data-no-swipe]");
    start.current = { x: touch.clientX, y: touch.clientY, ignore };
  }

  function onTouchEnd(e: TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s || s.ignore) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - s.x;
    const dy = touch.clientY - s.y;
    // klar waagerecht und weit genug
    if (Math.abs(dx) >= MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.8) onSwipe(dx < 0 ? 1 : -1);
  }

  return { onTouchStart, onTouchEnd };
}
