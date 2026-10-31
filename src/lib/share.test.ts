import { describe, expect, it } from "vitest";
import type { Offer } from "../types";
import { shareText as rawShareText } from "./share";

// Intl setzt ein geschütztes Leerzeichen vor "€"; für lesbare Tests normalisieren
const shareText = (offer: Offer, url: string) => rawShareText(offer, url).replace(/ /g, " ");

describe("shareText", () => {
  it("baut eine kurze Nachricht mit Preis, Grundpreis, Datum und App-Hinweis", () => {
    const offer: Offer = {
      id: "x",
      term: "Monster Energy",
      product: "Energy Drink",
      brand: "Monster Energy",
      price: 0.99,
      deposit: 0.25,
      referencePrice: 1.98,
      referenceUnit: "l",
      market: "Rewe",
      validUntil: "2026-10-31",
      loyalty: "bonus",
      source: "marktguru",
    };
    expect(shareText(offer, "https://example.app")).toBe(
      "🏷️ Monster Energy Energy Drink bei Rewe für 0,99 € (+ 0,25 € Pfand, 1,98 €/l), gültig bis Sa., 31.10. – + Bonus mit REWE-App\n" +
        "Gefunden mit Angebots-Radar: https://example.app",
    );
  });

  it("lässt fehlende Angaben weg", () => {
    const offer: Offer = { id: "y", term: "Whiskey", product: "Jameson", price: 13.99, market: "Penny", source: "manual" };
    expect(shareText(offer, "https://example.app")).toBe(
      "🏷️ Jameson bei Penny für 13,99 €\nGefunden mit Angebots-Radar: https://example.app",
    );
  });
});
