import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MixBarProps {
  owned: number;
  direct: number;
  programmatic: number;
  height?: string;
  showLabels?: boolean;
  showHoverTooltip?: boolean;
}

export default function MixBar({ owned, direct, programmatic, height = "h-2", showLabels = false }: MixBarProps) {
  return (
    <div>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={`flex ${height} w-full rounded-full overflow-hidden bg-secondary cursor-default`}>
            {owned > 0 && (
              <div className="bg-skoop-slate transition-all" style={{ width: `${owned}%` }} />
            )}
            {direct > 0 && (
              <div className="bg-skoop-blue transition-all" style={{ width: `${direct}%` }} />
            )}
            {programmatic > 0 && (
              <div className="bg-skoop-purple transition-all" style={{ width: `${programmatic}%` }} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="px-3 py-2">
          <div className="flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-skoop-slate shrink-0" /> Owned {owned}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-skoop-blue shrink-0" /> Direct {direct}%
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
            <span className="w-2 h-2 rounded-full bg-skoop-slate" /> Owned {owned}%
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-skoop-blue" /> Direct {direct}%
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-skoop-purple" /> Programmatic {programmatic}%
          </span>
        </div>
      )}
    </div>
  );
}
