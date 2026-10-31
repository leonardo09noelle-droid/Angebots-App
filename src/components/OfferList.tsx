import type { Offer } from "../types";
import { groupByBrand } from "../lib/offers";
import { OfferCard } from "./OfferCard";

interface Props {
  /** Angebote eines Merklisten-Eintrags, schon sortiert (siehe groupByTerm) */
  offers: Offer[];
  newIds?: Set<string>;
  onRemove?: (id: string) => void;
}

/** Angebote nach Marke gruppiert; "Günstigster" gibt es nur innerhalb einer Marke */
export function OfferList({ offers, newIds, onRemove }: Props) {
  const groups = groupByBrand(offers);
  const showBrands = groups.length > 1;

  return (
    <div className="brand-groups">
      {groups.map((group) => (
        <div key={group.key} className="brand-group">
          {showBrands && <h3 className="brand-heading">{group.brand}</h3>}
          <ul className="offer-list">
            {group.offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                cheapest={offer.id === group.cheapestId}
                isNew={!!newIds?.has(offer.id)}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
