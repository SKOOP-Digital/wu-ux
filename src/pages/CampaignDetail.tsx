import { Megaphone, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const campaignData: Record<string, {
  name: string; type: string; advertiser: string; dates: string; dayparts: string;
  goal: string; delivered: number; target: number;
  status: string; sov: number;
  placements: { name: string; id: string; screens: number; venue: string }[];
  creatives: { name: string; type: string; status: string; duration: string }[];
}> = {
  "1": {
    name: "Pepsi Q2 Push", type: "Direct", advertiser: "PepsiCo",
    dates: "Apr 1 – Jun 30", dayparts: "All Day", goal: "SoV 40%",
    delivered: 3200, target: 5000, status: "Live", sov: 40,
    placements: [
      { name: "Financial Banks · Northeast", id: "pl-1", screens: 480, venue: "Northeast" },
      { name: "Urban Panels · National", id: "pl-2", screens: 652, venue: "National" },
    ],
    creatives: [
      { name: "Pepsi_Q2_16x9.mp4", type: "Video", status: "Approved", duration: "15s" },
      { name: "Pepsi_Logo_Static.jpg", type: "Image", status: "Approved", duration: "10s" },
    ],
  },
  "2": {
    name: "Nike Spring", type: "Direct", advertiser: "Nike",
    dates: "Mar 1 – May 31", dayparts: "All Day", goal: "5,000 plays",
    delivered: 3100, target: 5000, status: "Live", sov: 13,
    placements: [{ name: "Convenience Stores · Midwest & South", id: "pl-3", screens: 411, venue: "Midwest & South" }],
    creatives: [{ name: "Nike_Spring_16x9.mp4", type: "Video", status: "Approved", duration: "15s" }],
  },
  "3": {
    name: "WU Brand Awareness", type: "Marketing", advertiser: "Western Union",
    dates: "Jan 1 – Dec 31", dayparts: "All Day", goal: "SoV 50%",
    delivered: 48000, target: 50000, status: "Live", sov: 50,
    placements: [
      { name: "Financial Banks · Northeast", id: "pl-1", screens: 480, venue: "Northeast" },
      { name: "Financial Banks · Southwest & Rocky Mountain", id: "pl-6", screens: 709, venue: "Southwest" },
    ],
    creatives: [
      { name: "WU_Brand_16x9.mp4", type: "Video", status: "Approved", duration: "15s" },
      { name: "WU_Remittance_Static.jpg", type: "Image", status: "Approved", duration: "10s" },
    ],
  },
  "4": {
    name: "Coca-Cola Summer", type: "Direct", advertiser: "Coca-Cola",
    dates: "May 1 – Aug 31", dayparts: "11am–9pm", goal: "SoV 20%",
    delivered: 0, target: 4000, status: "Scheduled", sov: 20,
    placements: [{ name: "Grocery Retail · West Coast", id: "pl-4", screens: 377, venue: "West Coast" }],
    creatives: [{ name: "CocaCola_Summer.mp4", type: "Video", status: "Pending", duration: "15s" }],
  },
  "5": {
    name: "WU Remittance Promo", type: "Direct", advertiser: "Western Union",
    dates: "Mar 1 – Mar 31", dayparts: "8am–6pm", goal: "3,000 plays",
    delivered: 1200, target: 3000, status: "Under-delivering", sov: 10,
    placements: [{ name: "Pharmacies · National", id: "pl-5", screens: 71, venue: "National" }],
    creatives: [{ name: "WU_Remit_Promo.mp4", type: "Video", status: "Approved", duration: "15s" }],
  },
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const campaign = id ? campaignData[id] : null;

  if (!campaign) {
    return (
      <div>
        <PageHeader title="Campaign Not Found" subtitle="This campaign does not exist" icon={<Megaphone size={20} />} />
        <div className="p-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  const pct = campaign.target > 0 ? Math.round((campaign.delivered / campaign.target) * 100) : 0;

  return (
    <div>
      <div className="px-8 pt-4 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/campaigns">Campaigns</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{campaign.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={campaign.name}
        subtitle={`Campaign · ${campaign.type} · ${campaign.advertiser}`}
        icon={<Megaphone size={20} />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}><ArrowLeft size={14} className="mr-1" /> Back</Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Campaign Summary</p>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status={campaign.type.toLowerCase()} /></div>
                <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{campaign.advertiser}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status={campaign.status.toLowerCase().replace(" ", "-")} label={campaign.status} /></div>
                <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">{campaign.dates}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{campaign.dayparts}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium">{campaign.goal}</p></div>
              </div>
            </div>

            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">This campaign runs on</p>
              <p className="text-xs text-muted-foreground">Network rules that provide inventory for this campaign</p>
              <div className="space-y-2">
                {campaign.placements.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-3 px-4 border border-border rounded-md hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/placements/${p.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.screens} screens · {p.venue}</p>
                      </div>
                    </div>
                    <span className="text-xs text-primary">View Rule</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Delivery Progress</p>
              <div className="flex items-center gap-4">
                <Progress value={pct} className="h-2 flex-1" />
                <span className="text-sm font-medium tabular-nums">{pct}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Delivered</p><p className="text-sm font-semibold tabular-nums">{campaign.delivered.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-semibold tabular-nums">{campaign.target.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Pacing</p><StatusChip status={pct >= 60 ? "healthy" : "at-risk"} label={pct >= 60 ? "On Track" : "Behind Pace"} /></div>
              </div>
            </div>

            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Creatives</p>
              <div className="space-y-2">
                {campaign.creatives.map((c) => (
                  <div key={c.name} className="flex items-center justify-between py-2 px-3 border border-border rounded-md">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.type} · {c.duration}</p>
                    </div>
                    <StatusChip status={c.status.toLowerCase()} label={c.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Delivery Summary</p>
              <div><p className="text-xs text-muted-foreground">Share of Voice</p><p className="text-sm font-medium tabular-nums">{campaign.sov}%</p></div>
              <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium">{campaign.goal}</p></div>
              <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{campaign.dayparts}</p></div>
            </div>
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Quick Links</p>
              {campaign.placements.map((p) => (
                <button key={p.id} onClick={() => navigate(`/placements/${p.id}`)} className="flex items-center gap-2 text-xs text-primary hover:underline w-full">
                  <MapPin size={12} /> {p.name}
                </button>
              ))}
              <button onClick={() => navigate("/proof-of-play")} className="flex items-center gap-2 text-xs text-primary hover:underline w-full">
                <ExternalLink size={12} /> Proof of Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
