import { useMemo, useState } from "react";
import type { Offer } from "../types";
import { matchesBrand } from "../lib/offers";
import { OfferList } from "./OfferList";

const NO_BRAND = "Ohne Marke";

interface Props {
  title: string;
  /** schon sortiert und auf die Märkte gefiltert */
  offers: Offer[];
  /** Merkliste: was schon drauf ist */
  isOnWatchlist: (term: string) => boolean;
  /** Ohne gewählte Marke: dieser Begriff kommt auf die Merkliste (bei Kategorien keiner) */
  fallbackTerm?: { term: string; brandOnly: boolean };
  onAddItem: (term: string, brandOnly: boolean) => void;
}

/** Ergebnisse mit Marken-Chips zum Filtern ("Alle · Pringles (3) · funny-frisch (2)") */
export function SearchResults({ title, offers, isOnWatchlist, fallbackTerm, onAddItem }: Props) {
  const [brand, setBrand] = useState<string | null>(null);

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of offers) {
      const b = o.brand?.trim() || NO_BRAND;
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"));
  }, [offers]);

  const visible = brand
    ? offers.filter((o) => (brand === NO_BRAND ? !o.brand?.trim() : matchesBrand(o, brand)))
    : offers;

  const add = brand && brand !== NO_BRAND ? { term: brand, brandOnly: true } : fallbackTerm;

  return (
    <section className="group">
      <h2>
        {title}
        <span className="count">{visible.length}</span>
        {add && (
          <button
            className="add-watch"
            onClick={() => onAddItem(add.term, add.brandOnly)}
            disabled={isOnWatchlist(add.term)}
          >
            {isOnWatchlist(add.term) ? "Auf Merkliste ✓" : `+ ${add.term}`}
          </button>
        )}
      </h2>

      {brandCounts.length > 1 && (
        <div className="brand-chips" role="group" aria-label="Nach Marke filtern">
          <button className={`chip${brand === null ? " active" : ""}`} onClick={() => setBrand(null)}>
            Alle
          </button>
          {brandCounts.map(([b, n]) => (
            <button key={b} className={`chip${brand === b ? " active" : ""}`} onClick={() => setBrand(b)}>
              {b} ({n})
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? <p className="none">Gerade kein Angebot in deinen Märkten.</p> : <OfferList offers={visible} />}
    </section>
  );
}
