import { Settings as SettingsIcon, Tag, Plus, X, Search, Monitor, ChevronDown, ChevronRight, Globe, Check, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { allScreens } from "@/data/screens";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { defaultCdmKeys, GEO_CDM_KEYS, type CdmKey, type CdmValue } from "@/data/cdmTags";

const tabs = ["Account", "Users", "Billing", "Superadmin", "Notification", "Tags"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Tags");

  // ── Tags tab state ──────────────────────────────────────────────────────────
  type ScreenMode = "tags" | "manual";
  const TAG_CATEGORY_ORDER = ["Country", "State", "City", "ZIP", "Venue"];

  interface Label { id: string; name: string; screenIds: string[]; createdAt: string; }

  const [labels, setLabels] = useState<Label[]>([
    { id: "lbl-1", name: "Food & Grocery", screenIds: ["scr-4","scr-14","scr-15","scr-17","scr-18","scr-19","scr-20"], createdAt: "Jan 14, 2025" },
    { id: "lbl-2", name: "Check Cashing",  screenIds: ["scr-1","scr-6","scr-31","scr-32"], createdAt: "Jan 14, 2025" },
    { id: "lbl-3", name: "Currency Exchange", screenIds: ["scr-5","scr-22","scr-23","scr-25","scr-26","scr-27","scr-28"], createdAt: "Feb 3, 2025" },
  ]);

  const [cdmKeys, setCdmKeys] = useState<CdmKey[]>(defaultCdmKeys);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const toggleKeyExpand = (id: string) => setExpandedKeys((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Label modal
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [labelModalName, setLabelModalName] = useState("");
  const [labelScreenMode, setLabelScreenMode] = useState<ScreenMode>("tags");
  const [labelSelTags, setLabelSelTags] = useState<string[]>([]);
  const [labelTagSearch, setLabelTagSearch] = useState("");
  const [labelExpandedGroups, setLabelExpandedGroups] = useState<string[]>([]);
  const [labelShowAll, setLabelShowAll] = useState<Record<string, boolean>>({});
  const [labelManualIds, setLabelManualIds] = useState<Set<string>>(new Set());
  const [labelScreenSearch, setLabelScreenSearch] = useState("");
  const [labelTagSearch2, setLabelTagSearch2] = useState("");

  // CDM tag (value) modal
  const [showCdmModal, setShowCdmModal] = useState(false);
  const [cdmModalKey, setCdmModalKey] = useState("");   // existing key id or ""
  const [cdmModalNewKey, setCdmModalNewKey] = useState(""); // when creating new key
  const [cdmModalValue, setCdmModalValue] = useState("");
  const [cdmScreenMode, setCdmScreenMode] = useState<ScreenMode>("tags");
  const [cdmSelTags, setCdmSelTags] = useState<string[]>([]);
  const [cdmTagSearch, setCdmTagSearch] = useState("");
  const [cdmExpandedGroups, setCdmExpandedGroups] = useState<string[]>([]);
  const [cdmShowAll, setCdmShowAll] = useState<Record<string, boolean>>({});
  const [cdmManualIds, setCdmManualIds] = useState<Set<string>>(new Set());
  const [cdmScreenSearch, setCdmScreenSearch] = useState("");

  const labelMatchedScreens = useMemo(() => getScreensMatchingTags(labelSelTags), [labelSelTags]);
  const cdmMatchedScreens   = useMemo(() => getScreensMatchingTags(cdmSelTags),   [cdmSelTags]);

  // Extend base tags with CDM attribute keys so they appear in the By Tags selector
  const allTagsWithCdm = useMemo(() => {
    const base = getAllScreenTags();
    // Include all CDM keys — custom ones as "manual", auto non-geo ones (e.g. folder) as "auto"
    const cdmExtras = cdmKeys
      .filter((k) => !k.isAuto || !GEO_CDM_KEYS.has(k.key)) // skip geo auto keys (already in base)
      .flatMap((k) =>
        k.values.map((v) => ({
          value: v.value,
          type: (k.isAuto ? "auto" : "manual") as "auto" | "manual",
          category: k.key,
          screenCount: v.screenCount,
        }))
      );
    const baseValues = new Set(base.map((t) => t.value));
    const uniqueExtras = cdmExtras.filter((e) => !baseValues.has(e.value));
    const cdmValueToKey: Record<string, string> = {};
    cdmExtras.forEach((e) => { cdmValueToKey[e.value] = e.category; });
    const updatedBase = base.map((t) => cdmValueToKey[t.value] ? { ...t, category: cdmValueToKey[t.value] } : t);
    return [...updatedBase, ...uniqueExtras];
  }, [cdmKeys]);

  const labelFilteredTags = useMemo(() => allTagsWithCdm.filter((t) => !labelSelTags.includes(t.value) && t.value.toLowerCase().includes(labelTagSearch.toLowerCase())), [allTagsWithCdm, labelSelTags, labelTagSearch]);
  const cdmFilteredTags   = useMemo(() => allTagsWithCdm.filter((t) => !cdmSelTags.includes(t.value)   && t.value.toLowerCase().includes(cdmTagSearch.toLowerCase())),   [allTagsWithCdm, cdmSelTags,   cdmTagSearch]);

  const makeGroups = (tags: typeof allTagsWithCdm) => {
    const g: Record<string, typeof allTagsWithCdm> = {};
    tags.forEach((t) => { const c = t.category || "Other"; if (!g[c]) g[c] = []; g[c].push(t); });
    return g;
  };
  const labelGroups = useMemo(() => makeGroups(labelFilteredTags), [labelFilteredTags]);
  const cdmGroups   = useMemo(() => makeGroups(cdmFilteredTags),   [cdmFilteredTags]);

  // Show standard categories first, then any CDM key categories appended after
  const buildVisGroups = (groups: Record<string, unknown[]>) => {
    const standard = TAG_CATEGORY_ORDER.filter((g) => groups[g]?.length);
    const extras = Object.keys(groups).filter((g) => !TAG_CATEGORY_ORDER.includes(g) && groups[g]?.length);
    return [...standard, ...extras];
  };
  const labelVisGroups = useMemo(() => buildVisGroups(labelGroups), [labelGroups]);
  const cdmVisGroups   = useMemo(() => buildVisGroups(cdmGroups),   [cdmGroups]);

  const labelFilteredScreens = useMemo(() => allScreens.filter((s) => !labelScreenSearch || s.name.toLowerCase().includes(labelScreenSearch.toLowerCase())), [labelScreenSearch]);
  const cdmFilteredScreens   = useMemo(() => allScreens.filter((s) => !cdmScreenSearch   || s.name.toLowerCase().includes(cdmScreenSearch.toLowerCase())),   [cdmScreenSearch]);

  const labelEffCount = labelScreenMode === "tags" ? labelMatchedScreens.length : labelManualIds.size;
  const cdmEffCount   = cdmScreenMode   === "tags" ? cdmMatchedScreens.length   : cdmManualIds.size;

  const openCreateLabel = () => { setEditingLabel(null); setLabelModalName(""); setLabelScreenMode("tags"); setLabelSelTags([]); setLabelTagSearch(""); setLabelExpandedGroups([]); setLabelShowAll({}); setLabelManualIds(new Set()); setLabelScreenSearch(""); setShowLabelModal(true); };
  const openEditLabel   = (l: Label) => { setEditingLabel(l); setLabelModalName(l.name); setLabelScreenMode("manual"); setLabelSelTags([]); setLabelTagSearch(""); setLabelExpandedGroups([]); setLabelShowAll({}); setLabelManualIds(new Set(l.screenIds)); setLabelScreenSearch(""); setShowLabelModal(true); };
  const closeLabel = () => { setShowLabelModal(false); setEditingLabel(null); };
  const saveLabel = () => {
    if (!labelModalName.trim()) return;
    const ids = labelScreenMode === "manual" ? Array.from(labelManualIds) : labelMatchedScreens.map((s) => s.id);
    if (editingLabel) { setLabels((p) => p.map((l) => l.id === editingLabel.id ? { ...l, name: labelModalName.trim(), screenIds: ids } : l)); }
    else { setLabels((p) => [...p, { id: `lbl-${Date.now()}`, name: labelModalName.trim(), screenIds: ids, createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }]); }
    closeLabel();
  };

  const openCreateCdmTag = (preselectedKey?: string) => { setCdmModalKey(preselectedKey || ""); setCdmModalNewKey(""); setCdmModalValue(""); setCdmScreenMode("tags"); setCdmSelTags([]); setCdmTagSearch(""); setCdmExpandedGroups([]); setCdmShowAll({}); setCdmManualIds(new Set()); setCdmScreenSearch(""); setShowCdmModal(true); };
  const closeCdmModal = () => setShowCdmModal(false);
  const saveCdmTag = () => {
    const keyName = cdmModalKey === "__new__" ? cdmModalNewKey.trim() : cdmKeys.find((k) => k.id === cdmModalKey)?.key || cdmModalNewKey.trim();
    if (!keyName || !cdmModalValue.trim()) return;
    const screenCount = cdmScreenMode === "manual" ? cdmManualIds.size : cdmMatchedScreens.length;
    const newVal: CdmValue = { id: `cv-${Date.now()}`, value: cdmModalValue.trim(), screenCount };
    const existingKey = cdmKeys.find((k) => k.key === keyName);
    if (existingKey) {
      setCdmKeys((p) => p.map((k) => k.id === existingKey.id ? { ...k, values: [...k.values, newVal] } : k));
    } else {
      setCdmKeys((p) => [...p, { id: `ck-${Date.now()}`, key: keyName, isAuto: false, createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), values: [newVal] }]);
    }
    closeCdmModal();
  };

  // Shared screen selector renderer
  const renderScreenSelector = (
    mode: ScreenMode, setMode: (m: ScreenMode) => void,
    selTags: string[], setSelTags: (fn: (p: string[]) => string[]) => void,
    tagSearch: string, setTagSearch: (s: string) => void,
    expandedGroups: string[], setExpandedGroups: (fn: (p: string[]) => string[]) => void,
    showAllMap: Record<string, boolean>, setShowAllMap: (fn: (p: Record<string, boolean>) => Record<string, boolean>) => void,
    manualIds: Set<string>, setManualIds: (fn: (p: Set<string>) => Set<string>) => void,
    screenSearch: string, setScreenSearch: (s: string) => void,
    matchedScreens: typeof allScreens,
    filteredScreens: typeof allScreens,
    visGroups: string[], tagGroups: Record<string, typeof modalAllTags>,
    effCount: number,
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="skoop-section-header">Screen Group</p>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button onClick={() => setMode("tags")} className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "tags" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}><Tag size={11}/> By Tags</button>
          <button onClick={() => setMode("manual")} className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-border transition-colors ${mode === "manual" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}><Monitor size={11}/> By Screen</button>
        </div>
      </div>
      {mode === "tags" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Screens matched dynamically — new screens automatically included if they carry a matching tag.</p>
          {selTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">{selTags.map((t) => <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}<button onClick={() => setSelTags((p) => p.filter((x) => x !== t))}><X size={10}/></button></span>)}</div>
              <div className="flex items-center gap-2 rounded-md bg-secondary/60 border border-border px-3 py-2"><Monitor size={12} className="text-primary shrink-0"/><p className="text-xs font-medium">{matchedScreens.length} screen{matchedScreens.length !== 1 ? "s" : ""} match</p><button onClick={() => setSelTags(() => [])} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear all</button></div>
            </div>
          )}
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search tags..." className="pl-9 text-xs" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)}/>{tagSearch && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setTagSearch("")}><X size={12} className="text-muted-foreground"/></button>}</div>
          <div className="space-y-1">
            {visGroups.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">{tagSearch ? `No tags match "${tagSearch}"` : "All available tags selected."}</p>}
            {visGroups.map((gn) => {
              const tags = tagGroups[gn]; const isExp = tagSearch.trim().length > 0 || expandedGroups.includes(gn); const sAll = showAllMap[gn]; const CAP = 12; const vis = sAll ? tags : tags.slice(0, CAP);
              return (
                <div key={gn} className="border border-border rounded-md">
                  <button onClick={() => setExpandedGroups((p) => p.includes(gn) ? p.filter((x) => x !== gn) : [...p, gn])} className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
                    <span className="flex items-center gap-1.5">{isExp ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}{gn} <span className="text-muted-foreground font-normal">({tags.length})</span></span>
                  </button>
                  {isExp && <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">{vis.map((tag) => <button key={tag.value} onClick={() => { setSelTags((p) => [...p, tag.value]); setTagSearch(""); }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">{tag.type === "auto" ? <Globe size={10} className="shrink-0"/> : null}+ {tag.value} <span className="text-[10px] opacity-60">({tag.screenCount})</span></button>)}{!sAll && tags.length > CAP && <button onClick={(e) => { e.stopPropagation(); setShowAllMap((p) => ({...p, [gn]: true})); }} className="text-xs text-primary hover:underline px-1">Show all {tags.length}</button>}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {mode === "manual" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Select specific screens manually.</p>
          <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{manualIds.size} of {allScreens.length} selected</p><div className="flex gap-2"><Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setManualIds(() => new Set(filteredScreens.map((s) => s.id)))}>Select all</Button><Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setManualIds(() => new Set())}>Clear</Button></div></div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search screens..." className="pl-9 text-xs" value={screenSearch} onChange={(e) => setScreenSearch(e.target.value)}/>{screenSearch && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setScreenSearch("")}><X size={12} className="text-muted-foreground"/></button>}</div>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">{filteredScreens.map((s) => { const sel = manualIds.has(s.id); return <button key={s.id} onClick={() => setManualIds((p) => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors ${sel ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-secondary/60"}`}><div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${sel ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>{sel && <Check size={11} className="text-primary-foreground"/>}</div><Monitor size={13} className="text-muted-foreground shrink-0"/><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s.name}</p>{s.venue && <p className="text-[11px] text-muted-foreground truncate">{s.venue}</p>}</div></button>; })}</div>
        </div>
      )}
      {effCount > 0 && <div className="rounded-md bg-secondary/60 border border-border px-3 py-2 flex items-center gap-2"><Monitor size={12} className="text-primary shrink-0"/><p className="text-xs font-medium">{effCount} screen{effCount !== 1 ? "s" : ""} will be assigned</p></div>}
    </div>
  );

  const [labelSearch, setLabelSearch] = useState("");
  const filteredLabels = labels.filter((l) => !labelSearch || l.name.toLowerCase().includes(labelSearch.toLowerCase()));

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and network configuration" icon={<SettingsIcon size={20} />} />
      <div className="border-b border-border px-8">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="p-8 max-w-3xl space-y-6">
        {/* Placeholder for non-Tags tabs */}
        {tab !== "Tags" && (
          <div className="skoop-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{tab} settings coming soon.</p>
          </div>
        )}
        {tab === "Tags" && (
          <div className="space-y-6 max-w-4xl">

            {/* ── Labels ── */}
            <div className="skoop-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-semibold">Labels</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Simple tags for organising screens. Used for campaign targeting and content filtering.</p>
                </div>
                <Button size="sm" onClick={openCreateLabel} className="gap-1.5"><Plus size={13}/> Create Label</Button>
              </div>
              <div className="px-5 py-3 border-b border-border">
                <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search labels…" value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} className="pl-8 h-8 text-sm"/></div>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Screens</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Content Items</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Created</th>
                    <th className="px-5 py-2.5"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLabels.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-muted-foreground">No labels found</td></tr>}
                  {filteredLabels.map((l) => (
                    <tr key={l.id} className="group hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium">{l.name}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{l.screenIds.length}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">—</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{l.createdAt}</td>
                      <td className="px-5 py-3"><div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditLabel(l)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={12}/></button>
                        <button onClick={() => setLabels((p) => p.filter((x) => x.id !== l.id))} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 size={12}/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CDM Attribute Tags ── */}
            <div className="skoop-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-semibold">CDM Attribute Tags</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Key-value attributes used for campaign targeting. Location keys (city, state, zip, country) are auto-generated from screen data.</p>
                </div>
                <Button size="sm" onClick={() => openCreateCdmTag()} className="gap-1.5"><Plus size={13}/> Add Tag Value</Button>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground w-8"/>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Key</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Values</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Screens</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="px-5 py-2.5"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cdmKeys.map((ck) => {
                    const isExp = expandedKeys.has(ck.id);
                    const totalScreens = ck.values.reduce((a, v) => a + v.screenCount, 0);
                    const valuePreview = ck.values.slice(0, 3).map((v) => v.value).join(", ") + (ck.values.length > 3 ? ` +${ck.values.length - 3} more` : "");
                    return (
                      <>
                        <tr key={ck.id} className="group hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => toggleKeyExpand(ck.id)}>
                          <td className="px-5 py-3 text-muted-foreground">{isExp ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}</td>
                          <td className="px-5 py-3 font-medium font-mono text-xs">{ck.key}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs max-w-[220px] truncate">{valuePreview}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">{totalScreens.toLocaleString()}</td>
                          <td className="px-5 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ck.isAuto ? "bg-blue-50 text-blue-600" : "bg-secondary text-muted-foreground"}`}>{ck.isAuto ? "Auto" : "Custom"}</span></td>
                          <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {!ck.isAuto && <><button onClick={() => openCreateCdmTag(ck.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground text-[10px] font-medium">+ Value</button><button onClick={() => setCdmKeys((p) => p.filter((x) => x.id !== ck.id))} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 size={12}/></button></>}
                              {ck.isAuto && <button onClick={() => openCreateCdmTag(ck.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground text-[10px] font-medium">+ Value</button>}
                            </div>
                          </td>
                        </tr>
                        {isExp && ck.values.map((v) => (
                          <tr key={v.id} className="bg-secondary/20">
                            <td className="pl-10 py-2" colSpan={1}/>
                            <td className="py-2 text-xs text-muted-foreground font-mono pl-2">{ck.key}</td>
                            <td className="py-2 text-xs font-medium pl-5">{v.value}</td>
                            <td className="py-2 text-xs text-muted-foreground">{v.screenCount.toLocaleString()}</td>
                            <td className="py-2"/>
                            <td className="py-2 pr-5">
                              {!ck.isAuto && <div className="flex justify-end"><button onClick={() => setCdmKeys((p) => p.map((k) => k.id === ck.id ? { ...k, values: k.values.filter((x) => x.id !== v.id) } : k))} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 size={11}/></button></div>}
                            </td>
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Label modal ─────────────────────────────────────────────────────── */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-[620px] max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">{editingLabel ? "Edit Label" : "Create Label"}</h2>
              <button onClick={closeLabel} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><X size={15}/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Label Name <span className="text-destructive">*</span></label>
                <Input placeholder="e.g. Food & Grocery, Check Cashing…" value={labelModalName} onChange={(e) => setLabelModalName(e.target.value)} className="mt-1"/>
              </div>
              {renderScreenSelector(
                labelScreenMode, setLabelScreenMode,
                labelSelTags, setLabelSelTags,
                labelTagSearch, setLabelTagSearch,
                labelExpandedGroups, setLabelExpandedGroups,
                labelShowAll, setLabelShowAll,
                labelManualIds, setLabelManualIds,
                labelScreenSearch, setLabelScreenSearch,
                labelMatchedScreens, labelFilteredScreens,
                labelVisGroups, labelGroups,
                labelEffCount,
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={closeLabel}>Cancel</Button>
              <Button size="sm" onClick={saveLabel} disabled={!labelModalName.trim()}>{editingLabel ? "Save Changes" : "Create Label"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CDM tag value modal ──────────────────────────────────────────────── */}
      {showCdmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-[620px] max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Add Tag Value</h2>
              <button onClick={closeCdmModal} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><X size={15}/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Key <span className="text-destructive">*</span></label>
                  <select value={cdmModalKey} onChange={(e) => setCdmModalKey(e.target.value)} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">— Select or create key —</option>
                    {cdmKeys.map((k) => <option key={k.id} value={k.id}>{k.key}</option>)}
                    <option value="__new__">+ Create new key…</option>
                  </select>
                </div>
                {cdmModalKey === "__new__" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">New Key Name <span className="text-destructive">*</span></label>
                    <Input placeholder="e.g. venue_type, network_tier…" value={cdmModalNewKey} onChange={(e) => setCdmModalNewKey(e.target.value)} className="mt-1 font-mono"/>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Value <span className="text-destructive">*</span></label>
                    <Input placeholder="e.g. Grocery Chain, Premium…" value={cdmModalValue} onChange={(e) => setCdmModalValue(e.target.value)} className="mt-1"/>
                  </div>
                )}
              </div>
              {cdmModalKey === "__new__" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Value <span className="text-destructive">*</span></label>
                  <Input placeholder="e.g. Grocery Chain, Premium…" value={cdmModalValue} onChange={(e) => setCdmModalValue(e.target.value)} className="mt-1"/>
                </div>
              )}
              {renderScreenSelector(
                cdmScreenMode, setCdmScreenMode,
                cdmSelTags, setCdmSelTags,
                cdmTagSearch, setCdmTagSearch,
                cdmExpandedGroups, setCdmExpandedGroups,
                cdmShowAll, setCdmShowAll,
                cdmManualIds, setCdmManualIds,
                cdmScreenSearch, setCdmScreenSearch,
                cdmMatchedScreens, cdmFilteredScreens,
                cdmVisGroups, cdmGroups,
                cdmEffCount,
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={closeCdmModal}>Cancel</Button>
              <Button size="sm" onClick={saveCdmTag} disabled={!cdmModalValue.trim() || (!cdmModalKey || (cdmModalKey === "__new__" && !cdmModalNewKey.trim()))}>Add Tag Value</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
