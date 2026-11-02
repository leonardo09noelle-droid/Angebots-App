import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { favoriteOf } from "./favorites";

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
