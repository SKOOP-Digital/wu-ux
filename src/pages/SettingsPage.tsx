import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const tabs = ["Mix Policy", "Delivery Rules", "Daypart Templates", "Revenue Splits", "SSP Connectors", "Proof of Play"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Mix Policy");

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
        {tab === "Mix Policy" && (
          <div className="skoop-card p-5 space-y-5">
            <p className="skoop-section-header">Default Playback Mix</p>
            <p className="text-sm text-muted-foreground">Set the network-wide default allocation. Individual placements can override.</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground">Owned %</label><Input type="number" defaultValue="50" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Direct %</label><Input type="number" defaultValue="30" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Programmatic %</label><Input type="number" defaultValue="20" className="mt-1" /></div>
            </div>
            <MixBar owned={50} direct={30} programmatic={20} height="h-3" showLabels />
            <div className="flex items-center justify-between pt-2">
              <div><p className="text-sm font-medium">No-fill Fallback</p><p className="text-xs text-muted-foreground">When programmatic has no fill, use owned content</p></div>
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
          <div className="skoop-card p-5 space-y-3">
            <p className="skoop-section-header mb-2">Reusable Daypart Templates</p>
            {[
              { name: "Standard Business", hours: "6:00 AM – 6:00 PM" },
              { name: "Extended Hours", hours: "6:00 AM – 11:00 PM" },
              { name: "Peak Trading", hours: "11:00 AM – 2:00 PM, 5:00 PM – 8:00 PM" },
            ].map((d) => (
              <div key={d.name} className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary/50">
                <div><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.hours}</p></div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2">+ Add Template</Button>
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

        {tab === "SSP Connectors" && (
          <div className="space-y-4">
            {[
              { name: "Google Ad Manager", status: "Connected", endpoint: "https://admanager.googleapis.com/..." },
              { name: "Vistar Media", status: "Connected", endpoint: "https://api.vistarmedia.com/..." },
              { name: "Hivestack", status: "Disconnected", endpoint: "—" },
            ].map((c) => (
              <div key={c.name} className="skoop-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.endpoint}</p>
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
                <div><p className="text-sm font-medium">Include Backfill Events</p><p className="text-xs text-muted-foreground">Include owned content backfill in PoP reports</p></div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
