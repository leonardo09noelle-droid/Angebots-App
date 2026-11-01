import { useEffect, useState } from "react";
import { MARKETS, type Market } from "../types";

/** Maße des Bildschirms, wie die App sie sieht. Hilft bei Darstellungsproblemen auf dem Handy. */
function useScreenInfo(): string {
  const [info, setInfo] = useState("");
  useEffect(() => {
    // Sicherheitsabstände (Notch, Home-Balken) lassen sich nur über ein Mess-Element auslesen
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
    document.body.appendChild(probe);
    const style = getComputedStyle(probe);
    const standalone = matchMedia("(display-mode: standalone)").matches;
    setInfo(
      `Fenster ${window.innerWidth}×${window.innerHeight} · Bildschirm ${screen.width}×${screen.height} · ` +
        `Rand oben ${parseInt(style.paddingTop)} / unten ${parseInt(style.paddingBottom)} · ` +
        `App-Modus ${standalone ? "ja" : "nein"}`,
    );
    probe.remove();
  }, []);
  return info;
}

interface Props {
  zip: string;
  onZipChange: (zip: string) => void;
  markets: Market[];
  onMarketsChange: (markets: Market[]) => void;
}

export function Settings({ zip, onZipChange, markets, onMarketsChange }: Props) {
  const screenInfo = useScreenInfo();

  function toggleMarket(market: Market) {
    // Reihenfolge wie in MARKETS behalten
    const next = markets.includes(market) ? markets.filter((m) => m !== market) : [...markets, market];
    onMarketsChange(MARKETS.filter((m) => next.includes(m)));
  }

  return (
    <div className="settings">
      <section className="card">
        <h2>Meine Märkte</h2>
        <p className="hint">Nur Angebote aus angehakten Märkten werden angezeigt.</p>
        <div className="market-grid">
          {MARKETS.map((m) => (
            <label key={m} className={`market-check${markets.includes(m) ? " on" : ""}`}>
              <input type="checkbox" checked={markets.includes(m)} onChange={() => toggleMarket(m)} />
              {m}
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Postleitzahl</h2>
        <p className="hint">Damit werden die Angebote in deiner Gegend gesucht.</p>
        <input
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => onZipChange(e.target.value.replace(/\D/g, ""))}
          placeholder="z. B. 10115"
        />
      </section>

      <p className="tech-info">Technik-Info: {screenInfo}</p>
    </div>
  );
}
