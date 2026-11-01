import { useState, type FormEvent } from "react";
import type { Market, Offer, WatchItem } from "../types";
import { fetchOffers } from "../lib/api";
import { isKnownBrand } from "../lib/brands";
import type { Category } from "../lib/categories";
import { complete, correct } from "../lib/fuzzy";
import { mergeById, sortOffers } from "../lib/offers";
import { CategoryGrid } from "./CategoryGrid";
import { SearchResults } from "./SearchResults";

interface Props {
  zip: string;
  markets: Market[];
  watchlist: WatchItem[];
  /** eingebaute + gelernte Marken */
  brands: string[];
  onAddItem: (term: string, brandOnly: boolean) => void;
  /** Ergebnisse melden, damit die App neue Marken lernt */
  onResults: (offers: Offer[]) => void;
}

interface View {
  kind: "search" | "category";
  title: string;
  /** bei automatischer Korrektur: was ursprünglich eingegeben wurde */
  original?: string;
  offers: Offer[];
}

/** Suche mit Vorschlägen beim Tippen, "Meintest du …?" und Kategorie-Kacheln. Ergebnisse werden nicht gespeichert. */
export function Search({ zip, markets, watchlist, brands, onAddItem, onResults }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!/^\d{5}$/.test(zip)) {
    return (
      <p className="notice">
        Trag unter <b>Einstellungen</b> deine Postleitzahl ein, dann kannst du hier suchen.
      </p>
    );
  }

  async function run(kind: View["kind"], title: string, queries: string[], original?: string) {
    setLoading(true);
    setError("");
    setFocused(false);
    try {
      const { offers } = await fetchOffers(zip, queries);
      onResults(offers);
      const inMarkets = mergeById(offers).filter((o) => markets.includes(o.market));
      setView({ kind, title, original, offers: sortOffers(inMarkets) });
    } catch (err) {
      setError((err as Error).message || "Die Suche hat nicht geklappt.");
    } finally {
      setLoading(false);
    }
  }

  /** Kommas trennen in der API die Begriffe */
  const clean = (text: string) => text.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = clean(query);
    if (q.length < 2) return;
    const fixed = correct(q, brands);
    if (fixed) {
      setQuery(fixed);
      run("search", fixed, [fixed], q);
    } else {
      run("search", q, [q]);
    }
  }

  function pick(text: string) {
    setQuery(text);
    run("search", text, [text]);
  }

  function openCategory(category: Category) {
    run("category", `${category.emoji} ${category.label}`, category.queries);
  }

  const onWatchlist = (term: string) => watchlist.some((w) => w.term.toLowerCase() === term.toLowerCase());
  const suggestions = focused ? complete(query, brands) : [];

  return (
    <div className="search">
      <form className="add-term search-form" onSubmit={submit}>
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          // kurz warten, damit ein Tipp auf einen Vorschlag noch ankommt
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Marke oder Produkt, z. B. Pringles"
        />
        <button className="primary" type="submit" disabled={loading || clean(query).length < 2}>
          {loading ? "…" : "Suchen"}
        </button>
      </form>

      {suggestions.length > 0 && (
        <ul className="suggest-list" role="listbox" aria-label="Vorschläge">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" className="suggest-item" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(s)}>
                🔍 {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="status status-error">{error}</p>}

      {view && !loading && (
        <>
          <div className="results-head">
            <button
              className="back-btn"
              onClick={() => {
                setView(null);
                setQuery("");
              }}
            >
              ‹ Kategorien
            </button>
            {view.original && (
              <p className="correction">
                Ergebnisse für <b>{view.title}</b> ·{" "}
                <button
                  className="link-btn"
                  onClick={() => {
                    setQuery(view.original!);
                    run("search", view.original!, [view.original!]);
                  }}
                >
                  stattdessen nach „{view.original}“ suchen
                </button>
              </p>
            )}
          </div>
          <SearchResults
            key={`${view.kind}:${view.title}:${view.original ?? ""}`}
            title={view.title}
            offers={view.offers}
            isOnWatchlist={onWatchlist}
            fallbackTerm={
              view.kind === "search" ? { term: view.title, brandOnly: isKnownBrand(view.title, brands) } : undefined
            }
            onAddItem={onAddItem}
          />
        </>
      )}

      {!view && !loading && <CategoryGrid onSelect={openCategory} />}
      {loading && <p className="status">Suche Angebote …</p>}
    </div>
  );
}
