import { useState } from "react";
import { Megaphone, Search, Plus, MoreHorizontal, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const campaigns = [
  { id: "1", name: "Nike Summer Push", type: "Direct", advertiser: "Nike Australia", dates: "Mar 1 – Mar 31", dayparts: "All Day", goal: "5,000 plays", delivered: 3100, target: 5000, revenue: "$8,400", pricingModel: "CPP", status: "Live", placements: ["Lobby Screens — Main Loop", "Concourse Video Wall"], placementCount: 2 },
  { id: "2", name: "Coca-Cola Lobby Spots", type: "Direct", advertiser: "Coca-Cola", dates: "Mar 5 – Apr 5", dayparts: "11am–9pm", goal: "SoV 15%", delivered: 1800, target: 2500, revenue: "$4,200", pricingModel: "CPP", status: "Under-delivering", placements: ["Food Court Digital Menu Boards"], placementCount: 1 },
  { id: "3", name: "Brand Awareness — Q1", type: "Owned", advertiser: "Skoop Network", dates: "Jan 1 – Mar 31", dayparts: "All Day", goal: "SoV 50%", delivered: 48000, target: 50000, revenue: "—", pricingModel: "—", status: "Live", placements: ["All Placements"], placementCount: 5 },
  { id: "4", name: "Programmatic Backfill — All", type: "Programmatic", advertiser: "Multiple", dates: "Ongoing", dayparts: "All Day", goal: "Fill rate", delivered: 88, target: 100, revenue: "$5,100", pricingModel: "CPM", status: "Live", placements: ["All Placements"], placementCount: 5 },
  { id: "5", name: "Samsung Galaxy Launch", type: "Direct", advertiser: "Samsung", dates: "Apr 1 – Apr 15", dayparts: "Morning, Afternoon", goal: "2,000 plays", delivered: 0, target: 2000, revenue: "$3,600", pricingModel: "Flat Fee", status: "Scheduled", placements: ["Elevator Portrait Panels"], placementCount: 1 },
  { id: "6", name: "Holiday Season Promo", type: "Direct", advertiser: "Myer", dates: "Dec 1 – Dec 25", dayparts: "All Day", goal: "10,000 plays", delivered: 10000, target: 10000, revenue: "$12,000", pricingModel: "CPP", status: "Completed", placements: ["Lobby Screens — Main Loop", "Food Court Digital Menu Boards"], placementCount: 2 },
];

const statusFilters = ["All", "Live", "Scheduled", "Draft", "Under-delivering", "Completed", "At Risk"];

function pacingLabel(delivered: number, target: number, status: string) {
  if (status === "Scheduled") return "Not started";
  if (status === "Completed") return "Complete";
  const pct = target > 0 ? delivered / target : 0;
  // Rough pacing logic — if >60% delivered with pct above 0.7 of expected, on track
  if (pct >= 0.95) return "Complete";
  if (pct >= 0.6) return "On Track";
  if (pct >= 0.4) return "Behind Pace";
  return "Behind Pace";
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [drawer, setDrawer] = useState<typeof campaigns[0] | null>(null);

  const filtered = campaigns.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "All") return true;
    return c.status === filter;
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Define what content runs and how it is delivered"
        icon={<Megaphone size={20} />}
        actions={<Button size="sm" onClick={() => navigate("/campaigns/create")}><Plus size={14} className="mr-1" /> Create Campaign</Button>}
      />
      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search campaigns…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 h-9 text-sm" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {statusFilters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Campaign</th>
                <th className="skoop-table-cell text-left">Type</th>
                <th className="skoop-table-cell text-left">Advertiser</th>
                <th className="skoop-table-cell text-left">Ad Placements</th>
                <th className="skoop-table-cell text-left">Dates</th>
                <th className="skoop-table-cell text-left">Delivery Target</th>
                <th className="skoop-table-cell text-left w-36">Delivery Progress</th>
                <th className="skoop-table-cell text-right">Revenue</th>
                <th className="skoop-table-cell text-left">Status</th>
                <th className="skoop-table-cell w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pct = c.target > 0 ? Math.round((c.delivered / c.target) * 100) : 0;
                const pacing = pacingLabel(c.delivered, c.target, c.status);
                return (
                  <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(c)}>
                    <td className="skoop-table-cell font-medium text-foreground">{c.name}</td>
                    <td className="skoop-table-cell"><StatusChip status={c.type.toLowerCase()} /></td>
                    <td className="skoop-table-cell text-muted-foreground">{c.advertiser}</td>
                    <td className="skoop-table-cell">
                      {c.placementCount > 1 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                              <MapPin size={12} className="shrink-0" />
                              <span className="text-xs">{c.placementCount} placements</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2" align="start">
                            <p className="text-xs font-medium text-foreground mb-1">This campaign runs on:</p>
                            {c.placements.map((p) => (
                              <div key={p} className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground">
                                <MapPin size={10} className="text-primary shrink-0" /> {p}
                              </div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin size={12} className="shrink-0" />
                          <span className="text-xs">{c.placements[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{c.dates}</td>
                    <td className="skoop-table-cell text-xs text-muted-foreground">{c.goal}</td>
                    <td className="skoop-table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs tabular-nums text-muted-foreground w-20">{pct}% · {pacing}</span>
                      </div>
                    </td>
                    <td className="skoop-table-cell text-right">
                      <div className="tabular-nums text-sm">{c.revenue}</div>
                      <div className="text-[10px] text-muted-foreground">{c.pricingModel}</div>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={c.status.toLowerCase().replace(" ", "-")} label={c.status} /></td>
                    <td className="skoop-table-cell text-center"><MoreHorizontal size={14} className="text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Campaign Details">
        {drawer && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-foreground">{drawer.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Defines what content runs and how it is delivered</p>
              <div className="flex gap-2 mt-2"><StatusChip status={drawer.type.toLowerCase()} /><StatusChip status={drawer.status.toLowerCase().replace(" ", "-")} label={drawer.status} /></div>
            </div>

            <div className="space-y-2">
              <p className="skoop-section-header">This campaign runs on</p>
              <p className="text-[11px] text-muted-foreground">Ad placements that provide inventory for this campaign</p>
              <div className="space-y-1.5">
                {drawer.placements.map((p) => (
                  <div key={p} className="flex items-center gap-2 bg-secondary/60 rounded-md px-3 py-2">
                    <MapPin size={13} className="text-primary shrink-0" />
                    <span className="text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{drawer.advertiser}</p></div>
              <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-sm font-medium tabular-nums">{drawer.revenue}</p></div>
              <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">{drawer.dates}</p></div>
              <div><p className="text-xs text-muted-foreground">Dayparts</p><p className="text-sm font-medium">{drawer.dayparts}</p></div>
              <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium">{drawer.goal}</p></div>
              <div><p className="text-xs text-muted-foreground">Delivery Progress</p><p className="text-sm font-medium tabular-nums">{drawer.delivered.toLocaleString()} / {drawer.target.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Pricing Model</p><p className="text-sm font-medium">{drawer.pricingModel}</p></div>
            </div>

            <div className="border-t border-border pt-4">
              <Button size="sm" className="w-full" onClick={() => { setDrawer(null); navigate(`/campaigns/${drawer.id}`); }}>View Full Details</Button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
