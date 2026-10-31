import type { Offer } from "../types";
import { formatDate, formatPrice, fullName, loyaltyLabel } from "./offers";

/** "🏷️ Monster Energy Energy Drink bei Rewe für 0,99 € (+ 0,25 € Pfand, 1,98 €/l), gültig bis Sa., 31.10." + Link */
export function shareText(offer: Offer, appUrl: string): string {
  let line = `🏷️ ${fullName(offer)} bei ${offer.market} für ${formatPrice(offer.price)}`;
  const extras: string[] = [];
  if (offer.deposit !== undefined) extras.push(`+ ${formatPrice(offer.deposit)} Pfand`);
  if (offer.referencePrice !== undefined && offer.referenceUnit) {
    extras.push(`${formatPrice(offer.referencePrice)}/${offer.referenceUnit}`);
  }
  if (extras.length) line += ` (${extras.join(", ")})`;
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
