import type { Offer } from "../src/types.js";
import { matchMarket } from "./retailers.js";

/** Die Felder einer marktguru-Suchantwort, die wir nutzen */
export interface RawOffer {
  id: number;
  brand?: { name?: string } | null;
  product?: { name?: string } | null;
  description?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  referencePrice?: number | null;
  unit?: { shortName?: string } | null;
  advertisers?: { name?: string }[] | null;
  categories?: { name?: string }[] | null;
  validityDates?: { from?: string; to?: string }[] | null;
}

const berlinDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-10-31T22:59:00Z" -> "2026-10-31" (Kalendertag in Deutschland) */
function toBerlinDay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : berlinDate.format(date);
}

/**
 * Passt das Angebot zum Merklisten-Eintrag? Alle Wörter müssen vorkommen,
 * damit "Monster Energy" nicht beim "Felgenreiniger Alu Monster" landet.
 * Zusammengeschrieben zählt auch: "Proteinriegel" findet "Protein Riegel".
 */
export function matchesTerm(raw: RawOffer, term: string): boolean {
  const text = [raw.brand?.name, raw.product?.name, raw.description, ...(raw.categories ?? []).map((c) => c.name)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const compact = text.replace(/[\s-]+/g, "");
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .every((word) => text.includes(word) || compact.includes(word));
}

function productName(raw: RawOffer): string {
  const brand = raw.brand?.name?.trim() ?? "";
  const product = raw.product?.name?.trim() ?? "";
  if (!brand) return product;
  if (!product || product.toLowerCase().includes(brand.toLowerCase())) return product || brand;
  return `${brand} ${product}`;
}

export function normalizeOffer(raw: RawOffer, term: string): Offer | undefined {
  const market = (raw.advertisers ?? []).map((a) => matchMarket(a.name ?? "")).find(Boolean);
  if (!market || typeof raw.price !== "number" || !matchesTerm(raw, term)) return undefined;

  const validity = raw.validityDates?.[0];
  return {
    id: `mg-${raw.id}`,
    term,
    product: productName(raw),
    price: raw.price,
    oldPrice: raw.oldPrice ?? undefined,
    market,
    validFrom: toBerlinDay(validity?.from),
    validUntil: toBerlinDay(validity?.to),
    details: raw.description?.trim() || undefined,
    referencePrice: raw.referencePrice ?? undefined,
    referenceUnit: raw.unit?.shortName ?? undefined,
    imageUrl: `https://mg2de.b-cdn.net/api/v1/offers/${raw.id}/images/default/0/small.jpg`,
    source: "marktguru",
  };
}

/** Wandelt alle Treffer um und entfernt Dubletten (gleiches Angebot aus mehreren Regional-Prospekten) */
export function normalizeResults(results: RawOffer[], term: string): Offer[] {
  const seen = new Set<string>();
  const offers: Offer[] = [];
  for (const raw of results) {
    const offer = normalizeOffer(raw, term);
    if (!offer) continue;
    const key = [offer.market, offer.product, offer.price, offer.validUntil, offer.details].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    offers.push(offer);
  }
  return offers;
}
