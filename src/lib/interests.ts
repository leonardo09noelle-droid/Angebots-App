import type { Market, Offer, WatchItem } from "../types";
import { BUILTIN_BRANDS } from "./brands";
import { ALL_CATEGORIES, type Category } from "./categories";
import { normalize } from "./fuzzy";
import { discountPercent, displayName, isActive, isUpcoming, matchesBrand, todayISO } from "./offers";

// Markt-Tabs auf der Startseite: Was gibt es dort gerade, das dich interessieren könnte?
// Einfache Regeln statt KI, alles bleibt auf dem Handy.

/** Märkte mit eigenem Tab; ein weiterer Markt ist nur ein Eintrag mehr */
export const STORE_MARKETS: Market[] = ["Rewe", "Edeka", "Lidl"];

/** So viele Angebote zeigt ein Abschnitt, bevor man "Alle zeigen" tippen muss */
export const SECTION_SIZE = 6;

/** Beim Öffnen so viele Alltags-Kategorien laden; beim Scrollen kommen jeweils NEXT_BATCH dazu */
export const FIRST_BATCH = 6;
export const NEXT_BATCH = 4;

/** Was fast jeder einkauft kommt zuerst */
const EVERYDAY_ORDER = [
  "chips", "kaese", "mozzarella", "muesli", "pizza", "cola", "schokolade", "joghurt", "kaffee", "saft",
  "nudeln", "wasser", "eis", "kekse", "fruchtgummi", "pommes", "milch", "toast", "nuesse", "fisch", "eistee",
];

/** Deine Abweichungen von der Automatik. So wirken neue Favoriten weiter, ohne sie zu überschreiben */
export interface InterestChanges {
  added: string[];
  removed: string[];
}

export interface StoreSection {
  category: Category;
  /** Beste zuerst, siehe rankForYou */
  offers: Offer[];
}

/**
 * Kurze Stichwörter nur am Wortanfang ("chio" nicht in "Pistachio"), längere auch mitten im Wort
 * ("gummi" in "Fruchtgummi", "wasser" in "Mineralwasser").
 */
function hasKeyword(text: string, keyword: string): boolean {
  const k = normalize(keyword);
  if (k.length >= 5) return normalize(text).includes(k);
  const words = text.split(/[\s,.;:/()&+-]+/).map(normalize);
  return words.some((_, i) => words.slice(i).join("").startsWith(k));
}

/** Aus den Favoriten abgeleitete Kategorien: Monster -> Energy Drinks, ⭐ Schokolade -> Schokolade */
export function suggestInterests(watchlist: WatchItem[], offers: Offer[]): string[] {
  const texts = watchlist.flatMap((w) => [
    w.term,
    ...offers
      .filter((o) => o.term.toLowerCase() === w.term.toLowerCase())
      .flatMap((o) => [o.brand ?? "", o.product, o.category ?? ""]),
  ]);
  const direct = new Set(watchlist.map((w) => w.categoryId));
  return ALL_CATEGORIES.filter(
    (c) => direct.has(c.id) || c.keywords.some((k) => texts.some((text) => hasKeyword(text, k))),
  ).map((c) => c.id);
}

export function effectiveInterests(auto: string[], changes: InterestChanges): string[] {
  const on = new Set([...auto, ...changes.added].filter((id) => !changes.removed.includes(id)));
  return ALL_CATEGORIES.filter((c) => on.has(c.id)).map((c) => c.id);
}

/** Eine Kategorie aus- oder wieder einblenden */
export function toggleInterest(changes: InterestChanges, id: string, isOn: boolean): InterestChanges {
  return isOn
    ? { added: changes.added.filter((x) => x !== id), removed: [...new Set([...changes.removed, id])] }
    : { added: changes.added, removed: changes.removed.filter((x) => x !== id) };
}

/**
 * Alles, was ein Markt-Tab zeigen kann: erst deine Interessen, dann Alltagsprodukte in dieser
 * Reihenfolge, zuletzt der Rest. Nur was du ausgeblendet hast, fehlt.
 */
export function storeCategoryIds(personal: string[], changes: InterestChanges): string[] {
  const order = [...personal, ...EVERYDAY_ORDER, ...ALL_CATEGORIES.map((c) => c.id)];
  return [...new Set(order)].filter((id) => !changes.removed.includes(id));
}

/**
 * Was könnte dich interessieren? Deine Marken vor bekannten Marken, Rabatt nur als kleiner
 * Pluspunkt, was erst später gilt nach hinten. Für Abwechslung zuerst ein Produkt pro Marke,
 * dann unterschiedliche Produkte, dann der Rest.
 */
export function rankForYou(offers: Offer[], watchlist: WatchItem[], today = todayISO()): Offer[] {
  const yourTerms = watchlist.filter((w) => !w.categoryId).map((w) => w.term);
  const score = (o: Offer) =>
    (yourTerms.some((t) => matchesBrand(o, t)) ? 100 : 0) +
    (BUILTIN_BRANDS.some((b) => matchesBrand(o, b)) ? 40 : 0) +
    (discountPercent(o) ?? 0) * 0.2 -
    (isUpcoming(o, today) ? 50 : 0);
  const sorted = offers
    .filter((o) => isActive(o, today))
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || a.o.price - b.o.price)
    .map(({ o }) => o);

  const brands = new Set<string>();
  const names = new Set<string>();
  const firstOfBrand: Offer[] = [];
  const otherProducts: Offer[] = [];
  const rest: Offer[] = [];
  for (const o of sorted) {
    const brand = normalize(o.brand ?? displayName(o));
    const name = normalize(displayName(o));
    if (!brands.has(brand)) firstOfBrand.push(o);
    else if (!names.has(name)) otherProducts.push(o);
    else rest.push(o);
    brands.add(brand);
    names.add(name);
  }
  return [...firstOfBrand, ...otherProducts, ...rest];
}

/** Abschnitte für einen Markt; dasselbe Angebot steht nur bei der ersten passenden Kategorie */
export function sectionsForStore(
  offers: Offer[],
  market: Market,
  interests: Category[],
  watchlist: WatchItem[],
  today = todayISO(),
): StoreSection[] {
  const seen = new Set<string>();
  return interests.map((category) => {
    const own = offers.filter((o) => {
      if (o.market !== market || o.term !== category.label || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
    return { category, offers: rankForYou(own, watchlist, today) };
  });
}
