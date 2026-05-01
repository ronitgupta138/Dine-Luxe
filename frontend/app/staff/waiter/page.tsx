"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useAuth }     from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WS_EVENTS, TABLE_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, elapsedMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Bell, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
 
interface TableUnit { id:string; label:string; capacity:number; status:string; currentOrderId?:string; }
interface OrderItem  { id:string; name:string; quantity:number; status:string; notes?:string; }
interface Order      { id:string; tableId:string; tableLabel:string; items:OrderItem[]; status:string; total:number; createdAt:string; }
 
export default function WaiterPage() {
  const { user, branchId } = useAuth();
  const { on, joinRoom, emit } = useRealtime();
  const qc = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<string|null>(null);
 
  const waiterId = user?.id;
 
  const { data: tables = [] } = useQuery({
    queryKey: ["waiter","tables", waiterId],
    queryFn:  () => apiClient.get<TableUnit[]>(`/staff/${waiterId}/tables`),
    enabled: !!waiterId,
    refetchInterval: 30_000,
  });
 
  const { data: order } = useQuery({
    queryKey: ["waiter","order", selectedTable],
    queryFn:  () => apiClient.get<Order>(`/tables/${selectedTable}/current-order`),
    enabled: !!selectedTable,
  });
 
  const { mutate: markServed } = useMutation({
    mutationFn: (itemId:string) => apiClient.patch(`/order-items/${itemId}/status`, { status:"served" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["waiter","order"] }); toast.success("Marked as served"); },
  });
 
  const { mutate: requestBill } = useMutation({
    mutationFn: (orderId:string) => apiClient.post(`/orders/${orderId}/request-bill`, {}),
    onSuccess: () => toast.success("Bill request sent to cashier"),
  });
 
  const callForHelp = () => {
    if (!selectedTable) return;
    emit("customer_call_waiter", { tableId: selectedTable, branchId });
    toast.info("Assistance request sent");
  };
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:waiter`);
    const u = on(WS_EVENTS.FOOD_READY, () => {
      qc.invalidateQueries({ queryKey:["waiter","order"] });
      toast.success("Food is ready to serve!");
    });
    return () => { u(); };
  }, [branchId, on, joinRoom, qc, emit]);

 
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Tables</h1>
 
      {/* Table Selection */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {tables.map(t => (
          <button key={t.id} onClick={() => setSelectedTable(t.id)}
            className={cn(
              "table-unit aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all border-2",
              selectedTable === t.id ? "ring-2 ring-[#1A3C5E] ring-offset-2 scale-105" : "hover:scale-105"
            )}
            style={{
              backgroundColor: TABLE_STATUS_COLORS[t.status as keyof typeof TABLE_STATUS_COLORS] + "22",
              borderColor: TABLE_STATUS_COLORS[t.status as keyof typeof TABLE_STATUS_COLORS]
            }}>
            <span className="text-base font-bold text-gray-800">{t.label}</span>
            <span className="text-[10px] text-gray-500">{t.capacity}p</span>
          </button>
        ))}
        {tables.length===0 && <p className="col-span-6 text-sm text-gray-400 py-4">No tables assigned</p>}
      </div>
 
      {/* Order Panel */}
      {selectedTable && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                {order ? `Order — ${order.tableLabel}` : "No active order"}
              </h2>
              {order && <p className="text-xs text-gray-400 mt-0.5">{elapsedMinutes(order.createdAt)}m ago</p>}
            </div>
            {order && <StatusBadge status={order.status}/>}
          </div>
 
          {order ? (
            <>
              <ul className="divide-y divide-gray-50">
                {order.items.map(item => (
                  <li key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.quantity}× {item.name}</p>
                      {item.notes && <p className="text-xs text-amber-600">{item.notes}</p>}
                    </div>
                    <StatusBadge status={item.status} size="sm"/>
                    {item.status === "ready" && (
                      <button onClick={() => markServed(item.id)}
                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition">
                        <CheckCircle size={16}/>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
 
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                <div className="flex gap-2">
                  <button onClick={callForHelp}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50 transition">
                    <Bell size={14}/> Call
                  </button>
                  <button onClick={() => requestBill(order.id)}
                    className="px-4 py-2 rounded-lg bg-[#1A3C5E] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#15304d] transition">
                    Request Bill <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Table is free — no current order</div>
          )}
        </div>
      )}
    </div>
  );
}
