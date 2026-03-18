import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const steps = ["Basics", "Schedule", "Delivery Rules", "Creatives", "Commercials", "Review & Launch"];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sov, setSov] = useState(15);
  const [deliveryMode, setDeliveryMode] = useState<"sov" | "pph">("sov");

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <PageHeader
        title="Create Campaign"
        icon={<Megaphone size={20} />}
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Cancel</Button>}
      />

      {/* Step indicator */}
      <div className="border-b border-border px-8 py-4">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-skoop-aqua-light text-skoop-aqua" : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                {s}
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-3xl">
        {step === 0 && (
          <div className="space-y-5">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Campaign Basics</p>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Campaign Name</label><Input placeholder="e.g. Nike Summer Push" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Campaign Type</label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent><SelectItem value="direct">Direct</SelectItem><SelectItem value="owned">Owned</SelectItem><SelectItem value="programmatic">Programmatic</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs text-muted-foreground">Advertiser / Partner</label><Input placeholder="e.g. Nike Australia" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Objective</label><Input placeholder="e.g. Brand awareness, product launch" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Placements</label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select placements" /></SelectTrigger>
                    <SelectContent><SelectItem value="lobby">Lobby Screens — Main Loop</SelectItem><SelectItem value="food">Food Court Digital Menu Boards</SelectItem><SelectItem value="elevator">Elevator Portrait Panels</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Schedule</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" className="mt-1" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Active Days</label>
              <div className="flex gap-2 mt-2">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <button key={d} className="w-10 h-8 rounded border border-border text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">{d}</button>
              ))}</div>
            </div>
            <div><label className="text-xs text-muted-foreground">Dayparts</label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select dayparts" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Day</SelectItem><SelectItem value="morning">Morning (6am–11am)</SelectItem><SelectItem value="midday">Midday (11am–2pm)</SelectItem><SelectItem value="afternoon">Afternoon (2pm–5pm)</SelectItem><SelectItem value="evening">Evening (5pm–9pm)</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-xs text-muted-foreground">Timezone</label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent><SelectItem value="aest">AEST (UTC+10)</SelectItem><SelectItem value="awst">AWST (UTC+8)</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="skoop-card p-5 space-y-5">
            <p className="skoop-section-header">Delivery Rules</p>
            <div className="flex gap-2">
              <button onClick={() => setDeliveryMode("sov")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "sov" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Share of Voice</button>
              <button onClick={() => setDeliveryMode("pph")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "pph" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Plays per Hour</button>
            </div>
            {deliveryMode === "sov" ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Share of Voice</span><span className="font-medium tabular-nums">{sov}%</span></div>
                <Slider value={[sov]} onValueChange={([v]) => setSov(v)} max={50} step={1} />
                <div className="bg-secondary rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Estimated Plays per Hour</p>
                  <p className="text-sm font-medium tabular-nums mt-0.5">~{Math.round(sov * 0.3 * 30)} plays/hour (based on 120s loop)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Plays per Hour</label><Input type="number" placeholder="e.g. 4" className="mt-1 w-32" /></div>
                <div><label className="text-xs text-muted-foreground">Plays per Day (max)</label><Input type="number" placeholder="e.g. 48" className="mt-1 w-32" /></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div><label className="text-xs text-muted-foreground">Priority</label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Normal" /></SelectTrigger>
                  <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Frequency Cap</label><Input placeholder="e.g. 4 per hour" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Separation Category</label><Input placeholder="e.g. Beverages" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Creative Duration</label><Input placeholder="e.g. 15 seconds" className="mt-1" /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Creatives</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Nike_Summer_16x9.mp4", type: "Video", status: "Approved" },
                { name: "Nike_Logo_Static.jpg", type: "Image", status: "Approved" },
                { name: "Nike_Promo_HTML5.zip", type: "HTML5", status: "Pending" },
              ].map((c) => (
                <div key={c.name} className="rounded-lg border border-border overflow-hidden">
                  <div className="h-28 bg-secondary flex items-center justify-center text-muted-foreground text-xs">{c.type} Preview</div>
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    <div className="mt-1.5"><StatusChip status={c.status.toLowerCase()} label={c.status} /></div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">+ Add Creative</Button>
          </div>
        )}

        {step === 4 && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Commercials</p>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Pricing Model</label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent><SelectItem value="flat">Flat Fee</SelectItem><SelectItem value="cpp">Cost per Play</SelectItem><SelectItem value="cpm">CPM</SelectItem><SelectItem value="sov">Share of Voice Package</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Rate</label><Input placeholder="e.g. $0.15 per play" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Partner Revenue Share</label><Input placeholder="e.g. 70/30" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Billing Notes</label><Input placeholder="e.g. Net 30, invoice monthly" className="mt-1" /></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Review & Launch</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Campaign</p><p className="text-sm font-medium">Nike Summer Push</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status="direct" /></div>
                <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">Mar 1 – Mar 31</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery</p><p className="text-sm font-medium">SoV 15%</p></div>
                <div><p className="text-xs text-muted-foreground">Placements</p><p className="text-sm font-medium">Lobby Screens — Main Loop</p></div>
                <div><p className="text-xs text-muted-foreground">Creatives</p><p className="text-sm font-medium">3 assets (2 approved)</p></div>
              </div>
            </div>
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Estimated Delivery</p>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Total Plays</p><p className="text-sm font-medium tabular-nums">~5,400</p></div>
                <div><p className="text-xs text-muted-foreground">Inventory Fit</p><StatusChip status="healthy" label="Good Fit" /></div>
                <div><p className="text-xs text-muted-foreground">Conflicts</p><p className="text-sm font-medium text-muted-foreground">None detected</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" size="sm" onClick={prev} disabled={step === 0}><ArrowLeft size={14} className="mr-1" /> Previous</Button>
          {step < steps.length - 1 ? (
            <Button size="sm" onClick={next}>Next <ArrowRight size={14} className="ml-1" /></Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/campaigns")}>Launch Campaign</Button>
          )}
        </div>
      </div>
    </div>
  );
}
