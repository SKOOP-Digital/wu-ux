import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { suggestPOIs, type POISuggestion } from "@/services/foursquareService";
import { allScreens } from "@/data/screens";

interface POIAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (name: string) => void;
  placeholder?: string;
  className?: string;
}

export default function POIAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. Walmart, CVS, Chase Bank...",
  className,
}: POIAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<POISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const results = await suggestPOIs(query.trim(), allScreens);
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion: POISuggestion) => {
    onChange(suggestion.name);
    setOpen(false);
    setSuggestions([]);
    onSelect(suggestion.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(value);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0) {
        handleSelect(suggestions[highlightIndex]);
      } else {
        setOpen(false);
        onSelect(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className={className}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
          />
          {loading && (
            <Loader2 size={14} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul className="max-h-60 overflow-y-auto py-1">
          {suggestions.map((s, i) => (
            <li
              key={`${s.name}-${s.type}`}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === highlightIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-secondary"
              }`}
              onMouseEnter={() => setHighlightIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
            >
              <MapPin size={12} className="shrink-0 text-muted-foreground" />
              <span className="font-medium">{s.name}</span>
              {s.type && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {s.type}
                </span>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
