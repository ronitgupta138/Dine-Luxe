"use client";
import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { apiClient } from "@/lib/api-client";
import { TABLE_STATUS_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
 
export interface FloorTable {
  id: string; label: string; capacity: number; status: string;
  shape: "round"|"square"|"rectangle";
  x: number; y: number; width: number; height: number;
}
 
interface FloorMapProps {
  tables: FloorTable[];
  branchId: string;
  readOnly?: boolean;
  onTableClick?: (table: FloorTable) => void;
}
 
function TableShape({ table, onClick, isDragging }: { table:FloorTable; onClick?:()=>void; isDragging?:boolean }) {
  const color = TABLE_STATUS_COLORS[table.status as keyof typeof TABLE_STATUS_COLORS] ?? "#7F8C8D";
  const isRound = table.shape === "round";
 
  return (
    <div
      onClick={onClick}
      style={{
        position:"absolute", left:table.x, top:table.y,
        width:table.width, height:table.height,
        backgroundColor: color + "22",
        borderColor: color,
        borderWidth: 2,
        borderRadius: isRound ? "50%" : table.shape==="rectangle" ? 8 : 8,
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 0.2s",
        cursor: onClick ? "pointer" : "grab",
      }}
      className="flex flex-col items-center justify-center select-none hover:scale-105 transition-transform"
    >
      <span className="text-xs font-bold text-gray-800">{table.label}</span>
      <span className="text-[10px] text-gray-500">{table.capacity}p</span>
    </div>
  );
}
 
function DraggableTable({ table, onClick }: { table:FloorTable; onClick?:()=>void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: table.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ position:"absolute", left:table.x, top:table.y, transform: CSS.Translate.toString(transform) }}
    >
      <TableShape table={{ ...table, x:0, y:0 }} onClick={onClick} isDragging={isDragging}/>
    </div>
  );
}
 
export function FloorMap({ tables, branchId, readOnly = false, onTableClick }: FloorMapProps) {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string|null>(null);
 
  const { mutate: updatePosition } = useMutation({
    mutationFn: ({ tableId, x, y }: { tableId:string; x:number; y:number }) =>
      apiClient.patch(`/tables/${tableId}/position`, { x, y }),
    onSuccess: () => qc.invalidateQueries({ queryKey:["floor","tables"] }),
    onError:   () => toast.error("Failed to save position"),
  });
 
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);
    const table = tables.find(t => t.id === active.id);
    if (!table) return;
    const newX = Math.max(0, table.x + delta.x);
    const newY = Math.max(0, table.y + delta.y);
    updatePosition({ tableId: String(active.id), x: newX, y: newY });
  }, [tables, updatePosition]);
 
  const activeTable = activeId ? tables.find(t => t.id === activeId) : null;
 
  return (
    <div className="relative bg-[#F5F3EE] rounded-md border border-gray-200 overflow-hidden"
      style={{ width:"100%", height:600 }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
 
      {readOnly ? (
        tables.map(t => (
          <TableShape key={t.id} table={t} onClick={onTableClick ? () => onTableClick(t) : undefined}/>
        ))
      ) : (
        <DndContext
          onDragStart={e => setActiveId(String(e.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          {tables.map(t => (
            <DraggableTable key={t.id} table={t} onClick={onTableClick ? () => onTableClick(t) : undefined}/>
          ))}
          <DragOverlay>
            {activeTable && (
              <TableShape table={{ ...activeTable, x:0, y:0 }} isDragging/>
            )}
          </DragOverlay>
        </DndContext>
      )}
 
      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          {[["free","Free"],["occupied","Occupied"],["reserved","Reserved"],["cleaning","Cleaning"]].map(([s,l])=>(
            <span key={s} className="flex items-center gap-2 text-[10px] text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TABLE_STATUS_COLORS[s as keyof typeof TABLE_STATUS_COLORS] }}/>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
