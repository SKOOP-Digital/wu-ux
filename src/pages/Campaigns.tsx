import { useState } from "react";
import { Megaphone, Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  { id: "1", name: "Pepsi Q2 Push", deliveryTarget: 5000, advertiser: "PepsiCo", dates: "Apr 1 – Jun 30", screens: 1132, venues: "Northeast, National", delivered: 3200, target: 5000, status: "Live" },
  { id: "2", name: "Nike Spring", deliveryTarget: 5000, advertiser: "Nike", dates: "Mar 1 – May 31", screens: 411, venues: "Midwest & South", delivered: 3100, target: 5000, status: "Live" },
  { id: "3", name: "WU Brand Awareness", deliveryTarget: null, advertiser: "Western Union", dates: "Jan 1 –", screens: 1189, venues: "Northeast, Southwest", delivered: 48000, target: null, status: "Live" },
  { id: "4", name: "Coca-Cola Summer", deliveryTarget: 4000, advertiser: "Coca-Cola", dates: "May 1 – Aug 31", screens: 377, venues: "West Coast", delivered: 0, target: 4000, status: "Scheduled" },
  { id: "5", name: "WU Remittance Promo", deliveryTarget: 3000, advertiser: "Western Union", dates: "Mar 1 – Mar 31", screens: 71, venues: "National", delivered: 1200, target: 3000, status: "Under-delivering" },
];

const statusFilters = ["All", "Live", "Scheduled", "Draft", "Under-delivering", "Completed"];

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
        subtitle="Create campaigns that target screens and track delivery"
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
                <th className="skoop-table-cell text-left" style={{ width: "22%" }}>Campaign</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Type</th>
                <th className="skoop-table-cell text-left" style={{ width: "14%" }}>Advertiser</th>
                <th className="skoop-table-cell text-left" style={{ width: "13%" }}>Screens</th>
                <th className="skoop-table-cell text-left" style={{ width: "11%" }}>Dates</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Target</th>
                <th className="skoop-table-cell text-left" style={{ width: "13%" }}>Progress</th>
                <th className="skoop-table-cell text-left" style={{ width: "7%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isHouseFill = c.deliveryTarget === null;
                const pct = c.target && c.target > 0 ? Math.round((c.delivered / c.target) * 100) : null;
                return (
                  <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td className="skoop-table-cell font-medium text-foreground">
                      <span className="line-clamp-2">{c.name}</span>
                    </td>
                    <td className="skoop-table-cell">
                      <StatusChip status={isHouseFill ? "house-fill" : "sold"} label={isHouseFill ? "House Fill" : "Sold"} />
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-sm">
                      <span className="line-clamp-1">{c.advertiser}</span>
                    </td>
                    <td className="skoop-table-cell">
                      <p className="text-sm font-medium tabular-nums">{c.screens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.venues}</p>
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs whitespace-nowrap">{c.dates}</td>
                    <td className="skoop-table-cell text-xs text-muted-foreground">
                      {isHouseFill ? <span className="italic">No target</span> : c.target?.toLocaleString() + " plays"}
                    </td>
                    <td className="skoop-table-cell group/progress relative">
                      {isHouseFill ? (
                        <span className="text-xs text-muted-foreground italic">Always on</span>
                      ) : (
                        <div className="relative">
                          <Progress value={pct ?? 0} className="h-1.5" />
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{pct}%</span>
                        </div>
                      )}
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
