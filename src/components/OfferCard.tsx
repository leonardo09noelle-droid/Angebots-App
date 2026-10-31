import { useState } from "react";
import type { Offer } from "../types";
import { discountPercent, formatDate, formatPrice, isLastDay, isUpcoming, loyaltyLabel } from "../lib/offers";
import { shareOffer } from "../lib/share";

interface Props {
  offer: Offer;
  cheapest: boolean;
  isNew: boolean;
  onRemove?: (id: string) => void;
}

export function OfferCard({ offer, cheapest, isNew, onRemove }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");
  const discount = discountPercent(offer);
  const upcoming = isUpcoming(offer);
  const lastDay = isLastDay(offer);
  const loyalty = loyaltyLabel(offer);

  async function share() {
    const result = await shareOffer(offer);
    if (result === "copied" || result === "failed") {
      setShareState(result);
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <li className={`offer-card${cheapest ? " cheapest" : ""}${upcoming ? " upcoming" : ""}`}>
      {offer.imageUrl && !imageFailed ? (
        <img className="offer-img" src={offer.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
      ) : (
        <div className="offer-img placeholder" aria-hidden>
          {offer.market.slice(0, 1)}
        </div>
      )}

      <div className="offer-main">
        <div className="offer-market">
          {offer.market}
          {cheapest && <span className="best">Günstigster</span>}
        </div>
        <div className="offer-product">{offer.product}</div>
        {offer.details && <div className="offer-details">{offer.details}</div>}
        {(isNew || lastDay || upcoming || loyalty) && (
          <div className="badges">
            {isNew && <span className="badge badge-new">Neu</span>}
            {lastDay && <span className="badge badge-last">Nur noch heute</span>}
            {upcoming && offer.validFrom && <span className="badge badge-soon">ab {formatDate(offer.validFrom)}</span>}
            {loyalty && <span className="badge badge-app">📱 {loyalty}</span>}
          </div>
        )}
        {offer.validUntil && !lastDay && <div className="offer-valid">gültig bis {formatDate(offer.validUntil)}</div>}
      </div>

      <div className="offer-price">
        {discount !== undefined && <span className="discount">−{discount} %</span>}
        <span className="price">{formatPrice(offer.price)}</span>
        {offer.oldPrice !== undefined && discount !== undefined && (
          <span className="old-price">{formatPrice(offer.oldPrice)}</span>
        )}
        {offer.referencePrice !== undefined && offer.referenceUnit && (
          <span className="unit-price">
            {formatPrice(offer.referencePrice)}/{offer.referenceUnit}
          </span>
        )}
        <button className="share" onClick={share} aria-label="Angebot teilen">
          {shareState === "copied" ? "Kopiert ✓" : shareState === "failed" ? "Ging nicht" : "Teilen ↗"}
        </button>
      </div>

      {offer.source === "manual" && onRemove && (
        <button
          className="remove"
          onClick={() => confirm(`„${offer.product}“ bei ${offer.market} löschen?`) && onRemove(offer.id)}
          aria-label="Angebot löschen"
        >
          ×
        </button>
      )}
    </li>
  );
}
