import { useState } from "react";
import { Megaphone, Search, Plus, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  { id: "1", name: "Nike Summer Push", type: "Direct", advertiser: "Nike Australia", dates: "Mar 1 – Mar 31", goal: "5,000 plays", delivered: 3100, target: 5000, revenue: "$8,400", pricingModel: "CPP", status: "Live" },
  { id: "2", name: "Coca-Cola Lobby Spots", type: "Direct", advertiser: "Coca-Cola", dates: "Mar 5 – Apr 5", goal: "SoV 15%", delivered: 1800, target: 2500, revenue: "$4,200", pricingModel: "CPP", status: "Under-delivering" },
  { id: "3", name: "Brand Awareness — Q1", type: "Owned", advertiser: "Skoop Network", dates: "Jan 1 – Mar 31", goal: "SoV 50%", delivered: 48000, target: 50000, revenue: "—", pricingModel: "—", status: "Live" },
  { id: "4", name: "Programmatic Backfill — All", type: "Programmatic", advertiser: "Multiple", dates: "Ongoing", goal: "Fill rate", delivered: 88, target: 100, revenue: "$5,100", pricingModel: "CPM", status: "Live" },
  { id: "5", name: "Samsung Galaxy Launch", type: "Direct", advertiser: "Samsung", dates: "Apr 1 – Apr 15", goal: "2,000 plays", delivered: 0, target: 2000, revenue: "$3,600", pricingModel: "Flat Fee", status: "Scheduled" },
  { id: "6", name: "Holiday Season Promo", type: "Direct", advertiser: "Myer", dates: "Dec 1 – Dec 25", goal: "10,000 plays", delivered: 10000, target: 10000, revenue: "$12,000", pricingModel: "CPP", status: "Completed" },
];

const statusFilters = ["All", "Live", "Scheduled", "Draft", "Under-delivering", "Completed", "At Risk"];

function pacingLabel(delivered: number, target: number, status: string) {
  if (status === "Scheduled") return "Not started";
  if (status === "Completed") return "Complete";
  const pct = target > 0 ? delivered / target : 0;
  if (pct >= 0.95) return "Complete";
  if (pct >= 0.6) return "On Track";
  if (pct >= 0.4) return "Behind Pace";
  return "Behind Pace";
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="skoop-card overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left" style={{ width: "20%" }}>Campaign</th>
                <th className="skoop-table-cell text-left" style={{ width: "9%" }}>Type</th>
                <th className="skoop-table-cell text-left" style={{ width: "12%" }}>Advertiser</th>
                <th className="skoop-table-cell text-left" style={{ width: "11%" }}>Dates</th>
                <th className="skoop-table-cell text-left" style={{ width: "9%" }}>Target</th>
                <th className="skoop-table-cell text-left" style={{ width: "17%" }}>Progress</th>
                <th className="skoop-table-cell text-right" style={{ width: "8%" }}>Revenue</th>
                <th className="skoop-table-cell text-left" style={{ width: "14%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pct = c.target > 0 ? Math.round((c.delivered / c.target) * 100) : 0;
                const pacing = pacingLabel(c.delivered, c.target, c.status);
                return (
                  <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td className="skoop-table-cell font-medium text-foreground truncate">{c.name}</td>
                    <td className="skoop-table-cell"><StatusChip status={c.type.toLowerCase()} /></td>
                    <td className="skoop-table-cell text-muted-foreground truncate">{c.advertiser}</td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{c.dates}</td>
                    <td className="skoop-table-cell text-xs text-muted-foreground">{c.goal}</td>
                    <td className="skoop-table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">{pct}% · {pacing}</span>
                      </div>
                    </td>
                    <td className="skoop-table-cell text-right">
                      <div className="tabular-nums text-sm">{c.revenue}</div>
                      <div className="text-[10px] text-muted-foreground">{c.pricingModel}</div>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={c.status.toLowerCase().replace(" ", "-")} label={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
