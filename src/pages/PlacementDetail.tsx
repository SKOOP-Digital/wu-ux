import { MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const tabs = ["General", "Mix & Capacity", "Dayparts", "Rules", "Reporting"];
const PIE_COLORS = ["hsl(215,16%,47%)", "hsl(210,100%,50%)", "hsl(262,80%,60%)"];

export default function PlacementDetail() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Mix & Capacity");
  const [owned, setOwned] = useState(50);
  const [direct, setDirect] = useState(30);
  const prog = 100 - owned - direct;

  const pieData = [
    { name: "Owned", value: owned },
    { name: "Direct", value: direct },
    { name: "Programmatic", value: Math.max(0, prog) },
  ];

  return (
    <div>
      <PageHeader
        title="Lobby Screens — Main Loop"
        subtitle="Venue · Westfield Sydney · 6 Screens"
        icon={<MapPin size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
            <Button size="sm">Save Changes</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-border px-8">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {tab === "General" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="skoop-card p-5 space-y-4">
                <p className="skoop-section-header">Placement Info</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">Lobby Screens — Main Loop</p></div>
                  <div><p className="text-xs text-muted-foreground">Scope</p><p className="text-sm font-medium">Venue</p></div>
                  <div><p className="text-xs text-muted-foreground">Venue</p><p className="text-sm font-medium">Westfield Sydney</p></div>
                  <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium">6</p></div>
                  <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">Loop-based</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status="healthy" /></div>
                </div>
              </div>
              <div className="skoop-card p-5">
                <p className="skoop-section-header mb-3">Assigned Screens</p>
                {["Lobby Screen 1","Lobby Screen 2","Lobby Screen 3","Lobby Screen 4","Lobby Screen 5","Lobby Screen 6"].map((s) => (
                  <div key={s} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{s}</span>
                    <StatusChip status="online" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Summary</p>
                <div><p className="text-xs text-muted-foreground">Active Campaigns</p><p className="text-lg font-semibold tabular-nums">3</p></div>
                <div><p className="text-xs text-muted-foreground">Forecasted Fill</p><p className="text-lg font-semibold tabular-nums">88%</p></div>
                <div><p className="text-xs text-muted-foreground">Projected Revenue</p><p className="text-lg font-semibold tabular-nums">$4,820</p></div>
              </div>
            </div>
          </div>
        )}

        {tab === "Mix & Capacity" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="skoop-card p-5 space-y-4">
                <p className="skoop-section-header">Capacity Model</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-muted-foreground">Loop Duration</p><p className="text-sm font-medium tabular-nums">120 seconds</p></div>
                  <div><p className="text-xs text-muted-foreground">Loops per Hour</p><p className="text-sm font-medium tabular-nums">30</p></div>
                  <div><p className="text-xs text-muted-foreground">Avg Utilisation</p><p className="text-sm font-medium tabular-nums">82%</p></div>
                </div>
              </div>
              <div className="skoop-card p-5 space-y-5">
                <p className="skoop-section-header">Playback Mix Policy</p>
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
                <p className="skoop-section-header">Forecast</p>
                <div><p className="text-xs text-muted-foreground">Available Inventory</p><p className="text-sm font-medium tabular-nums">3,600 slots/day</p></div>
                <div><p className="text-xs text-muted-foreground">Booked Inventory</p><p className="text-sm font-medium tabular-nums">2,952 slots/day</p></div>
                <div><p className="text-xs text-muted-foreground">Risk</p><StatusChip status="healthy" label="No under-delivery risk" /></div>
              </div>
            </div>
          </div>
        )}

        {tab === "Dayparts" && (
          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Daypart Schedule</p>
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
        )}

        {tab === "Rules" && (
          <div className="space-y-4">
            {[
              { rule: "Category Separation", desc: "Prevent competing brands from appearing in the same loop", value: "Enabled — 2 slot gap" },
              { rule: "Back-to-back Prevention", desc: "Same creative cannot play consecutively", value: "Enabled" },
              { rule: "Frequency Cap", desc: "Maximum plays per unique creative per hour", value: "4 plays/hour" },
              { rule: "No-fill Fallback", desc: "When programmatic has no fill, fall back to owned content", value: "Enabled — Owned Content Pool" },
            ].map((r) => (
              <div key={r.rule} className="skoop-card p-5 flex items-center justify-between">
                <div><p className="text-sm font-medium">{r.rule}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
                <span className="text-sm text-foreground font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Reporting" && (
          <div className="text-sm text-muted-foreground p-8 text-center">Reporting data will appear here once campaigns are delivering.</div>
        )}
      </div>
    </div>
  );
}
