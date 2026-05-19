import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check, Info, AlertTriangle, Plus, X, Upload, Tag, Search, Trash2, MapPin, Globe, ChevronDown, ChevronRight, Clock } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allPlacements, calcPlaysPerDay, calcCapacityFromRule } from "@/data/placements";
import { allScreens } from "@/data/screens";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { hasAnyImpressionData, getImpressionMultiplier } from "@/data/impressionStore";
import { searchPOIs, getScreensNearPOIs, getRegionalSearchCenters, milesToMeters, POI } from "@/services/foursquareService";
import POIAutocomplete from "@/components/shared/POIAutocomplete";

const STEPS = [
  "Campaign Details",
  "Where It Runs",
  "Schedule",
  "How Much It Plays",
  "Creatives",
  "Review & Launch",
];

interface SelectedRule {
  id: string;
  tags: string[];
  tagInput: string;
}

interface Creative {
  id: string;
  name: string;
  type: string;
  size: string;
  file: File;
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TimeWindow {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

function newWindow(days = ALL_DAYS.slice(0, 5)): TimeWindow {
  return { id: crypto.randomUUID(), days, startTime: "08:00", endTime: "20:00" };
}

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [advertiser, setAdvertiser] = useState("");
  const [dealValue, setDealValue] = useState("");

  // Step 2 — Where It Runs
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [expandedTagGroups, setExpandedTagGroups] = useState<string[]>([]);
  const [showAllTagGroups, setShowAllTagGroups] = useState<Record<string, boolean>>({});
  const [conflictAcknowledged, setConflictAcknowledged] = useState(false);

  // Step 2 — Proximity targeting
  const [proximityPOIs, setProximityPOIs] = useState<POI[]>([]);
  const [proximityRadius, setProximityRadius] = useState(1);
  const [poiSearch, setPoiSearch] = useState("");
  const [poiLoading, setPoiLoading] = useState(false);
  const [activePoiQuery, setActivePoiQuery] = useState("");
  const [poiSearched, setPoiSearched] = useState(false);

  // Step 3 — Schedule
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([newWindow()]);

  // Step 4 — Delivery
  const [fillEnabled, setFillEnabled] = useState(true);
  const [hasTarget, setHasTarget] = useState(false);
  const [deliveryGoalType, setDeliveryGoalType] = useState<"sov" | "total" | "plays-per-day">("total");
  const [sovValue, setSovValue] = useState(15);
  const [totalPlays, setTotalPlays] = useState(5000);
  const [playsPerDay, setPlaysPerDay] = useState(200);
  const [progFallback, setProgFallback] = useState(true);

  // Step 5 — Creatives
  const [creatives, setCreatives] = useState<Creative[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newCreatives: Creative[] = Array.from(files).map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let type = "File";
      if (["mp4", "mov", "webm", "avi"].includes(ext)) type = "Video";
      else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) type = "Image";
      else if (ext === "zip" || ext === "html") type = "HTML5";
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        file,
      };
    });
    setCreatives((prev) => [...prev, ...newCreatives]);
    e.target.value = "";
  };

  const removeCreative = (id: string) => setCreatives((prev) => prev.filter((c) => c.id !== id));

  const addWindow = () => setTimeWindows((prev) => [...prev, newWindow()]);
  const removeWindow = (id: string) => setTimeWindows((prev) => prev.filter((w) => w.id !== id));
  const updateWindow = (id: string, patch: Partial<TimeWindow>) =>
    setTimeWindows((prev) => prev.map((w) => w.id === id ? { ...w, ...patch } : w));
  const toggleWindowDay = (id: string, day: string) =>
    updateWindow(id, {
      days: timeWindows.find((w) => w.id === id)!.days.includes(day)
        ? timeWindows.find((w) => w.id === id)!.days.filter((d) => d !== day)
        : [...timeWindows.find((w) => w.id === id)!.days, day],
    });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const allTags = useMemo(() => getAllScreenTags(), []);

  const tagMatchedScreens = useMemo(() => {
    if (selectedTags.length === 0) return 0;
    return getScreensMatchingTags(selectedTags).length;
  }, [selectedTags]);

  const proximityMatchedScreens = useMemo(() => {
    if (proximityPOIs.length === 0) return [];
    return getScreensNearPOIs(proximityPOIs, allScreens, milesToMeters(proximityRadius));
  }, [proximityPOIs, proximityRadius]);

  // Capacity calculations across all selected rules + tags
  const capacitySummary = useMemo(() => {
    if (selectedRules.length === 0 && selectedTags.length === 0 && proximityPOIs.length === 0) return null;
    let totalScreens = 0;
    let totalAvailable = 0;
    let totalCapacity = 0;
    selectedRules.forEach((sr) => {
      const rule = allPlacements.find((p) => p.id === sr.id);
      if (!rule) return;
      const cap = calcCapacityFromRule(rule);
      totalScreens += rule.screenCount;
      totalAvailable += cap.available;
      totalCapacity += cap.total;
    });
    // Add tag-matched screens
    if (selectedTags.length > 0) {
      const tagScreens = tagMatchedScreens;
      const tagCapPerScreen = 480;
      totalScreens += tagScreens;
      totalCapacity += tagScreens * tagCapPerScreen;
      totalAvailable += Math.round(tagScreens * tagCapPerScreen * 0.7);
    }
    // Add proximity-matched screens
    if (proximityMatchedScreens.length > 0) {
      const proxCapPerScreen = 480;
      totalScreens += proximityMatchedScreens.length;
      totalCapacity += proximityMatchedScreens.length * proxCapPerScreen;
      totalAvailable += Math.round(proximityMatchedScreens.length * proxCapPerScreen * 0.7);
    }
    const availablePct = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0;
    const bookedPct = 100 - availablePct;

    let requested = 0;
    if (hasTarget) {
      if (deliveryGoalType === "sov") {
        requested = Math.round(totalCapacity * sovValue / 100);
      } else if (deliveryGoalType === "total") {
        requested = totalPlays;
      } else {
        requested = playsPerDay * totalScreens;
      }
    }
    const fits = !hasTarget || requested <= totalAvailable;
    const dailyPacing = hasTarget && deliveryGoalType === "total" && startDate && endDate
      ? Math.round(totalPlays / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)))
      : hasTarget && deliveryGoalType === "plays-per-day" ? playsPerDay * totalScreens
      : 0;

    return { totalScreens, totalAvailable, totalCapacity, availablePct, bookedPct, requested, fits, dailyPacing };
  }, [selectedRules, selectedTags, tagMatchedScreens, proximityMatchedScreens, hasTarget, deliveryGoalType, sovValue, totalPlays, playsPerDay, startDate, endDate, proximityPOIs]);

  const estimatedDailyPlays = useMemo(() => {
    if (!capacitySummary || !hasTarget) return 0;
    if (deliveryGoalType === "sov") return Math.round(capacitySummary.totalCapacity * sovValue / 100);
    if (deliveryGoalType === "plays-per-day") return playsPerDay * capacitySummary.totalScreens;
    return capacitySummary.dailyPacing || totalPlays;
  }, [capacitySummary, hasTarget, deliveryGoalType, sovValue, totalPlays, playsPerDay]);

  const addRule = (ruleId: string) => {
    if (selectedRules.find((r) => r.id === ruleId)) return;
    setSelectedRules((prev) => [...prev, { id: ruleId, tags: [], tagInput: "" }]);
  };

  const removeRule = (ruleId: string) => {
    setSelectedRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const addTagToRule = (ruleId: string, tag: string) => {
    if (!tag.trim()) return;
    setSelectedRules((prev) =>
      prev.map((r) => r.id === ruleId ? { ...r, tags: [...r.tags.filter((t) => t !== tag.trim()), tag.trim()], tagInput: "" } : r)
    );
  };

  const removeTagFromRule = (ruleId: string, tag: string) => {
    setSelectedRules((prev) =>
      prev.map((r) => r.id === ruleId ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r)
    );
  };

  const updateTagInput = (ruleId: string, value: string) => {
    setSelectedRules((prev) =>
      prev.map((r) => r.id === ruleId ? { ...r, tagInput: value } : r)
    );
  };
  const hasImpressions = hasAnyImpressionData();

  const estimatedDailyImpressions = useMemo(() => {
    if (!hasImpressions || !capacitySummary) return 0;
    const screenIds = new Set<string>();
    selectedRules.forEach((sr) => {
      const rule = allPlacements.find((p) => p.id === sr.id);
      if (rule) rule.screenIds.forEach((sid) => screenIds.add(sid));
    });
    if (selectedTags.length > 0) {
      getScreensMatchingTags(selectedTags).forEach((s) => screenIds.add(s.id));
    }
    proximityMatchedScreens.forEach((s) => screenIds.add(s.id));
    const playsPerScreen = capacitySummary.totalScreens > 0 ? estimatedDailyPlays / capacitySummary.totalScreens : 0;
    let totalImpressions = 0;
    screenIds.forEach((sid) => {
      const mult = getImpressionMultiplier(sid);
      if (mult !== null) totalImpressions += playsPerScreen * mult;
    });
    return Math.round(totalImpressions);
  }, [hasImpressions, capacitySummary, estimatedDailyPlays, selectedRules, selectedTags, proximityMatchedScreens]);

  // POI search handler for campaign builder — auto-apply all results
  const handleCampaignPoiSearch = async (queryOverride?: string) => {
    const query = queryOverride || poiSearch.trim();
    if (!query) return;
    setPoiLoading(true);
    try {
      const searchCenters = getRegionalSearchCenters(allScreens);
      const results = await searchPOIs(query, searchCenters, 100000);
      setProximityPOIs(results);
      setActivePoiQuery(query);
      setPoiSearched(true);
    } catch (err) {
      console.error("POI search error:", err);
    } finally {
      setPoiLoading(false);
    }
  };

  const clearProximityFilter = () => {
    setProximityPOIs([]);
    setPoiSearch("");
    setActivePoiQuery("");
    setPoiSearched(false);
  };



  // ── STEP RENDERERS ──

  const renderStep1 = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Campaign Details</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Campaign Name <span className="text-destructive">*</span></label>
          <Input placeholder="e.g. Summer Brand Push" className="mt-1" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Paid campaign</p>
            <p className="text-xs text-muted-foreground mt-0.5">This campaign is booked by an external advertiser or partner.</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setIsPaid(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isPaid ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >ON</button>
            <button
              onClick={() => { setIsPaid(false); setAdvertiser(""); setDealValue(""); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!isPaid ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}
            >OFF</button>
          </div>
        </div>

        {isPaid && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Advertiser / Partner <span className="text-muted-foreground/60">(optional)</span></label>
              <Input
                placeholder="e.g. Nike Australia"
                className="mt-1"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Deal Value <span className="text-muted-foreground/60">(optional)</span></label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  className="pl-7"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const filteredTags = allTags.filter((t) =>
    !selectedTags.includes(t.value) && t.value.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Network Rules */}
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Placements</p>
        <p className="text-xs text-muted-foreground">Select one or more placements to define where this campaign plays. Optionally narrow with tags per placement.</p>

        <div className="space-y-2">
          {allPlacements.map((rule) => {
            const isSelected = selectedRules.some((sr) => sr.id === rule.id);
            const sr = selectedRules.find((r) => r.id === rule.id);
            const cap = calcCapacityFromRule(rule);
            const availPct = Math.round((cap.available / cap.total) * 100);
            return (
              <div key={rule.id} className="space-y-0">
                <button
                  onClick={() => isSelected ? removeRule(rule.id) : addRule(rule.id)}
                  className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rule.screenCount} screens · {availPct}% available</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Check size={12} className="text-primary-foreground" />}
                    </div>
                  </div>
                </button>
                {isSelected && sr && (
                  <div className="ml-4 mt-2 mb-3 pl-4 border-l-2 border-primary/20 space-y-2">
                    <label className="text-[11px] text-muted-foreground">Filter to tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {sr.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {tag}
                          <button onClick={() => removeTagFromRule(sr.id, tag)}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g. Bodega, Urban Panel, West Coast"
                      className="text-xs max-w-xs"
                      value={sr.tagInput}
                      onChange={(e) => updateTagInput(sr.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTagToRule(sr.id, sr.tagInput);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target by Tags */}
      <div className="skoop-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-muted-foreground" />
          <p className="skoop-section-header">Target by Tags</p>
        </div>
        <p className="text-xs text-muted-foreground">Add screens by tag across your entire network, outside of the rules selected above.</p>

        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {tag}
              <button onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}><X size={10} /></button>
            </span>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            className="pl-9 text-xs"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          {(() => {
            const groups: Record<string, typeof filteredTags> = {};
            const order = ["Country", "State", "City", "ZIP", "Venue"];
            filteredTags.forEach((tag) => {
              const cat = tag.category || "Venue";
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(tag);
            });
            // Sort each group by screenCount desc
            Object.values(groups).forEach(g => g.sort((a, b) => b.screenCount - a.screenCount));

            const isSearching = tagSearch.trim().length > 0;
            const visibleGroups = order.filter(g => groups[g]?.length);

            if (visibleGroups.length === 0 && tagSearch) {
              return <p className="text-xs text-muted-foreground">No matching tags found</p>;
            }

            return visibleGroups.map((groupName) => {
              const tags = groups[groupName];
              const isExpanded = isSearching || expandedTagGroups.includes(groupName);
              const showAll = showAllTagGroups[groupName];
              const CAP = 15;
              const visibleTags = showAll ? tags : tags.slice(0, CAP);

              return (
                <div key={groupName} className="border border-border rounded-md">
                  <button
                    onClick={() => setExpandedTagGroups(prev =>
                      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
                    )}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {groupName}
                      <span className="text-muted-foreground font-normal">({tags.length})</span>
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
                      {visibleTags.map((tag) => (
                        <button
                          key={tag.value}
                          onClick={() => { setSelectedTags((prev) => [...prev, tag.value]); setTagSearch(""); }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                        >
                          {tag.type === "auto" ? <Globe size={10} className="shrink-0" /> : null}
                          + {tag.value}
                          <span className="text-[10px] opacity-60">({tag.screenCount})</span>
                        </button>
                      ))}
                      {!showAll && tags.length > CAP && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAllTagGroups(prev => ({ ...prev, [groupName]: true })); }}
                          className="text-xs text-primary hover:underline px-1"
                        >
                          Show all {tags.length}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
            <Info size={12} className="text-primary shrink-0" />
            <p className="text-xs text-foreground font-medium tabular-nums">{tagMatchedScreens} screen{tagMatchedScreens !== 1 ? "s" : ""} match these tags</p>
          </div>
        )}
      </div>

      {/* Target by Proximity */}
      <div className="skoop-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted-foreground" />
          <p className="skoop-section-header">Target by Proximity</p>
        </div>
        <p className="text-xs text-muted-foreground">Find screens near specific points of interest.</p>

        {/* Results banner */}
        {poiSearched && !poiLoading && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                {proximityMatchedScreens.length} screen{proximityMatchedScreens.length !== 1 ? "s" : ""} within {proximityRadius} mi of {activePoiQuery}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearProximityFilter} className="text-xs h-7">
              <X size={12} className="mr-1" /> Clear
            </Button>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Search POI</label>
            <POIAutocomplete
              value={poiSearch}
              onChange={setPoiSearch}
              onSelect={(name) => {
                setPoiSearch(name);
                handleCampaignPoiSearch(name);
              }}
              placeholder="e.g. Walmart, Family Dollar, CVS..."
              className="text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Radius</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={proximityRadius}
              onChange={(e) => setProximityRadius(Number(e.target.value))}
            >
              <option value={0.25}>0.25 mi</option>
              <option value={0.5}>0.5 mi</option>
              <option value={1}>1 mi</option>
              <option value={2}>2 mi</option>
              <option value={5}>5 mi</option>
            </select>
          </div>
          <Button size="sm" onClick={() => handleCampaignPoiSearch()} disabled={poiLoading}>
            {poiLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* Campaign dates */}
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Dates</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Start Date</label>
            <Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End Date</label>
            <Input type="date" className="mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Time windows */}
      <div className="skoop-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="skoop-section-header">Active Hours</p>
            <p className="text-xs text-muted-foreground mt-0.5">Campaign only competes for inventory within these windows.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={addWindow}>
            <Plus size={13} className="mr-1" /> Add window
          </Button>
        </div>

        <div className="space-y-3">
          {timeWindows.map((w, idx) => (
            <div key={w.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Window {idx + 1}
                </span>
                {timeWindows.length > 1 && (
                  <button onClick={() => removeWindow(w.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Day picker */}
              <div className="flex gap-1.5">
                {ALL_DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleWindowDay(w.id, d)}
                    className={`w-10 h-8 rounded border text-xs font-medium transition-colors ${
                      w.days.includes(d)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => updateWindow(w.id, { days: w.days.length === ALL_DAYS.length ? [] : ALL_DAYS })}
                  className="ml-1 px-2 h-8 rounded border border-dashed border-border text-[10px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {w.days.length === ALL_DAYS.length ? "Clear" : "All"}
                </button>
              </div>

              {/* Time range */}
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">From</label>
                  <Input
                    type="time"
                    className="mt-0.5 w-32 text-sm"
                    value={w.startTime}
                    onChange={(e) => updateWindow(w.id, { startTime: e.target.value })}
                  />
                </div>
                <span className="text-muted-foreground mt-5">→</span>
                <div>
                  <label className="text-[11px] text-muted-foreground">To</label>
                  <Input
                    type="time"
                    className="mt-0.5 w-32 text-sm"
                    value={w.endTime}
                    onChange={(e) => updateWindow(w.id, { endTime: e.target.value })}
                  />
                </div>
                {w.startTime && w.endTime && (
                  <div className="mt-5 text-xs text-muted-foreground tabular-nums">
                    {(() => {
                      const [sh, sm] = w.startTime.split(":").map(Number);
                      const [eh, em] = w.endTime.split(":").map(Number);
                      const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
                      return hrs > 0 ? `${hrs}h / day` : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const effectiveFill = fillEnabled || !hasTarget;
    return (
      <div className="space-y-4">
        {/* Section 1 — Fill & target toggles */}
        <div className="skoop-card p-5 space-y-5">
          <p className="skoop-section-header">Delivery Settings</p>

          <div className="space-y-4">
            {/* Fill enabled toggle */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Fill enabled</p>
                <p className="text-xs text-muted-foreground mt-0.5">This campaign can play in available fill slots when not reserved for other campaigns.</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setFillEnabled(true); setConflictAcknowledged(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${fillEnabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >ON</button>
                <button
                  onClick={() => { setFillEnabled(false); setConflictAcknowledged(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!fillEnabled ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}
                >OFF</button>
              </div>
            </div>

            {/* Auto-correct note */}
            {!fillEnabled && !hasTarget && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">A campaign with fill disabled and no target would never play. Fill has been left enabled.</p>
              </div>
            )}

            {/* Has target toggle */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Set delivery target</p>
                <p className="text-xs text-muted-foreground mt-0.5">Set a goal for how much this campaign should play. Without a target it runs as fill only.</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setHasTarget(true); setConflictAcknowledged(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${hasTarget ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >ON</button>
                <button
                  onClick={() => { setHasTarget(false); setConflictAcknowledged(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!hasTarget ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}
                >OFF</button>
              </div>
            </div>

            {!hasTarget && (
              <div className="flex items-start gap-2 rounded-md bg-secondary/70 border border-border px-3 py-3">
                <Info size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">No target — this campaign plays as fill only, taking available slots after all targeted campaigns are served.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — Delivery goal (only when hasTarget) */}
        {hasTarget && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Delivery Goal</p>
            <div className="flex gap-2">
              {(["sov", "total", "plays-per-day"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setDeliveryGoalType(mode); setConflictAcknowledged(false); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryGoalType === mode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {mode === "sov" ? "% of Screen Time" : mode === "total" ? "Total Plays" : "Plays / Day"}
                </button>
              ))}
            </div>

            {deliveryGoalType === "sov" && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Share of screen time</span><span className="font-medium tabular-nums">{sovValue}%</span></div>
                <Slider value={[sovValue]} onValueChange={([v]) => { setSovValue(v); setConflictAcknowledged(false); }} min={1} max={50} step={1} />
                <div className="flex justify-between text-[11px] text-muted-foreground"><span>1%</span><span>50% max</span></div>
              </div>
            )}

            {deliveryGoalType === "total" && (
              <div>
                <label className="text-xs text-muted-foreground">Target total plays (across campaign period)</label>
                <Input type="number" placeholder="e.g. 5000" className="mt-1 w-48" value={totalPlays} onChange={(e) => { setTotalPlays(Number(e.target.value)); setConflictAcknowledged(false); }} />
              </div>
            )}

            {deliveryGoalType === "plays-per-day" && (
              <div>
                <label className="text-xs text-muted-foreground">Target plays per screen per day</label>
                <Input type="number" placeholder="e.g. 200" className="mt-1 w-48" value={playsPerDay} onChange={(e) => { setPlaysPerDay(Number(e.target.value)); setConflictAcknowledged(false); }} />
              </div>
            )}

            {capacitySummary && (
              <div className={`rounded-lg border px-4 py-4 space-y-3 ${capacitySummary.fits ? "border-border bg-secondary/40" : "border-destructive/40 bg-destructive/5"}`}>
                <p className="text-xs font-medium text-foreground">Availability Check</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Available capacity</p>
                    <p className="text-sm font-medium tabular-nums">{capacitySummary.totalAvailable.toLocaleString()} plays/day</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Requested</p>
                    <p className={`text-sm font-medium tabular-nums ${!capacitySummary.fits ? "text-destructive" : ""}`}>
                      {capacitySummary.requested.toLocaleString()} plays/day
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Est. daily impressions</p>
                    {hasImpressions ? (
                      <p className="text-sm font-medium tabular-nums">~{estimatedDailyImpressions.toLocaleString()}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">—</p>
                    )}
                  </div>
                </div>
                {!capacitySummary.fits && (
                  <div className="flex items-start gap-2 text-xs text-destructive">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                    <span>Requested plays exceed available capacity on the selected screens. Reduce the target or add more screens.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section 3 — Programmatic fallback */}
        <div className="skoop-card p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Programmatic fallback</p>
              <p className="text-xs text-muted-foreground mt-0.5">Allow this campaign's creatives to fill slots when a programmatic partner (e.g. Screenverse) returns no-fill.</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setProgFallback(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${progFallback ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >ON</button>
              <button
                onClick={() => setProgFallback(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!progFallback ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}
              >OFF</button>
            </div>
          </div>
          {!progFallback && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>This campaign will only play in its own reserved allocation and will not absorb programmatic no-fill slots.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Creatives</p>
      <p className="text-xs text-muted-foreground">Upload media assets for this campaign (Video or Image). Bulk file upload is supported — drag and drop multiple files at once.</p>

      {creatives.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {creatives.map((c) => (
            <div key={c.id} className="rounded-lg border border-border overflow-hidden group relative">
              <div className="h-28 bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                <Upload size={16} className="mr-1.5" /> {c.type}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.type} · {c.size}</p>
              </div>
              <button
                onClick={() => removeCreative(c.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-1 cursor-pointer">
        <Button variant="outline" size="sm" asChild>
          <span><Plus size={14} className="mr-1" /> Add Creative</span>
        </Button>
        <input type="file" multiple accept="video/*,image/*,.zip,.html" className="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  );

  const renderStep6 = () => {
    const rulesText = selectedRules.map((sr) => {
      const rule = allPlacements.find((p) => p.id === sr.id);
      return rule ? `${rule.name}${sr.tags.length > 0 ? ` (${sr.tags.join(", ")})` : ""}` : "";
    }).filter(Boolean);

    const totalDays = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 30;
    const totalEstimated = estimatedDailyPlays * totalDays;
    const hasConflict = capacitySummary ? !capacitySummary.fits : false;
    const hasPendingCreatives = false;

    const deliveryTargetLabel = !hasTarget
      ? "None (fill only)"
      : deliveryGoalType === "sov"
      ? `${sovValue}% of screen time`
      : deliveryGoalType === "plays-per-day"
      ? `${playsPerDay.toLocaleString()} plays/screen/day`
      : `${totalPlays.toLocaleString()} total plays`;

    const fillBehaviorLabel = !hasTarget
      ? "Fill only"
      : fillEnabled
      ? "Target then fill"
      : "Target, no fill";

    const ready = !hasConflict && campaignName && (selectedRules.length > 0 || selectedTags.length > 0);

    return (
      <div className="space-y-4">
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Campaign Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Campaign Name</p><p className="text-sm font-medium">{campaignName || "Untitled"}</p></div>
            <div><p className="text-xs text-muted-foreground">Paid Campaign</p><p className="text-sm font-medium">{isPaid ? "Yes" : "No"}</p></div>
            {isPaid && advertiser && <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{advertiser}</p></div>}
            {isPaid && dealValue && <div><p className="text-xs text-muted-foreground">Deal Value</p><p className="text-sm font-medium tabular-nums">${Number(dealValue).toLocaleString()}</p></div>}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Placements</p>
              <div className="space-y-1 mt-1">
                {rulesText.map((rt, i) => (
                  <p key={i} className="text-sm font-medium">{rt}</p>
                ))}
                {rulesText.length === 0 && <p className="text-sm text-muted-foreground">None selected</p>}
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Target Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium tabular-nums">{capacitySummary?.totalScreens.toLocaleString() || 0}</p></div>
            <div><p className="text-xs text-muted-foreground">Schedule</p><p className="text-sm font-medium">{startDate || "—"} → {endDate || "—"}</p></div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Active Hours</p>
              <div className="mt-1 space-y-0.5">
                {timeWindows.map((w) => (
                  <p key={w.id} className="text-sm font-medium">
                    {w.days.length === 7 ? "Every day" : w.days.join(", ")} · {w.startTime} – {w.endTime}
                  </p>
                ))}
              </div>
            </div>
            <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">{deliveryTargetLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Fill Behavior</p><p className="text-sm font-medium">{fillBehaviorLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Prog. Fallback</p><p className="text-sm font-medium">{progFallback ? "Enabled" : "Disabled"}</p></div>
            <div><p className="text-xs text-muted-foreground">Creatives</p><p className="text-sm font-medium">{creatives.length} asset{creatives.length !== 1 ? "s" : ""} uploaded</p></div>
            <div><p className="text-xs text-muted-foreground">Proof of Play</p><p className="text-sm font-medium text-primary">Enabled</p></div>
          </div>
        </div>

        <div className="skoop-card p-5 space-y-3">
          <p className="skoop-section-header">Estimated Delivery</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Total estimated plays</p><p className="text-sm font-medium tabular-nums">~{totalEstimated.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Daily pacing estimate</p><p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} plays/day</p></div>
            <div><p className="text-xs text-muted-foreground">Est. daily impressions</p><p className="text-sm font-medium tabular-nums">{hasImpressions ? `~${estimatedDailyImpressions.toLocaleString()}` : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Inventory Fit</p><StatusChip status={hasConflict ? "overbooked" : "healthy"} label={hasConflict ? "Conflict" : "Compatible"} /></div>
            <div><p className="text-xs text-muted-foreground">Conflicts</p><p className="text-sm font-medium text-muted-foreground">{hasConflict ? "Requested capacity exceeds available inventory" : "None detected"}</p></div>
          </div>
        </div>

        {ready ? (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700">Pre-flight check passed. Campaign is ready to launch.</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">
              {hasConflict ? "Capacity conflict detected — requested plays exceed available inventory." : "Missing required fields. Please complete all steps before launching."}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (step === 0) return renderStep1();
    if (step === 1) return renderStep2();
    if (step === 2) return renderStep3();
    if (step === 3) return renderStep4();
    if (step === 4) return renderStep5();
    if (step === 5) return renderStep6();
    return renderStep1();
  };

  const isLastStep = step === STEPS.length - 1;

  // Right panel — capacity summary (visible on steps 1–5)
  const renderCapacityPanel = () => {
    if (!capacitySummary || (selectedRules.length === 0 && selectedTags.length === 0 && proximityPOIs.length === 0)) return null;
    return (
      <div className="w-72 shrink-0 space-y-4">
        <div className="skoop-card p-5 space-y-3 sticky top-8">
          <p className="skoop-section-header">Capacity Summary</p>
          <p className="text-[11px] text-muted-foreground">Live capacity across selected rules</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Screens</span><span className="font-medium tabular-nums">{capacitySummary.totalScreens.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Combined Capacity</span><span className="font-medium tabular-nums">{capacitySummary.totalCapacity.toLocaleString()}/day</span></div>
            <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacitySummary.totalAvailable.toLocaleString()}/day</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Impressions/day</span><span className="font-medium tabular-nums">{hasImpressions ? `~${estimatedDailyImpressions.toLocaleString()}` : "—"}</span></div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${capacitySummary.bookedPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{capacitySummary.bookedPct}% booked</span>
            <span>{capacitySummary.availablePct}% available</span>
          </div>
          {step >= 3 && (
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Requested</span><span className="font-medium tabular-nums">~{capacitySummary.requested.toLocaleString()}/day</span></div>
              <div className="flex items-center gap-2">
                {capacitySummary.fits ? (
                  <StatusChip status="healthy" label="Compatible" />
                ) : (
                  <StatusChip status="overbooked" label="Conflict" />
                )}
              </div>
              {!capacitySummary.fits && !conflictAcknowledged && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={12} className="text-destructive mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-destructive">
                        You're requesting ~{capacitySummary.requested.toLocaleString()} plays/day but only {capacitySummary.totalAvailable.toLocaleString()}/day is available across your selected rules.
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Other campaigns have already booked the remaining capacity.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    <button
                      onClick={() => setStep(3)}
                      className="block text-[11px] text-primary font-medium hover:underline"
                    >
                      A. Reduce your target
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="block text-[11px] text-primary font-medium hover:underline"
                    >
                      B. Add more screens
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => setConflictAcknowledged(true)}
                    >
                      C. Proceed anyway
                    </Button>
                  </div>
                </div>
              )}
              {!capacitySummary.fits && conflictAcknowledged && (
                <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2">
                  <AlertTriangle size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">Conflict acknowledged — proceeding with overbooking.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/campaigns">Campaigns</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Campaign</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title="Create Campaign"
        subtitle="Campaigns define what content runs, when it runs, and how it is delivered"
        icon={<Megaphone size={20} />}
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Cancel</Button>}
      />

      {/* Step indicator */}
      <div className="border-b border-border px-8 py-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="flex gap-6">
          <div className="flex-1 max-w-3xl">
            {renderCurrentStep()}

            <div className="flex justify-between mt-8">
              <Button variant="outline" size="sm" onClick={prev} disabled={step === 0}><ArrowLeft size={14} className="mr-1" /> Previous</Button>
              {!isLastStep ? (
                <Button size="sm" onClick={next} disabled={step === 0 && !campaignName}>
                  {capacitySummary && !capacitySummary.fits && step >= 3 && <AlertTriangle size={14} className="mr-1" />}
                  Next <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/campaigns")}
                  disabled={capacitySummary ? !capacitySummary.fits : false}
                >
                  Launch Campaign
                </Button>
              )}
            </div>
          </div>

          {step < 5 && renderCapacityPanel()}
        </div>
      </div>
    </div>
  );
}
