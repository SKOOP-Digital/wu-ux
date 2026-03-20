import { Image } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function Media() {
  return (
    <div>
      <PageHeader title="Media" subtitle="Manage your media library" icon={<Image size={20} />} />
      <div className="p-8">
        <div className="text-sm text-muted-foreground text-center py-16">Media library coming soon.</div>
      </div>
    </div>
  );
}
