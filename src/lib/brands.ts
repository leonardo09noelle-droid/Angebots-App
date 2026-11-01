import { normalize } from "./fuzzy";

/** Bekannte Supermarkt-Marken für Vorschläge, "Meintest du …?" und den Marken-Schalter */
export const BUILTIN_BRANDS = [
  // Energy & Softdrinks
  "Monster Energy", "Red Bull", "Rockstar", "Effect", "28 Black", "Reign", "Booster",
  "Coca-Cola", "Pepsi", "Fanta", "Sprite", "Mezzo Mix", "Schweppes", "Mountain Dew", "7Up", "Dr Pepper",
  "fritz-kola", "Club-Mate", "Paulaner Spezi", "Lipton", "Arizona", "Pfanner", "Capri-Sun", "Granini",
  "Hohes C", "Valensina", "Bionade", "Lift", "Gatorade", "Powerade",
  // Wasser
  "Gerolsteiner", "Volvic", "Vittel", "Evian", "Adelholzener", "Bad Liebenwerda", "Christinen", "Vio",
  // Chips & Snacks
  "Pringles", "Lay's", "funny-frisch", "Chio", "Crunchips", "Doritos", "Pombär", "Ültje", "Lorenz",
  "XOX", "Bahlsen", "Leibniz", "Prinzen Rolle", "Oreo", "Kellogg's",
  // Schokolade & Süßes
  "Milka", "Ritter Sport", "Lindt", "Kinder", "Kinder Bueno", "Ferrero", "Nutella", "Duplo", "Hanuta",
  "Toblerone", "Snickers", "Mars", "Twix", "Bounty", "KitKat", "Lion", "M&M's", "Smarties", "Merci",
  "Raffaello", "Yogurette", "Knoppers", "Balisto", "Pick Up", "After Eight",
  "Haribo", "Katjes", "Trolli", "Nimm2", "Maoam", "Storck", "Mentos", "Tic Tac", "Werther's",
  // Protein & Milch
  "Barebells", "Yfood", "ESN", "More Nutrition", "Powerbar", "Myprotein", "Ehrmann", "Müller", "Arla",
  "Alpro", "Oatly", "Danone",
  // Kaffee
  "Jacobs", "Tchibo", "Dallmayr", "Lavazza", "Nescafé", "Senseo",
  // Alkohol
  "Jack Daniel's", "Jameson", "Johnnie Walker", "Jägermeister", "Absolut", "Smirnoff", "Bacardi",
  "Captain Morgan", "Havana Club", "Gordon's", "Bombay Sapphire", "Beck's", "Krombacher", "Warsteiner",
  "Bitburger", "Veltins", "Heineken", "Corona", "Paulaner", "Erdinger", "Desperados", "Astra",
  // Eis & Tiefkühl
  "Ben & Jerry's", "Langnese", "Magnum", "Dr. Oetker", "Wagner", "Iglo", "McCain",
];

/**
 * Ist der Begriff eine Marke? Auch der Anfang einer Marke zählt ("Monster" -> Monster Energy).
 * Dann schaltet die App "Nur diese Marke" automatisch an.
 */
export function isKnownBrand(term: string, brands: string[] = BUILTIN_BRANDS): boolean {
  const t = normalize(term);
  if (t.length < 3) return false;
  return brands.some((b) => {
    const n = normalize(b);
    return n === t || (t.length >= 4 && n.startsWith(t));
  });
}

/** Eingebaute und gelernte Marken ohne Dubletten */
export function allBrands(learned: string[]): string[] {
  const seen = new Set<string>();
  return [...BUILTIN_BRANDS, ...learned].filter((b) => {
    const n = normalize(b);
    if (!n || seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}
