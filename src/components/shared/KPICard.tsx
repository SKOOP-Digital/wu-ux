import { ReactNode } from "react";

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}

export default function KPICard({ label, value, change, changeType = "neutral", icon }: KPICardProps) {
  const changeColor = changeType === "positive" ? "text-skoop-green" : changeType === "negative" ? "text-skoop-risk" : "text-muted-foreground";

  return (
    <div className="skoop-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="skoop-kpi-value">{value}</div>
      {change && (
        <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
      )}
    </div>
  );
}
