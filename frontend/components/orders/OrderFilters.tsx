"use client";
import { useState } from "react";
import { ORDER_STATUS, ORDER_TYPES } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
 
export interface OrderFilterValues {
  search: string;
  status: string[];
  type:   string[];
  from:   string;
  to:     string;
}
 
interface OrderFiltersProps {
  value:    OrderFilterValues;
  onChange: (next: OrderFilterValues) => void;
  compact?: boolean;
}
 
export function OrderFilters({ value, onChange, compact = false }: OrderFiltersProps) {
  const toggle = (field: "status"|"type", val: string) => {
    const current = value[field];
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    onChange({ ...value, [field]: next });
  };
 
  const reset = () => onChange({ search:"", status:[], type:[], from:"", to:"" });
  const hasFilters = value.search || value.status.length || value.type.length || value.from || value.to;
 
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <Search size={15} className="text-gray-400 shrink-0"/>
        <input value={value.search}
          onChange={e => onChange({ ...value, search: e.target.value })}
          placeholder="Search orders..."
          className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"/>
        {value.search && (
          <button onClick={() => onChange({ ...value, search:"" })}>
            <X size={14} className="text-gray-400 hover:text-gray-600"/>
          </button>
        )}
      </div>
 
      {!compact && (
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(ORDER_STATUS).map(s => (
              <button key={s} onClick={() => toggle("status", s)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition border",
                  value.status.includes(s)
                    ? "bg-[#1A3C5E] text-white border-[#1A3C5E]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white")}>
                {s.replace("_"," ")}
              </button>
            ))}
          </div>
 
          {/* Type Filter */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(ORDER_TYPES).map(t => (
              <button key={t} onClick={() => toggle("type", t)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition border",
                  value.type.includes(t)
                    ? "bg-[#E8A020] text-white border-[#E8A020]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white")}>
                {t.replace("_"," ")}
              </button>
            ))}
          </div>
 
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input type="date" value={value.from} onChange={e => onChange({ ...value, from: e.target.value })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/20"/>
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={value.to} onChange={e => onChange({ ...value, to: e.target.value })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/20"/>
          </div>
 
          {hasFilters && (
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <X size={12}/> Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
