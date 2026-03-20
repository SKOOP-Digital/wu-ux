import { Monitor } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function Screens() {
  const screens = [
    { id: "1", name: "Lobby Screen 1", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape" },
    { id: "2", name: "Lobby Screen 2", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape" },
    { id: "3", name: "Food Court Display A", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait" },
    { id: "4", name: "Food Court Display B", venue: "Melbourne Central", status: "Offline", resolution: "1080×1920", orientation: "Portrait" },
    { id: "5", name: "Elevator Panel 1", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait" },
    { id: "6", name: "Elevator Panel 2", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait" },
    { id: "7", name: "Parking Totem A", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape" },
    { id: "8", name: "Concourse Video Wall", venue: "Westfield Sydney", status: "Online", resolution: "3840×2160", orientation: "Landscape" },
  ];

  return (
    <div>
      <PageHeader title="Screens" subtitle="Manage your physical screen devices" icon={<Monitor size={20} />} />
      <div className="p-8">
        <div className="skoop-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="skoop-table-header">
                <th className="skoop-table-cell text-left">Screen Name</th>
                <th className="skoop-table-cell text-left">Venue</th>
                <th className="skoop-table-cell text-left">Resolution</th>
                <th className="skoop-table-cell text-left">Orientation</th>
                <th className="skoop-table-cell text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((s) => (
                <tr key={s.id} className="skoop-table-row">
                  <td className="skoop-table-cell font-medium text-foreground flex items-center gap-2"><Monitor size={14} className="text-muted-foreground" />{s.name}</td>
                  <td className="skoop-table-cell text-muted-foreground">{s.venue}</td>
                  <td className="skoop-table-cell text-muted-foreground tabular-nums text-xs">{s.resolution}</td>
                  <td className="skoop-table-cell text-muted-foreground text-xs">{s.orientation}</td>
                  <td className="skoop-table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
