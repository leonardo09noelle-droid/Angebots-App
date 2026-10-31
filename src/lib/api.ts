import type { Offer } from "../types";

export interface RemoteResult {
  offers: Offer[];
  failedTerms: string[];
}

/** Holt die Angebote für alle Merklisten-Einträge über unsere /api/offers-Funktion */
export async function fetchOffers(zip: string, terms: string[], signal?: AbortSignal): Promise<RemoteResult> {
  const params = new URLSearchParams({ zip, q: terms.join(",") });
  const res = await fetch(`/api/offers?${params}`, { signal });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
  return { offers: body.offers ?? [], failedTerms: body.failedTerms ?? [] };
}
