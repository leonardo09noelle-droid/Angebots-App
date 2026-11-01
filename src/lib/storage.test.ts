import { beforeEach, describe, expect, it } from "vitest";
import { loadMarkets, removeLegacyOffers } from "./storage";

// Kleiner localStorage-Ersatz für die Tests (Node hat keinen)
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

beforeEach(() => store.clear());

describe("loadMarkets", () => {
  it("startet mit allen Märkten, ohne Kaufland", () => {
    expect(loadMarkets()).toEqual(["Lidl", "Aldi Nord", "Aldi Süd", "Penny", "Netto", "Rewe", "Edeka"]);
  });

  it("wirft alte, gespeicherte Kaufland-Auswahl still heraus", () => {
    store.set("angebote.markets", JSON.stringify(["Lidl", "Kaufland", "Rewe"]));
    expect(loadMarkets()).toEqual(["Lidl", "Rewe"]);
  });
});

describe("removeLegacyOffers", () => {
  it("löscht selbst eingetragene Angebote aus alten Versionen", () => {
    store.set("angebote.offers", "[]");
    removeLegacyOffers();
    expect(store.has("angebote.offers")).toBe(false);
  });
});
