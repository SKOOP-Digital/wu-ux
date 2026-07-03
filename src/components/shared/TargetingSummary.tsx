import { formatTargetingSummary, getFieldLabel, type TargetingRules } from "@/data/targeting";

interface TargetingSummaryProps {
  targeting: TargetingRules;
  compact?: boolean;
}

export default function TargetingSummary({ targeting, compact }: TargetingSummaryProps) {
  const lines = formatTargetingSummary(targeting);
  const hasContent = lines.some((l) => !l.includes("No conditions"));

  if (!hasContent) {
    return <p className="text-sm text-muted-foreground">No targeting rules configured</p>;
  }

  if (compact) {
    return (
      <div className="space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-xs text-foreground">
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {targeting.rules.map((rule, ruleIndex) => {
        const active = rule.conditions.filter((c) => c.value.trim() !== "");
        const excl = rule.exclude.filter((c) => c.value.trim() !== "");
        if (active.length === 0) return null;
        return (
          <div key={rule.id} className="rounded-md border border-border px-3 py-2 space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Rule {ruleIndex + 1} — {rule.matchType}
            </p>
            <div className="flex flex-wrap gap-1">
              {active.map((c, i) => (
                <span
                  key={`${rule.id}-c-${i}`}
                  className="px-2 py-0.5 rounded-full text-xs bg-secondary border border-border"
                >
                  {getFieldLabel(c.key)} = {c.value}
                </span>
              ))}
            </div>
            {excl.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-muted-foreground uppercase">Exclude:</span>
                {excl.map((c, i) => (
                  <span
                    key={`${rule.id}-e-${i}`}
                    className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 border border-destructive/20 text-destructive"
                  >
                    {getFieldLabel(c.key)} = {c.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {targeting.globalExclusions.filter((c) => c.value.trim()).length > 0 && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-xs font-semibold text-destructive mb-1">Global exclusions</p>
          <div className="flex flex-wrap gap-1">
            {targeting.globalExclusions
              .filter((c) => c.value.trim())
              .map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-destructive/30">
                  {getFieldLabel(c.key)} = {c.value}
                </span>
              ))}
          </div>
        </div>
      )}
      {targeting.proximity?.pois?.length ? (
        <p className="text-xs text-muted-foreground">
          Proximity: {targeting.proximity.activeQuery} ({targeting.proximity.radiusMiles} mi)
        </p>
      ) : null}
    </div>
  );
}
