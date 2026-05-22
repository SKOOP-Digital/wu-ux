import { useState } from "react";
import { Monitor, ArrowLeft, MapPin, ExternalLink, Globe, Tag, Plus, X, BarChart3, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allScreens } from "@/data/screens";
import { allPlacements } from "@/data/placements";
import { getAutoTags, STANDARD_VENUE_TAGS } from "@/data/screenTags";
import { getImpressionMultiplier, getImpressionEntry, setImpressionMultiplier } from "@/data/impressionStore";

function formatMilitaryTime(time: number): string {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function ImpressionDataCard({ screenId }: { screenId: string }) {
  const entry = getImpressionEntry(screenId);
  const [manualValue, setManualValue] = useState(entry?.multiplier?.toString() || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const val = parseFloat(manualValue);
    if (!isNaN(val) && val >= 0) {
      setImpressionMultiplier(screenId, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {entry ? (
        <>
          <div>
            <p className="text-xs text-muted-foreground">Impressions per play</p>
            <p className="text-sm font-medium tabular-nums mt-1">{entry.multiplier.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last updated</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{entry.updatedAt.toLocaleString()}</p>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">No impression data — import via Settings or enter manually below.</p>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 max-w-[200px]">
          <label className="text-xs text-muted-foreground">Manual entry</label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 150"
            className="mt-1 text-sm"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={!manualValue}>
          {saved ? "Saved ✓" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function ScreenDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromPlacement = searchParams.get("from") === "placement";
  const placementId = searchParams.get("placementId");

  const backPath = fromPlacement && placementId ? `/placements/${placementId}` : "/screens";
  const backLabel = fromPlacement ? "Back to Placement" : "Back to Screens";
  const screen = allScreens.find((s) => s.id === id);

  // All hooks must be before early return
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [coordsSaved, setCoordsSaved] = useState(false);
  const [manualTags, setManualTags] = useState<string[]>(screen?.manualTags || []);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  if (!screen) {
    return (
      <div>
        <PageHeader title="Screen Not Found" subtitle="This screen does not exist" icon={<Monitor size={20} />} />
        <div className="p-8">
          <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
            <ArrowLeft size={14} className="mr-1" /> {backLabel}
          </Button>
        </div>
      </div>
    );
  }

  const linkedPlacements = allPlacements.filter((p) => p.screenIds.includes(screen.id));
  const dailyCapacity = screen.loopsPerHour * 16;
  const autoTags = getAutoTags(screen);

  const addManualTag = (tag: string) => {
    if (tag.trim() && !manualTags.includes(tag.trim())) {
      setManualTags((prev) => [...prev, tag.trim()]);
    }
  };
  const removeManualTag = (tag: string) => setManualTags((prev) => prev.filter((t) => t !== tag));

  const placementObj = placementId ? allPlacements.find(p => p.id === placementId) : null;

  // Active hours display
  const activeHoursDisplay = (() => {
    if (screen.activeHoursStart == null && screen.activeHoursEnd == null) return null;
    if (screen.activeHoursStart === 0 && screen.activeHoursEnd === 2359) return "Always On";
    return `${formatMilitaryTime(screen.activeHoursStart || 0)} – ${formatMilitaryTime(screen.activeHoursEnd || 0)}`;
  })();

  const handleSaveCoords = () => {
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      // Mutate in place for this session
      (screen as any).lat = lat;
      (screen as any).lng = lng;
      (screen as any).geocodeStatus = "success";
      setCoordsSaved(true);
      setTimeout(() => setCoordsSaved(false), 2000);
    }
  };

  return (
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            {fromPlacement && placementObj ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/placements">Placements</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to={`/placements/${placementObj.id}`}>{placementObj.name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{screen.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/screens">Screens</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{screen.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={screen.name}
        subtitle={`${screen.venue} · ${screen.orientation} · ${screen.resolution}`}
        icon={<Monitor size={20} />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
            <ArrowLeft size={14} className="mr-1" /> {backLabel}
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Screen Details</p>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${screen.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${screen.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                      {screen.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Venue</p>
                  <p className="text-sm font-medium mt-1">{screen.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution</p>
                  <p className="text-sm font-medium tabular-nums mt-1">{screen.resolution}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orientation</p>
                  <p className="text-sm font-medium mt-1">{screen.orientation}</p>
                </div>
              </div>

              {/* Location info */}
              <div className="grid grid-cols-4 gap-4 pt-2 border-t border-border">
                {screen.city && (
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-sm font-medium mt-1">{screen.city}</p>
                  </div>
                )}
                {screen.state && (
                  <div>
                    <p className="text-xs text-muted-foreground">State</p>
                    <p className="text-sm font-medium mt-1">{screen.state}</p>
                  </div>
                )}
                {screen.zip && (
                  <div>
                    <p className="text-xs text-muted-foreground">ZIP</p>
                    <p className="text-sm font-medium tabular-nums mt-1">{screen.zip}</p>
                  </div>
                )}
                {screen.country && (
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm font-medium mt-1">{screen.country}</p>
                  </div>
                )}
              </div>

              {/* Active hours */}
              {activeHoursDisplay && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Active Hours</p>
                  </div>
                  <p className="text-sm font-medium mt-1">{activeHoursDisplay}</p>
                </div>
              )}

              {/* Geocode status */}
              <div className="pt-2 border-t border-border">
                {screen.geocodeStatus === "success" ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Location verified</span>
                    {screen.lat != null && screen.lng != null && (
                      <span className="text-[11px] text-muted-foreground ml-2 tabular-nums">
                        {screen.lat.toFixed(4)}, {screen.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500" />
                      <span className="text-xs font-medium text-amber-700">Location missing — proximity search unavailable</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Latitude</label>
                        <Input type="number" step="any" placeholder="e.g. 40.7128" className="mt-1 text-sm w-36" value={editLat} onChange={(e) => setEditLat(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Longitude</label>
                        <Input type="number" step="any" placeholder="e.g. -74.0060" className="mt-1 text-sm w-36" value={editLng} onChange={(e) => setEditLng(e.target.value)} />
                      </div>
                      <Button size="sm" variant="outline" onClick={handleSaveCoords} disabled={!editLat || !editLng}>
                        {coordsSaved ? "Saved ✓" : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Card */}
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Tags</p>

              {(autoTags || linkedPlacements.length > 0) && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Auto</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedPlacements.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                        <Globe size={10} className="shrink-0" />
                        {p.name}
                      </span>
                    ))}
                    {autoTags && [
                      { label: autoTags.country, cat: "Country" },
                      { label: autoTags.state, cat: "State" },
                      { label: autoTags.city, cat: "City" },
                      { label: autoTags.zip, cat: "ZIP" },
                    ].filter(t => t.label).map((t) => (
                      <span key={t.cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                        <Globe size={10} className="shrink-0" />
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Tag size={12} className="text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Applied</span>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {manualTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {tag}
                      <button onClick={() => removeManualTag(tag)} className="hover:text-destructive"><X size={10} /></button>
                    </span>
                  ))}
                  <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                        <Plus size={10} /> Add Tag
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 space-y-2" align="start">
                      <p className="text-xs font-medium text-foreground">Standard Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_VENUE_TAGS.filter((t) => !manualTags.includes(t)).map((tag) => (
                          <button key={tag} onClick={() => { addManualTag(tag); }} className="px-2 py-0.5 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs font-medium text-foreground pt-1">Custom Tag</p>
                      <Input
                        placeholder="Type and press Enter"
                        className="text-xs h-8"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addManualTag(customTagInput);
                            setCustomTagInput("");
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Playback Capacity</p>
              <p className="text-xs text-muted-foreground">This screen's playback configuration determines eligible ad inventory</p>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Loop Duration</p>
                  <p className="text-sm font-medium tabular-nums">{screen.loopDuration}s</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Loops per Hour</p>
                  <p className="text-sm font-medium tabular-nums">{screen.loopsPerHour}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Hours/Day</p>
                  <p className="text-sm font-medium tabular-nums">16h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Daily Eligible Capacity</p>
                  <p className="text-sm font-semibold tabular-nums text-primary">{dailyCapacity.toLocaleString()} opp</p>
                </div>
              </div>
            </div>

            <div className="skoop-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-muted-foreground" />
                <p className="skoop-section-header">Impression Data</p>
              </div>
              <ImpressionDataCard screenId={screen.id} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Summary</p>
              <div>
                <p className="text-xs text-muted-foreground">Daily Eligible Playback Capacity</p>
                <p className="text-lg font-semibold tabular-nums">{dailyCapacity.toLocaleString()} opportunities</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${screen.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${screen.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                  {screen.status}
                </span>
              </div>
              {screen.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm mt-1">{screen.address}</p>
                  {screen.city && <p className="text-xs text-muted-foreground">{screen.city}, {screen.state} {screen.zip}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
