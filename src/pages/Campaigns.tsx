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
  { id: "1", name: "Pepsi Q2 Push", type: "Direct", advertiser: "PepsiCo", dates: "Apr 1 – Jun 30", goal: "SoV 40%", delivered: 3200, target: 5000, status: "Live" },
  { id: "2", name: "Nike Spring", type: "Direct", advertiser: "Nike", dates: "Mar 1 – May 31", goal: "5,000 plays", delivered: 3100, target: 5000, status: "Live" },
  { id: "3", name: "WU Brand Awareness", type: "Owned", advertiser: "Western Union", dates: "Jan 1 – Dec 31", goal: "SoV 50%", delivered: 48000, target: 50000, status: "Live" },
  { id: "4", name: "Coca-Cola Summer", type: "Direct", advertiser: "Coca-Cola", dates: "May 1 – Aug 31", goal: "SoV 20%", delivered: 0, target: 4000, status: "Scheduled" },
  { id: "5", name: "WU Remittance Promo", type: "Direct", advertiser: "Western Union", dates: "Mar 1 – Mar 31", goal: "3,000 plays", delivered: 1200, target: 3000, status: "Under-delivering" },
];

const statusFilters = ["All", "Live", "Scheduled", "Draft", "Under-delivering", "Completed", "At Risk"];

function statusLabel(delivered: number, target: number, status: string) {
  if (status === "Scheduled") return "Scheduled";
  if (status === "Completed") return "Completed";
  if (status === "Under-delivering") return "Under-delivering";
  const pct = target > 0 ? delivered / target : 0;
  if (pct >= 0.95) return "Live · Complete";
  if (pct >= 0.6) return "Live · On Track";
  return "Live · Behind Pace";
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
                <th className="skoop-table-cell text-left" style={{ width: "22%" }}>Campaign</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Type</th>
                <th className="skoop-table-cell text-left" style={{ width: "15%" }}>Advertiser</th>
                <th className="skoop-table-cell text-left" style={{ width: "13%" }}>Dates</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Target</th>
                <th className="skoop-table-cell text-left" style={{ width: "16%" }}>Progress</th>
                <th className="skoop-table-cell text-left" style={{ width: "14%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pct = c.target > 0 ? Math.round((c.delivered / c.target) * 100) : 0;
                const fullStatus = statusLabel(c.delivered, c.target, c.status);
                return (
                  <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td className="skoop-table-cell font-medium text-foreground">
                      <span className="line-clamp-2">{c.name}</span>
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={c.type.toLowerCase()} /></td>
                    <td className="skoop-table-cell text-muted-foreground">
                      <span className="line-clamp-2">{c.advertiser}</span>
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs whitespace-nowrap">{c.dates}</td>
                    <td className="skoop-table-cell text-xs text-muted-foreground">{c.goal}</td>
                    <td className="skoop-table-cell">
                      <Progress value={pct} className="h-1.5" />
                    </td>
                    <td className="skoop-table-cell"><StatusChip status={c.status.toLowerCase().replace(" ", "-")} label={fullStatus} /></td>
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
