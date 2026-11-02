import { useState, type FormEvent } from "react";

/** Erster Start: Postleitzahl direkt hier eingeben, ohne Umweg über die Einstellungen */
export function ZipPrompt({ onZipChange }: { onZipChange: (zip: string) => void }) {
  const [draft, setDraft] = useState("");
  const valid = /^\d{5}$/.test(draft);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid) onZipChange(draft);
  }

  return (
    <section className="card welcome">
      <h2>Willkommen 👋</h2>
      <p className="hint">
        Wo kaufst du ein? Gib deine Postleitzahl ein, dann suche ich die Angebote von Lidl, Aldi, Penny, Netto, Rewe
        und Edeka in deiner Nähe.
      </p>
      <form className="add-term" onSubmit={submit}>
        <input
          inputMode="numeric"
          autoComplete="postal-code"
          enterKeyHint="go"
          maxLength={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          placeholder="Postleitzahl, z. B. 10115"
          aria-label="Postleitzahl"
        />
        <button className="primary" type="submit" disabled={!valid}>
          Los geht's
        </button>
      </form>
    </section>
  );
}
