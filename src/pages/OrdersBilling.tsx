import { FileText, Search, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const orders = [
  { id: "IO-2026-001", advertiser: "Nike Australia", campaign: "Nike Summer Push", amount: "$8,400.00", delivered: "62%", billed: "$5,208.00", status: "Active", makegood: "—", split: "70/30" },
  { id: "IO-2026-002", advertiser: "Coca-Cola", campaign: "Coca-Cola Lobby Spots", amount: "$4,200.00", delivered: "71%", billed: "$2,982.00", status: "Active", makegood: "—", split: "75/25" },
  { id: "IO-2026-003", advertiser: "Samsung", campaign: "Samsung Galaxy Launch", amount: "$3,600.00", delivered: "0%", billed: "$0.00", status: "Pending", makegood: "—", split: "70/30" },
  { id: "IO-2025-048", advertiser: "Myer", campaign: "Holiday Season Promo", amount: "$12,000.00", delivered: "100%", billed: "$12,000.00", status: "Completed", makegood: "—", split: "65/35" },
  { id: "IO-2025-045", advertiser: "Qantas", campaign: "Travel Summer Sale", amount: "$6,800.00", delivered: "94%", billed: "$6,392.00", status: "Completed", makegood: "Credit $408", split: "70/30" },
];

export default function OrdersBilling() {
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<typeof orders[0] | null>(null);

  const filtered = orders.filter((o) => !search || o.advertiser.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Orders & Billing" subtitle="Insertion orders, invoicing, and revenue splits" icon={<FileText size={20} />}
        actions={<Button size="sm">+ New Order</Button>}
      />
      <div className="p-8 space-y-4">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>

        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Order ID</th>
                <th className="skoop-table-cell text-left">Advertiser</th>
                <th className="skoop-table-cell text-left">Campaign</th>
                <th className="skoop-table-cell text-right">Amount</th>
                <th className="skoop-table-cell text-right">Delivered</th>
                <th className="skoop-table-cell text-right">Billed</th>
                <th className="skoop-table-cell text-left">Makegood</th>
                <th className="skoop-table-cell text-left">Split</th>
                <th className="skoop-table-cell text-left">Status</th>
                <th className="skoop-table-cell w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(o)}>
                  <td className="skoop-table-cell font-medium text-primary text-xs">{o.id}</td>
                  <td className="skoop-table-cell">{o.advertiser}</td>
                  <td className="skoop-table-cell text-muted-foreground text-xs">{o.campaign}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{o.amount}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{o.delivered}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{o.billed}</td>
                  <td className="skoop-table-cell text-xs">{o.makegood}</td>
                  <td className="skoop-table-cell text-xs text-muted-foreground">{o.split}</td>
                  <td className="skoop-table-cell"><StatusChip status={o.status.toLowerCase()} label={o.status} /></td>
                  <td className="skoop-table-cell"><MoreHorizontal size={14} className="text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Order Details">
        {drawer && (
          <div className="space-y-5">
            <div><p className="text-xs text-muted-foreground">Order ID</p><h3 className="font-semibold text-foreground">{drawer.id}</h3></div>
            <StatusChip status={drawer.status.toLowerCase()} label={drawer.status} />
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({ Advertiser: drawer.advertiser, Campaign: drawer.campaign, "Total Amount": drawer.amount, "Delivered": drawer.delivered, "Billed": drawer.billed, "Revenue Split": drawer.split, "Makegood / Credit": drawer.makegood }).map(([k, v]) => (
                <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p className="text-sm font-medium">{v}</p></div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <Button variant="outline" size="sm" className="w-full">Export Invoice Summary</Button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
