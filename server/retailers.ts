import type { Market } from "../src/types.js";

// Namen bei marktguru, z. B. "REWE", "REWE Center", "ALDI SÜD", "Netto Marken-Discount".
// Ableger wie "nahkauf" oder "Marktkauf" zählen bewusst nicht dazu, Kaufland ist bewusst raus.
const PATTERNS: [RegExp, Market][] = [
  [/^lidl\b/, "Lidl"],
  [/^aldi\s*nord\b/, "Aldi Nord"],
  [/^aldi\s*s(ü|ue)d\b/, "Aldi Süd"],
  [/^penny\b/, "Penny"],
  [/^netto\b/, "Netto"],
  [/^rewe\b/, "Rewe"],
  [/^edeka\b/, "Edeka"],
];

export function matchMarket(advertiserName: string): Market | undefined {
  const name = advertiserName.trim().toLowerCase();
  return PATTERNS.find(([pattern]) => pattern.test(name))?.[1];
}
