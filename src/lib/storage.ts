import { MARKETS, type Market, type Offer } from "../types";

// Alles liegt nur auf diesem Handy (localStorage). Lesen/Schreiben kann z. B. im
// privaten Modus fehlschlagen, deshalb fällt alles auf die Startwerte zurück.

const KEYS = {
  watchlist: "angebote.watchlist",
  zip: "angebote.zip",
  offers: "angebote.offers",
  remote: "angebote.remote",
  markets: "angebote.markets",
  seen: "angebote.seen",
};

const MAX_SEEN = 2000;

/** Letztes Ergebnis der automatischen Suche, damit die App auch offline etwas zeigt */
export interface RemoteCache {
  zip: string;
  fetchedAt: number;
  offers: Offer[];
}

export const DEFAULT_WATCHLIST = ["Monster Energy", "Proteinriegel"];

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

export const loadWatchlist = () => read<string[]>(KEYS.watchlist, DEFAULT_WATCHLIST);
export const saveWatchlist = (list: string[]) => write(KEYS.watchlist, list);

export const loadZip = () => read<string>(KEYS.zip, "");
export const saveZip = (zip: string) => write(KEYS.zip, zip);

export const loadOffers = () => read<Offer[]>(KEYS.offers, []);
export const saveOffers = (offers: Offer[]) => write(KEYS.offers, offers);

export const loadRemote = () => read<RemoteCache | null>(KEYS.remote, null);
export const saveRemote = (cache: RemoteCache) => write(KEYS.remote, cache);

/** Angehakte Lieblingsmärkte, Standard: alle */
export const loadMarkets = (): Market[] =>
  read<string[]>(KEYS.markets, [...MARKETS]).filter((m): m is Market => (MARKETS as readonly string[]).includes(m));
export const saveMarkets = (markets: Market[]) => write(KEYS.markets, markets);

/** IDs schon gesehener Angebote für das "Neu"-Abzeichen; null = App wurde noch nie geladen */
export const loadSeen = () => read<string[] | null>(KEYS.seen, null);
export const saveSeen = (ids: string[]) => write(KEYS.seen, ids.slice(0, MAX_SEEN));
