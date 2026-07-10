import { describe, it, expect } from "vitest";
import {
  createEmptyTargeting,
  getScreensMatchingRules,
  getScreensMatchingTargeting,
  matchesKeyValue,
  migrateTagsToTargeting,
  ruleMatches,
  type TargetingRule,
} from "./targeting";
import { allScreens } from "./screens";
import { screenCdmTagsById } from "./screenCdmTags";

describe("targeting evaluator", () => {
  const taggedScreen = allScreens.find((s) => screenCdmTagsById[s.id]?.region === "East")!;
  const westScreen = allScreens.find((s) => screenCdmTagsById[s.id]?.region === "West")!;
  const usScreen = allScreens.find((s) => s.country === "United States" && s.zip === "36830")!;
  const caScreen = allScreens.find((s) => s.country === "Canada")!;

  it("matches screen by id", () => {
    expect(matchesKeyValue(usScreen, { key: "screen", value: usScreen.id })).toBe(true);
    expect(matchesKeyValue(usScreen, { key: "screen", value: "scr-999" })).toBe(false);
  });

  it("matches CDM region tag from devices list", () => {
    expect(matchesKeyValue(taggedScreen, { key: "region", value: "East" })).toBe(true);
    expect(matchesKeyValue(westScreen, { key: "region", value: "East" })).toBe(false);
  });

  it("matches CDM brand and semicolon-delimited bundle values", () => {
    const wuScreen = allScreens.find((s) => screenCdmTagsById[s.id]?.brand === "WU")!;
    expect(matchesKeyValue(wuScreen, { key: "brand", value: "WU" })).toBe(true);

    const bundleScreen = allScreens.find((s) => {
      const b = screenCdmTagsById[s.id]?.bundle;
      return typeof b === "string" && b.includes("Disney-Hispanic");
    });
    if (bundleScreen) {
      expect(matchesKeyValue(bundleScreen, { key: "bundle", value: "Disney-Hispanic" })).toBe(true);
    }
  });

  it("matches country and zip with all-of rule", () => {
    const rule: TargetingRule = {
      id: "1",
      matchType: "all of",
      conditions: [
        { key: "country", value: "United States" },
        { key: "zip", value: "36830" },
      ],
      exclude: [],
    };
    expect(ruleMatches(usScreen, rule)).toBe(true);
    expect(ruleMatches(caScreen, rule)).toBe(false);
  });

  it("matches any-of CDM conditions within a rule", () => {
    const rule: TargetingRule = {
      id: "2",
      matchType: "any of",
      conditions: [
        { key: "region", value: "East" },
        { key: "region", value: "West" },
      ],
      exclude: [],
    };
    expect(ruleMatches(taggedScreen, rule)).toBe(true);
    expect(ruleMatches(westScreen, rule)).toBe(true);
  });

  it("applies scoped exclusions within a rule", () => {
    const rule: TargetingRule = {
      id: "3",
      matchType: "all of",
      conditions: [{ key: "country", value: "United States" }],
      exclude: [{ key: "zip", value: usScreen.zip! }],
    };
    expect(ruleMatches(usScreen, rule)).toBe(false);
  });

  it("applies global exclusions across rules", () => {
    const targeting = {
      rules: [
        {
          id: "4",
          matchType: "any of",
          conditions: [{ key: "country", value: "United States" }],
          exclude: [],
        },
      ],
      globalExclusions: [{ key: "screen", value: usScreen.id }],
    };
    const matched = getScreensMatchingRules(targeting);
    expect(matched.some((s) => s.id === usScreen.id)).toBe(false);
    expect(matched.some((s) => s.country === "United States")).toBe(true);
  });

  it("migrates legacy placement names to placement key rules", () => {
    const targeting = migrateTagsToTargeting(["Financial Banks · Northeast"]);
    expect(targeting.rules).toHaveLength(1);
    expect(targeting.rules[0].conditions[0].key).toBe("placement");
    expect(createEmptyTargeting().rules).toHaveLength(1);
    expect(createEmptyTargeting().rules[0].conditions[0].key).toBe("region");
  });

  it("counts screens for a realistic CDM targeting rule", () => {
    const targeting = {
      rules: [
        {
          id: "5",
          matchType: "all of" as const,
          conditions: [{ key: "brand", value: "WU" }],
          exclude: [],
        },
      ],
      globalExclusions: [],
    };
    const matched = getScreensMatchingTargeting(targeting);
    expect(matched.length).toBeGreaterThan(0);
    expect(matched.every((s) => screenCdmTagsById[s.id]?.brand?.toString().includes("WU"))).toBe(true);
  });
});
