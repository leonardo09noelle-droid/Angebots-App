import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import {
  cheapestId,
  discountPercent,
  displayName,
  fullName,
  groupByBrand,
  groupByTerm,
  matchesBrand,
  mergeById,
  isActive,
  isLastDay,
  loyaltyLabel,
  markNew,
  todayISO,
  variety,
} from "./offers";

const offer = (o: Partial<Offer>): Offer => ({
  id: "x",
  term: "Monster Energy",
  product: "Monster Energy 0,5 l",
  price: 1,
  market: "Lidl",
  source: "manual",
  ...o,
});

/** Merklisten-Eintrag ohne Marken-Filter */
const all = (term: string) => ({ term, brandOnly: false });

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
    const groups = groupByTerm(offers, [all("Proteinriegel"), all("Monster Energy"), all("Pringles")], today);
    expect(groups.map((g) => g.term)).toEqual(["Proteinriegel", "Monster Energy", "Pringles"]);
    expect(groups[0].offers.map((o) => o.id)).toEqual(["d"]);
    expect(groups[1].offers.map((o) => o.id)).toEqual(["b", "a"]);
    expect(groups[2].offers).toEqual([]);
  });

  it("stellt kommende Angebote hinter die heute gültigen, auch wenn sie billiger sind", () => {
    const groups = groupByTerm(
      [offer({ id: "next", price: 0.79, validFrom: "2026-11-02" }), offer({ id: "now", price: 0.99 })],
      [all("Monster Energy")],
      today,
    );
    expect(groups[0].offers.map((o) => o.id)).toEqual(["now", "next"]);
  });

  it("zeigt bei 'Nur Marke' nur Angebote dieser Marke", () => {
    const monster = [
      offer({ id: "me", term: "Monster", brand: "Monster Energy", product: "Energy Drink" }),
      offer({ id: "mampf", term: "Monster", brand: "Covo", product: "Monster Mampf Mini" }),
    ];
    expect(groupByTerm(monster, [{ term: "Monster", brandOnly: true }], today)[0].offers.map((o) => o.id)).toEqual([
      "me",
    ]);
    expect(groupByTerm(monster, [all("Monster")], today)[0].offers).toHaveLength(2);
  });
});

describe("matchesBrand", () => {
  it("vergleicht Marken großzügig, aber genau genug", () => {
    expect(matchesBrand(offer({ brand: "Pringles" }), "pringles")).toBe(true);
    expect(matchesBrand(offer({ brand: "Monster Energy" }), "Monster")).toBe(true);
    expect(matchesBrand(offer({ brand: "Lay's" }), "Lays")).toBe(true);
    expect(matchesBrand(offer({ brand: "funny-frisch" }), "Pringles")).toBe(false);
    expect(matchesBrand(offer({}), "Pringles")).toBe(false);
  });
});

describe("mergeById", () => {
  it("führt Ergebnisse mehrerer Suchbegriffe zusammen", () => {
    const merged = mergeById([offer({ id: "a" }), offer({ id: "b" }), offer({ id: "a", term: "Limonade" })]);
    expect(merged.map((o) => o.id)).toEqual(["a", "b"]);
  });
});

describe("cheapestId", () => {
  const today = "2026-10-31";

  it("kürt den billigsten Markt derselben Marke", () => {
    const offers = [offer({ id: "lidl", price: 15.99 }), offer({ id: "rewe", price: 17.49, market: "Rewe" })];
    expect(cheapestId(offers, today)).toBe("lidl");
  });

  it("kein Abzeichen, wenn es die Marke nur in einem Markt gibt", () => {
    expect(cheapestId([offer({ id: "a", price: 1 }), offer({ id: "b", price: 2 })], today)).toBeUndefined();
  });

  it("kein Abzeichen bei Gleichstand", () => {
    const offers = [offer({ id: "a", price: 0.99 }), offer({ id: "b", price: 0.99, market: "Rewe" })];
    expect(cheapestId(offers, today)).toBeUndefined();
  });

  it("vergleicht über den Grundpreis, wenn alle einen haben", () => {
    const offers = [
      offer({ id: "dose", price: 0.99, referencePrice: 1.98, referenceUnit: "l" }),
      offer({ id: "pack", price: 9.99, referencePrice: 1.67, referenceUnit: "l", market: "Edeka" }),
    ];
    expect(cheapestId(offers, today)).toBe("pack");
  });

  it("ignoriert Angebote, die erst später gelten", () => {
    const offers = [
      offer({ id: "next", price: 0.79, validFrom: "2026-11-02", market: "Penny" }),
      offer({ id: "now", price: 0.99 }),
    ];
    expect(cheapestId(offers, today)).toBeUndefined();
  });
});

