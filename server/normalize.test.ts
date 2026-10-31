import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/search-monster.json";
import { normalizeResults, type RawOffer } from "./normalize";
import { matchMarket } from "./retailers";

// Echte marktguru-Antwort für "monster", PLZ 10115, vom 31.10.2026
const results = fixture.results as RawOffer[];

describe("normalizeResults", () => {
  it("findet für 'Monster Energy' nur den Energy Drink bei Rewe, ohne Dublette", () => {
    const offers = normalizeResults(results, "Monster Energy");
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({
      term: "Monster Energy",
      product: "Energy Drink",
      brand: "Monster Energy",
      market: "Rewe",
      price: 0.99,
      oldPrice: undefined,
      validFrom: "2026-10-26",
      validUntil: "2026-10-31",
      referencePrice: 1.98,
      referenceUnit: "l",
      deposit: 0.25,
      category: "Softdrinks",
      externalUrl: undefined,
      loyalty: "bonus",
      source: "marktguru",
    });
  });

  it("übernimmt den Link zum Markt, falls vorhanden", () => {
    const [offer] = normalizeResults(results, "Mon Chéri");
    expect(offer).toMatchObject({ market: "Kaufland", product: "Mon Chéri Pralines", brand: "Ferrero" });
    expect(offer.externalUrl).toMatch(/^https:\/\/filiale\.kaufland\.de\//);
    expect(offer.deposit).toBeUndefined();
  });

  it("erkennt Kundenkarten-Pflicht und lässt normale Angebote ohne Hinweis", () => {
    const base = results.find((r) => r.product?.name === "Monster Mampf Mini")!;
    expect(normalizeResults([base], "Monster")[0].loyalty).toBeUndefined();
    expect(normalizeResults([{ ...base, requiresLoyalityMembership: true }], "Monster")[0].loyalty).toBe("required");
    expect(normalizeResults([{ ...base, description: "nur mit Lidl Plus" }], "Monster")[0].loyalty).toBe("required");
    expect(normalizeResults([{ ...base, description: "10-fach PAYBACK Punkte" }], "Monster")[0].loyalty).toBe("bonus");
  });

  it("blendet Märkte außerhalb der Auswahl aus (nahkauf, toom)", () => {
    const markets = normalizeResults(results, "Monster").map((o) => o.market);
    expect(markets).toEqual(["Rewe", "Penny"]);
  });

  it("verlangt alle Wörter, auch zusammengeschrieben", () => {
    expect(normalizeResults(results, "Monster Mampf").map((o) => o.product)).toEqual(["Monster Mampf Mini"]);
    expect(normalizeResults(results, "Monstermampf")).toHaveLength(1);
    expect(normalizeResults(results, "Red Bull")).toHaveLength(0);
  });
});

describe("matchMarket", () => {
  it("erkennt die Schreibweisen von marktguru", () => {
    expect(matchMarket("REWE")).toBe("Rewe");
    expect(matchMarket("REWE Center")).toBe("Rewe");
    expect(matchMarket("ALDI SÜD")).toBe("Aldi Süd");
    expect(matchMarket("Aldi Nord")).toBe("Aldi Nord");
    expect(matchMarket("Netto Marken-Discount")).toBe("Netto");
    expect(matchMarket("EDEKA Center")).toBe("Edeka");
    expect(matchMarket("nahkauf")).toBeUndefined();
    expect(matchMarket("toom Baumarkt")).toBeUndefined();
  });
});
