"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
 
export interface Column<T> {
  key:       keyof T | string;
  label:     string;
  sortable?: boolean;
  align?:    "left"|"center"|"right";
  render?:   (row:T) => React.ReactNode;
  width?:    string;
}
 
interface DataTableProps<T> {
  columns:     Column<T>[];
  data:        T[];
  loading?:    boolean;
  pageSize?:   number;
  emptyTitle?: string;
  emptyDesc?:  string;
  onRowClick?: (row:T) => void;
  keyField?:   keyof T;
}
 
type SortDir = "asc"|"desc"|null;
 
export function DataTable<T extends Record<string, unknown>>({
  columns, data, loading = false,
  pageSize = 20, emptyTitle = "No data", emptyDesc,
  onRowClick, keyField = "id" as keyof T,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string|null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage]       = useState(1);
 
  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  };
 
  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey] as any;
    const bv = b[sortKey] as any;
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return sortDir === "asc" ? cmp : -cmp;
  });
 
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged      = sorted.slice((page - 1) * pageSize, page * pageSize);
 
  const SortIcon = ({ k }: { k:string }) => {
    if (sortKey !== k) return <ChevronsUpDown size={13} className="text-gray-300"/>;
    return sortDir === "asc"
      ? <ChevronUp size={13} className="text-[#1A3C5E]"/>
      : <ChevronDown size={13} className="text-[#1A3C5E]"/>;
  };
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)}
                  className={cn(
                    "px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap",
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                    col.sortable && "cursor-pointer hover:bg-gray-100 select-none"
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon k={String(col.key)}/>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={String(col.key)} className="px-5 py-3">
                    <div className="skeleton h-4 rounded w-3/4"/>
                  </td>
                ))}
              </tr>
            ))}
            {!loading && paged.map((row, i) => (
              <tr key={String(row[keyField] ?? i)}
                onClick={() => onRowClick?.(row)}
                className={cn("transition", onRowClick && "cursor-pointer hover:bg-gray-50")}>
                {columns.map(col => (
                  <td key={String(col.key)}
                    className={cn("px-5 py-3 text-gray-700",
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "")}>
                    {col.render ? col.render(row) : String(row[String(col.key) as keyof T] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {!loading && data.length === 0 && (
        <EmptyState title={emptyTitle} message={emptyDesc}/>
      )}
 
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {(page-1)*pageSize+1}-{Math.min(page*pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
              <ChevronLeft size={16} className="text-gray-600"/>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("w-7 h-7 rounded-lg text-xs font-medium transition",
                    page === p ? "bg-[#1A3C5E] text-white" : "text-gray-600 hover:bg-gray-100")}>
                  {p}
                </button>
              );
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p+1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
              <ChevronRight size={16} className="text-gray-600"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
