import { useEffect, useMemo, useRef, useState } from "react";
import type { Market, Offer, WatchItem } from "./types";
import { groupByTerm, markNew } from "./lib/offers";
import { fetchOffers } from "./lib/api";
import { allBrands } from "./lib/brands";
import { findCategory, type Category } from "./lib/categories";
import { RELEASES, WELCOME_RELEASE, releaseKey, unseenReleases } from "./lib/changelog";
import { FavoritesContext } from "./lib/favorites";
import {
  FIRST_BATCH,
  NEXT_BATCH,
  STORE_MARKETS,
  effectiveInterests,
  sectionsForStore,
  storeCategoryIds,
  suggestInterests,
  toggleInterest,
} from "./lib/interests";
import { fetchedAtOf, mergeRemote, searchTermOf, termsToFetch, upgradeCache } from "./lib/remote";
import {
  isFirstStart,
  learnBrands,
  loadInterestChanges,
  loadLearnedBrands,
  loadMarkets,
  loadSeenVersions,
  loadRemote,
  loadSeen,
  loadWatchlist,
  loadZip,
  removeLegacyOffers,
  saveInterestChanges,
  saveMarkets,
  saveRemote,
  saveSeen,
  saveSeenVersions,
  saveWatchlist,
  saveZip,
  type RemoteCache,
} from "./lib/storage";
import { Home } from "./components/Home";
import { Search } from "./components/Search";
import { Settings } from "./components/Settings";
import { StoreTab } from "./components/StoreTab";
import { WhatsNew } from "./components/WhatsNew";
import { TabBar } from "./components/TabBar";
import { useInterestOffers } from "./lib/useInterestOffers";
import { useSwipeTabs } from "./lib/useSwipeTabs";

type Tab = "home" | "discover" | "settings";

const TABS: { id: Tab; label: string; title: string; icon: string }[] = [
  { id: "home", label: "Start", title: "Meine Angebote", icon: "🏠" },
  { id: "discover", label: "Entdecken", title: "Entdecken", icon: "🔍" },
  { id: "settings", label: "Einstellungen", title: "Einstellungen", icon: "⚙️" },
];

const timeFormat = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

