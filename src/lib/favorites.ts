import { createContext, useContext } from "react";
import type { Offer, WatchItem } from "../types";
import { displayName } from "./offers";

export interface Favorites {
  isFavorite: (item: WatchItem) => boolean;
  toggle: (item: WatchItem) => void;
}

/** Merken direkt auf der Angebotskarte, ohne die Funktionen durch jede Liste zu reichen */
export const FavoritesContext = createContext<Favorites | null>(null);

export const useFavorites = () => useContext(FavoritesContext);

/** Eintrag von Platz `from` an Platz `to` schieben (Sortieren im Bearbeiten-Modus) */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

/** Ein einzelnes Angebot merken heißt: genau dieses Produkt, z. B. "Kinder Joy" statt aller Schokolade */
export function favoriteOf(offer: Offer): WatchItem {
  return { term: displayName(offer).replace(/,/g, " ").replace(/\s+/g, " ").trim() };
}
