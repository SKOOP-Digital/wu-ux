import { Settings as SettingsIcon, Upload, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { allScreens } from "@/data/screens";
import { bulkSetImpressions, getLastImportTime } from "@/data/impressionStore";

const tabs = ["Mix Policy", "Delivery Rules", "Daypart Templates", "SSP Connectors", "Proof of Play", "Audience & Impressions"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Mix Policy");

  // Audience & Impressions state
  const [importResult, setImportResult] = useState<{ type: "success"; count: number; time: Date } | { type: "error"; matched: number; unmatched: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      // Skip header
      const dataLines = lines.slice(1);
      const entries: { screenId: string; multiplier: number }[] = [];
      const unmatched: string[] = [];

      dataLines.forEach((line) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 2) return;
        const screenId = parts[0];
        const multiplier = parseFloat(parts[1]);
        if (isNaN(multiplier)) return;
        const screenExists = allScreens.some((s) => s.id === screenId);
        if (screenExists) {
          entries.push({ screenId, multiplier });
        } else {
          unmatched.push(screenId);
        }
      });

      if (unmatched.length > 0 && entries.length === 0) {
        setImportResult({ type: "error", matched: 0, unmatched });
      } else if (unmatched.length > 0) {
        const count = bulkSetImpressions(entries);
        setImportResult({ type: "error", matched: count, unmatched });
      } else {
        const count = bulkSetImpressions(entries);
        setImportResult({ type: "success", count, time: new Date() });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const header = "screen_id,impressions_per_play";
    const rows = allScreens.map((s) => `${s.id},`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impression_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Monetisation Settings" subtitle="Network-wide defaults and rules" icon={<SettingsIcon size={20} />}
        actions={<Button size="sm">Save All</Button>}
      />
      <div className="border-b border-border px-8">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="p-8 max-w-3xl space-y-6">
        {/* Playback Tracking — always visible */}
        <div className="skoop-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Proof of Play Tracking</p>
              <p className="text-xs text-muted-foreground mt-0.5">Record every play event for all content across your network. Required for delivery reporting and advertiser proof of play.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        {tab === "Mix Policy" && (
          <div className="skoop-card p-5 space-y-5">
            <p className="skoop-section-header">Default Playback Mix</p>
            <p className="text-sm text-muted-foreground">Set the network-wide default allocation. Individual network rules can override these defaults. House Fill is automatically calculated as the remainder.</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground">Sold %</label><Input type="number" defaultValue="30" min="0" max="100" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Programmatic %</label><Input type="number" defaultValue="20" min="0" max="100" className="mt-1" /></div>
              <div>
                <label className="text-xs text-muted-foreground">House Fill % <span className="text-[10px] font-normal text-muted-foreground/60">(auto)</span></label>
                <div className="mt-1 h-10 flex items-center px-3 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground">50%</div>
              </div>
            </div>
            <MixBar houseFill={50} sold={30} programmatic={20} height="h-3" showLabels />
            <div className="flex items-center justify-between pt-2">
              <div><p className="text-sm font-medium">No-fill Fallback</p><p className="text-xs text-muted-foreground">When programmatic has no fill, fall back to house fill campaigns</p></div>
              <Switch defaultChecked />
            </div>
          </div>
        )}

        {tab === "Delivery Rules" && (
          <div className="space-y-4">
            {[
              { label: "Default Frequency Cap", desc: "Max plays per creative per hour", input: "4" },
              { label: "Category Separation Gap", desc: "Minimum slots between competing brands", input: "2" },
              { label: "Back-to-back Prevention", desc: "Prevent same creative playing consecutively", toggle: true },
            ].map((r) => (
              <div key={r.label} className="skoop-card p-5 flex items-center justify-between">
                <div><p className="text-sm font-medium">{r.label}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
                {r.toggle ? <Switch defaultChecked /> : <Input defaultValue={r.input} className="w-20 text-center" />}
              </div>
            ))}
          </div>
        )}

        {tab === "Daypart Templates" && (
          <div className="skoop-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <p className="skoop-section-header">Reusable Daypart Templates</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">Coming soon</span>
            </div>
            <p className="text-sm text-muted-foreground">Save and reuse time-window patterns across multiple network rules. Available in a future update.</p>
            {[
              { name: "Standard Business", hours: "6:00 AM – 6:00 PM" },
              { name: "Extended Hours", hours: "6:00 AM – 11:00 PM" },
              { name: "Peak Trading", hours: "11:00 AM – 2:00 PM, 5:00 PM – 8:00 PM" },
            ].map((d) => (
              <div key={d.name} className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary/30 opacity-60">
                <div><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.hours}</p></div>
                <Button variant="outline" size="sm" disabled>Edit</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 opacity-60 cursor-not-allowed" disabled>+ Add Template</Button>
          </div>
        )}

        {tab === "SSP Connectors" && (
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-2">
              <p className="skoop-section-header">Programmatic Partners</p>
              <p className="text-xs text-muted-foreground">Each partner uses a VAST tag iframe. The backend resolver injects partner ad content into the content feed as web items and logs plays for Proof of Play.</p>
            </div>
            {[
              { name: "Vistar Media", status: "Connected", endpoint: "https://api.vistarmedia.com/vast/...", note: "VAST tag injection" },
              { name: "Vengo", status: "Connected", endpoint: "https://api.vengo.tv/vast/...", note: "VAST tag injection" },
              { name: "Screenverse", status: "Disconnected", endpoint: "—", note: "" },
            ].map((c) => (
              <div key={c.name} className="skoop-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.endpoint}</p>
                  {c.note && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${c.status === "Connected" ? "text-skoop-aqua" : "text-muted-foreground"}`}>{c.status}</span>
                  <Button variant="outline" size="sm">{c.status === "Connected" ? "Configure" : "Connect"}</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Proof of Play" && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Export Settings</p>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Default Export Format</label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="CSV" /></SelectTrigger>
                  <SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="json">JSON</SelectItem><SelectItem value="xml">XML</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Scheduled Daily Export</p><p className="text-xs text-muted-foreground">Automatically export proof of play data daily</p></div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Include Backfill Events</p><p className="text-xs text-muted-foreground">Include marketing content backfill in PoP reports</p></div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}

        {tab === "Audience & Impressions" && (
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Audience & Impression Data</p>
              <p className="text-xs text-muted-foreground">
                Upload a CSV with impression multipliers for your screens. Expected format: two columns — <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">screen_id</code> and <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">impressions_per_play</code>.
              </p>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3 hover:border-primary/30 transition-colors">
                <Upload size={24} className="mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upload CSV</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Drag and drop or click to browse</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </div>

              <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                <Download size={12} /> Download template CSV
              </button>

              {importResult?.type === "success" && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                  <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700">{importResult.count} screen{importResult.count !== 1 ? "s" : ""} updated</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Imported {importResult.time.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {importResult?.type === "error" && (
                <div className="space-y-2">
                  {importResult.matched > 0 && (
                    <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                      <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-emerald-700">{importResult.matched} screen{importResult.matched !== 1 ? "s" : ""} updated successfully</p>
                    </div>
                  )}
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-700">{importResult.unmatched.length} unmatched screen ID{importResult.unmatched.length !== 1 ? "s" : ""}</p>
                      <div className="mt-1 space-y-0.5">
                        {importResult.unmatched.map((id) => (
                          <p key={id} className="text-[11px] text-red-600 font-mono">{id}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {getLastImportTime() && !importResult && (
                <p className="text-[11px] text-muted-foreground">Last import: {getLastImportTime()!.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
