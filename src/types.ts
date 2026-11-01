export const MARKETS = [
  "Lidl",
  "Aldi Nord",
  "Aldi Süd",
  "Penny",
  "Netto",
  "Rewe",
  "Edeka",
] as const;

export type Market = (typeof MARKETS)[number];

/** Eintrag auf der Merkliste. brandOnly: nur Angebote genau dieser Marke ("Pringles", nicht alle Chips) */
export interface WatchItem {
  term: string;
  brandOnly: boolean;
}

export interface Offer {
  id: string;
  /** Merklisten-Eintrag, zu dem das Angebot gehört (z. B. "Monster Energy") */
  term: string;
  /** Produktname ohne Marke, z. B. "Energy Drink" (vollständig: fullName()) */
  product: string;
  /** Nur Angebote derselben Marke werden miteinander verglichen */
  brand?: string;
  price: number;
  oldPrice?: number;
  market: Market;
  /** Erster gültiger Tag, Format YYYY-MM-DD */
  validFrom?: string;
  /** Letzter gültiger Tag, Format YYYY-MM-DD */
  validUntil?: string;
  /** Kleingedrucktes aus dem Prospekt, z. B. "je 0,5-l-Dose zzgl. 0,25 Pfand" */
  details?: string;
  /** Grundpreis, z. B. 1.98 mit referenceUnit "l" = 1,98 €/l */
  referencePrice?: number;
  referenceUnit?: string;
  /** Pfand pro Stück in €, z. B. 0.25 */
  deposit?: number;
  /** z. B. "Softdrinks" */
  category?: string;
  /** Angebotsseite des Markts, falls marktguru sie kennt */
  externalUrl?: string;
  imageUrl?: string;
  /** Preis gilt nur mit Kunden-App/-Karte ("required") oder es gibt dort extra Bonus ("bonus") */
  loyalty?: "required" | "bonus";
  source: "manual" | "marktguru";
}
