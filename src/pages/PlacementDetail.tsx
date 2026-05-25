import { MapPin, ArrowLeft, Monitor, Search, X, Check, Tag, ChevronDown, ChevronRight, Globe } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allScreens } from "@/data/screens";
import { allPlacements } from "@/data/placements";
import { getAllScreenTags, getScreensMatchingTags } from "@/data/screenTags";
import { toast } from "@/hooks/use-toast";

type ScreenMode = "tags" | "manual";

const TAG_CATEGORY_ORDER = ["Country", "State", "City", "ZIP", "Venue"];

export default function PlacementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const existing = id ? allPlacements.find((p) => p.id === id) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState("");
  const [screenversePct, setScreenversePct] = useState(existing?.prog ?? 25);

  // Screen group
  const [screenMode, setScreenMode] = useState<ScreenMode>("tags");

  // Tag-based mode
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showAllGroups, setShowAllGroups] = useState<Record<string, boolean>>({});

  // Manual mode
  const [selectedScreenIds, setSelectedScreenIds] = useState<Set<string>>(
    new Set(existing?.screenIds ?? [])
  );
  const [screenSearch, setScreenSearch] = useState("");

  const allTags = useMemo(() => getAllScreenTags(), []);

  const tagMatchedScreens = useMemo(
    () => getScreensMatchingTags(selectedTags),
    [selectedTags]
  );

  const effectiveScreenCount =
    screenMode === "tags" ? tagMatchedScreens.length : selectedScreenIds.size;

  // Tags grouped for the picker
  const filteredTags = useMemo(
    () =>
      allTags.filter(
        (t) =>
          !selectedTags.includes(t.value) &&
          t.value.toLowerCase().includes(tagSearch.toLowerCase())
      ),
    [allTags, selectedTags, tagSearch]
  );

  const tagGroups = useMemo(() => {
    const groups: Record<string, typeof filteredTags> = {};
    filteredTags.forEach((tag) => {
      const cat = tag.category || "Venue";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tag);
    });
    Object.values(groups).forEach((g) => g.sort((a, b) => b.screenCount - a.screenCount));
    return groups;
  }, [filteredTags]);

  const visibleGroupNames = TAG_CATEGORY_ORDER.filter((g) => tagGroups[g]?.length);

  const removeTag = (tag: string) =>
    setSelectedTags((prev) => prev.filter((t) => t !== tag));

  const addTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
    setTagSearch("");
  };

  const toggleGroup = (group: string) =>
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );

  // Manual mode helpers
  const filteredScreens = useMemo(
    () =>
      allScreens.filter(
        (s) =>
          !screenSearch ||
          s.name.toLowerCase().includes(screenSearch.toLowerCase()) ||
          (s.venue ?? "").toLowerCase().includes(screenSearch.toLowerCase())
      ),
    [screenSearch]
  );

  const toggleScreen = (sid: string) => {
    setSelectedScreenIds((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a placement name.", variant: "destructive" });
      return;
    }
    if (effectiveScreenCount === 0) {
      toast({ title: "No screens selected", description: "Add at least one screen or tag before saving.", variant: "destructive" });
      return;
    }
    toast({ title: isNew ? "Rule created" : "Rule updated", description: `"${name}" saved with ${effectiveScreenCount} screens.` });
    navigate("/placements");
  };

  return (
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/placements">Inventory Rules</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{isNew ? "New Rule" : name || "Rule"}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={isNew ? "New Inventory Rule" : "Edit Inventory Rule"}
        subtitle="Group screens and set their programmatic allocation"
        icon={<MapPin size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}><ArrowLeft size={14} className="mr-1" /> Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Rule</Button>
          </div>
        }
      />

      <div className="p-8 space-y-6 max-w-3xl">

        {/* Name & description */}
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Details</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Placement Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Financial Banks · Northeast" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description <span className="text-muted-foreground/60">(optional)</span></label>
              <Input placeholder="e.g. Bank branch screens across the northeastern US" className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Screenverse % */}
        <div className="skoop-card p-5 space-y-4">
          <p className="skoop-section-header">Programmatic Allocation</p>
          <p className="text-xs text-muted-foreground">
            Reserve this percentage of every screen's slots for Screenverse. The remaining {100 - screenversePct}% is available for direct campaigns and fill.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Screenverse allocation</span>
              <span className="font-semibold tabular-nums">{screenversePct}%</span>
            </div>
            <Slider value={[screenversePct]} onValueChange={([v]) => setScreenversePct(v)} min={0} max={60} step={1} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0% (no programmatic)</span>
              <span>60% max</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-md bg-secondary px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">Screenverse</p>
                <p className="text-sm font-semibold tabular-nums text-primary">{screenversePct}%</p>
              </div>
              <div className="rounded-md bg-secondary px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">Campaigns</p>
                <p className="text-sm font-semibold tabular-nums">{100 - screenversePct}%</p>
              </div>
              <div className="rounded-md bg-secondary px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">Screens</p>
                <p className={`text-sm font-semibold tabular-nums ${effectiveScreenCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {effectiveScreenCount > 0 ? effectiveScreenCount : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Screen group */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="skoop-section-header">Screen Group</p>
            {/* Mode tabs */}
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                onClick={() => setScreenMode("tags")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  screenMode === "tags"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Tag size={11} /> By Tags
              </button>
              <button
                onClick={() => setScreenMode("manual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-border transition-colors ${
                  screenMode === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Monitor size={11} /> By Screen
              </button>
            </div>
          </div>

          {/* ── Tag mode ── */}
          {screenMode === "tags" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Screens are matched dynamically. New screens added to your network automatically join this placement if they carry a matching tag.
              </p>

              {/* Selected tags */}
              {selectedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-primary/70">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-secondary/60 border border-border px-3 py-2">
                    <Monitor size={12} className="text-primary shrink-0" />
                    <p className="text-xs font-medium text-foreground tabular-nums">
                      {tagMatchedScreens.length} screen{tagMatchedScreens.length !== 1 ? "s" : ""} match{tagMatchedScreens.length === 1 ? "es" : ""} these tags
                    </p>
                    {tagMatchedScreens.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tag search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  className="pl-9 text-xs"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
                {tagSearch && (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setTagSearch("")}>
                    <X size={12} className="text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Tag groups */}
              <div className="space-y-1">
                {visibleGroupNames.length === 0 && tagSearch && (
                  <p className="text-xs text-muted-foreground text-center py-3">No tags match "{tagSearch}"</p>
                )}
                {visibleGroupNames.length === 0 && !tagSearch && selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">All available tags have been selected.</p>
                )}
                {visibleGroupNames.map((groupName) => {
                  const tags = tagGroups[groupName];
                  const isExpanded = tagSearch.trim().length > 0 || expandedGroups.includes(groupName);
                  const showAll = showAllGroups[groupName];
                  const CAP = 12;
                  const visibleTags = showAll ? tags : tags.slice(0, CAP);

                  return (
                    <div key={groupName} className="border border-border rounded-md">
                      <button
                        onClick={() => toggleGroup(groupName)}
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
                              onClick={() => addTag(tag.value)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                            >
                              {tag.type === "auto" ? <Globe size={10} className="shrink-0" /> : null}
                              + {tag.value}
                              <span className="text-[10px] opacity-60">({tag.screenCount})</span>
                            </button>
                          ))}
                          {!showAll && tags.length > CAP && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAllGroups((prev) => ({ ...prev, [groupName]: true })); }}
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
          )}

          {/* ── Manual mode ── */}
          {screenMode === "manual" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select specific screens. You'll need to update this placement manually when new screens are added.
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{selectedScreenIds.size} of {allScreens.length} selected</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7"
                    onClick={() => setSelectedScreenIds(new Set(filteredScreens.map((s) => s.id)))}>
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7"
                    onClick={() => setSelectedScreenIds(new Set())}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search screens..."
                  className="pl-9 text-xs"
                  value={screenSearch}
                  onChange={(e) => setScreenSearch(e.target.value)}
                />
                {screenSearch && (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setScreenSearch("")}>
                    <X size={12} className="text-muted-foreground" />
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {filteredScreens.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No screens match your search.</p>
                )}
                {filteredScreens.map((screen) => {
                  const selected = selectedScreenIds.has(screen.id);
                  return (
                    <button
                      key={screen.id}
                      onClick={() => toggleScreen(screen.id)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors ${
                        selected ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-secondary/60"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}>
                        {selected && <Check size={11} className="text-primary-foreground" />}
                      </div>
                      <Monitor size={13} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{screen.name}</p>
                        {screen.venue && <p className="text-[11px] text-muted-foreground truncate">{screen.venue}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
