/**
 * Persistence service for the game. Stores the personal highscore in the
 * browser's local storage — no network involved.
 *
 * This is the only place that touches localStorage; UI and hooks depend on the
 * service interface, never on storage details.
 */

const HIGHSCORE_KEY = "sky-catcher:highscore";

/** Cached availability result — localStorage can throw in private mode. */
let storageAvailable: boolean | null = null;

function isStorageAvailable(): boolean {
  if (storageAvailable !== null) {
    return storageAvailable;
  }
  try {
    const probe = "__sky-catcher-probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

/**
 * Validate a raw stored value. External/unsafe source, so guard beyond shape:
 * reject non-numeric, non-finite and negative values.
 */
function parseHighscore(raw: string | null): number {
  if (raw === null) {
    return 0;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

export interface GameStorageService {
  /** Read the persisted highscore (0 when absent, invalid or unavailable). */
  getHighscore(): number;
  /** Persist a highscore value (ignored when invalid or storage is blocked). */
  saveHighscore(score: number): void;
  /** Remove the persisted highscore. */
  clearHighscore(): void;
}

export const gameStorageService: GameStorageService = {
  getHighscore(): number {
    if (!isStorageAvailable()) {
      return 0;
    }
    try {
      return parseHighscore(window.localStorage.getItem(HIGHSCORE_KEY));
    } catch {
      return 0;
    }
  },

  saveHighscore(score: number): void {
    if (!isStorageAvailable() || !Number.isFinite(score) || score < 0) {
      return;
    }
    try {
      window.localStorage.setItem(HIGHSCORE_KEY, String(Math.floor(score)));
    } catch {
      // Non-critical: ignore quota/private-mode write failures.
    }
  },

  clearHighscore(): void {
    if (!isStorageAvailable()) {
      return;
    }
    try {
      window.localStorage.removeItem(HIGHSCORE_KEY);
    } catch {
      // Non-critical: ignore removal failures.
    }
  },
};
