import { useEffect } from "react";
import type { Release } from "../lib/changelog";

interface Props {
  release: Release;
  onClose: () => void;
}

/** "Was ist neu"-Fenster, erscheint pro Version nur einmal */
export function WhatsNew({ release, onClose }: Props) {
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
        <span className="whatsnew-version">Neu in Version {release.version}</span>
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
        <button className="primary big" onClick={onClose}>
          Los geht's
        </button>
      </div>
    </div>
  );
}
