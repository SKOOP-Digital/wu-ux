import { ListVideo, AlertTriangle } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const playlistItems = [
  { id: "1", section: "Owned Content Pool", name: "Skoop Brand Reel", type: "Owned", duration: "15s", daypart: "All Day", campaign: "Brand Awareness — Q1", priority: "Normal", delivery: "SoV 50%" },
  { id: "2", section: "Owned Content Pool", name: "Network Promo Spot", type: "Owned", duration: "10s", daypart: "All Day", campaign: "Brand Awareness — Q1", priority: "Low", delivery: "Fill" },
  { id: "3", section: "Direct Campaigns", name: "Nike Summer Push — 16x9", type: "Direct", duration: "15s", daypart: "All Day", campaign: "Nike Summer Push", priority: "High", delivery: "SoV 15%" },
  { id: "4", section: "Direct Campaigns", name: "Coca-Cola Lobby — V2", type: "Direct", duration: "15s", daypart: "11am–9pm", campaign: "Coca-Cola Lobby Spots", priority: "Normal", delivery: "4 plays/hr" },
  { id: "5", section: "Programmatic Slots", name: "Programmatic Slot — 15s", type: "Programmatic", duration: "15s", daypart: "All Day", campaign: "Programmatic", priority: "Normal", delivery: "Fill" },
  { id: "6", section: "Programmatic Slots", name: "Programmatic Slot — 10s", type: "Programmatic", duration: "10s", daypart: "Peak", campaign: "Programmatic", priority: "Low", delivery: "Fill" },
];

const sections = ["Owned Content Pool", "Direct Campaigns", "Programmatic Slots"];

const contentLibrary = ["Media", "AI Image Generator", "Menu Builder", "Zones", "Timer", "Clock", "Weather", "Youtube", "Website", "Templates", "RSS Feed", "KIOSK"];

export default function PlaylistEditor() {
  const [selectedPlaylist] = useState("widgets");

  return (
    <div className="flex h-screen">
      {/* Main playlist area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <PageHeader
          title="Playlist"
          icon={<ListVideo size={20} />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Revert</Button>
              <Button variant="outline" size="sm">Finish Later</Button>
              <Button size="sm">Publish</Button>
            </div>
          }
        />

        <div className="px-8 py-4 border-b border-border flex items-center gap-6">
          <div><span className="text-sm font-medium">{selectedPlaylist}</span><StatusChip status="draft" label="Draft" /></div>
          <div className="flex gap-4 ml-auto">
            <div><label className="text-[10px] text-muted-foreground uppercase">Aspect Ratio</label>
              <Select><SelectTrigger className="h-8 w-32 text-xs mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="16:9">16:9</SelectItem><SelectItem value="9:16">9:16</SelectItem><SelectItem value="4:3">4:3</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-[10px] text-muted-foreground uppercase">Default Duration</label>
              <div className="flex items-center gap-1 mt-0.5"><input type="number" defaultValue="10" className="h-8 w-16 rounded-md border border-input px-2 text-xs" /><span className="text-xs text-muted-foreground">Seconds</span></div>
            </div>
            <div><label className="text-[10px] text-muted-foreground uppercase">Transition</label>
              <Select><SelectTrigger className="h-8 w-28 text-xs mt-0.5"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="fade">Fade</SelectItem><SelectItem value="slide">Slide</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Mix summary */}
          <div className="skoop-card p-4 flex items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Mix & Capacity</p>
              <MixBar owned={50} direct={30} programmatic={20} height="h-2" showLabels />
            </div>
            <div className="flex gap-4 border-l border-border pl-4">
              <div className="text-center"><p className="text-xs text-muted-foreground">Items</p><p className="text-sm font-semibold tabular-nums">{playlistItems.length}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Loop</p><p className="text-sm font-semibold tabular-nums">120s</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Capacity</p><p className="text-sm font-semibold tabular-nums">82%</p></div>
            </div>
          </div>

          {/* Warnings */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-skoop-amber-light text-xs text-skoop-amber">
              <AlertTriangle size={12} /> No-fill fallback enabled for programmatic slots
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => {
            const items = playlistItems.filter((i) => i.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section}>
                <p className="skoop-section-header mb-3">{section}</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="skoop-card p-4 flex items-center gap-4">
                      <div className="w-6 text-center text-muted-foreground cursor-grab">⋮⋮</div>
                      <div className="w-24 h-14 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground">Preview</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusChip status={item.type.toLowerCase()} />
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{item.duration}</span>
                          <span>{item.daypart}</span>
                          <span>{item.campaign}</span>
                          <span>Priority: {item.priority}</span>
                          <span>Delivery: {item.delivery}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right content library panel */}
      <div className="w-[280px] border-l border-border bg-card flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Content</h2>
        </div>
        <div className="px-4 py-2 border-b border-border">
          <input type="text" placeholder="Type to search apps" className="w-full h-8 rounded-md border border-input px-3 text-xs bg-background" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {contentLibrary.map((item) => (
            <button key={item} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border">
              <span>{item}</span>
              <span className="text-muted-foreground">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
