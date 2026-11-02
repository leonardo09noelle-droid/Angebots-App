export interface Category {
  id: string;
  label: string;
  emoji: string;
  /** Suchbegriffe, die für diese Kachel abgefragt werden */
  queries: string[];
}

export const CATEGORY_SECTIONS: { title: string; categories: Category[] }[] = [
  {
    title: "Getränke",
    categories: [
      { id: "energy", label: "Energy Drinks", emoji: "⚡", queries: ["Energy Drink"] },
      { id: "cola", label: "Cola & Limo", emoji: "🥤", queries: ["Cola", "Limonade"] },
      { id: "eistee", label: "Eistee", emoji: "🧊", queries: ["Eistee"] },
      { id: "wasser", label: "Wasser", emoji: "💧", queries: ["Mineralwasser"] },
    ],
  },
  {
    title: "Snacks & Süßes",
    categories: [
      { id: "chips", label: "Chips", emoji: "🥔", queries: ["Chips"] },
      { id: "schokolade", label: "Schokolade", emoji: "🍫", queries: ["Schokolade"] },
      { id: "fruchtgummi", label: "Fruchtgummi", emoji: "🐻", queries: ["Fruchtgummi", "Gummibärchen"] },
      { id: "kekse", label: "Kekse", emoji: "🍪", queries: ["Kekse", "Cookies"] },
    ],
  },
  {
    title: "Protein",
    categories: [
      { id: "protein", label: "High Protein", emoji: "💪", queries: ["Protein", "Eiweiß"] },
      { id: "proteinriegel", label: "Proteinriegel", emoji: "🍫", queries: ["Proteinriegel", "Eiweißriegel"] },
    ],
  },
  {
    title: "Frühstück",
    categories: [{ id: "muesli", label: "Müsli", emoji: "🥣", queries: ["Müsli", "Granola"] }],
  },
];

export function findCategory(id: string | undefined): Category | undefined {
  return CATEGORY_SECTIONS.flatMap((s) => s.categories).find((c) => c.id === id);
}
