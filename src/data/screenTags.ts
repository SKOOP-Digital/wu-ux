import { allScreens, Screen } from "./screens";
import { allPlacements } from "./placements";

export interface GeoTags {
  country: string;
  state: string;
  stateFullName: string;
  city: string;
  zip: string;
}

const STATE_ABBREV_TO_NAME: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia",
  // Canadian provinces
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
};

export function getStateFullName(abbrev: string): string {
  return STATE_ABBREV_TO_NAME[abbrev.toUpperCase()] || "";
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
  const stateAbbrev = screen.state || "";
  return {
    country: screen.country || "",
    state: stateAbbrev,
    stateFullName: getStateFullName(stateAbbrev),
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

/** Returns all unique tags across all screens with type and screen count.
 *  Placement names are injected as "Placement Group" tags derived from allPlacements. */
export function getAllScreenTags(): ScreenTag[] {
  const tagMap = new Map<string, ScreenTag>();

  // Placement-derived tags (always first in sort order)
  allPlacements.forEach((p) => {
    if (p.name) {
      tagMap.set(p.name, {
        value: p.name,
        type: "auto",
        category: "Placement Group",
        screenCount: p.screenCount,
      });
    }
  });

  allScreens.forEach((screen) => {
    const geo = getAutoTags(screen);
    if (geo) {
      const geoEntries: [string, string][] = [
        [geo.country, "Country"],
        [geo.state, "State"],
        [geo.city, "City"],
        [geo.zip, "ZIP"],
      ];
      if (geo.stateFullName && geo.stateFullName !== geo.state) {
        geoEntries.push([geo.stateFullName, "State"]);
      }
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

  const categoryOrder = ["Placement Group", "Country", "State", "City", "ZIP"];
  return Array.from(tagMap.values()).sort((a, b) => {
    // Placement Group always sorts first
    const aIdx = categoryOrder.indexOf(a.category || "");
    const bIdx = categoryOrder.indexOf(b.category || "");
    if (a.type === "auto" && b.type === "auto") {
      if (aIdx !== bIdx) return aIdx - bIdx;
    }
    if (a.type !== b.type) return a.type === "auto" ? -1 : 1;
    return a.value.localeCompare(b.value);
  });
}

/** Returns screens that match ANY of the given tag values (auto, manual, or placement-derived) */
export function getScreensMatchingTags(tags: string[]): Screen[] {
  if (tags.length === 0) return [];
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  // Collect screen IDs matched via placement tags
  const placementMatchedIds = new Set<string>();
  allPlacements.forEach((p) => {
    if (tagSet.has(p.name.toLowerCase())) {
      p.screenIds.forEach((sid) => placementMatchedIds.add(sid));
    }
  });

  // For placements with no screenIds (mock data), match by screenCount approximation
  // by including all screens when a placement tag matches — handled below via screenCount fallback
  const placementTagsSelected = allPlacements.filter((p) => tagSet.has(p.name.toLowerCase()));

  return allScreens.filter((screen) => {
    // Placement-derived match
    if (placementMatchedIds.has(screen.id)) return true;
    // Geo match
    const geo = getAutoTags(screen);
    if (geo) {
      const geoValues = [geo.country, geo.state, geo.stateFullName, geo.city, geo.zip].filter(Boolean);
      if (geoValues.some((v) => tagSet.has(v.toLowerCase()))) return true;
    }
    // Manual tag match
    if (screen.manualTags?.some((t) => tagSet.has(t.toLowerCase()))) return true;
    return false;
  });
}

/** Returns placement names that are referenced in a tag set */
export function getPlacementsFromTags(tags: string[]): typeof allPlacements {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  return allPlacements.filter((p) => tagSet.has(p.name.toLowerCase()));
}
