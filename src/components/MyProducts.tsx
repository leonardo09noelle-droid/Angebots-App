import { useState, type FormEvent } from "react";

interface Props {
  watchlist: string[];
  onWatchlistChange: (list: string[]) => void;
  /** Anzahl aktueller Angebote pro Merklisten-Eintrag */
  offerCounts: Map<string, number>;
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
export function MyProducts({ watchlist, onWatchlistChange, offerCounts }: Props) {
  const [newTerm, setNewTerm] = useState("");
  const has = (term: string) => watchlist.some((w) => w.toLowerCase() === term.toLowerCase());

  function add(term: string) {
    // Kommas trennen in der Suche die Produkte, deshalb raus damit
    const clean = term.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (clean && !has(clean)) onWatchlistChange([...watchlist, clean]);
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
              const count = offerCounts.get(w) ?? 0;
              return (
                <li key={w}>
                  <span className="watch-name">
                    {w}
                    <span className="watch-count">
                      {count === 0 ? "gerade kein Angebot" : count === 1 ? "1 Angebot" : `${count} Angebote`}
                    </span>
                  </span>
                  <button
                    className="remove-inline"
                    onClick={() => onWatchlistChange(watchlist.filter((x) => x !== w))}
                    aria-label={`${w} entfernen`}
                  >
                    Entfernen
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form className="add-term" onSubmit={submit}>
          <input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="z. B. Red Bull" />
          <button className="primary" type="submit" disabled={!newTerm.trim()}>
            Hinzufügen
          </button>
        </form>
        <p className="hint hint-tight">Je genauer, desto besser: „Monster Energy“ statt nur „Monster“.</p>
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
