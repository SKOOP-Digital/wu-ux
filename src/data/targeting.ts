import { allPlacements, calcCapacityFromRule } from "./placements";
import { allScreens, Screen } from "./screens";
import { getAutoTags, getStateFullName } from "./screenTags";
import { defaultCdmKeys } from "./cdmTags";
import { getScreensNearPOIs, milesToMeters, POI } from "@/services/foursquareService";

export interface KeyValue {
  key: string;
  value: string;
}

export interface TargetingRule {
  id: string;
  matchType: "all of" | "any of";
  conditions: KeyValue[];
  exclude: KeyValue[];
}

export interface TargetingProximity {
  pois: POI[];
  radiusMiles: number;
  activeQuery: string;
}

export interface TargetingRules {
  rules: TargetingRule[];
  globalExclusions: KeyValue[];
  proximity?: TargetingProximity;
}

export const TARGETING_FIELD_LABELS: Record<string, string> = {
  country: "Country",
  state: "State",
  city: "City",
  zip: "Zip",
  tags: "Tags",
  venue_type: "Venue Type",
  network_tier: "Network Tier",
  folder: "Folder",
  placement: "Placement",
  screen: "Screen",
};

export function getTargetingFieldKeys(): string[] {
  const cdmKeys = defaultCdmKeys.map((k) => k.key);
  const base = ["country", "state", "city", "zip", "tags", "venue_type", "network_tier", "folder", "placement", "screen"];
  const seen = new Set(base);
  cdmKeys.forEach((k) => {
    if (!seen.has(k)) {
      seen.add(k);
      base.push(k);
    }
  });
  return base;
}

