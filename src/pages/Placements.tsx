import { useState } from "react";
import { MapPin, Search, Plus, LayoutGrid, List, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const placements = [
  { id: "1", name: "Lobby Screens — Main Loop", scope: "Venue", venue: "Westfield Sydney", model: "Loop", owned: 50, direct: 30, prog: 20, dayparts: "All Day", capacity: "82%", status: "Healthy", screens: 6 },
  { id: "2", name: "Food Court Digital Menu Boards", scope: "Group", venue: "Melbourne Central", model: "Ad-break", owned: 40, direct: 40, prog: 20, dayparts: "11am–9pm", capacity: "94%", status: "Overbooked" ,screens: 4 },
  { id: "3", name: "Elevator Portrait Panels", scope: "Screen", venue: "Brisbane CBD Tower", model: "Loop", owned: 60, direct: 25, prog: 15, dayparts: "7am–7pm", capacity: "58%", status: "Healthy", screens: 12 },
  { id: "4", name: "Parking Entry Totems", scope: "Group", venue: "Perth Arena", model: "Ad-break", owned: 70, direct: 20, prog: 10, dayparts: "6am–11pm", capacity: "45%", status: "Healthy", screens: 3 },
  { id: "5", name: "Concourse Video Wall", scope: "Screen", venue: "Westfield Sydney", model: "Loop", owned: 30, direct: 50, prog: 20, dayparts: "9am–9pm", capacity: "98%", status: "At Risk", screens: 1 },
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
        title="Placements"
        subtitle="Manage your signage inventory and playback mix"
        icon={<MapPin size={20} />}
        actions={
          <Button size="sm" onClick={() => navigate("/placements/1")}>
            <Plus size={14} className="mr-1" /> New Placement
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search placements…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 h-9 text-sm" />
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
                  <th className="skoop-table-cell text-left">Placement Name</th>
                  <th className="skoop-table-cell text-left">Scope</th>
                  <th className="skoop-table-cell text-left">Model</th>
                  <th className="skoop-table-cell text-left w-40">Allocation Mix</th>
                  <th className="skoop-table-cell text-left">Dayparts</th>
                  <th className="skoop-table-cell text-right">Capacity</th>
                  <th className="skoop-table-cell text-left">Status</th>
                  <th className="skoop-table-cell text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(p)}>
                    <td className="skoop-table-cell font-medium text-foreground">{p.name}</td>
                    <td className="skoop-table-cell text-muted-foreground">{p.scope} · {p.venue}</td>
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
                <p className="text-xs text-muted-foreground mb-3">{p.scope} · {p.venue}</p>
                <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showLabels />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>{p.screens} screens</span>
                  <span className="tabular-nums">Capacity: {p.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Placement Details">
        {drawer && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">{drawer.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{drawer.scope} · {drawer.venue}</p>
            </div>
            <div className="space-y-1">
              <p className="skoop-section-header">Status</p>
              <StatusChip status={drawer.status.toLowerCase().replace(" ", "-")} label={drawer.status} />
            </div>
            <div className="space-y-2">
              <p className="skoop-section-header">Playback Mix</p>
              <MixBar owned={drawer.owned} direct={drawer.direct} programmatic={drawer.prog} height="h-3" showLabels />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{drawer.model}</p></div>
              <div><p className="text-xs text-muted-foreground">Capacity</p><p className="text-sm font-medium tabular-nums">{drawer.capacity}</p></div>
              <div><p className="text-xs text-muted-foreground">Dayparts</p><p className="text-sm font-medium">{drawer.dayparts}</p></div>
              <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium">{drawer.screens}</p></div>
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
