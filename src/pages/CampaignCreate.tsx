import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check, Info, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const steps = ["Basics", "Schedule", "Delivery Rules", "Creatives", "Commercials", "Review & Launch"];

// Mock placement data for preview cards
const placementOptions = [
  { value: "lobby", name: "Lobby Screens — Main Loop", screens: 6, venue: "Westfield Sydney", model: "Loop", dayparts: "All Day", utilisation: 82, availableDaily: 1440, owned: 50, direct: 30, prog: 20 },
  { value: "food", name: "Food Court Digital Menu Boards", screens: 4, venue: "Melbourne Central", model: "Ad-break", dayparts: "11am–9pm", utilisation: 88, availableDaily: 960, owned: 40, direct: 40, prog: 20 },
  { value: "elevator", name: "Elevator Portrait Panels", screens: 4, venue: "Brisbane CBD Tower", model: "Loop", dayparts: "7am–7pm", utilisation: 58, availableDaily: 1920, owned: 60, direct: 25, prog: 15 },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sov, setSov] = useState(13);
  const [deliveryMode, setDeliveryMode] = useState<"sov" | "pph">("sov");
  const [selectedPlacement, setSelectedPlacement] = useState("");
  const [pricingModel, setPricingModel] = useState("");
  const [activeDays, setActiveDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const selectedPl = placementOptions.find((p) => p.value === selectedPlacement);

  // SoV calculation
  const placementLoopsPerHour = selectedPl ? Math.round(selectedPl.availableDaily / 16) : 90;
  const estimatedPlaysPerHour = Math.round(placementLoopsPerHour * sov / 100);
  const estimatedDailyPlays = estimatedPlaysPerHour * 16;

  const toggleDay = (d: string) => {
    setActiveDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/campaigns">Campaigns</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Campaign</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title="Create Campaign"
        subtitle="Campaigns define what content runs, when it runs, and how it is delivered"
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
              <p className="text-xs text-muted-foreground">Campaigns define what content runs and how it is delivered across your ad placements.</p>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Campaign Name</label><Input placeholder="e.g. Nike Summer Push" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Campaign Type</label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent><SelectItem value="direct">Direct — Booked campaigns with advertisers</SelectItem><SelectItem value="owned">Owned — Your own brand content</SelectItem><SelectItem value="programmatic">Programmatic — Automated ads via demand partners</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs text-muted-foreground">Advertiser / Partner</label><Input placeholder="e.g. Nike Australia" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Objective</label><Input placeholder="e.g. Brand awareness, product launch" className="mt-1" /></div>
                <div>
                  <label className="text-xs text-muted-foreground">Ad Placements</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-1">Select which ad placements this campaign will run on. Placements define the available inventory on your screens.</p>
                  <Select value={selectedPlacement} onValueChange={setSelectedPlacement}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select ad placement" /></SelectTrigger>
                    <SelectContent>
                      {placementOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.name} ({p.screens} screens · {p.venue})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Placement preview card */}
            {selectedPl && (
              <div className="skoop-card p-5 space-y-3">
                <p className="skoop-section-header">Selected Placement Preview</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium">{selectedPl.screens} screens · {selectedPl.venue}</p></div>
                  <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{selectedPl.model}-based</p></div>
                  <div><p className="text-xs text-muted-foreground">Dayparts</p><p className="text-sm font-medium">{selectedPl.dayparts}</p></div>
                  <div><p className="text-xs text-muted-foreground">Utilisation</p><p className="text-sm font-medium tabular-nums">{selectedPl.utilisation}%</p></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Available direct inventory</p>
                  <p className="text-sm font-semibold tabular-nums text-primary">{Math.round(selectedPl.availableDaily * selectedPl.direct / 100).toLocaleString()} opportunities/day</p>
                </div>
                <MixBar owned={selectedPl.owned} direct={selectedPl.direct} programmatic={selectedPl.prog} showLabels />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="skoop-card p-5 space-y-4">
            <p className="skoop-section-header">Schedule</p>
            <p className="text-xs text-muted-foreground">Campaign only competes for inventory during selected days and dayparts.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" className="mt-1" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Active Days</label>
              <div className="flex gap-2 mt-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`w-10 h-8 rounded border text-xs font-medium transition-colors ${
                      activeDays.includes(d)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
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
            <p className="text-xs text-muted-foreground">Define how this campaign's content is delivered across the selected placement.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeliveryMode("sov")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "sov" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Share of Voice</button>
              <button onClick={() => setDeliveryMode("pph")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMode === "pph" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Plays per Hour</button>
            </div>
            {deliveryMode === "sov" ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Share of Voice</span><span className="font-medium tabular-nums">{sov}%</span></div>
                <Slider value={[sov]} onValueChange={([v]) => setSov(v)} max={50} step={1} />
                <div className="bg-secondary rounded-md p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground">Estimated Delivery</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Eligible placement capacity</p>
                      <p className="text-sm font-medium tabular-nums">{placementLoopsPerHour} opportunities/hour</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Estimated campaign share</p>
                      <p className="text-sm font-medium tabular-nums">~{estimatedPlaysPerHour} opportunities/hour</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Estimated daily delivery</p>
                      <p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} opportunities/day</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
                    <Info size={12} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      {sov}% share of voice × {placementLoopsPerHour} opp/hour = ~{estimatedPlaysPerHour} opp/hour × 16 active hours = ~{estimatedDailyPlays.toLocaleString()} opp/day
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Plays per Hour</label><Input type="number" placeholder="e.g. 4" className="mt-1 w-32" /></div>
                <div><label className="text-xs text-muted-foreground">Plays per Day (max)</label><Input type="number" placeholder="e.g. 48" className="mt-1 w-32" /></div>
                <div className="bg-secondary rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Estimated daily delivery: based on active hours × plays per hour</p>
                </div>
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
            <p className="text-xs text-muted-foreground">Attach media assets for this campaign. Creatives must be approved before launch.</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Nike_Summer_16x9.mp4", type: "Video", status: "Approved", duration: "15s", dimensions: "1920×1080" },
                { name: "Nike_Logo_Static.jpg", type: "Image", status: "Approved", duration: "10s", dimensions: "1920×1080" },
                { name: "Nike_Promo_HTML5.zip", type: "HTML5", status: "Pending", duration: "15s", dimensions: "1080×1920" },
              ].map((c) => (
                <div key={c.name} className="rounded-lg border border-border overflow-hidden">
                  <div className="h-28 bg-secondary flex items-center justify-center text-muted-foreground text-xs">{c.type} Preview</div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.duration} · {c.dimensions}</p>
                    <div className="mt-1.5"><StatusChip status={c.status.toLowerCase()} label={c.status} /></div>
                    {selectedPl && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {c.dimensions === "1920×1080" ? "✓ Compatible" : "⚠ Check orientation"}
                      </p>
                    )}
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
            <p className="text-xs text-muted-foreground">Define how this campaign is priced and billed.</p>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Pricing Model</label>
                <Select value={pricingModel} onValueChange={setPricingModel}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp">Cost per Play (CPP)</SelectItem>
                    <SelectItem value="cpm">CPM (per 1,000 impressions)</SelectItem>
                    <SelectItem value="flat">Flat Fee</SelectItem>
                    <SelectItem value="sov">Share of Voice Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  {pricingModel === "cpp" ? "Rate per Play" : pricingModel === "cpm" ? "Rate per 1,000 Impressions" : pricingModel === "flat" ? "Booking Value" : "Rate"}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input placeholder={pricingModel === "cpp" ? "0.10" : pricingModel === "cpm" ? "12.00" : "5,000"} className="w-40" />
                  <span className="text-xs text-muted-foreground">AUD</span>
                </div>
              </div>
              {pricingModel === "cpp" && (
                <div className="bg-secondary/60 rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Projected revenue: ~{estimatedDailyPlays.toLocaleString()} plays/day × 31 days × $0.10 = <span className="font-medium text-foreground">${(estimatedDailyPlays * 31 * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Revenue Split</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div><p className="text-[11px] text-muted-foreground mb-1">Skoop Share</p><Input placeholder="70%" className="w-full" /></div>
                  <div><p className="text-[11px] text-muted-foreground mb-1">Partner Share</p><Input placeholder="30%" className="w-full" /></div>
                </div>
              </div>
              <div><label className="text-xs text-muted-foreground">Billing Notes</label><Input placeholder="e.g. Net 30, invoice monthly" className="mt-1" /></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Campaign Summary</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Campaign</p><p className="text-sm font-medium">Nike Summer Push</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status="direct" /></div>
                <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">Nike Australia</p></div>
                <div><p className="text-xs text-muted-foreground">Ad Placements</p><p className="text-sm font-medium">{selectedPl ? selectedPl.name : "Lobby Screens — Main Loop"}</p></div>
                <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium tabular-nums">{selectedPl ? selectedPl.screens : 6} (via placement)</p></div>
                <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">Mar 1 – Mar 31</p></div>
                <div><p className="text-xs text-muted-foreground">Active Days</p><p className="text-sm font-medium">{activeDays.join(", ")}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">SoV {sov}%</p></div>
                <div><p className="text-xs text-muted-foreground">Creatives</p><p className="text-sm font-medium">3 assets (2 approved)</p></div>
                <div><p className="text-xs text-muted-foreground">Pricing</p><p className="text-sm font-medium">{pricingModel === "cpp" ? "Cost per Play" : pricingModel === "cpm" ? "CPM" : pricingModel === "flat" ? "Flat Fee" : "—"}</p></div>
              </div>
            </div>
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Estimated Delivery</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Total estimated opportunities</p><p className="text-sm font-medium tabular-nums">~{(estimatedDailyPlays * 31).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Per day estimate</p><p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} opp/day</p></div>
                <div><p className="text-xs text-muted-foreground">Inventory Fit</p><StatusChip status="healthy" label="Appears compatible" /></div>
                <div><p className="text-xs text-muted-foreground">Conflicts</p><p className="text-sm font-medium text-muted-foreground">None detected</p></div>
              </div>
              <div className="bg-secondary/50 rounded-md p-3 space-y-1 mt-2">
                <p className="text-xs text-muted-foreground">• Consumes ~{sov}% of eligible placement inventory</p>
                <p className="text-xs text-muted-foreground">• Estimated revenue: ${(estimatedDailyPlays * 31 * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })} at CPP $0.10</p>
                <p className="text-xs text-muted-foreground">• No under-delivery risk detected</p>
              </div>
            </div>
            {/* Warnings */}
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">Pre-flight check passed. Campaign is ready to launch.</p>
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
