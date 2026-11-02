import { afterEach, describe, expect, it, vi } from "vitest";
import type { Offer } from "../types";
import { fetchOffers } from "./api";
import { expandQuery, planQueries } from "./synonyms";

describe("expandQuery", () => {
  it("sucht Synonyme mit", () => {
    expect(expandQuery("Gummibärchen")).toEqual(["Gummibärchen", "Fruchtgummi"]);
    expect(expandQuery("energydrink")).toEqual(["energydrink", "Energy Drink"]);
    expect(expandQuery("Süßigkeiten")).toEqual(["Süßigkeiten", "Schokolade", "Fruchtgummi"]);
    expect(expandQuery("High Protein")).toEqual(["High Protein", "Protein", "Eiweiß"]);
  });

  it("verzeiht kleine Tippfehler bei den Stichwörtern", () => {
    expect(expandQuery("Gumibärchen")).toEqual(["Gumibärchen", "Fruchtgummi", "Gummibärchen"]);
  });

  it("lässt unbekannte Begriffe und Marken in Ruhe", () => {
    expect(expandQuery("Pringles")).toEqual(["Pringles"]);
    expect(expandQuery("Monster Energy")).toEqual(["Monster Energy"]);
  });
});

describe("planQueries", () => {
  it("sucht gemeinsame Synonyme nur einmal und merkt sich die Herkunft", () => {
    const { queries, originOf } = planQueries(["Gummibärchen", "Fruchtgummi"]);
    expect(queries).toEqual(["Gummibärchen", "Fruchtgummi"]);
    expect(originOf.get("fruchtgummi")).toEqual(["Gummibärchen", "Fruchtgummi"]);
  });

  it("nimmt bei Kategorie-Favoriten deren feste Suchbegriffe", () => {
    const { queries, originOf } = planQueries([{ term: "Schoki", queries: ["Schokolade"] }, "Müsli"]);
    expect(queries).toEqual(["Schokolade", "Müsli", "Granola"]);
    expect(originOf.get("schokolade")).toEqual(["Schoki"]);
    expect(originOf.get("granola")).toEqual(["Müsli"]);
  });
});

describe("fetchOffers mit Synonymen", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("ordnet Fruchtgummi-Treffer dem Favoriten Gummibärchen zu", async () => {
    const offer = { id: "h1", term: "Fruchtgummi", product: "Goldbären", brand: "Haribo", price: 0.99, market: "Lidl" };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ offers: [offer, offer], failedTerms: [] })));
    vi.stubGlobal("fetch", fetchMock);

    const { offers } = await fetchOffers("10115", ["Gummibärchen"]);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toContain("q=Gummib%C3%A4rchen%2CFruchtgummi");
    expect(offers.map((o: Offer) => [o.id, o.term])).toEqual([["h1", "Gummibärchen"]]);
  });
});
