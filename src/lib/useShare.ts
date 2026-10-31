import { useState } from "react";
import type { Offer } from "../types";
import { shareOffer } from "./share";

/** Teilen mit kurzer Rückmeldung ("Kopiert ✓" bzw. "Ging nicht"), falls kein Teilen-Menü da ist */
export function useShare(offer: Offer) {
  const [feedback, setFeedback] = useState<"" | "Kopiert ✓" | "Ging nicht">("");

  async function share() {
    const result = await shareOffer(offer);
    if (result === "copied" || result === "failed") {
      setFeedback(result === "copied" ? "Kopiert ✓" : "Ging nicht");
      setTimeout(() => setFeedback(""), 2000);
    }
  }

  return { share, feedback };
}
