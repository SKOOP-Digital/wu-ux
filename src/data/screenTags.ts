import { allScreens, Screen } from "./screens";

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

/** Returns all unique tags across all screens with type and screen count */
export function getAllScreenTags(): ScreenTag[] {
  const tagMap = new Map<string, ScreenTag>();

  allScreens.forEach((screen) => {
    const geo = getAutoTags(screen);
    if (geo) {
      // Include both abbreviation and full name for state
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
      const geoValues = [geo.country, geo.state, geo.stateFullName, geo.city, geo.zip].filter(Boolean);
      if (geoValues.some((v) => tagSet.has(v.toLowerCase()))) return true;
    }
    if (screen.manualTags?.some((t) => tagSet.has(t.toLowerCase()))) return true;
    return false;
  });
}
