import { describe, it, expect } from "vitest";
import {
  createEmptyTargeting,
  getScreensMatchingRules,
  matchesKeyValue,
  migrateTagsToTargeting,
  ruleMatches,
  type TargetingRule,
} from "./targeting";
import { allScreens } from "./screens";

describe("targeting evaluator", () => {
  const usScreen = allScreens.find((s) => s.country === "United States" && s.zip === "36830")!;
  const caScreen = allScreens.find((s) => s.country === "Canada")!;

  it("matches screen by id", () => {
    expect(matchesKeyValue(usScreen, { key: "screen", value: usScreen.id })).toBe(true);
    expect(matchesKeyValue(usScreen, { key: "screen", value: "scr-999" })).toBe(false);
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

  it("matches any-of conditions within a rule", () => {
    const rule: TargetingRule = {
      id: "2",
      matchType: "any of",
      conditions: [
        { key: "tags", value: "Grocery Chain" },
        { key: "tags", value: "Retail" },
      ],
      exclude: [],
    };
    const grocery = allScreens.find((s) => s.manualTags?.includes("Grocery Chain"))!;
    const retail = allScreens.find((s) => s.manualTags?.includes("Retail"))!;
    const neither = allScreens.find((s) => !s.manualTags?.length)!;
    expect(ruleMatches(grocery, rule)).toBe(true);
    expect(ruleMatches(retail, rule)).toBe(true);
    expect(ruleMatches(neither, rule)).toBe(false);
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

  it("migrates legacy tags to rules", () => {
    const targeting = migrateTagsToTargeting(["Grocery Chain", "Financial Banks · Northeast"]);
    expect(targeting.rules).toHaveLength(2);
    expect(createEmptyTargeting().rules).toHaveLength(1);
  });
});
