import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { favoriteOf, moveItem } from "./favorites";

describe("moveItem", () => {
  it("schiebt nach oben und nach unten", () => {
    expect(moveItem(["Kölln", "Pringles", "Monster"], 2, 0)).toEqual(["Monster", "Kölln", "Pringles"]);
    expect(moveItem(["Kölln", "Pringles", "Monster"], 0, 2)).toEqual(["Pringles", "Monster", "Kölln"]);
  });

  it("lässt die Liste bei gleichem Platz oder ungültigem Start in Ruhe", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 1, 1)).toBe(list);
    expect(moveItem(list, 5, 0)).toBe(list);
    expect(moveItem(list, 0, 9)).toEqual(["b", "a"]);
  });
});

const offer = (o: Partial<Offer>): Offer => ({
  id: "x",
  term: "Schokolade",
  product: "Joy",
  price: 0.99,
  market: "Lidl",
  source: "marktguru",
  ...o,
});

describe("favoriteOf", () => {
  it("merkt genau das Produkt auf der Karte, nicht die Kategorie", () => {
    expect(favoriteOf(offer({ brand: "Kinder", product: "Joy 3er" }))).toEqual({ term: "Kinder Joy" });
    expect(favoriteOf(offer({ brand: "Red Bull", product: "Energy Drink 0,25 l" }))).toEqual({ term: "Red Bull" });
  });

  it("entfernt Kommas, weil die Suche damit Begriffe trennt", () => {
    expect(favoriteOf(offer({ brand: undefined, product: "Milch, fettarm" }))).toEqual({ term: "Milch fettarm" });
  });
});
