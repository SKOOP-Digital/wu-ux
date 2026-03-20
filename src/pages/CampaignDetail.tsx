import { Megaphone, ArrowLeft, MapPin, Monitor, ExternalLink } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/shared/StatusChip";
import MixBar from "@/components/shared/MixBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

// Mock campaign data keyed by id
const campaignData: Record<string, {
  name: string; type: string; advertiser: string; dates: string; dayparts: string;
  goal: string; delivered: number; target: number; revenue: string; pricingModel: string;
  status: string; sov: number;
  placements: { name: string; id: string; screens: number; venue: string }[];
  creatives: { name: string; type: string; status: string; duration: string }[];
}> = {
  "1": {
    name: "Nike Summer Push", type: "Direct", advertiser: "Nike Australia",
    dates: "Mar 1 – Mar 31", dayparts: "All Day", goal: "5,000 plays",
    delivered: 3100, target: 5000, revenue: "$8,400", pricingModel: "CPP", status: "Live", sov: 13,
    placements: [
      { name: "Lobby Screens — Main Loop", id: "pl-1", screens: 6, venue: "Westfield Sydney" },
      { name: "Concourse Video Wall", id: "pl-5", screens: 1, venue: "Westfield Sydney" },
    ],
    creatives: [
      { name: "Nike_Summer_16x9.mp4", type: "Video", status: "Approved", duration: "15s" },
      { name: "Nike_Logo_Static.jpg", type: "Image", status: "Approved", duration: "10s" },
    ],
  },
  "2": {
    name: "Coca-Cola Lobby Spots", type: "Direct", advertiser: "Coca-Cola",
    dates: "Mar 5 – Apr 5", dayparts: "11am–9pm", goal: "SoV 15%",
    delivered: 1800, target: 2500, revenue: "$4,200", pricingModel: "CPP", status: "Under-delivering", sov: 15,
    placements: [{ name: "Food Court Digital Menu Boards", id: "pl-2", screens: 4, venue: "Melbourne Central" }],
    creatives: [{ name: "CocaCola_Summer.mp4", type: "Video", status: "Approved", duration: "15s" }],
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
            {/* Summary */}
            <div className="skoop-card p-5 space-y-4">
              <p className="skoop-section-header">Campaign Summary</p>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Type</p><StatusChip status={campaign.type.toLowerCase()} /></div>
                <div><p className="text-xs text-muted-foreground">Advertiser</p><p className="text-sm font-medium">{campaign.advertiser}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusChip status={campaign.status.toLowerCase().replace(" ", "-")} label={campaign.status} /></div>
                <div><p className="text-xs text-muted-foreground">Dates</p><p className="text-sm font-medium">{campaign.dates}</p></div>
                <div><p className="text-xs text-muted-foreground">Dayparts</p><p className="text-sm font-medium">{campaign.dayparts}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery Target</p><p className="text-sm font-medium">{campaign.goal}</p></div>
              </div>
            </div>

            {/* Ad Placements */}
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">This campaign runs on</p>
              <p className="text-xs text-muted-foreground">Ad placements that provide inventory for this campaign</p>
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
                    <span className="text-xs text-primary">View Placement</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
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

            {/* Creatives */}
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

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="skoop-card p-5 space-y-3">
              <p className="skoop-section-header">Commercials</p>
              <div><p className="text-xs text-muted-foreground">Pricing Model</p><p className="text-sm font-medium">{campaign.pricingModel}</p></div>
              <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-semibold tabular-nums">{campaign.revenue}</p></div>
              <div><p className="text-xs text-muted-foreground">SoV</p><p className="text-sm font-medium tabular-nums">{campaign.sov}%</p></div>
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
