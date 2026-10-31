import { useState, type FormEvent } from "react";
import { MARKETS, type Market, type Offer } from "../types";

interface Props {
  watchlist: string[];
  onAdd: (offer: Offer) => void;
}

/** "1,29" oder "1.29" -> 1.29 */
function parsePrice(value: string): number | undefined {
  const n = Number(value.replace(",", ".").trim());
  return value.trim() && Number.isFinite(n) && n > 0 ? n : undefined;
}

export function AddOffer({ watchlist, onAdd }: Props) {
  const [term, setTerm] = useState(watchlist[0] ?? "");
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState<Market>(MARKETS[0]);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState("");

  if (watchlist.length === 0) {
    return (
      <p className="empty">
        Füg zuerst unter <b>Einstellungen</b> ein Produkt zu deiner Merkliste hinzu.
      </p>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = parsePrice(price);
    if (p === undefined) {
      setError("Bitte einen gültigen Preis eingeben, z. B. 0,99");
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      term,
      product: product.trim() || term,
      market,
      price: p,
      oldPrice: parsePrice(oldPrice),
      validUntil: validUntil || undefined,
      source: "manual",
    });
  }

  return (
    <form className="form" onSubmit={submit}>
      <p className="hint">Angebot im Prospekt gesehen? Trag es hier ein.</p>

      <label>
        Produkt aus deiner Merkliste
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          {watchlist.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      </label>

      <label>
        Genaue Bezeichnung <span className="optional">(optional)</span>
        <input
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="z. B. Monster Ultra White 0,5 l"
        />
      </label>

      <label>
        Markt
        <select value={market} onChange={(e) => setMarket(e.target.value as Market)}>
          {MARKETS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>

      <div className="row">
        <label>
          Angebotspreis €
          <input
            inputMode="decimal"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setError("");
            }}
            placeholder="0,99"
            required
          />
        </label>
        <label>
          Normalpreis € <span className="optional">(opt.)</span>
          <input inputMode="decimal" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="1,49" />
        </label>
      </div>

      <label>
        Gültig bis <span className="optional">(optional)</span>
        <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="primary" type="submit">
        Speichern
      </button>
    </form>
  );
}
