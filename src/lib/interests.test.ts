import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { ALL_CATEGORIES, findCategory } from "./categories";
import {
  effectiveInterests,
  rankForYou,
  sectionsForStore,
  storeCategoryIds,
  suggestInterests,
  toggleInterest,
} from "./interests";

const today = "2026-11-06";
const offer = (o: Partial<Offer>): Offer => ({
  id: "x",
  term: "Energy Drinks",
  product: "Energy Drink",
  price: 1,
  market: "Rewe",
  source: "marktguru",
  ...o,
});

describe("suggestInterests", () => {
  it("erkennt Marken, Begriffe und Kategorie-Favoriten", () => {
    expect(
      suggestInterests([{ term: "Monster Energy" }, { term: "Gummibärchen" }, { term: "Schoki", categoryId: "schokolade" }], []),
    ).toEqual(["energy", "schokolade", "fruchtgummi"]);
  });

  it("nutzt auch die Angebote eines Favoriten", () => {
    const offers = [offer({ term: "Tolle Sache", brand: "Haribo", product: "Goldbären" })];
    expect(suggestInterests([{ term: "Tolle Sache" }], offers)).toEqual(["fruchtgummi"]);
  });

  it("verwechselt kurze Stichwörter nicht mitten im Wort", () => {
    expect(suggestInterests([{ term: "Pistachio Creme" }], [])).toEqual([]);
    expect(suggestInterests([{ term: "Coca-Cola" }], [])).toEqual(["cola"]);
  });

  it("ist ohne Favoriten leer", () => {
    expect(suggestInterests([], [])).toEqual([]);
  });
});

describe("eigene Änderungen", () => {
  it("bleiben erhalten, wenn neue Favoriten dazukommen", () => {
    const changes = { added: ["kekse"], removed: ["energy"] };
    expect(effectiveInterests(["energy", "chips"], changes)).toEqual(["chips", "kekse"]);
    expect(effectiveInterests(["energy", "chips", "wasser"], changes)).toEqual(["wasser", "chips", "kekse"]);
  });

  it("lassen sich an- und abwählen", () => {
    const off = toggleInterest({ added: ["kekse"], removed: [] }, "kekse", true);
    expect(off).toEqual({ added: [], removed: ["kekse"] });
    expect(toggleInterest(off, "kekse", false)).toEqual({ added: [], removed: [] });
  });
});

describe("storeCategoryIds", () => {
  it("zeigt deine Interessen zuerst, dann Alltagsprodukte, jede Kategorie einmal", () => {
    const ids = storeCategoryIds(["energy", "chips"], { added: [], removed: [] });
    expect(ids.slice(0, 4)).toEqual(["energy", "chips", "kaese", "mozzarella"]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(ALL_CATEGORIES.length);
  });

  it("zeigt auch ohne Favoriten genug und lässt Ausgeblendetes weg", () => {
    const ids = storeCategoryIds([], { added: [], removed: ["chips"] });
    expect(ids[0]).toBe("kaese");
    expect(ids).not.toContain("chips");
  });
});

describe("rankForYou", () => {
  it("setzt deine Marken vor bekannte und bekannte vor unbekannte, trotz höherem Rabatt", () => {
    const list = rankForYou(
      [
        offer({ id: "noname", brand: "Billigmarke", price: 0.5, oldPrice: 2 }),
        offer({ id: "redbull", brand: "Red Bull", price: 1.2 }),
        offer({ id: "monster", brand: "Monster Energy", price: 1.5 }),
      ],
      [{ term: "Monster Energy" }],
      today,
    );
    expect(list.map((o) => o.id)).toEqual(["monster", "redbull", "noname"]);
  });

  it("zeigt zuerst ein Produkt pro Marke, dann weitere Produkte, Gleiches zuletzt", () => {
    const list = rankForYou(
      [
        offer({ id: "rb1", brand: "Red Bull", product: "Energy Drink", price: 1 }),
        offer({ id: "rb1-gross", brand: "Red Bull", product: "Energy Drink", price: 1.5 }),
        offer({ id: "rb2", brand: "Red Bull", product: "Energy Drink Sugarfree", price: 1.2 }),
        offer({ id: "rs", brand: "Rockstar", price: 1.1 }),
      ],
      [],
      today,
    );
    expect(list.map((o) => o.id)).toEqual(["rb1", "rs", "rb2", "rb1-gross"]);
  });

  it("lässt Abgelaufenes weg und stellt Kommendes nach hinten", () => {
    const list = rankForYou(
      [
        offer({ id: "alt", brand: "Red Bull", validUntil: "2026-11-01" }),
        offer({ id: "bald", brand: "Monster Energy", validFrom: "2026-11-09" }),
        offer({ id: "jetzt", brand: "Rockstar" }),
      ],
      [],
      today,
    );
    expect(list.map((o) => o.id)).toEqual(["jetzt", "bald"]);
  });
});

describe("sectionsForStore", () => {
  it("filtert auf den Markt und zeigt ein Angebot nur einmal", () => {
    const offers = [
      offer({ id: "a", term: "High Protein", market: "Rewe", brand: "Barebells" }),
      offer({ id: "a", term: "Proteinriegel", market: "Rewe", brand: "Barebells" }),
      offer({ id: "b", term: "Proteinriegel", market: "Rewe", brand: "ESN" }),
      offer({ id: "c", term: "Proteinriegel", market: "Lidl", brand: "Milbona" }),
    ];
    const interests = [findCategory("protein")!, findCategory("proteinriegel")!];
    const sections = sectionsForStore(offers, "Rewe", interests, [], today);
    expect(sections.map((s) => s.offers.map((o) => o.id))).toEqual([["a"], ["b"]]);
  });
});
