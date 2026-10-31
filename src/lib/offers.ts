import type { Market, Offer } from "../types";

export interface OfferGroup {
  term: string;
  offers: Offer[];
}

export interface BrandGroup {
  key: string;
  brand: string;
  offers: Offer[];
  /** Angebot mit dem Abzeichen "Günstigster", falls es einen klaren Sieger gibt */
  cheapestId?: string;
}

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit */
export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isActive(offer: Offer, today = todayISO()): boolean {
  return !offer.validUntil || offer.validUntil >= today;
}

/** Gilt erst ab einem späteren Tag (z. B. Prospekt der nächsten Woche) */
export function isUpcoming(offer: Offer, today = todayISO()): boolean {
  return !!offer.validFrom && offer.validFrom > today;
}

/** Heute ist der letzte Tag des Angebots */
export function isLastDay(offer: Offer, today = todayISO()): boolean {
  return offer.validUntil === today;
}

/**
 * Günstigstes Angebot innerhalb EINER Marke. Nur wenn die Marke heute in mindestens
 * zwei Märkten im Angebot ist und ein Angebot klar vorne liegt (kein Gleichstand).
 * Haben alle einen Grundpreis in derselben Einheit, zählt der (Dose vs. 12er-Pack).
 */
export function cheapestId(offers: Offer[], today = todayISO()): string | undefined {
  const current = offers.filter((o) => !isUpcoming(o, today));
  if (new Set(current.map((o) => o.market)).size < 2) return undefined;

  const unit = current[0].referenceUnit;
  const byUnit = !!unit && current.every((o) => o.referencePrice !== undefined && o.referenceUnit === unit);
  const value = (o: Offer) => (byUnit ? o.referencePrice! : o.price);
  const sorted = [...current].sort((a, b) => value(a) - value(b));
  return value(sorted[0]) < value(sorted[1]) ? sorted[0].id : undefined;
}

function brandKey(offer: Offer): string {
  return (offer.brand ?? offer.product).trim().toLowerCase();
}

/**
 * Teilt die (schon sortierten) Angebote eines Merklisten-Eintrags nach Marke auf.
 * Ohne Marke zählt der Produktname. Die Marke mit dem besten Angebot steht oben.
 */
export function groupByBrand(offers: Offer[], today = todayISO()): BrandGroup[] {
  const byKey = new Map<string, Offer[]>();
  for (const offer of offers) {
    const key = brandKey(offer);
    byKey.set(key, [...(byKey.get(key) ?? []), offer]);
  }
  return [...byKey.entries()]
    .map(([key, list]) => ({
      key,
      brand: list[0].brand ?? list[0].product,
      offers: list,
      cheapestId: cheapestId(list, today),
    }))
    .sort((a, b) => offers.indexOf(a.offers[0]) - offers.indexOf(b.offers[0]));
}

/** Neu ist, was beim letzten Mal noch nicht da war. Beim allerersten Start (seen = null) ist nichts neu. */
export function markNew(currentIds: string[], seenIds: string[] | null): Set<string> {
  if (!seenIds) return new Set();
  const seen = new Set(seenIds);
  return new Set(currentIds.filter((id) => !seen.has(id)));
}

const LOYALTY_APP: Record<Market, string> = {
  Lidl: "Lidl Plus",
  "Aldi Nord": "ALDI-App",
  "Aldi Süd": "ALDI-App",
  Penny: "PENNY-App",
  Netto: "Netto-App",
  Rewe: "REWE-App",
  Edeka: "EDEKA-App",
  Kaufland: "Kaufland Card",
};

export function loyaltyLabel(offer: Offer): string | undefined {
  if (offer.loyalty === "required") return `Nur mit ${LOYALTY_APP[offer.market]}`;
  if (offer.loyalty === "bonus") return `+ Bonus mit ${LOYALTY_APP[offer.market]}`;
  return undefined;
}

export function discountPercent(offer: Offer): number | undefined {
  if (!offer.oldPrice || offer.oldPrice <= offer.price) return undefined;
  return Math.round((1 - offer.price / offer.oldPrice) * 100);
}

/**
 * Gültige Angebote pro Merklisten-Eintrag, in Merklisten-Reihenfolge.
 * Was heute schon gilt, kommt vor kommenden Angeboten, jeweils günstigstes zuerst.
 */
export function groupByTerm(offers: Offer[], watchlist: string[], today = todayISO()): OfferGroup[] {
  return watchlist.map((term) => ({
    term,
    offers: offers
      .filter((o) => o.term.toLowerCase() === term.toLowerCase() && isActive(o, today))
      .sort((a, b) => Number(isUpcoming(a, today)) - Number(isUpcoming(b, today)) || a.price - b.price),
  }));
}

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function formatPrice(value: number): string {
  return euro.format(value);
}

/** "2026-11-08" -> "Sa., 8.11." */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });
}