describe("groupByBrand", () => {
  it("trennt Marken und vergibt das Abzeichen nur innerhalb einer Marke", () => {
    const offers = [
      offer({ id: "jameson", brand: "Jameson", product: "Jameson Irish Whiskey", price: 13.99, market: "Penny" }),
      offer({ id: "jd-lidl", brand: "Jack Daniel's", product: "Jack Daniel's No. 7", price: 15.99 }),
      offer({ id: "jd-rewe", brand: "JACK DANIEL'S ", product: "Jack Daniel's No. 7", price: 17.49, market: "Rewe" }),
    ];
    const groups = groupByBrand(offers, "2026-10-31");
    expect(groups.map((g) => g.brand)).toEqual(["Jameson", "Jack Daniel's"]);
    expect(groups.map((g) => g.cheapestId)).toEqual([undefined, "jd-lidl"]);
  });

  it("gruppiert ohne Marke nach Produktname", () => {
    const groups = groupByBrand([offer({ id: "a", product: "Proteinriegel" }), offer({ id: "b", product: "proteinriegel" })]);
    expect(groups).toHaveLength(1);
  });
});

describe("isLastDay", () => {
  it("nur am letzten Gültigkeitstag", () => {
    expect(isLastDay(offer({ validUntil: "2026-10-31" }), "2026-10-31")).toBe(true);
    expect(isLastDay(offer({ validUntil: "2026-11-01" }), "2026-10-31")).toBe(false);
    expect(isLastDay(offer({}), "2026-10-31")).toBe(false);
  });
});

describe("markNew", () => {
  it("beim ersten Start ist nichts neu", () => {
    expect(markNew(["a", "b"], null).size).toBe(0);
  });
  it("neu ist, was vorher nicht gesehen wurde", () => {
    expect([...markNew(["a", "b", "c"], ["a"])]).toEqual(["b", "c"]);
  });
});

describe("fullName", () => {
  it("setzt die Marke davor, aber nicht doppelt", () => {
    expect(fullName({ brand: "Monster Energy", product: "Energy Drink" })).toBe("Monster Energy Energy Drink");
    expect(fullName({ brand: "Jameson", product: "Jameson Irish Whiskey" })).toBe("Jameson Irish Whiskey");
    expect(fullName({ product: "Proteinriegel" })).toBe("Proteinriegel");
  });
});

describe("displayName", () => {
  const name = (brand: string | undefined, product: string) => displayName({ brand, product });

  it("zeigt bei Gattungsnamen die Marke statt 'Energy Drink'", () => {
    expect(name("Red Bull", "Energy Drink")).toBe("Red Bull");
    expect(name("Monster Energy", "Energy Drink")).toBe("Monster Energy");
    expect(name("Kong Strong", "Energy Drink XXL")).toBe("Kong Strong XXL");
    expect(name("Coca-Cola", "Cola Zero")).toBe("Coca-Cola Zero");
  });

  it("behält die Sorte und lässt Mengen weg", () => {
    expect(name("Monster Energy", "Energy Drink Ultra White 0,5-l-Dose")).toBe("Monster Energy Ultra White");
    expect(name("Pringles", "Original 185 g")).toBe("Pringles Original");
    expect(name("Red Bull", "Energy Drink 4 x 250 ml")).toBe("Red Bull");
  });

  it("wiederholt die Marke nicht und kommt ohne Marke aus", () => {
    expect(name("Jameson", "Jameson Irish Whiskey")).toBe("Jameson Irish Whiskey");
    expect(name("Ferrero", "Mon Chéri Pralines")).toBe("Ferrero Mon Chéri Pralines");
    expect(name(undefined, "Proteinriegel")).toBe("Proteinriegel");
  });
});

describe("variety", () => {
  it("erkennt verschiedene Sorten", () => {
    expect(variety(offer({ details: "versch. Sorten, koffeinhaltig" }))).toBe("mixed");
    expect(variety(offer({ details: "Verschiedene Sorten" }))).toBe("mixed");
    expect(variety(offer({ details: "Ultra White" }))).toBeUndefined();
    expect(variety(offer({}))).toBeUndefined();
  });
});

describe("loyaltyLabel", () => {
  it("nennt die App des Markts", () => {
    expect(loyaltyLabel(offer({ loyalty: "required", market: "Lidl" }))).toBe("Nur mit Lidl Plus");
    expect(loyaltyLabel(offer({ loyalty: "bonus", market: "Rewe" }))).toBe("+ Bonus mit REWE-App");
    expect(loyaltyLabel(offer({}))).toBeUndefined();
  });
});
