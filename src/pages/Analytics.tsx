import { BarChart3, Megaphone, Radio, AlertTriangle, MapPin } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import KPICard from "@/components/shared/KPICard";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const revenueData = [
  { month: "Jan", direct: 8200, programmatic: 3100 },
  { month: "Feb", direct: 9400, programmatic: 3600 },
  { month: "Mar", direct: 11200, programmatic: 4200 },
  { month: "Apr", direct: 10800, programmatic: 3900 },
  { month: "May", direct: 12600, programmatic: 4800 },
  { month: "Jun", direct: 14200, programmatic: 5100 },
];

const playsData = [
  { day: "Mon", plays: 12400 },
  { day: "Tue", plays: 13200 },
  { day: "Wed", plays: 11800 },
  { day: "Thu", plays: 14600 },
  { day: "Fri", plays: 15200 },
  { day: "Sat", plays: 9800 },
  { day: "Sun", plays: 8400 },
];

const atRiskCampaigns = [
  { name: "WU Remittance Promo", issue: "Under-delivering", delivered: "40%", target: "100%" },
  { name: "Nike Spring", issue: "Behind pace", delivered: "62%", target: "85%" },
];

const topVenues = [
  { name: "Westfield Sydney", revenue: "$4,820", fill: "94%" },
  { name: "Melbourne Central", revenue: "$3,640", fill: "88%" },
  { name: "Brisbane CBD Tower", revenue: "$2,190", fill: "82%" },
  { name: "Perth Arena Complex", revenue: "$1,540", fill: "76%" },
];

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Network performance and delivery overview"
        icon={<BarChart3 size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/campaigns/create")}>
              <Megaphone size={14} className="mr-1.5" /> Create Campaign
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/proof-of-play")}>
              Export PoP
            </Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Campaigns Live" value="3" change="2 paid · 1 in-house" changeType="positive" icon={<Megaphone size={16} />} />
          <KPICard label="Active Rules" value="24" change="+3 this month" changeType="positive" icon={<MapPin size={16} />} />
          <KPICard label="Programmatic Fill Rate" value="88.4%" change="-2.1% vs target" changeType="negative" icon={<Radio size={16} />} />
          <KPICard label="Under-delivery Alerts" value="2" change="2 campaigns at risk" changeType="negative" icon={<AlertTriangle size={16} />} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Revenue by Source</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="direct" name="Direct" fill="hsl(210,100%,50%)" radius={[3,3,0,0]} />
                <Bar dataKey="programmatic" name="Programmatic" fill="hsl(262,80%,60%)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Delivered Plays — Last 7 Days</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={playsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="plays" name="Plays" stroke="hsl(174,100%,33%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational widgets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="skoop-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="skoop-section-header">Campaigns at Risk</p>
              <StatusChip status="at-risk" label={`${atRiskCampaigns.length} active`} />
            </div>
            <div className="space-y-3">
              {atRiskCampaigns.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md border border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => navigate("/campaigns")}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.issue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm tabular-nums text-foreground">{c.delivered}</p>
                    <p className="text-xs text-muted-foreground">Target: {c.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Top Venues by Revenue</p>
            <div className="space-y-3">
              {topVenues.map((v, i) => (
                <div key={v.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-4">{i + 1}</span>
                    <p className="text-sm text-foreground">{v.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums text-foreground">{v.revenue}</p>
                    <p className="text-xs text-muted-foreground">Fill: {v.fill}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
