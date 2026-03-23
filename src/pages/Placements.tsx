import { useState, useMemo } from "react";
import { MapPin, Search, Plus, LayoutGrid, List, Trash2, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allPlacements, calcCapacityFromRule } from "@/data/placements";
import { toast } from "@/hooks/use-toast";

const filters = ["All", "Healthy", "Overbooked", "At Risk", "Loop", "Ad-break"];

const statusTooltips: Record<string, string> = {
  Healthy: "Capacity within safe range",
  "At Risk": "Pacing or capacity issue emerging",
  Overbooked: "Booked demand exceeds eligible capacity",
};

export default function Placements() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [placements, setPlacements] = useState(allPlacements);

  const enriched = useMemo(() => placements.map((p) => {
    const cap = calcCapacityFromRule(p);
    return {
      ...p,
      capacitySlots: cap,
      capacityPct: p.capacityUsagePct,
    };
  }), [placements]);

  const deleteRule = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = allPlacements.findIndex(p => p.id === id);
    if (idx !== -1) allPlacements.splice(idx, 1);
    setPlacements([...allPlacements]);
    toast({ title: "Rule deleted", description: `"${name}" has been removed.` });
  };

  const filtered = enriched.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "All") return true;
    return p.status === activeFilter || p.model === activeFilter.replace("-", "-");
  });

  return (
    <div>
      <PageHeader
        title="Network Rules"
        subtitle="Control how ads run across your screen network"
        icon={<MapPin size={20} />}
        actions={
          <Button size="sm" onClick={() => navigate("/placements/new")}>
            <Plus size={14} className="mr-1" /> New Rule
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search network rules…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 h-9 text-sm" />
            </div>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {filters.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <th className="skoop-table-cell text-left">Network Rule</th>
                  <th className="skoop-table-cell text-left">Screens</th>
                  <th className="skoop-table-cell text-left">Model</th>
                  <th className="skoop-table-cell text-left w-40">Content Split</th>
                  <th className="skoop-table-cell text-left">Active Hours</th>
                  <th className="skoop-table-cell text-right">Capacity Usage</th>
                  <th className="skoop-table-cell text-left">Status</th>
                  <th className="skoop-table-cell text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/placements/${p.id}`)}>
                    <td className="skoop-table-cell">
                      <div className="leading-tight">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-[11px] block text-muted-foreground">{p.venueType}</span>
                      </div>
                    </td>
                    <td className="skoop-table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Monitor size={13} className="shrink-0" />
                        <div className="leading-tight">
                          <span className="text-sm">{p.screenCount.toLocaleString()} screens</span>
                          <span className="text-xs block text-muted-foreground">{p.region}</span>
                        </div>
                      </div>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={p.model.toLowerCase()} label={p.model} /></td>
                    <td className="skoop-table-cell">
                      <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showHoverTooltip />
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{p.dayparts}</td>
                    <td className="skoop-table-cell text-right">
                      <div className="text-sm tabular-nums font-medium">{p.capacityPct}%</div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {p.capacitySlots.booked.toLocaleString()} / {p.capacitySlots.total.toLocaleString()} plays/day
                      </div>
                    </td>
                    <td className="skoop-table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} /></span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{statusTooltips[p.status] || p.status}</p></TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="skoop-table-cell text-center">
                      <button
                        onClick={(e) => deleteRule(p.id, p.name, e)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="skoop-card p-5 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate(`/placements/${p.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} />
                  <StatusChip status={p.model.toLowerCase()} label={p.model} />
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">{p.name}</h3>
                <span className="text-[11px] text-muted-foreground block mb-1">{p.venueType}</span>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                  <Monitor size={12} />
                  <span className="text-xs">{p.screenCount.toLocaleString()} screens · {p.region}</span>
                </div>
                <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showLabels />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">{p.capacitySlots.booked.toLocaleString()} / {p.capacitySlots.total.toLocaleString()} plays/day</span>
                  <span className="tabular-nums font-medium">{p.capacityPct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
