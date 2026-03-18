import { Radio, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DetailDrawer from "@/components/shared/DetailDrawer";

const slots = [
  { id: "1", name: "Lobby Programmatic 15s", placement: "Lobby Screens — Main Loop", duration: "15s", format: "Video, Image", demand: "Google Ad Manager", floor: "$2.50 CPM", fallback: "Owned Content Pool", status: "Live", noFill: "8%", avgResponse: "120ms", plays: "1,240" },
  { id: "2", name: "Food Court Pre-roll", placement: "Food Court Digital Menu Boards", duration: "10s", format: "Video", demand: "Vistar Media", floor: "$3.00 CPM", fallback: "Brand Reel", status: "Live", noFill: "12%", avgResponse: "95ms", plays: "860" },
  { id: "3", name: "Elevator Quick Spot", placement: "Elevator Portrait Panels", duration: "6s", format: "Image", demand: "Hivestack", floor: "$1.80 CPM", fallback: "Owned Content Pool", status: "Paused", noFill: "—", avgResponse: "—", plays: "—" },
];

export default function ProgrammaticSlots() {
  const [drawer, setDrawer] = useState<typeof slots[0] | null>(null);

  return (
    <div>
      <PageHeader
        title="Programmatic Slots"
        subtitle="Configure and monitor programmatic ad slots"
        icon={<Radio size={20} />}
        actions={<Button size="sm"><Plus size={14} className="mr-1" /> Add Slot</Button>}
      />
      <div className="p-8 space-y-6">
        {/* Architecture visual */}
        <div className="skoop-card p-5">
          <p className="skoop-section-header mb-3">Request Lifecycle</p>
          <div className="flex items-center gap-3 text-xs font-medium">
            {["Placement", "Programmatic Slot", "Ad Decision", "Creative Delivery", "Proof of Play"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-md bg-secondary text-foreground">{s}</span>
                {i < 4 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Slots table */}
        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Slot Name</th>
                <th className="skoop-table-cell text-left">Placement</th>
                <th className="skoop-table-cell text-left">Duration</th>
                <th className="skoop-table-cell text-left">Demand Source</th>
                <th className="skoop-table-cell text-right">Floor Price</th>
                <th className="skoop-table-cell text-right">No-fill</th>
                <th className="skoop-table-cell text-right">Avg Response</th>
                <th className="skoop-table-cell text-right">Plays</th>
                <th className="skoop-table-cell text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(s)}>
                  <td className="skoop-table-cell font-medium text-foreground">{s.name}</td>
                  <td className="skoop-table-cell text-muted-foreground text-xs">{s.placement}</td>
                  <td className="skoop-table-cell tabular-nums">{s.duration}</td>
                  <td className="skoop-table-cell text-muted-foreground">{s.demand}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{s.floor}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{s.noFill}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{s.avgResponse}</td>
                  <td className="skoop-table-cell text-right tabular-nums">{s.plays}</td>
                  <td className="skoop-table-cell"><StatusChip status={s.status.toLowerCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Slot Configuration">
        {drawer && (
          <div className="space-y-5">
            <div><h3 className="font-semibold text-foreground">{drawer.name}</h3><StatusChip status={drawer.status.toLowerCase()} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Placement</p><p className="text-sm font-medium">{drawer.placement}</p></div>
              <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-medium">{drawer.duration}</p></div>
              <div><p className="text-xs text-muted-foreground">Formats</p><p className="text-sm font-medium">{drawer.format}</p></div>
              <div><p className="text-xs text-muted-foreground">Demand Source</p><p className="text-sm font-medium">{drawer.demand}</p></div>
              <div><p className="text-xs text-muted-foreground">Floor Price</p><p className="text-sm font-medium">{drawer.floor}</p></div>
              <div><p className="text-xs text-muted-foreground">Fallback</p><p className="text-sm font-medium">{drawer.fallback}</p></div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="skoop-section-header mb-3">Performance</p>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs text-muted-foreground">No-fill Rate</p><p className="text-sm font-medium tabular-nums">{drawer.noFill}</p></div>
                <div><p className="text-xs text-muted-foreground">Avg Response</p><p className="text-sm font-medium tabular-nums">{drawer.avgResponse}</p></div>
                <div><p className="text-xs text-muted-foreground">Rendered</p><p className="text-sm font-medium tabular-nums">{drawer.plays}</p></div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
