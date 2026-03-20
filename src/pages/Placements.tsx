import { useState } from "react";
import { MapPin, Search, Plus, LayoutGrid, List, MoreHorizontal, Monitor, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const placements = [
  { id: "1", name: "Lobby Screens — Main Loop", scope: "Venue", venue: "Westfield Sydney", model: "Loop", owned: 50, direct: 30, prog: 20, dayparts: "All Day", capacity: "82%", capacitySlots: { total: 3600, booked: 2952, available: 648 }, status: "Healthy", screens: 6 },
  { id: "2", name: "Food Court Digital Menu Boards", scope: "Group", venue: "Melbourne Central", model: "Ad-break", owned: 40, direct: 40, prog: 20, dayparts: "11am–9pm", capacity: "94%", capacitySlots: { total: 2400, booked: 2256, available: 144 }, status: "Overbooked", screens: 4 },
  { id: "3", name: "Elevator Portrait Panels", scope: "Screen", venue: "Brisbane CBD Tower", model: "Loop", owned: 60, direct: 25, prog: 15, dayparts: "7am–7pm", capacity: "58%", capacitySlots: { total: 4800, booked: 2784, available: 2016 }, status: "Healthy", screens: 12 },
  { id: "4", name: "Parking Entry Totems", scope: "Group", venue: "Perth Arena", model: "Ad-break", owned: 70, direct: 20, prog: 10, dayparts: "6am–11pm", capacity: "45%", capacitySlots: { total: 1800, booked: 810, available: 990 }, status: "Healthy", screens: 3 },
  { id: "5", name: "Concourse Video Wall", scope: "Screen", venue: "Westfield Sydney", model: "Loop", owned: 30, direct: 50, prog: 20, dayparts: "9am–9pm", capacity: "98%", capacitySlots: { total: 1200, booked: 1176, available: 24 }, status: "At Risk", screens: 1 },
];

const filters = ["All", "Healthy", "Overbooked", "At Risk", "Loop", "Ad-break"];

export default function Placements() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [drawer, setDrawer] = useState<typeof placements[0] | null>(null);

  const filtered = placements.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "All") return true;
    return p.status === activeFilter || p.model === activeFilter.replace("-", "-");
  });

  return (
    <div>
      <PageHeader
        title="Ad Placements"
        subtitle="Define monetisable playback capacity on your screens"
        icon={<MapPin size={20} />}
        actions={
          <Button size="sm" onClick={() => navigate("/placements/1")}>
            <Plus size={14} className="mr-1" /> New Ad Placement
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {/* Inline explanation */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Ad Placements</span> define how ads run on selected screens. Each placement maps to one or more screens and controls the playback mix between <span className="font-medium">Owned</span> (your content), <span className="font-medium">Direct</span> (booked campaigns), and <span className="font-medium">Programmatic</span> (automated ads).
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search ad placements…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 h-9 text-sm" />
            </div>
            <div className="flex gap-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 border border-border rounded-md p-0.5">
            <button onClick={() => setView("card")} className={`p-1.5 rounded ${view === "card" ? "bg-secondary" : ""}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setView("table")} className={`p-1.5 rounded ${view === "table" ? "bg-secondary" : ""}`}><List size={14} /></button>
          </div>
        </div>

        {view === "table" ? (
          <div className="skoop-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="skoop-table-header">
                  <th className="skoop-table-cell text-left">Ad Placement</th>
                  <th className="skoop-table-cell text-left">Screens</th>
                  <th className="skoop-table-cell text-left">Model</th>
                  <th className="skoop-table-cell text-left w-40">Playback Mix</th>
                  <th className="skoop-table-cell text-left">Dayparts</th>
                  <th className="skoop-table-cell text-right">Capacity Usage</th>
                  <th className="skoop-table-cell text-left">Status</th>
                  <th className="skoop-table-cell text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(p)}>
                    <td className="skoop-table-cell font-medium text-foreground">{p.name}</td>
                    <td className="skoop-table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Monitor size={13} className="shrink-0" />
                        <span className="text-sm">{p.screens} Screens</span>
                        <span className="text-xs">·</span>
                        <span className="text-xs">{p.venue}</span>
                      </div>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={p.model.toLowerCase()} label={p.model} /></td>
                    <td className="skoop-table-cell"><MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} /></td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{p.dayparts}</td>
                    <td className="skoop-table-cell text-right tabular-nums">{p.capacity}</td>
                    <td className="skoop-table-cell"><StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} /></td>
                    <td className="skoop-table-cell text-center"><MoreHorizontal size={14} className="text-muted-foreground" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="skoop-card p-5 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setDrawer(p)}>
                <div className="flex items-center justify-between mb-2">
                  <StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} />
                  <StatusChip status={p.model.toLowerCase()} label={p.model} />
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                  <Monitor size={12} />
                  <span className="text-xs">{p.screens} Screens · {p.venue}</span>
                </div>
                <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showLabels />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>{p.capacitySlots.booked.toLocaleString()} / {p.capacitySlots.total.toLocaleString()} slots</span>
                  <span className="tabular-nums">Capacity: {p.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Ad Placement Details">
        {drawer && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">{drawer.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Defines how ads run on selected screens</p>
            </div>

            {/* Screens section */}
            <div className="space-y-2">
              <p className="skoop-section-header">Active Screens</p>
              <div className="flex items-center gap-2 bg-secondary/60 rounded-md px-3 py-2">
                <Monitor size={14} className="text-primary" />
                <span className="text-sm font-medium">{drawer.screens} Screens</span>
                <span className="text-xs text-muted-foreground">· {drawer.venue}</span>
                <button className="ml-auto text-xs text-primary flex items-center gap-1 hover:underline">
                  View Screens <ExternalLink size={10} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="skoop-section-header">Status</p>
              <StatusChip status={drawer.status.toLowerCase().replace(" ", "-")} label={drawer.status} />
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Playback Mix</p>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Owned:</span> Your content &nbsp;·&nbsp;
                <span className="font-medium text-foreground">Direct:</span> Booked campaigns &nbsp;·&nbsp;
                <span className="font-medium text-foreground">Programmatic:</span> Automated ads
              </p>
              <MixBar owned={drawer.owned} direct={drawer.direct} programmatic={drawer.prog} height="h-3" showLabels />
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Capacity Usage</p>
              <p className="text-[11px] text-muted-foreground mb-2">Total available ad slots based on loop duration</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold tabular-nums">{drawer.capacitySlots.total.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">slots/day</p>
                </div>
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Booked</p>
                  <p className="text-sm font-semibold tabular-nums">{drawer.capacitySlots.booked.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">slots/day</p>
                </div>
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Available</p>
                  <p className="text-sm font-semibold tabular-nums text-primary">{drawer.capacitySlots.available.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">slots/day</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{drawer.model}</p></div>
              <div><p className="text-xs text-muted-foreground">Dayparts</p><p className="text-sm font-medium">{drawer.dayparts}</p></div>
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Active Campaigns</p>
              <div className="text-sm text-muted-foreground">3 campaigns assigned</div>
            </div>
            <div className="border-t border-border pt-4">
              <Button size="sm" className="w-full" onClick={() => { setDrawer(null); navigate(`/placements/${drawer.id}`); }}>View Full Details</Button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
