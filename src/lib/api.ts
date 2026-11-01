import type { Offer } from "../types";
import { planQueries, queryKey } from "./synonyms";

export interface RemoteResult {
  offers: Offer[];
  failedTerms: string[];
}

/**
 * Holt die Angebote über unsere /api/offers-Funktion. Sucht Synonyme mit ("Gummibärchen" auch als
 * "Fruchtgummi") und ordnet die Treffer wieder dem ursprünglichen Begriff zu.
 */
export async function fetchOffers(zip: string, terms: string[], signal?: AbortSignal): Promise<RemoteResult> {
  const { queries, originOf } = planQueries(terms);
  const params = new URLSearchParams({ zip, q: queries.join(",") });
  const res = await fetch(`/api/offers?${params}`, { signal });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
  // Z. B. eine HTML-Seite statt JSON: nicht als "keine Angebote" werten
  if (!Array.isArray(body.offers)) throw new Error("Unerwartete Antwort vom Server.");

  const seen = new Set<string>();
  const offers: Offer[] = [];
  for (const offer of body.offers as Offer[]) {
    for (const term of originOf.get(queryKey(offer.term)) ?? [offer.term]) {
      // dasselbe Angebot nur einmal pro ursprünglichem Begriff
      const key = `${offer.id}|${term}`;
      if (seen.has(key)) continue;
      seen.add(key);
      offers.push({ ...offer, term });
    }
  }
  const failedTerms = [
    ...new Set(((body.failedTerms ?? []) as string[]).flatMap((q) => originOf.get(queryKey(q)) ?? [q])),
  ];
  return { offers, failedTerms };
}
