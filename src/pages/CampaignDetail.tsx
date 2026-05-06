import { Megaphone, ArrowLeft, Monitor, ExternalLink } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

// deliveryTarget: null = house fill
const campaignData: Record<string, {
  name: string; deliveryTarget: number | null; advertiser: string; dates: string; dayparts: string;
  goal: string; delivered: number; target: number | null;
  status: string; sov: number | null;
  screens: { count: number; venues: string; tags: string[] };
  creatives: { name: string; type: string; status: string; duration: string }[];
}> = {
  "1": {
    name: "Pepsi Q2 Push", deliveryTarget: 5000, advertiser: "PepsiCo",
    dates: "Apr 1 – Jun 30", dayparts: "All Day", goal: "5,000 plays",
    delivered: 3200, target: 5000, status: "Live", sov: null,
    screens: { count: 1132, venues: "Northeast, National", tags: ["venue:financial.banks", "region:northeast", "region:national"] },
    creatives: [
      { name: "Pepsi_Q2_16x9.mp4", type: "Video", status: "Approved", duration: "15s" },
      { name: "Pepsi_Logo_Static.jpg", type: "Image", status: "Approved", duration: "10s" },
    ],
  },
  "2": {
    name: "Nike Spring", deliveryTarget: 5000, advertiser: "Nike",
    dates: "Mar 1 – May 31", dayparts: "All Day", goal: "5,000 plays",
    delivered: 3100, target: 5000, status: "Live", sov: null,
    screens: { count: 411, venues: "Midwest & South", tags: ["region:midwest", "region:south"] },
    creatives: [{ name: "Nike_Spring_16x9.mp4", type: "Video", status: "Approved", duration: "15s" }],
  },
  "3": {
    name: "WU Brand Awareness", deliveryTarget: null, advertiser: "Western Union",
    dates: "Jan 1 –", dayparts: "All Day", goal: "House fill",
    delivered: 48000, target: null, status: "Live", sov: null,
    screens: { count: 1189, venues: "Northeast, Southwest", tags: ["venue:financial.banks"] },
    creatives: [
      { name: "WU_Brand_16x9.mp4", type: "Video", status: "Approved", duration: "15s" },
      { name: "WU_Remittance_Static.jpg", type: "Image", status: "Approved", duration: "10s" },
    ],
  },
  "4": {
    name: "Coca-Cola Summer", deliveryTarget: 4000, advertiser: "Coca-Cola",
    dates: "May 1 – Aug 31", dayparts: "11am–9pm", goal: "4,000 plays",
    delivered: 0, target: 4000, status: "Scheduled", sov: null,
    screens: { count: 377, venues: "West Coast", tags: ["region:west-coast"] },
    creatives: [{ name: "CocaCola_Summer.mp4", type: "Video", status: "Pending", duration: "15s" }],
  },
  "5": {
    name: "WU Remittance Promo", deliveryTarget: 3000, advertiser: "Western Union",
    dates: "Mar 1 – Mar 31", dayparts: "8am–6pm", goal: "3,000 plays",
    delivered: 1200, target: 3000, status: "Under-delivering", sov: null,
    screens: { count: 71, venues: "National", tags: ["venue:pharmacies"] },
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

  const isHouseFill = campaign.deliveryTarget === null;
  const pct = campaign.target && campaign.target > 0 ? Math.round((campaign.delivered / campaign.target) * 100) : null;

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
        subtitle={`Campaign · ${isHouseFill ? "House Fill" : "Sold"} · ${campaign.advertiser}`}
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
                <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status={isHouseFill ? "house-fill" : "sold"} label={isHouseFill ? "House Fill" : "Sold"} /></div>
                <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{campaign.advertiser}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status={campaign.status.toLowerCase().replace(" ", "-")} label={campaign.status} /></div>
                <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">{campaign.dates}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{campaign.dayparts}</p></div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Target</p>
                  <p className="text-sm font-medium">{isHouseFill ? <span className="text-muted-foreground italic">None — house fill</span> : campaign.goal}</p>
                </div>
              </div>            </div>

            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Targeted Screens</p>
              <div className="flex items-center gap-4 py-3 px-4 rounded-md bg-secondary/50">
                <Monitor size={16} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-semibold tabular-nums">{campaign.screens.count.toLocaleString()} screens</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{campaign.screens.venues}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {campaign.screens.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>

            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Delivery Progress</p>
              {isHouseFill ? (
                <div className="flex items-center gap-3 py-3 px-4 rounded-md bg-secondary/50">
                  <StatusChip status="house-fill" label="House Fill" />
                  <p className="text-sm text-muted-foreground">No delivery target — this campaign fills remaining slots continuously.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Progress value={pct ?? 0} className="h-2 flex-1" />
                    <span className="text-sm font-medium tabular-nums">{pct}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-muted-foreground">Delivered</p><p className="text-sm font-semibold tabular-nums">{campaign.delivered.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-semibold tabular-nums">{campaign.target?.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Pacing</p><StatusChip status={(pct ?? 0) >= 60 ? "healthy" : "at-risk"} label={(pct ?? 0) >= 60 ? "On Track" : "Behind Pace"} /></div>
                  </div>
                </>
              )}
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
              <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium">{isHouseFill ? "None (house fill)" : campaign.goal}</p></div>
              <div><p className="text-xs text-muted-foreground">Screens Targeted</p><p className="text-sm font-medium tabular-nums">{campaign.screens.count.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Active Hours</p><p className="text-sm font-medium">{campaign.dayparts}</p></div>
            </div>
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Quick Links</p>
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
