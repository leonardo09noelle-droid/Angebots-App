import { useEffect, useState } from "react";
import type { Offer } from "../types";
import {
  discountPercent,
  displayName,
  formatDate,
  formatPrice,
  isLastDay,
  isRegionalMarket,
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
export function OfferDetail({ offer, cheapest, onClose }: Props) {
  const images = imageCandidates(offer.imageUrl);
  const [imageIndex, setImageIndex] = useState(0);
  const { share, feedback } = useShare(offer);
  const discount = discountPercent(offer);
  const validity = validityText(offer);
  const app = loyaltyApp(offer);
  // Groß der Anzeigename, darunter der jeweils andere Teil (z. B. "Monster Energy" / "Energy Drink")
  const title = displayName(offer).title;
  const subtitle = title === offer.product ? offer.brand : offer.product;

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
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sheet-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        {imageIndex < images.length && (
          <img
            className="detail-img"
            src={images[imageIndex]}
            alt={title}
            onError={() => setImageIndex((i) => i + 1)}
          />
        )}

        <h2 className="detail-product">{title}</h2>
        {subtitle && subtitle !== title && !title.includes(subtitle) && <p className="detail-brand">{subtitle}</p>}

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
          <div>
            <dt>Normalpreis</dt>
            {offer.oldPrice !== undefined && discount !== undefined ? (
              <dd>
                {formatPrice(offer.oldPrice)} · du sparst {formatPrice(offer.oldPrice - offer.price)} (−{discount} %)
              </dd>
            ) : (
              <dd className="text-muted">nicht im Prospekt angegeben</dd>
            )}
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

        {offer.source === "marktguru" && (
          <section className="detail-note">
            <h3>Gilt in welcher Filiale?</h3>
            <p>
              {isRegionalMarket(offer)
                ? `Das Angebot stammt aus dem ${offer.market}-Prospekt für deine Postleitzahl. Viele ${offer.market}-Märkte gehören aber selbstständigen Kaufleuten und dürfen abweichen. Sicher ist es nur im Prospekt bzw. in der App deines Markts.`
                : `Das Angebot stammt aus dem ${offer.market}-Prospekt für deine Postleitzahl und gilt normalerweise in allen Filialen der Gegend, solange der Vorrat reicht.`}
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
        </div>
      </div>
    </div>
  );
}
