import { useState } from "react";
import { Monitor, ArrowLeft, MapPin, ExternalLink, Globe, Tag, Plus, X, BarChart3 } from "lucide-react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allScreens } from "@/data/screens";
import { allPlacements } from "@/data/placements";
import { getAutoTags, STANDARD_VENUE_TAGS } from "@/data/screenTags";
import { getImpressionMultiplier, getImpressionEntry, setImpressionMultiplier } from "@/data/impressionStore";

export default function ScreenDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromPlacement = searchParams.get("from") === "placement";
  const placementId = searchParams.get("placementId");

  const backPath = fromPlacement && placementId ? `/placements/${placementId}` : "/screens";
  const backLabel = fromPlacement ? "Back to Network Rule" : "Back to Screens";
  const screen = allScreens.find((s) => s.id === id);

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
  const [manualTags, setManualTags] = useState<string[]>(screen.manualTags || []);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const addManualTag = (tag: string) => {
    if (tag.trim() && !manualTags.includes(tag.trim())) {
      setManualTags((prev) => [...prev, tag.trim()]);
    }
  };
  const removeManualTag = (tag: string) => setManualTags((prev) => prev.filter((t) => t !== tag));

  const placementObj = placementId ? allPlacements.find(p => p.id === placementId) : null;

  return (
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            {fromPlacement && placementObj ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/placements">Network Rules</Link></BreadcrumbLink>
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
            </div>

            {/* Tags Card */}
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Tags</p>

              {/* Auto tags */}
              {autoTags && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Auto</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: autoTags.country, cat: "Country" },
                      { label: autoTags.state, cat: "State" },
                      { label: autoTags.city, cat: "City" },
                      { label: autoTags.zip, cat: "ZIP" },
                    ].map((t) => (
                      <span key={t.cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                        <Globe size={10} className="shrink-0" />
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied tags */}
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

            <div className="skoop-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skoop-section-header">Network Rules</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rules that include this screen in their inventory
                  </p>
                </div>
              </div>

              {linkedPlacements.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg py-8 text-center">
                  <MapPin size={20} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No network rules assigned to this screen</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a network rule to monetise this screen</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate("/placements")}>
                    View Network Rules
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedPlacements.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3 px-4 border border-border rounded-md hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/placements/${p.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.screenIds.length} screens · {p.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-28">
                          <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} />
                        </div>
                        <StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} />
                        <span className="text-xs text-primary">View Rule</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Impression Data Card */}
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
                <p className="text-xs text-muted-foreground">Network Rules</p>
                <p className="text-lg font-semibold tabular-nums">{linkedPlacements.length}</p>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
