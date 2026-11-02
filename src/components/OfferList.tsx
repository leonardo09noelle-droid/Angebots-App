import { useState } from "react";
import type { Offer } from "../types";
import { groupByBrand } from "../lib/offers";
import { OfferCard } from "./OfferCard";
import { OfferDetail } from "./OfferDetail";

interface Props {
  /** Angebote eines Favoriten, schon sortiert (siehe groupByTerm) */
  offers: Offer[];
  newIds?: Set<string>;
}

/** Angebote nach Marke gruppiert; "Günstigster" gibt es nur innerhalb einer Marke. Antippen öffnet die Details. */
export function OfferList({ offers, newIds }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = groupByBrand(offers);
  const showBrands = groups.length > 1;
  const openGroup = groups.find((g) => g.offers.some((o) => o.id === openId));
  const openOffer = openGroup?.offers.find((o) => o.id === openId);

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
                onOpen={(o) => setOpenId(o.id)}
              />
            ))}
          </ul>
        </div>
      ))}

      {openOffer && (
        <OfferDetail
          offer={openOffer}
          cheapest={openOffer.id === openGroup?.cheapestId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
