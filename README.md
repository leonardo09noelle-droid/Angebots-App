# Angebots-Radar

Zeigt dir Supermarkt-Angebote für deine Lieblingsprodukte (Monster, Proteinriegel, …).
Web-App, die du auf dem iPhone (und Android) wie eine normale App installierst.

## Lokal starten

```bash
npm install
npm run dev
```

Dann im Browser http://localhost:5173 öffnen.

**Auf dem iPhone testen, solange es nur auf dem PC läuft:** PC und iPhone im selben WLAN,
dann `npm run dev -- --host` starten und die angezeigte `Network`-Adresse
(z. B. `http://192.168.178.20:5173`) in Safari öffnen.

## Befehle

| Befehl | Was er macht |
|---|---|
| `npm run dev` | Startet die App lokal mit Live-Neuladen |
| `npm test` | Führt die Tests aus |
| `npm run build` | Baut die fertige App in den Ordner `dist` |
| `npm run icons` | Erzeugt die App-Icons neu aus `public/icon.svg` |

## Veröffentlichen (damit sie dauerhaft auf dem Handy läuft)

1. Kostenlosen Account auf https://github.com anlegen und ein neues, leeres Repository erstellen.
2. Im Projektordner:
   ```bash
   git init
   git add .
   git commit -m "Erste Version"
   git branch -M main
   git remote add origin https://github.com/<dein-name>/<repo-name>.git
   git push -u origin main
   ```
3. Auf https://vercel.com mit GitHub anmelden → **Add New → Project** → dein Repo auswählen → **Deploy**.
   Vercel erkennt Vite automatisch. Du bekommst eine Adresse wie `https://angebots-radar.vercel.app`.
4. Jeder weitere `git push` veröffentlicht automatisch die neue Version.

## Aufs iPhone installieren

1. Die Vercel-Adresse in **Safari** öffnen (nicht in Chrome).
2. Unten auf **Teilen** (Quadrat mit Pfeil) → **Zum Home-Bildschirm**.
3. Die App startet jetzt mit eigenem Icon im Vollbild.

Android/Samsung: Adresse in Chrome öffnen → Menü ⋮ → **App installieren**.

## Woher die Angebote kommen

- **Automatisch:** Die Funktion `api/offers.ts` fragt marktguru für jedes Produkt auf deiner Merkliste
  und deine Postleitzahl ab. Sie behält nur Lidl, Aldi Nord/Süd, Penny, Netto, Rewe und Edeka
  (`server/retailers.ts`) und nur Treffer, die alle Wörter des Merklisten-Eintrags enthalten
  (`server/normalize.ts`). Auf Vercel wird das Ergebnis eine Stunde zwischengespeichert.
- **Selbst eingetragen:** über den Tab „Eintragen“, für alles, was marktguru nicht kennt.

marktguru hat keine offizielle Schnittstelle. Wenn die automatische Suche irgendwann
„nicht erreichbar“ meldet, hat sich vermutlich deren Webseite geändert. Dann muss
`server/marktguru.ts` angepasst werden. Selbst eingetragene Angebote funktionieren trotzdem weiter.

## Wichtig zu wissen

- Merkliste, Postleitzahl und eingetragene Angebote werden **nur auf dem jeweiligen Handy** gespeichert.
  Dein Bruder hat also seine eigene Liste.
- Abgelaufene Angebote (nach dem „gültig bis“-Datum) werden automatisch ausgeblendet.
  Angebote aus dem Prospekt der nächsten Woche stehen gestrichelt mit „ab …“ unten in der Liste.
