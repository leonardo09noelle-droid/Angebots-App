/**
 * Versionen fürs "Was ist neu"-Fenster, neueste zuerst. Bei einem neuen Update oben einen Eintrag
 * ergänzen. Kleine Nachbesserungen kommen in den Eintrag der aktuellen Version, ohne neue Nummer:
 * dann `revision` hochzählen, damit alle das aufgefrischte Fenster noch einmal sehen.
 */
export interface Release {
  version: string;
  /** Nachbesserung derselben Version (2, 3, …) */
  revision?: number;
  /** Erscheinungstag YYYY-MM-DD, steht im Fenster ("Update vom 2. November") */
  date?: string;
  title: string;
  /** Wichtigstes zuerst */
  highlights: { icon: string; title: string; text: string }[];
}

/**
 * Wer die App neu installiert, sieht statt aller alten Versionen nur dieses eine Fenster:
 * das aktuelle Update plus die besten Funktionen aus allen Versionen davor.
 */
export const WELCOME_RELEASE: Release = {
  version: "3.2",
  date: "2026-11-06",
  title: "Alles neu",
  highlights: [
    {
      icon: "🚀",
      title: "Frisch erschienen: Version 3.2",
      text:
        "Gerade erst hat die App ihr größtes Update seit Beginn bekommen: von Grund auf neu aufgebaut, " +
        "übersichtlicher, schneller und sparsamer. Und es geht weiter, regelmäßig kommen neue Funktionen dazu.",
    },
    {
      icon: "⭐",
      title: "Ein Stern für alles",
      text:
        "Marke, ganze Kategorie oder einzelnes Produkt direkt auf der Angebotskarte: Ein Tipp auf ☆, und es " +
        "landet auf deiner Startseite. Ab dann sucht die App automatisch die Angebote dafür.",
    },
    {
      icon: "🧠",
      title: "Intelligente Suche",
      text:
        "Vertippt? Aus „Prngles“ wird Pringles. „Gummibärchen“ findet auch Fruchtgummi, und beim Tippen " +
        "schlägt die App passende Marken vor.",
    },
    {
      icon: "🏆",
      title: "Der Günstigste auf einen Blick",
      text:
        "Die App vergleicht dieselbe Marke über alle Märkte und markiert den besten Preis, wenn möglich sogar " +
        "nach Preis pro Liter oder Kilo. Rabatt in Prozent und „Nur noch heute“ springen sofort ins Auge.",
    },
    {
      icon: "🛒",
      title: "Stöbern bei Rewe, Edeka & Lidl",
      text:
        "Tipp auf einen Markt und sieh sofort, was dort gerade für dich interessant ist. Dazu vergleicht die App " +
        "auch Aldi, Penny und Netto, und jedes Angebot kannst du mit einem Tipp an Freunde schicken.",
    },
    {
      icon: "🔋",
      title: "Spart Akku und Daten",
      text:
        "Die App lädt nur, was du wirklich brauchst: deine Favoriten und deine Suchen. Frische Angebote " +
        "kommen sofort aus dem Speicher.",
    },
  ],
};

