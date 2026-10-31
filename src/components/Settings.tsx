import { useState, type FormEvent } from "react";
import { MARKETS, type Market } from "../types";

interface Props {
  watchlist: string[];
  onWatchlistChange: (list: string[]) => void;
  zip: string;
  onZipChange: (zip: string) => void;
  markets: Market[];
  onMarketsChange: (markets: Market[]) => void;
}

export function Settings({ watchlist, onWatchlistChange, zip, onZipChange, markets, onMarketsChange }: Props) {
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

  function toggleMarket(market: Market) {
    // Reihenfolge wie in MARKETS behalten
    const next = markets.includes(market) ? markets.filter((m) => m !== market) : [...markets, market];
    onMarketsChange(MARKETS.filter((m) => next.includes(m)));
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
        <h2>Meine Märkte</h2>
        <p className="hint">Nur Angebote aus angehakten Märkten werden angezeigt.</p>
        <div className="market-grid">
          {MARKETS.map((m) => (
            <label key={m} className={`market-check${markets.includes(m) ? " on" : ""}`}>
              <input type="checkbox" checked={markets.includes(m)} onChange={() => toggleMarket(m)} />
              {m}
            </label>
          ))}
        </div>
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
