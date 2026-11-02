import { useRef, useState, type FormEvent } from "react";
import type { Market, Offer, WatchItem } from "../types";
import { fetchOffers } from "../lib/api";
import { CATEGORY_SECTIONS, type Category } from "../lib/categories";
import { complete, correct } from "../lib/fuzzy";
import { mergeById, sortOffers } from "../lib/offers";
import { CategoryGrid } from "./CategoryGrid";
import { SearchResults } from "./SearchResults";
import { ZipPrompt } from "./ZipPrompt";

interface Props {
  zip: string;
  onZipChange: (zip: string) => void;
  markets: Market[];
  /** eingebaute + gelernte Marken */
  brands: string[];
  isFavorite: (item: WatchItem) => boolean;
  /** offers: alle geladenen Treffer, falls genau diese Suche gemerkt wird (spart einen Abruf) */
  onToggleFavorite: (item: WatchItem, offers?: Offer[]) => void;
  /** Ergebnisse melden, damit die App neue Marken lernt */
  onResults: (offers: Offer[]) => void;
}

interface View {
  kind: "search" | "category";
  title: string;
  /** bei automatischer Korrektur: was ursprünglich eingegeben wurde */
  original?: string;
  category?: Category;
  /** Treffer in deinen Märkten, sortiert */
  offers: Offer[];
  /** alle Treffer, auch aus anderen Märkten (so speichert sie auch die Startseite) */
  all: Offer[];
}

/** Beliebte Marken: ein Tipp sucht sofort */
const POPULAR = ["Monster Energy", "Red Bull", "Barebells", "Coca-Cola", "Pringles", "Haribo", "Nutella", "Jack Daniel's"];

/** Dieselbe Suche innerhalb von 30 Minuten nicht nochmal laden (nur im Arbeitsspeicher) */
const CACHE_MS = 30 * 60 * 1000;

/** Entdecken: Suche mit Vorschlägen beim Tippen, "Meintest du …?", beliebte Marken und Kategorie-Kacheln */
export function Search({ zip, onZipChange, markets, brands, isFavorite, onToggleFavorite, onResults }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cache = useRef(new Map<string, { at: number; offers: Offer[] }>());

  if (!/^\d{5}$/.test(zip)) return <ZipPrompt onZipChange={onZipChange} />;

  async function load(queries: string[]): Promise<Offer[]> {
    const key = `${zip}|${queries.join("|").toLowerCase()}`;
    const hit = cache.current.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.offers;
    const { offers } = await fetchOffers(zip, queries);
    onResults(offers);
    cache.current.set(key, { at: Date.now(), offers });
    return offers;
  }

  async function run(kind: View["kind"], title: string, queries: string[], original?: string, category?: Category) {
    setLoading(true);
    setError("");
    setFocused(false);
    try {
      const all = mergeById(await load(queries));
      const inMarkets = all.filter((o) => markets.includes(o.market));
      setView({ kind, title, original, category, offers: sortOffers(inMarkets), all });
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
    run("category", `${category.emoji} ${category.label}`, category.queries, undefined, category);
  }

  const suggestions = focused ? complete(query, brands) : [];
  const favorite: WatchItem | undefined = view
    ? view.category
      ? { term: view.category.label, categoryId: view.category.id }
      : { term: view.title }
    : undefined;
  const favoriteCategories = new Set(
    CATEGORY_SECTIONS.flatMap((s) => s.categories)
      .filter((c) => isFavorite({ term: c.label, categoryId: c.id }))
      .map((c) => c.id),
  );

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
              ‹ Zurück
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
            favorite={favorite!}
            isFavorite={isFavorite}
            // Wird genau diese Suche gemerkt (keine einzelne Marke), sind ihre Angebote schon da
            onToggleFavorite={(item) => onToggleFavorite(item, item === favorite ? view.all : undefined)}
          />
        </>
      )}

      {!view && !loading && (
        <>
          <p className="hint discover-hint">
            Tipp bei einem Ergebnis auf <b>☆ Merken</b>, dann landet es auf deiner <b>Startseite</b>.
          </p>
          <section>
            <h2 className="cat-title">Beliebt</h2>
            <div className="chips">
              {POPULAR.map((s) => (
                <button key={s} className="chip" onClick={() => pick(s)}>
                  {isFavorite({ term: s }) ? "★ " : ""}
                  {s}
                </button>
              ))}
            </div>
          </section>
          <CategoryGrid onSelect={openCategory} favoriteIds={favoriteCategories} />
        </>
      )}
      {loading && <p className="status">Suche Angebote …</p>}
    </div>
  );
}
