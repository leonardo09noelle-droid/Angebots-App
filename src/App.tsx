import { useEffect, useMemo, useRef, useState } from "react";
import type { Offer } from "./types";
import { groupByTerm, markNew } from "./lib/offers";
import { fetchOffers } from "./lib/api";
import { allBrands } from "./lib/brands";
import { unseenReleases } from "./lib/changelog";
import {
  learnBrands,
  loadLearnedBrands,
  loadMarkets,
  loadSeenVersions,
  loadRemote,
  loadSeen,
  loadWatchlist,
  loadZip,
  removeLegacyOffers,
  saveMarkets,
  saveRemote,
  saveSeen,
  saveSeenVersions,
  saveWatchlist,
  saveZip,
  type RemoteCache,
} from "./lib/storage";
import { OfferList } from "./components/OfferList";
import { MyProducts } from "./components/MyProducts";
import { Search } from "./components/Search";
import { Settings } from "./components/Settings";
import { WhatsNew } from "./components/WhatsNew";
import { TabBar } from "./components/TabBar";
import { useSwipeTabs } from "./lib/useSwipeTabs";

type Tab = "offers" | "search" | "products" | "settings";

const TABS: { id: Tab; label: string; title: string; icon: string }[] = [
  { id: "offers", label: "Angebote", title: "Angebote", icon: "🏷️" },
  { id: "search", label: "Suchen", title: "Suchen", icon: "🔍" },
  { id: "products", label: "Produkte", title: "Meine Produkte", icon: "⭐" },
  { id: "settings", label: "Einstellungen", title: "Einstellungen", icon: "⚙️" },
];

const timeFormat = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function App() {
  const [tab, setTab] = useState<Tab>("offers");
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [zip, setZip] = useState(loadZip);
  const [markets, setMarkets] = useState(loadMarkets);
  const [remote, setRemote] = useState<RemoteCache | null>(loadRemote);
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [learnedBrands, setLearnedBrands] = useState(loadLearnedBrands);
  // "Was ist neu": alle verpassten Versionen zeigen, nach dem ✕ nie wieder
  const [missedReleases, setMissedReleases] = useState(() => unseenReleases(loadSeenVersions()));
  const brands = useMemo(() => allBrands(learnedBrands), [learnedBrands]);

  /** Marken aus Ergebnissen merken, für Vorschläge und "Meintest du …?" */
  function rememberBrands(offers: Offer[]) {
    setLearnedBrands((prev) => learnBrands(prev, offers));
  }

  // Beim Tab-Wechsel oben anfangen (nur der Inhalt scrollt, nicht die Seite)
  const contentRef = useRef<HTMLElement>(null);
  // Geschweifte Klammern sind wichtig: scrollTo gibt in neuerem Chrome ein Promise zurück, und
  // React würde den Rückgabewert sonst als Aufräum-Funktion aufrufen (Absturz beim Tab-Wechsel)
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  // Wischen im Inhalt: nach links = nächster Tab, nach rechts = vorheriger
  const swipe = useSwipeTabs((direction) => {
    const next = TABS.findIndex((t) => t.id === tab) + direction;
    if (next >= 0 && next < TABS.length) setTab(TABS[next].id);
  });

  useEffect(() => {
    removeLegacyOffers();
  }, []);
  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);
  useEffect(() => {
    saveZip(zip);
  }, [zip]);
  useEffect(() => {
    saveMarkets(markets);
  }, [markets]);

  const validZip = /^\d{5}$/.test(zip);
  const termsKey = watchlist.map((w) => w.term).join(",");

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
        rememberBrands(result.offers);

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

  const visibleOffers = useMemo(
    () => (remote && remote.zip === zip ? remote.offers.filter((o) => markets.includes(o.market)) : []),
    [remote, zip, markets],
  );
  const groups = useMemo(() => groupByTerm(visibleOffers, watchlist), [visibleOffers, watchlist]);
  const offerCounts = useMemo(() => new Map(groups.map((g) => [g.term, g.offers.length])), [groups]);

  function closeWhatsNew() {
    saveSeenVersions([...new Set([...loadSeenVersions(), ...missedReleases.map((r) => r.version)])]);
    setMissedReleases([]);
  }

  function addItem(term: string, brandOnly: boolean) {
    setWatchlist((prev) =>
      prev.some((w) => w.term.toLowerCase() === term.toLowerCase()) ? prev : [...prev, { term, brandOnly }],
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{TABS.find((t) => t.id === tab)!.title}</h1>
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

      <main className="content" ref={contentRef} {...swipe}>
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
                Du hast noch keine Produkte. Füg unter <b>Produkte</b> welche hinzu.
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
                    <OfferList offers={group.offers} newIds={newIds} />
                  )}
                </section>
              ))
            )}
          </>
        )}

        {tab === "search" && (
          <Search
            zip={zip}
            markets={markets}
            watchlist={watchlist}
            brands={brands}
            onAddItem={addItem}
            onResults={rememberBrands}
          />
        )}

        {tab === "products" && (
          <MyProducts
            watchlist={watchlist}
            onWatchlistChange={setWatchlist}
            offerCounts={offerCounts}
            brands={brands}
          />
        )}

        {tab === "settings" && (
          <Settings zip={zip} onZipChange={setZip} markets={markets} onMarketsChange={setMarkets} />
        )}
      </main>

      {missedReleases.length > 0 && <WhatsNew releases={missedReleases} onClose={closeWhatsNew} />}

      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
}
