interface MixBarProps {
  owned: number;
  direct: number;
  programmatic: number;
  height?: string;
  showLabels?: boolean;
}

export default function MixBar({ owned, direct, programmatic, height = "h-2", showLabels = false }: MixBarProps) {
  return (
    <div>
      <div className={`flex ${height} w-full rounded-full overflow-hidden bg-secondary`}>
        {owned > 0 && (
          <div className="bg-skoop-slate transition-all" style={{ width: `${owned}%` }} title={`Owned ${owned}%`} />
        )}
        {direct > 0 && (
          <div className="bg-skoop-blue transition-all" style={{ width: `${direct}%` }} title={`Direct ${direct}%`} />
        )}
        {programmatic > 0 && (
          <div className="bg-skoop-purple transition-all" style={{ width: `${programmatic}%` }} title={`Programmatic ${programmatic}%`} />
        )}
      </div>
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
