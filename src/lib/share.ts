import type { Offer } from "../types";
import { formatDate, formatPrice, loyaltyLabel } from "./offers";

/** "🏷️ Monster Energy Energy Drink bei Rewe für 0,99 € (1,98 €/l), gültig bis Sa., 31.10." + Link */
export function shareText(offer: Offer, appUrl: string): string {
  let line = `🏷️ ${offer.product} bei ${offer.market} für ${formatPrice(offer.price)}`;
  if (offer.referencePrice !== undefined && offer.referenceUnit) {
    line += ` (${formatPrice(offer.referencePrice)}/${offer.referenceUnit})`;
  }
  if (offer.validUntil) line += `, gültig bis ${formatDate(offer.validUntil)}`;
  const loyalty = loyaltyLabel(offer);
  if (loyalty) line += ` – ${loyalty}`;
  return `${line}\nGefunden mit Angebots-Radar: ${appUrl}`;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/** Öffnet das Teilen-Menü des Handys (WhatsApp, iMessage, …), sonst Text kopieren */
export async function shareOffer(offer: Offer): Promise<ShareResult> {
  const text = shareText(offer, location.origin);
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
