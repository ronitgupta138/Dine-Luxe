"use client";
import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth }     from "@/hooks/useAuth";
import { elapsedMinutes } from "@/lib/utils";
import { cn }          from "@/lib/utils";
import { WS_EVENTS }   from "@/lib/constants";
 
interface KitchenOrder {
  id: string;
  tableLabel: string;
  items: { id:string; name:string; quantity:number; notes?:string }[];
  status: "pending"|"preparing"|"ready";
  specialInstructions?: string;
  createdAt: string;
}
 
type Filter = "all"|"pending"|"preparing";
const OVERDUE = 15;
 
function Ticket({ order, onAction }: { order:KitchenOrder; onAction:(id:string,s:string)=>void }) {
  const elapsed  = elapsedMinutes(order.createdAt);
  const overdue  = order.status === "preparing" && elapsed >= OVERDUE;
  return (
    <div className={cn(
      "rounded-xl border-2 p-4 flex flex-col gap-3 animate-slide-in",
      order.status === "pending"                 && "border-blue-400  bg-[#111]",
      order.status === "preparing" && !overdue   && "border-amber-400 bg-[#1a1500]",
      order.status === "preparing" &&  overdue   && "border-red-500   bg-[#1a0000] animate-pulse-red",
      order.status === "ready"                   && "border-green-600 bg-[#001a00] opacity-75",
    )}>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-extrabold text-white">{order.tableLabel}</span>
        <span className={cn("text-sm font-semibold tabular-nums",
          elapsed < 10 && "text-gray-400",
          elapsed >= 10 && elapsed < OVERDUE && "text-amber-400",
          elapsed >= OVERDUE && "text-red-400",
        )}>{elapsed}m</span>
      </div>
 
      <ul className="space-y-1">
        {order.items.map(i => (
          <li key={i.id} className="text-white text-lg font-medium">{i.quantity} {i.name}</li>
        ))}
      </ul>
 
      {order.specialInstructions && (
        <p className="text-amber-300 text-sm border-t border-amber-400/30 pt-2"> {order.specialInstructions}</p>
      )}
 
      {order.status === "pending" && (
        <button onClick={() => onAction(order.id, "preparing")}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm transition">
          START COOKING
        </button>
      )}
      {order.status === "preparing" && (
        <button onClick={() => onAction(order.id, "ready")}
          className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-sm transition">
          MARK READY
        </button>
      )}
    </div>
  );
}
 
export default function KDSPage() {
  const { branchId }  = useAuth();
  const { on, joinRoom } = useRealtime();
  const qc            = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
 
  const { data: orders = [] } = useQuery({
    queryKey: ["kds", branchId],
    queryFn:  () => apiClient.get<KitchenOrder[]>(`/kitchen/branch/${branchId}/orders`),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });
 
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }:{ id:string; status:string }) =>
      apiClient.patch(`/orders/${id}/kitchen-status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kds"] }),
  });
 
  const handleAction = useCallback((id:string, status:string) => updateStatus({ id, status }), [updateStatus]);
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:kitchen`);
    const u1 = on(WS_EVENTS.ORDER_CREATED,   () => qc.invalidateQueries({ queryKey: ["kds"] }));
    const u2 = on(WS_EVENTS.ORDER_CANCELLED, () => qc.invalidateQueries({ queryKey: ["kds"] }));
    return () => { u1(); u2(); };
  }, [branchId, on, joinRoom, qc]);
 
  const filtered = filter === "all"
    ? orders.filter(o => o.status !== "ready")
    : orders.filter(o => o.status === filter);
 
  return (
    <div className="min-h-screen bg-[#111111] text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
        <div className="flex gap-2">
          {(["all","pending","preparing"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition",
                filter === f ? "bg-white text-black" : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]")}>
              {f}
            </button>
          ))}
        </div>
      </div>
 
      {filtered.length === 0
        ? <div className="flex items-center justify-center h-64 text-gray-500 text-lg">No active orders</div>
        : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(o => <Ticket key={o.id} order={o} onAction={handleAction}/>)}
          </div>
      }
    </div>
  );
}
