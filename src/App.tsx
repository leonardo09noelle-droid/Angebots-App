import { useEffect, useMemo, useState } from "react";
import type { Offer } from "./types";
import { groupByTerm, markNew } from "./lib/offers";
import { fetchOffers } from "./lib/api";
import {
  loadMarkets,
  loadOffers,
  loadRemote,
  loadSeen,
  loadWatchlist,
  loadZip,
  saveMarkets,
  saveOffers,
  saveRemote,
  saveSeen,
  saveWatchlist,
  saveZip,
  type RemoteCache,
} from "./lib/storage";
import { OfferList } from "./components/OfferList";
import { AddOffer } from "./components/AddOffer";
import { Search } from "./components/Search";
import { Settings } from "./components/Settings";

type Tab = "offers" | "search" | "add" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "offers", label: "Angebote", icon: "🏷️" },
  { id: "search", label: "Suchen", icon: "🔍" },
  { id: "add", label: "Eintragen", icon: "➕" },
  { id: "settings", label: "Einstellungen", icon: "⚙️" },
];

const timeFormat = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function App() {
  const [tab, setTab] = useState<Tab>("offers");
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [zip, setZip] = useState(loadZip);
  const [markets, setMarkets] = useState(loadMarkets);
  const [offers, setOffers] = useState(loadOffers);
  const [remote, setRemote] = useState<RemoteCache | null>(loadRemote);
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => saveWatchlist(watchlist), [watchlist]);
  useEffect(() => saveZip(zip), [zip]);
  useEffect(() => saveMarkets(markets), [markets]);
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

        // "Neu" bleibt für diese Sitzung stehen, auch nach erneutem Aktualisieren
        const ids = result.offers.map((o) => o.id);
        const seen = loadSeen();
        const fresh = markNew(ids, seen);
        setNewIds((prev) => new Set([...prev, ...fresh]));
        saveSeen([...new Set([...ids, ...(seen ?? [])])]);

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
  const visibleOffers = useMemo(() => allOffers.filter((o) => markets.includes(o.market)), [allOffers, markets]);
  const groups = useMemo(() => groupByTerm(visibleOffers, watchlist), [visibleOffers, watchlist]);

  function addOffer(offer: Offer) {
    setOffers((prev) => [...prev, offer]);
    setTab("offers");
  }

  function removeOffer(id: string) {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  function addTerm(term: string) {
    setWatchlist((prev) => (prev.some((w) => w.toLowerCase() === term.toLowerCase()) ? prev : [...prev, term]));
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

            {markets.length === 0 && (
              <p className="notice">
                Du hast unter <b>Einstellungen</b> alle Märkte abgewählt, deshalb siehst du keine Angebote.
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
                    <OfferList offers={group.offers} newIds={newIds} onRemove={removeOffer} />
                  )}
                </section>
              ))
            )}
          </>
        )}

        {tab === "search" && <Search zip={zip} markets={markets} watchlist={watchlist} onAddTerm={addTerm} />}

        {tab === "add" && <AddOffer watchlist={watchlist} onAdd={addOffer} />}

        {tab === "settings" && (
          <Settings
            watchlist={watchlist}
            onWatchlistChange={setWatchlist}
            zip={zip}
            onZipChange={setZip}
            markets={markets}
            onMarketsChange={setMarkets}
          />
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
