import { Screen } from "@/data/screens";

export interface POI {
  fsq_id: string;
  name: string;
  location: {
    address?: string;
    lat: number;
    lng: number;
  };
  categories: { name: string }[];
}

import { supabase } from "@/integrations/supabase/client";

// In-memory cache keyed by query + search centers + radius
const poiCache = new Map<string, POI[]>();

const SEARCH_CELL_DEGREES = 2;
const MIN_SCREENS_PER_CELL = 15;
const MAX_SEARCH_CENTERS = 8;
const SEARCH_LIMIT_PER_CENTER = 25;

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function mapPOIResult(r: any): POI {
  return {
    fsq_id: r.fsq_place_id || r.fsq_id,
    name: r.name,
    location: {
      address: r.location?.formatted_address || r.location?.address,
      lat: r.location?.lat ?? r.latitude ?? r.geocodes?.main?.latitude ?? 0,
      lng: r.location?.lng ?? r.longitude ?? r.geocodes?.main?.longitude ?? 0,
    },
    categories: (r.categories || []).map((c: any) => ({ name: c.name })),
  };
}

const MILES_TO_METERS: Record<string, number> = {
  "0.25": 402.336,
  "0.5": 804.672,
  "1": 1609.34,
  "2": 3218.69,
  "5": 8046.72,
};

export function milesToMeters(miles: number): number {
  return MILES_TO_METERS[String(miles)] ?? miles * 1609.34;
}

export function getRegionalSearchCenters(screens: Screen[]): string[] {
  const withCoords = screens.filter(
    (screen): screen is Screen & { lat: number; lng: number } =>
      typeof screen.lat === "number" && typeof screen.lng === "number"
  );

  if (withCoords.length === 0) {
    return ["0,0"];
  }

  const buckets = new Map<string, { count: number; latSum: number; lngSum: number }>();

  withCoords.forEach((screen) => {
    const key = `${Math.round(screen.lat / SEARCH_CELL_DEGREES)}:${Math.round(screen.lng / SEARCH_CELL_DEGREES)}`;
    const current = buckets.get(key) || { count: 0, latSum: 0, lngSum: 0 };
    buckets.set(key, {
      count: current.count + 1,
      latSum: current.latSum + screen.lat,
      lngSum: current.lngSum + screen.lng,
    });
  });

  const centers = Array.from(buckets.values())
    .filter((bucket) => bucket.count >= MIN_SCREENS_PER_CELL)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SEARCH_CENTERS)
    .map((bucket) => `${bucket.latSum / bucket.count},${bucket.lngSum / bucket.count}`);

  return centers.length > 0 ? centers : [getDefaultCenter(screens)];
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchPOIs(
  query: string,
  searchCenters: string[],
  radiusMeters: number
): Promise<POI[]> {
  const centers = searchCenters.length > 0 ? searchCenters : ["0,0"];
  const cacheKey = `${query}|${centers.join(";")}|${radiusMeters}`;
  if (poiCache.has(cacheKey)) return poiCache.get(cacheKey)!;

  const responses = await Promise.all(
    centers.map((ll) =>
      supabase.functions.invoke("foursquare-proxy", {
        body: {
          query,
          ll,
          radius: String(Math.min(Math.round(radiusMeters), 100000)),
          limit: String(SEARCH_LIMIT_PER_CENTER),
        },
      })
    )
  );

  const dedupedPOIs = new Map<string, POI>();

  responses.forEach(({ data, error }) => {
    if (error) {
      console.error("POI proxy error:", error);
      return;
    }

    ((data?.results as any[]) || []).forEach((result) => {
      const poi = mapPOIResult(result);
      if (poi.fsq_id && poi.location.lat && poi.location.lng) {
        dedupedPOIs.set(poi.fsq_id, poi);
      }
    });
  });

  const pois = Array.from(dedupedPOIs.values());
  poiCache.set(cacheKey, pois);
  return pois;
}

export function getScreensNearPOIs(
  pois: POI[],
  screens: Screen[],
  radiusMeters: number
): Screen[] {
  if (pois.length === 0) return [];
  const matched = new Set<string>();
  const result: Screen[] = [];

  for (const screen of screens) {
    if (!screen.lat || !screen.lng) continue;
    for (const poi of pois) {
      if (!poi.location.lat || !poi.location.lng) continue;
      const dist = haversineDistance(
        screen.lat,
        screen.lng,
        poi.location.lat,
        poi.location.lng
      );
      if (dist <= radiusMeters && !matched.has(screen.id)) {
        matched.add(screen.id);
        result.push(screen);
        break;
      }
    }
  }

  return result;
}

export interface POISuggestion {
  name: string;
  type: string;
}

const suggestCache = new Map<string, POISuggestion[]>();

export async function suggestPOIs(
  query: string,
  screens: Screen[]
): Promise<POISuggestion[]> {
  const key = query.toLowerCase();
  if (suggestCache.has(key)) return suggestCache.get(key)!;

  // Use the single largest cluster center for fast suggestions
  const centers = getRegionalSearchCenters(screens);
  const ll = centers[0] || "0,0";

  const { data, error } = await supabase.functions.invoke("foursquare-proxy", {
    body: {
      query,
      ll,
      radius: "100000",
      limit: "40",
    },
  });

  if (error || !data?.results) {
    return [];
  }

  // Deduplicate by name (case-insensitive), count frequency, keep category
  const nameMap = new Map<string, { name: string; type: string; count: number }>();
  for (const r of data.results as any[]) {
    const name = r.name?.trim();
    if (!name) continue;
    const normKey = name.toLowerCase();
    const type =
      r.categories?.[0]?.name ||
      r.type ||
      r.class ||
      "";
    const existing = nameMap.get(normKey);
    if (existing) {
      existing.count++;
    } else {
      nameMap.set(normKey, { name, type, count: 1 });
    }
  }

  const suggestions = Array.from(nameMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ name, type }) => ({ name, type }));

  suggestCache.set(key, suggestions);
  return suggestions;
}

export function getDefaultCenter(screens: Screen[]): string {
  const withCoords = screens.filter((s) => s.lat && s.lng);
  if (withCoords.length === 0) return "0,0";
  const avgLat = withCoords.reduce((sum, s) => sum + s.lat!, 0) / withCoords.length;
  const avgLng = withCoords.reduce((sum, s) => sum + s.lng!, 0) / withCoords.length;
  return `${avgLat},${avgLng}`;
}
