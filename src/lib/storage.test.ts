import { beforeEach, describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { learnBrands, loadMarkets, loadWatchlist, parseWatchlist, removeLegacyOffers } from "./storage";

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

describe("Merkliste", () => {
  it("wandelt das alte Format (nur Texte) um und schaltet bei Marken 'Nur Marke' an", () => {
    store.set("angebote.watchlist", JSON.stringify(["Monster Energy", "Proteinriegel"]));
    expect(loadWatchlist()).toEqual([
      { term: "Monster Energy", brandOnly: true },
      { term: "Proteinriegel", brandOnly: false },
    ]);
  });

  it("liest das neue Format unverändert und ignoriert Kaputtes", () => {
    expect(parseWatchlist([{ term: "Pringles", brandOnly: false }, 42, "", { foo: 1 }])).toEqual([
      { term: "Pringles", brandOnly: false },
    ]);
  });

  it("startet mit Monster Energy (Marke) und Proteinriegel", () => {
    expect(loadWatchlist()).toEqual([
      { term: "Monster Energy", brandOnly: true },
      { term: "Proteinriegel", brandOnly: false },
    ]);
  });
});

describe("learnBrands", () => {
  it("merkt sich neue Marken ohne Dubletten", () => {
    const offers = [{ brand: "Pringles" }, { brand: "pringles" }, { brand: "Lay's" }, {}] as Offer[];
    expect(learnBrands(["Lay's"], offers)).toEqual(["Pringles", "Lay's"]);
    expect(learnBrands(["Pringles", "Lay's"], offers)).toEqual(["Pringles", "Lay's"]);
  });
});

describe("removeLegacyOffers", () => {
  it("löscht selbst eingetragene Angebote aus alten Versionen", () => {
    store.set("angebote.offers", "[]");
    removeLegacyOffers();
    expect(store.has("angebote.offers")).toBe(false);
  });
});
