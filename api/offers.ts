import { searchOffers } from "../server/marktguru";
import { normalizeResults } from "../server/normalize";

// GET /api/offers?zip=10115&q=Monster%20Energy,Proteinriegel
// Läuft auf Vercel als Serverless-Funktion und lokal über die Middleware in vite.config.ts.

const MAX_TERMS = 15;

function json(body: unknown, status: number, cache = false): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Vercel hält das Ergebnis 1 h vor, danach wird im Hintergrund neu geladen
      "cache-control": cache ? "public, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const zip = params.get("zip") ?? "";
  const terms = [
    ...new Set(
      (params.get("q") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length <= 50),
    ),
  ].slice(0, MAX_TERMS);

  if (!/^\d{5}$/.test(zip)) return json({ error: "Bitte eine gültige Postleitzahl angeben." }, 400);
  if (terms.length === 0) return json({ offers: [] }, 200);

  const results = await Promise.allSettled(terms.map((term) => searchOffers(term, zip)));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length === results.length) {
    console.error("marktguru failed:", failed.map((r) => (r as PromiseRejectedResult).reason));
    return json({ error: "Die Angebotssuche ist gerade nicht erreichbar." }, 502);
  }

  const offers = results.flatMap((r, i) => (r.status === "fulfilled" ? normalizeResults(r.value, terms[i]) : []));
  return json({ offers, failedTerms: terms.filter((_, i) => results[i].status === "rejected") }, 200, failed.length === 0);
}
