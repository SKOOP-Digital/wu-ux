import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check, Info, AlertTriangle, Briefcase, Home, Plus, X, Upload, Tag, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allPlacements, calcPlaysPerDay, calcCapacityFromRule } from "@/data/placements";
import { allScreens } from "@/data/screens";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { Globe } from "lucide-react";

type CampaignType = "direct" | "marketing" | "";

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

const DAYPARTS = ["Morning", "Midday", "Afternoon", "Evening", "Late Night"];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [campaignType, setCampaignType] = useState<CampaignType>("");
  const [step, setStep] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [advertiser, setAdvertiser] = useState("");

  // Step 2 — Where It Runs
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [conflictAcknowledged, setConflictAcknowledged] = useState(false);

  // Step 3 — Schedule
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeDays, setActiveDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [activeDayparts, setActiveDayparts] = useState<string[]>(["Morning", "Midday", "Afternoon"]);

  // Step 4 — How Much It Plays
  const [deliveryMode, setDeliveryMode] = useState<"sov" | "total" | "frequency">("sov");
  const [sov, setSov] = useState(15);
  const [totalPlays, setTotalPlays] = useState(5000);
  const [playFrequencyValue, setPlayFrequencyValue] = useState(4);
  const [playFrequencyUnit, setPlayFrequencyUnit] = useState<"minutes" | "hours">("minutes");

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

  const toggleDay = (d: string) => setActiveDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleDaypart = (d: string) => setActiveDayparts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const allTags = useMemo(() => getAllScreenTags(), []);

  const tagMatchedScreens = useMemo(() => {
    if (selectedTags.length === 0) return 0;
    return getScreensMatchingTags(selectedTags).length;
  }, [selectedTags]);

  // Capacity calculations across all selected rules + tags
  const capacitySummary = useMemo(() => {
    if (selectedRules.length === 0 && selectedTags.length === 0) return null;
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
    // Add tag-matched screens (mock capacity: 30 loops/hr × 16 active hrs = 480 plays/day per screen, 70% available)
    if (selectedTags.length > 0) {
      const tagScreens = tagMatchedScreens;
      const tagCapPerScreen = 480;
      totalScreens += tagScreens;
      totalCapacity += tagScreens * tagCapPerScreen;
      totalAvailable += Math.round(tagScreens * tagCapPerScreen * 0.7);
    }
    const availablePct = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0;
    const bookedPct = 100 - availablePct;

    let requested = 0;
    if (deliveryMode === "sov") {
      requested = Math.round(totalCapacity * sov / 100);
    } else {
      requested = totalPlays;
    }
    const fits = requested <= totalAvailable;
    const dailyPacing = deliveryMode === "total" && startDate && endDate
      ? Math.round(totalPlays / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)))
      : 0;

    return { totalScreens, totalAvailable, totalCapacity, availablePct, bookedPct, requested, fits, dailyPacing };
  }, [selectedRules, selectedTags, tagMatchedScreens, deliveryMode, sov, totalPlays, startDate, endDate]);

  const estimatedDailyPlays = useMemo(() => {
    if (!capacitySummary) return 0;
    if (deliveryMode === "sov") return Math.round(capacitySummary.totalCapacity * sov / 100);
    return capacitySummary.dailyPacing || totalPlays;
  }, [capacitySummary, deliveryMode, sov, totalPlays]);

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

  

  // ── STEP RENDERERS ──

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Type</p>
        <p className="text-xs text-muted-foreground">Choose the type of campaign. This determines what steps you'll configure.</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { type: "direct" as CampaignType, icon: Briefcase, label: "Direct Ad", desc: "Booked campaign with an advertiser, guaranteed delivery against your network rules" },
            { type: "marketing" as CampaignType, icon: Home, label: "Marketing", desc: "Western Union brand content with guaranteed screen time" },
          ]).map((tc) => (
            <button
              key={tc.type}
              onClick={() => setCampaignType(tc.type)}
              className={`text-left rounded-lg border-2 p-4 transition-all ${
                campaignType === tc.type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                campaignType === tc.type ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                <tc.icon size={18} />
              </div>
              <p className="text-sm font-semibold text-foreground">{tc.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Details</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Campaign Name</label>
            <Input placeholder="e.g. Summer Brand Push" className="mt-1" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          {campaignType === "direct" && (
            <div>
              <label className="text-xs text-muted-foreground">Advertiser / Partner</label>
              <Input placeholder="e.g. Nike Australia" className="mt-1" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} />
            </div>
          )}
        </div>
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
        <p className="skoop-section-header">Network Rules</p>
        <p className="text-xs text-muted-foreground">Select one or more Network Rules to define where this campaign plays. Optionally narrow with tags per rule.</p>

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

        <div className="flex flex-wrap gap-1.5">
          {filteredTags.map((tag) => (
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
          {filteredTags.length === 0 && tagSearch && (
            <p className="text-xs text-muted-foreground">No matching tags found</p>
          )}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
            <Info size={12} className="text-primary shrink-0" />
            <p className="text-xs text-foreground font-medium tabular-nums">{tagMatchedScreens} screen{tagMatchedScreens !== 1 ? "s" : ""} match these tags</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Schedule</p>
      <p className="text-xs text-muted-foreground">Campaign only competes for inventory during selected days and dayparts.</p>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" className="mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Active Days</label>
        <div className="flex gap-2 mt-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-10 h-8 rounded border text-xs font-medium transition-colors ${
                activeDays.includes(d)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Dayparts</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {DAYPARTS.map((dp) => (
            <button
              key={dp}
              onClick={() => toggleDaypart(dp)}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                activeDayparts.includes(dp)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {dp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="skoop-card p-5 space-y-5">
      <p className="skoop-section-header">How Much It Plays</p>
      <p className="text-xs text-muted-foreground">Define how this campaign's content is delivered across the selected rules.</p>

      <div className="flex gap-2">
        <button onClick={() => setDeliveryMode("sov")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "sov" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>% of Screen Time</button>
        <button onClick={() => setDeliveryMode("total")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "total" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Total Plays</button>
      </div>

      {deliveryMode === "sov" ? (
        <div className="space-y-3">
          <div className="flex justify-between text-sm"><span>% of Screen Time</span><span className="font-medium tabular-nums">{sov}%</span></div>
          <Slider value={[sov]} onValueChange={([v]) => { setSov(v); setConflictAcknowledged(false); }} max={50} step={1} />
          <div className="bg-secondary rounded-md p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">Estimated Delivery</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Total rule capacity</p>
                <p className="text-sm font-medium tabular-nums">{capacitySummary ? capacitySummary.totalCapacity.toLocaleString() : "—"} plays/day</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Estimated daily plays</p>
                <p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} plays/day</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Target Total Plays</label>
            <Input type="number" placeholder="e.g. 5000" className="mt-1 w-48" value={totalPlays} onChange={(e) => setTotalPlays(Number(e.target.value))} />
          </div>
          <div className="bg-secondary rounded-md p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">Estimated Pacing</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Daily pacing estimate</p>
                <p className="text-sm font-medium tabular-nums">~{capacitySummary?.dailyPacing?.toLocaleString() || "—"} plays/day</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Available capacity</p>
                <p className="text-sm font-medium tabular-nums">{capacitySummary ? capacitySummary.totalAvailable.toLocaleString() : "—"} plays/day</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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

    const ready = !hasConflict && campaignName && (selectedRules.length > 0 || selectedTags.length > 0);

    return (
      <div className="space-y-4">
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Campaign Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Campaign Name</p><p className="text-sm font-medium">{campaignName || "Untitled"}</p></div>
            <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status={campaignType || "direct"} label={campaignType === "marketing" ? "Marketing" : "Direct Ad"} /></div>
            {campaignType === "direct" && (
              <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{advertiser || "—"}</p></div>
            )}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Network Rules</p>
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
            <div><p className="text-xs text-muted-foreground">Active Days</p><p className="text-sm font-medium">{activeDays.join(", ")}</p></div>
            <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">{deliveryMode === "sov" || campaignType === "marketing" ? `${sov}% screen time` : `${totalPlays.toLocaleString()} total plays`}</p></div>
            <div><p className="text-xs text-muted-foreground">Creatives</p><p className="text-sm font-medium">{creatives.length} asset{creatives.length !== 1 ? "s" : ""} uploaded</p></div>
          </div>
        </div>

        <div className="skoop-card p-5 space-y-3">
          <p className="skoop-section-header">Estimated Delivery</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Total estimated plays</p><p className="text-sm font-medium tabular-nums">~{totalEstimated.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Daily pacing estimate</p><p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} plays/day</p></div>
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
    if (!capacitySummary || (selectedRules.length === 0 && selectedTags.length === 0)) return null;
    return (
      <div className="w-72 shrink-0 space-y-4">
        <div className="skoop-card p-5 space-y-3 sticky top-8">
          <p className="skoop-section-header">Capacity Summary</p>
          <p className="text-[11px] text-muted-foreground">Live capacity across selected rules</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Screens</span><span className="font-medium tabular-nums">{capacitySummary.totalScreens.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Combined Capacity</span><span className="font-medium tabular-nums">{capacitySummary.totalCapacity.toLocaleString()}/day</span></div>
            <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacitySummary.totalAvailable.toLocaleString()}/day</span></div>
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
                <Button size="sm" onClick={next} disabled={step === 0 && !campaignType}>
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