export function getFieldLabel(key: string): string {
  return TARGETING_FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function createEmptyRule(): TargetingRule {
  return {
    id: crypto.randomUUID(),
    matchType: "all of",
    conditions: [{ key: "country", value: "" }],
    exclude: [],
  };
}

export function createEmptyTargeting(): TargetingRules {
  return { rules: [createEmptyRule()], globalExclusions: [] };
}

export function targetingHasConditions(targeting: TargetingRules): boolean {
  const hasRuleConditions = targeting.rules.some(
    (r) => r.conditions.some((c) => c.value.trim() !== "")
  );
  const hasProximity = (targeting.proximity?.pois?.length ?? 0) > 0;
  return hasRuleConditions || hasProximity;
}

function matchesPlacement(screen: Screen, placementName: string): boolean {
  const placement = allPlacements.find((p) => p.name.toLowerCase() === placementName.toLowerCase());
  if (!placement) return false;
  if (placement.screenIds.length > 0) return placement.screenIds.includes(screen.id);
  return false;
}

function getScreenValuesForKey(screen: Screen, key: string): string[] {
  if (key === "screen") return [screen.id];
  if (key === "country") return screen.country ? [screen.country] : [];
  if (key === "state") {
    const vals: string[] = [];
    if (screen.state) vals.push(screen.state);
    const full = getStateFullName(screen.state || "");
    if (full && full !== screen.state) vals.push(full);
    return vals;
  }
  if (key === "city") return screen.city ? [screen.city] : [];
  if (key === "zip") return screen.zip ? [screen.zip] : [];
  if (key === "tags") return screen.manualTags ?? [];
  if (key === "placement") return [];

  const geo = getAutoTags(screen);
  if (geo && key === "country") return geo.country ? [geo.country] : [];

  // CDM / manual tag keys — values live on manualTags in mock data
  return screen.manualTags ?? [];
}

export function matchesKeyValue(screen: Screen, kv: KeyValue): boolean {
  if (!kv.value.trim()) return false;
  const valLower = kv.value.toLowerCase();

  if (kv.key === "screen") return screen.id === kv.value;
  if (kv.key === "placement") return matchesPlacement(screen, kv.value);

  const screenVals = getScreenValuesForKey(screen, kv.key).map((v) => v.toLowerCase());
  if (screenVals.includes(valLower)) return true;

  // Geo auto-tags for standard geo keys
  const geo = getAutoTags(screen);
  if (geo) {
    const geoMap: Record<string, string[]> = {
      country: [geo.country],
      state: [geo.state, geo.stateFullName].filter(Boolean),
      city: [geo.city],
      zip: [geo.zip],
    };
    const geoVals = (geoMap[kv.key] ?? []).map((v) => v.toLowerCase());
    if (geoVals.includes(valLower)) return true;
  }

  // Placement names matched via tags key (legacy)
  if (kv.key === "tags" && matchesPlacement(screen, kv.value)) return true;

  return false;
}

export function ruleMatches(screen: Screen, rule: TargetingRule): boolean {
  const activeConditions = rule.conditions.filter((c) => c.value.trim() !== "");
  if (activeConditions.length === 0) return false;

  const included =
    rule.matchType === "all of"
      ? activeConditions.every((kv) => matchesKeyValue(screen, kv))
      : activeConditions.some((kv) => matchesKeyValue(screen, kv));

  if (!included) return false;
  return !rule.exclude.some((kv) => kv.value.trim() !== "" && matchesKeyValue(screen, kv));
}

export function getScreensMatchingRules(
  targeting: Pick<TargetingRules, "rules" | "globalExclusions">,
  screens: Screen[] = allScreens
): Screen[] {
  return screens.filter((screen) => {
    const matchesAnyRule = targeting.rules.some((rule) => ruleMatches(screen, rule));
    if (!matchesAnyRule) return false;
    return !targeting.globalExclusions.some(
      (kv) => kv.value.trim() !== "" && matchesKeyValue(screen, kv)
    );
  });
}

export function getScreensMatchingTargeting(targeting: TargetingRules, screens: Screen[] = allScreens): Screen[] {
  const ids = new Set<string>();
  getScreensMatchingRules(targeting, screens).forEach((s) => ids.add(s.id));

  if (targeting.proximity?.pois?.length) {
    getScreensNearPOIs(
      targeting.proximity.pois,
      screens,
      milesToMeters(targeting.proximity.radiusMiles)
    ).forEach((s) => ids.add(s.id));
  }

  return screens.filter((s) => ids.has(s.id));
}

export function countTargetingScreens(targeting: TargetingRules): number {
  return getScreensMatchingTargeting(targeting).length;
}

function inferKeyFromTag(tag: string): string {
  if (allPlacements.some((p) => p.name.toLowerCase() === tag.toLowerCase())) return "placement";
  for (const cdm of defaultCdmKeys) {
    if (cdm.values.some((v) => v.value.toLowerCase() === tag.toLowerCase())) return cdm.key;
  }
  return "tags";
}

/** Migrate legacy flat tag list to OR'd single-condition rules */
export function migrateTagsToTargeting(tags: string[]): TargetingRules {
  if (tags.length === 0) return createEmptyTargeting();
  return {
    rules: tags.map((tag) => ({
      id: crypto.randomUUID(),
      matchType: "any of" as const,
      conditions: [{ key: inferKeyFromTag(tag), value: tag }],
      exclude: [],
    })),
    globalExclusions: [],
  };
}

export function cloneTargeting(targeting: TargetingRules): TargetingRules {
  return {
    rules: targeting.rules.map((r) => ({
      ...r,
      conditions: r.conditions.map((c) => ({ ...c })),
      exclude: r.exclude.map((c) => ({ ...c })),
    })),
    globalExclusions: targeting.globalExclusions.map((c) => ({ ...c })),
    proximity: targeting.proximity
      ? {
          pois: [...targeting.proximity.pois],
          radiusMiles: targeting.proximity.radiusMiles,
          activeQuery: targeting.proximity.activeQuery,
        }
      : undefined,
  };
}

export interface FieldOption {
  value: string;
  label?: string;
}

export function getValueOptionsForField(fieldKey: string): FieldOption[] {
  if (fieldKey === "screen") {
    return allScreens.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.id})`,
    }));
  }

  if (fieldKey === "placement") {
    return allPlacements.map((p) => ({ value: p.name, label: p.name }));
  }

  const cdmKey = defaultCdmKeys.find((k) => k.key === fieldKey);
  if (cdmKey) {
    return cdmKey.values.map((v) => ({ value: v.value }));
  }

  const values = new Set<string>();
  allScreens.forEach((screen) => {
    getScreenValuesForKey(screen, fieldKey).forEach((v) => {
      if (v) values.add(v);
    });
    const geo = getAutoTags(screen);
    if (geo) {
      const geoMap: Record<string, string | undefined> = {
        country: geo.country,
        state: geo.state,
        city: geo.city,
        zip: geo.zip,
      };
      const g = geoMap[fieldKey];
      if (g) values.add(g);
      if (fieldKey === "state" && geo.stateFullName) values.add(geo.stateFullName);
    }
    (screen.manualTags ?? []).forEach((t) => values.add(t));
  });

  return Array.from(values)
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v }));
}

export function formatRuleSummary(rule: TargetingRule, index: number): string {
  const active = rule.conditions.filter((c) => c.value.trim() !== "");
  const condPart =
    active.length === 0
      ? "No conditions"
      : active
          .map((c) => `${getFieldLabel(c.key)}=${c.value}`)
          .join(rule.matchType === "all of" ? " AND " : " OR ");
  const excl = rule.exclude.filter((c) => c.value.trim() !== "");
  const exclPart = excl.length > 0 ? `; exclude ${excl.map((c) => `${getFieldLabel(c.key)}=${c.value}`).join(", ")}` : "";
  return `Rule ${index + 1} (${rule.matchType}): ${condPart}${exclPart}`;
}

export function estimateCapacityFromTargeting(targeting: TargetingRules) {
  let totalScreens = 0;
  let totalAvailable = 0;
  let totalCapacity = 0;

  const allConditions = targeting.rules.flatMap((r) => r.conditions).filter((c) => c.value.trim());
  const processedPlacements = new Set<string>();

  allConditions.forEach((kv) => {
    const pl = allPlacements.find((p) => p.name.toLowerCase() === kv.value.toLowerCase());
    if (pl && (kv.key === "placement" || kv.key === "tags") && !processedPlacements.has(pl.name)) {
      processedPlacements.add(pl.name);
      const cap = calcCapacityFromRule(pl);
      totalScreens += pl.screenCount;
      totalCapacity += cap.total;
      totalAvailable += cap.available;
    }
  });

  const hasNonPlacement =
    allConditions.some(
      (kv) => !allPlacements.some((p) => p.name.toLowerCase() === kv.value.toLowerCase())
    ) || (targeting.proximity?.pois?.length ?? 0) > 0;

  const matchedCount = getScreensMatchingTargeting(targeting).length;

  if (processedPlacements.size === 0) {
    totalScreens = matchedCount;
    totalCapacity = matchedCount * 480;
    totalAvailable = Math.round(matchedCount * 480 * 0.7);
  } else if (hasNonPlacement) {
    totalScreens += matchedCount;
    totalCapacity += matchedCount * 480;
    totalAvailable += Math.round(matchedCount * 480 * 0.7);
  }

  const availablePct = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0;
  return {
    totalScreens,
    totalAvailable,
    totalCapacity,
    availablePct,
    bookedPct: 100 - availablePct,
  };
}

export function formatTargetingSummary(targeting: TargetingRules): string[] {
  const lines = targeting.rules.map((r, i) => formatRuleSummary(r, i));
  const global = targeting.globalExclusions.filter((c) => c.value.trim() !== "");
  if (global.length > 0) {
    lines.push(
      `Global exclude: ${global.map((c) => `${getFieldLabel(c.key)}=${c.value}`).join(", ")}`
    );
  }
  if (targeting.proximity?.pois?.length) {
    lines.push(
      `Proximity: ${targeting.proximity.activeQuery || "POI"} within ${targeting.proximity.radiusMiles} mi`
    );
  }
  return lines;
}
