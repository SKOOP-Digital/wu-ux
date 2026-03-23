import { MapPin, ArrowLeft, Monitor, AlertTriangle, Info, Plus, CheckCircle2, Search, ChevronDown, Trash2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";

import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allScreens } from "@/data/screens";
import { allPlacements, calcCapacity } from "@/data/placements";
import { toast } from "@/hooks/use-toast";




const mockCampaigns = [
  { id: "1", name: "Nike Summer Push", type: "Direct", target: "5,000 plays", delivered: "3,100", pct: 62, status: "Live" },
  { id: "2", name: "Coca-Cola Lobby Spots", type: "Direct", target: "SoV 15%", delivered: "1,800", pct: 72, status: "Under-delivering" },
  { id: "3", name: "Brand Awareness — Q1", type: "Owned", target: "SoV 50%", delivered: "48,000", pct: 96, status: "Live" },
];

export default function PlacementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = !id;

  const defaultDraft: typeof allPlacements[0] = {
    id: "new",
    name: "Untitled Rule",
    scope: "Screen",
    venue: "",
    venueType: "",
    region: "",
    model: "Loop",
    owned: 50,
    direct: 30,
    prog: 20,
    dayparts: "All Day",
    activeHours: 16,
    status: "Draft",
    screenCount: 0,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 0,
  };

  const placement = isNew ? defaultDraft : (allPlacements.find((p) => p.id === id) ?? allPlacements[0]);

  const isDraft = isNew || placement.status === "Draft" || placement.status === "New";
  const stateLabel = isDraft ? (isNew ? "New Rule" : "Draft Rule") : "Live Rule";
  const stateColor = isDraft ? "bg-skoop-amber-light text-skoop-amber" : "bg-skoop-aqua-light text-skoop-aqua";

  
  const [owned, setOwned] = useState(placement.owned);
  const [direct, setDirect] = useState(placement.direct);
  const [screenIds, setScreenIds] = useState<string[]>(placement.screenIds);
  const [placementName, setPlacementName] = useState(isNew ? "" : placement.name);
  
  const [screenSearch, setScreenSearch] = useState("");
  const [screenVenueFilter, setScreenVenueFilter] = useState("All");
  const [playbackModel, setPlaybackModel] = useState<"Loop" | "Ad-break">(placement.model as "Loop" | "Ad-break");
  const [defaultPlayDuration, setDefaultPlayDuration] = useState<string>("15");
  const [customDuration, setCustomDuration] = useState<number>(20);
  const [servingRulesOpen, setServingRulesOpen] = useState(false);
  const [section1Open, setSection1Open] = useState(false);
  const [section2Open, setSection2Open] = useState(false);
  const [section3Open, setSection3Open] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);

  const [catSeparation, setCatSeparation] = useState(true);
  const [catSeparationGap, setCatSeparationGap] = useState(2);
  const [backToBack, setBackToBack] = useState(true);
  const [freqCap, setFreqCap] = useState(4);
  const [noFillFallback, setNoFillFallback] = useState(true);
  

  const [dayparts, setDayparts] = useState([
    { id: "dp-1", name: "Morning", start: "06:00", end: "11:00", active: true },
    { id: "dp-2", name: "Midday", start: "11:00", end: "14:00", active: true },
    { id: "dp-3", name: "Afternoon", start: "14:00", end: "17:00", active: true },
    { id: "dp-4", name: "Evening", start: "17:00", end: "21:00", active: true },
    { id: "dp-5", name: "Late Night", start: "21:00", end: "00:00", active: false },
  ]);

  const addDaypart = () => {
    const dpId = `dp-${Date.now()}`;
    setDayparts(prev => [...prev, { id: dpId, name: "New Window", start: "09:00", end: "17:00", active: true }]);
  };

  const removeDaypart = (dpId: string) => {
    setDayparts(prev => prev.filter(dp => dp.id !== dpId));
  };

  const updateDaypart = (dpId: string, field: string, value: string | boolean) => {
    setDayparts(prev => prev.map(dp => dp.id === dpId ? { ...dp, [field]: value } : dp));
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const activeHours = useMemo(() => {
    return dayparts.filter(dp => dp.active).reduce((sum, dp) => {
      const [sh, sm] = dp.start.split(":").map(Number);
      const [eh, em] = dp.end.split(":").map(Number);
      let hours = (eh * 60 + em - sh * 60 - sm) / 60;
      if (hours <= 0) hours += 24;
      return sum + hours;
    }, 0);
  }, [dayparts]);

  const playDurationSeconds = useMemo(() => {
    if (defaultPlayDuration === "custom") return customDuration;
    return Number(defaultPlayDuration);
  }, [defaultPlayDuration, customDuration]);

  const calcPlaysPerDay = (screen: { loopsPerHour: number }) => {
    const totalSeconds = screen.loopsPerHour * 60 * activeHours;
    return Math.floor(totalSeconds / playDurationSeconds);
  };

  const canPublish = screenIds.length > 0 && placementName.trim().length > 0 && dayparts.some(d => d.active);

  const handlePublish = () => {
    if (!canPublish) {
      toast({ title: "Cannot publish", description: "Assign screens, set a name, and configure at least one active time window.", variant: "destructive" });
      return;
    }
    const newId = `pl-${Date.now()}`;
    const venues = [...new Set(allScreens.filter(s => screenIds.includes(s.id)).map(s => s.venue))];
    const newPlacement: typeof allPlacements[0] = {
      id: newId,
      name: placementName,
      scope: screenIds.length === 1 ? "Screen" : "Group",
      venue: venues[0] || "",
      venueType: "",
      region: venues.join(", "),
      model: playbackModel,
      owned,
      direct,
      prog: Math.max(0, 100 - owned - direct),
      dayparts: dayparts.filter(d => d.active).map(d => d.name).join(", ") || "All Day",
      activeHours: activeHours,
      status: "Healthy",
      screenCount: screenIds.length,
      screenIds: [...screenIds],
      defaultPlayDuration: defaultPlayDuration === "custom" ? customDuration : parseInt(defaultPlayDuration),
      capacityUsagePct: 0,
    };
    allPlacements.push(newPlacement);
    toast({ title: "Network rule published successfully", description: `${placementName} is now live.` });
    navigate("/placements");
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft saved", description: `${placementName || "Untitled"} saved as draft.` });
  };

  const prog = 100 - owned - direct;


  const assignedScreens = useMemo(
    () => allScreens.filter((s) => screenIds.includes(s.id)),
    [screenIds]
  );

  const totalPlaysPerDay = useMemo(() => {
    if (screenIds.length === 0) return 0;
    return assignedScreens.reduce((sum, s) => sum + calcPlaysPerDay(s), 0);
  }, [screenIds, assignedScreens, playDurationSeconds, activeHours]);

  const capacity = useMemo(
    () => calcCapacity(screenIds, allScreens),
    [screenIds]
  );

  const venues = useMemo(() => {
    const set = new Set(assignedScreens.map((s) => s.venue));
    return Array.from(set);
  }, [assignedScreens]);

  const venueScreenCounts = useMemo(() => {
    const map: Record<string, { total: number; selected: number }> = {};
    allScreens.forEach((s) => {
      if (!map[s.venue]) map[s.venue] = { total: 0, selected: 0 };
      map[s.venue].total++;
      if (screenIds.includes(s.id)) map[s.venue].selected++;
    });
    return map;
  }, [screenIds]);

  const scopeLabel = useMemo(() => {
    if (venues.length === 0) return "No screens assigned";
    const allFull = venues.every((v) => venueScreenCounts[v]?.selected === venueScreenCounts[v]?.total);
    if (allFull && venues.length === 1) return `All screens in ${venues[0]}`;
    if (allFull) return `All screens across ${venues.length} venues`;
    return `${assignedScreens.length} selected screen${assignedScreens.length !== 1 ? "s" : ""} in ${venues.join(", ")}`;
  }, [venues, venueScreenCounts, assignedScreens.length]);

  const capacityFormula = useMemo(() => {
    if (assignedScreens.length === 0) return null;
    const hrs = Math.round(activeHours);
    return `${assignedScreens.length} screen${assignedScreens.length !== 1 ? "s" : ""} × ${hrs} active hours × ${playDurationSeconds}s play duration = ${totalPlaysPerDay.toLocaleString()} plays/day`;
  }, [assignedScreens, totalPlaysPerDay, activeHours, playDurationSeconds]);

  const ownedCap = Math.round(totalPlaysPerDay * owned / 100);
  const directCap = Math.round(totalPlaysPerDay * direct / 100);
  const progCap = Math.round(totalPlaysPerDay * Math.max(0, prog) / 100);

  const forecastItems = useMemo(() => {
    const items: { label: string; status: string; statusLabel: string }[] = [];
    if (isDraft) {
      items.push({ label: "Status", status: "draft", statusLabel: "Draft — not yet active" });
      return items;
    }
    const utilPct = capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0;
    if (utilPct < 70) items.push({ label: "Overall utilisation", status: "healthy", statusLabel: "On track" });
    else if (utilPct < 90) items.push({ label: "Overall utilisation", status: "at-risk", statusLabel: "Direct allocation nearing limit" });
    else items.push({ label: "Overall utilisation", status: "overbooked", statusLabel: "Capacity near maximum" });
    if (prog > 10) items.push({ label: "Programmatic", status: "healthy", statusLabel: "Backfill available" });
    if (direct > 40) items.push({ label: "Direct campaigns", status: "at-risk", statusLabel: "Under-delivery risk for booked direct" });
    if (items.length === 0) items.push({ label: "Status", status: "healthy", statusLabel: "No conflicts detected" });
    return items;
  }, [capacity, prog, direct, isDraft]);

  const activeCampaigns = isDraft ? [] : mockCampaigns;

  // Inline screen picker data
  const screenVenues = useMemo(() => {
    const set = new Set(allScreens.map(s => s.venue));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredScreens = useMemo(() => {
    return allScreens.filter(s => {
      if (screenSearch && !s.name.toLowerCase().includes(screenSearch.toLowerCase()) && !s.venue.toLowerCase().includes(screenSearch.toLowerCase())) return false;
      if (screenVenueFilter !== "All" && s.venue !== screenVenueFilter) return false;
      return true;
    });
  }, [screenSearch, screenVenueFilter]);

  const toggleScreen = (sid: string) => {
    setScreenIds(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const selectAllFiltered = () => {
    const ids = filteredScreens.map(s => s.id);
    const allSelected = ids.every(id => screenIds.includes(id));
    if (allSelected) {
      setScreenIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setScreenIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const hasScreens = screenIds.length > 0;

  // ===== NEW PLACEMENT: single scrolling page =====
  if (isNew) {
    return (
      <TooltipProvider>
        <div>
          <div className="px-8 pt-4 pb-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/placements">Network Rules</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Rule</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <PageHeader
            title="New Rule"
            subtitle="Define how ads run on selected screens"
            icon={<MapPin size={20} />}
            actions={
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium ${stateColor}`}>
                  {stateLabel}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate("/placements")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>Save Draft</Button>
                <Button size="sm" onClick={handlePublish} disabled={!canPublish}>Publish Rule</Button>
              </div>
            }
          />

          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Main content — single scroll */}
              <div className="col-span-2 space-y-5">

                {/* ===== SECTION 1: Name & Screens ===== */}
                {(() => {
                  const s1Complete = placementName.trim().length > 0 && screenIds.length > 0;
                  const s1Summary = s1Complete
                    ? `${placementName} · ${screenIds.length} screen${screenIds.length !== 1 ? "s" : ""}`
                    : placementName.trim() ? `${placementName} · No screens assigned` : "No name set · No screens assigned";
                  return (
                    <Collapsible open={section1Open} onOpenChange={setSection1Open}>
                      <CollapsibleTrigger className={`w-full rounded-lg border transition-colors ${s1Complete ? "border-l-[3px] border-l-primary border-y-border border-r-border bg-background" : "border-l-[3px] border-l-amber-400 border-y-border border-r-border bg-amber-50/30"}`}>
                        <div className="flex items-center gap-3 px-5 py-4">
                          <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${s1Complete ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-muted-foreground"}`}>1</span>
                          <span className="text-base mr-2">📺</span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-foreground">Name & Screens</p>
                            <p className="text-xs text-muted-foreground truncate">{s1Summary}</p>
                          </div>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section1Open ? "rotate-180" : ""}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 pb-5 pt-2 space-y-5">
                          {/* Rule Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Rule Name</label>
                            <input
                              type="text"
                              value={placementName}
                              onChange={(e) => setPlacementName(e.target.value)}
                              placeholder="e.g. Lobby Screens — Main Loop"
                              className="w-full text-sm border border-border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            {placementName.trim() === "" && (
                              <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> Required to publish</p>
                            )}
                          </div>

                          {/* Inline Screen Picker */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-foreground">Screens</label>
                                <p className="text-xs text-muted-foreground mt-0.5">Select which screens this rule applies to</p>
                              </div>
                              {screenIds.length > 0 && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {screenIds.length} selected · {totalPlaysPerDay.toLocaleString()} plays/day
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="Search screens or locations…"
                                  value={screenSearch}
                                  onChange={(e) => setScreenSearch(e.target.value)}
                                  className="pl-9 h-9 text-sm"
                                />
                              </div>
                              <div className="flex gap-1">
                                {screenVenues.map(v => (
                                  <button
                                    key={v}
                                    onClick={(e) => { e.stopPropagation(); setScreenVenueFilter(v); }}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                      screenVenueFilter === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 px-1">
                              <button onClick={selectAllFiltered} className="text-xs text-primary hover:underline font-medium">
                                {filteredScreens.every(s => screenIds.includes(s.id)) && filteredScreens.length > 0 ? "Deselect all" : "Select all"}
                              </button>
                              {screenIds.length > 0 && (
                                <button onClick={() => setScreenIds([])} className="text-xs text-muted-foreground hover:text-destructive hover:underline font-medium">
                                  Clear selection
                                </button>
                              )}
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
                              {filteredScreens.map(s => {
                                const isSelected = screenIds.includes(s.id);
                                const dailyPlays = calcPlaysPerDay(s);
                                return (
                                  <label
                                    key={s.id}
                                    className={`flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-colors border-b border-border last:border-0 ${
                                      isSelected ? "bg-primary/5" : "hover:bg-secondary/50"
                                    }`}
                                  >
                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleScreen(s.id)} />
                                    <Monitor size={14} className="text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{s.name}</p>
                                      <p className="text-xs text-muted-foreground">{s.venue} · {s.resolution} · {s.orientation}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground tabular-nums">{dailyPlays.toLocaleString()} plays/day</span>
                                  </label>
                                );
                              })}
                              {filteredScreens.length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground">No screens match your search</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })()}

                {/* ===== SECTION 2: Schedule ===== */}
                {(() => {
                  const activeDaypartCount = dayparts.filter(d => d.active).length;
                  const s2Complete = activeDaypartCount > 0;
                  const s2Summary = s2Complete
                    ? `${playbackModel === "Loop" ? "Continuous Loop" : "Ad Breaks"} · ${Math.round(activeHours)} active hours/day`
                    : "Not configured yet";
                  return (
                    <Collapsible open={section2Open} onOpenChange={setSection2Open}>
                      <CollapsibleTrigger className={`w-full rounded-lg border transition-colors ${s2Complete ? "border-l-[3px] border-l-primary border-y-border border-r-border bg-background" : "border-l-[3px] border-l-amber-400 border-y-border border-r-border bg-amber-50/30"}`}>
                        <div className="flex items-center gap-3 px-5 py-4">
                          <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${s2Complete ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-muted-foreground"}`}>2</span>
                          <span className="text-base mr-2">🕐</span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-foreground">Schedule</p>
                            <p className="text-xs text-muted-foreground truncate">{s2Summary}</p>
                          </div>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section2Open ? "rotate-180" : ""}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 pb-5 pt-2 space-y-5">
                          {/* How Ads Play toggle */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">How Ads Play</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setPlaybackModel("Loop")}
                                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                                  playbackModel === "Loop"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                                }`}
                              >
                                <p className="font-medium">{playbackModel === "Loop" ? "✓ " : ""}Continuous Loop</p>
                                <p className="text-xs mt-0.5 font-normal opacity-70">Content plays in a repeating loop</p>
                              </button>
                              <button
                                onClick={() => setPlaybackModel("Ad-break")}
                                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                                  playbackModel === "Ad-break"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                                }`}
                              >
                                <p className="font-medium">{playbackModel === "Ad-break" ? "✓ " : ""}Ad Breaks</p>
                                <p className="text-xs mt-0.5 font-normal opacity-70">Ads play in scheduled break windows</p>
                              </button>
                            </div>
                          </div>

                          {capacityFormula && (
                            <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
                              <Info size={14} className="text-primary mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-foreground">How capacity is calculated</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{capacityFormula}</p>
                              </div>
                            </div>
                          )}

                          {/* Active Hours */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-foreground">Active Hours</label>
                                <p className="text-xs text-muted-foreground mt-0.5">Campaigns can only run during these time windows</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={addDaypart}>
                                <Plus size={13} className="mr-1" /> Add Time Window
                              </Button>
                            </div>

                            {/* Visual timeline */}
                            <div className="flex h-8 rounded-md overflow-hidden border border-border">
                              {dayparts.map((dp) => {
                                const [sh] = dp.start.split(":").map(Number);
                                const [eh] = dp.end.split(":").map(Number);
                                let hours = eh - sh;
                                if (hours <= 0) hours += 24;
                                return (
                                  <div
                                    key={dp.id}
                                    className={`flex items-center justify-center text-[10px] font-medium border-r border-border last:border-0 ${dp.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                                    style={{ flex: hours }}
                                  >
                                    {formatTime(dp.start).replace(":00", "").toLowerCase()}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{dayparts.length > 0 ? formatTime(dayparts[0].start) : ""}</span>
                              <span>{dayparts.length > 0 ? formatTime(dayparts[dayparts.length - 1].end) : ""}</span>
                            </div>

                            <div className="space-y-2">
                              {dayparts.map((dp) => (
                                <div key={dp.id} className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary/50">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Switch
                                      checked={dp.active}
                                      onCheckedChange={(v) => updateDaypart(dp.id, "active", v)}
                                    />
                                    <input
                                      type="text"
                                      value={dp.name}
                                      onChange={(e) => updateDaypart(dp.id, "name", e.target.value)}
                                      className="text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-28"
                                    />
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <input
                                        type="time"
                                        value={dp.start}
                                        onChange={(e) => updateDaypart(dp.id, "start", e.target.value)}
                                        className="bg-background border border-border rounded px-1.5 py-1 text-xs w-[90px]"
                                      />
                                      <span>–</span>
                                      <input
                                        type="time"
                                        value={dp.end}
                                        onChange={(e) => updateDaypart(dp.id, "end", e.target.value)}
                                        className="bg-background border border-border rounded px-1.5 py-1 text-xs w-[90px]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusChip status={dp.active ? "active" : "paused"} label={dp.active ? "Active" : "Inactive"} />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => removeDaypart(dp.id)}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-md px-3 py-2">
                              <Info size={13} className="text-primary mt-0.5 shrink-0" />
                              <p className="text-[11px] text-muted-foreground">Currently <span className="font-medium text-foreground">{Math.round(activeHours)} active hours/day</span> across {dayparts.filter(d => d.active).length} time windows.</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })()}

                {/* ===== SECTION 3: Content Split & Rules ===== */}
                {(() => {
                  const s3Summary = `Owned ${owned}% · Direct ${direct}% · Programmatic ${Math.max(0, prog)}%`;
                  return (
                    <Collapsible open={section3Open} onOpenChange={setSection3Open}>
                      <CollapsibleTrigger className="w-full rounded-lg border border-l-[3px] border-l-primary border-y-border border-r-border bg-background transition-colors">
                        <div className="flex items-center gap-3 px-5 py-4">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">3</span>
                          <span className="text-base mr-2">📊</span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-foreground">Content Split & Rules</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Mini inline bar */}
                              <div className="flex h-2 w-24 rounded-full overflow-hidden">
                                <div className="bg-skoop-slate" style={{ width: `${owned}%` }} />
                                <div className="bg-skoop-blue" style={{ width: `${direct}%` }} />
                                <div className="bg-skoop-purple" style={{ width: `${Math.max(0, prog)}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{s3Summary}</p>
                            </div>
                          </div>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section3Open ? "rotate-180" : ""}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 pb-5 pt-2 space-y-6">
                          {/* Content Split */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-foreground">Content Split</label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info size={14} className="text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[240px]">
                                  <p className="text-xs leading-relaxed">
                                    <strong>Owned</strong> — Your own brand content<br />
                                    <strong>Direct</strong> — Booked campaigns<br />
                                    <strong>Programmatic</strong> — Automated ads
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Owned</span>
                                  <span className="tabular-nums font-medium">{owned}%{hasScreens ? ` · ${ownedCap.toLocaleString()} plays/day` : ""}</span>
                                </div>
                                <Slider value={[owned]} onValueChange={([v]) => { if (v + direct <= 100) setOwned(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-slate" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Direct</span>
                                  <span className="tabular-nums font-medium">{direct}%{hasScreens ? ` · ${directCap.toLocaleString()} plays/day` : ""}</span>
                                </div>
                                <Slider value={[direct]} onValueChange={([v]) => { if (owned + v <= 100) setDirect(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-blue" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Programmatic</span>
                                  <span className="tabular-nums font-medium">{Math.max(0, prog)}%{hasScreens ? ` · ${progCap.toLocaleString()} plays/day` : ""}</span>
                                </div>
                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full bg-skoop-purple rounded-full transition-all" style={{ width: `${Math.max(0, prog)}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Auto-calculated from remaining allocation</p>
                              </div>
                            </div>

                            <MixBar owned={owned} direct={direct} programmatic={Math.max(0, prog)} height="h-3" showLabels />
                          </div>

                          {/* Advanced Serving Rules — nested collapsible */}
                          <Collapsible open={servingRulesOpen} onOpenChange={setServingRulesOpen}>
                            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
                              <span className="text-sm font-medium text-foreground">Advanced Serving Rules</span>
                              <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${servingRulesOpen ? "rotate-180" : ""}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                                {/* Default Play Duration */}
                                <div className="flex items-center justify-between px-4 py-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">Default Play Duration</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">The standard length of one ad play on this rule. Used to calculate daily capacity.</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <SelectRoot value={defaultPlayDuration} onValueChange={setDefaultPlayDuration}>
                                      <SelectTrigger className="w-[100px] h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="10">10s</SelectItem>
                                        <SelectItem value="15">15s</SelectItem>
                                        <SelectItem value="30">30s</SelectItem>
                                        <SelectItem value="60">60s</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                      </SelectContent>
                                    </SelectRoot>
                                    {defaultPlayDuration === "custom" && (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={1}
                                          max={300}
                                          value={customDuration}
                                          onChange={(e) => setCustomDuration(Math.max(1, Number(e.target.value)))}
                                          className="w-16 h-8 text-xs border border-border rounded px-2 bg-background"
                                        />
                                        <span className="text-xs text-muted-foreground">sec</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between px-4 py-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">Category Separation</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Prevent competing brands from appearing in the same loop</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {catSeparation && (
                                      <select
                                        value={catSeparationGap}
                                        onChange={(e) => setCatSeparationGap(Number(e.target.value))}
                                        className="text-xs border border-border rounded px-2 py-1 bg-background"
                                      >
                                        {[1, 2, 3, 4, 5].map((n) => (
                                          <option key={n} value={n}>{n} slot{n > 1 ? "s" : ""} apart</option>
                                        ))}
                                      </select>
                                    )}
                                    <Switch checked={catSeparation} onCheckedChange={setCatSeparation} />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between px-4 py-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">Back-to-back Prevention</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Same creative cannot play consecutively</p>
                                  </div>
                                  <Switch checked={backToBack} onCheckedChange={setBackToBack} />
                                </div>

                                <div className="flex items-center justify-between px-4 py-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">Frequency Cap</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Maximum plays per unique creative per hour</p>
                                  </div>
                                  <select
                                    value={freqCap}
                                    onChange={(e) => setFreqCap(Number(e.target.value))}
                                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                      <option key={n} value={n}>{n} plays/hour</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center justify-between px-4 py-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">If No Ad Available, Show:</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Fall back to owned content when programmatic has no fill</p>
                                  </div>
                                  <Switch checked={noFillFallback} onCheckedChange={setNoFillFallback} />
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })()}
              </div>

              {/* ===== RIGHT PANEL ===== */}
              <div className="space-y-4">
                {/* Publish Readiness — always visible */}
                <div className="skoop-card p-5 space-y-3">
                  <p className="skoop-section-header">Publish Readiness</p>
                  <p className="text-[11px] text-muted-foreground">Complete these steps to publish this rule</p>
                  <div className="space-y-2.5 mt-1">
                    {[
                      { label: "Rule name", done: placementName.trim().length > 0 },
                      { label: "Screens assigned", done: screenIds.length > 0 },
                      { label: "Active hours configured", done: dayparts.some(d => d.active) },
                      { label: "Content split set", done: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={14} className={item.done ? "text-emerald-500" : "text-muted-foreground/40"} />
                        <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-border mt-3">
                    <p className="text-xs text-muted-foreground">Status: <span className="font-medium text-foreground">{canPublish ? "Ready to publish" : "Not ready"}</span></p>
                  </div>
                </div>

                {/* Draft Summary — only when screens assigned */}
                {hasScreens && (
                  <div className="skoop-card p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="skoop-section-header">Draft Summary</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Screens</span><span className="font-medium tabular-nums">{screenIds.length}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Capacity</span><span className="font-medium tabular-nums">{totalPlaysPerDay.toLocaleString()} plays/day</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Content Split</span><span className="font-medium tabular-nums">{owned}/{direct}/{Math.max(0, prog)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Hours</span><span className="font-medium tabular-nums">{dayparts.filter(d => d.active).length} windows</span></div>
                    </div>
                  </div>
                )}

                {/* Capacity Usage — only when screens assigned */}
                {hasScreens && (
                  <div className="skoop-card p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="skoop-section-header">Capacity Usage</p>
                    <p className="text-[11px] text-muted-foreground">Eligible plays based on selected screens, active hours, and play duration ({playDurationSeconds}s)</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{totalPlaysPerDay.toLocaleString()} plays/day</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} plays/day</span></div>
                      <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} plays/day</span></div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${totalPlaysPerDay > 0 ? Math.round((capacity.booked / totalPlaysPerDay) * 100) : 0}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">{totalPlaysPerDay > 0 ? Math.round((capacity.booked / totalPlaysPerDay) * 100) : 0}% utilised</p>
                  </div>
                )}

                {/* Capacity by Type — only when screens assigned */}
                {hasScreens && (
                  <div className="skoop-card p-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="skoop-section-header">Capacity by Type</p>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Owned ({owned}%)</span><span className="tabular-nums font-medium">{ownedCap.toLocaleString()} plays/day</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Direct ({direct}%)</span><span className="tabular-nums font-medium">{directCap.toLocaleString()} plays/day</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programmatic ({Math.max(0, prog)}%)</span><span className="tabular-nums font-medium">{progCap.toLocaleString()} plays/day</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // ===== EXISTING PLACEMENT: collapsible sections + Active Campaigns =====

  // Use rule-level data for capacity on existing rules
  const existingTotalPlays = placement.screenCount > 0
    ? Math.round(placement.screenCount * (3600 / (placement.defaultPlayDuration || 15)) * (placement.activeHours || 16))
    : totalPlaysPerDay;
  const existingBookedPlays = Math.round(existingTotalPlays * (placement.capacityUsagePct / 100));
  const existingAvailPlays = existingTotalPlays - existingBookedPlays;
  const existingOwnedCap = Math.round(existingTotalPlays * owned / 100);
  const existingDirectCap = Math.round(existingTotalPlays * direct / 100);
  const existingProgCap = Math.round(existingTotalPlays * Math.max(0, prog) / 100);

  return (
    <TooltipProvider>
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/placements">Network Rules</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{placement.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={placement.name}
        subtitle="Network Rule · Defines how ads run on selected screens"
        icon={<MapPin size={20} />}
        actions={
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium ${stateColor}`}>
              {stateLabel}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
            {isDraft ? (
              <>
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>Save Draft</Button>
                <Button size="sm" onClick={handlePublish} disabled={!canPublish}>Publish Rule</Button>
              </>
            ) : (
              <Button size="sm">Save Changes</Button>
            )}
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main content — collapsible sections */}
          <div className="col-span-2 space-y-5">

            {/* ===== SECTION 1: Name & Screens ===== */}
            {(() => {
              const screenCount = placement.screenCount || screenIds.length;
              const s1Complete = placementName.trim().length > 0 && screenCount > 0;
              const s1Summary = s1Complete
                ? `${placementName} · ${screenCount.toLocaleString()} screen${screenCount !== 1 ? "s" : ""}`
                : "Not configured";
              return (
                <Collapsible open={section1Open} onOpenChange={setSection1Open}>
                  <CollapsibleTrigger className={`w-full rounded-lg border transition-colors ${s1Complete ? "border-l-[3px] border-l-primary border-y-border border-r-border bg-background" : "border-l-[3px] border-l-amber-400 border-y-border border-r-border bg-amber-50/30"}`}>
                    <div className="flex items-center gap-3 px-5 py-4">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${s1Complete ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-muted-foreground"}`}>1</span>
                      <span className="text-base mr-2">📺</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground">Name & Screens</p>
                        <p className="text-xs text-muted-foreground truncate">{s1Summary}</p>
                      </div>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section1Open ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-5 pb-5 pt-2 space-y-5">
                      {/* Rule Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Rule Name</label>
                        <input
                          type="text"
                          value={placementName}
                          onChange={(e) => setPlacementName(e.target.value)}
                          placeholder="e.g. Financial Banks · Northeast"
                          className="w-full text-sm border border-border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      {/* Inline Screen Picker */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-foreground">Screens</label>
                            <p className="text-xs text-muted-foreground mt-0.5">Select which screens this rule applies to</p>
                          </div>
                          {screenIds.length > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {screenIds.length} selected · {totalPlaysPerDay.toLocaleString()} plays/day
                            </span>
                          )}
                          {screenIds.length === 0 && placement.screenCount > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {placement.screenCount.toLocaleString()} screens · {existingTotalPlays.toLocaleString()} plays/day
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search screens or locations…"
                              value={screenSearch}
                              onChange={(e) => setScreenSearch(e.target.value)}
                              className="pl-9 h-9 text-sm"
                            />
                          </div>
                          <div className="flex gap-1">
                            {screenVenues.map(v => (
                              <button
                                key={v}
                                onClick={(e) => { e.stopPropagation(); setScreenVenueFilter(v); }}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                  screenVenueFilter === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-1">
                          <button onClick={selectAllFiltered} className="text-xs text-primary hover:underline font-medium">
                            {filteredScreens.every(s => screenIds.includes(s.id)) && filteredScreens.length > 0 ? "Deselect all" : "Select all"}
                          </button>
                          {screenIds.length > 0 && (
                            <button onClick={() => setScreenIds([])} className="text-xs text-muted-foreground hover:text-destructive hover:underline font-medium">
                              Clear selection
                            </button>
                          )}
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
                          {filteredScreens.map(s => {
                            const isSelected = screenIds.includes(s.id);
                            const dailyPlays = calcPlaysPerDay(s);
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-colors border-b border-border last:border-0 ${
                                  isSelected ? "bg-primary/5" : "hover:bg-secondary/50"
                                }`}
                              >
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleScreen(s.id)} />
                                <Monitor size={14} className="text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{s.name}</p>
                                  <p className="text-xs text-muted-foreground">{s.venue} · {s.resolution} · {s.orientation}</p>
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums">{dailyPlays.toLocaleString()} plays/day</span>
                              </label>
                            );
                          })}
                          {filteredScreens.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">No screens match your search</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })()}

            {/* ===== SECTION 2: Schedule ===== */}
            {(() => {
              const activeDaypartCount = dayparts.filter(d => d.active).length;
              const s2Complete = activeDaypartCount > 0;
              const s2Summary = s2Complete
                ? `${playbackModel === "Loop" ? "Continuous Loop" : "Ad Breaks"} · ${Math.round(activeHours)} active hours/day`
                : "Not configured yet";
              return (
                <Collapsible open={section2Open} onOpenChange={setSection2Open}>
                  <CollapsibleTrigger className={`w-full rounded-lg border transition-colors ${s2Complete ? "border-l-[3px] border-l-primary border-y-border border-r-border bg-background" : "border-l-[3px] border-l-amber-400 border-y-border border-r-border bg-amber-50/30"}`}>
                    <div className="flex items-center gap-3 px-5 py-4">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${s2Complete ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-muted-foreground"}`}>2</span>
                      <span className="text-base mr-2">🕐</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground">Schedule</p>
                        <p className="text-xs text-muted-foreground truncate">{s2Summary}</p>
                      </div>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section2Open ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-5 pb-5 pt-2 space-y-5">
                      {/* How Ads Play toggle */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">How Ads Play</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPlaybackModel("Loop")}
                            className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                              playbackModel === "Loop"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                            }`}
                          >
                            <p className="font-medium">{playbackModel === "Loop" ? "✓ " : ""}Continuous Loop</p>
                            <p className="text-xs mt-0.5 font-normal opacity-70">Content plays in a repeating loop</p>
                          </button>
                          <button
                            onClick={() => setPlaybackModel("Ad-break")}
                            className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                              playbackModel === "Ad-break"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                            }`}
                          >
                            <p className="font-medium">{playbackModel === "Ad-break" ? "✓ " : ""}Ad Breaks</p>
                            <p className="text-xs mt-0.5 font-normal opacity-70">Ads play in scheduled break windows</p>
                          </button>
                        </div>
                      </div>

                      {capacityFormula && (
                        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
                          <Info size={14} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">How capacity is calculated</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{capacityFormula}</p>
                          </div>
                        </div>
                      )}

                      {/* Active Hours */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-foreground">Active Hours</label>
                            <p className="text-xs text-muted-foreground mt-0.5">Campaigns can only run during these time windows</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={addDaypart}>
                            <Plus size={13} className="mr-1" /> Add Time Window
                          </Button>
                        </div>

                        {/* Visual timeline */}
                        <div className="flex h-8 rounded-md overflow-hidden border border-border">
                          {dayparts.map((dp) => {
                            const [sh] = dp.start.split(":").map(Number);
                            const [eh] = dp.end.split(":").map(Number);
                            let hours = eh - sh;
                            if (hours <= 0) hours += 24;
                            return (
                              <div
                                key={dp.id}
                                className={`flex items-center justify-center text-[10px] font-medium border-r border-border last:border-0 ${dp.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                                style={{ flex: hours }}
                              >
                                {formatTime(dp.start).replace(":00", "").toLowerCase()}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{dayparts.length > 0 ? formatTime(dayparts[0].start) : ""}</span>
                          <span>{dayparts.length > 0 ? formatTime(dayparts[dayparts.length - 1].end) : ""}</span>
                        </div>

                        <div className="space-y-2">
                          {dayparts.map((dp) => (
                            <div key={dp.id} className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary/50">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Switch
                                  checked={dp.active}
                                  onCheckedChange={(v) => updateDaypart(dp.id, "active", v)}
                                />
                                <input
                                  type="text"
                                  value={dp.name}
                                  onChange={(e) => updateDaypart(dp.id, "name", e.target.value)}
                                  className="text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-28"
                                />
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <input
                                    type="time"
                                    value={dp.start}
                                    onChange={(e) => updateDaypart(dp.id, "start", e.target.value)}
                                    className="bg-background border border-border rounded px-1.5 py-1 text-xs w-[90px]"
                                  />
                                  <span>–</span>
                                  <input
                                    type="time"
                                    value={dp.end}
                                    onChange={(e) => updateDaypart(dp.id, "end", e.target.value)}
                                    className="bg-background border border-border rounded px-1.5 py-1 text-xs w-[90px]"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusChip status={dp.active ? "active" : "paused"} label={dp.active ? "Active" : "Inactive"} />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeDaypart(dp.id)}
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-md px-3 py-2">
                          <Info size={13} className="text-primary mt-0.5 shrink-0" />
                          <p className="text-[11px] text-muted-foreground">Currently <span className="font-medium text-foreground">{Math.round(activeHours)} active hours/day</span> across {dayparts.filter(d => d.active).length} time windows.</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })()}

            {/* ===== SECTION 3: Content Split & Rules ===== */}
            {(() => {
              const s3Summary = `Owned ${owned}% · Direct ${direct}% · Programmatic ${Math.max(0, prog)}%`;
              return (
                <Collapsible open={section3Open} onOpenChange={setSection3Open}>
                  <CollapsibleTrigger className="w-full rounded-lg border border-l-[3px] border-l-primary border-y-border border-r-border bg-background transition-colors">
                    <div className="flex items-center gap-3 px-5 py-4">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">3</span>
                      <span className="text-base mr-2">📊</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground">Content Split & Rules</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex h-2 w-24 rounded-full overflow-hidden">
                            <div className="bg-skoop-slate" style={{ width: `${owned}%` }} />
                            <div className="bg-skoop-blue" style={{ width: `${direct}%` }} />
                            <div className="bg-skoop-purple" style={{ width: `${Math.max(0, prog)}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{s3Summary}</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${section3Open ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-5 pb-5 pt-2 space-y-6">
                      {/* Content Split */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-foreground">Content Split</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[240px]">
                              <p className="text-xs leading-relaxed">
                                <strong>Owned</strong> — Your own brand content<br />
                                <strong>Direct</strong> — Booked campaigns<br />
                                <strong>Programmatic</strong> — Automated ads
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Owned</span>
                              <span className="tabular-nums font-medium">{owned}% · {existingOwnedCap.toLocaleString()} plays/day</span>
                            </div>
                            <Slider value={[owned]} onValueChange={([v]) => { if (v + direct <= 100) setOwned(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-slate" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Direct</span>
                              <span className="tabular-nums font-medium">{direct}% · {existingDirectCap.toLocaleString()} plays/day</span>
                            </div>
                            <Slider value={[direct]} onValueChange={([v]) => { if (owned + v <= 100) setDirect(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-blue" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Programmatic</span>
                              <span className="tabular-nums font-medium">{Math.max(0, prog)}% · {existingProgCap.toLocaleString()} plays/day</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-skoop-purple rounded-full transition-all" style={{ width: `${Math.max(0, prog)}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Auto-calculated from remaining allocation</p>
                          </div>
                        </div>

                        <MixBar owned={owned} direct={direct} programmatic={Math.max(0, prog)} height="h-3" showLabels />
                      </div>

                      {/* Advanced Serving Rules */}
                      <Collapsible open={servingRulesOpen} onOpenChange={setServingRulesOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
                          <p className="text-sm font-semibold text-foreground">Advanced Serving Rules</p>
                          <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${servingRulesOpen ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <div className="divide-y divide-border border border-border rounded-lg">
                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Default Play Duration</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Standard length of one ad play on this rule</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <SelectRoot value={defaultPlayDuration} onValueChange={setDefaultPlayDuration}>
                                  <SelectTrigger className="w-24 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["10", "15", "30", "60", "custom"].map(v => (
                                      <SelectItem key={v} value={v}>{v === "custom" ? "Custom" : `${v}s`}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </SelectRoot>
                                {defaultPlayDuration === "custom" && (
                                  <input
                                    type="number"
                                    min={1}
                                    max={300}
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(Math.max(1, Number(e.target.value)))}
                                    className="w-16 h-8 text-xs border border-border rounded px-2 bg-background"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Category Separation</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Prevent competing brands from appearing in the same loop</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {catSeparation && (
                                  <select
                                    value={catSeparationGap}
                                    onChange={(e) => setCatSeparationGap(Number(e.target.value))}
                                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                                  >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <option key={n} value={n}>{n} slot{n > 1 ? "s" : ""} apart</option>
                                    ))}
                                  </select>
                                )}
                                <Switch checked={catSeparation} onCheckedChange={setCatSeparation} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Back-to-back Prevention</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Same creative cannot play consecutively</p>
                              </div>
                              <Switch checked={backToBack} onCheckedChange={setBackToBack} />
                            </div>

                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Frequency Cap</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Maximum plays per unique creative per hour</p>
                              </div>
                              <select
                                value={freqCap}
                                onChange={(e) => setFreqCap(Number(e.target.value))}
                                className="text-xs border border-border rounded px-2 py-1 bg-background"
                              >
                                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                  <option key={n} value={n}>{n} plays/hour</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">If No Ad Available, Show:</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Fall back to owned content when programmatic has no fill</p>
                              </div>
                              <Switch checked={noFillFallback} onCheckedChange={setNoFillFallback} />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })()}

            {/* ===== SECTION 4: Active Campaigns ===== */}
            {!isDraft && (
              <Collapsible open={showCampaigns} onOpenChange={setShowCampaigns}>
                <CollapsibleTrigger className="w-full rounded-lg border border-l-[3px] border-l-primary border-y-border border-r-border bg-background transition-colors">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">4</span>
                    <span className="text-base mr-2">📢</span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-foreground">Active Campaigns</p>
                      <p className="text-xs text-muted-foreground truncate">{activeCampaigns.length} campaign{activeCampaigns.length !== 1 ? "s" : ""} consuming inventory</p>
                    </div>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${showCampaigns ? "rotate-180" : ""}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-5 pb-5 pt-2 space-y-4">
                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
                      <Info size={14} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        These campaigns consume inventory from this network rule. Delivery targets draw from the rule's available capacity.
                      </p>
                    </div>

                    {activeCampaigns.length === 0 ? (
                      <div className="border border-dashed border-border rounded-lg py-12 text-center">
                        <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                          <Plus size={18} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No campaigns assigned yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                          Campaigns will appear here once this rule is used in live campaign bookings.
                        </p>
                        <Button size="sm" className="mt-4" onClick={() => navigate("/campaigns/create")}>
                          <Plus size={14} className="mr-1.5" /> Create Campaign for this Rule
                        </Button>
                      </div>
                    ) : (
                      <div className="skoop-card overflow-hidden">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="skoop-table-header">
                              <th className="skoop-table-cell text-left" style={{ width: "28%" }}>Campaign</th>
                              <th className="skoop-table-cell text-left" style={{ width: "12%" }}>Type</th>
                              <th className="skoop-table-cell text-left" style={{ width: "18%" }}>Delivery Target</th>
                              <th className="skoop-table-cell text-left" style={{ width: "22%" }}>Progress</th>
                              <th className="skoop-table-cell text-left" style={{ width: "20%" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeCampaigns.map((c) => (
                              <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                                <td className="skoop-table-cell font-medium text-foreground">
                                  <span className="line-clamp-2">{c.name}</span>
                                </td>
                                <td className="skoop-table-cell"><StatusChip status={c.type.toLowerCase()} /></td>
                                <td className="skoop-table-cell text-muted-foreground text-xs">{c.target}</td>
                                <td className="skoop-table-cell">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                                    </div>
                                    <span className="text-xs tabular-nums text-muted-foreground">{c.pct}%</span>
                                  </div>
                                </td>
                                <td className="skoop-table-cell"><StatusChip status={c.status.toLowerCase().replace(" ", "-")} label={c.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* ===== RIGHT PANEL ===== */}
          <div className="space-y-4">
            {/* Summary — always visible for existing rules */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Campaigns</span><span className="font-medium tabular-nums">{activeCampaigns.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Forecasted Fill</span><span className="font-medium tabular-nums">{placement.capacityUsagePct}%</span></div>
              </div>
            </div>

            {/* Capacity Usage — always visible */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Capacity Usage</p>
              <p className="text-[11px] text-muted-foreground">Eligible plays based on screens, active hours, and play duration</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{existingTotalPlays.toLocaleString()} plays/day</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{existingBookedPlays.toLocaleString()} plays/day</span></div>
                <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{existingAvailPlays.toLocaleString()} plays/day</span></div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${placement.capacityUsagePct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">{placement.capacityUsagePct}% utilised</p>
              <div className="border-t border-border pt-2 mt-2 flex items-center gap-2">
                {forecastItems.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <StatusChip status={f.status} label={f.statusLabel} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
