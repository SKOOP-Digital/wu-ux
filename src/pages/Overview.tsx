import { LayoutDashboard, Plus, MapPin, Megaphone, Radio, Download, AlertTriangle, TrendingUp, DollarSign, Monitor, Play, ArrowRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import KPICard from "@/components/shared/KPICard";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const revenueData = [
  { month: "Jan", direct: 8200, programmatic: 3100, owned: 0 },
  { month: "Feb", direct: 9400, programmatic: 3600, owned: 0 },
  { month: "Mar", direct: 11200, programmatic: 4200, owned: 0 },
  { month: "Apr", direct: 10800, programmatic: 3900, owned: 0 },
  { month: "May", direct: 12600, programmatic: 4800, owned: 0 },
  { month: "Jun", direct: 14200, programmatic: 5100, owned: 0 },
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
  { name: "Nike Summer Push", issue: "Under-delivering", delivered: "62%", target: "85%" },
  { name: "Coca-Cola Lobby Spots", issue: "Low fill rate", delivered: "71%", target: "90%" },
];

const topVenues = [
  { name: "Westfield Sydney", revenue: "$4,820", fill: "94%" },
  { name: "Melbourne Central", revenue: "$3,640", fill: "88%" },
  { name: "Brisbane CBD Tower", revenue: "$2,190", fill: "82%" },
  { name: "Perth Arena Complex", revenue: "$1,540", fill: "76%" },
];

const flowSteps = [
  { icon: Monitor, label: "Screens", desc: "Physical devices", to: "/screens", color: "bg-muted text-foreground" },
  { icon: MapPin, label: "Network Rules", desc: "Rules & inventory", to: "/placements", color: "bg-primary/10 text-primary" },
  { icon: Megaphone, label: "Campaigns", desc: "Content & delivery", to: "/campaigns", color: "bg-skoop-blue/10 text-skoop-blue" },
  { icon: Play, label: "Playback", desc: "Automated delivery", to: "/playback-mix", color: "bg-skoop-purple/10 text-skoop-purple" },
];

export default function Overview() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Network Monetisation Overview"
        icon={<LayoutDashboard size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}>
              <Plus size={14} className="mr-1" /> New Rule
            </Button>
            <Button size="sm" onClick={() => navigate("/campaigns/create")}>
              <Plus size={14} className="mr-1" /> Create Campaign
            </Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* How it works — Flow Diagram */}
        <div className="skoop-card p-5">
          <p className="skoop-section-header mb-1">How Monetisation Works</p>
          <p className="text-xs text-muted-foreground mb-4">Screens are devices → Network Rules define inventory on those screens → Campaigns use that inventory → System manages playback automatically</p>
          <div className="flex items-center gap-0">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => navigate(step.to)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 w-full transition-all hover:shadow-sm border border-border hover:border-primary/30 group`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${step.color}`}>
                    <step.icon size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                  </div>
                </button>
                {i < flowSteps.length - 1 && (
                  <ArrowRight size={16} className="text-muted-foreground/40 mx-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Network Mix Bar */}
        <div className="skoop-card p-5">
          <p className="skoop-section-header mb-1">Network Content Split</p>
          <p className="text-xs text-muted-foreground mb-3">
            <span className="font-medium text-foreground">Owned:</span> Your content &nbsp;·&nbsp;
            <span className="font-medium text-foreground">Direct:</span> Booked campaigns &nbsp;·&nbsp;
            <span className="font-medium text-foreground">Programmatic:</span> Automated ads
          </p>
          <MixBar owned={48} direct={32} programmatic={20} height="h-3" showLabels />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Active Network Rules" value="24" change="+3 this month" changeType="positive" icon={<MapPin size={16} />} />
          <KPICard label="Campaigns Live" value="3" change="2 direct · 1 in-house" changeType="positive" icon={<Megaphone size={16} />} />
          <KPICard label="Programmatic Fill Rate" value="88.4%" change="-2.1% vs target" changeType="negative" icon={<Radio size={16} />} />
          <KPICard label="Under-delivery Alerts" value="2" change="2 campaigns at risk" changeType="negative" icon={<AlertTriangle size={16} />} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <KPICard label="Owned Content Delivered" value="47.8%" change="Target: 50%" changeType="neutral" />
          <KPICard label="Backfill Rate" value="6.2%" change="No-fill fallback to owned" changeType="neutral" />
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
            <p className="skoop-section-header mb-4">Delivered Plays (Last 7 Days)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={playsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="plays" stroke="hsl(174,100%,33%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational widgets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="skoop-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="skoop-section-header">Campaigns at Risk</p>
              <StatusChip status="at-risk" label={`${atRiskCampaigns.length} Active`} />
            </div>
            <div className="space-y-3">
              {atRiskCampaigns.map((c) => (
                <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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

        {/* Quick Actions */}
        <div className="skoop-card p-5">
          <p className="skoop-section-header mb-3">Quick Actions</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/placements")}>
              <MapPin size={14} className="mr-1.5" /> New Rule
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/campaigns/create")}>
              <Megaphone size={14} className="mr-1.5" /> Create Campaign
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/programmatic")}>
              <Radio size={14} className="mr-1.5" /> Add Programmatic Slot
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/proof-of-play")}>
              <Download size={14} className="mr-1.5" /> Export PoP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
