import { beforeEach, describe, expect, it } from "vitest";
import { RELEASES, unseenReleases } from "./changelog";
import { loadSeenVersions, saveSeenVersions } from "./storage";

// Kleiner localStorage-Ersatz für die Tests (Node hat keinen)
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

beforeEach(() => store.clear());

const versions = (seen: string[]) => unseenReleases(seen).map((r) => r.version);

describe("unseenReleases", () => {
  it("zeigt alle verpassten Versionen, neueste zuerst", () => {
    expect(versions([])).toEqual(RELEASES.map((r) => r.version));
    expect(versions(["1.4", "1.5", "1.6#2"])).toEqual(["3.2", "3.1", "3.0", "2.1", "2.0", "1.7"]);
    expect(versions(["1.4", "1.5", "1.6#2", "1.7", "2.0", "2.1", "3.0#2", "3.1", "3.2"])).toEqual([]);
  });

  it("zeigt 1.4 auch dann noch, wenn nur neuere weggeklickt wurden", () => {
    expect(versions(["1.5", "1.6#2", "1.7", "2.0", "2.1", "3.0#2", "3.1", "3.2"])).toEqual(["1.4"]);
  });

  it("zeigt eine aufgefrischte Fassung noch einmal, auch wenn die erste schon gesehen wurde", () => {
    expect(versions(["1.4", "1.5", "1.6", "1.7", "2.0", "2.1", "3.0#2", "3.1", "3.2"])).toEqual(["1.6"]);
  });
});

describe("loadSeenVersions", () => {
  it("übernimmt aus dem alten Speicher nur die letzte Version", () => {
    store.set("angebote.seenVersion", JSON.stringify("1.5"));
    expect(loadSeenVersions()).toEqual(["1.5"]);
  });

  it("liest die neue Liste, wenn vorhanden", () => {
    store.set("angebote.seenVersion", JSON.stringify("1.5"));
    saveSeenVersions(["1.4", "1.5"]);
    expect(loadSeenVersions()).toEqual(["1.4", "1.5"]);
  });

  it("ist beim allerersten Start leer", () => {
    expect(loadSeenVersions()).toEqual([]);
  });
});
