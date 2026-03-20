import { Monitor, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { allScreens } from "@/data/screens";
import { allPlacements } from "@/data/placements";

export default function ScreenDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screen = allScreens.find((s) => s.id === id);

  if (!screen) {
    return (
      <div>
        <PageHeader title="Screen Not Found" subtitle="This screen does not exist" icon={<Monitor size={20} />} />
        <div className="p-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/screens")}>
            <ArrowLeft size={14} className="mr-1" /> Back to Screens
          </Button>
        </div>
      </div>
    );
  }

  const linkedPlacements = allPlacements.filter((p) => p.screenIds.includes(screen.id));

  return (
    <div>
      <PageHeader
        title={screen.name}
        subtitle={`${screen.venue} · ${screen.orientation} · ${screen.resolution}`}
        icon={<Monitor size={20} />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/screens")}>
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="col-span-2 space-y-6">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Screen Details</p>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${screen.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${screen.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                      {screen.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Venue</p>
                  <p className="text-sm font-medium mt-1">{screen.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution</p>
                  <p className="text-sm font-medium tabular-nums mt-1">{screen.resolution}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orientation</p>
                  <p className="text-sm font-medium mt-1">{screen.orientation}</p>
                </div>
              </div>
            </div>

            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Playback Capacity</p>
              <p className="text-xs text-muted-foreground">This screen's playback configuration</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Loop Duration</p>
                  <p className="text-sm font-medium tabular-nums">{screen.loopDuration}s</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Loops per Hour</p>
                  <p className="text-sm font-medium tabular-nums">{screen.loopsPerHour}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Slots per Day (16h)</p>
                  <p className="text-sm font-medium tabular-nums">{(screen.loopsPerHour * 16).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Ad Placements linked to this screen */}
            <div className="skoop-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skoop-section-header">Ad Placements</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Placements that include this screen in their inventory
                  </p>
                </div>
              </div>

              {linkedPlacements.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg py-8 text-center">
                  <MapPin size={20} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No ad placements assigned to this screen</p>
                  <p className="text-xs text-muted-foreground mt-1">Create an ad placement to monetise this screen</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate("/placements")}>
                    View Ad Placements
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedPlacements.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3 px-4 border border-border rounded-md hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/placements/${p.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.screenIds.length} screens · {p.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-28">
                          <MixBar owned={p.owned} direct={p.direct} programmatic={p.prog} />
                        </div>
                        <StatusChip status={p.status.toLowerCase().replace(" ", "-")} label={p.status} />
                        <ExternalLink size={12} className="text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Summary</p>
              <div>
                <p className="text-xs text-muted-foreground">Ad Placements</p>
                <p className="text-lg font-semibold tabular-nums">{linkedPlacements.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Capacity</p>
                <p className="text-lg font-semibold tabular-nums">{(screen.loopsPerHour * 16).toLocaleString()} slots</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${screen.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${screen.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                  {screen.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
