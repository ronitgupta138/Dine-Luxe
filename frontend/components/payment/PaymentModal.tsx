"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }  from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { X, CreditCard, Banknote, Smartphone, Split, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
 
interface PaymentModalProps {
  orderId: string;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}
 
const METHOD_META = {
  cash:  { icon: Banknote,    label: "Cash"   },
  card:  { icon: CreditCard,  label: "Card"   },
  upi:   { icon: Smartphone,  label: "UPI"    },
  split: { icon: Split,       label: "Split"  },
};
 
export function PaymentModal({ orderId, total, onClose, onSuccess }: PaymentModalProps) {
  const qc = useQueryClient();
  const [method,  setMethod]   = useState("cash");
  const [discount,setDiscount] = useState(0);
  const [coupon,  setCoupon]   = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [split,   setSplit]    = useState({ cash:0, card:0, upi:0 });
 
  const finalTotal = Math.max(0, total - discount);
 
  const { mutate: applyCoupon, isPending: applyingCoupon } = useMutation({
    mutationFn: () => apiClient.post<{ discount:number }>(`/orders/${orderId}/apply-coupon`, { code: coupon }),
    onSuccess: (data) => { setDiscount(data.discount); setCouponApplied(true); toast.success("Coupon applied!"); },
    onError:   () => toast.error("Invalid or expired coupon"),
  });
 
  const { mutate: pay, isPending } = useMutation({
    mutationFn: () => apiClient.post(`/orders/${orderId}/payment`, {
      method,
      couponCode: couponApplied ? coupon : undefined,
      splits: method === "split" ? split : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["orders"] });
      toast.success("Payment successful!");
      onSuccess();
    },
    onError: () => toast.error("Payment failed - please try again"),
  });
 
  const splitTotal = split.cash + split.card + split.upi;
  const splitValid = method !== "split" || Math.abs(splitTotal - finalTotal) < 1;
 
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:rounded-md rounded-t-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Process Payment</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500"/>
          </button>
        </div>
 
        <div className="px-5 py-4 space-y-5">
          {/* Amount */}
          <div className="bg-gray-50 rounded-xl px-5 py-4 text-center">
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className="text-4xl font-extrabold text-[#1A3C5E] mt-1">{formatCurrency(finalTotal)}</p>
            {discount > 0 && <p className="text-xs text-green-600 mt-1">Saved {formatCurrency(discount)}</p>}
          </div>
 
          {/* Coupon */}
          {!couponApplied && (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3">
                <Tag size={14} className="text-gray-400"/>
                <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code" className="flex-1 text-sm py-2.5 outline-none"/>
              </div>
              <button onClick={() => applyCoupon()} disabled={!coupon || applyingCoupon}
                className="px-4 py-2.5 bg-[#E8A020] text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#d08f1a] transition">
                {applyingCoupon ? <Loader2 size={14} className="animate-spin"/> : "Apply"}
              </button>
            </div>
          )}
 
          {/* Method */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(METHOD_META).map(([key, { icon: Icon, label }]) => (
                <button key={key} onClick={() => setMethod(key)}
                  className={cn("flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition",
                    method === key
                      ? "border-[#1A3C5E] bg-[#1A3C5E]/5 text-[#1A3C5E]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                  <Icon size={16}/>{label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Split Inputs */}
          {method === "split" && (
            <div className="space-y-2 bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium">Enter amounts (total: {formatCurrency(finalTotal)})</p>
              {(["cash","card","upi"] as const).map(k => (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 capitalize w-10">{k}</span>
                  <input type="number" min={0} placeholder="0"
                    value={split[k] || ""}
                    onChange={e => setSplit(prev => ({ ...prev, [k]: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/20"/>
                </div>
              ))}
              {!splitValid && splitTotal > 0 && (
                <p className="text-xs text-red-500">
                  Split total {formatCurrency(splitTotal)} != Bill {formatCurrency(finalTotal)}
                </p>
              )}
            </div>
          )}
        </div>
 
        {/* Confirm Button */}
        <div className="px-5 pb-6">
          <button onClick={() => pay()} disabled={isPending || !splitValid}
            className="w-full py-4 bg-[#1A3C5E] hover:bg-[#15304d] text-white rounded-md font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
            {isPending && <Loader2 size={16} className="animate-spin"/>}
            Confirm Payment  {formatCurrency(finalTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
