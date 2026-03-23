import { Shuffle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import StatusChip from "@/components/shared/StatusChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const venues = [
  { name: "Westfield Sydney", targetOwned: 50, targetDirect: 30, targetProg: 20, actualOwned: 47, actualDirect: 34, actualProg: 19 },
  { name: "Melbourne Central", targetOwned: 40, targetDirect: 40, targetProg: 20, actualOwned: 42, actualDirect: 38, actualProg: 20 },
  { name: "Brisbane CBD Tower", targetOwned: 60, targetDirect: 25, targetProg: 15, actualOwned: 58, actualDirect: 27, actualProg: 15 },
  { name: "Perth Arena Complex", targetOwned: 70, targetDirect: 20, targetProg: 10, actualOwned: 72, actualDirect: 18, actualProg: 10 },
];

export default function PlaybackMix() {
  const [simProgFill, setSimProgFill] = useState(100);

  return (
    <div>
      <PageHeader title="Playback Mix" subtitle="Monitor and simulate content mix across your network" icon={<Shuffle size={20} />} />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex gap-3">
          <Select><SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Venues" /></SelectTrigger>
            <SelectContent>{venues.map((v) => <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select><SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Dayparts" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Day</SelectItem><SelectItem value="morning">Morning</SelectItem><SelectItem value="evening">Evening</SelectItem></SelectContent>
          </Select>
        </div>

        {/* Venue mix cards */}
        <div className="grid grid-cols-2 gap-4">
          {venues.map((v) => {
            const simOwned = v.actualOwned + Math.round((100 - simProgFill) / 100 * v.targetProg);
            const simProg = Math.round(v.actualProg * simProgFill / 100);
            const driftOwned = simOwned - v.targetOwned;
            const driftDirect = v.actualDirect - v.targetDirect;
            const driftProg = simProg - v.targetProg;
            const hasAlert = Math.abs(driftProg) > 3 || Math.abs(driftDirect) > 5;

            return (
              <div key={v.name} className="skoop-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">{v.name}</h3>
                  {hasAlert && <StatusChip status="at-risk" label="Drift Alert" />}
                </div>
                <MixBar owned={simOwned} direct={v.actualDirect} programmatic={Math.max(0, simProg)} height="h-3" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Marketing</p>
                    <p className="text-lg font-semibold tabular-nums">{simOwned}%</p>
                    <p className="text-[10px] text-muted-foreground">Target: {v.targetOwned}%</p>
                    <p className={`text-[10px] font-medium tabular-nums ${driftOwned > 0 ? "text-skoop-blue" : driftOwned < 0 ? "text-skoop-risk" : "text-muted-foreground"}`}>
                      {driftOwned > 0 ? "+" : ""}{driftOwned}% drift
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Direct</p>
                    <p className="text-lg font-semibold tabular-nums">{v.actualDirect}%</p>
                    <p className="text-[10px] text-muted-foreground">Target: {v.targetDirect}%</p>
                    <p className={`text-[10px] font-medium tabular-nums ${driftDirect > 0 ? "text-skoop-blue" : driftDirect < 0 ? "text-skoop-risk" : "text-muted-foreground"}`}>
                      {driftDirect > 0 ? "+" : ""}{driftDirect}% drift
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Programmatic</p>
                    <p className="text-lg font-semibold tabular-nums">{simProg}%</p>
                    <p className="text-[10px] text-muted-foreground">Target: {v.targetProg}%</p>
                    <p className={`text-[10px] font-medium tabular-nums ${driftProg > 0 ? "text-skoop-blue" : driftProg < 0 ? "text-skoop-risk" : "text-muted-foreground"}`}>
                      {driftProg > 0 ? "+" : ""}{driftProg}% drift
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulator */}
        <div className="skoop-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-skoop-amber" />
            <p className="skoop-section-header">What-if Simulator</p>
          </div>
          <p className="text-sm text-muted-foreground">Adjust programmatic fill to see how the playback mix shifts. When programmatic has no fill, marketing content backfills the gap.</p>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Programmatic Fill Level</span>
              <span className="font-medium tabular-nums">{simProgFill}%</span>
            </div>
            <Slider value={[simProgFill]} onValueChange={([v]) => setSimProgFill(v)} max={100} step={5} />
          </div>
          {simProgFill < 50 && (
            <div className="bg-skoop-amber-light border border-skoop-amber/20 rounded-md p-3 text-xs text-skoop-amber">
              ⚠ With programmatic fill at {simProgFill}%, marketing content will backfill {Math.round((100 - simProgFill) / 100 * 20)}% of the programmatic allocation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
