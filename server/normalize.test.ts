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
      amount: "500 ml",
      deposit: 0.25,
      category: "Softdrinks",
      externalUrl: undefined,
      loyalty: "bonus",
      source: "marktguru",
    });
  });

  it("fasst dasselbe Angebot aus Regional-Prospekten mit anderem Kleingedruckten zusammen", () => {
    const rewe = results.filter((r) => r.advertisers?.[0]?.name === "REWE");
    const variants = [{ ...rewe[0], description: "versch. Sorten, je 0,5-l-Dose" }, rewe[1]];
    const offers = normalizeResults(variants, "Monster Energy");
    expect(offers).toHaveLength(1);
    // die ausführlichere Beschreibung samt App-Bonus bleibt erhalten
    expect(offers[0].details).toContain("REWE BONUS");
    expect(offers[0].loyalty).toBe("bonus");
    expect(offers[0].deposit).toBe(0.25);
  });

  it("liest den Normalpreis aus dem Prospekttext, wenn marktguru keinen liefert", () => {
    const base = results.find((r) => r.product?.name === "Energy Drink")!; // 0,99 €
    const withText = (description: string) =>
      normalizeResults([{ ...base, description }], "Monster Energy")[0].oldPrice;
    expect(withText("je 0,5-l-Dose, statt 1,49")).toBe(1.49);
    expect(withText("UVP 1.79 €")).toBe(1.79);
    expect(withText("Normalpreis: 1,59")).toBe(1.59);
    expect(withText("versch. Sorten")).toBeUndefined();
    // niedriger als der Angebotspreis: kein Normalpreis
    expect(withText("statt 0,89")).toBeUndefined();
    // direkt von marktguru hat Vorrang
    expect(normalizeResults([{ ...base, oldPrice: 1.39, description: "statt 1,49" }], "Monster Energy")[0].oldPrice).toBe(
      1.39,
    );
  });

  it("zeigt die Füllmenge, bei Packs mit Stückzahl", () => {
    const covo = results.find((r) => r.product?.name === "Monster Mampf Mini")!; // 6 × 0,038 kg
    expect(normalizeResults([covo], "Monster Mampf")[0].amount).toBe("6 × 38 g");
    const rewe = results.find((r) => r.product?.name === "Energy Drink")!;
    expect(normalizeResults([{ ...rewe, volume: 0.25, quantity: 4 }], "Monster Energy")[0].amount).toBe("4 × 250 ml");
    expect(normalizeResults([{ ...rewe, volume: 1.5 }], "Monster Energy")[0].amount).toBe("1,5 l");
    expect(normalizeResults([{ ...rewe, volume: null }], "Monster Energy")[0].amount).toBeUndefined();
  });

  it("verwirft Kaufland-Angebote", () => {
    expect(normalizeResults(results, "Mon Chéri")).toHaveLength(0);
  });

  it("übernimmt den Link zum Markt, falls vorhanden", () => {
    // Das Kaufland-Angebot aus den Testdaten, umgehängt auf EDEKA
    const monCheri = results.find((r) => r.product?.name === "Mon Chéri Pralines")!;
    const [offer] = normalizeResults([{ ...monCheri, advertisers: [{ name: "EDEKA" }] }], "Mon Chéri");
    expect(offer).toMatchObject({ market: "Edeka", product: "Mon Chéri Pralines", brand: "Ferrero" });
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
    expect(matchMarket("Kaufland")).toBeUndefined();
    expect(matchMarket("toom Baumarkt")).toBeUndefined();
  });
});
