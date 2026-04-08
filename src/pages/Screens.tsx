import { useState, useMemo, useCallback } from "react";
import { Monitor, Search, X, MapPin, Globe, Tag, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { allScreens, Screen } from "@/data/screens";
import { allPlacements } from "@/data/placements";
import { getAutoTags, getScreenAllTags } from "@/data/screenTags";
import {
  searchPOIs,
  getScreensNearPOIs,
  getRegionalSearchCenters,
  milesToMeters,
  POI,
} from "@/services/foursquareService";
import POIAutocomplete from "@/components/shared/POIAutocomplete";

const RADIUS_OPTIONS = [
  { label: "0.25 mi", value: 0.25 },
  { label: "0.5 mi", value: 0.5 },
  { label: "1 mi", value: 1 },
  { label: "2 mi", value: 2 },
  { label: "5 mi", value: 5 },
];

export default function Screens() {
  const navigate = useNavigate();

  // Search state
  const [searchText, setSearchText] = useState("");
  const [matchMode, setMatchMode] = useState<"any" | "all">("any");

  // Proximity state
  const [showProximity, setShowProximity] = useState(false);
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
  const [proximityRadius, setProximityRadius] = useState(1);
  const [poiLoading, setPoiLoading] = useState(false);
  const [poiSearched, setPoiSearched] = useState(false);
  const [activePoiQuery, setActivePoiQuery] = useState("");

  const hasFilters = searchText.trim().length > 0 || selectedPOIs.length > 0;

  // Get all tags for a screen (for text matching)
  const getScreenTagValues = useCallback((screen: Screen): string[] => {
    const tags: string[] = [];
    const auto = getAutoTags(screen);
    if (auto) {
      tags.push(auto.country, auto.state, auto.city, auto.zip);
    }
    if (screen.manualTags) tags.push(...screen.manualTags);
    return tags;
  }, []);

  // Text-filtered screens
  const textFilteredScreens = useMemo(() => {
    if (!searchText.trim()) return null; // null means "no text filter"
    const terms = searchText
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return allScreens.filter((s) => {
      const searchable = [
        s.name,
        s.id,
        s.venue,
        ...getScreenTagValues(s),
      ].map((v) => v.toLowerCase());

      if (matchMode === "all") {
        return terms.every((term) =>
          searchable.some((field) => field.includes(term))
        );
      }
      return terms.some((term) =>
        searchable.some((field) => field.includes(term))
      );
    });
  }, [searchText, matchMode, getScreenTagValues]);

  // Proximity-filtered screens
  const proximityFilteredScreens = useMemo(() => {
    if (selectedPOIs.length === 0) return null;
    return getScreensNearPOIs(
      selectedPOIs,
      allScreens,
      milesToMeters(proximityRadius)
    );
  }, [selectedPOIs, proximityRadius]);

  // Combined filtered results
  const filteredScreens = useMemo(() => {
    if (!textFilteredScreens && !proximityFilteredScreens) return allScreens;
    if (textFilteredScreens && !proximityFilteredScreens) return textFilteredScreens;
    if (!textFilteredScreens && proximityFilteredScreens) return proximityFilteredScreens;

    // Both active
    const textIds = new Set(textFilteredScreens!.map((s) => s.id));
    const proxIds = new Set(proximityFilteredScreens!.map((s) => s.id));

    if (matchMode === "all") {
      // Intersect
      return allScreens.filter((s) => textIds.has(s.id) && proxIds.has(s.id));
    }
    // Union
    const unionIds = new Set([...textIds, ...proxIds]);
    return allScreens.filter((s) => unionIds.has(s.id));
  }, [textFilteredScreens, proximityFilteredScreens, matchMode]);

  // Tag breakdown for sidebar
  const tagBreakdown = useMemo(() => {
    if (!hasFilters) return [];
    const counts = new Map<string, { count: number; type: "auto" | "manual" | "proximity" }>();
    filteredScreens.forEach((s) => {
      const auto = getAutoTags(s);
      if (auto) {
        [auto.country, auto.state, auto.city, auto.zip].forEach((v) => {
          counts.set(v, { count: (counts.get(v)?.count || 0) + 1, type: "auto" });
        });
      }
      (s.manualTags || []).forEach((t) => {
        counts.set(t, { count: (counts.get(t)?.count || 0) + 1, type: "manual" });
      });
    });
    // Add proximity tag for screens matched by POIs
    if (proximityFilteredScreens && proximityFilteredScreens.length > 0) {
      selectedPOIs.forEach((poi) => {
        const key = `Near ${poi.name}`;
        const nearCount = getScreensNearPOIs([poi], filteredScreens, milesToMeters(proximityRadius)).length;
        if (nearCount > 0) {
          counts.set(key, { count: nearCount, type: "proximity" });
        }
      });
    }
    return Array.from(counts.entries())
      .map(([value, { count, type }]) => ({ value, count, type }))
      .sort((a, b) => b.count - a.count);
  }, [hasFilters, filteredScreens, proximityFilteredScreens, selectedPOIs, proximityRadius]);

  const handlePoiSearch = async (queryOverride?: string) => {
    const query = queryOverride || poiSearchQuery.trim();
    if (!query) return;
    setPoiLoading(true);
    setPoiSearched(false);
    try {
      const searchCenters = getRegionalSearchCenters(allScreens);
      const results = await searchPOIs(
        query,
        searchCenters,
        100000
      );
      setSelectedPOIs(results);
      setActivePoiQuery(query);
      setPoiSearched(true);
    } catch (err) {
      console.error("POI search error:", err);
    } finally {
      setPoiLoading(false);
    }
  };

  const clearProximityFilter = () => {
    setSelectedPOIs([]);
    setActivePoiQuery("");
    setPoiSearchQuery("");
    setPoiSearched(false);
  };


  const addSearchTerm = (term: string) => {
    const current = searchText.trim();
    if (current.toLowerCase().includes(term.toLowerCase())) return;
    setSearchText(current ? `${current} ${term}` : term);
  };

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { label: string; type: "text" | "poi"; onRemove: () => void }[] = [];
    if (searchText.trim()) {
      chips.push({
        label: `"${searchText.trim()}"`,
        type: "text",
        onRemove: () => setSearchText(""),
      });
    }
    if (activePoiQuery) {
      chips.push({
        label: `Within ${proximityRadius} mi of ${activePoiQuery}`,
        type: "poi",
        onRemove: clearProximityFilter,
      });
    }
    return chips;
  }, [searchText, activePoiQuery, proximityRadius]);

  return (
    <div>
      <PageHeader
        title="Screens"
        subtitle="Physical playback endpoints across your network"
        icon={<Monitor size={20} />}
      />
      <div className="p-8 space-y-4">
        {/* Search Toolbar */}
        <div className="skoop-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search by name, ID, or tag..."
                className="pl-9 text-sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* AND/OR toggle */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                onClick={() => setMatchMode("any")}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  matchMode === "any"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                Match ANY
              </button>
              <button
                onClick={() => setMatchMode("all")}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  matchMode === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                Match ALL
              </button>
            </div>

            <Button
              variant={showProximity ? "default" : "outline"}
              size="sm"
              onClick={() => setShowProximity(!showProximity)}
            >
              <MapPin size={14} className="mr-1" />
              {showProximity ? "Hide Proximity" : "+ Add Proximity"}
            </Button>
          </div>

          {/* Proximity Filter Row */}
          {showProximity && (
            <div className="flex items-end gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex-1">
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  Search POI
                </label>
                <POIAutocomplete
                  value={poiSearchQuery}
                  onChange={setPoiSearchQuery}
                  onSelect={(name) => {
                    setPoiSearchQuery(name);
                    handlePoiSearch(name);
                  }}
                  placeholder="e.g. Walmart, Family Dollar, CVS..."
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  Radius
                </label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={proximityRadius}
                  onChange={(e) => setProximityRadius(Number(e.target.value))}
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={handlePoiSearch} disabled={poiLoading}>
                {poiLoading ? "Searching..." : "Search"}
              </Button>
              {activePoiQuery && (
                <Button size="sm" variant="ghost" onClick={clearProximityFilter}>
                  <X size={14} className="mr-1" /> Clear
                </Button>
              )}
            </div>
          )}

          {/* POI search feedback */}
          {showProximity && poiLoading && (
            <p className="text-xs text-muted-foreground px-1 py-2">
              Searching for {poiSearchQuery.trim()} locations...
            </p>
          )}
          {showProximity && poiSearched && !poiLoading && selectedPOIs.length === 0 && activePoiQuery && (
            <p className="text-xs text-muted-foreground px-1 py-2">
              No "{activePoiQuery}" locations found. Try a different search term.
            </p>
          )}

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeFilterChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {chip.type === "poi" && <MapPin size={10} />}
                  {chip.label}
                  <button onClick={chip.onRemove}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {filteredScreens.length} screen
                {filteredScreens.length !== 1 ? "s" : ""} match
              </span>
            </div>
          )}
        </div>

        {/* Filter results banner */}
        {hasFilters && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
            <MapPin size={16} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {filteredScreens.length} screen{filteredScreens.length !== 1 ? 's' : ''}
                {activePoiQuery && ` within ${proximityRadius} mi of ${activePoiQuery}`}
                {searchText && ` matching "${searchText}"`}
              </p>
              <p className="text-xs text-muted-foreground">
                Showing only screens that match your filters
              </p>
            </div>
          </div>
        )}

        {/* Main content: table + optional sidebar */}
        <div className={`flex gap-6 ${hasFilters ? "" : ""}`}>
          {/* Screen Table */}
          <div className="flex-1 min-w-0">
            <div className="skoop-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="skoop-table-header">
                    <th className="skoop-table-cell text-left">Screen Name</th>
                    <th className="skoop-table-cell text-left">Venue</th>
                    <th className="skoop-table-cell text-left">Resolution</th>
                    <th className="skoop-table-cell text-left">Orientation</th>
                    <th className="skoop-table-cell text-right">
                      Daily Eligible Capacity
                    </th>
                    <th className="skoop-table-cell text-right">
                      Ad Placements
                    </th>
                    <th className="skoop-table-cell text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScreens.map((s) => {
                    const placementCount = allPlacements.filter((p) =>
                      p.screenIds.includes(s.id)
                    ).length;
                    // Highlight matched tags when filtering
                    const matchedTags: string[] = [];
                    if (hasFilters) {
                      const terms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
                      const screenTags = getScreenTagValues(s);
                      terms.forEach((term) => {
                        screenTags.forEach((t) => {
                          if (t.toLowerCase().includes(term) && !matchedTags.includes(t)) {
                            matchedTags.push(t);
                          }
                        });
                      });
                    }
                    return (
                      <tr
                        key={s.id}
                        className="skoop-table-row cursor-pointer"
                        onClick={() => navigate(`/screens/${s.id}`)}
                      >
                        <td className="skoop-table-cell font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Monitor
                              size={14}
                              className="text-muted-foreground shrink-0"
                            />
                            <span>{s.name}</span>
                            {matchedTags.length > 0 && (
                              <div className="flex gap-1 ml-1">
                                {matchedTags.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="skoop-table-cell text-muted-foreground">
                          {s.venue}
                        </td>
                        <td className="skoop-table-cell text-muted-foreground tabular-nums text-xs">
                          {s.resolution}
                        </td>
                        <td className="skoop-table-cell text-muted-foreground text-xs">
                          {s.orientation}
                        </td>
                        <td className="skoop-table-cell text-right tabular-nums text-sm">
                          {(s.loopsPerHour * 16).toLocaleString()} opp
                        </td>
                        <td className="skoop-table-cell text-right tabular-nums text-sm">
                          {placementCount}
                        </td>
                        <td className="skoop-table-cell">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.status === "Online"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.status === "Online"
                                  ? "bg-emerald-500"
                                  : "bg-red-400"
                              }`}
                            />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredScreens.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="skoop-table-cell text-center py-12 text-muted-foreground text-sm"
                      >
                        No screens match your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tag Breakdown Sidebar */}
          {hasFilters && tagBreakdown.length > 0 && (
            <div className="w-64 shrink-0">
              <div className="skoop-card p-4 sticky top-8 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Tags in results
                </p>
                <div className="space-y-1">
                  {tagBreakdown.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => addSearchTerm(t.value)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors group"
                    >
                      <span className="flex items-center gap-1.5 text-foreground">
                        {t.type === "auto" && (
                          <Globe
                            size={10}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                        {t.type === "manual" && (
                          <Tag
                            size={10}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                        {t.type === "proximity" && (
                          <MapPin
                            size={10}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                        <span className="truncate">{t.value}</span>
                      </span>
                      <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
