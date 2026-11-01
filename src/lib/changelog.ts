/** Aktuelle Version. Bei jedem Update erhöhen und oben in RELEASES einen Eintrag ergänzen. */
export const APP_VERSION = "1.4";

export interface Release {
  version: string;
  title: string;
  /** Wichtigstes zuerst */
  highlights: { icon: string; title: string; text: string }[];
}

export const RELEASES: Release[] = [
  {
    version: "1.4",
    title: "Intelligente Suche",
    highlights: [
      {
        icon: "🔍",
        title: "Intelligente Suche",
        text: "Die Suche erkennt Marken und verzeiht Tippfehler: aus „Prngles“ wird Pringles.",
      },
      {
        icon: "🗂️",
        title: "Kategorien",
        text: "Energy Drinks, Chips, Schokolade & mehr mit einem Tipp durchstöbern.",
      },
      {
        icon: "🏷️",
        title: "Nur deine Marke",
        text: "Pro Produkt einstellbar: z. B. nur echte Pringles statt aller Chips.",
      },
      {
        icon: "🥤",
        title: "Füllmenge auf einen Blick",
        text: "250 ml, 6 × 330 ml … steht jetzt direkt auf jedem Angebot.",
      },
      {
        icon: "✨",
        title: "Klarere Namen",
        text: "„Red Bull“ statt fünfmal „Energy Drink“.",
      },
    ],
  },
];