export const RELEASES: Release[] = [
  {
    version: "3.2",
    revision: 2,
    date: "2026-11-06",
    title: "Stöbern",
    highlights: [
      {
        icon: "🛒",
        title: "Rewe, Edeka & Lidl direkt auf Start",
        text:
          "Oben auf der Startseite wartet jetzt eine neue Leiste. Ein Tipp auf einen Markt, und du siehst, was es " +
          "dort gerade gibt. Ideal, wenn du eh gleich hingehst und schauen willst, was sich lohnt.",
      },
      {
        icon: "🎯",
        title: "Nur, was dich interessiert",
        text:
          "Die App erkennt an deinen Favoriten, was du magst: Wer Monster merkt, sieht Energy Drinks. Mit „Ändern“ " +
          "stellst du deine Interessen mit einem Tipp selbst ein. Alles bleibt auf deinem Handy.",
      },
      {
        icon: "✨",
        title: "Viel mehr zum Stöbern",
        text:
          "Unter deinen Interessen geht es jetzt einfach weiter: Chips, Käse, Pizza, Müsli, Getränke und vieles " +
          "mehr aus dem Alltag. Scroll einfach nach unten, und neue Kategorien laden von selbst nach, immer nur " +
          "so viel, wie du wirklich anschaust. Pro Kategorie 6 unterschiedliche Produkte, mehr mit „Alle zeigen“.",
      },
      {
        icon: "🧀",
        title: "Viele neue Kategorien",
        text:
          "Milch, Käse, Mozzarella, Joghurt, Pizza, Pommes, Eis, Kaffee, Saft, Nudeln und mehr, " +
          "auch als Kacheln unter Entdecken.",
      },
    ],
  },
  {
    version: "3.1",
    date: "2026-11-02",
    title: "Deine Reihenfolge",
    highlights: [
      {
        icon: "↕️",
        title: "Favoriten sortieren",
        text:
          "Monster Energy soll ganz oben stehen? Tipp auf Start auf „Bearbeiten“, halt den Griff ≡ fest und " +
          "zieh den Favoriten dahin, wo du ihn haben willst. Genau in dieser Reihenfolge siehst du ab jetzt " +
          "deine Angebote.",
      },
      {
        icon: "📱",
        title: "Fühlt sich an wie eine echte App",
        text:
          "Kein versehentliches blaues Markieren mehr, wenn du länger auf eine Karte drückst. Alles bleibt " +
          "ruhig und sauber. In der Suche kannst du natürlich weiter Text einfügen und kopieren.",
      },
    ],
  },
  {
    version: "3.0",
    revision: 2,
    date: "2026-11-02",
    title: "Alles neu",
    highlights: [
      {
        icon: "🚀",
        title: "Das größte Update seit Beginn",
        text:
          "Wir haben die ganze App von Grund auf neu sortiert. Weniger Tabs, kein Hin- und Herspringen, " +
          "kein Rätselraten mehr: Du findest etwas, tippst einmal, und es ist da, wo du es erwartest.",
      },
      {
        icon: "🏠",
        title: "Deine neue Startseite",
        text:
          "Start zeigt dir sofort alle Angebote zu deinen Favoriten, günstigste zuerst. Über „Bearbeiten“ " +
          "benennst du Favoriten um oder wirfst sie raus, ganz wie du es vom iPhone kennst.",
      },
      {
        icon: "⭐",
        title: "Ein Stern für alles",
        text:
          "Ob Marke, Produkt oder ganze Kategorie wie Schokolade: Unter Entdecken tippst du auf „☆ Merken“ " +
          "und es landet direkt auf deiner Startseite. Den komplizierten Marken-Schalter gibt es nicht mehr.",
      },
      {
        icon: "📌",
        title: "Einzelne Produkte merken",
        text:
          "Bei Schokolade entdeckt, dass Kinder Joy im Angebot ist? Tipp direkt auf der Karte auf ☆ und du merkst " +
          "dir genau Kinder Joy, nicht gleich die ganze Schokolade. Geht auch in der Detailansicht.",
      },
      {
        icon: "🔍",
        title: "Entdecken statt suchen",
        text:
          "Suche, beliebte Marken und alle Kategorien an einem Ort, neu mit der Kategorie Müsli. Die schlaue " +
          "Suche versteht weiter Tippfehler und merkt sich, wo du warst.",
      },
      {
        icon: "🔋",
        title: "Spart Akku und Daten",
        text:
          "Die App lädt nur noch, was wirklich neu ist: Frische Angebote kommen sofort aus dem Speicher, " +
          "ein neuer Favorit lädt nur sich selbst, und dieselbe Suche wird nicht doppelt abgerufen.",
      },
    ],
  },
  {
    version: "2.1",
    title: "Smartes Menü",
    highlights: [
      {
        icon: "🧠",
        title: "Die Suche merkt sich alles",
        text:
          "Such z. B. nach Energy, schau kurz bei Angebote vorbei und komm zurück: Deine Suche, die " +
          "Ergebnisse, der Marken-Filter und sogar die Scroll-Position sind noch genau da, wo du warst. " +
          "Perfekt, um Preise hin und her zu vergleichen.",
      },
      {
        icon: "✕",
        title: "Neuer Schließen-Knopf",
        text:
          "In der Detailansicht sitzt oben rechts jetzt ein großer, runder Knopf aus Glas. Er bleibt " +
          "immer an seinem Platz, ist auf jedem Produktbild gut zu sehen und lässt sich bequem mit dem " +
          "Daumen treffen.",
      },
      {
        icon: "🎯",
        title: "Detailansicht steht bombenfest",
        text:
          "Die Detailansicht liegt jetzt sauber über der ganzen App und verrutscht nicht mehr, egal wie " +
          "weit du vorher gescrollt hast.",
      },
    ],
  },
  {
    version: "2.0",
    title: "Neues Design",
    highlights: [
      {
        icon: "🌑",
        title: "Dunkel & kontrastreich",
        text:
          "Die App hat einen neuen Look: tiefes Schwarz, klare Schrift und Neon-Grün als Akzent. " +
          "Preise leuchten jetzt grün und springen sofort ins Auge. Alle Infos sind geblieben, wo sie waren.",
      },
      {
        icon: "🖼️",
        title: "Saubere Produktbilder",
        text: "Die Produktfotos sitzen jetzt auf einem hellen Kärtchen und heben sich besser vom dunklen Hintergrund ab.",
      },
      {
        icon: "🫧",
        title: "Glas-Blase repariert",
        text:
          "Wenn du den Finger auf der Leiste unten nach rechts ziehst, rutscht die Blase nicht mehr über " +
          "Einstellungen hinaus. Sie stoppt jetzt auf beiden Seiten gleich am Rand.",
      },
    ],
  },
  {
    version: "1.7",
    title: "Protein & Bearbeiten",
    highlights: [
      {
        icon: "💪",
        title: "Neue Kategorie: Protein",
        text:
          "Im Suchen-Tab gibt es jetzt den Bereich Protein mit „High Protein“ (alles mit Protein " +
          "oder Eiweiß, z. B. Pudding, Skyr, Drinks) und „Proteinriegel“. Auch die Suche nach " +
          "„High Protein“ oder „Eiweiß“ findet jetzt passende Angebote.",
      },
      {
        icon: "✎",
        title: "Produkte umbenennen",
        text:
          "Vertippt? Unter Produkte einfach auf den Namen tippen, ändern und mit „Fertig“ " +
          "bestätigen. Kein Löschen und neu Anlegen mehr nötig.",
      },
      {
        icon: "🧹",
        title: "Aufgeräumt",
        text: "Die Technik-Info in den Einstellungen ist wieder weg.",
      },
    ],
  },
  {
    version: "1.6",
    revision: 2,
    title: "Wischen & Liquid Glass",
    highlights: [
      {
        icon: "👆",
        title: "Zwischen Tabs wischen",
        text:
          "Wisch auf dem Bildschirm einfach nach links oder rechts, um zum nächsten Tab zu kommen, " +
          "z. B. von Suchen zu Produkte. Die Seite folgt dabei deinem Finger und gleitet weich " +
          "herein. Oder leg den Finger auf die Leiste unten und zieh ihn zum Tab, den du willst: " +
          "Die Glas-Blase folgt deinem Finger.",
      },
      {
        icon: "🫧",
        title: "Liquid-Glass-Leiste",
        text: "Die Tab-Leiste ist jetzt aus „Glas“: durchscheinend, mit Glanzkante und einer Blase, die zum Tab gleitet.",
      },
      {
        icon: "🛠️",
        title: "Fehler behoben",
        text:
          "Auf manchen Handys (vor allem Android) ist die App beim Wechseln der Tabs abgestürzt. " +
          "Das ist behoben. Die Tab-Leiste ist wieder ganz sichtbar, und der Rand unten hat jetzt " +
          "die Farbe der App statt Türkis.",
      },
      {
        icon: "📐",
        title: "Klarere Kopfzeile",
        text: "Titel und Postleitzahl oben sitzen etwas tiefer und sind besser lesbar.",
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

/** Merk-Schlüssel: "1.6" bzw. "1.6#2" für die zweite Fassung von 1.6 */
export function releaseKey(release: Release): string {
  return release.revision ? `${release.version}#${release.revision}` : release.version;
}

/** Alle Versionen, deren (aktuelle Fassung der) Neuigkeiten noch nicht weggeklickt wurden, neueste zuerst */
export function unseenReleases(seen: string[], releases: Release[] = RELEASES): Release[] {
  return releases.filter((r) => !seen.includes(releaseKey(r)));
}
