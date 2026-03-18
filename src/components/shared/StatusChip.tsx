const variants: Record<string, string> = {
  healthy: "bg-skoop-aqua-light text-skoop-aqua",
  live: "bg-skoop-aqua-light text-skoop-aqua",
  active: "bg-skoop-aqua-light text-skoop-aqua",
  completed: "bg-secondary text-muted-foreground",
  draft: "bg-secondary text-muted-foreground",
  paused: "bg-skoop-amber-light text-skoop-amber",
  scheduled: "bg-skoop-blue-light text-skoop-blue",
  "at-risk": "bg-skoop-risk-light text-skoop-risk animate-pulse-risk",
  overbooked: "bg-skoop-risk-light text-skoop-risk animate-pulse-risk",
  "under-delivering": "bg-skoop-amber-light text-skoop-amber",
  "over-delivering": "bg-skoop-blue-light text-skoop-blue",
  offline: "bg-skoop-risk-light text-skoop-risk",
  online: "bg-skoop-aqua-light text-skoop-aqua",
  played: "bg-skoop-aqua-light text-skoop-aqua",
  skipped: "bg-skoop-amber-light text-skoop-amber",
  failed: "bg-skoop-risk-light text-skoop-risk",
  backfilled: "bg-skoop-purple-light text-skoop-purple",
  "no-fill": "bg-secondary text-muted-foreground",
  pending: "bg-skoop-amber-light text-skoop-amber",
  approved: "bg-skoop-aqua-light text-skoop-aqua",
  rejected: "bg-skoop-risk-light text-skoop-risk",
  owned: "bg-skoop-slate-light text-skoop-slate",
  direct: "bg-skoop-blue-light text-skoop-blue",
  programmatic: "bg-skoop-purple-light text-skoop-purple",
  loop: "bg-secondary text-muted-foreground",
  "ad-break": "bg-skoop-blue-light text-skoop-blue",
};

interface StatusChipProps {
  status: string;
  label?: string;
}

export default function StatusChip({ status, label }: StatusChipProps) {
  const key = status.toLowerCase();
  const cls = variants[key] || "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${cls}`}>
      {label || status}
    </span>
  );
}
