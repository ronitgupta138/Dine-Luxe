"use client";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useAuth }     from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { formatCurrency, elapsedMinutes } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WS_EVENTS, TABLE_STATUS_COLORS } from "@/lib/constants";
import { AlertTriangle, Users, UtensilsCrossed, Clock } from "lucide-react";
 
interface TableUnit { id:string; label:string; capacity:number; status:string; currentOrderId?:string; }
interface ActiveOrder { id:string; tableLabel:string; status:string; total:number; createdAt:string; }
interface StaffMember { id:string; name:string; role:string; tablesAssigned:number; }
interface Alert { id:string; type:string; message:string; severity:"low"|"medium"|"high"; createdAt:string; }
 
function StatCard({ label, value, icon:Icon, color }:{ label:string; value:string|number; icon:React.ElementType; color:string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={20} className="text-white"/></div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
 
export default function ManagerPage() {
  const { branchId }      = useAuth();
  const { on, joinRoom }  = useRealtime();
  const qc                = useQueryClient();
 
  const { data: tables  = [] } = useQuery({ queryKey:["mgr","tables",  branchId], queryFn:()=>apiClient.get<TableUnit[]>  (`/branch/${branchId}/tables`),  enabled:!!branchId, refetchInterval:30_000 });
  const { data: orders  = [] } = useQuery({ queryKey:["mgr","orders",  branchId], queryFn:()=>apiClient.get<ActiveOrder[]>(`/branch/${branchId}/orders/active`), enabled:!!branchId, refetchInterval:15_000 });
  const { data: staff   = [] } = useQuery({ queryKey:["mgr","staff",   branchId], queryFn:()=>apiClient.get<StaffMember[]>(`/branch/${branchId}/staff/active`), enabled:!!branchId, refetchInterval:60_000 });
  const { data: alerts  = [] } = useQuery({ queryKey:["mgr","alerts",  branchId], queryFn:()=>apiClient.get<Alert[]>      (`/branch/${branchId}/alerts`),        enabled:!!branchId, refetchInterval:10_000 });
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:manager`);
    const unsubs = [
      on(WS_EVENTS.TABLE_STATUS_CHANGED,   () => qc.invalidateQueries({ queryKey:["mgr","tables"] })),
      on(WS_EVENTS.ORDER_CREATED,          () => qc.invalidateQueries({ queryKey:["mgr","orders"] })),
      on(WS_EVENTS.OVERDUE_ORDER,          () => qc.invalidateQueries({ queryKey:["mgr","alerts"] })),
      on(WS_EVENTS.CUSTOMER_CALL_WAITER,   () => qc.invalidateQueries({ queryKey:["mgr","alerts"] })),
    ];
    return () => unsubs.forEach(u => u());
  }, [branchId, on, joinRoom, qc]);
 
  const occupied  = tables.filter(t => t.status === "occupied").length;
  const overdue   = orders.filter(o => elapsedMinutes(o.createdAt) > 20).length;
  const highAlerts= alerts.filter(a => a.severity === "high").length;
 
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manager View</h1>
 
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tables Occupied"  value={`${occupied}/${tables.length}`} icon={UtensilsCrossed} color="bg-[#1A3C5E]"/>
        <StatCard label="Active Orders"    value={orders.length}                     icon={Clock}          color="bg-[#E8A020]"/>
        <StatCard label="Staff On Duty"    value={staff.length}                      icon={Users}          color="bg-emerald-500"/>
        <StatCard label="High Alerts"      value={highAlerts}                        icon={AlertTriangle}  color={highAlerts > 0 ? "bg-red-500" : "bg-gray-400"}/>
      </div>
 
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table Grid */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Floor Status</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {tables.map(t => (
              <div key={t.id} className="table-unit aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: TABLE_STATUS_COLORS[t.status as keyof typeof TABLE_STATUS_COLORS] + "22", borderWidth:2, borderColor: TABLE_STATUS_COLORS[t.status as keyof typeof TABLE_STATUS_COLORS] }}>
                <span className="text-base font-bold text-gray-800">{t.label}</span>
                <span className="text-[10px] text-gray-500">{t.capacity}p</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 flex-wrap">
            {[["free","Free"],["occupied","Occupied"],["reserved","Reserved"],["cleaning","Cleaning"]].map(([s,l])=>(
              <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: TABLE_STATUS_COLORS[s as keyof typeof TABLE_STATUS_COLORS] }}/>
                {l}
              </span>
            ))}
          </div>
        </div>
 
        {/* Alerts Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Live Alerts</h2>
          {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No active alerts</p>}
          {alerts.slice(0,8).map(a => (
            <div key={a.id} className={`rounded-lg px-3 py-2.5 text-sm ${a.severity==="high"?"bg-red-50 border border-red-200":a.severity==="medium"?"bg-amber-50 border border-amber-200":"bg-gray-50 border border-gray-200"}`}>
              <p className="font-medium text-gray-800">{a.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{elapsedMinutes(a.createdAt)}m ago</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* Active Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Active Orders</h2>
          {overdue > 0 && <span className="text-xs text-red-500 font-medium">{overdue} overdue</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Table","Status","Total","Time"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => {
                const mins = elapsedMinutes(o.createdAt);
                return (
                  <tr key={o.id} className={mins > 20 ? "bg-red-50" : "hover:bg-gray-50"}>
                    <td className="px-5 py-3 font-semibold text-gray-900">{o.tableLabel}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} size="sm"/></td>
                    <td className="px-5 py-3 text-gray-600">{formatCurrency(o.total)}</td>
                    <td className={`px-5 py-3 font-medium ${mins > 20 ? "text-red-600" : "text-gray-600"}`}>{mins}m</td>
                  </tr>
                );
              })}
              {orders.length===0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No active orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
