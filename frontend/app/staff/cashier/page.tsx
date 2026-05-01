"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useAuth }     from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WS_EVENTS, PAYMENT_METHODS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CreditCard, Banknote, Smartphone, Split, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
 
interface BillOrder {
  id: string; tableLabel: string;
  items: { name:string; quantity:number; unitPrice:number; }[];
  subtotal: number; tax: number; discount: number; total: number;
  status: string;
}
 
const METHOD_ICONS: Record<string, React.ElementType> = {
  cash: Banknote, card: CreditCard, upi: Smartphone, split: Split,
};
 
export default function CashierPage() {
  const { branchId }      = useAuth();
  const { on, joinRoom }  = useRealtime();
  const qc                = useQueryClient();
  const [selected, setSelected]   = useState<BillOrder|null>(null);
  const [method, setMethod]       = useState<string>("cash");
  const [splitAmounts, setSplit]  = useState<{ cash:number; card:number; upi:number }>({ cash:0, card:0, upi:0 });
 
  const { data: queue = [] } = useQuery({
    queryKey: ["cashier","queue", branchId],
    queryFn:  () => apiClient.get<BillOrder[]>(`/branch/${branchId}/bill-queue`),
    enabled: !!branchId,
    refetchInterval: 15_000,
  });
 
  const { mutate: processPayment, isPending } = useMutation({
    mutationFn: ({ orderId, payload }:{ orderId:string; payload:unknown }) =>
      apiClient.post(`/orders/${orderId}/payment`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["cashier","queue"] });
      toast.success("Payment processed — receipt sent");
      setSelected(null);
    },
    onError: () => toast.error("Payment failed — try again"),
  });
 
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:cashier`);
    const u = on(WS_EVENTS.PAYMENT_CONFIRMED, () => qc.invalidateQueries({ queryKey:["cashier","queue"] }));
    return () => { u(); };
  }, [branchId, on, joinRoom, qc]);

 
  const handlePay = () => {
    if (!selected) return;
    const payload = method === "split"
      ? { method:"split", splits: splitAmounts }
      : { method };
    processPayment({ orderId: selected.id, payload });
  };
 
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Cashier — Bill Queue</h1>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue List */}
        <div className="space-y-3">
          {queue.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-10 text-center text-gray-400">
              No pending bills
            </div>
          )}
          {queue.map(o => (
            <button key={o.id} onClick={() => { setSelected(o); setMethod("cash"); }}
              className={cn(
                "w-full text-left bg-white rounded-xl border shadow-sm p-4 hover:border-[#1A3C5E] transition",
                selected?.id === o.id ? "border-[#1A3C5E] ring-2 ring-[#1A3C5E]/20" : "border-gray-100"
              )}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-lg">{o.tableLabel}</span>
                <StatusBadge status={o.status} size="sm"/>
              </div>
              <p className="text-2xl font-bold text-[#1A3C5E] mt-1">{formatCurrency(o.total)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{o.items.length} items</p>
            </button>
          ))}
        </div>
 
        {/* Payment Panel */}
        {selected && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Process Payment — {selected.tableLabel}</h2>
            </div>
 
            {/* Bill Breakdown */}
            <div className="px-5 py-4 space-y-1.5 border-b border-gray-100">
              {selected.items.map((i,idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600">
                  <span>{i.quantity}× {i.name}</span>
                  <span>{formatCurrency(i.unitPrice * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-dashed border-gray-200">
                <span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span><span>{formatCurrency(selected.tax)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span><span>-{formatCurrency(selected.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total</span><span>{formatCurrency(selected.total)}</span>
              </div>
            </div>
 
            {/* Payment Method */}
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PAYMENT_METHODS).map(m => {
                  const Icon = METHOD_ICONS[m];
                  return (
                    <button key={m} onClick={() => setMethod(m)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium capitalize transition",
                        method === m ? "border-[#1A3C5E] bg-[#1A3C5E]/5 text-[#1A3C5E]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}>
                      <Icon size={16}/>{m.replace("_"," ")}
                    </button>
                  );
                })}
              </div>
 
              {method === "split" && (
                <div className="mt-3 space-y-2">
                  {(["cash","card","upi"] as const).map(k => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 capitalize w-8">{k}</span>
                      <input type="number" min={0} placeholder="0"
                        value={splitAmounts[k] || ""}
                        onChange={e => setSplit(prev => ({ ...prev, [k]: Number(e.target.value) }))}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
 
            <div className="px-5 py-4 mt-auto">
              <button onClick={handlePay} disabled={isPending}
                className="w-full py-3 bg-[#1A3C5E] hover:bg-[#15304d] text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>}
                Confirm Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
