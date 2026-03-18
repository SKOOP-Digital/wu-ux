import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import KPICard from "@/components/shared/KPICard";

const revenueBySource = [
  { month: "Jan", direct: 8200, programmatic: 3100 },
  { month: "Feb", direct: 9400, programmatic: 3600 },
  { month: "Mar", direct: 11200, programmatic: 4200 },
  { month: "Apr", direct: 10800, programmatic: 3900 },
  { month: "May", direct: 12600, programmatic: 4800 },
  { month: "Jun", direct: 14200, programmatic: 5100 },
];

const topPlacements = [
  { name: "Lobby Screens — Main Loop", revenue: "$6,420", fill: "94%", status: "Healthy" },
  { name: "Food Court Digital Menu Boards", revenue: "$4,100", fill: "88%", status: "Healthy" },
  { name: "Concourse Video Wall", revenue: "$3,200", fill: "78%", status: "At Risk" },
  { name: "Elevator Portrait Panels", revenue: "$2,080", fill: "82%", status: "Healthy" },
  { name: "Parking Entry Totems", revenue: "$1,440", fill: "65%", status: "Under-delivering" },
];

const advertiserRevenue = [
  { advertiser: "Nike Australia", revenue: "$8,400", campaigns: 1 },
  { advertiser: "Coca-Cola", revenue: "$4,200", campaigns: 1 },
  { advertiser: "Samsung", revenue: "$3,600", campaigns: 1 },
  { advertiser: "Programmatic (Multiple)", revenue: "$5,100", campaigns: 3 },
];

export default function RevenueReports() {
  return (
    <div>
      <PageHeader title="Revenue & Reports" subtitle="Monetisation analytics and performance" icon={<DollarSign size={20} />} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Total Revenue (MTD)" value="$19,300" change="+14% vs last month" changeType="positive" />
          <KPICard label="Direct Revenue" value="$14,200" change="74% of total" changeType="neutral" />
          <KPICard label="Programmatic Revenue" value="$5,100" change="26% of total" changeType="neutral" />
          <KPICard label="At-risk Revenue" value="$2,400" change="2 campaigns under-delivering" changeType="negative" />
        </div>

        <div className="skoop-card p-5">
          <p className="skoop-section-header mb-4">Revenue by Source</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueBySource}>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Top Placements by Revenue</p>
            {topPlacements.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Fill: {p.fill}</p></div>
                <span className="text-sm font-medium tabular-nums">{p.revenue}</span>
              </div>
            ))}
          </div>
          <div className="skoop-card p-5">
            <p className="skoop-section-header mb-4">Revenue by Advertiser</p>
            {advertiserRevenue.map((a) => (
              <div key={a.advertiser} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div><p className="text-sm font-medium">{a.advertiser}</p><p className="text-xs text-muted-foreground">{a.campaigns} campaign{a.campaigns > 1 ? "s" : ""}</p></div>
                <span className="text-sm font-medium tabular-nums">{a.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
