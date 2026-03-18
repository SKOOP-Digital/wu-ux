import { FileCheck, Search, Download } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const events = [
  { id: "1", timestamp: "2026-03-18 09:15:22", screen: "Lobby Screen 1", venue: "Westfield Sydney", campaign: "Nike Summer Push", creative: "Nike_Summer_16x9.mp4", scheduled: "09:15:00", actualStart: "09:15:02", actualEnd: "09:15:17", result: "Played", reason: "—" },
  { id: "2", timestamp: "2026-03-18 09:15:37", screen: "Lobby Screen 1", venue: "Westfield Sydney", campaign: "Programmatic", creative: "AdX_Creative_4821", scheduled: "09:15:15", actualStart: "09:15:37", actualEnd: "09:15:47", result: "Played", reason: "—" },
  { id: "3", timestamp: "2026-03-18 09:16:02", screen: "Lobby Screen 2", venue: "Westfield Sydney", campaign: "Programmatic", creative: "—", scheduled: "09:16:00", actualStart: "—", actualEnd: "—", result: "No Fill", reason: "No bid received" },
  { id: "4", timestamp: "2026-03-18 09:16:02", screen: "Lobby Screen 2", venue: "Westfield Sydney", campaign: "Brand Awareness — Q1", creative: "Skoop_Brand_Reel.mp4", scheduled: "09:16:00", actualStart: "09:16:03", actualEnd: "09:16:18", result: "Backfilled", reason: "Programmatic no-fill fallback" },
  { id: "5", timestamp: "2026-03-18 09:17:15", screen: "Food Court Screen 3", venue: "Melbourne Central", campaign: "Coca-Cola Lobby Spots", creative: "CocaCola_15s_V2.mp4", scheduled: "09:17:00", actualStart: "09:17:15", actualEnd: "09:17:30", result: "Played", reason: "—" },
  { id: "6", timestamp: "2026-03-18 09:18:00", screen: "Elevator Panel 1", venue: "Brisbane CBD Tower", campaign: "Nike Summer Push", creative: "Nike_Logo_Static.jpg", scheduled: "09:18:00", actualStart: "—", actualEnd: "—", result: "Skipped", reason: "Frequency cap reached" },
  { id: "7", timestamp: "2026-03-18 09:19:30", screen: "Parking Totem 1", venue: "Perth Arena", campaign: "Brand Awareness — Q1", creative: "Skoop_Brand_Reel.mp4", scheduled: "09:19:30", actualStart: "09:19:30", actualEnd: "09:19:45", result: "Failed", reason: "Playback timeout" },
];

const resultFilters = ["All", "Played", "Skipped", "Failed", "Backfilled", "No Fill"];

export default function ProofOfPlay() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<typeof events[0] | null>(null);

  const filtered = events.filter((e) => {
    if (search && !e.campaign.toLowerCase().includes(search.toLowerCase()) && !e.screen.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "All") return true;
    return e.result === filter;
  });

  return (
    <div>
      <PageHeader
        title="Proof of Play"
        subtitle="Verify and export delivery records"
        icon={<FileCheck size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download size={14} className="mr-1" /> Export CSV</Button>
            <Button variant="outline" size="sm">Scheduled Export</Button>
            <Button variant="outline" size="sm">API</Button>
          </div>
        }
      />
      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search campaigns, screens…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 h-9 text-sm" />
          </div>
          <Input type="date" className="w-36 h-9 text-sm" />
          <Input type="date" className="w-36 h-9 text-sm" />
          <Select><SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="All campaigns" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All campaigns</SelectItem><SelectItem value="nike">Nike Summer Push</SelectItem><SelectItem value="coca">Coca-Cola Lobby Spots</SelectItem></SelectContent>
          </Select>
          <div className="flex gap-1">{resultFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>{f}</button>
          ))}</div>
        </div>

        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Timestamp</th>
                <th className="skoop-table-cell text-left">Screen / Venue</th>
                <th className="skoop-table-cell text-left">Campaign</th>
                <th className="skoop-table-cell text-left">Creative</th>
                <th className="skoop-table-cell text-left">Scheduled</th>
                <th className="skoop-table-cell text-left">Actual</th>
                <th className="skoop-table-cell text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="skoop-table-row cursor-pointer" onClick={() => setDrawer(e)}>
                  <td className="skoop-table-cell text-xs tabular-nums">{e.timestamp}</td>
                  <td className="skoop-table-cell"><p className="text-sm">{e.screen}</p><p className="text-xs text-muted-foreground">{e.venue}</p></td>
                  <td className="skoop-table-cell text-sm">{e.campaign}</td>
                  <td className="skoop-table-cell text-xs text-muted-foreground truncate max-w-[140px]">{e.creative}</td>
                  <td className="skoop-table-cell text-xs tabular-nums text-muted-foreground">{e.scheduled}</td>
                  <td className="skoop-table-cell text-xs tabular-nums">{e.actualStart !== "—" ? `${e.actualStart} – ${e.actualEnd}` : "—"}</td>
                  <td className="skoop-table-cell"><StatusChip status={e.result.toLowerCase().replace(" ", "-")} label={e.result} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawer} onClose={() => setDrawer(null)} title="Play Event Details">
        {drawer && (
          <div className="space-y-5">
            <StatusChip status={drawer.result.toLowerCase().replace(" ", "-")} label={drawer.result} />
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({ Timestamp: drawer.timestamp, Screen: drawer.screen, Venue: drawer.venue, Campaign: drawer.campaign, Creative: drawer.creative, Scheduled: drawer.scheduled, "Actual Start": drawer.actualStart, "Actual End": drawer.actualEnd, Reason: drawer.reason }).map(([k, v]) => (
                <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p className="text-sm font-medium">{v}</p></div>
              ))}
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
