import type { RawOffer } from "./normalize.js";

// marktguru hat keine offizielle Schnittstelle. Die Webseite selbst nutzt diese API
// mit zwei Schlüsseln, die im HTML der Startseite stehen. Ändert marktguru das,
// schlägt hier der Abruf fehl und die App zeigt nur noch selbst eingetragene Angebote.

const HOME_URL = "https://www.marktguru.de/";
const SEARCH_URL = "https://api.marktguru.de/api/v1/offers/search";
const KEY_TTL_MS = 6 * 60 * 60 * 1000;

interface Keys {
  apiKey: string;
  clientKey: string;
  fetchedAt: number;
}

let cachedKeys: Keys | undefined;

async function getKeys(forceRefresh = false): Promise<Keys> {
  if (!forceRefresh && cachedKeys && Date.now() - cachedKeys.fetchedAt < KEY_TTL_MS) return cachedKeys;

  const res = await fetch(HOME_URL, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`marktguru-Startseite: HTTP ${res.status}`);
  const html = await res.text();

  const blocks = html.match(/<script[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g) ?? [];
  for (const block of blocks) {
    const apiKey = block.match(/"apiKey"\s*:\s*"([^"]+)"/)?.[1];
    const clientKey = block.match(/"clientKey"\s*:\s*"([^"]+)"/)?.[1];
    if (apiKey && clientKey) {
      cachedKeys = { apiKey, clientKey, fetchedAt: Date.now() };
      return cachedKeys;
    }
  }
  throw new Error("marktguru-Schlüssel nicht gefunden (Webseite hat sich vermutlich geändert)");
}

export async function searchOffers(term: string, zip: string): Promise<RawOffer[]> {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({ as: "web", limit: "50", offset: "0", q: term, zipCode: zip }).toString();

  for (const forceRefresh of [false, true]) {
    const keys = await getKeys(forceRefresh);
    const res = await fetch(url, { headers: { "x-apikey": keys.apiKey, "x-clientkey": keys.clientKey } });
    // Abgelaufene Schlüssel: einmal frisch holen und nochmal versuchen
    if ((res.status === 401 || res.status === 403) && !forceRefresh) continue;
    if (!res.ok) throw new Error(`marktguru-Suche: HTTP ${res.status}`);
    const json = (await res.json()) as { results?: RawOffer[] };
    return json.results ?? [];
  }
  throw new Error("marktguru-Suche: Zugriff verweigert");
}
