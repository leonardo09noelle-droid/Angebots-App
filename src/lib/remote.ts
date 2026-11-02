import type { Offer, WatchItem } from "../types";
import { findCategory } from "./categories";
import { isActive, todayISO } from "./offers";
import type { RemoteCache } from "./storage";
import type { SearchTerm } from "./synonyms";

// Sparsam laden: Gespeicherte Angebote gelten 3 Stunden. Neue Favoriten werden einzeln
// nachgeladen, statt jedes Mal alles neu abzurufen.

export const FRESH_MS = 3 * 60 * 60 * 1000;

const key = (term: string) => term.trim().toLowerCase();

/** Was an die Suche geht: Kategorie-Favoriten mit den Suchbegriffen ihrer Kachel */
export function searchTermOf(item: WatchItem): SearchTerm {
  const category = findCategory(item.categoryId);
  return category ? { term: item.term, queries: category.queries } : item.term;
}

/** Wann der Favorit zuletzt abgerufen wurde */
export function fetchedAtOf(cache: RemoteCache, term: string): number | undefined {
  return cache.termFetchedAt?.[key(term)];
}

/**
 * Speicher von vor 3.0 kennen nur einen Zeitpunkt für alles. Bis 2.1 wurde bei jeder Änderung die
 * ganze Merkliste geladen, also gilt er für genau die Favoriten, die beim Start auf der Liste stehen.
 */
export function upgradeCache(cache: RemoteCache | null, watchlist: WatchItem[]): RemoteCache | null {
  if (!cache || cache.termFetchedAt) return cache;
  return { ...cache, termFetchedAt: Object.fromEntries(watchlist.map((w) => [key(w.term), cache.fetchedAt])) };
}

/** Favoriten, die neu geladen werden müssen: noch nie abgerufen, andere PLZ oder älter als 3 Stunden */
export function termsToFetch(
  cache: RemoteCache | null,
  zip: string,
  watchlist: WatchItem[],
  now = Date.now(),
): WatchItem[] {
  return watchlist.filter((item) => {
    if (!cache || cache.zip !== zip) return true;
    const at = fetchedAtOf(cache, item.term);
    return at === undefined || now - at >= FRESH_MS;
  });
}

/**
 * Frisch geladene Angebote einarbeiten: Für jeden abgerufenen Begriff ersetzen sie die alten.
 * Weg fallen abgelaufene Angebote und alles von Favoriten, die es nicht mehr gibt.
 */
export function mergeRemote(
  cache: RemoteCache | null,
  zip: string,
  fetchedTerms: string[],
  offers: Offer[],
  watchlist: WatchItem[],
  now = Date.now(),
  today = todayISO(new Date(now)),
): RemoteCache {
  const base = cache && cache.zip === zip ? cache : null;
  const fetched = new Set(fetchedTerms.map(key));
  const kept = new Set(watchlist.map((w) => key(w.term)));

  const termFetchedAt: Record<string, number> = {};
  for (const item of watchlist) {
    const k = key(item.term);
    const at = fetched.has(k) ? now : base ? fetchedAtOf(base, item.term) : undefined;
    if (at !== undefined) termFetchedAt[k] = at;
  }

  const old = (base?.offers ?? []).filter((o) => !fetched.has(key(o.term)));
  return {
    zip,
    fetchedAt: now,
    termFetchedAt,
    offers: [...old, ...offers].filter((o) => kept.has(key(o.term)) && isActive(o, today)),
  };
}
