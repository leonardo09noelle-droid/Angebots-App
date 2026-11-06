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
      {
        id: "saft",
        label: "Saft",
        emoji: "🧃",
        queries: ["Orangensaft", "Apfelsaft", "Fruchtsaft"],
        keywords: ["orangensaft", "apfelsaft", "fruchtsaft", "granini", "hohes c", "valensina", "pfanner"],
      },
      {
        id: "kaffee",
        label: "Kaffee",
        emoji: "☕",
        queries: ["Kaffee"],
        keywords: ["kaffee", "jacobs", "tchibo", "dallmayr", "lavazza", "nescafé", "senseo"],
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
      {
        id: "nuesse",
        label: "Nüsse",
        emoji: "🥜",
        queries: ["Nüsse", "Erdnüsse"],
        keywords: ["nüsse", "erdnüsse", "ültje"],
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
      {
        id: "toast",
        label: "Toast & Brot",
        emoji: "🥪",
        queries: ["Toastbrot", "Sandwich"],
        keywords: ["toastbrot", "golden toast", "harry"],
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
        keywords: ["käse", "gouda", "leerdammer", "babybel"],
      },
      {
        id: "mozzarella",
        label: "Mozzarella",
        emoji: "🍅",
        queries: ["Mozzarella"],
        keywords: ["mozzarella", "galbani"],
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
  {
    title: "Tiefkühl",
    categories: [
      {
        id: "pizza",
        label: "Pizza",
        emoji: "🍕",
        queries: ["Pizza"],
        keywords: ["pizza", "ristorante", "wagner"],
      },
      {
        id: "pommes",
        label: "Pommes",
        emoji: "🍟",
        queries: ["Pommes"],
        keywords: ["pommes", "mccain"],
      },
      {
        id: "fisch",
        label: "Fischstäbchen",
        emoji: "🐟",
        queries: ["Fischstäbchen"],
        keywords: ["fischstäbchen", "iglo"],
      },
      // "Eis" allein fände auch Eistee, Eisbergsalat und jeden "Preis"
      {
        id: "eis",
        label: "Eis",
        emoji: "🍦",
        queries: ["Eiscreme", "Eis am Stiel"],
        keywords: ["eiscreme", "magnum", "langnese", "ben & jerry"],
      },
    ],
  },
  {
    title: "Vorrat",
    categories: [
      {
        id: "nudeln",
        label: "Nudeln",
        emoji: "🍝",
        queries: ["Nudeln", "Spaghetti"],
        keywords: ["nudeln", "spaghetti", "barilla"],
      },
    ],
  },
];

export const ALL_CATEGORIES: Category[] = CATEGORY_SECTIONS.flatMap((s) => s.categories);

export function findCategory(id: string | undefined): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}
