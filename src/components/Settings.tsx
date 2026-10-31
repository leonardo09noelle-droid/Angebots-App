import { useState, type FormEvent } from "react";

interface Props {
  watchlist: string[];
  onWatchlistChange: (list: string[]) => void;
  zip: string;
  onZipChange: (zip: string) => void;
}

export function Settings({ watchlist, onWatchlistChange, zip, onZipChange }: Props) {
  const [newTerm, setNewTerm] = useState("");

  function addTerm(e: FormEvent) {
    e.preventDefault();
    // Kommas trennen in der Suche die Produkte, deshalb raus damit
    const term = newTerm.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (!term) return;
    if (!watchlist.some((w) => w.toLowerCase() === term.toLowerCase())) {
      onWatchlistChange([...watchlist, term]);
    }
    setNewTerm("");
  }

  return (
    <div className="settings">
      <section className="card">
        <h2>Meine Produkte</h2>
        <p className="hint">Je genauer, desto besser: „Monster Energy“ statt nur „Monster“.</p>
        <ul className="watchlist">
          {watchlist.map((w) => (
            <li key={w}>
              <span>{w}</span>
              <button
                className="remove-inline"
                onClick={() => onWatchlistChange(watchlist.filter((x) => x !== w))}
                aria-label={`${w} entfernen`}
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
        <form className="add-term" onSubmit={addTerm}>
          <input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="z. B. Red Bull" />
          <button className="primary" type="submit" disabled={!newTerm.trim()}>
            Hinzufügen
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Postleitzahl</h2>
        <p className="hint">Damit werden die Angebote in deiner Gegend gesucht.</p>
        <input
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => onZipChange(e.target.value.replace(/\D/g, ""))}
          placeholder="z. B. 10115"
        />
      </section>
    </div>
  );
}
