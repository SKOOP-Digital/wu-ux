import { BarChart3 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Screen and content performance analytics" icon={<BarChart3 size={20} />} />
      <div className="p-8">
        <div className="text-sm text-muted-foreground text-center py-16">Analytics dashboard coming soon.</div>
      </div>
    </div>
  );
}
