import { useState, type KeyboardEvent, type MouseEvent } from "react";
import type { Offer } from "../types";
import {
  discountPercent,
  displayName,
  formatDate,
  formatPrice,
  isLastDay,
  isUpcoming,
  loyaltyLabel,
  variety,
} from "../lib/offers";
import { favoriteOf, useFavorites } from "../lib/favorites";
import { useShare } from "../lib/useShare";
import { ShareIcon } from "./ShareIcon";

interface Props {
  offer: Offer;
  cheapest: boolean;
  isNew: boolean;
  onOpen: (offer: Offer) => void;
}

export function OfferCard({ offer, cheapest, isNew, onOpen }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const { share, feedback } = useShare(offer);
  const discount = discountPercent(offer);
  const upcoming = isUpcoming(offer);
  const lastDay = isLastDay(offer);
  const loyalty = loyaltyLabel(offer);
  const mixed = variety(offer) === "mixed";
  const title = displayName(offer);

  // ☆ merkt genau dieses Produkt (z. B. "Kinder Joy"), nicht die ganze Kategorie
  const favorites = useFavorites();
  const favorite = favoriteOf(offer);
  const saved = !!favorites?.isFavorite(favorite);

  function onShareClick(e: MouseEvent) {
    e.stopPropagation(); // nicht gleichzeitig die Details öffnen
    share();
  }

  function onStarClick(e: MouseEvent) {
    e.stopPropagation();
    favorites?.toggle(favorite);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(offer);
    }
  }

  return (
    <li
      className={`offer-card${cheapest ? " cheapest" : ""}${upcoming ? " upcoming" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(offer)}
      onKeyDown={onKeyDown}
    >
      {offer.imageUrl && !imageFailed ? (
        <img className="offer-img" src={offer.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
      ) : (
        <div className="offer-img placeholder" aria-hidden>
          {offer.market.slice(0, 1)}
        </div>
      )}

      <div className="offer-main">
        <div className="offer-product">{title}</div>
        {offer.amount && <div className="offer-amount">{offer.amount}</div>}
        <div className="offer-meta">
          <span className="offer-market">{offer.market}</span>
          {cheapest && <span className="best">Günstigster</span>}
          {offer.validUntil && !lastDay && <span className="offer-valid">bis {formatDate(offer.validUntil)}</span>}
        </div>
        {(isNew || lastDay || upcoming || mixed || loyalty) && (
          <div className="badges">
            {isNew && <span className="badge badge-new">Neu</span>}
            {lastDay && <span className="badge badge-last">Nur noch heute</span>}
            {upcoming && offer.validFrom && <span className="badge badge-soon">ab {formatDate(offer.validFrom)}</span>}
            {mixed && <span className="badge badge-info">Versch. Sorten</span>}
            {loyalty && <span className="badge badge-info">📱 {loyalty}</span>}
          </div>
        )}
      </div>

      <div className="offer-price">
        {discount !== undefined && <span className="discount">−{discount} %</span>}
        <span className="price">{formatPrice(offer.price)}</span>
        {offer.oldPrice !== undefined && discount !== undefined && (
          <span className="old-price">{formatPrice(offer.oldPrice)}</span>
        )}
        {offer.deposit !== undefined && <span className="unit-price">+ {formatPrice(offer.deposit)} Pfand</span>}
        {offer.referencePrice !== undefined && offer.referenceUnit && (
          <span className="unit-price">
            {formatPrice(offer.referencePrice)}/{offer.referenceUnit}
          </span>
        )}
        <span className="card-actions">
          {favorites && (
            <button
              className={`share-btn star-round${saved ? " on" : ""}`}
              onClick={onStarClick}
              aria-pressed={saved}
              aria-label={saved ? `${favorite.term} nicht mehr merken` : `${favorite.term} merken`}
            >
              {saved ? "★" : "☆"}
            </button>
          )}
          <span className="share-wrap">
            <button className="share-btn" onClick={onShareClick} aria-label="Angebot teilen">
              <ShareIcon />
            </button>
            {feedback && <span className="share-toast">{feedback}</span>}
          </span>
        </span>
      </div>

      <span className="chevron" aria-hidden>
        ›
      </span>
    </li>
  );
}
