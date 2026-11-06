import { useEffect, useRef, useState } from "react";
import type { Market } from "../types";
import { ALL_CATEGORIES } from "../lib/categories";
import { SECTION_SIZE, type StoreSection } from "../lib/interests";
import { OfferList } from "./OfferList";

interface Props {
  market: Market;
  /** Sichtbare Kategorien in diesem Markt: erst deine Interessen, dann Alltagsprodukte */
  sections: StoreSection[];
  /** Deine Interessen stehen oben und werden im Kopf gezeigt */
  personalIds: string[];
  /** Alles, was nicht ausgeblendet ist */
  enabledIds: string[];
  onToggleInterest: (id: string, isOn: boolean) => void;
  /** Es gibt noch Kategorien, die erst beim Scrollen geladen werden */
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  /** Kategorien, bei denen der Abruf nicht geklappt hat */
  failed: string[];
  fetchedLabel: string;
}

/** So früh vor dem Listenende laden, damit man beim Scrollen nicht ans Ende stößt */
const LOAD_AHEAD_PX = 400;

/** Was es in einem Markt gerade gibt: pro Kategorie 6 unterschiedliche Produkte, weitere Kategorien beim Scrollen */
export function StoreTab({
  market,
  sections,
  personalIds,
  enabledIds,
  onToggleInterest,
  hasMore,
  onLoadMore,
  loading,
  failed,
  fetchedLabel,
}: Props) {
  const nothingEnabled = enabledIds.length === 0;
  const [picking, setPicking] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const status = loading ? "Suche Angebote …" : fetchedLabel;
  const withOffers = sections.filter((s) => s.offers.length > 0);
  const personalEmpty = sections.filter((s) => s.offers.length === 0 && personalIds.includes(s.category.id));
  const firstEveryday = withOffers.find((s) => !personalIds.includes(s.category.id));

  // Kurz vor dem Ende der Liste die nächsten Kategorien laden. Die Prüfung beginnt nach jedem Laden
  // neu: Ist danach immer noch Platz frei (Markt hat wenig), geht es gleich weiter. Kurz warten,
  // damit ein gerade gestarteter Abruf zuerst "lädt" meldet und nicht alles auf einmal losgeht.
  const sentinel = useRef<HTMLDivElement>(null);
  const visibleCount = sections.length;
  useEffect(() => {
    const el = sentinel.current;
    const root = el?.closest(".content");
    if (!el || !root || !hasMore || loading) return;
    const check = () => {
      if (el.getBoundingClientRect().top - root.getBoundingClientRect().bottom > LOAD_AHEAD_PX) return;
      root.removeEventListener("scroll", check);
      onLoadMore();
    };
    const timer = setTimeout(check, 100);
    root.addEventListener("scroll", check, { passive: true });
    return () => {
      clearTimeout(timer);
      root.removeEventListener("scroll", check);
    };
    // onLoadMore ändert sich bei jedem Rendern, entscheidend ist, wie viel schon da ist
  }, [hasMore, loading, visibleCount]);

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

      {picking || nothingEnabled ? (
        <section className="card interest-picker">
          <h2>Was willst du sehen?</h2>
          <p className="hint">Tipp weg, was dich nicht interessiert. Das gilt für alle Märkte.</p>
          <div className="chips">
            {ALL_CATEGORIES.map((c) => {
              const on = enabledIds.includes(c.id);
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
          {!nothingEnabled && (
            <button className="primary big interest-done" onClick={() => setPicking(false)}>
              Fertig
            </button>
          )}
        </section>
      ) : (
        <div className="fav-bar interest-bar">
          <span className="interest-summary">
            {personalIds.length > 0
              ? `Für dich ${ALL_CATEGORIES.filter((c) => personalIds.includes(c.id))
                  .map((c) => c.emoji)
                  .join(" ")}`
              : "Aus dem Alltag"}
          </span>
          <button className="link-btn plain" onClick={() => setPicking(true)}>
            Ändern
          </button>
        </div>
      )}

      {withOffers.map((section) => {
        const { category, offers } = section;
        const open = expanded.has(category.id);
        return (
          <section key={category.id} className="group">
            {section === firstEveryday && personalIds.length > 0 && <p className="fav-bar">Mehr aus dem Alltag</p>}
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

      {!loading && personalEmpty.length > 0 && (
        <p className="hint store-empty">
          Gerade nichts bei {market}: {personalEmpty.map((s) => `${s.category.emoji} ${s.category.label}`).join(", ")}
        </p>
      )}

      <div ref={sentinel} aria-hidden />
      {loading && withOffers.length > 0 && <p className="status load-more">Lade weitere Angebote …</p>}
      {!loading && !hasMore && !nothingEnabled && withOffers.length === 0 && (
        <p className="empty">Gerade nichts Passendes bei {market}. Schau später noch einmal vorbei.</p>
      )}
    </>
  );
}
