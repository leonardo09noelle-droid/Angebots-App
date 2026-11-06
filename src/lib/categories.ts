export interface Category {
  id: string;
  label: string;
  emoji: string;
  /** Suchbegriffe, die für diese Kachel abgefragt werden */
  queries: string[];
  /** Woran die App erkennt, dass ein Favorit zu dieser Kategorie passt (Marken und Wortteile) */
  keywords: string[];
}

export const CATEGORY_SECTIONS: { title: string; categories: Category[] }[] = [
  {
    title: "Getränke",
    categories: [
      {
        id: "energy",
        label: "Energy Drinks",
        emoji: "⚡",
        queries: ["Energy Drink"],
        keywords: ["energy", "monster", "red bull", "rockstar", "28 black", "reign", "booster"],
      },
      {
        id: "cola",
        label: "Cola & Limo",
        emoji: "🥤",
        queries: ["Cola", "Limonade"],
        keywords: ["cola", "limo", "pepsi", "fanta", "sprite", "mezzo mix", "spezi", "club-mate", "7up", "dr pepper"],
      },
      {
        id: "eistee",
        label: "Eistee",
        emoji: "🧊",
        queries: ["Eistee"],
        keywords: ["eistee", "ice tea", "icetea", "lipton", "arizona"],
      },
      {
        id: "wasser",
        label: "Wasser",
        emoji: "💧",
        queries: ["Mineralwasser"],
        keywords: ["wasser", "gerolsteiner", "volvic", "vittel", "evian", "adelholzener"],
      },
    ],
  },
  {
    title: "Snacks & Süßes",
    categories: [
      {
        id: "chips",
        label: "Chips",
        emoji: "🥔",
        queries: ["Chips"],
        keywords: ["chips", "pringles", "lay's", "funny-frisch", "chio", "crunchips", "doritos", "pombär"],
      },
      {
        id: "schokolade",
        label: "Schokolade",
        emoji: "🍫",
        queries: ["Schokolade"],
        keywords: [
          "schoko", "milka", "ritter sport", "lindt", "kinder", "ferrero", "nutella", "duplo", "hanuta", "toblerone",
          "snickers", "twix", "bounty", "kitkat", "m&m", "smarties", "merci", "knoppers",
        ],
      },
      {
        id: "fruchtgummi",
        label: "Fruchtgummi",
        emoji: "🐻",
        queries: ["Fruchtgummi", "Gummibärchen"],
        keywords: ["gummi", "haribo", "katjes", "trolli", "maoam", "nimm2"],
      },
      {
        id: "kekse",
        label: "Kekse",
        emoji: "🍪",
        queries: ["Kekse", "Cookies"],
        keywords: ["keks", "cookie", "oreo", "bahlsen", "leibniz", "prinzen rolle"],
      },
    ],
  },
  {
    title: "Protein",
    categories: [
      {
        id: "protein",
        label: "High Protein",
        emoji: "💪",
        queries: ["Protein", "Eiweiß"],
        keywords: ["high protein", "eiweiß", "yfood", "esn", "more nutrition", "myprotein"],
      },
      {
        id: "proteinriegel",
        label: "Proteinriegel",
        emoji: "🍫",
        queries: ["Proteinriegel", "Eiweißriegel"],
        keywords: ["proteinriegel", "eiweißriegel", "protein bar", "barebells", "powerbar"],
      },
    ],
  },
  {
    title: "Frühstück",
    categories: [
      {
        id: "muesli",
        label: "Müsli",
        emoji: "🥣",
        queries: ["Müsli", "Granola"],
        keywords: ["müsli", "muesli", "granola", "kölln", "seitenbacher"],
      },
    ],
  },
  {
    title: "Milch & Käse",
    categories: [
      // Gezielte Suchbegriffe: "Milch" allein fände vor allem Milchschokolade
      {
        id: "milch",
        label: "Milch",
        emoji: "🥛",
        queries: ["Frischmilch", "H-Milch", "Trinkmilch"],
        keywords: ["frischmilch", "h-milch", "trinkmilch", "haferdrink", "alpro", "oatly", "arla"],
      },
      {
        id: "kaese",
        label: "Käse",
        emoji: "🧀",
        queries: ["Käse", "Gouda"],
        keywords: ["käse", "gouda", "mozzarella", "leerdammer", "babybel"],
      },
      {
        id: "joghurt",
        label: "Joghurt",
        emoji: "🥄",
        queries: ["Joghurt"],
        keywords: ["joghurt", "skyr", "ehrmann", "danone", "müller"],
      },
    ],
  },
];

export const ALL_CATEGORIES: Category[] = CATEGORY_SECTIONS.flatMap((s) => s.categories);

export function findCategory(id: string | undefined): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}
