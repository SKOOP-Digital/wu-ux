import { Settings as SettingsIcon, Upload, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { allScreens } from "@/data/screens";
import { bulkSetImpressions, getLastImportTime } from "@/data/impressionStore";

const tabs = ["Delivery Rules", "Revenue Splits", "Audience & Impressions"];

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


        {tab === "Delivery Rules" && (
          <div className="space-y-4">
            {[
              { label: "Back-to-back Prevention", desc: "Prevent the same creative from playing in consecutive slots", toggle: true, defaultOn: true },
              { label: "Offer freed inventory to programmatic", desc: "When a campaign hits its target and stops, offer freed slots to Screenverse before falling back to house fill", toggle: true, defaultOn: true },
            ].map((r) => (
              <div key={r.label} className="skoop-card p-5 flex items-center justify-between">
                <div><p className="text-sm font-medium">{r.label}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
                <Switch defaultChecked={r.defaultOn} />
              </div>
            ))}
          </div>
        )}


        {tab === "Revenue Splits" && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Default Revenue Split Templates</p>
            {[
              { name: "Standard Partner", split: "70 / 30", desc: "Partner gets 70%, Skoop gets 30%" },
              { name: "Premium Partner", split: "75 / 25", desc: "Premium tier partners" },
              { name: "Managed Network", split: "60 / 40", desc: "Fully managed locations" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                <span className="text-sm font-medium tabular-nums">{s.split}</span>
              </div>
            ))}
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
