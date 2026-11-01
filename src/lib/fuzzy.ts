// Tippfehler-tolerante Suche ohne KI: Marken vergleichen, Vorschläge und "Meintest du …?"

/** "Lay's" -> "lays", "Müller" -> "mueller", "Coca-Cola" -> "cocacola" */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Damerau-Levenshtein (Variante "optimal string alignment"): ein Buchstabendreher zählt als ein Fehler */
export function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Allgemeine Wörter, die nie zu einer Marke "korrigiert" werden */
const GENERIC = new Set(
  [
    "chips", "cola", "limo", "bier", "wasser", "kaffee", "tee", "eistee", "energy", "energydrink",
    "schokolade", "kekse", "fruchtgummi", "gummibaerchen", "proteinriegel", "protein", "riegel",
    "whisky", "whiskey", "wodka", "gin", "rum", "sekt", "wein", "saft", "milch", "eis", "pizza",
  ].map(normalize),
);

/** Vervollständigung beim Tippen: "Prin" -> ["Pringles", "Prinzen Rolle"] */
export function complete(query: string, brands: string[], limit = 5): string[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const results: string[] = [];
  for (const brand of brands) {
    const n = normalize(brand);
    if (n === q || seen.has(n)) continue;
    // ganzer Name oder ein Wort darin beginnt mit der Eingabe ("bull" -> "Red Bull")
    const words = brand.split(/\s+/).map(normalize);
    if (n.startsWith(q) || words.some((w) => w.startsWith(q))) {
      seen.add(n);
      results.push(brand);
      if (results.length === limit) break;
    }
  }
  return results;
}

/** "Prngles" -> "Pringles". Nur bei kleinem Unterschied und nie bei allgemeinen Wörtern. */
export function correct(query: string, brands: string[]): string | undefined {
  const q = normalize(query);
  if (q.length < 4 || GENERIC.has(q)) return undefined;
  if (brands.some((b) => normalize(b) === q)) return undefined; // schon richtig geschrieben

  const allowed = q.length <= 5 ? 1 : 2;
  let best: { brand: string; dist: number } | undefined;
  for (const brand of brands) {
    const dist = distance(q, normalize(brand));
    if (dist <= allowed && (!best || dist < best.dist)) best = { brand, dist };
  }
  return best?.brand;
}
