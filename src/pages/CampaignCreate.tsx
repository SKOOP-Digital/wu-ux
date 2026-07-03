import { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check, Info, AlertTriangle, Plus, X, Tag, Search, MapPin, Globe, ChevronDown, ChevronRight, Clock, MoreHorizontal, Folder, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allPlacements, calcCapacityFromRule } from "@/data/placements";
import { allScreens } from "@/data/screens";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { defaultCdmKeys, GEO_CDM_KEYS } from "@/data/cdmTags";
import { hasAnyImpressionData, getImpressionMultiplier } from "@/data/impressionStore";
import { searchPOIs, getScreensNearPOIs, getRegionalSearchCenters, milesToMeters, POI } from "@/services/foursquareService";
import POIAutocomplete from "@/components/shared/POIAutocomplete";

const STEPS = [
  "Campaign Details",
  "Where It Runs",
  "Schedule",
  "How Much It Plays",
  "What Plays",
  "Review & Launch",
];

interface Creative {
  id: string;
  name: string;
  type: "Media" | "Website";
  duration: number; // seconds; auto-detected for video, user-set for images/HTML
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOCK_MEDIA_FOLDERS = [
  { id: "f1", name: "Converted 24F-12..." },
  { id: "f2", name: "Converted 24F-19..." },
  { id: "f3", name: "SC -> 1280F24" },
  { id: "f4", name: "Screen Cloud" },
];

const MOCK_MEDIA_ITEMS = [
  { id: "m1", name: "Untitled design (3)", color: "bg-red-400" },
  { id: "m2", name: "GettyImages-48752...", color: "bg-green-300" },
  { id: "m3", name: "going-to-the-sun-ro...", color: "bg-gray-500" },
  { id: "m4", name: "test", color: "bg-slate-900" },
  { id: "m5", name: "test (2)", color: "bg-slate-800" },
  { id: "m6", name: "Screenshot 2025-10...", color: "bg-blue-900" },
];

const MOCK_WEBSITE_ITEMS = [
  { id: "w1", name: "RealLeaf App" },
  { id: "w2", name: "sandstar website" },
  { id: "w3", name: "https://github.com/" },
  { id: "w4", name: "test" },
  { id: "w5", name: "test menu" },
  { id: "w6", name: "tv2" },
];

interface TimeWindow {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
  // Optional date sub-range within the campaign's overall date range.
  // Empty strings = "all dates" (default).
  windowStartDate: string;
  windowEndDate: string;
}

function newWindow(days = ALL_DAYS): TimeWindow {
  return {
    id: crypto.randomUUID(),
    days,
    startTime: "00:00",
    endTime: "23:59",
    windowStartDate: "",
    windowEndDate: "",
  };
}

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [campaignType, setCampaignType] = useState<"standard" | "programmatic">("standard");
  const [campaignName, setCampaignName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [advertiser, setAdvertiser] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [sspPartner, setSspPartner] = useState("");
  const [sspApiKey, setSspApiKey] = useState("");
  const [sspAvgDuration, setSspAvgDuration] = useState(30);

  // Step 2 — Where It Runs
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
  const [targetBufferPct, setTargetBufferPct] = useState(5);

  // Step 5 — Creatives
  const [creatives, setCreatives] = useState<Creative[]>([]);

  // Step 5 — Content sidebar
  const [contentView, setContentView] = useState<"list" | "media" | "website">("list");
  const [contentSearch, setContentSearch] = useState("");
  const [mediaCtxMenu, setMediaCtxMenu] = useState<string | null>(null);
  const [showMediaUploadMenu, setShowMediaUploadMenu] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [newWebsiteTitle, setNewWebsiteTitle] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const mediaUploadMenuRef = useRef<HTMLDivElement>(null);

  const addCreative = (name: string, type: "Media" | "Website") => {
    const defaultDuration = type === "Website" ? 30 : 15;
    setCreatives((prev) => [...prev, { id: crypto.randomUUID(), name, type, duration: defaultDuration }]);
  };

  const updateCreativeDuration = (id: string, duration: number) =>
    setCreatives((prev) => prev.map((c) => c.id === id ? { ...c, duration } : c));

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

  const allTags = useMemo(() => {
    const base = getAllScreenTags();
    const cdmExtras = defaultCdmKeys
      .filter((k) => !k.isAuto || !GEO_CDM_KEYS.has(k.key))
      .flatMap((k) => k.values.map((v) => ({
        value: v.value,
        type: (k.isAuto ? "auto" : "manual") as "auto" | "manual",
        category: k.key,
        screenCount: v.screenCount,
      })));
    const baseValues = new Set(base.map((t) => t.value));
    const uniqueExtras = cdmExtras.filter((e) => !baseValues.has(e.value));
    const cdmValueToKey: Record<string, string> = {};
    cdmExtras.forEach((e) => { cdmValueToKey[e.value] = e.category; });
    const updatedBase = base.map((t) => cdmValueToKey[t.value] ? { ...t, category: cdmValueToKey[t.value] } : t);
    return [...updatedBase, ...uniqueExtras];
  }, []);

  const tagMatchedScreens = useMemo(() => {
    if (selectedTags.length === 0) return 0;
    return getScreensMatchingTags(selectedTags).length;
  }, [selectedTags]);

  const proximityMatchedScreens = useMemo(() => {
    if (proximityPOIs.length === 0) return [];
    return getScreensNearPOIs(proximityPOIs, allScreens, milesToMeters(proximityRadius));
  }, [proximityPOIs, proximityRadius]);

  // Capacity calculations — placement tags use real capacity data, geo/manual tags use estimates
  const capacitySummary = useMemo(() => {
    if (selectedTags.length === 0 && proximityPOIs.length === 0) return null;
    let totalScreens = 0;
    let totalAvailable = 0;
    let totalCapacity = 0;

    // Placement tags → real capacity
    selectedTags.forEach((tag) => {
      const placement = allPlacements.find((p) => p.name.toLowerCase() === tag.toLowerCase());
      if (placement) {
        const cap = calcCapacityFromRule(placement);
        totalScreens += placement.screenCount;
        totalCapacity += cap.total;
        totalAvailable += cap.available;
      }
    });

    // Non-placement tags → flat estimate per screen
    const nonPlacementTags = selectedTags.filter(
      (t) => !allPlacements.some((p) => p.name.toLowerCase() === t.toLowerCase())
    );
    if (nonPlacementTags.length > 0) {
      const matched = getScreensMatchingTags(nonPlacementTags).length;
      const capPerScreen = 480;
      totalScreens += matched;
      totalCapacity += matched * capPerScreen;
      totalAvailable += Math.round(matched * capPerScreen * 0.7);
    }

    // Proximity → flat estimate
    if (proximityMatchedScreens.length > 0) {
      const capPerScreen = 480;
      totalScreens += proximityMatchedScreens.length;
      totalCapacity += proximityMatchedScreens.length * capPerScreen;
      totalAvailable += Math.round(proximityMatchedScreens.length * capPerScreen * 0.7);
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
  }, [selectedTags, proximityMatchedScreens, hasTarget, deliveryGoalType, sovValue, totalPlays, playsPerDay, startDate, endDate, proximityPOIs]);

  const estimatedDailyPlays = useMemo(() => {
    if (!capacitySummary || !hasTarget) return 0;
    if (deliveryGoalType === "sov") return Math.round(capacitySummary.totalCapacity * sovValue / 100);
    if (deliveryGoalType === "plays-per-day") return playsPerDay * capacitySummary.totalScreens;
    return capacitySummary.dailyPacing || totalPlays;
  }, [capacitySummary, hasTarget, deliveryGoalType, sovValue, totalPlays, playsPerDay]);

  const hasImpressions = hasAnyImpressionData();

  const estimatedDailyImpressions = useMemo(() => {
    if (!hasImpressions || !capacitySummary) return 0;
    const screenIds = new Set<string>();
    getScreensMatchingTags(selectedTags).forEach((s) => screenIds.add(s.id));
    proximityMatchedScreens.forEach((s) => screenIds.add(s.id));
    const playsPerScreen = capacitySummary.totalScreens > 0 ? estimatedDailyPlays / capacitySummary.totalScreens : 0;
    let totalImpressions = 0;
    screenIds.forEach((sid) => {
      const mult = getImpressionMultiplier(sid);
      if (mult !== null) totalImpressions += playsPerScreen * mult;
    });
    return Math.round(totalImpressions);
  }, [hasImpressions, capacitySummary, estimatedDailyPlays, selectedTags, proximityMatchedScreens]);

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

        {/* Campaign type selector */}
        <div>
          <label className="text-xs text-muted-foreground">Campaign Type</label>
          <div className="mt-1.5 flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => { setCampaignType("standard"); setSspPartner(""); }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${campaignType === "standard" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Standard
            </button>
            <button
              onClick={() => { setCampaignType("programmatic"); setIsPaid(false); setAdvertiser(""); setDealValue(""); }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-l border-border ${campaignType === "programmatic" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Programmatic
            </button>
          </div>
          {campaignType === "programmatic" && (
            <p className="text-xs text-muted-foreground mt-1.5">Revenue is tracked by the SSP. Paid / advertiser fields are not applicable.</p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Campaign Name <span className="text-destructive">*</span></label>
          <Input placeholder="e.g. Summer Brand Push" className="mt-1" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
        </div>

        {campaignType === "standard" && (
          <>
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
                  <Input placeholder="e.g. Nike Australia" className="mt-1" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Deal Value <span className="text-muted-foreground/60">(optional)</span></label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" min={0} placeholder="0.00" className="pl-7" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const filteredTags = allTags.filter((t) =>
    !selectedTags.includes(t.value) && t.value.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const renderStep2 = () => {
    const groups: Record<string, typeof filteredTags> = {};
    const STANDARD_ORDER = ["Country", "State", "City", "ZIP", "Venue"];
    filteredTags.forEach((tag) => {
      const cat = tag.category || "Venue";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tag);
    });
    const standard = STANDARD_ORDER.filter((g) => groups[g]?.length);
    const extras = Object.keys(groups).filter((g) => !STANDARD_ORDER.includes(g) && groups[g]?.length);
    const groupOrder = [...standard, ...extras];
    Object.values(groups).forEach((g) => g.sort((a, b) => b.screenCount - a.screenCount));
    const isSearching = tagSearch.trim().length > 0;
    const visibleGroups = groupOrder; // already filtered to groups with content

    return (
      <div className="space-y-5">
        {/* Tag targeting */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <p className="skoop-section-header">Target by Tags</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Select screens by tags — location, folder, venue type, or any CDM attribute. Selecting a tag targets all matching screens.
          </p>

          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => {
                  return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-foreground border border-border"
                      >
                      {tag}
                      <button onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))} className="ml-0.5 hover:opacity-70">
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-md px-3 py-2">
                <Info size={12} className="text-primary shrink-0" />
                <p className="text-xs text-foreground font-medium tabular-nums">
                  {capacitySummary?.totalScreens.toLocaleString() ?? tagMatchedScreens} screen{(capacitySummary?.totalScreens ?? tagMatchedScreens) !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
          )}

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search folders, states, cities, venue types..."
              className="pl-9 text-xs"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            {visibleGroups.length === 0 && tagSearch && (
              <p className="text-xs text-muted-foreground py-2">No tags match "{tagSearch}"</p>
            )}
            {visibleGroups.map((groupName) => {
              const tags = groups[groupName];
              const isExpanded = isSearching || expandedTagGroups.includes(groupName);
              const showAll = showAllTagGroups[groupName];
              const CAP = 15;
              const visibleTags = showAll ? tags : tags.slice(0, CAP);
              return (
                <div key={groupName} className="border border-border rounded-md">
                  <button
                    onClick={() => setExpandedTagGroups((prev) =>
                      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
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
                          + {tag.value}
                          <span className="text-[10px] opacity-60">({tag.screenCount})</span>
                        </button>
                      ))}
                      {!showAll && tags.length > CAP && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAllTagGroups((prev) => ({ ...prev, [groupName]: true })); }}
                          className="text-xs text-primary hover:underline px-1"
                        >
                          Show all {tags.length}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target by Proximity */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-muted-foreground" />
            <p className="skoop-section-header">Target by Proximity</p>
          </div>
          <p className="text-xs text-muted-foreground">Find screens near specific points of interest.</p>

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
                onSelect={(name) => { setPoiSearch(name); handleCampaignPoiSearch(name); }}
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
  };

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
            <p className="text-xs text-muted-foreground mt-0.5">Each window defines which days, times, and date range this campaign competes for inventory.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={addWindow}>
            <Plus size={13} className="mr-1" /> Add window
          </Button>
        </div>

        <div className="space-y-3">
          {timeWindows.map((w, idx) => {
            const allDatesSelected = !w.windowStartDate && !w.windowEndDate;
            return (
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

                {/* Date sub-range */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground">Date Range</label>
                    <button
                      onClick={() => updateWindow(w.id, { windowStartDate: "", windowEndDate: "" })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        allDatesSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      All dates
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      className="flex-1 text-xs h-8"
                      min={startDate || undefined}
                      max={w.windowEndDate || endDate || undefined}
                      value={w.windowStartDate}
                      placeholder={startDate || "Campaign start"}
                      onChange={(e) => updateWindow(w.id, { windowStartDate: e.target.value })}
                    />
                    <span className="text-muted-foreground text-xs shrink-0">→</span>
                    <Input
                      type="date"
                      className="flex-1 text-xs h-8"
                      min={w.windowStartDate || startDate || undefined}
                      max={endDate || undefined}
                      value={w.windowEndDate}
                      placeholder={endDate || "Campaign end"}
                      onChange={(e) => updateWindow(w.id, { windowEndDate: e.target.value })}
                    />
                  </div>
                  {!allDatesSelected && (
                    <p className="text-[10px] text-muted-foreground">
                      {w.windowStartDate || (startDate ? `from ${startDate}` : "campaign start")} → {w.windowEndDate || (endDate ? `until ${endDate}` : "campaign end")}
                    </p>
                  )}
                </div>

                {/* Day picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground">Days of Week</label>
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
                </div>

                {/* Time range */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground">Time of Day</label>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground">From</label>
                      <Input
                        type="time"
                        className="mt-0.5 w-32 text-sm"
                        value={w.startTime}
                        onChange={(e) => updateWindow(w.id, { startTime: e.target.value })}
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">→</span>
                    <div>
                      <label className="text-[10px] text-muted-foreground">To</label>
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
                          const mins = (eh * 60 + em) - (sh * 60 + sm);
                          if (mins <= 0) return null;
                          const hrs = Math.floor(mins / 60);
                          const rem = mins % 60;
                          return hrs > 0 && rem === 0 ? `${hrs}h / day` : hrs > 0 ? `${hrs}h ${rem}m / day` : `${rem}m / day`;
                        })()}
                      </div>
                    )}
                  </div>
                  {w.startTime === "00:00" && w.endTime === "23:59" && (
                    <p className="text-[10px] text-muted-foreground">All hours</p>
                  )}
                </div>
              </div>
            );
          })}
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

            {/* Over-delivery buffer — only for play-based goals */}
            {(deliveryGoalType === "total" || deliveryGoalType === "plays-per-day") && (
              <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Over-delivery buffer</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      System targets slightly more than the sold amount to ensure full delivery
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0} max={50} step={0.5}
                      className="w-20 text-right"
                      value={targetBufferPct}
                      onChange={(e) => setTargetBufferPct(Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                {targetBufferPct > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Sold:{" "}
                    <span className="font-medium text-foreground">
                      {deliveryGoalType === "total"
                        ? `${totalPlays.toLocaleString()} plays`
                        : `${playsPerDay.toLocaleString()} plays/screen/day`}
                    </span>
                    {" → "}System targets:{" "}
                    <span className="font-medium text-foreground">
                      {deliveryGoalType === "total"
                        ? `${Math.round(totalPlays * (1 + targetBufferPct / 100)).toLocaleString()} plays`
                        : `${Math.round(playsPerDay * (1 + targetBufferPct / 100)).toLocaleString()} plays/screen/day`}
                    </span>
                  </p>
                )}
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

      </div>
    );
  };

  const renderStep5 = () => {
    if (campaignType === "programmatic") {
      return (
        <div className="skoop-card p-5 space-y-5">
          <p className="skoop-section-header">Content</p>
          <p className="text-xs text-muted-foreground">
            This is a programmatic campaign. The SSP will supply creatives at play time — no manual assets are needed.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">SSP Partner <span className="text-muted-foreground/60">(optional)</span></label>
              <Input
                placeholder="e.g. Google Ad Manager, Xandr, Vistar"
                className="mt-1"
                value={sspPartner}
                onChange={(e) => setSspPartner(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">API Key / Integration Info <span className="text-muted-foreground/60">(optional)</span></label>
              <Input
                placeholder="e.g. API key, account ID, endpoint URL"
                className="mt-1"
                value={sspApiKey}
                onChange={(e) => setSspApiKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Default Creative Duration (seconds)</label>
              <p className="text-[11px] text-muted-foreground mb-1">Used to estimate screen time allocation. The SSP determines actual ad length at play time.</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  className="w-24"
                  value={sspAvgDuration}
                  onChange={(e) => setSspAvgDuration(Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">sec</span>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Delivery behaviour</p>
              <p className="text-xs text-muted-foreground">
                Slots assigned to this campaign will be offered to the SSP via bid request. If the SSP returns no fill, the slot falls through to the next priority in the fill waterfall — determined by the Fill Enabled setting on the previous step.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const totalRunSec = creatives.reduce((sum, c) => sum + c.duration, 0);

    return (
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Content</p>
        <p className="text-xs text-muted-foreground">Add assets for this campaign using the right sidebar</p>

        {creatives.length > 0 ? (
          <div className="space-y-2">
            {creatives.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {c.type === "Website" ? (
                    <Globe size={14} className="text-primary shrink-0" />
                  ) : (
                    <ImageIcon size={14} className="text-primary shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.type}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    type="number"
                    min={1}
                    max={3600}
                    className="w-16 h-7 text-xs px-2 text-right"
                    value={c.duration}
                    onChange={(e) => updateCreativeDuration(c.id, Math.max(1, Number(e.target.value)))}
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                  <button
                    onClick={() => removeCreative(c.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">Total run per play</span>
              <span className="text-xs font-medium tabular-nums">{totalRunSec}s</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-muted-foreground text-xs">
            No assets added yet — use the sidebar to add Media or Website content.
          </div>
        )}
      </div>
    );
  };

  const renderContentSidebar = () => {
    const filteredMedia = MOCK_MEDIA_ITEMS.filter((m) =>
      m.name.toLowerCase().includes(contentSearch.toLowerCase())
    );
    const filteredWebsites = MOCK_WEBSITE_ITEMS.filter((w) =>
      w.name.toLowerCase().includes(contentSearch.toLowerCase())
    );

    if (contentView === "media") {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => { setContentView("list"); setContentSearch(""); setMediaCtxMenu(null); setShowMediaUploadMenu(false); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Media
            </button>
            <div className="relative" ref={mediaUploadMenuRef}>
              <button
                onClick={() => setShowMediaUploadMenu((v) => !v)}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
              </button>
              {showMediaUploadMenu && (
                <div className="absolute right-0 top-9 z-20 bg-card border border-border rounded-md shadow-md w-36 py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors"
                    onClick={() => setShowMediaUploadMenu(false)}
                  >
                    Upload File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex gap-2 px-3 py-2 border-b border-border">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Content"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background"
              />
            </div>
            <select className="h-8 rounded-md border border-input px-2 text-xs bg-background">
              <option>All</option>
              <option>Images</option>
              <option>Videos</option>
            </select>
          </div>

          {/* Content grid */}
          <div
            className="flex-1 overflow-y-auto p-3"
            onClick={() => { setMediaCtxMenu(null); setShowMediaUploadMenu(false); }}
          >
            {/* Folders */}
            {contentSearch === "" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MOCK_MEDIA_FOLDERS.map((f) => (
                  <button
                    key={f.id}
                    className="flex items-center gap-1.5 border border-border rounded-md px-2 py-2 text-xs text-left hover:bg-secondary transition-colors"
                  >
                    <Folder size={14} className="text-muted-foreground shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Media items grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredMedia.map((item) => (
                <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                  <div className={`h-20 ${item.color} flex items-center justify-center`} />
                  <div className="absolute top-1.5 right-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }}
                      className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <MoreHorizontal size={12} />
                    </button>
                    {mediaCtxMenu === item.id && (
                      <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2"
                          onClick={(e) => { e.stopPropagation(); addCreative(item.name, "Media"); setMediaCtxMenu(null); }}
                        >
                          <Plus size={12} /> Add to campaign
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2"
                          onClick={(e) => { e.stopPropagation(); setMediaCtxMenu(null); }}
                        >
                          <ImageIcon size={12} /> Preview
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (contentView === "website") {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => { setContentView("list"); setContentSearch(""); setShowWebsiteForm(false); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Website
            </button>
            <button
              onClick={() => setShowWebsiteForm((v) => !v)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${showWebsiteForm ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {showWebsiteForm ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>

          {showWebsiteForm ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={newWebsiteTitle}
                  onChange={(e) => setNewWebsiteTitle(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Website URL</label>
                <input
                  type="text"
                  placeholder="Enter Website URL"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl(""); }}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (newWebsiteTitle) { addCreative(newWebsiteTitle, "Website"); }
                    setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl("");
                  }}
                  disabled={!newWebsiteTitle}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search Content"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background"
                  />
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-3"
                onClick={() => setMediaCtxMenu(null)}
              >
                <div className="grid grid-cols-2 gap-2">
                  {filteredWebsites.map((item) => (
                    <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                      <div className="h-20 bg-gradient-to-br from-sky-100 to-blue-200" />
                      <div className="absolute top-1.5 right-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }}
                          className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <MoreHorizontal size={12} />
                        </button>
                        {mediaCtxMenu === item.id && (
                          <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); addCreative(item.name, "Website"); setMediaCtxMenu(null); }}
                            >
                              <Plus size={12} /> Add to campaign
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); setMediaCtxMenu(null); }}
                            >
                              <Globe size={12} /> Preview
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="text-[11px] truncate">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Default list view
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Content</h2>
        </div>
        <div className="px-3 py-2 border-b border-border">
          <input
            type="text"
            placeholder="Type to search apps"
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            className="w-full h-8 rounded-md border border-input px-3 text-xs bg-background"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {[
            { label: "Media", icon: <ImageIcon size={16} className="text-primary" /> },
            { label: "Website", icon: <Globe size={16} className="text-primary" /> },
          ]
            .filter((item) => item.label.toLowerCase().includes(contentSearch.toLowerCase()))
            .map((item) => (
              <button
                key={item.label}
                onClick={() => { setContentView(item.label.toLowerCase() as "media" | "website"); setContentSearch(""); }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border"
              >
                <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            ))}
        </div>
      </div>
    );
  };

  const renderStep6 = () => {

    const totalDays = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 30;
    const totalEstimated = estimatedDailyPlays * totalDays;
    const hasConflict = capacitySummary ? !capacitySummary.fits : false;
    const hasPendingCreatives = false;

    const deliveryTargetLabel = !hasTarget
      ? "None (fill only)"
      : deliveryGoalType === "sov"
      ? `${sovValue}% of screen time`
      : deliveryGoalType === "plays-per-day"
      ? `${playsPerDay.toLocaleString()} plays/screen/day${targetBufferPct > 0 ? ` → ${Math.round(playsPerDay * (1 + targetBufferPct / 100)).toLocaleString()} w/ ${targetBufferPct}% buffer` : ''}`
      : `${totalPlays.toLocaleString()} total plays${targetBufferPct > 0 ? ` → ${Math.round(totalPlays * (1 + targetBufferPct / 100)).toLocaleString()} w/ ${targetBufferPct}% buffer` : ''}`;

    const fillBehaviorLabel = !hasTarget
      ? "Fill only"
      : fillEnabled
      ? "Target then fill"
      : "Target, no fill";

    const ready = !hasConflict && campaignName && selectedTags.length > 0;

    return (
      <div className="space-y-4">
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Campaign Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Campaign Name</p><p className="text-sm font-medium">{campaignName || "Untitled"}</p></div>
            <div><p className="text-xs text-muted-foreground">Campaign Type</p><p className="text-sm font-medium capitalize">{campaignType}</p></div>
            {campaignType === "programmatic" && sspPartner && <div><p className="text-xs text-muted-foreground">SSP Partner</p><p className="text-sm font-medium">{sspPartner}</p></div>}
            {campaignType === "standard" && <div><p className="text-xs text-muted-foreground">Paid Campaign</p><p className="text-sm font-medium">{isPaid ? "Yes" : "No"}</p></div>}
            {campaignType === "standard" && isPaid && advertiser && <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{advertiser}</p></div>}
            {campaignType === "standard" && isPaid && dealValue && <div><p className="text-xs text-muted-foreground">Deal Value</p><p className="text-sm font-medium tabular-nums">${Number(dealValue).toLocaleString()}</p></div>}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Targeting</p>
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">No tags selected</p>
              )}
            </div>
            <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium tabular-nums">{capacitySummary?.totalScreens.toLocaleString() || 0}</p></div>
            <div><p className="text-xs text-muted-foreground">Schedule</p><p className="text-sm font-medium">{startDate || "—"} → {endDate || "—"}</p></div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Active Hours</p>
              <div className="mt-1 space-y-0.5">
                {timeWindows.map((w) => {
                  const allDates = !w.windowStartDate && !w.windowEndDate;
                  const allTime = w.startTime === "00:00" && w.endTime === "23:59";
                  const dateLabel = allDates ? "All dates" : `${w.windowStartDate || "start"} → ${w.windowEndDate || "end"}`;
                  const timeLabel = allTime ? "All hours" : `${w.startTime} – ${w.endTime}`;
                  const dayLabel = w.days.length === 7 ? "Every day" : w.days.join(", ");
                  return (
                    <p key={w.id} className="text-sm font-medium">
                      {dateLabel} · {dayLabel} · {timeLabel}
                    </p>
                  );
                })}
              </div>
            </div>
            <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">{deliveryTargetLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Fill Behavior</p><p className="text-sm font-medium">{fillBehaviorLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Content</p><p className="text-sm font-medium">{campaignType === "programmatic" ? (sspPartner || "Programmatic SSP") : `${creatives.length} asset${creatives.length !== 1 ? "s" : ""} uploaded`}</p></div>
            {campaignType === "programmatic"
              ? <div><p className="text-xs text-muted-foreground">Default Duration</p><p className="text-sm font-medium tabular-nums">{sspAvgDuration}s per ad</p></div>
              : creatives.length > 0 && <div><p className="text-xs text-muted-foreground">Total Run Per Play</p><p className="text-sm font-medium tabular-nums">{creatives.reduce((s, c) => s + c.duration, 0)}s</p></div>
            }
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
    if (!capacitySummary || (selectedTags.length === 0 && proximityPOIs.length === 0)) return null;
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
    <div className="flex flex-col h-screen">
      {/* Breadcrumb */}
      <div className="px-8 pt-4 pb-0 shrink-0">
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

      <div className="shrink-0">
        <PageHeader
          title="Create Campaign"
          subtitle="Campaigns define what content runs, when it runs, and how it is delivered"
          icon={<Megaphone size={20} />}
          actions={<Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Cancel</Button>}
        />
      </div>

      {/* Step indicator */}
      <div className="border-b border-border px-8 py-4 shrink-0">
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

      {/* Content area — fills remaining height */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className={step !== 4 ? "flex gap-6" : ""}>
            <div className={step !== 4 ? "flex-1 max-w-3xl" : "max-w-3xl"}>
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

            {/* Capacity panel — only shown on non-creatives steps */}
            {step !== 4 && step < 5 && renderCapacityPanel()}
          </div>
        </div>

        {/* Full-height content sidebar — only on What Plays step for standard campaigns */}
        {step === 4 && campaignType === "standard" && (
          <div className="w-[340px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
            {renderContentSidebar()}
          </div>
        )}
      </div>
    </div>
  );
}
