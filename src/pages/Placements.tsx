import { useState, useMemo } from "react";
import { MapPin, Search, Plus, LayoutGrid, List, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allPlacements, calcCapacityFromRule } from "@/data/placements";

const filters = ["All", "Healthy", "Overbooked", "At Risk", "Continuous", "Ad Breaks"];

const statusTooltips: Record<string, string> = {
  Healthy: "Capacity within safe range",
  "At Risk": "Pacing or capacity issue emerging",
  Overbooked: "Booked demand exceeds eligible capacity",
};

function modelLabel(model: string) {
  if (model === "Loop") return "Continuous";
  if (model === "Ad-break") return "Ad Breaks";
  return model;
}

export default function Placements() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [placements] = useState(allPlacements);

  const enriched = useMemo(() => placements.map((p) => {
    const cap = calcCapacityFromRule(p);
    return { ...p, capacitySlots: cap, capacityPct: p.capacityUsagePct };
  }), [placements]);

  const filtered = enriched.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "Continuous") return p.model === "Loop";
    if (activeFilter === "Ad Breaks") return p.model === "Ad-break";
    return p.status === activeFilter;
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
            <table className="w-full table-fixed">
              <thead>
                <tr className="skoop-table-header">
                  <th className="skoop-table-cell text-left" style={{ width: "24%" }}>Network Rule</th>
                  <th className="skoop-table-cell text-left" style={{ width: "15%" }}>Screens</th>
                  <th className="skoop-table-cell text-left" style={{ width: "11%" }}>How Ads Play</th>
                  <th className="skoop-table-cell text-left" style={{ width: "18%" }}>Content Split</th>
                  <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Active Hours</th>
                  <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Capacity</th>
                  <th className="skoop-table-cell text-left" style={{ width: "12%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/placements/${p.id}`)}>
                    <td className="skoop-table-cell font-medium text-foreground">
                      <span className="line-clamp-2">{p.name}</span>
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">
                      {p.screenCount.toLocaleString()} screens · {p.venue}
                    </td>
                    <td className="skoop-table-cell">
                      <StatusChip status={p.model.toLowerCase()} label={modelLabel(p.model)} />
                    </td>
                    <td className="skoop-table-cell">
                      <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showHoverTooltip />
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{p.dayparts}</td>
                    <td className="skoop-table-cell text-sm tabular-nums font-medium">{p.capacityPct}%</td>
                    <td className="skoop-table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} /></span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{statusTooltips[p.status] || p.status}</p></TooltipContent>
                      </Tooltip>
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
                  <StatusChip status={p.model.toLowerCase()} label={modelLabel(p.model)} />
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                  <Monitor size={12} />
                  <span className="text-xs">{p.screenCount.toLocaleString()} screens · {p.region}</span>
                </div>
                <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showLabels />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">{p.capacityPct}% capacity</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
