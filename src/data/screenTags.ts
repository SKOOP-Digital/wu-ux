import { allScreens, Screen } from "./screens";

export interface GeoTags {
  country: string;
  state: string;
  city: string;
  zip: string;
}

export interface ScreenTag {
  value: string;
  type: "auto" | "manual";
  category?: string;
  screenCount: number;
}

export const STANDARD_VENUE_TAGS = ["Indoor", "Outdoor"];

export function getAutoTags(screen: Screen): GeoTags | null {
  if (!screen.city && !screen.state && !screen.zip && !screen.country) return null;
  return {
    country: screen.country || "",
    state: screen.state || "",
    city: screen.city || "",
    zip: screen.zip || "",
  };
}

export function getScreenAllTags(screen: Screen): { auto: GeoTags | null; manual: string[] } {
  return {
    auto: getAutoTags(screen),
    manual: screen.manualTags || [],
  };
}

/** Returns all unique tags across all screens with type and screen count */
export function getAllScreenTags(): ScreenTag[] {
  const tagMap = new Map<string, ScreenTag>();

  allScreens.forEach((screen) => {
    const geo = getAutoTags(screen);
    if (geo) {
      const geoEntries: [string, string][] = [
        [geo.country, "Country"],
        [geo.state, "State"],
        [geo.city, "City"],
        [geo.zip, "ZIP"],
      ];
      geoEntries.forEach(([value, category]) => {
        if (!value) return;
        const existing = tagMap.get(value);
        if (existing) {
          existing.screenCount++;
        } else {
          tagMap.set(value, { value, type: "auto", category, screenCount: 1 });
        }
      });
    }

    (screen.manualTags || []).forEach((tag) => {
      const existing = tagMap.get(tag);
      if (existing) {
        existing.screenCount++;
      } else {
        tagMap.set(tag, { value: tag, type: "manual", screenCount: 1 });
      }
    });
  });

  const categoryOrder = ["Country", "State", "City", "ZIP"];
  return Array.from(tagMap.values()).sort((a, b) => {
    if (a.type !== b.type) return a.type === "auto" ? -1 : 1;
    if (a.type === "auto" && b.type === "auto") {
      return categoryOrder.indexOf(a.category || "") - categoryOrder.indexOf(b.category || "");
    }
    return a.value.localeCompare(b.value);
  });
}

/** Returns screens that match ANY of the given tag values (auto or manual) */
export function getScreensMatchingTags(tags: string[]): Screen[] {
  if (tags.length === 0) return [];
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  return allScreens.filter((screen) => {
    const geo = getAutoTags(screen);
    if (geo) {
      const geoValues = [geo.country, geo.state, geo.city, geo.zip].filter(Boolean);
      if (geoValues.some((v) => tagSet.has(v.toLowerCase()))) return true;
    }
    if (screen.manualTags?.some((t) => tagSet.has(t.toLowerCase()))) return true;
    return false;
  });
}
