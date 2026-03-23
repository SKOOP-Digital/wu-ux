import { MapPin, ArrowLeft, Monitor, ExternalLink, AlertTriangle, Info, ChevronRight } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import ScreenSelectorModal from "@/components/shared/ScreenSelectorModal";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { allScreens } from "@/data/screens";
import { allPlacements, calcCapacity } from "@/data/placements";

const sections = ["Where it runs", "How it runs", "How it is monetised", "Active Campaigns"];
const PIE_COLORS = ["hsl(215,16%,47%)", "hsl(210,100%,50%)", "hsl(262,80%,60%)"];

// Mock campaigns for this placement
const mockCampaigns = [
  { id: "1", name: "Nike Summer Push", type: "Direct", target: "5,000 plays", delivered: "3,100", pct: 62, status: "Live" },
  { id: "2", name: "Coca-Cola Lobby Spots", type: "Direct", target: "SoV 15%", delivered: "1,800", pct: 72, status: "Under-delivering" },
  { id: "3", name: "Brand Awareness — Q1", type: "Owned", target: "SoV 50%", delivered: "48,000", pct: 96, status: "Live" },
];

export default function PlacementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const placement = allPlacements.find((p) => p.id === id) ?? allPlacements[0];

  const [section, setSection] = useState("Where it runs");
  const [owned, setOwned] = useState(placement.owned);
  const [direct, setDirect] = useState(placement.direct);
  const [screenIds, setScreenIds] = useState<string[]>(placement.screenIds);
  const [showScreenModal, setShowScreenModal] = useState(false);

  const prog = 100 - owned - direct;

  const pieData = [
    { name: "Owned", value: owned },
    { name: "Direct", value: direct },
    { name: "Programmatic", value: Math.max(0, prog) },
  ];

  const assignedScreens = useMemo(
    () => allScreens.filter((s) => screenIds.includes(s.id)),
    [screenIds]
  );

  const capacity = useMemo(
    () => calcCapacity(screenIds, allScreens),
    [screenIds]
  );

  const venues = useMemo(() => {
    const set = new Set(assignedScreens.map((s) => s.venue));
    return Array.from(set);
  }, [assignedScreens]);

  // Derive scope label based on actual selection
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
    const avgLoops = Math.round(assignedScreens.reduce((s, sc) => s + sc.loopsPerHour, 0) / assignedScreens.length);
    return `${assignedScreens.length} screen${assignedScreens.length !== 1 ? "s" : ""} × ${avgLoops} avg loops/hour × 16 active hours = ${capacity.total.toLocaleString()} opportunities/day`;
  }, [assignedScreens, capacity.total]);

  // Capacity by bucket
  const ownedCap = Math.round(capacity.total * owned / 100);
  const directCap = Math.round(capacity.total * direct / 100);
  const progCap = Math.round(capacity.total * Math.max(0, prog) / 100);

  // Forecast states
  const forecastItems = useMemo(() => {
    const items: { label: string; status: string; statusLabel: string }[] = [];
    const utilPct = capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0;
    if (utilPct < 70) items.push({ label: "Overall utilisation", status: "healthy", statusLabel: "On track" });
    else if (utilPct < 90) items.push({ label: "Overall utilisation", status: "at-risk", statusLabel: "Direct allocation nearing limit" });
    else items.push({ label: "Overall utilisation", status: "overbooked", statusLabel: "Capacity near maximum" });
    if (prog > 10) items.push({ label: "Programmatic", status: "healthy", statusLabel: "Backfill available" });
    if (direct > 40) items.push({ label: "Direct campaigns", status: "at-risk", statusLabel: "Under-delivery risk for booked direct" });
    if (items.length === 0) items.push({ label: "Status", status: "healthy", statusLabel: "No conflicts detected" });
    return items;
  }, [capacity, prog, direct]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/placements">Ad Placements</Link></BreadcrumbLink>
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
        subtitle="Ad Placement · Defines how ads run on selected screens"
        icon={<MapPin size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
            <Button size="sm">Save Changes</Button>
          </div>
        }
      />

      {/* Sections nav */}
      <div className="border-b border-border px-8">
        <div className="flex gap-0">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                section === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* ======= WHERE IT RUNS ======= */}
        {section === "Where it runs" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="skoop-card p-5 space-y-4">
                <p className="skoop-section-header">Placement Scope</p>
                <p className="text-xs text-muted-foreground">This ad placement is linked to screens at specific venues. All screens below will display content from campaigns assigned to this placement.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-muted-foreground">Scope</p><p className="text-sm font-medium">{scopeLabel}</p></div>
                  <div><p className="text-xs text-muted-foreground">Venue{venues.length > 1 ? "s" : ""}</p><p className="text-sm font-medium">{venues.length > 0 ? venues.join(", ") : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status={placement.status.toLowerCase().replace(" ", "-")} label={placement.status} /></div>
                </div>
              </div>

              <div className="skoop-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="skoop-section-header">Screens in this Placement</p>
                    <p className="text-xs text-muted-foreground mt-0.5">These screens will display campaigns assigned to this placement</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowScreenModal(true)}>
                    <Monitor size={13} className="mr-1.5" /> Manage Screens
                  </Button>
                </div>

                {assignedScreens.length === 0 ? (
                  <div className="border border-dashed border-border rounded-lg py-8 text-center">
                    <AlertTriangle size={20} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-foreground">No screens assigned yet</p>
                    <p className="text-xs text-muted-foreground mt-1">This placement is not assigned to any screens</p>
                    <Button size="sm" className="mt-3" onClick={() => setShowScreenModal(true)}>
                      Assign Screens
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {assignedScreens.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between py-2.5 px-3 border border-border rounded-md cursor-pointer hover:bg-secondary/40 transition-colors"
                        onClick={() => navigate(`/screens/${s.id}?from=placement&placementId=${placement.id}`)}
                      >
                        <div className="flex items-center gap-2.5">
                          <Monitor size={14} className="text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{s.venue} · {s.resolution} · {s.orientation}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground tabular-nums">{(s.loopsPerHour * 16).toLocaleString()} playback opportunities/day</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                            {s.status}
                          </span>
                          <span className="text-xs text-primary flex items-center gap-1">
                            View <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Summary</p>
                <div><p className="text-xs text-muted-foreground">Active Campaigns</p><p className="text-lg font-semibold tabular-nums">{mockCampaigns.length}</p></div>
                <div><p className="text-xs text-muted-foreground">Forecasted Fill</p><p className="text-lg font-semibold tabular-nums">88%</p></div>
                <div><p className="text-xs text-muted-foreground">Projected Revenue</p><p className="text-lg font-semibold tabular-nums">$4,820</p></div>
              </div>
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Capacity Usage</p>
                <p className="text-[11px] text-muted-foreground">Eligible playback opportunities based on loop duration across {assignedScreens.length} screen{assignedScreens.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} opp/day</span></div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}%` }} />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">{capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}% utilised</p>
              </div>
            </div>
          </div>
        )}

        {/* ======= HOW IT RUNS ======= */}
        {section === "How it runs" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="skoop-card p-5 space-y-4">
                <p className="skoop-section-header">Playback Model</p>
                <p className="text-xs text-muted-foreground">Determines how content is scheduled within this placement.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{placement.model}-based</p></div>
                  <div><p className="text-xs text-muted-foreground">Avg Loop Duration</p><p className="text-sm font-medium tabular-nums">{assignedScreens.length > 0 ? Math.round(assignedScreens.reduce((s, sc) => s + sc.loopDuration, 0) / assignedScreens.length) : 0}s</p></div>
                  <div><p className="text-xs text-muted-foreground">Avg Loops/Hour</p><p className="text-sm font-medium tabular-nums">{assignedScreens.length > 0 ? Math.round(assignedScreens.reduce((s, sc) => s + sc.loopsPerHour, 0) / assignedScreens.length) : 0}</p></div>
                </div>
              </div>

              {/* Capacity calculation block */}
              {capacityFormula && (
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
                  <Info size={14} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">How capacity is calculated</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{capacityFormula}</p>
                  </div>
                </div>
              )}

              <div className="skoop-card p-5">
                <p className="skoop-section-header mb-1">Daypart Schedule</p>
                <p className="text-xs text-muted-foreground mb-2">Controls when this placement is active. Only these dayparts are available for campaigns on this placement.</p>

                {/* Visual timeline strip */}
                <div className="mb-4">
                  <div className="flex h-8 rounded-md overflow-hidden border border-border">
                    {[
                      { label: "6am", hours: 5, active: true },
                      { label: "11am", hours: 3, active: true },
                      { label: "2pm", hours: 3, active: true },
                      { label: "5pm", hours: 4, active: true },
                      { label: "9pm", hours: 3, active: false },
                    ].map((dp, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-center text-[10px] font-medium border-r border-border last:border-0 ${dp.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                        style={{ flex: dp.hours }}
                      >
                        {dp.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>6:00 AM</span>
                    <span>12:00 AM</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { name: "Morning", time: "6:00 AM – 11:00 AM", active: true },
                    { name: "Midday", time: "11:00 AM – 2:00 PM", active: true },
                    { name: "Afternoon", time: "2:00 PM – 5:00 PM", active: true },
                    { name: "Evening", time: "5:00 PM – 9:00 PM", active: true },
                    { name: "Late Night", time: "9:00 PM – 12:00 AM", active: false },
                  ].map((dp) => (
                    <div key={dp.name} className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{dp.name}</p>
                        <p className="text-xs text-muted-foreground">{dp.time}</p>
                      </div>
                      <StatusChip status={dp.active ? "active" : "paused"} label={dp.active ? "Active" : "Inactive"} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Capacity Usage</p>
                <p className="text-[11px] text-muted-foreground">Eligible playback opportunities based on loop duration</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} opp/day</span></div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}%` }} />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">{capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}% utilised</p>
              </div>
              <div className="skoop-card p-5 space-y-2">
                <p className="skoop-section-header">Capacity by Type</p>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Owned ({owned}%)</span><span className="tabular-nums font-medium">{ownedCap.toLocaleString()} opp/day</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Direct ({direct}%)</span><span className="tabular-nums font-medium">{directCap.toLocaleString()} opp/day</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programmatic ({Math.max(0, prog)}%)</span><span className="tabular-nums font-medium">{progCap.toLocaleString()} opp/day</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ======= HOW IT IS MONETISED ======= */}
        {section === "How it is monetised" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="skoop-card p-5 space-y-5">
                <div>
                  <p className="skoop-section-header">Playback Mix Policy</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Controls the ratio between content types in this placement</p>
                </div>
                <div className="bg-secondary/50 rounded-md px-4 py-3 space-y-1">
                  <p className="text-xs font-medium text-foreground">What do these mean?</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Owned</span> — Your own brand content, always fills remaining capacity<br />
                    <span className="font-medium text-foreground">Direct</span> — Campaigns booked directly with advertisers<br />
                    <span className="font-medium text-foreground">Programmatic</span> — Automated ads served via demand partners
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Owned</span>
                      <span className="tabular-nums font-medium">{owned}% · {Math.round(capacity.total * owned / 100).toLocaleString()} opp/day</span>
                    </div>
                    <Slider value={[owned]} onValueChange={([v]) => { if (v + direct <= 100) setOwned(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-slate" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Direct</span>
                      <span className="tabular-nums font-medium">{direct}% · {Math.round(capacity.total * direct / 100).toLocaleString()} opp/day</span>
                    </div>
                    <Slider value={[direct]} onValueChange={([v]) => { if (owned + v <= 100) setDirect(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-blue" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Programmatic</span>
                      <span className="tabular-nums font-medium">{Math.max(0, prog)}% · {Math.round(capacity.total * Math.max(0, prog) / 100).toLocaleString()} opp/day</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-skoop-purple rounded-full transition-all" style={{ width: `${Math.max(0, prog)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Auto-calculated from remaining allocation</p>
                  </div>
                </div>
                <MixBar owned={owned} direct={direct} programmatic={Math.max(0, prog)} height="h-3" showLabels />
              </div>

              <div className="space-y-4">
                <p className="skoop-section-header">Placement Rules</p>
                {[
                  { rule: "Category Separation", desc: "Prevent competing brands from appearing in the same loop", value: "Enabled — 2 slot gap" },
                  { rule: "Back-to-back Prevention", desc: "Same creative cannot play consecutively", value: "Enabled" },
                  { rule: "Frequency Cap", desc: "Maximum plays per unique creative per hour", value: "4 plays/hour" },
                  { rule: "No-fill Fallback", desc: "When programmatic has no fill, fall back to owned content", value: "Enabled — Owned Content Pool" },
                ].map((r) => (
                  <div key={r.rule} className="skoop-card p-4 flex items-center justify-between">
                    <div><p className="text-sm font-medium">{r.rule}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
                    <span className="text-sm text-foreground font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="skoop-card p-5">
                <p className="skoop-section-header mb-4">Mix Allocation</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="ml-auto font-medium tabular-nums">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Capacity Usage</p>
                <p className="text-[11px] text-muted-foreground">Eligible playback opportunities based on loop duration</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} opp/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} opp/day</span></div>
                </div>
              </div>
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Forecast</p>
                {forecastItems.map((f, i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <StatusChip status={f.status} label={f.statusLabel} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======= ACTIVE CAMPAIGNS ======= */}
        {section === "Active Campaigns" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
              <Info size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                These campaigns consume inventory from this ad placement. Delivery targets draw from the placement's available capacity.
              </p>
            </div>

            <div className="skoop-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="skoop-table-header">
                    <th className="skoop-table-cell text-left">Campaign</th>
                    <th className="skoop-table-cell text-left">Type</th>
                    <th className="skoop-table-cell text-left">Delivery Target</th>
                    <th className="skoop-table-cell text-left">Current Delivery</th>
                    <th className="skoop-table-cell text-left w-32">Progress</th>
                    <th className="skoop-table-cell text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCampaigns.map((c) => (
                    <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                      <td className="skoop-table-cell font-medium text-foreground">{c.name}</td>
                      <td className="skoop-table-cell"><StatusChip status={c.type.toLowerCase()} /></td>
                      <td className="skoop-table-cell text-muted-foreground text-xs">{c.target}</td>
                      <td className="skoop-table-cell tabular-nums text-sm">{c.delivered}</td>
                      <td className="skoop-table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-8">{c.pct}%</span>
                        </div>
                      </td>
                      <td className="skoop-table-cell"><StatusChip status={c.status.toLowerCase().replace(" ", "-")} label={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="skoop-card p-4">
                <p className="text-xs text-muted-foreground">Direct Reserved</p>
                <p className="text-lg font-semibold tabular-nums">{directCap.toLocaleString()} opp/day</p>
                <p className="text-[11px] text-muted-foreground">{direct}% of total capacity</p>
              </div>
              <div className="skoop-card p-4">
                <p className="text-xs text-muted-foreground">Programmatic Reserved</p>
                <p className="text-lg font-semibold tabular-nums">{progCap.toLocaleString()} opp/day</p>
                <p className="text-[11px] text-muted-foreground">{Math.max(0, prog)}% of total capacity</p>
              </div>
              <div className="skoop-card p-4">
                <p className="text-xs text-muted-foreground">Owned Reserved</p>
                <p className="text-lg font-semibold tabular-nums">{ownedCap.toLocaleString()} opp/day</p>
                <p className="text-[11px] text-muted-foreground">{owned}% of total capacity</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ScreenSelectorModal
        open={showScreenModal}
        onClose={() => setShowScreenModal(false)}
        selectedIds={screenIds}
        onSave={setScreenIds}
      />
    </div>
  );
}
