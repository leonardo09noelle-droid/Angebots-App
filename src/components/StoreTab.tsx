import { useState } from "react";
import type { Market } from "../types";
import { ALL_CATEGORIES } from "../lib/categories";
import { SECTION_SIZE, type StoreSection } from "../lib/interests";
import { OfferList } from "./OfferList";

interface Props {
  market: Market;
  /** Deine Interessen in diesem Markt, Reihenfolge wie die Kacheln */
  sections: StoreSection[];
  interestIds: string[];
  onToggleInterest: (id: string, isOn: boolean) => void;
  loading: boolean;
  /** Kategorien, bei denen der Abruf nicht geklappt hat */
  failed: string[];
  fetchedLabel: string;
}

/** Was es in einem Markt gerade gibt, das dich interessieren könnte: pro Kategorie 6 unterschiedliche Produkte */
export function StoreTab({ market, sections, interestIds, onToggleInterest, loading, failed, fetchedLabel }: Props) {
  const noInterests = interestIds.length === 0;
  // Ohne Interessen bleibt die Auswahl offen, bis man "Fertig" tippt: Man wählt ja meist mehrere
  const [picking, setPicking] = useState(noInterests);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const status = loading ? "Suche Angebote …" : noInterests ? "" : fetchedLabel;
  const withOffers = sections.filter((s) => s.offers.length > 0);
  const empty = sections.filter((s) => s.offers.length === 0);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <>
      {failed.length > 0 ? (
        <p className="status status-error">Für {failed.join(", ")} hat die Suche nicht geklappt.</p>
      ) : (
        status && <p className="status">{status}</p>
      )}

      {picking || noInterests ? (
        <section className="card interest-picker">
          <h2>Was interessiert dich?</h2>
          <p className="hint">Tipp an, was du sehen willst. Das gilt für alle Märkte.</p>
          <div className="chips">
            {ALL_CATEGORIES.map((c) => {
              const on = interestIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  className={`chip${on ? " active" : ""}`}
                  onClick={() => onToggleInterest(c.id, on)}
                  aria-pressed={on}
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>
          {!noInterests && (
            <button className="primary big interest-done" onClick={() => setPicking(false)}>
              Fertig
            </button>
          )}
        </section>
      ) : (
        <div className="fav-bar interest-bar">
          <span className="interest-summary" aria-label={`Deine Interessen: ${sections.map((s) => s.category.label).join(", ")}`}>
            Interessen {sections.map((s) => s.category.emoji).join(" ")}
          </span>
          <button className="link-btn plain" onClick={() => setPicking(true)}>
            Ändern
          </button>
        </div>
      )}

      {withOffers.map(({ category, offers }) => {
        const open = expanded.has(category.id);
        return (
          <section key={category.id} className="group">
            <h2>
              {category.emoji} {category.label}
              <span className="count">{offers.length}</span>
            </h2>
            <OfferList flat offers={open ? offers : offers.slice(0, SECTION_SIZE)} />
            {offers.length > SECTION_SIZE && (
              <button className="secondary big show-all" onClick={() => toggleExpanded(category.id)}>
                {open ? "Weniger zeigen" : `Alle ${offers.length} zeigen`}
              </button>
            )}
          </section>
        );
      })}

      {!loading && !noInterests && withOffers.length === 0 && (
        <p className="empty">Gerade nichts Passendes bei {market}. Tipp auf „Ändern“ und probier andere Interessen.</p>
      )}

      {!loading && withOffers.length > 0 && empty.length > 0 && (
        <p className="hint store-empty">
          Gerade nichts bei {market}: {empty.map((s) => `${s.category.emoji} ${s.category.label}`).join(", ")}
        </p>
      )}
    </>
  );
}
