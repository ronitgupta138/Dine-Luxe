"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./useRealtime";
import { useAuth } from "./useAuth";
import { apiClient } from "@/lib/api-client";
import { WS_EVENTS } from "@/lib/constants";

export type OrderStatus =
  | "created"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "paid"
  | "closed"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
}

export interface OrderStatusData {
  id: string;
  orderId: string;
  tableLabel?: string;
  items: OrderItem[];
  status: OrderStatus;
  specialInstructions?: string;
  createdAt: string;
  estimatedReadyTime?: string;
  customerName?: string;
  waiterName?: string;
}

interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  items?: Array<{ id: string; status: string }>;
}

// Order status progression
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  created: ["confirmed"],
  confirmed: ["preparing"],
  preparing: ["ready"],
  ready: ["served"],
  served: ["paid"],
  paid: ["closed"],
  closed: [],
  cancelled: [],
};

export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  "created",
  "confirmed",
  "preparing",
  "ready",
  "served",
];

export function getProgressStep(status: OrderStatus): number {
  return ORDER_PROGRESS_STEPS.indexOf(status);
}

export function useOrderStatus(orderId?: string) {
  const { branchId } = useAuth();
  const { on, joinRoom, emit } = useRealtime();
  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await apiClient.get<OrderStatusData>(`/orders/${orderId}`);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    fetchOrder();
    joinRoom(`order:${orderId}`);

    // Listen for order status updates
    const unsubscribe = on(
      WS_EVENTS.ORDER_STATUS_UPDATED,
      (payload: OrderStatusUpdate) => {
        if (payload.orderId === orderId) {
          setOrder((prev) =>
            prev ? { ...prev, status: payload.status } : null
          );
        }
      }
    );

    // Listen for kitchen status updates (item-level)
    const unsubscribeKitchen = on(
      WS_EVENTS.KITCHEN_STATUS_UPDATED,
      (payload: OrderStatusUpdate) => {
        if (payload.orderId === orderId && payload.items) {
          setOrder((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              items: prev.items.map((item) => {
                const update = payload.items?.find((i) => i.id === item.id);
                return update
                  ? { ...item, status: update.status as OrderItem["status"] }
                  : item;
              }),
            };
          });
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeKitchen();
    };
  }, [orderId, fetchOrder, joinRoom, on]);

  const updateStatus = useCallback(async (newStatus: OrderStatus) => {
    if (!orderId) return;

    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      throw err;
    }
  }, [orderId]);

  const updateItemStatus = useCallback(async (
    itemId: string,
    itemStatus: OrderItem["status"]
  ) => {
    if (!orderId) return;

    try {
      await apiClient.patch(`/order-items/${itemId}/status`, { status: itemStatus });
      setOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, status: itemStatus } : item
          ),
        };
      });
    } catch (err) {
      throw err;
    }
  }, [orderId]);

  const getProgress = useCallback((): number => {
    if (!order) return 0;
    return getProgressStep(order.status);
  }, [order]);

  const isStepComplete = useCallback((status: OrderStatus): boolean => {
    if (!order) return false;
    const currentProgress = getProgress();
    const stepProgress = getProgressStep(status);
    return stepProgress < currentProgress;
  }, [order]);

  const isStepActive = useCallback((status: OrderStatus): boolean => {
    if (!order) return false;
    return order.status === status;
  }, [order]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    updateStatus,
    updateItemStatus,
    getProgress,
    isStepComplete,
    isStepActive,
    progress: getProgress(),
  };
}
