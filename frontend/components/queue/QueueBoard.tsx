"use client";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useRealtime } from "@/hooks/useRealtime";
import { WS_EVENTS }   from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Users, Clock } from "lucide-react";
 
interface QueueEntry {
  id:string; token:string; name:string; partySize:number;
  estimatedWait:number; status:"waiting"|"called"|"seated";
}
 
interface QueueBoardProps { branchId:string; showFullList?:boolean; }
 
export function QueueBoard({ branchId, showFullList = false }: QueueBoardProps) {
  const { on, joinRoom } = useRealtime();
  const qc = useQueryClient();
 
  const { data: queue = [] } = useQuery({
    queryKey: ["queue","board", branchId],
    queryFn:  () => apiClient.get<QueueEntry[]>(`/branch/${branchId}/queue`),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:queue`);
    const unsubs = [
      on(WS_EVENTS.QUEUE_UPDATED,         () => qc.invalidateQueries({ queryKey:["queue","board"] })),
      on(WS_EVENTS.QUEUE_POSITION_UPDATE,  () => qc.invalidateQueries({ queryKey:["queue","board"] })),
    ];
    return () => unsubs.forEach(u => u());
  }, [branchId, on, joinRoom, qc]);
 
  const called  = queue.filter(q => q.status === "called");
  const waiting = queue.filter(q => q.status === "waiting");
 
  return (
    <div className="space-y-4">
      {/* Now Serving */}
      {called.length > 0 && (
        <div className="bg-[#1A3C5E] rounded-md p-6 text-center text-white">
          <p className="text-sm font-medium opacity-70 uppercase tracking-widest mb-2">Now Serving</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {called.map(entry => (
              <div key={entry.id} className="flex flex-col items-center">
                <span className="text-6xl font-black tracking-tight">{entry.token}</span>
                <span className="text-sm opacity-80 mt-1">{entry.name}  {entry.partySize}p</span>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Queue Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{waiting.length}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Users size={11}/> In Queue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">
            {waiting.length > 0 ? waiting[0].estimatedWait : 0}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Clock size={11}/> Min Wait</p>
        </div>
      </div>
 
      {/* Queue List */}
      {showFullList && waiting.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Waiting List</p>
          </div>
          <div className="divide-y divide-gray-50">
            {waiting.map((entry, idx) => (
              <div key={entry.id} className={cn("flex items-center gap-4 px-5 py-3",
                idx === 0 && "bg-[#E8A020]/5")}>
                <span className={cn("text-2xl font-black w-12 text-center",
                  idx === 0 ? "text-[#E8A020]" : "text-gray-300")}>
                  {entry.token}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                  <p className="text-xs text-gray-500">{entry.partySize} guests</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{entry.estimatedWait}m</p>
                  <p className="text-xs text-gray-400">est. wait</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
