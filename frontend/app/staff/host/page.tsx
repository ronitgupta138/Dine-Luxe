"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useAuth }     from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { WS_EVENTS }   from "@/lib/constants";
import { formatTime }  from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserPlus, MapPin, Phone, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
 
interface QueueEntry { id:string; name:string; phone:string; partySize:number; status:string; notes?:string; estimatedWait:number; createdAt:string; }
interface Booking    { id:string; name:string; phone:string; partySize:number; status:string; timeSlot:string; tablePreference?:string; notes?:string; }
interface FreeTable  { id:string; label:string; capacity:number; }
 
export default function HostPage() {
  const { branchId }      = useAuth();
  const { on, joinRoom }  = useRealtime();
  const qc                = useQueryClient();
  const [activeTab, setTab] = useState<"queue"|"bookings">("queue");
  const [seatingId, setSeating] = useState<string|null>(null);
  const [selectedTable, setTable] = useState<string>("");
 
  const { data: queue    = [] } = useQuery({ queryKey:["host","queue",   branchId], queryFn:()=>apiClient.get<QueueEntry[]>(`/branch/${branchId}/queue`),           enabled:!!branchId, refetchInterval:15_000 });
  const { data: bookings = [] } = useQuery({ queryKey:["host","bookings",branchId], queryFn:()=>apiClient.get<Booking[]>   (`/branch/${branchId}/bookings/today`),    enabled:!!branchId, refetchInterval:30_000 });
  const { data: tables   = [] } = useQuery({ queryKey:["host","tables",  branchId], queryFn:()=>apiClient.get<FreeTable[]> (`/branch/${branchId}/tables?status=free`), enabled:!!branchId, refetchInterval:15_000 });
 
  const { mutate: seatGuest } = useMutation({
    mutationFn: ({ entryId, tableId, type }:{ entryId:string; tableId:string; type:"queue"|"booking" }) =>
      apiClient.post(`/${type}/${entryId}/seat`, { tableId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["host"] });
      toast.success("Guest seated successfully");
      setSeating(null); setTable("");
    },
  });
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:host`);
    const unsubs = [
      on(WS_EVENTS.ARRIVAL_DETECTED,   (data:any) => { toast.info(`${data.guestName} has arrived!`); qc.invalidateQueries({ queryKey:["host","queue"] }); }),
      on(WS_EVENTS.QUEUE_UPDATED,      () => qc.invalidateQueries({ queryKey:["host","queue"] })),
      on(WS_EVENTS.TABLE_STATUS_CHANGED,() => qc.invalidateQueries({ queryKey:["host","tables"] })),
    ];
    return () => unsubs.forEach(u => u());
  }, [branchId, on, joinRoom, qc]);
 
  const list = activeTab === "queue" ? queue : bookings;
 
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Host Station</h1>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["queue","bookings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium capitalize transition",
                activeTab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}>
              {t}
            </button>
          ))}
        </div>
      </div>
 
      {/* Free Tables Summary */}
      <div className="bg-[#1A3C5E] text-white rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-75">Tables Available</p>
          <p className="text-3xl font-bold">{tables.length}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-75">In Queue</p>
          <p className="text-3xl font-bold">{queue.filter(q=>q.status==="waiting").length}</p>
        </div>
      </div>
 
      {/* Guest List */}
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-10 text-center text-gray-400">
            {activeTab === "queue" ? "Queue is empty" : "No bookings today"}
          </div>
        )}
        {list.map((entry:any) => (
          <div key={entry.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{entry.name}</p>
                  <StatusBadge status={entry.status} size="sm"/>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={12}/>{entry.partySize} guests</span>
                  <span className="flex items-center gap-1"><Phone size={12}/>{entry.phone}</span>
                  {activeTab === "queue" && <span className="flex items-center gap-1"><Clock size={12}/>{entry.estimatedWait}m wait</span>}
                  {activeTab === "bookings" && <span className="flex items-center gap-1"><Clock size={12}/>{formatTime(entry.timeSlot)}</span>}
                </div>
                {entry.notes && <p className="text-xs text-amber-600 mt-1">{entry.notes}</p>}
              </div>
              {(entry.status === "waiting" || entry.status === "arrived" || entry.status === "confirmed") && (
                <button onClick={() => setSeating(entry.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1A3C5E] text-white text-xs font-semibold rounded-lg hover:bg-[#15304d] transition">
                  <MapPin size={12}/> Seat
                </button>
              )}
            </div>
 
            {/* Seat Modal inline */}
            {seatingId === entry.id && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-2">Select a table:</p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {tables.map(t => (
                    <button key={t.id} onClick={() => setTable(t.id)}
                      className={cn("py-2 rounded-lg border text-xs font-bold transition",
                        selectedTable === t.id
                          ? "border-[#1A3C5E] bg-[#1A3C5E] text-white"
                          : "border-gray-200 text-gray-700 hover:border-[#1A3C5E]")}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSeating(null); setTable(""); }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button disabled={!selectedTable}
                    onClick={() => seatGuest({ entryId:entry.id, tableId:selectedTable, type:activeTab==="queue"?"queue":"booking" })}
                    className="flex-1 py-2 bg-[#1A3C5E] text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-[#15304d] transition">
                    Confirm Seating
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
