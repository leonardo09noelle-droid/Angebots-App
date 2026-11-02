import { distance, normalize } from "./fuzzy";

// Einfache Synonym-Liste statt KI: wer "Gummibärchen" sucht, bekommt auch "Fruchtgummi".
// keys: was jemand eintippt; queries: was zusätzlich bei marktguru gesucht wird.
const GROUPS: { keys: string[]; queries: string[] }[] = [
  { keys: ["Gummibärchen", "Gummibären", "Fruchtgummi", "Weingummi", "Gummi"], queries: ["Fruchtgummi", "Gummibärchen"] },
  { keys: ["Süßigkeiten", "Naschen", "Candy", "Süßes"], queries: ["Schokolade", "Fruchtgummi", "Bonbons"] },
  { keys: ["Schoki", "Schokolade", "Schokoriegel"], queries: ["Schokolade", "Schokoriegel"] },
  { keys: ["Energy", "Energydrink", "Energydrinks", "Energie", "Energy Drinks"], queries: ["Energy Drink"] },
  { keys: ["Limo", "Limonade", "Brause"], queries: ["Limonade"] },
  { keys: ["Wasser", "Sprudel", "Mineralwasser"], queries: ["Mineralwasser"] },
  { keys: ["Kekse", "Keks", "Plätzchen", "Cookies"], queries: ["Kekse", "Cookies"] },
  { keys: ["Chips", "Crisps", "Kartoffelchips"], queries: ["Chips"] },
  { keys: ["Proteinriegel", "Eiweißriegel", "Proteinbar", "Protein Bar"], queries: ["Proteinriegel", "Eiweißriegel"] },
  { keys: ["Protein", "High Protein", "Eiweiß"], queries: ["Protein", "Eiweiß"] },
  { keys: ["Eistee", "Ice Tea", "Icetea"], queries: ["Eistee"] },
  { keys: ["Eis", "Eiscreme", "Speiseeis"], queries: ["Eiscreme"] },
  { keys: ["Bier", "Pils"], queries: ["Bier", "Pils"] },
  { keys: ["Kaffee", "Coffee", "Kaffeebohnen"], queries: ["Kaffee"] },
  { keys: ["Whisky", "Whiskey"], queries: ["Whisky", "Whiskey"] },
  { keys: ["Wodka", "Vodka"], queries: ["Wodka"] },
  { keys: ["Nüsse", "Erdnüsse", "Nuts"], queries: ["Nüsse", "Erdnüsse"] },
  { keys: ["Müsli", "Muesli", "Granola", "Knuspermüsli"], queries: ["Müsli", "Granola"] },
];

const KEYED = GROUPS.flatMap((g) => g.keys.map((k) => ({ key: normalize(k), queries: g.queries })));

const MAX_QUERIES_PER_TERM = 3;

/** Schlüssel für eine Suche, so wie sie an marktguru geht (nur Groß/Klein egal) */
export function queryKey(query: string): string {
  return query.trim().toLowerCase();
}

/** "Gummibärchen" -> ["Gummibärchen", "Fruchtgummi"]; kleine Tippfehler ("Gumibärchen") zählen mit */
export function expandQuery(term: string): string[] {
  const n = normalize(term);
  let match = KEYED.find((k) => k.key === n);
  if (!match && n.length >= 5) {
    const allowed = n.length <= 6 ? 1 : 2;
    match = KEYED.map((k) => ({ ...k, dist: distance(n, k.key) }))
      .filter((k) => k.dist <= allowed)
      .sort((a, b) => a.dist - b.dist)[0];
  }
  const all = [term, ...(match?.queries ?? [])];
  // ohne Dubletten (Groß/Klein egal; "energydrink" und "Energy Drink" sind für marktguru verschieden),
  // höchstens 3 Suchen pro Begriff
  const seen = new Set<string>();
  return all
    .filter((q) => {
      const key = queryKey(q);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_QUERIES_PER_TERM);
}

/** Ein Begriff, optional mit festen Suchen statt Synonymen (Kategorie-Favorit "Schokolade") */
export type SearchTerm = string | { term: string; queries?: string[] };

/**
 * Alle Suchbegriffe samt Synonymen, plus Rückweg: zu welchem ursprünglichen Begriff gehört
 * ein Treffer für "Fruchtgummi"? (damit er bei "Gummibärchen" in den Favoriten landet)
 */
export function planQueries(terms: SearchTerm[]): { queries: string[]; originOf: Map<string, string[]> } {
  const originOf = new Map<string, string[]>();
  const queries: string[] = [];
  for (const entry of terms) {
    const term = typeof entry === "string" ? entry : entry.term;
    const own = typeof entry === "string" ? undefined : entry.queries;
    for (const q of own?.length ? own.slice(0, MAX_QUERIES_PER_TERM) : expandQuery(term)) {
      const key = queryKey(q);
      if (!originOf.has(key)) {
        originOf.set(key, []);
        queries.push(q);
      }
      if (!originOf.get(key)!.includes(term)) originOf.get(key)!.push(term);
    }
  }
  return { queries, originOf };
}
