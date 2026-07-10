import { useMemo, useState } from "react";
import { Plus, Trash2, MapPin, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import POIAutocomplete from "@/components/shared/POIAutocomplete";
import { allScreens } from "@/data/screens";
import {
  cloneTargeting,
  countTargetingScreens,
  createEmptyRule,
  getFieldLabel,
  getTargetingFieldKeys,
  getValueOptionsForField,
  type KeyValue,
  type TargetingRules,
} from "@/data/targeting";
import { searchPOIs, getRegionalSearchCenters, getScreensNearPOIs, milesToMeters } from "@/services/foursquareService";

interface TargetingRuleBuilderProps {
  value: TargetingRules;
  onChange: (targeting: TargetingRules) => void;
}

function KeyValueRow({
  kv,
  onChange,
  onRemove,
  showRemove,
}: {
  kv: KeyValue;
  onChange: (kv: KeyValue) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const fieldKeys = getTargetingFieldKeys();
  const valueOptions = useMemo(() => getValueOptionsForField(kv.key), [kv.key]);
  const [screenSearch, setScreenSearch] = useState("");

  const filteredScreens = useMemo(() => {
    if (kv.key !== "screen") return [];
    const q = screenSearch.toLowerCase();
    return allScreens
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.city?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 20);
  }, [kv.key, screenSearch]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs min-w-[120px]"
        value={kv.key}
        onChange={(e) => onChange({ key: e.target.value, value: "" })}
      >
        {fieldKeys.map((k) => (
          <option key={k} value={k}>
            {getFieldLabel(k)}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">=</span>
      {kv.key === "screen" ? (
        <div className="flex-1 min-w-[200px] relative">
          <Input
            className="text-xs h-9"
            placeholder="Search screens by name or ID..."
            value={kv.value ? (allScreens.find((s) => s.id === kv.value)?.name ?? kv.value) : screenSearch}
            onChange={(e) => {
              setScreenSearch(e.target.value);
              if (!e.target.value) onChange({ ...kv, value: "" });
            }}
            onFocus={() => {
              if (kv.value) setScreenSearch("");
            }}
          />
          {screenSearch && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-background shadow-md">
              {filteredScreens.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted"
                  onClick={() => {
                    onChange({ ...kv, value: s.id });
                    setScreenSearch("");
                  }}
                >
                  {s.name} <span className="text-muted-foreground">({s.id})</span>
                </button>
              ))}
              {filteredScreens.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">No screens found</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <select
          className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs flex-1 min-w-[160px]"
          value={kv.value}
          onChange={(e) => onChange({ ...kv, value: e.target.value })}
        >
          <option value="">Select value...</option>
          {valueOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label ?? opt.value}
            </option>
          ))}
        </select>
      )}
      {showRemove && (
        <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive p-1">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function TargetingRuleBuilder({ value, onChange }: TargetingRuleBuilderProps) {
  const [poiSearch, setPoiSearch] = useState("");
  const [poiLoading, setPoiLoading] = useState(false);

  const matchedCount = useMemo(() => countTargetingScreens(value), [value]);

  const proximityMatchedCount = useMemo(() => {
    if (!value.proximity?.pois?.length) return 0;
    return getScreensNearPOIs(
      value.proximity.pois,
      allScreens,
      milesToMeters(value.proximity.radiusMiles)
    ).length;
  }, [value.proximity]);

  const update = (patch: Partial<TargetingRules>) => onChange({ ...cloneTargeting(value), ...patch });

  const updateRule = (ruleId: string, patch: Partial<TargetingRules["rules"][0]>) => {
    update({
      rules: value.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
    });
  };

  const addRule = () => update({ rules: [...value.rules, createEmptyRule()] });

  const removeRule = (ruleId: string) => {
    if (value.rules.length <= 1) return;
    update({ rules: value.rules.filter((r) => r.id !== ruleId) });
  };

  const handlePoiSearch = async (queryOverride?: string) => {
    const query = queryOverride || poiSearch.trim();
    if (!query) return;
    setPoiLoading(true);
    try {
      const results = await searchPOIs(query, getRegionalSearchCenters(allScreens), 100000);
      update({
        proximity: {
          pois: results,
          radiusMiles: value.proximity?.radiusMiles ?? 1,
          activeQuery: query,
        },
      });
    } catch {
      /* ignore */
    } finally {
      setPoiLoading(false);
    }
  };

  const clearProximity = () => update({ proximity: undefined });

  const addKeyValue = (list: KeyValue[]) => [...list, { key: "region", value: "" }];

  return (
    <div className="space-y-5">
      {value.rules.map((rule, ruleIndex) => (
        <div key={rule.id}>
          {ruleIndex > 0 && (
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OR</span>
              <div className="flex-1 border-t border-border" />
            </div>
          )}
          <div className="skoop-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">Rule {ruleIndex + 1}</p>
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, { matchType: "all of" })}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      rule.matchType === "all of"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All of
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, { matchType: "any of" })}
                    className={`px-3 py-1.5 font-medium border-l border-border transition-colors ${
                      rule.matchType === "any of"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Any of
                  </button>
                </div>
              </div>
              {value.rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove rule"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Match {rule.matchType}
              </p>
              {rule.conditions.map((kv, i) => (
                <KeyValueRow
                  key={`${rule.id}-cond-${i}`}
                  kv={kv}
                  onChange={(next) => {
                    const conditions = [...rule.conditions];
                    conditions[i] = next;
                    updateRule(rule.id, { conditions });
                  }}
                  onRemove={() => {
                    const conditions = rule.conditions.filter((_, idx) => idx !== i);
                    updateRule(rule.id, {
                      conditions: conditions.length > 0 ? conditions : [{ key: "region", value: "" }],
                    });
                  }}
                  showRemove={rule.conditions.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => updateRule(rule.id, { conditions: addKeyValue(rule.conditions) })}
              >
                <Plus size={12} className="mr-1" /> Add condition
              </Button>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Exclude if any of
              </p>
              {rule.exclude.length === 0 ? (
                <p className="text-xs text-muted-foreground">No exclusions for this rule.</p>
              ) : (
                rule.exclude.map((kv, i) => (
                  <KeyValueRow
                    key={`${rule.id}-excl-${i}`}
                    kv={kv}
                    onChange={(next) => {
                      const exclude = [...rule.exclude];
                      exclude[i] = next;
                      updateRule(rule.id, { exclude });
                    }}
                    onRemove={() => updateRule(rule.id, { exclude: rule.exclude.filter((_, idx) => idx !== i) })}
                    showRemove
                  />
                ))
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => updateRule(rule.id, { exclude: addKeyValue(rule.exclude) })}
              >
                <Plus size={12} className="mr-1" /> Add exclusion
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRule} className="text-xs">
        <Plus size={14} className="mr-1" /> Add Rule (OR)
      </Button>

      <div className="skoop-card p-5 space-y-3">
        <p className="skoop-section-header">Global Exclusions</p>
        <p className="text-xs text-muted-foreground">Applied on top of every rule above.</p>
        {value.globalExclusions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No global exclusions.</p>
        ) : (
          value.globalExclusions.map((kv, i) => (
            <KeyValueRow
              key={`global-excl-${i}`}
              kv={kv}
              onChange={(next) => {
                const globalExclusions = [...value.globalExclusions];
                globalExclusions[i] = next;
                update({ globalExclusions });
              }}
              onRemove={() => update({ globalExclusions: value.globalExclusions.filter((_, idx) => idx !== i) })}
              showRemove
            />
          ))
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={() => update({ globalExclusions: addKeyValue(value.globalExclusions) })}
        >
          <Plus size={12} className="mr-1" /> Add global exclusion
        </Button>
      </div>

      <div className="skoop-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted-foreground" />
          <p className="skoop-section-header">Target by Proximity</p>
        </div>
        <p className="text-xs text-muted-foreground">Optional — unioned with rule matches above.</p>

        {value.proximity?.pois?.length ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {proximityMatchedCount} screen{proximityMatchedCount !== 1 ? "s" : ""} within{" "}
              {value.proximity.radiusMiles} mi of {value.proximity.activeQuery}
            </p>
            <Button variant="ghost" size="sm" onClick={clearProximity} className="text-xs h-7">
              <X size={12} className="mr-1" /> Clear
            </Button>
          </div>
        ) : null}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Search POI</label>
            <POIAutocomplete
              value={poiSearch}
              onChange={setPoiSearch}
              onSelect={(name) => {
                setPoiSearch(name);
                handlePoiSearch(name);
              }}
              placeholder="e.g. Walmart, Family Dollar, CVS..."
              className="text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Radius</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={value.proximity?.radiusMiles ?? 1}
              onChange={(e) =>
                update({
                  proximity: {
                    pois: value.proximity?.pois ?? [],
                    radiusMiles: Number(e.target.value),
                    activeQuery: value.proximity?.activeQuery ?? "",
                  },
                })
              }
            >
              <option value={0.25}>0.25 mi</option>
              <option value={0.5}>0.5 mi</option>
              <option value={1}>1 mi</option>
              <option value={2}>2 mi</option>
              <option value={5}>5 mi</option>
            </select>
          </div>
          <Button size="sm" onClick={() => handlePoiSearch()} disabled={poiLoading}>
            {poiLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-md px-3 py-2">
        <Info size={12} className="text-primary shrink-0" />
        <p className="text-xs text-foreground font-medium tabular-nums">
          ≈ {matchedCount.toLocaleString()} screen{matchedCount !== 1 ? "s" : ""} match this targeting
        </p>
      </div>
    </div>
  );
}
