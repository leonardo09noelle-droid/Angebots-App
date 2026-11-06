import { useEffect, useRef, useState } from "react";
import type { Offer, WatchItem } from "../types";
import { fetchOffers } from "./api";
import { STORE_MARKETS } from "./interests";
import { mergeRemote, searchTermOf, termsToFetch } from "./remote";
import { loadStoreOffers, saveStoreOffers, type RemoteCache } from "./storage";

/** Höchstens so viele Kategorien gleichzeitig abrufen, um marktguru nicht zu überfahren */
const PARALLEL = 3;

/**
 * Angebote für die Markt-Tabs. Lädt erst, wenn ein Markt-Tab offen ist, und nur Kategorien, die neu
 * oder älter als 3 Stunden sind. Jede Kategorie ist eine eigene Anfrage: Die kann Vercel für alle
 * mit derselben Postleitzahl wiederverwenden, und ein Fehler trifft nur diese eine Kategorie.
 */
export function useInterestOffers(zip: string, items: WatchItem[], active: boolean, wakeToken: number) {
  const [cache, setCache] = useState<RemoteCache | null>(loadStoreOffers);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const forceAll = useRef(false);
  const cacheRef = useRef(cache);
  const itemsKey = items.map((i) => i.term).join(",");

  useEffect(() => {
    const todo = !active ? [] : forceAll.current ? items : termsToFetch(cacheRef.current, zip, items);
    if (active) forceAll.current = false;
    // Ein laufender Abruf kann gerade abgebrochen worden sein: dann nicht ewig "lädt" anzeigen
    if (todo.length === 0) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const queue = [...todo];
    const failedNow: string[] = [];
    setLoading(true);
    setFailed([]);

    async function worker() {
      for (let item = queue.shift(); item && !controller.signal.aborted; item = queue.shift()) {
        try {
          const result = await fetchOffers(zip, [searchTermOf(item)], controller.signal);
          // Nur die Märkte mit eigenem Tab speichern; das hält den Speicher klein
          const offers: Offer[] = result.offers.filter((o) => STORE_MARKETS.includes(o.market));
          if (result.failedTerms.length) failedNow.push(item.term);
          const done = result.failedTerms.length ? [] : [item.term];
          const next = mergeRemote(cacheRef.current, zip, done, done.length ? offers : [], items);
          cacheRef.current = next;
          setCache(next);
          saveStoreOffers(next);
        } catch (err) {
          if ((err as Error).name !== "AbortError") failedNow.push(item.term);
        }
      }
    }

    Promise.all(Array.from({ length: PARALLEL }, worker)).finally(() => {
      if (controller.signal.aborted) return;
      setFailed(failedNow);
      setLoading(false);
    });
    return () => controller.abort();
  }, [zip, itemsKey, active, reloadToken, wakeToken]);

  function refresh() {
    forceAll.current = true;
    setReloadToken((n) => n + 1);
  }

  return { cache: cache?.zip === zip ? cache : null, loading, failed, refresh };
}
