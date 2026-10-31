import { useEffect, useMemo, useState } from "react";
import type { Offer } from "./types";
import { groupByTerm, isUpcoming } from "./lib/offers";
import { fetchOffers } from "./lib/api";
import {
  loadOffers,
  loadRemote,
  loadWatchlist,
  loadZip,
  saveOffers,
  saveRemote,
  saveWatchlist,
  saveZip,
  type RemoteCache,
} from "./lib/storage";
import { OfferCard } from "./components/OfferCard";
import { AddOffer } from "./components/AddOffer";
import { Settings } from "./components/Settings";

type Tab = "offers" | "add" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "offers", label: "Angebote", icon: "🏷️" },
  { id: "add", label: "Eintragen", icon: "➕" },
  { id: "settings", label: "Einstellungen", icon: "⚙️" },
];

const timeFormat = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function App() {
  const [tab, setTab] = useState<Tab>("offers");
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [zip, setZip] = useState(loadZip);
  const [offers, setOffers] = useState(loadOffers);
  const [remote, setRemote] = useState<RemoteCache | null>(loadRemote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => saveWatchlist(watchlist), [watchlist]);
  useEffect(() => saveZip(zip), [zip]);
  useEffect(() => saveOffers(offers), [offers]);

  const validZip = /^\d{5}$/.test(zip);
  const termsKey = watchlist.join(",");

  // Automatische Suche: beim Start, bei neuer PLZ/Merkliste und per Aktualisieren-Knopf
  useEffect(() => {
    if (!validZip || !termsKey) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchOffers(zip, termsKey.split(","), controller.signal)
      .then((result) => {
        const cache = { zip, fetchedAt: Date.now(), offers: result.offers };
        setRemote(cache);
        saveRemote(cache);
        if (result.failedTerms.length) setError(`Für ${result.failedTerms.join(", ")} hat die Suche nicht geklappt.`);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message || "Die Angebotssuche ist gerade nicht erreichbar.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [zip, validZip, termsKey, reloadToken]);

  const allOffers = useMemo(
    () => (remote && remote.zip === zip ? [...offers, ...remote.offers] : offers),
    [offers, remote, zip],
  );
  const groups = useMemo(() => groupByTerm(allOffers, watchlist), [allOffers, watchlist]);

  function addOffer(offer: Offer) {
    setOffers((prev) => [...prev, offer]);
    setTab("offers");
  }

  function removeOffer(id: string) {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{TABS.find((t) => t.id === tab)!.label}</h1>
        {tab === "offers" && validZip && (
          <div className="header-actions">
            <span className="zip-chip">📍 {zip}</span>
            <button
              className={`refresh${loading ? " spinning" : ""}`}
              onClick={() => setReloadToken((n) => n + 1)}
              disabled={loading}
              aria-label="Angebote aktualisieren"
            >
              ↻
            </button>
          </div>
        )}
      </header>

      <main className="content">
        {tab === "offers" && (
          <>
            {!validZip ? (
              <p className="notice">
                Trag unter <b>Einstellungen</b> deine Postleitzahl ein, dann suche ich die Angebote automatisch.
              </p>
            ) : (
              <p className={`status${error ? " status-error" : ""}`}>
                {error ||
                  (loading
                    ? "Suche Angebote …"
                    : remote?.zip === zip && `Stand: ${timeFormat.format(remote.fetchedAt)} · Quelle: marktguru`)}
              </p>
            )}

            {watchlist.length === 0 ? (
              <p className="empty">
                Deine Merkliste ist leer. Füg unter <b>Einstellungen</b> Produkte hinzu.
              </p>
            ) : (
              groups.map((group) => (
                <section key={group.term} className="group">
                  <h2>
                    {group.term}
                    <span className="count">{group.offers.length}</span>
                  </h2>
                  {group.offers.length === 0 ? (
                    <p className="none">{loading ? "…" : "Gerade kein Angebot bekannt."}</p>
                  ) : (
                    <ul className="offer-list">
                      {group.offers.map((offer, i) => (
                        <OfferCard
                          key={offer.id}
                          offer={offer}
                          cheapest={i === 0 && group.offers.length > 1 && !isUpcoming(offer)}
                          onRemove={removeOffer}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              ))
            )}
          </>
        )}

        {tab === "add" && <AddOffer watchlist={watchlist} onAdd={addOffer} />}

        {tab === "settings" && (
          <Settings watchlist={watchlist} onWatchlistChange={setWatchlist} zip={zip} onZipChange={setZip} />
        )}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? "active" : ""}
            onClick={() => setTab(t.id)}
            aria-current={t.id === tab ? "page" : undefined}
          >
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
