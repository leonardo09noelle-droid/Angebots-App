import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { discountPercent, groupByTerm, isActive, todayISO } from "./offers";

const offer = (o: Partial<Offer>): Offer => ({
  id: "x",
  term: "Monster Energy",
  product: "Monster Energy 0,5 l",
  price: 1,
  market: "Lidl",
  source: "manual",
  ...o,
});

describe("todayISO", () => {
  it("formatiert in lokaler Zeit mit führenden Nullen", () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("isActive", () => {
  it("ist am letzten Gültigkeitstag noch aktiv", () => {
    expect(isActive(offer({ validUntil: "2026-10-31" }), "2026-10-31")).toBe(true);
  });
  it("ist danach abgelaufen", () => {
    expect(isActive(offer({ validUntil: "2026-10-30" }), "2026-10-31")).toBe(false);
  });
  it("ohne Datum immer aktiv", () => {
    expect(isActive(offer({}), "2026-10-31")).toBe(true);
  });
});

describe("discountPercent", () => {
  it("rundet den Rabatt", () => {
    expect(discountPercent(offer({ price: 0.99, oldPrice: 1.49 }))).toBe(34);
  });
  it("kein Rabatt ohne höheren alten Preis", () => {
    expect(discountPercent(offer({ price: 1.49 }))).toBeUndefined();
    expect(discountPercent(offer({ price: 1.49, oldPrice: 1.29 }))).toBeUndefined();
  });
});

describe("groupByTerm", () => {
  const today = "2026-10-31";
  const offers = [
    offer({ id: "a", price: 1.29, market: "Rewe" }),
    offer({ id: "b", price: 0.99, market: "Lidl" }),
    offer({ id: "c", price: 0.79, validUntil: "2026-10-01" }),
    offer({ id: "d", term: "proteinriegel", product: "Riegel", price: 1.11 }),
  ];

  it("sortiert nach Preis, blendet Abgelaufenes aus, behält die Merklisten-Reihenfolge", () => {
    const groups = groupByTerm(offers, ["Proteinriegel", "Monster Energy", "Pringles"], today);
    expect(groups.map((g) => g.term)).toEqual(["Proteinriegel", "Monster Energy", "Pringles"]);
    expect(groups[0].offers.map((o) => o.id)).toEqual(["d"]);
    expect(groups[1].offers.map((o) => o.id)).toEqual(["b", "a"]);
    expect(groups[2].offers).toEqual([]);
  });

  it("stellt kommende Angebote hinter die heute gültigen, auch wenn sie billiger sind", () => {
    const groups = groupByTerm(
      [offer({ id: "next", price: 0.79, validFrom: "2026-11-02" }), offer({ id: "now", price: 0.99 })],
      ["Monster Energy"],
      today,
    );
    expect(groups[0].offers.map((o) => o.id)).toEqual(["now", "next"]);
  });
});
