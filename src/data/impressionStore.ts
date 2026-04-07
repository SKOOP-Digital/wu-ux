import { allScreens } from "./screens";

interface ImpressionEntry {
  multiplier: number;
  updatedAt: Date;
}

const store = new Map<string, ImpressionEntry>();
let lastImportTime: Date | null = null;

export function getImpressionMultiplier(screenId: string): number | null {
  const entry = store.get(screenId);
  return entry ? entry.multiplier : null;
}

export function getImpressionEntry(screenId: string): ImpressionEntry | null {
  return store.get(screenId) || null;
}

export function setImpressionMultiplier(screenId: string, value: number): void {
  store.set(screenId, { multiplier: value, updatedAt: new Date() });
}

export function bulkSetImpressions(entries: { screenId: string; multiplier: number }[]): number {
  let updated = 0;
  const now = new Date();
  entries.forEach(({ screenId, multiplier }) => {
    store.set(screenId, { multiplier, updatedAt: now });
    updated++;
  });
  lastImportTime = now;
  return updated;
}

export function hasAnyImpressionData(): boolean {
  return store.size > 0;
}

export function getLastImportTime(): Date | null {
  return lastImportTime;
}

export function getAllImpressionData(): Map<string, ImpressionEntry> {
  return store;
}

/** Load impressionsPerPlay from screen data into the store on boot */
export function initFromScreenData(): void {
  const now = new Date();
  allScreens.forEach((screen) => {
    if (screen.impressionsPerPlay != null && screen.impressionsPerPlay > 0) {
      if (!store.has(screen.id)) {
        store.set(screen.id, { multiplier: screen.impressionsPerPlay, updatedAt: now });
      }
    }
  });
}
