"use client";

import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
}

export function FilterSelect({ label, value, onChange, options, className }: FilterSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-gray-500">{label}</span>
      <select
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === "all" ? "不限" : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </div>
  );
}
