import { useRef, type RefObject, type TouchEvent } from "react";

/** Mindeststrecke in px, ab der ein Wisch den Tab wechselt */
const MIN_DISTANCE = 70;
/** Wie stark die Seite dem Finger folgt (1 = genau mit dem Finger) */
const FOLLOW = 0.35;

/**
 * Nach links/rechts wischen wechselt zum nächsten/vorherigen Tab. Die Seite (pageRef) folgt dabei
 * leicht dem Finger und federt zurück, wenn der Wisch zu kurz war. Senkrechtes Scrollen,
 * Eingabefelder und waagerecht scrollbare Bereiche (z. B. die Marken-Chips) bleiben unberührt.
 * onSwipe gibt false zurück, wenn es in die Richtung keinen Tab mehr gibt.
 */
export function useSwipeTabs(pageRef: RefObject<HTMLElement | null>, onSwipe: (direction: 1 | -1) => boolean) {
  const start = useRef<{ x: number; y: number; ignore: boolean; axis: "x" | "y" | null } | null>(null);

  function setOffset(px: number, animate: boolean) {
    const page = pageRef.current;
    if (!page) return;
    page.style.transition = animate ? "transform 0.25s ease-out" : "none";
    page.style.transform = px ? `translateX(${px}px)` : "";
  }

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const ignore = !!target.closest("input, textarea, select, .brand-chips, .sheet, .whatsnew, [data-no-swipe]");
    start.current = { x: touch.clientX, y: touch.clientY, ignore, axis: null };
  }

  function onTouchMove(e: TouchEvent) {
    const s = start.current;
    if (!s || s.ignore) return;
    const touch = e.touches[0];
    const dx = touch.clientX - s.x;
    const dy = touch.clientY - s.y;
    // Richtung einmal festlegen, sobald der Finger sich merklich bewegt
    if (!s.axis && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) s.axis = Math.abs(dx) > Math.abs(dy) * 1.5 ? "x" : "y";
    if (s.axis === "x") setOffset(dx * FOLLOW, false);
  }

  function onTouchEnd(e: TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s || s.ignore || s.axis !== "x") return;
    const dx = e.changedTouches[0].clientX - s.x;
    const switched = Math.abs(dx) >= MIN_DISTANCE && onSwipe(dx < 0 ? 1 : -1);
    // Bei Wechsel gleitet die neue Seite herein (CSS-Animation); sonst zurückfedern
    if (!switched) setOffset(0, true);
  }

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: () => setOffset(0, true) };
}
