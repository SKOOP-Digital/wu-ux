import { useState, useMemo } from "react";
import { Monitor, Search, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { allScreens, type Screen } from "@/data/screens";

interface ScreenSelectorModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

export default function ScreenSelectorModal({ open, onClose, selectedIds, onSave }: ScreenSelectorModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [venueFilter, setVenueFilter] = useState("All");

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelected(selectedIds);
      setSearch("");
      setVenueFilter("All");
    } else {
      onClose();
    }
  };

  const venues = useMemo(() => {
    const set = new Set(allScreens.map((s) => s.venue));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return allScreens.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (venueFilter !== "All" && s.venue !== venueFilter) return false;
      return true;
    });
  }, [search, venueFilter]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    const allFilteredIds = filtered.map((s) => s.id);
    const allSelected = allFilteredIds.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  // Capacity preview
  const selectedScreens = allScreens.filter((s) => selected.includes(s.id));
  const totalCapacity = selectedScreens.reduce((sum, s) => sum + s.loopsPerHour * 16, 0);

  const offlineCount = selectedScreens.filter((s) => s.status === "Offline").length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Screens</DialogTitle>
          <DialogDescription>
            Select which screens belong to this ad placement. Capacity will be recalculated based on selection.
          </DialogDescription>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground tabular-nums">
              {selected.length} selected screen{selected.length !== 1 ? "s" : ""} · {totalCapacity.toLocaleString()} playback opportunities/day
            </span>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 mt-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search screens…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {venues.map((v) => (
              <button
                key={v}
                onClick={() => setVenueFilter(v)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  venueFilter === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-3">
            <button onClick={toggleAll} className="text-xs text-primary hover:underline font-medium">
              {filtered.every((s) => selected.includes(s.id)) ? "Deselect all" : "Select all in this venue"}
            </button>
            {selected.length > 0 && (
              <button onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-destructive hover:underline font-medium">
                Clear selection
              </button>
            )}
          </div>
        </div>

        {offlineCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Offline screens reduce effective live capacity
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[40vh] pr-1">
          {filtered.map((s) => {
            const isSelected = selected.includes(s.id);
            const dailyCap = s.loopsPerHour * 16;
            return (
              <label
                key={s.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/5 border border-primary/20" : "border border-transparent hover:bg-secondary/50"
                }`}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => toggle(s.id)} />
                <Monitor size={14} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.venue} · {s.resolution} · {s.orientation} · {dailyCap.toLocaleString()} playback opportunities/day</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  s.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${s.status === "Online" ? "bg-emerald-500" : "bg-red-400"}`} />
                  {s.status}
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">No screens match your search</div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(selected); onClose(); }}>
            <Check size={14} className="mr-1" /> Save ({selected.length} screens · {totalCapacity.toLocaleString()} playback opportunities/day)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
