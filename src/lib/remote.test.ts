import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { FRESH_MS, mergeRemote, searchTermOf, termsToFetch, upgradeCache } from "./remote";
import type { RemoteCache } from "./storage";

const offer = (id: string, term: string, validUntil?: string): Offer => ({
  id,
  term,
  product: id,
  price: 1,
  market: "Lidl",
  source: "marktguru",
  validUntil,
});

const NOW = new Date(2026, 10, 2, 12).getTime();
const list = (...terms: string[]) => terms.map((term) => ({ term }));

describe("termsToFetch", () => {
  const cache: RemoteCache = {
    zip: "10115",
    fetchedAt: NOW,
    offers: [],
    termFetchedAt: { "monster energy": NOW - 60_000, proteinriegel: NOW - FRESH_MS },
  };

  it("lädt nur, was neu oder älter als 3 Stunden ist", () => {
    const terms = termsToFetch(cache, "10115", list("Monster Energy", "Proteinriegel", "Müsli"), NOW);
    expect(terms.map((t) => t.term)).toEqual(["Proteinriegel", "Müsli"]);
  });

  it("lädt alles bei anderer PLZ oder ohne Speicher", () => {
    expect(termsToFetch(cache, "80331", list("Monster Energy"), NOW)).toHaveLength(1);
    expect(termsToFetch(null, "10115", list("Monster Energy"), NOW)).toHaveLength(1);
  });

  it("übernimmt Speicher von vor 3.0 nur für die Favoriten, die schon drauf waren", () => {
    const old = upgradeCache({ zip: "10115", fetchedAt: NOW - 1000, offers: [] }, list("Monster Energy"));
    expect(termsToFetch(old, "10115", list("Monster Energy", "Pringles"), NOW).map((t) => t.term)).toEqual([
      "Pringles",
    ]);
  });
});

describe("mergeRemote", () => {
  const cache: RemoteCache = {
    zip: "10115",
    fetchedAt: NOW - 1000,
    offers: [offer("m1", "Monster Energy"), offer("p-old", "Pringles"), offer("x", "Gelöscht"), offer("e", "Monster Energy", "2026-10-01")],
    termFetchedAt: { "monster energy": NOW - 1000, pringles: NOW - 1000, gelöscht: NOW - 1000 },
  };

  it("ersetzt nur die abgerufenen Favoriten und räumt Altes auf", () => {
    const merged = mergeRemote(cache, "10115", ["Pringles"], [offer("p-new", "Pringles")], list("Monster Energy", "Pringles"), NOW);
    expect(merged.offers.map((o) => o.id)).toEqual(["m1", "p-new"]);
    expect(merged.termFetchedAt).toEqual({ "monster energy": NOW - 1000, pringles: NOW });
  });

  it("fängt bei anderer PLZ von vorne an", () => {
    const merged = mergeRemote(cache, "80331", ["Pringles"], [offer("p", "Pringles")], list("Monster Energy", "Pringles"), NOW);
    expect(merged.offers.map((o) => o.id)).toEqual(["p"]);
    expect(merged.termFetchedAt).toEqual({ pringles: NOW });
  });
});

describe("searchTermOf", () => {
  it("sucht Kategorie-Favoriten mit den Begriffen der Kachel", () => {
    expect(searchTermOf({ term: "Müsli", categoryId: "muesli" })).toEqual({ term: "Müsli", queries: ["Müsli", "Granola"] });
    expect(searchTermOf({ term: "Pringles" })).toBe("Pringles");
  });
});
