export const MARKETS = [
  "Lidl",
  "Aldi Nord",
  "Aldi Süd",
  "Penny",
  "Netto",
  "Rewe",
  "Edeka",
  "Kaufland",
] as const;

export type Market = (typeof MARKETS)[number];

export interface Offer {
  id: string;
  /** Merklisten-Eintrag, zu dem das Angebot gehört (z. B. "Monster Energy") */
  term: string;
  product: string;
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
  imageUrl?: string;
  source: "manual" | "marktguru";
}