/** Derselbe Favorit? Kategorien über ihre Kachel, sonst über den Begriff (Groß/Klein egal) */
function sameFavorite(a: WatchItem, b: WatchItem): boolean {
  if (a.categoryId && a.categoryId === b.categoryId) return true;
  return a.term.toLowerCase() === b.term.toLowerCase();
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  // Richtung des letzten Tab-Wechsels, damit die neue Seite von der passenden Seite hereingleitet
  const [slide, setSlide] = useState<"left" | "right" | null>(null);
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [zip, setZip] = useState(loadZip);
  const [markets, setMarkets] = useState(loadMarkets);
  const [remote, setRemote] = useState<RemoteCache | null>(() => upgradeCache(loadRemote(), loadWatchlist()));
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [learnedBrands, setLearnedBrands] = useState(loadLearnedBrands);
  // Kurzer Hinweis über der Tab-Leiste, z. B. nach dem Merken
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  // "Was ist neu": alle verpassten Versionen zeigen, nach dem ✕ nie wieder. Neu installiert: nur ein
  // Willkommens-Fenster mit dem aktuellen Update und den besten Funktionen
  const [missedReleases, setMissedReleases] = useState(() =>
    isFirstStart() ? [WELCOME_RELEASE] : unseenReleases(loadSeenVersions()),
  );
  const brands = useMemo(() => allBrands(learnedBrands), [learnedBrands]);

  /** Marken aus Ergebnissen merken, für Vorschläge und "Meintest du …?" */
  function rememberBrands(offers: Offer[]) {
    setLearnedBrands((prev) => learnBrands(prev, offers));
  }

  // Beim Tab-Wechsel oben anfangen (nur der Inhalt scrollt, nicht die Seite). Entdecken bleibt geladen
  // und kommt an derselben Stelle wieder, damit man Ergebnisse vergleichen kann.
  const contentRef = useRef<HTMLElement>(null);
  const searchScroll = useRef(0);
  // Geschweifte Klammern sind wichtig: scrollTo gibt in neuerem Chrome ein Promise zurück, und
  // React würde den Rückgabewert sonst als Aufräum-Funktion aufrufen (Absturz beim Tab-Wechsel)
  useEffect(() => {
    contentRef.current?.scrollTo({ top: tab === "discover" ? searchScroll.current : 0 });
  }, [tab]);

  function goTo(next: Tab) {
    const from = TABS.findIndex((t) => t.id === tab);
    const to = TABS.findIndex((t) => t.id === next);
    if (from === to) return;
    if (tab === "discover") searchScroll.current = contentRef.current?.scrollTop ?? 0;
    setSlide(to > from ? "left" : "right");
    setTab(next);
  }

  // Wischen im Inhalt: nach links = nächster Tab, nach rechts = vorheriger
  const pageRef = useRef<HTMLDivElement>(null);
  const swipe = useSwipeTabs(pageRef, (direction) => {
    const next = TABS.findIndex((t) => t.id === tab) + direction;
    if (next < 0 || next >= TABS.length) return false;
    goTo(TABS[next].id);
    return true;
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
  useEffect(() => {
    if (remote) saveRemote(remote);
  }, [remote]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Kommt die App aus dem Hintergrund zurück, nachsehen, ob etwas veraltet ist (geladen wird nur dann)
  const [wakeToken, setWakeToken] = useState(0);
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setWakeToken((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const validZip = /^\d{5}$/.test(zip);
  const termsKey = watchlist.map((w) => w.term).join(",");

  // Der Abruf liest den Speicher über Refs, damit er nicht bei jedem neuen Ergebnis von vorne startet
  const remoteRef = useRef(remote);
  const watchlistRef = useRef(watchlist);
  useEffect(() => {
    remoteRef.current = remote;
    watchlistRef.current = watchlist;
  }, [remote, watchlist]);
  /** ↻ gedrückt: diesmal alle Favoriten laden, auch frische */
  const forceAll = useRef(false);

  // Sparsame automatische Suche: nur neue Favoriten und was älter als 3 Stunden ist
  useEffect(() => {
    if (!validZip) return;
    const items = forceAll.current ? watchlistRef.current : termsToFetch(remoteRef.current, zip, watchlistRef.current);
    forceAll.current = false;
    // Ein laufender Abruf kann gerade abgebrochen worden sein: dann nicht ewig "lädt" anzeigen
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchOffers(zip, items.map(searchTermOf), controller.signal)
      .then((result) => {
        const prev = remoteRef.current;
        const failed = new Set(result.failedTerms.map((t) => t.toLowerCase()));
        const done = items.map((i) => i.term).filter((t) => !failed.has(t.toLowerCase()));
        const next = mergeRemote(prev, zip, done, result.offers, watchlistRef.current);
        remoteRef.current = next;
        setRemote(next);
        rememberBrands(result.offers);

        // "Neu" gibt es nur bei Favoriten, die schon einmal geladen waren; ein frisch gemerkter
        // Favorit ist nicht komplett "neu". Bleibt für diese Sitzung stehen.
        const knownBefore = new Set(
          items
            .filter((i) => prev?.zip === zip && fetchedAtOf(prev, i.term) !== undefined)
            .map((i) => i.term.toLowerCase()),
        );
        const ids = result.offers.map((o) => o.id);
        const seen = loadSeen();
        const fresh = markNew(
          result.offers.filter((o) => knownBefore.has(o.term.toLowerCase())).map((o) => o.id),
          seen,
        );
        setNewIds((old) => new Set([...old, ...fresh]));
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
  }, [zip, validZip, termsKey, reloadToken, wakeToken]);

  // Markt-Tabs auf Start: Interessen aus den Favoriten plus eigene Änderungen
  const [homeView, setHomeView] = useState<"mine" | Market>("mine");
  const [interestChanges, setInterestChanges] = useState(loadInterestChanges);
  useEffect(() => {
    saveInterestChanges(interestChanges);
  }, [interestChanges]);
  const storeTabs = STORE_MARKETS.filter((m) => markets.includes(m));
  // Wurde der offene Markt in den Einstellungen abgewählt, zurück zu "Meine"
  const view = homeView !== "mine" && storeTabs.includes(homeView) ? homeView : "mine";
  const autoInterests = useMemo(() => suggestInterests(watchlist, remote?.offers ?? []), [watchlist, remote]);
  const interestIds = useMemo(() => effectiveInterests(autoInterests, interestChanges), [autoInterests, interestChanges]);
  // Erst deine Interessen, dann Alltagsprodukte; weitere Kategorien kommen erst beim Scrollen
  const storeCategories = useMemo(
    () =>
      storeCategoryIds(interestIds, interestChanges).flatMap((id) => {
        const category = findCategory(id);
        return category ? [category] : [];
      }),
    [interestIds, interestChanges],
  );
  const [extraCategories, setExtraCategories] = useState(FIRST_BATCH);
  const visibleCount = Math.min(storeCategories.length, interestIds.length + extraCategories);
  const visibleCategories = useMemo(() => storeCategories.slice(0, visibleCount), [storeCategories, visibleCount]);
  const toItem = (c: Category): WatchItem => ({ term: c.label, categoryId: c.id });
  const storeItems = useMemo(() => visibleCategories.map(toItem), [visibleCategories]);
  const storeKeep = useMemo(() => storeCategories.map(toItem), [storeCategories]);
  const store = useInterestOffers(zip, storeItems, storeKeep, validZip && tab === "home" && view !== "mine", wakeToken);
  const sections = useMemo(
    () => (view === "mine" ? [] : sectionsForStore(store.cache?.offers ?? [], view, visibleCategories, watchlist)),
    [view, store.cache, visibleCategories, watchlist],
  );
  const storeTimes = store.cache
    ? storeItems.map((i) => fetchedAtOf(store.cache!, i.term)).filter((t): t is number => t !== undefined)
    : [];

  function selectView(next: "mine" | Market) {
    setHomeView(next);
    contentRef.current?.scrollTo({ top: 0 });
  }

  function refresh() {
    if (view !== "mine") {
      // Nur den Anfang neu laden; den Rest erst, wenn wieder dorthin gescrollt wird
      setExtraCategories(FIRST_BATCH);
      contentRef.current?.scrollTo({ top: 0 });
      store.refresh();
      return;
    }
    forceAll.current = true;
    setReloadToken((n) => n + 1);
  }

  const viewLoading = view === "mine" ? loading : store.loading;

  const visibleOffers = useMemo(
    () => (remote && remote.zip === zip ? remote.offers.filter((o) => markets.includes(o.market)) : []),
    [remote, zip, markets],
  );
  const groups = useMemo(() => groupByTerm(visibleOffers, watchlist), [visibleOffers, watchlist]);

  // "Stand": wann der älteste angezeigte Favorit geladen wurde
  const fetchedTimes =
    remote && remote.zip === zip
      ? watchlist.map((w) => fetchedAtOf(remote, w.term)).filter((t): t is number => t !== undefined)
      : [];
  const standAt = fetchedTimes.length ? Math.min(...fetchedTimes) : undefined;

  function closeWhatsNew() {
    // Nach dem Willkommens-Fenster gelten auch alle älteren Versionen als gesehen
    const closed = missedReleases.includes(WELCOME_RELEASE) ? RELEASES : missedReleases;
    saveSeenVersions([...new Set([...loadSeenVersions(), ...closed.map(releaseKey)])]);
    setMissedReleases([]);
  }

  /** ☆ Merken / ★ Gemerkt. offers: schon geladene Treffer aus Entdecken, dann muss nichts nachgeladen werden */
  function toggleFavorite(item: WatchItem, offers?: Offer[]) {
    const exists = watchlist.some((w) => sameFavorite(w, item));
    if (!exists && offers && validZip) {
      const relabeled = offers.map((o) => ({ ...o, term: item.term }));
      const next = mergeRemote(remoteRef.current, zip, [item.term], relabeled, [...watchlist, item]);
      remoteRef.current = next;
      setRemote(next);
    }
    setWatchlist((prev) => (exists ? prev.filter((w) => !sameFavorite(w, item)) : [...prev, item]));
    setToast({ text: exists ? "Von deiner Startseite entfernt" : "⭐ Auf deiner Startseite", id: Date.now() });
  }

  const isFavorite = (item: WatchItem) => watchlist.some((w) => sameFavorite(w, item));

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle: (item) => toggleFavorite(item) }}>
      <div className="app">
        <header className="app-header">
          <h1>{TABS.find((t) => t.id === tab)!.title}</h1>
          {tab === "home" && validZip && (
            <div className="header-actions">
              <span className="zip-chip">📍 {zip}</span>
              <button
                className={`refresh${viewLoading ? " spinning" : ""}`}
                onClick={refresh}
                disabled={viewLoading}
                aria-label="Angebote aktualisieren"
              >
                ↻
              </button>
            </div>
          )}
        </header>

        <main className="content" ref={contentRef} {...swipe}>
          {/* key: bei jedem Tab neu, damit die Gleit-Animation jedes Mal läuft */}
          {tab !== "discover" && (
            <div key={tab} ref={pageRef} className={`tab-page${slide ? ` slide-${slide}` : ""}`}>
              {tab === "home" && validZip && storeTabs.length > 0 && (
                <div className="store-switch" role="tablist" aria-label="Ansicht" data-no-swipe>
                  {(["mine", ...storeTabs] as const).map((v) => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      className={view === v ? "active" : ""}
                      onClick={() => selectView(v)}
                    >
                      {v === "mine" ? "Meine" : v}
                    </button>
                  ))}
                </div>
              )}

              {tab === "home" && view !== "mine" && (
                <StoreTab
                  key={view}
                  market={view}
                  sections={sections}
                  personalIds={interestIds}
                  enabledIds={storeCategories.map((c) => c.id)}
                  onToggleInterest={(id, isOn) => setInterestChanges((prev) => toggleInterest(prev, id, isOn))}
                  hasMore={visibleCount < storeCategories.length}
                  onLoadMore={() => setExtraCategories((n) => n + NEXT_BATCH)}
                  loading={store.loading}
                  failed={store.failed}
                  fetchedLabel={
                    storeTimes.length ? `Stand: ${timeFormat.format(Math.min(...storeTimes))} · Quelle: marktguru` : ""
                  }
                />
              )}

              {tab === "home" && view === "mine" && (
                <Home
                  validZip={validZip}
                  onZipChange={setZip}
                  noMarkets={markets.length === 0}
                  watchlist={watchlist}
                  onWatchlistChange={setWatchlist}
                  groups={groups}
                  newIds={newIds}
                  loading={loading}
                  status={
                    error ||
                    (loading
                      ? "Suche Angebote …"
                      : standAt !== undefined
                        ? `Stand: ${timeFormat.format(standAt)} · Quelle: marktguru`
                        : "")
                  }
                  statusIsError={!!error}
                  onDiscover={() => goTo("discover")}
                />
              )}

              {tab === "settings" && (
                <Settings zip={zip} onZipChange={setZip} markets={markets} onMarketsChange={setMarkets} />
              )}
            </div>
          )}

          {/*
           * Entdecken wird nur versteckt, nie abgebaut: Suchbegriff, Ergebnisse und Filter bleiben beim
           * Tab-Wechsel erhalten. Die Gleit-Animation startet beim Wiedereinblenden von selbst neu.
           */}
          <div
            ref={tab === "discover" ? pageRef : undefined}
            className={`tab-page${slide ? ` slide-${slide}` : ""}`}
            hidden={tab !== "discover"}
          >
            <Search
              zip={zip}
              onZipChange={setZip}
              markets={markets}
              brands={brands}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onResults={rememberBrands}
            />
          </div>
        </main>

        {toast && (
          <div key={toast.id} className="toast" role="status">
            {toast.text}
          </div>
        )}

        {missedReleases.length > 0 && <WhatsNew releases={missedReleases} onClose={closeWhatsNew} />}

        <TabBar tabs={TABS} active={tab} onChange={goTo} />
      </div>
    </FavoritesContext.Provider>
  );
}
