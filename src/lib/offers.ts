import type { Offer } from "../types";

export interface OfferGroup {
  term: string;
  offers: Offer[];
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
