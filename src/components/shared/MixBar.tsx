import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MixBarProps {
  houseFill: number;
  sold: number;
  programmatic: number;
  height?: string;
  showLabels?: boolean;
  showHoverTooltip?: boolean;
}

export default function MixBar({ houseFill, sold, programmatic, height = "h-2", showLabels = false }: MixBarProps) {
  return (
    <div>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={`flex ${height} w-full rounded-full overflow-hidden bg-secondary cursor-default`}>
            {houseFill > 0 && (
              <div className="bg-skoop-slate transition-all" style={{ width: `${houseFill}%` }} />
            )}
            {sold > 0 && (
              <div className="bg-skoop-blue transition-all" style={{ width: `${sold}%` }} />
            )}
            {programmatic > 0 && (
              <div className="bg-skoop-purple transition-all" style={{ width: `${programmatic}%` }} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="px-3 py-2">
          <div className="flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-skoop-slate shrink-0" /> House Fill {houseFill}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-skoop-blue shrink-0" /> Sold {sold}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-skoop-purple shrink-0" /> Programmatic {programmatic}%
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
      {showLabels && (
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-skoop-slate" /> House Fill {houseFill}%
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-skoop-blue" /> Sold {sold}%
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-skoop-purple" /> Programmatic {programmatic}%
          </span>
        </div>
      )}
    </div>
  );
}
