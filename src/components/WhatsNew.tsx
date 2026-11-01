import { useEffect, useState } from "react";
import type { Release } from "../lib/changelog";

interface Props {
  /** verpasste Versionen, neueste zuerst */
  releases: Release[];
  onClose: () => void;
}

/** "Was ist neu"-Fenster; bei mehreren verpassten Versionen mit Reitern ("1.5 | 1.4") */
export function WhatsNew({ releases, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const release = releases[Math.min(index, releases.length - 1)];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="whatsnew-backdrop" onClick={onClose}>
      <div
        className="whatsnew"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsnew-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sheet-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        {releases.length > 1 ? (
          <div className="whatsnew-tabs" role="tablist" aria-label="Versionen">
            {releases.map((r, i) => (
              <button
                key={r.version}
                role="tab"
                aria-selected={i === index}
                className={`whatsnew-tab${i === index ? " active" : ""}`}
                onClick={() => setIndex(i)}
              >
                Version {r.version}
                {r.revision ? " · neu" : ""}
              </button>
            ))}
          </div>
        ) : (
          <span className="whatsnew-version">
            {release.revision ? `Version ${release.version} – aktualisiert` : `Neu in Version ${release.version}`}
          </span>
        )}

        <h2 id="whatsnew-title">{release.title}</h2>
        <ul className="whatsnew-list">
          {release.highlights.map((h) => (
            <li key={h.title}>
              <span className="whatsnew-icon" aria-hidden>
                {h.icon}
              </span>
              <span>
                <b>{h.title}</b>
                <span className="whatsnew-text">{h.text}</span>
              </span>
            </li>
          ))}
        </ul>

        {index < releases.length - 1 ? (
          <button className="primary big" onClick={() => setIndex(index + 1)}>
            Weiter zu Version {releases[index + 1].version} ›
          </button>
        ) : (
          <button className="primary big" onClick={onClose}>
            Los geht's
          </button>
        )}
      </div>
    </div>
  );
}
