import { MARKETS, type Market, type Offer, type WatchItem } from "../types";
import { isKnownBrand } from "./brands";

// Alles liegt nur auf diesem Handy (localStorage). Lesen/Schreiben kann z. B. im
// privaten Modus fehlschlagen, deshalb fällt alles auf die Startwerte zurück.

const KEYS = {
  watchlist: "angebote.watchlist",
  zip: "angebote.zip",
  remote: "angebote.remote",
  markets: "angebote.markets",
  seen: "angebote.seen",
  brands: "angebote.brands",
};

const MAX_SEEN = 2000;
const MAX_BRANDS = 500;

/** Letztes Ergebnis der automatischen Suche, damit die App auch offline etwas zeigt */
export interface RemoteCache {
  zip: string;
  fetchedAt: number;
  offers: Offer[];
}

export const DEFAULT_WATCHLIST: WatchItem[] = [
  { term: "Monster Energy", brandOnly: true },
  { term: "Proteinriegel", brandOnly: false },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speichern nicht möglich: App läuft trotzdem weiter, nur ohne Merken.
  }
}

/** Ältere Versionen speicherten nur Texte; die werden umgewandelt (bekannte Marke -> "Nur diese Marke") */
export function parseWatchlist(raw: unknown): WatchItem[] {
  if (!Array.isArray(raw)) return DEFAULT_WATCHLIST;
  return raw.flatMap((entry): WatchItem[] => {
    if (typeof entry === "string") return entry.trim() ? [{ term: entry, brandOnly: isKnownBrand(entry) }] : [];
    if (entry && typeof entry.term === "string") return [{ term: entry.term, brandOnly: !!entry.brandOnly }];
    return [];
  });
}

export const loadWatchlist = () => parseWatchlist(read<unknown>(KEYS.watchlist, null));
export const saveWatchlist = (list: WatchItem[]) => write(KEYS.watchlist, list);

/** Marken, die die App in Ergebnissen gesehen hat (für Vorschläge und "Meintest du …?") */
export const loadLearnedBrands = () => read<string[]>(KEYS.brands, []);
export function learnBrands(previous: string[], offers: Offer[]): string[] {
  const known = new Set(previous.map((b) => b.toLowerCase()));
  const fresh: string[] = [];
  for (const offer of offers) {
    const brand = offer.brand?.trim();
    if (!brand || known.has(brand.toLowerCase())) continue;
    known.add(brand.toLowerCase());
    fresh.push(brand);
  }
  if (fresh.length === 0) return previous;
  const next = [...fresh, ...previous].slice(0, MAX_BRANDS);
  write(KEYS.brands, next);
  return next;
}

export const loadZip = () => read<string>(KEYS.zip, "");
export const saveZip = (zip: string) => write(KEYS.zip, zip);

/** Selbst eingetragene Angebote gibt es nicht mehr: alten Speicher einmal aufräumen */
export function removeLegacyOffers(): void {
  try {
    localStorage.removeItem("angebote.offers");
  } catch {
    // nichts zu tun
  }
}

export const loadRemote = () => read<RemoteCache | null>(KEYS.remote, null);
export const saveRemote = (cache: RemoteCache) => write(KEYS.remote, cache);

/** Angehakte Lieblingsmärkte, Standard: alle */
export const loadMarkets = (): Market[] =>
  read<string[]>(KEYS.markets, [...MARKETS]).filter((m): m is Market => (MARKETS as readonly string[]).includes(m));
export const saveMarkets = (markets: Market[]) => write(KEYS.markets, markets);

/** IDs schon gesehener Angebote für das "Neu"-Abzeichen; null = App wurde noch nie geladen */
export const loadSeen = () => read<string[] | null>(KEYS.seen, null);
export const saveSeen = (ids: string[]) => write(KEYS.seen, ids.slice(0, MAX_SEEN));
