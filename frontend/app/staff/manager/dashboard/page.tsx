"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/hooks/useAuth";
import { useTableStatus } from "@/hooks/useTableStatus";
import { apiClient } from "@/lib/api-client";
import { WS_EVENTS, COLORS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
  X,
  CheckCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";

// KPI Card Component
function KPICard({
  title,
  value,
  icon: Icon,
  color = "blue",
  change,
  changeType,
  prefix,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: "blue" | "green" | "purple" | "orange";
  change?: number;
  changeType?: "increase" | "decrease";
  prefix?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <Icon size={20} className="text-white" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              changeType === "increase" ? "text-green-600" : "text-red-600"
            )}
          >
            {changeType === "increase" ? (
              <TrendingUp size={12} className="rotate-180" />
            ) : (
              <TrendingUp size={12} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

// Alert Card Component
interface Alert {
  id: string;
  type: "overdue_order" | "low_inventory" | "warning" | "info";
  title: string;
  message: string;
  referenceId?: string;
  createdAt: string;
  isResolved?: boolean;
}

function AlertCard({
  alert,
  onResolve,
  onView,
}: {
  alert: Alert;
  onResolve: (id: string) => void;
  onView: (id: string, type: string) => void;
}) {
  const typeStyles = {
    overdue_order: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
    },
    low_inventory: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-500",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-700",
      icon: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      icon: "text-blue-500",
    },
  };

  const style = typeStyles[alert.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn("border rounded-xl p-4", style.bg)}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className={style.icon} />
        <div className="flex-1">
          <h4 className={cn("font-semibold", style.text)}>{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onView(alert.id, alert.type)}
              className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1"
            >
              View <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onResolve(alert.id)}
              className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
            >
              <CheckCircle size={14} /> Resolve
            </button>
          </div>
        </div>
        <button onClick={() => onResolve(alert.id)} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}

// Event Feed Item
interface EventItem {
  id: string;
  type:
    | "order_placed"
    | "payment_done"
    | "low_inventory"
    | "customer_request"
    | "overdue_order";
  message: string;
  tableLabel?: string;
  createdAt: string;
}

interface ManagerKpis {
  revenueToday?: number;
  staffOnDuty?: number;
}

interface ManagerOrder {
  id: string;
  status: "created" | "confirmed" | "preparing" | "ready" | "served" | "paid" | "closed" | "cancelled";
}

function EventItemComponent({ event }: { event: EventItem }) {
  const eventConfig = {
    order_placed: { icon: "OR", color: "bg-green-100" },
    payment_done: { icon: "PA", color: "bg-blue-100" },
    low_inventory: { icon: "LI", color: "bg-amber-100" },
    customer_request: { icon: "CR", color: "bg-purple-100" },
    overdue_order: { icon: "OD", color: "bg-red-100" },
  };

  const config = eventConfig[event.type];
  const timeAgo = Math.floor((Date.now() - new Date(event.createdAt).getTime()) / 60000);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm", config.color)}>
        {config.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{event.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo < 1 ? "Just now" : `${timeAgo}m ago`}</p>
      </div>
    </div>
  );
}

