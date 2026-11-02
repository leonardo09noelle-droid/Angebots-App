import { useMemo, useState } from "react";
import type { Offer, WatchItem } from "../types";
import { matchesBrand } from "../lib/offers";
import { OfferList } from "./OfferList";

const NO_BRAND = "Ohne Marke";

interface Props {
  title: string;
  /** schon sortiert und auf die Märkte gefiltert */
  offers: Offer[];
  /** Was ☆ Merken speichert, solange keine Marke gewählt ist (Suchbegriff oder Kategorie) */
  favorite: WatchItem;
  isFavorite: (item: WatchItem) => boolean;
  onToggleFavorite: (item: WatchItem) => void;
}

/** Ergebnisse mit Marken-Chips zum Filtern ("Alle · Pringles (3) · funny-frisch (2)") */
export function SearchResults({ title, offers, favorite, isFavorite, onToggleFavorite }: Props) {
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

  // Mit gewählter Marke wird genau diese Marke gemerkt
  const item = brand && brand !== NO_BRAND ? { term: brand } : favorite;
  const saved = isFavorite(item);

  return (
    <section className="group">
      <h2>
        {title}
        <span className="count">{visible.length}</span>
        <button
          className={`star-btn${saved ? " on" : ""}`}
          onClick={() => onToggleFavorite(item)}
          aria-pressed={saved}
          aria-label={saved ? `${item.term} von der Startseite nehmen` : `${item.term} merken`}
        >
          {saved ? "★ Gemerkt" : brand && brand !== NO_BRAND ? `☆ ${brand} merken` : "☆ Merken"}
        </button>
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
