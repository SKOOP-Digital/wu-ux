import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Megaphone, ArrowLeft, ArrowRight, Check, Info, AlertTriangle, Briefcase, Home, Radio } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

type CampaignType = "direct" | "owned" | "programmatic" | "";

const STEPS_DIRECT = ["Campaign Details", "Schedule", "How Much It Plays", "Creatives", "Pricing & Billing", "Review & Launch"];
const STEPS_OWNED = ["Campaign Details", "Schedule", "How Much It Plays", "Assets & Launch"];
const STEPS_PROGRAMMATIC = ["Campaign Details", "Active Hours", "Launch"];

const placementOptions = [
  { value: "lobby", name: "Lobby Screens — Main Loop", screens: 6, venue: "Westfield Sydney", model: "Loop", dayparts: "All Day", utilisation: 82, availableDaily: 1440, owned: 50, direct: 30, prog: 20 },
  { value: "food", name: "Food Court Digital Menu Boards", screens: 4, venue: "Melbourne Central", model: "Ad-break", dayparts: "11am–9pm", utilisation: 88, availableDaily: 960, owned: 40, direct: 40, prog: 20 },
  { value: "elevator", name: "Elevator Portrait Panels", screens: 4, venue: "Brisbane CBD Tower", model: "Loop", dayparts: "7am–7pm", utilisation: 58, availableDaily: 1920, owned: 60, direct: 25, prog: 15 },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [campaignType, setCampaignType] = useState<CampaignType>("");
  const [step, setStep] = useState(0);
  const [sov, setSov] = useState(13);
  const [ownedPct, setOwnedPct] = useState(50);
  const [deliveryMode, setDeliveryMode] = useState<"sov" | "pph">("sov");
  const [selectedPlacement, setSelectedPlacement] = useState("");
  const [pricingModel, setPricingModel] = useState("");
  const [activeDays, setActiveDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const steps = useMemo(() => {
    if (campaignType === "direct") return STEPS_DIRECT;
    if (campaignType === "owned") return STEPS_OWNED;
    if (campaignType === "programmatic") return STEPS_PROGRAMMATIC;
    return STEPS_DIRECT;
  }, [campaignType]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const selectedPl = placementOptions.find((p) => p.value === selectedPlacement);

  const placementLoopsPerHour = selectedPl ? Math.round(selectedPl.availableDaily / 16) : 90;
  const estimatedPlaysPerHour = Math.round(placementLoopsPerHour * sov / 100);
  const estimatedDailyPlays = estimatedPlaysPerHour * 16;

  const toggleDay = (d: string) => {
    setActiveDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const typeCards: { type: CampaignType; icon: typeof Briefcase; label: string; desc: string }[] = [
    { type: "direct", icon: Briefcase, label: "Direct Ad", desc: "Booked campaigns with advertisers — full delivery rules, creatives, and billing" },
    { type: "owned", icon: Home, label: "In-House Content", desc: "Your own brand content with guaranteed screen time — simplified setup" },
    { type: "programmatic", icon: Radio, label: "Programmatic", desc: "Automated ads via demand partners — minimal configuration needed" },
  ];

  // Capacity panel data
  const capacityPanel = useMemo(() => {
    if (!selectedPl) return null;
    const total = selectedPl.availableDaily;
    const bucketPct = campaignType === "direct" ? selectedPl.direct : campaignType === "owned" ? selectedPl.owned : selectedPl.prog;
    const bucketCap = Math.round(total * bucketPct / 100);
    const booked = Math.round(bucketCap * selectedPl.utilisation / 100);
    const available = bucketCap - booked;
    let estimate = 0;
    if (campaignType === "direct") estimate = estimatedDailyPlays;
    else if (campaignType === "owned") estimate = Math.round(total * ownedPct / 100);
    else estimate = Math.round(total * selectedPl.prog / 100);
    const fits = estimate <= available;
    return { total, bucketCap, booked, available, estimate, fits };
  }, [selectedPl, campaignType, estimatedDailyPlays, ownedPct]);

  // ====== Render current step based on campaign type ======

  const renderStep0 = () => (
    <div className="space-y-5">
      {/* Type selection cards — always first and prominent */}
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Type</p>
        <p className="text-xs text-muted-foreground">Choose the type of campaign. This determines what steps you'll configure.</p>
        <div className="grid grid-cols-3 gap-3">
          {typeCards.map((tc) => (
            <button
              key={tc.type}
              onClick={() => { setCampaignType(tc.type); setStep(0); }}
              className={`text-left rounded-lg border-2 p-4 transition-all ${
                campaignType === tc.type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                campaignType === tc.type ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                <tc.icon size={18} />
              </div>
              <p className="text-sm font-semibold text-foreground">{tc.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Campaign details fields */}
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Details</p>
        <p className="text-xs text-muted-foreground">Campaigns define what content runs and how it is delivered across your network rules.</p>
        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Campaign Name</label><Input placeholder="e.g. Nike Summer Push" className="mt-1" /></div>
          {campaignType !== "owned" && (
            <div><label className="text-xs text-muted-foreground">Advertiser / Partner</label><Input placeholder="e.g. Nike Australia" className="mt-1" /></div>
          )}
          <div><label className="text-xs text-muted-foreground">Objective</label><Input placeholder="e.g. Brand awareness, product launch" className="mt-1" /></div>
          <div>
            <label className="text-xs text-muted-foreground">Network Rule</label>
            <p className="text-[11px] text-muted-foreground mt-0.5 mb-1">Select which network rule this campaign will run on. Rules define the available inventory on your screens.</p>
            <Select value={selectedPlacement} onValueChange={setSelectedPlacement}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select network rule" /></SelectTrigger>
              <SelectContent>
                {placementOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.name} ({p.screens} screens · {p.venue})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedPl && (
        <div className="skoop-card p-5 space-y-3">
          <p className="skoop-section-header">Selected Rule Preview</p>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium">{selectedPl.screens} screens · {selectedPl.venue}</p></div>
            <div><p className="text-xs text-muted-foreground">Model</p><p className="text-sm font-medium">{selectedPl.model}-based</p></div>
            <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{selectedPl.dayparts}</p></div>
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
  );

  const renderSchedule = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Schedule</p>
      <p className="text-xs text-muted-foreground">Campaign only competes for inventory during selected days and active hours.</p>
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
      <div><label className="text-xs text-muted-foreground">Active Hours</label>
        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select active hours" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Day</SelectItem><SelectItem value="morning">Morning (6am–11am)</SelectItem><SelectItem value="midday">Midday (11am–2pm)</SelectItem><SelectItem value="afternoon">Afternoon (2pm–5pm)</SelectItem><SelectItem value="evening">Evening (5pm–9pm)</SelectItem></SelectContent>
        </Select>
      </div>
      <div><label className="text-xs text-muted-foreground">Timezone</label>
        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select timezone" /></SelectTrigger>
          <SelectContent><SelectItem value="aest">AEST (UTC+10)</SelectItem><SelectItem value="awst">AWST (UTC+8)</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderDeliveryDirect = () => (
    <div className="skoop-card p-5 space-y-5">
      <p className="skoop-section-header">How Much It Plays</p>
      <p className="text-xs text-muted-foreground">Define how this campaign's content is delivered across the selected rule.</p>
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
                <p className="text-[11px] text-muted-foreground">Eligible rule capacity</p>
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
  );

  const renderDeliveryOwned = () => (
    <div className="skoop-card p-5 space-y-5">
      <p className="skoop-section-header">How Much It Plays</p>
      <p className="text-xs text-muted-foreground">Set the percentage of screen time this in-house content should receive.</p>
      <div className="space-y-3">
        <div className="flex justify-between text-sm"><span>% of Screen Time</span><span className="font-medium tabular-nums">{ownedPct}%</span></div>
        <Slider value={[ownedPct]} onValueChange={([v]) => setOwnedPct(v)} max={100} step={5} />
        {selectedPl && (
          <div className="bg-secondary rounded-md p-3">
            <p className="text-xs text-muted-foreground">~{Math.round(selectedPl.availableDaily * ownedPct / 100).toLocaleString()} playback opportunities/day at {ownedPct}% of total capacity</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreatives = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">{campaignType === "owned" ? "Assets" : "Creatives"}</p>
      <p className="text-xs text-muted-foreground">{campaignType === "owned" ? "Attach media assets for this content." : "Attach media assets for this campaign. Creatives must be approved before launch."}</p>
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
      <Button variant="outline" size="sm">+ Add {campaignType === "owned" ? "Asset" : "Creative"}</Button>
    </div>
  );

  const renderPricing = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Pricing & Billing</p>
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
  );

  const renderReview = () => (
    <div className="space-y-4">
      <div className="skoop-card p-5 space-y-4">
        <p className="skoop-section-header">Campaign Summary</p>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground">Campaign</p><p className="text-sm font-medium">Nike Summer Push</p></div>
          <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status={campaignType || "direct"} /></div>
          {campaignType !== "owned" && (
            <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">Nike Australia</p></div>
          )}
          <div><p className="text-xs text-muted-foreground">Network Rule</p><p className="text-sm font-medium">{selectedPl ? selectedPl.name : "Lobby Screens — Main Loop"}</p></div>
          <div><p className="text-xs text-muted-foreground">Screens</p><p className="text-sm font-medium tabular-nums">{selectedPl ? selectedPl.screens : 6} (via rule)</p></div>
          <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">Mar 1 – Mar 31</p></div>
          <div><p className="text-xs text-muted-foreground">Active Days</p><p className="text-sm font-medium">{activeDays.join(", ")}</p></div>
          <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium tabular-nums">{campaignType === "owned" ? `${ownedPct}% screen time` : `SoV ${sov}%`}</p></div>
          {campaignType === "direct" && (
            <>
              <div><p className="text-xs text-muted-foreground">Creatives</p><p className="text-sm font-medium">3 assets (2 approved)</p></div>
              <div><p className="text-xs text-muted-foreground">Pricing</p><p className="text-sm font-medium">{pricingModel === "cpp" ? "Cost per Play" : pricingModel === "cpm" ? "CPM" : pricingModel === "flat" ? "Flat Fee" : "—"}</p></div>
            </>
          )}
        </div>
      </div>
      <div className="skoop-card p-5 space-y-3">
        <p className="skoop-section-header">Estimated Delivery</p>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground">Total estimated opportunities</p><p className="text-sm font-medium tabular-nums">~{(estimatedDailyPlays * 31).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Per day estimate</p><p className="text-sm font-medium tabular-nums">~{estimatedDailyPlays.toLocaleString()} opp/day</p></div>
          <div><p className="text-xs text-muted-foreground">Inventory Fit</p><StatusChip status="healthy" label="Compatible" /></div>
          <div><p className="text-xs text-muted-foreground">Conflicts</p><p className="text-sm font-medium text-muted-foreground">None detected</p></div>
        </div>
        <div className="bg-secondary/50 rounded-md p-3 space-y-1 mt-2">
          <p className="text-xs text-muted-foreground">• Consumes ~{campaignType === "owned" ? ownedPct : sov}% of eligible rule inventory</p>
          {campaignType === "direct" && (
            <p className="text-xs text-muted-foreground">• Estimated revenue: ${(estimatedDailyPlays * 31 * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })} at CPP $0.10</p>
          )}
          <p className="text-xs text-muted-foreground">• No under-delivery risk detected</p>
        </div>
      </div>
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
        <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-700">Pre-flight check passed. Campaign is ready to launch.</p>
      </div>
    </div>
  );

  const renderActiveHoursProgrammatic = () => (
    <div className="skoop-card p-5 space-y-4">
      <p className="skoop-section-header">Active Hours</p>
      <p className="text-xs text-muted-foreground">Define when this programmatic campaign is eligible to receive bids.</p>
      <div><label className="text-xs text-muted-foreground">Active Hours</label>
        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select active hours" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Day</SelectItem><SelectItem value="morning">Morning (6am–11am)</SelectItem><SelectItem value="midday">Midday (11am–2pm)</SelectItem><SelectItem value="afternoon">Afternoon (2pm–5pm)</SelectItem><SelectItem value="evening">Evening (5pm–9pm)</SelectItem></SelectContent>
        </Select>
      </div>
      <div><label className="text-xs text-muted-foreground">Timezone</label>
        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select timezone" /></SelectTrigger>
          <SelectContent><SelectItem value="aest">AEST (UTC+10)</SelectItem><SelectItem value="awst">AWST (UTC+8)</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );

  // Map step index to render function based on campaign type
  const renderCurrentStep = () => {
    if (campaignType === "direct") {
      if (step === 0) return renderStep0();
      if (step === 1) return renderSchedule();
      if (step === 2) return renderDeliveryDirect();
      if (step === 3) return renderCreatives();
      if (step === 4) return renderPricing();
      if (step === 5) return renderReview();
    } else if (campaignType === "owned") {
      if (step === 0) return renderStep0();
      if (step === 1) return renderSchedule();
      if (step === 2) return renderDeliveryOwned();
      if (step === 3) {
        return (
          <div className="space-y-5">
            {renderCreatives()}
            {renderReview()}
          </div>
        );
      }
    } else if (campaignType === "programmatic") {
      if (step === 0) return renderStep0();
      if (step === 1) return renderActiveHoursProgrammatic();
      if (step === 2) return renderReview();
    }
    return renderStep0();
  };

  const isLastStep = step === steps.length - 1;
  const launchLabel = campaignType === "owned" ? "Launch Content" : "Launch Campaign";

  return (
    <div>
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

      <div className="p-8">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" size="sm" onClick={prev} disabled={step === 0}><ArrowLeft size={14} className="mr-1" /> Previous</Button>
              {!isLastStep ? (
                <Button size="sm" onClick={next} disabled={!campaignType}>Next <ArrowRight size={14} className="ml-1" /></Button>
              ) : (
                <Button size="sm" onClick={() => navigate("/campaigns")}>{launchLabel}</Button>
              )}
            </div>
          </div>

          {/* Right-side capacity indicator panel */}
          {selectedPl && capacityPanel && (
            <div className="w-72 shrink-0 space-y-4">
              <div className="skoop-card p-5 space-y-3 sticky top-8">
                <p className="skoop-section-header">Capacity Indicator</p>
                <p className="text-[11px] text-muted-foreground">Live capacity from selected network rule</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Rule Capacity</span><span className="font-medium tabular-nums">{capacityPanel.total.toLocaleString()}/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{campaignType === "direct" ? "Direct" : campaignType === "owned" ? "Owned" : "Programmatic"} Bucket</span><span className="font-medium tabular-nums">{capacityPanel.bucketCap.toLocaleString()}/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Already Booked</span><span className="font-medium tabular-nums">{capacityPanel.booked.toLocaleString()}/day</span></div>
                  <div className="flex justify-between text-sm"><span className="text-primary font-medium">Available</span><span className="font-medium tabular-nums text-primary">{capacityPanel.available.toLocaleString()}/day</span></div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${capacityPanel.bucketCap > 0 ? Math.round((capacityPanel.booked / capacityPanel.bucketCap) * 100) : 0}%` }} />
                </div>
                {step > 0 && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">This Campaign</span><span className="font-medium tabular-nums">~{capacityPanel.estimate.toLocaleString()}/day</span></div>
                    <div className="flex items-center gap-2">
                      {capacityPanel.fits ? (
                        <StatusChip status="healthy" label="Compatible" />
                      ) : (
                        <StatusChip status="at-risk" label="May exceed capacity" />
                      )}
                    </div>
                    {!capacityPanel.fits && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-700">Estimated delivery exceeds available capacity in the {campaignType} bucket.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
