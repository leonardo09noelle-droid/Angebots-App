import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon: string;
}

/** Innenabstand der Leiste in px, muss zu .tabbar { padding } in index.css passen */
const PADDING = 6;

interface Props<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

/**
 * Tab-Leiste im Liquid-Glass-Look. Antippen oder Finger auflegen und zur Seite ziehen:
 * die Glas-Blase folgt dem Finger, beim Loslassen wird der Tab darunter geöffnet.
 */
export function TabBar<T extends string>({ tabs, active, onChange }: Props<T>) {
  const navRef = useRef<HTMLElement>(null);
  // Fingerposition relativ zur Leiste, solange gezogen wird
  const [dragX, setDragX] = useState<number | null>(null);
  // Innenbreite der Leiste (ohne Rand), für Position und Größe der Blase
  const [width, setWidth] = useState(0);
  const activeIndex = tabs.findIndex((t) => t.id === active);

  useLayoutEffect(() => {
    const nav = navRef.current!;
    const measure = () => setWidth(nav.clientWidth - PADDING * 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  /** Fingerposition innerhalb der Innenfläche der Leiste */
  function localX(clientX: number): number {
    return clientX - navRef.current!.getBoundingClientRect().left - navRef.current!.clientLeft - PADDING;
  }

  const slot = width / tabs.length;
  const indexAt = (x: number) => Math.max(0, Math.min(tabs.length - 1, Math.floor(x / slot)));

  function onPointerDown(e: PointerEvent) {
    navRef.current!.setPointerCapture(e.pointerId);
    setDragX(localX(e.clientX));
  }

  function onPointerMove(e: PointerEvent) {
    if (dragX !== null) setDragX(localX(e.clientX));
  }

  function onPointerUp(e: PointerEvent) {
    if (dragX === null) return;
    setDragX(null);
    onChange(tabs[indexAt(localX(e.clientX))].id);
  }

  // Blase: beim Ziehen unter dem Finger, sonst auf dem aktiven Tab
  const hoverIndex = dragX === null ? activeIndex : indexAt(dragX);
  const bubbleLeft = dragX === null ? activeIndex * slot : Math.max(0, Math.min(width - slot, dragX - slot / 2));

  return (
    <nav
      ref={navRef}
      className={`tabbar${dragX !== null ? " dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragX(null)}
    >
      {width > 0 && (
        <span
          className="tab-bubble"
          aria-hidden
          style={{ width: slot, translate: `${bubbleLeft + PADDING}px 0` }}
        />
      )}
      {tabs.map((t, i) => (
        <button
          key={t.id}
          className={i === hoverIndex ? "active" : ""}
          // Tastatur/Screenreader; Finger und Maus laufen über die Pointer-Events der Leiste
          onClick={(e) => e.detail === 0 && onChange(t.id)}
          aria-current={t.id === active ? "page" : undefined}
        >
          <span className="tab-icon" aria-hidden>
            {t.icon}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
