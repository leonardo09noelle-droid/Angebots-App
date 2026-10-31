import { useState, type FormEvent } from "react";
import type { Market, Offer } from "../types";
import { fetchOffers } from "../lib/api";
import { groupByTerm } from "../lib/offers";
import { OfferList } from "./OfferList";

interface Props {
  zip: string;
  markets: Market[];
  watchlist: string[];
  onAddTerm: (term: string) => void;
}

/** Einmalige Suche, ohne den Begriff auf die Merkliste zu setzen. Ergebnisse werden nicht gespeichert. */
export function Search({ zip, markets, watchlist, onAddTerm }: Props) {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Offer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!/^\d{5}$/.test(zip)) {
    return (
      <p className="notice">
        Trag unter <b>Einstellungen</b> deine Postleitzahl ein, dann kannst du hier suchen.
      </p>
    );
  }

  async function search(e: FormEvent) {
    e.preventDefault();
    // Kommas trennen in der API die Begriffe
    const q = query.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (q.length < 2) return;
    setLoading(true);
    setError("");
    try {
      const { offers } = await fetchOffers(zip, [q]);
      setTerm(q);
      setResults(groupByTerm(offers.filter((o) => markets.includes(o.market)), [q])[0].offers);
    } catch (err) {
      setError((err as Error).message || "Die Suche hat nicht geklappt.");
    } finally {
      setLoading(false);
    }
  }

  const onWatchlist = watchlist.some((w) => w.toLowerCase() === term.toLowerCase());

  return (
    <div className="search">
      <form className="add-term" onSubmit={search}>
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Nutella, Barebells, Whiskey"
        />
        <button className="primary" type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? "…" : "Suchen"}
        </button>
      </form>

      {error && <p className="status status-error">{error}</p>}

      {results && !loading && (
        <section className="group">
          <h2>
            {term}
            <span className="count">{results.length}</span>
            <button className="add-watch" onClick={() => onAddTerm(term)} disabled={onWatchlist}>
              {onWatchlist ? "Auf Merkliste ✓" : "+ Merkliste"}
            </button>
          </h2>
          {results.length === 0 ? (
            <p className="none">Gerade kein Angebot in deinen Märkten.</p>
          ) : (
            <OfferList offers={results} />
          )}
        </section>
      )}
    </div>
  );
}
