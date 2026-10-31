import { useEffect, useState } from "react";
import type { Offer } from "../types";
import {
  discountPercent,
  formatDate,
  formatPrice,
  isLastDay,
  isUpcoming,
  loyaltyApp,
  variety,
} from "../lib/offers";
import { useShare } from "../lib/useShare";
import { ShareIcon } from "./ShareIcon";

interface Props {
  offer: Offer;
  cheapest: boolean;
  onClose: () => void;
  onRemove?: (id: string) => void;
}

/** marktguru-Bilder gibt es in mehreren Größen; erst groß, dann klein, dann keins */
function imageCandidates(url: string | undefined): string[] {
  if (!url) return [];
  const large = url.replace(/\/small\.jpg$/, "/large.jpg");
  return large === url ? [url] : [large, url];
}

function validityText(offer: Offer): string | undefined {
  if (isLastDay(offer)) return "Nur noch heute";
  if (offer.validFrom && offer.validUntil) return `${formatDate(offer.validFrom)} – ${formatDate(offer.validUntil)}`;
  if (offer.validUntil) return `bis ${formatDate(offer.validUntil)}`;
  if (offer.validFrom) return `ab ${formatDate(offer.validFrom)}`;
  return undefined;
}

/** Detailansicht als Blatt von unten (wie bei iOS) */
export function OfferDetail({ offer, cheapest, onClose, onRemove }: Props) {
  const images = imageCandidates(offer.imageUrl);
  const [imageIndex, setImageIndex] = useState(0);
  const { share, feedback } = useShare(offer);
  const discount = discountPercent(offer);
  const validity = validityText(offer);
  const app = loyaltyApp(offer);

  // Escape schließt, dahinter scrollt nichts mit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={offer.product}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sheet-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        {imageIndex < images.length && (
          <img
            className="detail-img"
            src={images[imageIndex]}
            alt={offer.product}
            onError={() => setImageIndex((i) => i + 1)}
          />
        )}

        <h2 className="detail-product">{offer.product}</h2>
        {offer.brand && <p className="detail-brand">{offer.brand}</p>}

        <div className="detail-price-row">
          <span className="detail-price">{formatPrice(offer.price)}</span>
          {discount !== undefined && offer.oldPrice !== undefined && (
            <>
              <span className="old-price">{formatPrice(offer.oldPrice)}</span>
              <span className="discount">−{discount} %</span>
            </>
          )}
        </div>
        {(offer.deposit !== undefined || offer.referencePrice !== undefined) && (
          <p className="detail-sub">
            {[
              offer.deposit !== undefined && `+ ${formatPrice(offer.deposit)} Pfand`,
              offer.referencePrice !== undefined &&
                offer.referenceUnit &&
                `${formatPrice(offer.referencePrice)}/${offer.referenceUnit}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <dl className="detail-facts">
          <div>
            <dt>Markt</dt>
            <dd>
              {offer.market}
              {cheapest && <span className="best">Günstigster</span>}
            </dd>
          </div>
          {validity && (
            <div>
              <dt>Gültig</dt>
              <dd className={isLastDay(offer) ? "text-danger" : isUpcoming(offer) ? "text-accent" : undefined}>
                {validity}
              </dd>
            </div>
          )}
          {offer.category && (
            <div>
              <dt>Kategorie</dt>
              <dd>{offer.category}</dd>
            </div>
          )}
        </dl>

        {variety(offer) === "mixed" && (
          <section className="detail-note">
            <h3>Sorten</h3>
            <p>
              Laut Prospekt mehrere Sorten, aber nicht unbedingt alle. Welche genau, siehst du auf dem Bild oder im
              Markt.
            </p>
          </section>
        )}

        {offer.loyalty && (
          <section className="detail-note">
            <h3>📱 {app}</h3>
            <p>
              {offer.loyalty === "required"
                ? `Dieser Preis gilt nur mit ${app}.`
                : `Normaler Preis für alle, über ${app} gibt's zusätzlich einen Bonus.`}
            </p>
          </section>
        )}

        {offer.details && (
          <section className="detail-note">
            <h3>Details aus dem Prospekt</h3>
            <p>{offer.details}</p>
          </section>
        )}

        <div className="detail-actions">
          <button className="primary big" onClick={share}>
            <ShareIcon size={18} /> {feedback || "Teilen"}
          </button>
          {offer.externalUrl && (
            <a className="secondary big" href={offer.externalUrl} target="_blank" rel="noopener noreferrer">
              Beim Markt ansehen ↗
            </a>
          )}
          {offer.source === "manual" && onRemove && (
            <button
              className="danger big"
              onClick={() => confirm(`„${offer.product}“ bei ${offer.market} löschen?`) && onRemove(offer.id)}
            >
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
