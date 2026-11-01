/**
 * Versionen fürs "Was ist neu"-Fenster, neueste zuerst. Bei einem neuen Update oben einen Eintrag
 * ergänzen. Kleine Verbesserungen kommen in den Eintrag der aktuellen Version, ohne neue Nummer.
 */
export interface Release {
  version: string;
  title: string;
  /** Wichtigstes zuerst */
  highlights: { icon: string; title: string; text: string }[];
}

export const RELEASES: Release[] = [
  {
    version: "1.6",
    title: "Wischen & Liquid Glass",
    highlights: [
      {
        icon: "👆",
        title: "Zwischen Tabs wischen",
        text:
          "Wisch auf dem Bildschirm einfach nach links oder rechts, um zum nächsten Tab zu kommen, " +
          "z. B. von Suchen zu Produkte. Oder leg den Finger auf die Leiste unten und zieh ihn " +
          "zum Tab, den du willst: Die Glas-Blase folgt deinem Finger.",
      },
      {
        icon: "🫧",
        title: "Liquid-Glass-Leiste",
        text: "Die Tab-Leiste ist jetzt aus „Glas“: durchscheinend, mit Glanzkante und einer Blase, die zum Tab gleitet.",
      },
      {
        icon: "📐",
        title: "Bis an den Rand",
        text:
          "Die App nutzt jetzt den ganzen Bildschirm, unten bleibt kein farbiger Streifen mehr frei. " +
          "Oben ist die Kopfzeile klarer, die Postleitzahl ist besser lesbar.",
      },
    ],
  },
  {
    version: "1.5",
    title: "Neues Design & schlauere Suche",
    highlights: [
      {
        icon: "🍬",
        title: "Die Suche versteht mehr Wörter",
        text:
          "Du musst nicht mehr genau das Wort aus dem Prospekt treffen: „Gummibärchen“ findet jetzt auch " +
          "Fruchtgummi, „Limo“ auch Limonade, „Sprudel“ auch Mineralwasser und „Süßigkeiten“ gleich " +
          "Schokolade, Fruchtgummi und Bonbons. Das gilt auch für deine Produkte-Liste.",
      },
      {
        icon: "📱",
        title: "Neue Tab-Leiste",
        text:
          "Die Leiste unten ist jetzt abgerundet, schwebt über dem Inhalt und sitzt ganz unten am " +
          "Bildschirmrand. Der dunkle Streifen beim Öffnen der App ist weg, und beim Wechseln der Tabs " +
          "startest du immer oben.",
      },
      {
        icon: "🐻",
        title: "Mehr in den Kategorien",
        text: "„Fruchtgummi“ zeigt jetzt auch Gummibärchen, „Kekse“ auch Cookies.",
      },
    ],
  },
  {
    version: "1.4",
    title: "Intelligente Suche",
    highlights: [
      {
        icon: "🔍",
        title: "Intelligente Suche",
        text:
          "Beim Tippen schlägt die App passende Marken vor. Vertippt? Aus „Prngles“ wird automatisch " +
          "Pringles. Wenn du wirklich etwas anderes meintest, tippst du einfach auf „stattdessen suchen“.",
      },
      {
        icon: "🗂️",
        title: "Kategorien",
        text:
          "Im Suchen-Tab findest du jetzt Kacheln für Energy Drinks, Cola & Limo, Eistee, Wasser, Chips, " +
          "Schokolade, Fruchtgummi und Kekse. Oben kannst du die Ergebnisse nach Marke filtern und eine " +
          "Marke mit einem Tipp auf deine Liste setzen.",
      },
      {
        icon: "🏷️",
        title: "Nur deine Marke",
        text:
          "Unter Produkte kannst du pro Eintrag „Nur Marke“ einschalten: dann siehst du z. B. nur echte " +
          "Pringles statt aller Chips, oder bei Monster kein „Monster Mampf“ mehr.",
      },
      {
        icon: "🥤",
        title: "Füllmenge auf einen Blick",
        text: "Auf jedem Angebot steht jetzt, wie viel drin ist: 250 ml, 500 ml oder bei Packs 4 × 250 ml.",
      },
      {
        icon: "✨",
        title: "Klarere Namen",
        text: "Statt fünfmal „Energy Drink“ steht jetzt da, was es ist: Red Bull, Monster Energy, Kong Strong XXL.",
      },
    ],
  },
];

/** Alle Versionen, deren Neuigkeiten noch nicht weggeklickt wurden, neueste zuerst */
export function unseenReleases(seen: string[], releases: Release[] = RELEASES): Release[] {
  return releases.filter((r) => !seen.includes(r.version));
}
