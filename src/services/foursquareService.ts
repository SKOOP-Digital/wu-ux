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

// In-memory cache keyed by "query|ll|radius"
const poiCache = new Map<string, POI[]>();

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

export async function searchPOIs(
  query: string,
  ll: string,
  radiusMeters: number
): Promise<POI[]> {
  const cacheKey = `${query}|${ll}|${radiusMeters}`;
  if (poiCache.has(cacheKey)) return poiCache.get(cacheKey)!;

  const apiKey = import.meta.env.VITE_FOURSQUARE_API_KEY;
  if (!apiKey) {
    console.warn("VITE_FOURSQUARE_API_KEY not set — returning empty results");
    return [];
  }

  const params = new URLSearchParams({
    query,
    ll,
    radius: String(Math.min(Math.round(radiusMeters), 100000)),
    limit: "50",
  });

  const res = await fetch(
    `/fsq-proxy/places/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "X-Places-Api-Version": "2025-06-17",
      },
    }
  );

  if (!res.ok) {
    console.error(`Foursquare API error: ${res.status}`);
    return [];
  }

  const data = await res.json();
  const pois: POI[] = (data.results || []).map((r: any) => ({
    fsq_id: r.fsq_place_id || r.fsq_id,
    name: r.name,
    location: {
      address: r.location?.formatted_address || r.location?.address,
      lat: r.latitude ?? r.geocodes?.main?.latitude ?? 0,
      lng: r.longitude ?? r.geocodes?.main?.longitude ?? 0,
    },
    categories: (r.categories || []).map((c: any) => ({ name: c.name })),
  }));

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

export function getDefaultCenter(screens: Screen[]): string {
  const withCoords = screens.filter((s) => s.lat && s.lng);
  if (withCoords.length === 0) return "0,0";
  const avgLat = withCoords.reduce((sum, s) => sum + s.lat!, 0) / withCoords.length;
  const avgLng = withCoords.reduce((sum, s) => sum + s.lng!, 0) / withCoords.length;
  return `${avgLat},${avgLng}`;
}
