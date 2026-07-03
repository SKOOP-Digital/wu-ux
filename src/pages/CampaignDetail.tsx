import { useState, useMemo, useRef } from "react";
import {
  Megaphone, ArrowLeft, ArrowRight, MapPin, ExternalLink, Pencil, X, Check,
  Tag, Globe, Search, ChevronDown, ChevronRight, Clock, Upload, Trash2,
  Info, AlertTriangle, Plus, Image as ImageIcon, Folder, MoreHorizontal,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import POIAutocomplete from "@/components/shared/POIAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allPlacements, calcCapacityFromRule } from "@/data/placements";
import { allScreens } from "@/data/screens";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { defaultCdmKeys, GEO_CDM_KEYS } from "@/data/cdmTags";
import { hasAnyImpressionData, getImpressionMultiplier } from "@/data/impressionStore";
import { searchPOIs, getScreensNearPOIs, getRegionalSearchCenters, milesToMeters, POI } from "@/services/foursquareService";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EDIT_STEPS = [
  "Campaign Details",
  "Where It Runs",
  "Schedule",
  "How Much It Plays",
  "What Plays",
  "Review & Save",
];

const MOCK_MEDIA_FOLDERS = [
  { id: "f1", name: "Brand Assets" }, { id: "f2", name: "Campaigns" },
  { id: "f3", name: "Seasonal" }, { id: "f4", name: "Archive" },
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
  { id: "w1", name: "RealLeaf App" }, { id: "w2", name: "sandstar website" },
  { id: "w3", name: "https://github.com/" }, { id: "w4", name: "test" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeWindow { id: string; days: string[]; startTime: string; endTime: string; }
interface Creative { id: string; name: string; type: string; size: string; duration: number; }

interface CampaignRecord {
  name: string; advertiser: string; isPaid: boolean; dealValue: string;
  campaignType: "standard" | "programmatic"; sspPartner: string; sspApiKey: string; sspAvgDuration: number;
  startDate: string; endDate: string; timeWindows: TimeWindow[];
  tags: string[];
  hasTarget: boolean; deliveryGoalType: "sov" | "total" | "plays-per-day";
  sovValue: number; totalPlays: number; playsPerDay: number; targetBufferPct: number;
  fillEnabled: boolean;
  delivered: number; target: number; status: string;
  creatives: Creative[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const campaignData: Record<string, CampaignRecord> = {
  "1": {
    name: "Pepsi Q2 Push", advertiser: "PepsiCo", isPaid: true, dealValue: "25000",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-04-01", endDate: "2026-06-30",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "06:00", endTime: "22:00" }],
    tags: ["Financial Banks · Northeast", "Urban Panels · National"],
    hasTarget: true, deliveryGoalType: "sov", sovValue: 40, totalPlays: 5000, playsPerDay: 200,
    fillEnabled: false, delivered: 3200, target: 5000, status: "Live",
    creatives: [
      { id: "c1", name: "Pepsi_Q2_16x9.mp4", type: "Video", size: "12.4 MB", duration: 30 },
      { id: "c2", name: "Pepsi_Logo_Static.jpg", type: "Image", size: "540 KB", duration: 15 },
    ],
  },
  "2": {
    name: "Nike Spring", advertiser: "Nike", isPaid: true, dealValue: "12000",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-03-01", endDate: "2026-05-31",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "06:00", endTime: "22:00" }],
    tags: ["Convenience Stores · Midwest & South"],
    hasTarget: true, deliveryGoalType: "total", sovValue: 20, totalPlays: 5000, playsPerDay: 200,
    fillEnabled: true, delivered: 3100, target: 5000, status: "Live",
    creatives: [{ id: "c1", name: "Nike_Spring_16x9.mp4", type: "Video", size: "9.1 MB", duration: 30 }],
  },
  "3": {
    name: "WU Brand Awareness", advertiser: "", isPaid: false, dealValue: "",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-01-01", endDate: "2026-12-31",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "06:00", endTime: "22:00" }],
    tags: ["Financial Banks · Northeast", "Financial Banks · Southwest & Rocky Mountain"],
    hasTarget: false, deliveryGoalType: "total", sovValue: 20, totalPlays: 0, playsPerDay: 200,
    fillEnabled: true, delivered: 48000, target: 0, status: "Live",
    creatives: [
      { id: "c1", name: "WU_Brand_16x9.mp4", type: "Video", size: "11.2 MB", duration: 30 },
      { id: "c2", name: "WU_Remittance_Static.jpg", type: "Image", size: "390 KB", duration: 15 },
    ],
  },
  "4": {
    name: "Coca-Cola Summer", advertiser: "Coca-Cola", isPaid: true, dealValue: "18000",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-05-01", endDate: "2026-08-31",
    timeWindows: [
      { id: "w1", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "11:00", endTime: "21:00" },
      { id: "w2", days: ["Sat", "Sun"], startTime: "10:00", endTime: "22:00" },
    ],
    tags: ["Grocery Retail · West Coast"],
    hasTarget: true, deliveryGoalType: "sov", sovValue: 20, totalPlays: 4000, playsPerDay: 200,
    fillEnabled: false, delivered: 0, target: 4000, status: "Scheduled",
    creatives: [{ id: "c1", name: "CocaCola_Summer.mp4", type: "Video", size: "14.7 MB", duration: 30 }],
  },
  "5": {
    name: "WU Remittance Promo", advertiser: "Western Union", isPaid: true, dealValue: "8000",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-03-01", endDate: "2026-03-31",
    timeWindows: [{ id: "w1", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "08:00", endTime: "18:00" }],
    tags: ["Pharmacies · National"],
    hasTarget: true, deliveryGoalType: "total", sovValue: 20, totalPlays: 3000, playsPerDay: 200,
    fillEnabled: true, delivered: 1200, target: 3000, status: "Under-delivering",
    creatives: [{ id: "c1", name: "WU_Remit_Promo.mp4", type: "Video", size: "8.3 MB", duration: 30 }],
  },
  "6": {
    name: "WU In-store Screens", advertiser: "", isPaid: false, dealValue: "",
    campaignType: "standard", sspPartner: "", sspApiKey: "", sspAvgDuration: 30,
    startDate: "2026-01-01", endDate: "2026-12-31",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "07:00", endTime: "21:00" }],
    tags: ["WU Partners"],
    hasTarget: true, deliveryGoalType: "plays-per-day", sovValue: 0, totalPlays: 0, playsPerDay: 200,
    fillEnabled: true, delivered: 8200, target: 12000, status: "Live",
    creatives: [
      { id: "c1", name: "WU_Instore_Landscape.mp4", type: "Video", size: "7.8 MB", duration: 30 },
      { id: "c2", name: "WU_Instore_Static.jpg", type: "Image", size: "210 KB", duration: 15 },
    ],
  },
  "7": {
    name: "Screenverse", advertiser: "", isPaid: false, dealValue: "",
    campaignType: "programmatic", sspPartner: "Screenverse", sspApiKey: "svr-prod-key-4f9a2c", sspAvgDuration: 30,
    startDate: "2026-01-01", endDate: "2026-12-31",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "06:00", endTime: "23:00" }],
    tags: ["Kroger Network", "Independent Retail"],
    hasTarget: true, deliveryGoalType: "sov", sovValue: 15, totalPlays: 0, playsPerDay: 0,
    fillEnabled: true, delivered: 21400, target: 30000, status: "Live",
    creatives: [],
  },
  "8": {
    name: "Xandr DSP", advertiser: "", isPaid: false, dealValue: "",
    campaignType: "programmatic", sspPartner: "Xandr", sspApiKey: "", sspAvgDuration: 15,
    startDate: "2026-06-01", endDate: "2026-08-31",
    timeWindows: [{ id: "w1", days: ALL_DAYS, startTime: "08:00", endTime: "22:00" }],
    tags: ["WU Partners", "Continental Forex"],
    hasTarget: true, deliveryGoalType: "sov", sovValue: 10, totalPlays: 0, playsPerDay: 0,
    fillEnabled: true, delivered: 4800, target: 18000, status: "Live",
    creatives: [],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newWindow(): TimeWindow {
  return { id: crypto.randomUUID(), days: ALL_DAYS.slice(0, 5), startTime: "08:00", endTime: "20:00" };
}

function goalDisplay(c: Pick<CampaignRecord, "hasTarget" | "deliveryGoalType" | "sovValue" | "totalPlays" | "playsPerDay" | "targetBufferPct">) {
  if (!c.hasTarget) return "Fill only";
  if (c.deliveryGoalType === "sov") return `SOV ${c.sovValue}%`;
  if (c.deliveryGoalType === "plays-per-day") {
    const eff = Math.round(c.playsPerDay * (1 + (c.targetBufferPct ?? 0) / 100));
    return c.targetBufferPct > 0 ? `${c.playsPerDay.toLocaleString()} plays/day → ${eff.toLocaleString()} w/ ${c.targetBufferPct}% buffer` : `${c.playsPerDay.toLocaleString()} plays/day`;
  }
  const eff = Math.round(c.totalPlays * (1 + (c.targetBufferPct ?? 0) / 100));
  return c.targetBufferPct > 0 ? `${c.totalPlays.toLocaleString()} plays → ${eff.toLocaleString()} w/ ${c.targetBufferPct}% buffer` : `${c.totalPlays.toLocaleString()} total plays`;
}

function windowLabel(w: TimeWindow) {
  const days = w.days.length === 7 ? "Every day" : w.days.join(", ");
  return `${days} · ${w.startTime} – ${w.endTime}`;
}

function cloneCampaign(c: CampaignRecord): CampaignRecord {
  return { ...c, timeWindows: c.timeWindows.map(w => ({ ...w })), tags: [...c.tags], creatives: [...c.creatives] };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mediaUploadRef = useRef<HTMLInputElement>(null);
  const mediaUploadMenuRef = useRef<HTMLDivElement>(null);

  const original = id ? campaignData[id] : null;
  const [isEditing, setIsEditing] = useState(false);
  const [editStep, setEditStep] = useState(0);
  const [conflictAcknowledged, setConflictAcknowledged] = useState(false);
  const [draft, setDraft] = useState<CampaignRecord | null>(original ? cloneCampaign(original) : null);

  // ── Tag picker state ──
  const [tagSearch, setTagSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["folder"]);
  const [showAllGroups, setShowAllGroups] = useState<Record<string, boolean>>({});

  // ── Proximity state ──
  const [proximityPOIs, setProximityPOIs] = useState<POI[]>([]);
  const [proximityRadius, setProximityRadius] = useState(1);
  const [poiSearch, setPoiSearch] = useState("");
  const [poiLoading, setPoiLoading] = useState(false);
  const [activePoiQuery, setActivePoiQuery] = useState("");
  const [poiSearched, setPoiSearched] = useState(false);

  // ── Content sidebar state ──
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentView, setContentView] = useState<"list" | "media" | "website">("list");
  const [contentSearch, setContentSearch] = useState("");
  const [mediaCtxMenu, setMediaCtxMenu] = useState<string | null>(null);
  const [showMediaUploadMenu, setShowMediaUploadMenu] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [newWebsiteTitle, setNewWebsiteTitle] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");

  // ── Derived ──
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
  const hasImpressions = hasAnyImpressionData();

  const proximityMatchedScreens = useMemo(
    () => proximityPOIs.length === 0 ? [] : getScreensNearPOIs(proximityPOIs, allScreens, milesToMeters(proximityRadius)),
    [proximityPOIs, proximityRadius]
  );

  const capacitySummary = useMemo(() => {
    if (!draft || (draft.tags.length === 0 && proximityPOIs.length === 0)) return null;
    let totalScreens = 0, totalAvailable = 0, totalCapacity = 0;
    draft.tags.forEach(tag => {
      const pl = allPlacements.find(p => p.name.toLowerCase() === tag.toLowerCase());
      if (pl) {
        const cap = calcCapacityFromRule(pl);
        totalScreens += pl.screenCount; totalCapacity += cap.total; totalAvailable += cap.available;
      }
    });
    const nonPl = draft.tags.filter(t => !allPlacements.some(p => p.name.toLowerCase() === t.toLowerCase()));
    if (nonPl.length > 0) {
      const matched = getScreensMatchingTags(nonPl).length;
      totalScreens += matched; totalCapacity += matched * 480; totalAvailable += Math.round(matched * 480 * 0.7);
    }
    if (proximityMatchedScreens.length > 0) {
      totalScreens += proximityMatchedScreens.length;
      totalCapacity += proximityMatchedScreens.length * 480;
      totalAvailable += Math.round(proximityMatchedScreens.length * 480 * 0.7);
    }
    const availablePct = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0;
    const bookedPct = 100 - availablePct;
    let requested = 0;
    if (draft.hasTarget) {
      if (draft.deliveryGoalType === "sov") requested = Math.round(totalCapacity * draft.sovValue / 100);
      else if (draft.deliveryGoalType === "total") requested = draft.totalPlays;
      else requested = draft.playsPerDay * totalScreens;
    }
    const fits = !draft.hasTarget || requested <= totalAvailable;
    const dailyPacing = draft.hasTarget && draft.deliveryGoalType === "total" && draft.startDate && draft.endDate
      ? Math.round(draft.totalPlays / Math.max(1, Math.ceil((new Date(draft.endDate).getTime() - new Date(draft.startDate).getTime()) / 86400000)))
      : 0;
    return { totalScreens, totalAvailable, totalCapacity, availablePct, bookedPct, requested, fits, dailyPacing };
  }, [draft?.tags, draft?.hasTarget, draft?.deliveryGoalType, draft?.sovValue, draft?.totalPlays, draft?.playsPerDay, draft?.startDate, draft?.endDate, proximityMatchedScreens, proximityPOIs]);

  const estimatedDailyPlays = useMemo(() => {
    if (!capacitySummary || !draft?.hasTarget) return 0;
    if (draft.deliveryGoalType === "sov") return Math.round(capacitySummary.totalCapacity * draft.sovValue / 100);
    if (draft.deliveryGoalType === "plays-per-day") return draft.playsPerDay * capacitySummary.totalScreens;
    return capacitySummary.dailyPacing || draft.totalPlays;
  }, [capacitySummary, draft?.hasTarget, draft?.deliveryGoalType, draft?.sovValue, draft?.totalPlays, draft?.playsPerDay]);

  const estimatedDailyImpressions = useMemo(() => {
    if (!hasImpressions || !capacitySummary || !draft) return 0;
    const screenIds = new Set<string>();
    getScreensMatchingTags(draft.tags).forEach(s => screenIds.add(s.id));
    proximityMatchedScreens.forEach(s => screenIds.add(s.id));
    const pps = capacitySummary.totalScreens > 0 ? estimatedDailyPlays / capacitySummary.totalScreens : 0;
    let total = 0;
    screenIds.forEach(sid => { const m = getImpressionMultiplier(sid); if (m !== null) total += pps * m; });
    return Math.round(total);
  }, [hasImpressions, capacitySummary, estimatedDailyPlays, draft?.tags, proximityMatchedScreens]);

  const filteredTags = useMemo(() => allTags.filter(t =>
    !(draft?.tags ?? []).includes(t.value) &&
    (tagSearch === "" || t.value.toLowerCase().includes(tagSearch.toLowerCase()))
  ), [allTags, draft?.tags, tagSearch]);

  if (!original || !draft) {
    return (
      <div>
        <PageHeader title="Campaign Not Found" subtitle="This campaign does not exist" icon={<Megaphone size={20} />} />
        <div className="p-8"><Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" />Back</Button></div>
      </div>
    );
  }

  // ── Edit helpers ──
  const startEdit = () => {
    setDraft(cloneCampaign(original));
    setProximityPOIs([]); setPoiSearch(""); setPoiSearched(false); setTagSearch("");
    setEditStep(0); setConflictAcknowledged(false);
    setIsEditing(true);
  };
  const cancelEdit = () => { setDraft(cloneCampaign(original)); setEditStep(0); setIsEditing(false); };
  const saveEdit = () => { setEditStep(0); setIsEditing(false); };

  const set = <K extends keyof CampaignRecord>(key: K, value: CampaignRecord[K]) =>
    setDraft(d => d ? { ...d, [key]: value } : d);

  // Time windows
  const addWindow = () => setDraft(d => d ? { ...d, timeWindows: [...d.timeWindows, newWindow()] } : d);
  const removeWindow = (wid: string) => setDraft(d => d ? { ...d, timeWindows: d.timeWindows.filter(w => w.id !== wid) } : d);
  const updateWindow = (wid: string, patch: Partial<TimeWindow>) =>
    setDraft(d => d ? { ...d, timeWindows: d.timeWindows.map(w => w.id === wid ? { ...w, ...patch } : w) } : d);
  const toggleWindowDay = (wid: string, day: string) => {
    const w = draft.timeWindows.find(w => w.id === wid)!;
    updateWindow(wid, { days: w.days.includes(day) ? w.days.filter(d => d !== day) : [...w.days, day] });
  };

  // Tags
  const addTag = (tag: string) => { if (!draft.tags.includes(tag)) set("tags", [...draft.tags, tag]); setTagSearch(""); };
  const removeTag = (tag: string) => set("tags", draft.tags.filter(t => t !== tag));

  // Creatives
  const addCreative = (name: string, type: string) => {
    const defaultDuration = type === "Website" ? 30 : 15;
    set("creatives", [...draft.creatives, { id: crypto.randomUUID(), name, type, size: "—", duration: defaultDuration }]);
  };
  const removeCreative = (cid: string) => set("creatives", draft.creatives.filter(c => c.id !== cid));
  const updateCreativeDuration = (cid: string, duration: number) =>
    set("creatives", draft.creatives.map(c => c.id === cid ? { ...c, duration } : c));
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const nc: Creative[] = Array.from(files).map(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let type = "File";
      if (["mp4", "mov", "webm"].includes(ext)) type = "Video";
      else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) type = "Image";
      else if (ext === "zip" || ext === "html") type = "HTML5";
      return { id: crypto.randomUUID(), name: file.name, type, size: file.size < 1048576 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / 1048576).toFixed(1)} MB` };
    });
    set("creatives", [...draft.creatives, ...nc]);
    e.target.value = "";
  };

  // Proximity
  const handlePoiSearch = async (queryOverride?: string) => {
    const query = queryOverride || poiSearch.trim(); if (!query) return;
    setPoiLoading(true);
    try {
      const results = await searchPOIs(query, getRegionalSearchCenters(allScreens), 100000);
      setProximityPOIs(results); setActivePoiQuery(query); setPoiSearched(true);
    } catch { /* ignore */ } finally { setPoiLoading(false); }
  };
  const clearProximity = () => { setProximityPOIs([]); setPoiSearch(""); setActivePoiQuery(""); setPoiSearched(false); };

  // ── Computed view values ──
  const pct = draft.target > 0 ? Math.round((draft.delivered / draft.target) * 100) : 100;
  const fillBehaviorLabel = !draft.hasTarget ? "Fill only" : draft.fillEnabled ? "Target then fill" : "Target, no fill";
  const STANDARD_GROUP_ORDER = ["Country", "State", "City", "ZIP", "Venue"];
  const tagGroups: Record<string, typeof filteredTags> = {};
  filteredTags.forEach(t => { const cat = t.category || "Venue"; if (!tagGroups[cat]) tagGroups[cat] = []; tagGroups[cat].push(t); });
  const visibleGroupNames = [
    ...STANDARD_GROUP_ORDER.filter(g => tagGroups[g]?.length),
    ...Object.keys(tagGroups).filter(g => !STANDARD_GROUP_ORDER.includes(g) && tagGroups[g]?.length),
  ];
  const isSearching = tagSearch.trim().length > 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION RENDERERS (edit mode)
  // ─────────────────────────────────────────────────────────────────────────────

  const renderEditDetails = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Campaign Details</p>
      <div className="space-y-4">
        {/* Campaign type selector */}
        <div>
          <label className="text-xs text-muted-foreground">Campaign Type</label>
          <div className="mt-1.5 flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => { set("campaignType", "standard"); set("sspPartner", ""); }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${draft.campaignType !== "programmatic" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >Standard</button>
            <button
              onClick={() => { set("campaignType", "programmatic"); set("isPaid", false); set("advertiser", ""); set("dealValue", ""); }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-l border-border ${draft.campaignType === "programmatic" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >Programmatic</button>
          </div>
          {draft.campaignType === "programmatic" && (
            <p className="text-xs text-muted-foreground mt-1.5">Revenue is tracked by the SSP. Paid / advertiser fields are not applicable.</p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Campaign Name</label>
          <Input placeholder="e.g. Summer Brand Push" className="mt-1" value={draft.name} onChange={e => set("name", e.target.value)} />
        </div>

        {draft.campaignType !== "programmatic" && (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Paid campaign</p>
                <p className="text-xs text-muted-foreground mt-0.5">This campaign is booked by an external advertiser or partner.</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => set("isPaid", true)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${draft.isPaid ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>ON</button>
                <button onClick={() => { set("isPaid", false); set("advertiser", ""); set("dealValue", ""); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!draft.isPaid ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}>OFF</button>
              </div>
            </div>
            {draft.isPaid && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Advertiser / Partner <span className="text-muted-foreground/60">(optional)</span></label>
                  <Input placeholder="e.g. Nike Australia" className="mt-1" value={draft.advertiser} onChange={e => set("advertiser", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Deal Value <span className="text-muted-foreground/60">(optional)</span></label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" min={0} placeholder="0.00" className="pl-7" value={draft.dealValue} onChange={e => set("dealValue", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderEditTargeting = () => {
    return (
      <div className="space-y-4">
        {/* Tags card */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center gap-2"><Tag size={16} className="text-muted-foreground" /><p className="skoop-section-header">Target by Tags</p></div>
          <p className="text-xs text-muted-foreground">Select placement groups or individual screen tags. Placement groups appear at the top.</p>
          {draft.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {draft.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                  </span>
                ))}
              </div>
              {capacitySummary && (
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-md px-3 py-2">
                  <Info size={12} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground font-medium tabular-nums">{capacitySummary.totalScreens.toLocaleString()} screens selected</p>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search placement groups, states, cities..." className="pl-9 text-xs" value={tagSearch} onChange={e => setTagSearch(e.target.value)} />
          </div>
          <div className="space-y-1">
            {visibleGroupNames.length === 0 && tagSearch && <p className="text-xs text-muted-foreground py-2">No tags match "{tagSearch}"</p>}
            {visibleGroupNames.map(groupName => {
              const tags = tagGroups[groupName];
              const isExpanded = isSearching || expandedGroups.includes(groupName);
              const showAll = showAllGroups[groupName];
              const CAP = 15;
              const visibleTags = showAll ? tags : tags.slice(0, CAP);
              return (
                <div key={groupName} className="border border-border rounded-md">
                  <button
                    onClick={() => setExpandedGroups(prev => prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName])}
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
                      {visibleTags.map(tag => (
                        <button key={tag.value} onClick={() => addTag(tag.value)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                        >
                          {tag.type === "auto" && <Globe size={10} className="shrink-0" />}
                          + {tag.value} <span className="text-[10px] opacity-60">({tag.screenCount})</span>
                        </button>
                      ))}
                      {!showAll && tags.length > CAP && (
                        <button onClick={() => setShowAllGroups(prev => ({ ...prev, [groupName]: true }))} className="text-xs text-primary hover:underline px-1">Show all {tags.length}</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Proximity card */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center gap-2"><MapPin size={16} className="text-muted-foreground" /><p className="skoop-section-header">Target by Proximity</p></div>
          <p className="text-xs text-muted-foreground">Find screens near specific points of interest.</p>
          {poiSearched && !poiLoading && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <p className="text-sm font-semibold text-foreground">{proximityMatchedScreens.length} screen{proximityMatchedScreens.length !== 1 ? "s" : ""} within {proximityRadius} mi of {activePoiQuery}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearProximity} className="text-xs h-7"><X size={12} className="mr-1" /> Clear</Button>
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-muted-foreground mb-1 block">Search POI</label>
              <POIAutocomplete value={poiSearch} onChange={setPoiSearch} onSelect={name => { setPoiSearch(name); handlePoiSearch(name); }} placeholder="e.g. Walmart, Family Dollar, CVS..." className="text-xs" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Radius</label>
              <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={proximityRadius} onChange={e => setProximityRadius(Number(e.target.value))}>
                <option value={0.25}>0.25 mi</option><option value={0.5}>0.5 mi</option>
                <option value={1}>1 mi</option><option value={2}>2 mi</option><option value={5}>5 mi</option>
              </select>
            </div>
            <Button size="sm" onClick={() => handlePoiSearch()} disabled={poiLoading}>{poiLoading ? "Searching..." : "Search"}</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditSchedule = () => (
    <div className="space-y-4">
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Dates</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" className="mt-1" value={draft.startDate} onChange={e => set("startDate", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" className="mt-1" value={draft.endDate} onChange={e => set("endDate", e.target.value)} /></div>
        </div>
      </div>
      <div className="skoop-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="skoop-section-header">Active Hours</p>
            <p className="text-xs text-muted-foreground mt-0.5">Campaign only competes for inventory within these windows.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={addWindow}><Plus size={13} className="mr-1" /> Add window</Button>
        </div>
        <div className="space-y-3">
          {draft.timeWindows.map((w, idx) => (
            <div key={w.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Window {idx + 1}</span>
                {draft.timeWindows.length > 1 && <button onClick={() => removeWindow(w.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>}
              </div>
              <div className="flex gap-1.5">
                {ALL_DAYS.map(d => (
                  <button key={d} onClick={() => toggleWindowDay(w.id, d)}
                    className={`w-10 h-8 rounded border text-xs font-medium transition-colors ${w.days.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                  >{d}</button>
                ))}
                <button onClick={() => updateWindow(w.id, { days: w.days.length === ALL_DAYS.length ? [] : ALL_DAYS })}
                  className="ml-1 px-2 h-8 rounded border border-dashed border-border text-[10px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >{w.days.length === ALL_DAYS.length ? "Clear" : "All"}</button>
              </div>
              <div className="flex items-center gap-3">
                <div><label className="text-[11px] text-muted-foreground">From</label><Input type="time" className="mt-0.5 w-32 text-sm" value={w.startTime} onChange={e => updateWindow(w.id, { startTime: e.target.value })} /></div>
                <span className="text-muted-foreground mt-5">→</span>
                <div><label className="text-[11px] text-muted-foreground">To</label><Input type="time" className="mt-0.5 w-32 text-sm" value={w.endTime} onChange={e => updateWindow(w.id, { endTime: e.target.value })} /></div>
                {w.startTime && w.endTime && (
                  <div className="mt-5 text-xs text-muted-foreground tabular-nums">
                    {(() => { const [sh, sm] = w.startTime.split(":").map(Number); const [eh, em] = w.endTime.split(":").map(Number); const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60; return hrs > 0 ? `${hrs}h / day` : null; })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditDelivery = () => {
    const effectiveFill = draft.fillEnabled || !draft.hasTarget;
    return (
      <div className="space-y-4">
        <div className="skoop-card p-5 space-y-5">
          <p className="skoop-section-header">Delivery Settings</p>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Fill enabled</p>
                <p className="text-xs text-muted-foreground mt-0.5">This campaign can play in available fill slots when not reserved for other campaigns.</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => set("fillEnabled", true)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${draft.fillEnabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>ON</button>
                <button onClick={() => set("fillEnabled", false)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!draft.fillEnabled ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}>OFF</button>
              </div>
            </div>
            {!draft.fillEnabled && !draft.hasTarget && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">A campaign with fill disabled and no target would never play. Fill has been left enabled.</p>
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Set delivery target</p>
                <p className="text-xs text-muted-foreground mt-0.5">Set a goal for how much this campaign should play. Without a target it runs as fill only.</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => set("hasTarget", true)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${draft.hasTarget ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>ON</button>
                <button onClick={() => set("hasTarget", false)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!draft.hasTarget ? "bg-skoop-slate text-white" : "bg-secondary text-muted-foreground"}`}>OFF</button>
              </div>
            </div>
            {!draft.hasTarget && (
              <div className="flex items-start gap-2 rounded-md bg-secondary/70 border border-border px-3 py-3">
                <Info size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">No target — this campaign plays as fill only, taking available slots after all targeted campaigns are served.</p>
              </div>
            )}
          </div>
        </div>

        {draft.hasTarget && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Delivery Goal</p>
            <div className="flex gap-2">
              {(["sov", "total", "plays-per-day"] as const).map(mode => (
                <button key={mode} onClick={() => set("deliveryGoalType", mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${draft.deliveryGoalType === mode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}
                >
                  {mode === "sov" ? "Share of Voice" : mode === "total" ? "Total plays" : "Plays / day"}
                </button>
              ))}
            </div>
            {draft.deliveryGoalType === "sov" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Share of Voice</label>
                  <span className="text-sm font-semibold tabular-nums">{draft.sovValue}%</span>
                </div>
                <Slider value={[draft.sovValue]} onValueChange={([v]) => set("sovValue", v)} min={1} max={100} step={1} className="w-full" />
              </div>
            )}
            {draft.deliveryGoalType === "total" && (
              <div>
                <label className="text-xs text-muted-foreground">Total plays over campaign period</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" min={1} value={draft.totalPlays} onChange={e => set("totalPlays", Number(e.target.value))} className="w-40 text-sm" />
                  <span className="text-sm text-muted-foreground">plays total</span>
                </div>
              </div>
            )}
            {draft.deliveryGoalType === "plays-per-day" && (
              <div>
                <label className="text-xs text-muted-foreground">Plays per screen per day</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" min={1} value={draft.playsPerDay} onChange={e => set("playsPerDay", Number(e.target.value))} className="w-40 text-sm" />
                  <span className="text-sm text-muted-foreground">plays / screen / day</span>
                </div>
              </div>
            )}
            {/* Over-delivery buffer — play-based goals only */}
            {(draft.deliveryGoalType === "total" || draft.deliveryGoalType === "plays-per-day") && (
              <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Over-delivery buffer</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">System targets slightly more to ensure full delivery</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min={0} max={50} step={0.5}
                      className="w-20 text-right text-sm"
                      value={draft.targetBufferPct ?? 5}
                      onChange={e => set("targetBufferPct", Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                {(draft.targetBufferPct ?? 0) > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Sold:{" "}
                    <span className="font-medium text-foreground">
                      {draft.deliveryGoalType === "total"
                        ? `${draft.totalPlays.toLocaleString()} plays`
                        : `${draft.playsPerDay.toLocaleString()} plays/screen/day`}
                    </span>
                    {" → "}System targets:{" "}
                    <span className="font-medium text-foreground">
                      {draft.deliveryGoalType === "total"
                        ? `${Math.round(draft.totalPlays * (1 + (draft.targetBufferPct ?? 5) / 100)).toLocaleString()} plays`
                        : `${Math.round(draft.playsPerDay * (1 + (draft.targetBufferPct ?? 5) / 100)).toLocaleString()} plays/screen/day`}
                    </span>
                  </p>
                )}
              </div>
            )}
            {capacitySummary && (
              <div className={`rounded-lg border px-4 py-4 space-y-3 ${capacitySummary.fits ? "border-border bg-secondary/40" : "border-destructive/40 bg-destructive/5"}`}>
                <p className="text-xs font-medium text-foreground">Availability Check</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-[11px] text-muted-foreground">Available capacity</p><p className="text-sm font-medium tabular-nums">{capacitySummary.totalAvailable.toLocaleString()} plays/day</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Requested</p><p className={`text-sm font-medium tabular-nums ${!capacitySummary.fits ? "text-destructive" : ""}`}>{capacitySummary.requested.toLocaleString()} plays/day</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Est. daily impressions</p>{hasImpressions ? <p className="text-sm font-medium tabular-nums">~{estimatedDailyImpressions.toLocaleString()}</p> : <p className="text-[11px] text-muted-foreground italic">—</p>}</div>
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

  const renderEditCreatives = () => {
    if (draft.campaignType === "programmatic") {
      return (
        <div className="skoop-card p-5 space-y-5">
          <p className="skoop-section-header">Content</p>
          <p className="text-xs text-muted-foreground">
            This is a programmatic campaign. The SSP will supply creatives at play time — no manual assets are needed.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">SSP Partner <span className="text-muted-foreground/60">(optional)</span></label>
              <Input placeholder="e.g. Google Ad Manager, Xandr, Vistar" className="mt-1" value={draft.sspPartner} onChange={e => set("sspPartner", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">API Key / Integration Info <span className="text-muted-foreground/60">(optional)</span></label>
              <Input placeholder="e.g. API key, account ID, endpoint URL" className="mt-1" value={draft.sspApiKey} onChange={e => set("sspApiKey", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Default Creative Duration (seconds)</label>
              <p className="text-[11px] text-muted-foreground mb-1">Used to estimate screen time allocation. The SSP determines actual ad length at play time.</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min={5} max={120} className="w-24"
                  value={draft.sspAvgDuration}
                  onChange={e => set("sspAvgDuration", Math.max(5, Number(e.target.value)))}
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

    const totalRunSec = draft.creatives.reduce((sum, c) => sum + (c.duration ?? 15), 0);

    return (
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Content</p>
        <p className="text-xs text-muted-foreground">Add assets for this campaign using the right sidebar</p>
        {draft.creatives.length > 0 ? (
          <div className="space-y-2">
            {draft.creatives.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {c.type === "Website" ? <Globe size={14} className="text-primary shrink-0" /> : <ImageIcon size={14} className="text-primary shrink-0" />}
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.type}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    type="number" min={1} max={3600}
                    className="w-16 h-7 text-xs px-2 text-right"
                    value={c.duration ?? 15}
                    onChange={e => updateCreativeDuration(c.id, Math.max(1, Number(e.target.value)))}
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                  <button onClick={() => removeCreative(c.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1"><X size={14} /></button>
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

  const renderCapacityPanel = () => {
    if (!capacitySummary || (draft.tags.length === 0 && proximityPOIs.length === 0)) return null;
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
          {editStep >= 3 && (
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
                        You're requesting ~{capacitySummary.requested.toLocaleString()} plays/day but only {capacitySummary.totalAvailable.toLocaleString()}/day is available.
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Other campaigns have already booked the remaining capacity.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    <button onClick={() => setEditStep(3)} className="block text-[11px] text-primary font-medium hover:underline">A. Reduce your target</button>
                    <button onClick={() => setEditStep(1)} className="block text-[11px] text-primary font-medium hover:underline">B. Add more screens</button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setConflictAcknowledged(true)}>C. Proceed anyway</Button>
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

  const renderContentSidebar = () => {
    const filteredMedia = MOCK_MEDIA_ITEMS.filter(m => m.name.toLowerCase().includes(contentSearch.toLowerCase()));
    const filteredWebsites = MOCK_WEBSITE_ITEMS.filter(w => w.name.toLowerCase().includes(contentSearch.toLowerCase()));

    if (contentView === "media") {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => { setContentView("list"); setContentSearch(""); setMediaCtxMenu(null); setShowMediaUploadMenu(false); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Media
            </button>
            <div className="relative" ref={mediaUploadMenuRef}>
              <button onClick={() => setShowMediaUploadMenu(v => !v)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus size={14} /></button>
              {showMediaUploadMenu && (
                <div className="absolute right-0 top-9 z-20 bg-card border border-border rounded-md shadow-md w-36 py-1">
                  <label className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors cursor-pointer block">
                    Upload File
                    <input type="file" accept="video/*,image/*" multiple className="hidden" onChange={e => { handleFileUpload(e); setShowMediaUploadMenu(false); }} />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 px-3 py-2 border-b border-border">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search Content" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background" />
            </div>
            <select className="h-8 rounded-md border border-input px-2 text-xs bg-background"><option>All</option><option>Images</option><option>Videos</option></select>
          </div>
          <div className="flex-1 overflow-y-auto p-3" onClick={() => { setMediaCtxMenu(null); setShowMediaUploadMenu(false); }}>
            {contentSearch === "" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MOCK_MEDIA_FOLDERS.map(f => (
                  <button key={f.id} className="flex items-center gap-1.5 border border-border rounded-md px-2 py-2 text-xs text-left hover:bg-secondary transition-colors">
                    <Folder size={14} className="text-muted-foreground shrink-0" /><span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredMedia.map(item => (
                <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                  <div className={`h-20 ${item.color} flex items-center justify-center`} />
                  <div className="absolute top-1.5 right-1.5">
                    <button onClick={e => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }} className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"><MoreHorizontal size={12} /></button>
                    {mediaCtxMenu === item.id && (
                      <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                        <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); addCreative(item.name, "Media"); setMediaCtxMenu(null); }}><Plus size={12} /> Add to campaign</button>
                        <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); setMediaCtxMenu(null); }}><ImageIcon size={12} /> Preview</button>
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5"><p className="text-[11px] truncate">{item.name}</p></div>
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => { setContentView("list"); setContentSearch(""); setShowWebsiteForm(false); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Website
            </button>
            <button onClick={() => setShowWebsiteForm(v => !v)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${showWebsiteForm ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              {showWebsiteForm ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>
          {showWebsiteForm ? (
            <div className="p-4 space-y-3">
              <div><label className="text-xs text-muted-foreground">Title</label><input type="text" placeholder="Enter Title" value={newWebsiteTitle} onChange={e => setNewWebsiteTitle(e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background" /></div>
              <div><label className="text-xs text-muted-foreground">Website URL</label><input type="text" placeholder="Enter Website URL" value={newWebsiteUrl} onChange={e => setNewWebsiteUrl(e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background" /></div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl(""); }}>Cancel</Button>
                <Button size="sm" disabled={!newWebsiteTitle} onClick={() => { if (newWebsiteTitle) { addCreative(newWebsiteTitle, "Website"); } setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl(""); }}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search Content" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3" onClick={() => setMediaCtxMenu(null)}>
                <div className="grid grid-cols-2 gap-2">
                  {filteredWebsites.map(item => (
                    <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                      <div className="h-20 bg-gradient-to-br from-sky-100 to-blue-200" />
                      <div className="absolute top-1.5 right-1.5">
                        <button onClick={e => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }} className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"><MoreHorizontal size={12} /></button>
                        {mediaCtxMenu === item.id && (
                          <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); addCreative(item.name, "Website"); setMediaCtxMenu(null); }}><Plus size={12} /> Add to campaign</button>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5"><p className="text-[11px] truncate">{item.name}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Content</h2></div>
        <div className="px-3 py-2 border-b border-border">
          <input type="text" placeholder="Type to search apps" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input px-3 text-xs bg-background" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {[{ label: "Media", icon: <ImageIcon size={16} className="text-primary" /> }, { label: "Website", icon: <Globe size={16} className="text-primary" /> }]
            .filter(item => item.label.toLowerCase().includes(contentSearch.toLowerCase()))
            .map(item => (
              <button key={item.label} onClick={() => { setContentView(item.label.toLowerCase() as "media" | "website"); setContentSearch(""); }} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border">
                <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            ))}
        </div>
      </div>
    );
  };

  const renderEditReview = () => {
    const totalDays = draft.startDate && draft.endDate
      ? Math.max(1, Math.ceil((new Date(draft.endDate).getTime() - new Date(draft.startDate).getTime()) / 86400000))
      : 30;
    const totalEstimated = estimatedDailyPlays * totalDays;
    const hasConflict = capacitySummary ? !capacitySummary.fits : false;

    const deliveryTargetLabel = !draft.hasTarget
      ? "None (fill only)"
      : draft.deliveryGoalType === "sov"
      ? `${draft.sovValue}% of screen time`
      : draft.deliveryGoalType === "plays-per-day"
      ? `${draft.playsPerDay.toLocaleString()} plays/screen/day`
      : `${draft.totalPlays.toLocaleString()} total plays`;

    return (
      <div className="space-y-4">
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Campaign Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Campaign Name</p><p className="text-sm font-medium">{draft.name || "Untitled"}</p></div>
            <div><p className="text-xs text-muted-foreground">Campaign Type</p><p className="text-sm font-medium capitalize">{draft.campaignType ?? "standard"}</p></div>
            {draft.campaignType === "programmatic" && draft.sspPartner && <div><p className="text-xs text-muted-foreground">SSP Partner</p><p className="text-sm font-medium">{draft.sspPartner}</p></div>}
            {draft.campaignType !== "programmatic" && <div><p className="text-xs text-muted-foreground">Paid Campaign</p><p className="text-sm font-medium">{draft.isPaid ? "Yes" : "No"}</p></div>}
            {draft.campaignType !== "programmatic" && draft.isPaid && draft.advertiser && <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{draft.advertiser}</p></div>}
            {draft.campaignType !== "programmatic" && draft.isPaid && draft.dealValue && <div><p className="text-xs text-muted-foreground">Deal Value</p><p className="text-sm font-medium tabular-nums">${Number(draft.dealValue).toLocaleString()}</p></div>}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Targeting</p>
              {draft.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {draft.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">No tags selected</p>
              )}
            </div>
            <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium tabular-nums">{capacitySummary?.totalScreens.toLocaleString() || 0}</p></div>
            <div><p className="text-xs text-muted-foreground">Schedule</p><p className="text-sm font-medium">{draft.startDate || "—"} → {draft.endDate || "—"}</p></div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Active Hours</p>
              <div className="mt-1 space-y-0.5">
                {draft.timeWindows.map(w => (
                  <p key={w.id} className="text-sm font-medium">
                    {w.days.length === 7 ? "Every day" : w.days.join(", ")} · {w.startTime} – {w.endTime}
                  </p>
                ))}
              </div>
            </div>
            <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">{deliveryTargetLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Fill Behavior</p><p className="text-sm font-medium">{fillBehaviorLabel}</p></div>
            <div><p className="text-xs text-muted-foreground">Content</p><p className="text-sm font-medium">{draft.creatives.length} asset{draft.creatives.length !== 1 ? "s" : ""}</p></div>
          </div>
        </div>

        <div className="skoop-card p-5 space-y-3">
          <p className="skoop-section-header">Estimated Delivery</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Total estimated plays</p><p className="text-sm font-medium tabular-nums">~{totalEstimated.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Daily pacing estimate</p><p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} plays/day</p></div>
            <div><p className="text-xs text-muted-foreground">Est. daily impressions</p><p className="text-sm font-medium tabular-nums">{hasImpressions ? `~${estimatedDailyImpressions.toLocaleString()}` : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Inventory Fit</p><StatusChip status={hasConflict ? "overbooked" : "healthy"} label={hasConflict ? "Conflict" : "Compatible"} /></div>
          </div>
        </div>

        {!hasConflict && draft.name ? (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700">All looks good. Click Save Changes to apply your edits.</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">
              {hasConflict ? "Capacity conflict detected — requested plays exceed available inventory." : "Please provide a campaign name before saving."}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContentModal = () => {
    if (!showContentModal) return null;
    const filteredMedia = MOCK_MEDIA_ITEMS.filter(m => m.name.toLowerCase().includes(contentSearch.toLowerCase()));
    const filteredWebsites = MOCK_WEBSITE_ITEMS.filter(w => w.name.toLowerCase().includes(contentSearch.toLowerCase()));

    const sidebarContent = () => {
      if (contentView === "media") return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={() => { setContentView("list"); setContentSearch(""); setMediaCtxMenu(null); setShowMediaUploadMenu(false); }} className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"><ArrowLeft size={14} /> Media</button>
            <div className="relative" ref={mediaUploadMenuRef}>
              <button onClick={() => setShowMediaUploadMenu(v => !v)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus size={14} /></button>
              {showMediaUploadMenu && (
                <div className="absolute right-0 top-9 z-20 bg-card border border-border rounded-md shadow-md w-36 py-1">
                  <label className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors cursor-pointer block">
                    Upload File
                    <input type="file" accept="video/*,image/*" multiple className="hidden" onChange={e => { handleFileUpload(e); setShowMediaUploadMenu(false); setShowContentModal(false); }} />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 px-3 py-2 border-b border-border">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search Content" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background" />
            </div>
            <select className="h-8 rounded-md border border-input px-2 text-xs bg-background"><option>All</option><option>Images</option><option>Videos</option></select>
          </div>
          <div className="flex-1 overflow-y-auto p-3" onClick={() => { setMediaCtxMenu(null); setShowMediaUploadMenu(false); }}>
            {contentSearch === "" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MOCK_MEDIA_FOLDERS.map(f => (
                  <button key={f.id} className="flex items-center gap-1.5 border border-border rounded-md px-2 py-2 text-xs text-left hover:bg-secondary transition-colors">
                    <Folder size={14} className="text-muted-foreground shrink-0" /><span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredMedia.map(item => (
                <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                  <div className={`h-20 ${item.color} flex items-center justify-center`} />
                  <div className="absolute top-1.5 right-1.5">
                    <button onClick={e => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }} className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"><MoreHorizontal size={12} /></button>
                    {mediaCtxMenu === item.id && (
                      <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                        <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); addCreative(item.name, "Media"); setMediaCtxMenu(null); setShowContentModal(false); }}><Plus size={12} /> Add to campaign</button>
                        <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); setMediaCtxMenu(null); }}><ImageIcon size={12} /> Preview</button>
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5"><p className="text-[11px] truncate">{item.name}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      if (contentView === "website") return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={() => { setContentView("list"); setContentSearch(""); setShowWebsiteForm(false); }} className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"><ArrowLeft size={14} /> Website</button>
            <button onClick={() => setShowWebsiteForm(v => !v)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${showWebsiteForm ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>{showWebsiteForm ? <X size={14} /> : <Plus size={14} />}</button>
          </div>
          {showWebsiteForm ? (
            <div className="p-4 space-y-3">
              <div><label className="text-xs text-muted-foreground">Title</label><input type="text" placeholder="Enter Title" value={newWebsiteTitle} onChange={e => setNewWebsiteTitle(e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background" /></div>
              <div><label className="text-xs text-muted-foreground">Website URL</label><input type="text" placeholder="Enter Website URL" value={newWebsiteUrl} onChange={e => setNewWebsiteUrl(e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input px-3 text-sm bg-background" /></div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl(""); }}>Cancel</Button>
                <Button size="sm" disabled={!newWebsiteTitle} onClick={() => { if (newWebsiteTitle) { addCreative(newWebsiteTitle, "Website"); setShowContentModal(false); } setShowWebsiteForm(false); setNewWebsiteTitle(""); setNewWebsiteUrl(""); }}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-border"><div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="Search Content" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input pl-7 pr-2 text-xs bg-background" /></div></div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredWebsites.map(item => (
                    <div key={item.id} className="relative group rounded-md border border-border overflow-hidden">
                      <div className="h-20 bg-gradient-to-br from-sky-100 to-blue-200" />
                      <div className="absolute top-1.5 right-1.5">
                        <button onClick={e => { e.stopPropagation(); setMediaCtxMenu(mediaCtxMenu === item.id ? null : item.id); }} className="w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"><MoreHorizontal size={12} /></button>
                        {mediaCtxMenu === item.id && (
                          <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-md shadow-md w-40 py-1">
                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2" onClick={e => { e.stopPropagation(); addCreative(item.name, "Website"); setMediaCtxMenu(null); setShowContentModal(false); }}><Plus size={12} /> Add to campaign</button>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5"><p className="text-[11px] truncate">{item.name}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );

      return (
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Content</h2></div>
          <div className="px-3 py-2 border-b border-border"><input type="text" placeholder="Type to search apps" value={contentSearch} onChange={e => setContentSearch(e.target.value)} className="w-full h-8 rounded-md border border-input px-3 text-xs bg-background" /></div>
          <div className="flex-1 overflow-y-auto">
            {[{ label: "Media", icon: <ImageIcon size={16} className="text-primary" /> }, { label: "Website", icon: <Globe size={16} className="text-primary" /> }]
              .filter(item => item.label.toLowerCase().includes(contentSearch.toLowerCase()))
              .map(item => (
                <button key={item.label} onClick={() => { setContentView(item.label.toLowerCase() as "media" | "website"); setContentSearch(""); }} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border">
                  <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="flex-1 bg-black/40" onClick={() => { setShowContentModal(false); setMediaCtxMenu(null); }} />
        {/* Drawer */}
        <div className="w-80 bg-card border-l border-border shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Add Content</span>
            <button onClick={() => setShowContentModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-hidden">{sidebarContent()}</div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const renderCurrentEditStep = () => {
    if (editStep === 0) return renderEditDetails();
    if (editStep === 1) return renderEditTargeting();
    if (editStep === 2) return renderEditSchedule();
    if (editStep === 3) return renderEditDelivery();
    if (editStep === 4) return renderEditCreatives();
    if (editStep === 5) return renderEditReview();
    return renderEditDetails();
  };

  const isLastEditStep = editStep === EDIT_STEPS.length - 1;

  // ── Edit wizard layout ───────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="flex flex-col h-screen">
        <input ref={mediaUploadRef} type="file" accept="video/*,image/*,.html,.zip" multiple className="hidden" onChange={handleFileUpload} />

        {/* Breadcrumb */}
        <div className="px-8 pt-4 pb-0 shrink-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/campaigns">Campaigns</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={cancelEdit}>{draft.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Edit</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <div className="shrink-0">
          <PageHeader
            title={`Edit: ${draft.name}`}
            subtitle="Update campaign settings and targeting"
            icon={<Megaphone size={20} />}
            actions={<Button variant="outline" size="sm" onClick={cancelEdit}><X size={14} className="mr-1" /> Cancel</Button>}
          />
        </div>

        {/* Step indicator */}
        <div className="border-b border-border px-8 py-4 shrink-0">
          <div className="flex items-center gap-2">
            {EDIT_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => setEditStep(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    i === editStep ? "bg-primary text-primary-foreground" : i < editStep ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < editStep ? <Check size={12} /> : <span>{i + 1}</span>}
                  {s}
                </button>
                {i < EDIT_STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Scrollable main content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className={editStep !== 4 ? "flex gap-6" : ""}>
              <div className={editStep !== 4 ? "flex-1 max-w-3xl" : "max-w-3xl"}>
                {renderCurrentEditStep()}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" size="sm" onClick={() => setEditStep(s => Math.max(s - 1, 0))} disabled={editStep === 0}>
                    <ArrowLeft size={14} className="mr-1" /> Previous
                  </Button>
                  {!isLastEditStep ? (
                    <Button size="sm" onClick={() => setEditStep(s => Math.min(s + 1, EDIT_STEPS.length - 1))}>
                      Next <ArrowRight size={14} className="ml-1" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={saveEdit}>
                      <Check size={14} className="mr-1" /> Save Changes
                    </Button>
                  )}
                </div>
              </div>

              {/* Capacity panel — shown on steps 0–3 only */}
              {editStep !== 4 && editStep < 5 && renderCapacityPanel()}
            </div>
          </div>

          {/* Full-height content sidebar — only on What Plays step for standard campaigns */}
          {editStep === 4 && draft.campaignType !== "programmatic" && (
            <div className="w-[340px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
              {renderContentSidebar()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── View layout ──────────────────────────────────────────────────────────────
  return (
    <div>
      {renderContentModal()}
      <input ref={mediaUploadRef} type="file" accept="video/*,image/*,.html,.zip" multiple className="hidden" onChange={handleFileUpload} />

      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/campaigns">Campaigns</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{draft.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={draft.name}
        subtitle={draft.isPaid ? `Paid campaign · ${draft.advertiser || "No advertiser"}` : "In-house campaign"}
        icon={<Megaphone size={20} />}
        actions={
          <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
            <Button size="sm" onClick={startEdit}><Pencil size={14} className="mr-1" /> Edit</Button>
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Details */}
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Campaign Details</p>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status={draft.status.toLowerCase().replace(" ", "-")} label={draft.status} /></div>
                <div><p className="text-xs text-muted-foreground">Paid</p><p className="text-sm font-medium">{draft.isPaid ? "Yes" : "No"}</p></div>
                {draft.advertiser && <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{draft.advertiser}</p></div>}
                {draft.dealValue && <div><p className="text-xs text-muted-foreground">Deal Value</p><p className="text-sm font-medium tabular-nums">${Number(draft.dealValue).toLocaleString()}</p></div>}
              </div>
            </div>
            {/* Targeting */}
            <div className="skoop-card p-5 space-y-3">
              <div className="flex items-center gap-2"><Tag size={14} className="text-muted-foreground" /><p className="skoop-section-header">Targeting</p></div>
              {draft.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {draft.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">{tag}</span>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No tags selected</p>}
              {proximityMatchedScreens.length > 0 && (
                <p className="text-xs text-muted-foreground">{proximityMatchedScreens.length} screens via proximity</p>
              )}
            </div>
            {/* Schedule */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Schedule</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Start</p><p className="text-sm font-medium">{draft.startDate || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">End</p><p className="text-sm font-medium">{draft.endDate || "—"}</p></div>
              </div>
              <div className="space-y-1">
                {draft.timeWindows.map(w => <p key={w.id} className="text-sm font-medium">{windowLabel(w)}</p>)}
                      </div>
                    </div>
            {/* Delivery */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Delivery Settings</p>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-medium">{goalDisplay(draft)}</p></div>
                <div><p className="text-xs text-muted-foreground">Fill</p><p className="text-sm font-medium">{fillBehaviorLabel}</p></div>
              </div>
            </div>
            {/* Delivery progress */}
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Delivery Progress</p>
              {draft.hasTarget ? (
                <>
                  <div className="flex items-center gap-4"><Progress value={pct} className="h-2 flex-1" /><span className="text-sm font-medium tabular-nums">{pct}%</span></div>
              <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-muted-foreground">Delivered</p><p className="text-sm font-semibold tabular-nums">{draft.delivered.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-semibold tabular-nums">{draft.target.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Pacing</p><StatusChip status={pct >= 60 ? "healthy" : "at-risk"} label={pct >= 60 ? "On Track" : "Behind Pace"} /></div>
              </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fill only — no delivery target set.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Total plays delivered</p><p className="text-sm font-semibold tabular-nums">{draft.delivered.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status="healthy" label="Running" /></div>
                  </div>
                </div>
              )}
            </div>
            {/* Content */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Content</p>
              <div className="space-y-2">
                {draft.creatives.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 px-3 border border-border rounded-md">
                    <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} · {c.size}</p></div>
                    <StatusChip status="approved" label="Approved" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Summary</p>
              <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-medium">{goalDisplay(draft)}</p></div>
              <div><p className="text-xs text-muted-foreground">Fill</p><p className="text-sm font-medium">{draft.fillEnabled ? "On" : "Off"}</p></div>
              <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">{draft.startDate || "—"} → {draft.endDate || "—"}</p></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Hours</p>
                {draft.timeWindows.map(w => <p key={w.id} className="text-xs text-foreground mt-0.5">{windowLabel(w)}</p>)}
              </div>
              <div><p className="text-xs text-muted-foreground">Targeting</p><p className="text-sm font-medium">{draft.tags.length} tag{draft.tags.length !== 1 ? "s" : ""}</p></div>
            </div>
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Quick Links</p>
              <button onClick={() => navigate("/proof-of-play")} className="flex items-center gap-2 text-xs text-primary hover:underline w-full"><ExternalLink size={12} /> Proof of Play</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
