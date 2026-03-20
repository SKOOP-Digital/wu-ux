import { Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { allScreens } from "@/data/screens";
import { allPlacements } from "@/data/placements";

export default function Screens() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Screens" subtitle="Physical playback endpoints across your network" icon={<Monitor size={20} />} />
      <div className="p-8">
        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Screen Name</th>
                <th className="skoop-table-cell text-left">Venue</th>
                <th className="skoop-table-cell text-left">Resolution</th>
                <th className="skoop-table-cell text-left">Orientation</th>
                <th className="skoop-table-cell text-right">Daily Eligible Capacity</th>
                <th className="skoop-table-cell text-right">Ad Placements</th>
                <th className="skoop-table-cell text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {allScreens.map((s) => {
                const placementCount = allPlacements.filter((p) => p.screenIds.includes(s.id)).length;
                return (
                  <tr
                    key={s.id}
                    className="skoop-table-row cursor-pointer"
                    onClick={() => navigate(`/screens/${s.id}`)}
                  >
                    <td className="skoop-table-cell font-medium text-foreground flex items-center gap-2">
                      <Monitor size={14} className="text-muted-foreground" />{s.name}
                    </td>
                    <td className="skoop-table-cell text-muted-foreground">{s.venue}</td>
                    <td className="skoop-table-cell text-muted-foreground tabular-nums text-xs">{s.resolution}</td>
                    <td className="skoop-table-cell text-muted-foreground text-xs">{s.orientation}</td>
                    <td className="skoop-table-cell text-right tabular-nums text-sm">{(s.loopsPerHour * 16).toLocaleString()} opp</td>
                    <td className="skoop-table-cell text-right tabular-nums text-sm">{placementCount}</td>
                    <td className="skoop-table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                        {s.status}
                      </span>
                    </td>
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
