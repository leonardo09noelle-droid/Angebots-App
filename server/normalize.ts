import type { Offer } from "../src/types.js";
import { fullName } from "../src/lib/offers.js";
import { matchMarket } from "./retailers.js";

/** Die Felder einer marktguru-Suchantwort, die wir nutzen */
export interface RawOffer {
  id: number;
  brand?: { name?: string } | null;
  product?: { name?: string } | null;
  description?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  requiresLoyalityMembership?: boolean | null;
  referencePrice?: number | null;
  unit?: { shortName?: string } | null;
  advertisers?: { name?: string }[] | null;
  categories?: { name?: string }[] | null;
  validityDates?: { from?: string; to?: string }[] | null;
  externalUrl?: string | null;
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

/** "zzgl. 0.25 Pfand", "zzgl. 0,25 € Pfand", "Pfand 0,25" -> 0.25 */
function depositOf(description: string | null | undefined): number | undefined {
  const match =
    description?.match(/zzgl\.?\s*(?:€\s*)?(\d+[.,]\d{1,2})\s*(?:€\s*)?pfand/i) ??
    description?.match(/pfand\s*:?\s*(\d+[.,]\d{1,2})/i);
  const value = match ? Number(match[1].replace(",", ".")) : NaN;
  return value > 0 && value < 10 ? value : undefined;
}

/** Nur echte Web-Links übernehmen */
function safeUrl(url: string | null | undefined): string | undefined {
  return url && /^https:\/\//i.test(url) ? url : undefined;
}

// Preis gilt nur mit App/Karte, z. B. "nur mit Lidl Plus", "App-Preis"
const LOYALTY_REQUIRED = /nur\s+mit\s+(der\s+)?(app|karte|card)|lidl\s*plus|app-preis/i;
// Normaler Preis plus Extra-Vorteil, z. B. "MIT APP 0,10 € REWE BONUS", "PAYBACK", "Kaufland Card"
const LOYALTY_BONUS = /\bmit\s+(der\s+)?app\b|\bbonus\b|payback|kaufland\s*card|deutschlandcard/i;

function loyaltyOf(raw: RawOffer): Offer["loyalty"] {
  const text = raw.description ?? "";
  if (raw.requiresLoyalityMembership || LOYALTY_REQUIRED.test(text)) return "required";
  return LOYALTY_BONUS.test(text) ? "bonus" : undefined;
}

export function normalizeOffer(raw: RawOffer, term: string): Offer | undefined {
  const market = (raw.advertisers ?? []).map((a) => matchMarket(a.name ?? "")).find(Boolean);
  if (!market || typeof raw.price !== "number" || !matchesTerm(raw, term)) return undefined;

  const validity = raw.validityDates?.[0];
  return {
    id: `mg-${raw.id}`,
    term,
    product: raw.product?.name?.trim() || raw.brand?.name?.trim() || term,
    brand: raw.brand?.name?.trim() || undefined,
    price: raw.price,
    oldPrice: raw.oldPrice ?? undefined,
    market,
    validFrom: toBerlinDay(validity?.from),
    validUntil: toBerlinDay(validity?.to),
    details: raw.description?.trim() || undefined,
    referencePrice: raw.referencePrice ?? undefined,
    referenceUnit: raw.unit?.shortName ?? undefined,
    deposit: depositOf(raw.description),
    category: raw.categories?.[0]?.name ?? undefined,
    externalUrl: safeUrl(raw.externalUrl),
    imageUrl: `https://mg2de.b-cdn.net/api/v1/offers/${raw.id}/images/default/0/small.jpg`,
    loyalty: loyaltyOf(raw),
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
    const key = [offer.market, fullName(offer), offer.price, offer.validUntil, offer.details].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    offers.push(offer);
  }
  return offers;
}
