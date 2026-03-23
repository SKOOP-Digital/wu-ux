import { useState, useMemo } from "react";
import { MapPin, Search, Plus, LayoutGrid, List, MoreHorizontal, Monitor, ExternalLink, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allPlacements, calcCapacity } from "@/data/placements";
import { allScreens } from "@/data/screens";

const filters = ["All", "Healthy", "Overbooked", "At Risk", "Draft", "Loop", "Ad-break"];

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

  const enriched = useMemo(() => allPlacements.map((p) => {
    const cap = calcCapacity(p.screenIds, allScreens);
    const screens = allScreens.filter((s) => p.screenIds.includes(s.id));
    const venues = [...new Set(screens.map((s) => s.venue))];
    const utilPct = cap.total > 0 ? Math.round((cap.booked / cap.total) * 100) : 0;
    return {
      ...p,
      screens: screens.length,
      venueLabel: venues.join(", "),
      capacitySlots: cap,
      capacityPct: utilPct,
      capacityDisplay: `${utilPct}% · ${cap.booked.toLocaleString()} / ${cap.total.toLocaleString()}`,
    };
  }), []);

  const [drawer, setDrawer] = useState<(typeof enriched)[0] | null>(null);

  const filtered = enriched.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "All") return true;
    return p.status === activeFilter || p.model === activeFilter.replace("-", "-");
  });

  return (
    <div>
      <PageHeader
        title="Network Rules"
        subtitle="Define monetisable playback capacity on your screens"
        icon={<MapPin size={20} />}
        actions={
          <Button size="sm" onClick={() => navigate("/placements/new")}>
            <Plus size={14} className="mr-1" /> New Rule
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Network Rules</span> define how ads run on selected screens. Each rule maps to one or more screens and controls the content split between <span className="font-medium">Owned</span> (your content), <span className="font-medium">Direct</span> (booked campaigns), and <span className="font-medium">Programmatic</span> (automated ads).
          </p>
        </div>

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
                  <tr key={p.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(p)}>
                    <td className="skoop-table-cell font-medium text-foreground">{p.name}</td>
                    <td className="skoop-table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Monitor size={13} className="shrink-0" />
                        <div className="leading-tight">
                          <span className="text-sm">{p.screens} screen{p.screens !== 1 ? "s" : ""}</span>
                          <span className="text-xs block text-muted-foreground">{p.venueLabel}</span>
                        </div>
                      </div>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={p.model.toLowerCase()} label={p.model} /></td>
                    <td className="skoop-table-cell"><MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} /></td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{p.dayparts}</td>
                    <td className="skoop-table-cell text-right">
                      <div className="text-sm tabular-nums font-medium">{p.capacityPct}%</div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">{p.capacitySlots.booked.toLocaleString()} / {p.capacitySlots.total.toLocaleString()}</div>
                    </td>
                    <td className="skoop-table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} /></span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{statusTooltips[p.status] || p.status}</p></TooltipContent>
                      </Tooltip>
                    </td>
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
                  <span className="text-xs">{p.screens} screen{p.screens !== 1 ? "s" : ""} · {p.venueLabel}</span>
                </div>
                <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} showLabels />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">{p.capacitySlots.booked.toLocaleString()} / {p.capacitySlots.total.toLocaleString()} opp</span>
                  <span className="tabular-nums font-medium">{p.capacityPct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Network Rule Details">
        {drawer && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">{drawer.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Defines how ads run on selected screens</p>
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Screens in this Rule</p>
              <p className="text-[11px] text-muted-foreground">These screens will display campaigns assigned to this rule</p>
              <div className="flex items-center gap-2 bg-secondary/60 rounded-md px-3 py-2">
                <Monitor size={14} className="text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{drawer.screens} screen{drawer.screens !== 1 ? "s" : ""}</span>
                  <span className="text-xs text-muted-foreground ml-1">· {drawer.venueLabel}</span>
                </div>
                <button
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                  onClick={() => { setDrawer(null); navigate(`/placements/${drawer.id}`); }}
                >
                  View Screens <ExternalLink size={10} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="skoop-section-header">Status</p>
              <StatusChip status={drawer.status.toLowerCase().replace(" ", "-")} label={drawer.status} />
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Content Split</p>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Owned:</span> Your content &nbsp;·&nbsp;
                <span className="font-medium text-foreground">Direct:</span> Booked campaigns &nbsp;·&nbsp;
                <span className="font-medium text-foreground">Programmatic:</span> Automated ads
              </p>
              <MixBar owned={drawer.owned} direct={drawer.direct} programmatic={drawer.prog} height="h-3" showLabels />
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">Capacity Usage</p>
              <p className="text-[11px] text-muted-foreground mb-2">Eligible playback opportunities based on loop duration</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold tabular-nums">{drawer.capacitySlots.total.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">opp/day</p>
                </div>
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Booked</p>
                  <p className="text-sm font-semibold tabular-nums">{drawer.capacitySlots.booked.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">opp/day</p>
                </div>
                <div className="bg-secondary/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Available</p>
                  <p className="text-sm font-semibold tabular-nums text-primary">{drawer.capacitySlots.available.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">opp/day</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{drawer.model}</p></div>
              <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{drawer.dayparts}</p></div>
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
