import { useState } from "react";
import { Megaphone, Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  isPaid: boolean;
  campaignType: "standard" | "programmatic";
  sspPartner: string;
  screens: number;
  dates: string;
  hasTarget: boolean;
  deliveryGoalType: "sov" | "total" | "plays-per-day" | null;
  goalValue: string;
  fillEnabled: boolean;
  delivered: number;
  target: number;
  status: string;
}

const campaigns: Campaign[] = [
  { id: "1", name: "Pepsi Q2 Push",       advertiser: "PepsiCo",       isPaid: true,  campaignType: "standard",     sspPartner: "",            screens: 84,  dates: "Apr 1 – Jun 30", hasTarget: true,  deliveryGoalType: "sov",           goalValue: "40%",     fillEnabled: false, delivered: 3200,  target: 5000,  status: "Live" },
  { id: "2", name: "Nike Spring",          advertiser: "Nike",          isPaid: true,  campaignType: "standard",     sspPartner: "",            screens: 37,  dates: "Mar 1 – May 31", hasTarget: true,  deliveryGoalType: "total",         goalValue: "5,000",   fillEnabled: true,  delivered: 3100,  target: 5000,  status: "Live" },
  { id: "3", name: "WU Brand Awareness",   advertiser: "",              isPaid: false, campaignType: "standard",     sspPartner: "",            screens: 142, dates: "Jan 1 – Dec 31", hasTarget: false, deliveryGoalType: null,            goalValue: "",        fillEnabled: true,  delivered: 48000, target: 0,     status: "Live" },
  { id: "4", name: "Coca-Cola Summer",     advertiser: "Coca-Cola",     isPaid: true,  campaignType: "standard",     sspPartner: "",            screens: 61,  dates: "May 1 – Aug 31", hasTarget: true,  deliveryGoalType: "sov",           goalValue: "20%",     fillEnabled: false, delivered: 0,     target: 4000,  status: "Scheduled" },
  { id: "5", name: "WU Remittance Promo",  advertiser: "Western Union", isPaid: true,  campaignType: "standard",     sspPartner: "",            screens: 29,  dates: "Mar 1 – Mar 31", hasTarget: true,  deliveryGoalType: "total",         goalValue: "3,000",   fillEnabled: true,  delivered: 1200,  target: 3000,  status: "Under-delivering" },
  { id: "6", name: "WU In-store Screens",  advertiser: "",              isPaid: false, campaignType: "standard",     sspPartner: "",            screens: 24,  dates: "Jan 1 – Dec 31", hasTarget: true,  deliveryGoalType: "plays-per-day", goalValue: "200/day", fillEnabled: true,  delivered: 8200,  target: 12000, status: "Live" },
  { id: "7", name: "Screenverse",          advertiser: "",              isPaid: false, campaignType: "programmatic", sspPartner: "Screenverse", screens: 69,  dates: "Jan 1 – Dec 31", hasTarget: true,  deliveryGoalType: "sov",           goalValue: "15%",     fillEnabled: true,  delivered: 21400, target: 30000, status: "Live" },
  { id: "8", name: "Xandr DSP",            advertiser: "",              isPaid: false, campaignType: "programmatic", sspPartner: "Xandr",       screens: 41,  dates: "Jun 1 – Aug 31", hasTarget: true,  deliveryGoalType: "sov",           goalValue: "10%",     fillEnabled: true,  delivered: 4800,  target: 18000, status: "Live" },
];

function deliveryLabel(c: Campaign): string {
  if (!c.hasTarget) return "Fill only";
  if (c.deliveryGoalType === "sov") return `SOV ${c.goalValue}`;
  if (c.deliveryGoalType === "plays-per-day") return `${c.goalValue}`;
  return `${c.goalValue} plays`;
}

const statusFilters = ["All", "Live", "Scheduled", "Draft", "Under-delivering", "Completed", "At Risk"];

function statusLabel(delivered: number, target: number, status: string) {
  if (status === "Scheduled") return "Scheduled";
  if (status === "Completed") return "Completed";
  if (status === "Under-delivering") return "Under-delivering";
  const pct = target > 0 ? delivered / target : 1;
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
                <th className="skoop-table-cell text-left" style={{ width: "18%" }}>Campaign</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Advertiser</th>
                <th className="skoop-table-cell text-left" style={{ width: "10%" }}>Dates</th>
                <th className="skoop-table-cell text-left" style={{ width: "6%" }}>Screens</th>
                <th className="skoop-table-cell text-left" style={{ width: "12%" }}>Target</th>
                <th className="skoop-table-cell text-left" style={{ width: "6%" }}>Fill</th>
                <th className="skoop-table-cell text-left" style={{ width: "8%" }}>Type</th>
                <th className="skoop-table-cell text-left" style={{ width: "12%" }}>Progress</th>
                <th className="skoop-table-cell text-left" style={{ width: "18%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pct = c.target > 0 ? Math.round((c.delivered / c.target) * 100) : 100;
                const fullStatus = statusLabel(c.delivered, c.target, c.status);
                const label = deliveryLabel(c);
                return (
                  <tr key={c.id} className="skoop-table-row cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td className="skoop-table-cell font-medium text-foreground">
                      <span className="line-clamp-1">{c.name}</span>
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">
                      {c.advertiser || <span className="italic text-muted-foreground/50">In-house</span>}
                    </td>
                    <td className="skoop-table-cell text-muted-foreground text-xs whitespace-nowrap">{c.dates}</td>
                    <td className="skoop-table-cell text-xs font-medium text-foreground tabular-nums">{c.screens.toLocaleString()}</td>
                    <td className="skoop-table-cell text-xs font-medium text-foreground">{label}</td>
                    <td className="skoop-table-cell">
                      <span className={`text-xs font-medium ${c.fillEnabled ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {c.fillEnabled ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="skoop-table-cell">
                      {c.campaignType === "programmatic" ? (
                        <div>
                          <span className="text-xs font-medium text-primary">Programmatic</span>
                          {c.sspPartner && <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[90px]">{c.sspPartner}</p>}
                        </div>
                      ) : c.isPaid ? (
                        <span className="text-xs font-medium text-foreground">Paid</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="skoop-table-cell group/progress relative">
                      {c.hasTarget && (
                        <div className="relative mb-1">
                          <Progress value={pct} className="h-1.5" />
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{pct}%</span>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {c.delivered.toLocaleString()}{c.hasTarget ? ` / ${c.target.toLocaleString()}` : " plays"}
                      </p>
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
