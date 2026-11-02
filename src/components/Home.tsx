import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { WatchItem } from "../types";
import { findCategory } from "../lib/categories";
import { moveItem } from "../lib/favorites";
import type { OfferGroup } from "../lib/offers";
import { OfferList } from "./OfferList";
import { ZipPrompt } from "./ZipPrompt";

interface Props {
  validZip: boolean;
  onZipChange: (zip: string) => void;
  noMarkets: boolean;
  watchlist: WatchItem[];
  onWatchlistChange: (list: WatchItem[]) => void;
  /** Angebote pro Favorit, schon sortiert */
  groups: OfferGroup[];
  newIds: Set<string>;
  loading: boolean;
  /** "Stand: …" oder eine Fehlermeldung */
  status: string;
  statusIsError: boolean;
  /** Zu Entdecken wechseln */
  onDiscover: () => void;
}

/** Kommas trennen in der Suche die Begriffe, deshalb raus damit */
function cleanTerm(term: string): string {
  return term.replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Startseite: Angebote für alle Favoriten, in der Reihenfolge der Favoriten. "Bearbeiten" zeigt nur
 * die Namen, wie in iOS-Listen: ≡ ziehen zum Sortieren, Namen antippen zum Umbenennen, ✕ zum Entfernen.
 */
export function Home({
  validZip,
  onZipChange,
  noMarkets,
  watchlist,
  onWatchlistChange,
  groups,
  newIds,
  loading,
  status,
  statusIsError,
  onDiscover,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  // Favorit, der gerade umbenannt wird, und der Text im Feld
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(term: string) {
    setEditing(term);
    setDraft(term);
  }

  /** Umbenennen übernehmen; leer, unverändert oder schon vorhanden: einfach schließen */
  function saveEdit() {
    if (editing === null) return;
    const clean = cleanTerm(draft);
    const taken = watchlist.some((w) => w.term !== editing && w.term.toLowerCase() === clean.toLowerCase());
    if (clean && clean !== editing && !taken) {
      onWatchlistChange(watchlist.map((w) => (w.term === editing ? { ...w, term: clean } : w)));
    }
    setEditing(null);
  }

  // Sortieren: Griff ≡ festhalten und ziehen. from/to: Platz vorher/nachher, dy: wie weit gezogen
  const [drag, setDrag] = useState<{ from: number; to: number; dy: number; startY: number; rowH: number } | null>(
    null,
  );

  function onHandleDown(e: PointerEvent<HTMLButtonElement>, index: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rowH = e.currentTarget.closest("li")!.getBoundingClientRect().height;
    setDrag({ from: index, to: index, dy: 0, startY: e.clientY, rowH });
  }

  function onHandleMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const dy = e.clientY - drag.startY;
    const to = Math.max(0, Math.min(watchlist.length - 1, drag.from + Math.round(dy / drag.rowH)));
    setDrag({ ...drag, dy, to });
  }

  function onHandleUp() {
    if (!drag) return;
    if (drag.to !== drag.from) onWatchlistChange(moveItem(watchlist, drag.from, drag.to));
    setDrag(null);
  }

  /** Tastatur: Pfeil hoch/runter verschiebt um einen Platz */
  function onHandleKey(e: KeyboardEvent, index: number) {
    const step = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    onWatchlistChange(moveItem(watchlist, index, index + step));
  }

  /** Gezogene Zeile folgt dem Finger, die überholten rutschen einen Platz weiter */
  function rowStyle(index: number): CSSProperties | undefined {
    if (!drag) return undefined;
    const { from, to, dy, rowH } = drag;
    if (index === from) return { transform: `translateY(${dy}px)` };
    if (from < to && index > from && index <= to) return { transform: `translateY(${-rowH}px)` };
    if (from > to && index >= to && index < from) return { transform: `translateY(${rowH}px)` };
    return undefined;
  }

  const counts = new Map(groups.map((g) => [g.term, g.offers.length]));
  /** Kategorie-Favoriten mit ihrem Emoji, z. B. "🥣 Müsli" */
  function withEmoji(term: string): string {
    const emoji = findCategory(watchlist.find((w) => w.term === term)?.categoryId)?.emoji;
    return emoji ? `${emoji} ${term}` : term;
  }

  return (
    <>
      {!validZip ? (
        <ZipPrompt onZipChange={onZipChange} />
      ) : (
        status && <p className={`status${statusIsError ? " status-error" : ""}`}>{status}</p>
      )}

      {noMarkets && (
        <p className="notice">
          Du hast unter <b>Einstellungen</b> alle Märkte abgewählt, deshalb siehst du keine Angebote.
        </p>
      )}

      {!validZip ? null : watchlist.length === 0 ? (
        <div className="empty">
          <p>
            Noch keine Favoriten. Such unter <b>Entdecken</b> nach Marken, Produkten oder Kategorien und tipp auf{" "}
            <b>☆ Merken</b>. Dann siehst du die Angebote hier.
          </p>
          <button className="primary big" onClick={onDiscover}>
            🔍 Favoriten entdecken
          </button>
        </div>
      ) : (
        <>
          <div className="fav-bar">
            <span>Deine Favoriten</span>
            <button className="link-btn plain" onClick={() => setEditMode((on) => !on)}>
              {editMode ? "Fertig" : "Bearbeiten"}
            </button>
          </div>

          {editMode ? (
            <section className="card">
              <ul className={`watchlist${drag ? " sorting" : ""}`}>
                {watchlist.map((w, index) => {
                  const count = counts.get(w.term) ?? 0;
                  return (
                    <li key={w.term} className={drag?.from === index ? "dragging" : ""} style={rowStyle(index)}>
                      <button
                        className="drag-handle"
                        data-no-swipe
                        onPointerDown={(e) => onHandleDown(e, index)}
                        onPointerMove={onHandleMove}
                        onPointerUp={onHandleUp}
                        onPointerCancel={() => setDrag(null)}
                        onKeyDown={(e) => onHandleKey(e, index)}
                        aria-label={`${w.term} verschieben (Pfeiltasten)`}
                      >
                        ≡
                      </button>
                      {editing === w.term ? (
                        <form
                          className="watch-edit"
                          onSubmit={(e) => {
                            e.preventDefault();
                            saveEdit();
                          }}
                        >
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                            enterKeyHint="done"
                            aria-label={`${w.term} umbenennen`}
                          />
                        </form>
                      ) : (
                        <button className="watch-name" onClick={() => startEdit(w.term)} title="Antippen zum Umbenennen">
                          <span className="watch-term">
                            {withEmoji(w.term)} <span className="watch-edit-hint" aria-hidden>✎</span>
                          </span>
                          <span className="watch-count">
                            {count === 0 ? "gerade kein Angebot" : count === 1 ? "1 Angebot" : `${count} Angebote`}
                          </span>
                        </button>
                      )}
                      <button
                        className="remove-inline"
                        onClick={() => onWatchlistChange(watchlist.filter((x) => x.term !== w.term))}
                        aria-label={`${w.term} entfernen`}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="hint hint-tight">
                ≡ festhalten und ziehen zum Sortieren, Namen antippen zum Umbenennen, ✕ zum Entfernen.
              </p>
            </section>
          ) : (
            groups.map((group) => (
              <section key={group.term} className="group">
                <h2>
                  {withEmoji(group.term)}
                  <span className="count">{group.offers.length}</span>
                </h2>
                {group.offers.length === 0 ? (
                  <p className="none">{loading ? "…" : "Gerade kein Angebot bekannt."}</p>
                ) : (
                  <OfferList offers={group.offers} newIds={newIds} />
                )}
              </section>
            ))
          )}

          <button className="secondary big" onClick={onDiscover}>
            ＋ Weitere Favoriten entdecken
          </button>
        </>
      )}
    </>
  );
}
