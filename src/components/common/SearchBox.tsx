"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * SearchBox — controlled search input with optional debounce.
 */
export function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}: SearchBoxProps) {
  const debouncedChange = useDebounce(onChange, debounceMs);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
        aria-label={placeholder}
        id="search-input"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      )}
    </div>
  );
}
