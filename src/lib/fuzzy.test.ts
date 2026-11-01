import { describe, expect, it } from "vitest";
import { BUILTIN_BRANDS, isKnownBrand } from "./brands";
import { complete, correct, distance, normalize } from "./fuzzy";

describe("normalize", () => {
  it("vereinheitlicht Schreibweisen", () => {
    expect(normalize("Lay's")).toBe("lays");
    expect(normalize("Müller")).toBe("mueller");
    expect(normalize("Coca-Cola")).toBe("cocacola");
    expect(normalize("Nescafé")).toBe("nescafe");
  });
});

describe("distance", () => {
  it("zählt Buchstabendreher als einen Fehler", () => {
    expect(distance("pringels", "pringles")).toBe(1);
    expect(distance("prngles", "pringles")).toBe(1);
    expect(distance("pringles", "pringles")).toBe(0);
  });
});

describe("correct", () => {
  it("korrigiert kleine Tippfehler zu bekannten Marken", () => {
    expect(correct("Prngles", BUILTIN_BRANDS)).toBe("Pringles");
    expect(correct("pringels", BUILTIN_BRANDS)).toBe("Pringles");
    expect(correct("monster enrgy", BUILTIN_BRANDS)).toBe("Monster Energy");
    expect(correct("Hraibo", BUILTIN_BRANDS)).toBe("Haribo");
  });

  it("lässt richtige Namen und allgemeine Wörter in Ruhe", () => {
    expect(correct("Pringles", BUILTIN_BRANDS)).toBeUndefined();
    expect(correct("pringles", BUILTIN_BRANDS)).toBeUndefined();
    expect(correct("Chips", BUILTIN_BRANDS)).toBeUndefined();
    expect(correct("Schokolade", BUILTIN_BRANDS)).toBeUndefined();
    expect(correct("Zahnpasta", BUILTIN_BRANDS)).toBeUndefined();
  });
});

describe("complete", () => {
  it("vervollständigt beim Tippen", () => {
    expect(complete("Prin", BUILTIN_BRANDS)).toEqual(["Pringles", "Prinzen Rolle"]);
    expect(complete("bull", BUILTIN_BRANDS)).toContain("Red Bull");
    expect(complete("p", BUILTIN_BRANDS)).toEqual([]);
  });
});

describe("isKnownBrand", () => {
  it("erkennt Marken und ihren Anfang, aber keine Gattungen", () => {
    expect(isKnownBrand("Pringles")).toBe(true);
    expect(isKnownBrand("monster")).toBe(true);
    expect(isKnownBrand("Proteinriegel")).toBe(false);
    expect(isKnownBrand("Chips")).toBe(false);
  });
});
