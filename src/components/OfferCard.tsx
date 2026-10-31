import { useState } from "react";
import type { Offer } from "../types";
import { discountPercent, formatDate, formatPrice, isUpcoming } from "../lib/offers";

interface Props {
  offer: Offer;
  cheapest: boolean;
  onRemove: (id: string) => void;
}

export function OfferCard({ offer, cheapest, onRemove }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const discount = discountPercent(offer);
  const upcoming = isUpcoming(offer);

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
          {upcoming && offer.validFrom && <span className="soon">ab {formatDate(offer.validFrom)}</span>}
        </div>
        <div className="offer-product">{offer.product}</div>
        {offer.details && <div className="offer-details">{offer.details}</div>}
        {offer.validUntil && <div className="offer-valid">gültig bis {formatDate(offer.validUntil)}</div>}
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
      </div>

      {offer.source === "manual" && (
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