// Main Dashboard
export default function ManagerDashboardPage() {
  const { branchId } = useAuth();
  const { on, joinRoom } = useRealtime();
  const qc = useQueryClient();
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);

  // Fetch real-time data
  const { tables: tableData } = useTableStatus(branchId ?? undefined);
  const { data: orderData = [], refetch: refetchOrders } = useQuery({
    queryKey: ["manager-live-orders", branchId],
    queryFn: () => apiClient.get<ManagerOrder[]>(`/branch/${branchId}/orders/live`),
    enabled: !!branchId,
    refetchInterval: 15000,
  });

  // KPIs
  const { data: kpis = {} } = useQuery<ManagerKpis>({
    queryKey: ["manager-kpis", branchId],
    queryFn: () => apiClient.get<ManagerKpis>(`/branch/${branchId}/manager-dashboard`),
    enabled: !!branchId,
    refetchInterval: 60000,
  });

  // Alerts
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["manager-alerts", branchId],
    queryFn: () => apiClient.get<Alert[]>(`/branch/${branchId}/alerts`),
    enabled: !!branchId,
    refetchInterval: 30000,
  });

  // Event Feed
  const { data: events = [] } = useQuery<EventItem[]>({
    queryKey: ["manager-events", branchId],
    queryFn: () => apiClient.get<EventItem[]>(`/branch/${branchId}/events`),
    enabled: !!branchId,
    refetchInterval: 10000,
  });

  // WebSocket subscriptions
  useEffect(() => {
    if (!branchId) return;
    joinRoom(`branch:${branchId}:manager`);

    const unsubs = [
      on(WS_EVENTS.ORDER_CREATED, () => {
        refetchOrders();
        qc.invalidateQueries({ queryKey: ["manager-events"] });
      }),
      on(WS_EVENTS.OVERDUE_ORDER, () => {
        qc.invalidateQueries({ queryKey: ["manager-alerts"] });
      }),
      on(WS_EVENTS.INVENTORY_LOW, () => {
        qc.invalidateQueries({ queryKey: ["manager-alerts"] });
      }),
      on(WS_EVENTS.PAYMENT_CONFIRMED, () => refetchOrders()),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [branchId, joinRoom, on, qc, refetchOrders]);

  const handleResolveAlert = useCallback(async (alertId: string) => {
    await apiClient.patch(`/alerts/${alertId}/resolve`, {});
    qc.invalidateQueries({ queryKey: ["manager-alerts"] });
  }, [qc]);

  const handleViewAlert = useCallback((alertId: string, type: string) => {
    toast.info(`Opening ${type.replace("_", " ")} alert ${alertId}`);
  }, []);

  const occupiedTables = tableData?.filter((t) => t.status === "occupied").length || 0;
  const totalTables = tableData?.length || 0;
  const activeOrders = orderData?.filter(
    (o) => o.status === "confirmed" || o.status === "preparing"
  ).length || 0;

  const unreadAlerts = alerts?.filter((a: Alert) => !a.isResolved).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-primary px-4 pt-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Good morning</p>
            <h1 className="text-xl font-semibold text-white">Manager Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchOrders();
                toast.success("Live orders refreshed");
              }}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title="Revenue Today"
            value={kpis?.revenueToday || 0}
            prefix="Rs "
            icon={DollarSign}
            color="blue"
            change={12}
            changeType="increase"
          />
          <KPICard
            title="Active Orders"
            value={activeOrders}
            icon={ShoppingBag}
            color="green"
            change={8}
            changeType="increase"
          />
          <KPICard
            title="Tables Occupied"
            value={`${occupiedTables}/${totalTables}`}
            icon={MapPin}
            color="purple"
          />
          <KPICard
            title="Staff On Duty"
            value={kpis?.staffOnDuty || 0}
            icon={Users}
            color="orange"
          />
        </div>

        {/* Alerts Section */}
        <AnimatePresence>
          {unreadAlerts > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => setAlertsCollapsed(!alertsCollapsed)}
                className="w-full flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-red-700">
                      {unreadAlerts} Active Alert{unreadAlerts > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-red-600">Tap to view details</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: alertsCollapsed ? 180 : 0 }}
                  className="text-red-400"
                >
                  <ArrowRight size={20} />
                </motion.div>
              </button>

              {!alertsCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 mt-2"
                >
                  {alerts?.map((alert: Alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolveAlert}
                      onView={handleViewAlert}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Event Feed */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Live Events</h2>
              <span className="text-xs text-gray-400">Real-time</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {events?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No recent events</p>
              ) : (
                events?.map((event: EventItem) => (
                  <EventItemComponent key={event.id} event={event} />
                ))
              )}
            </div>
          </div>

          {/* Table Status Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Table Status</h2>
              <span className="text-xs text-gray-400">
                {occupiedTables}/{totalTables} occupied
              </span>
            </div>

            {/* Status rings */}
            <div className="flex items-center justify-center gap-8 py-4">
              {[
                { status: "free", label: "Available", count: tableData?.filter(t => t.status === "free").length || 0, color: COLORS.SUCCESS },
                { status: "occupied", label: "Occupied", count: occupiedTables, color: COLORS.DANGER },
                { status: "reserved", label: "Reserved", count: tableData?.filter(t => t.status === "reserved").length || 0, color: COLORS.INFO },
                { status: "cleaning", label: "Cleaning", count: tableData?.filter(t => t.status === "cleaning").length || 0, color: COLORS.CLEANING },
              ].map((item) => (
                <div key={item.status} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-1"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.count}
                  </div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link href="/staff/manager/floor" className="py-2 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700 hover:bg-gray-100">
                View Floor Map
              </Link>
              <Link href="/staff/manager/staff-duty" className="py-2 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700 hover:bg-gray-100">
                Manage Staff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
