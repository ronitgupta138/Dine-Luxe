﻿"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useRealtime } from "@/hooks/useRealtime";
import { WS_EVENTS }   from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CheckCircle, Clock, ChefHat, Bike, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
 
interface OrderDetail {
  id: string; type: string; status: string; tableLabel?: string;
  items: { name:string; quantity:number; unitPrice:number; status:string }[];
  subtotal: number; tax: number; total: number;
  estimatedReadyAt?: string; createdAt: string;
  deliveryAddress?: string;
}
 
const STATUS_STEPS: { key:string; label:string; icon:React.ElementType }[] = [
  { key:"confirmed", label:"Confirmed",  icon:CheckCircle   },
  { key:"preparing", label:"Preparing",  icon:ChefHat       },
  { key:"ready",     label:"Ready",      icon:UtensilsCrossed},
  { key:"served",    label:"Served",     icon:CheckCircle   },
];
 
const DELIVERY_STEPS: { key:string; label:string; icon:React.ElementType }[] = [
  { key:"confirmed", label:"Confirmed",  icon:CheckCircle },
  { key:"preparing", label:"Preparing",  icon:ChefHat     },
  { key:"ready",     label:"Packed",     icon:CheckCircle },
  { key:"served",    label:"On the way", icon:Bike        },
];
 
function getStepIndex(steps: typeof STATUS_STEPS, status: string): number {
  const idx = steps.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}
 
export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId:string }>();
  const { on, joinRoom } = useRealtime();
  const qc = useQueryClient();
 
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn:  () => apiClient.get<OrderDetail>(`/orders/${orderId}`),
    enabled: !!orderId,
    refetchInterval: 30_000,
  });
 
  useEffect(() => {
    if (!orderId) return;
    joinRoom(`order:${orderId}`);
    const u = on(WS_EVENTS.KITCHEN_STATUS_UPDATED, () => qc.invalidateQueries({ queryKey:["order", orderId] }));
    const u2= on(WS_EVENTS.FOOD_READY,             () => qc.invalidateQueries({ queryKey:["order", orderId] }));
    return () => { u(); u2(); };
  }, [orderId, on, joinRoom, qc]);
 
  const steps = order?.type === "delivery" ? DELIVERY_STEPS : STATUS_STEPS;
  const currentStep = order ? getStepIndex(steps, order.status) : 0;
 
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="skeleton w-full max-w-md h-96 mx-4 rounded-2xl"/>
    </div>;
  }
 
  if (!order) return null;
 
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-(--brand-primary) px-5 pt-12 pb-20 text-white">
        <p className="text-sm opacity-70">Order #{order.id.slice(-6).toUpperCase()}</p>
        <h1 className="text-2xl font-bold mt-1 capitalize">{order.status.replace("_"," ")}</h1>
        {order.estimatedReadyAt && order.status !== "served" && (
          <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
            <Clock size={14}/> Est. ready: {new Date(order.estimatedReadyAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true })}
          </p>
        )}
      </div>
 
      <div className="px-4 -mt-10 space-y-4">
        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const done   = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition",
                      done   ? "bg-(--brand-primary) border-(--brand-primary)" : "",
                      active ? "border-(--brand-primary) bg-white" : "",
                      !done && !active ? "border-gray-200 bg-gray-50" : ""
                    )}>
                      <Icon size={18} className={done ? "text-white" : active ? "text-(--brand-primary)" : "text-gray-300"}/>
                    </div>
                    <span className={cn("text-[10px] font-medium text-center leading-tight",
                      done || active ? "text-(--brand-primary)" : "text-gray-400")}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1 mb-4 transition", i < currentStep ? "bg-(--brand-primary)" : "bg-gray-200")}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Your Order</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-gray-800">{item.quantity}× {item.name}</span>
                <span className="text-gray-600">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
            <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>
        </div>
 
        {/* Meta */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2 text-sm text-gray-600">
          {order.tableLabel && <div className="flex justify-between"><span>Table</span><span className="font-medium text-gray-800">{order.tableLabel}</span></div>}
          {order.deliveryAddress && <div className="flex justify-between"><span>Deliver to</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{order.deliveryAddress}</span></div>}
          <div className="flex justify-between"><span>Placed</span><span className="font-medium text-gray-800">{formatDateTime(order.createdAt)}</span></div>
        </div>
      </div>
    </div>
  );
}
