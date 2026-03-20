import { MapPin, ArrowLeft, Monitor, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import ScreenSelectorModal from "@/components/shared/ScreenSelectorModal";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { allScreens } from "@/data/screens";
import { allPlacements, calcCapacity } from "@/data/placements";

const sections = ["Where it runs", "How it runs", "How it is monetised"];
const PIE_COLORS = ["hsl(215,16%,47%)", "hsl(210,100%,50%)", "hsl(262,80%,60%)"];

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

  return (
    <div>
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
                <p className="text-xs text-muted-foreground">This ad placement is linked to screens at a specific venue. All screens below will display content from campaigns assigned to this placement.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-muted-foreground">Scope</p><p className="text-sm font-medium">{placement.scope}</p></div>
                  <div><p className="text-xs text-muted-foreground">Venue{venues.length > 1 ? "s" : ""}</p><p className="text-sm font-medium">{venues.join(", ")}</p></div>
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
                      <div key={s.id} className="flex items-center justify-between py-2.5 px-3 border border-border rounded-md">
                        <div className="flex items-center gap-2.5">
                          <Monitor size={14} className="text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{s.venue} · {s.resolution}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                            {s.status}
                          </span>
                          <button
                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                            onClick={() => navigate(`/screens/${s.id}?from=placement&placementId=${placement.id}`)}
                          >
                            View <ExternalLink size={10} />
                          </button>
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
                <div><p className="text-xs text-muted-foreground">Active Campaigns</p><p className="text-lg font-semibold tabular-nums">3</p></div>
                <div><p className="text-xs text-muted-foreground">Forecasted Fill</p><p className="text-lg font-semibold tabular-nums">88%</p></div>
                <div><p className="text-xs text-muted-foreground">Projected Revenue</p><p className="text-lg font-semibold tabular-nums">$4,820</p></div>
              </div>
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Capacity Usage</p>
                <p className="text-[11px] text-muted-foreground">Total available ad slots based on loop duration across {assignedScreens.length} screen{assignedScreens.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} slots/day</span></div>
                </div>
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
                  <div><p className="text-xs text-muted-foreground">Loop Duration</p><p className="text-sm font-medium tabular-nums">120 seconds</p></div>
                  <div><p className="text-xs text-muted-foreground">Loops per Hour</p><p className="text-sm font-medium tabular-nums">30</p></div>
                </div>
              </div>

              <div className="skoop-card p-5">
                <p className="skoop-section-header mb-1">Daypart Schedule</p>
                <p className="text-xs text-muted-foreground mb-4">Controls when this placement is active during the day</p>
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
                <p className="text-[11px] text-muted-foreground">Total available ad slots based on loop duration</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} slots/day</span></div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}%` }} />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">{capacity.total > 0 ? Math.round((capacity.booked / capacity.total) * 100) : 0}% utilised</p>
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
                    <div className="flex justify-between text-sm mb-1"><span>Owned</span><span className="tabular-nums font-medium">{owned}%</span></div>
                    <Slider value={[owned]} onValueChange={([v]) => { if (v + direct <= 100) setOwned(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-slate" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Direct</span><span className="tabular-nums font-medium">{direct}%</span></div>
                    <Slider value={[direct]} onValueChange={([v]) => { if (owned + v <= 100) setDirect(v); }} max={100} step={5} className="[&_[role=slider]]:bg-skoop-blue" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Programmatic</span><span className="tabular-nums font-medium">{Math.max(0, prog)}%</span></div>
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
                <p className="text-[11px] text-muted-foreground">Total available ad slots based on loop duration</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{capacity.total.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booked</span><span className="font-medium tabular-nums">{capacity.booked.toLocaleString()} slots/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacity.available.toLocaleString()} slots/day</span></div>
                </div>
              </div>
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Forecast</p>
                <div><p className="text-xs text-muted-foreground">Risk</p><StatusChip status="healthy" label="No under-delivery risk" /></div>
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
