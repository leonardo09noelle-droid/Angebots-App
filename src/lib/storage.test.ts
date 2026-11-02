import { beforeEach, describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { isFirstStart, learnBrands, loadMarkets, loadWatchlist, parseWatchlist, removeLegacyOffers } from "./storage";

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

describe("Favoriten", () => {
  it("wandelt das ganz alte Format (nur Texte) um", () => {
    store.set("angebote.watchlist", JSON.stringify(["Monster Energy", "Proteinriegel"]));
    expect(loadWatchlist()).toEqual([{ term: "Monster Energy" }, { term: "Proteinriegel" }]);
  });

  it("übernimmt Einträge aus 2.x und lässt den alten Marken-Schalter weg", () => {
    store.set(
      "angebote.watchlist",
      JSON.stringify([
        { term: "Pringles", brandOnly: true },
        { term: "Chips", brandOnly: false },
      ]),
    );
    expect(loadWatchlist()).toEqual([{ term: "Pringles" }, { term: "Chips" }]);
  });

  it("liest Kategorie-Favoriten und ignoriert Kaputtes", () => {
    expect(parseWatchlist([{ term: "Müsli", categoryId: "muesli" }, 42, "", { foo: 1 }, { term: " " }])).toEqual([
      { term: "Müsli", categoryId: "muesli" },
    ]);
  });

  it("startet bei Neuinstallation ohne vorgegebene Produkte", () => {
    expect(loadWatchlist()).toEqual([]);
  });
});

describe("isFirstStart", () => {
  it("erkennt eine frische Installation", () => {
    expect(isFirstStart()).toBe(true);
  });

  it("zählt nicht als erster Start, wenn schon etwas gespeichert ist", () => {
    store.set("angebote.seenVersion", JSON.stringify("1.5"));
    expect(isFirstStart()).toBe(false);
    store.clear();
    store.set("angebote.zip", JSON.stringify("10115"));
    expect(isFirstStart()).toBe(false);
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
