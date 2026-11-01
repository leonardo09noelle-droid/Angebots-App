import { useState, type FormEvent } from "react";
import type { WatchItem } from "../types";
import { isKnownBrand } from "../lib/brands";

interface Props {
  watchlist: WatchItem[];
  onWatchlistChange: (list: WatchItem[]) => void;
  /** Anzahl aktueller Angebote pro Merklisten-Eintrag */
  offerCounts: Map<string, number>;
  /** eingebaute + gelernte Marken */
  brands: string[];
}

const SUGGESTIONS = [
  "Monster Energy",
  "Red Bull",
  "Barebells",
  "Coca-Cola",
  "Pringles",
  "Haribo",
  "Nutella",
  "Jack Daniel's",
];

/** Merkliste: was die App für dich sucht */
export function MyProducts({ watchlist, onWatchlistChange, offerCounts, brands }: Props) {
  const [newTerm, setNewTerm] = useState("");
  const has = (term: string) => watchlist.some((w) => w.term.toLowerCase() === term.toLowerCase());

  function add(term: string) {
    // Kommas trennen in der Suche die Produkte, deshalb raus damit
    const clean = term.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (clean && !has(clean)) {
      onWatchlistChange([...watchlist, { term: clean, brandOnly: isKnownBrand(clean, brands) }]);
    }
  }

  function toggleBrandOnly(term: string) {
    onWatchlistChange(watchlist.map((w) => (w.term === term ? { ...w, brandOnly: !w.brandOnly } : w)));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    add(newTerm);
    setNewTerm("");
  }

  const suggestions = SUGGESTIONS.filter((s) => !has(s));

  return (
    <div className="settings">
      <section className="card">
        <p className="hint">Für diese Produkte sucht die App automatisch nach Angeboten.</p>
        {watchlist.length === 0 ? (
          <p className="none">Noch keine Produkte. Füg unten welche hinzu.</p>
        ) : (
          <ul className="watchlist">
            {watchlist.map((w) => {
              const count = offerCounts.get(w.term) ?? 0;
              return (
                <li key={w.term}>
                  <span className="watch-name">
                    {w.term}
                    <span className="watch-count">
                      {count === 0 ? "gerade kein Angebot" : count === 1 ? "1 Angebot" : `${count} Angebote`}
                    </span>
                  </span>
                  <span className="watch-actions">
                    <button
                      className={`toggle-pill${w.brandOnly ? " on" : ""}`}
                      onClick={() => toggleBrandOnly(w.term)}
                      aria-pressed={w.brandOnly}
                      title={w.brandOnly ? "Nur Angebote genau dieser Marke" : "Alles, was zum Begriff passt"}
                    >
                      {w.brandOnly ? "Nur Marke ✓" : "Alle Marken"}
                    </button>
                    <button
                      className="remove-inline"
                      onClick={() => onWatchlistChange(watchlist.filter((x) => x.term !== w.term))}
                      aria-label={`${w.term} entfernen`}
                    >
                      ✕
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <form className="add-term" onSubmit={submit}>
          <input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="z. B. Pringles" />
          <button className="primary" type="submit" disabled={!newTerm.trim()}>
            Hinzufügen
          </button>
        </form>
        <p className="hint hint-tight">
          „Nur Marke“: z. B. bei Pringles nur echte Pringles, keine anderen Chips. „Alle Marken“: alles, was zum
          Begriff passt, z. B. bei „Proteinriegel“.
        </p>
      </section>

      {suggestions.length > 0 && (
        <section className="card">
          <h2>Vorschläge</h2>
          <div className="chips">
            {suggestions.map((s) => (
              <button key={s} className="chip" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
