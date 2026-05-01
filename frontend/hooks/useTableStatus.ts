"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./useRealtime";
import { useAuth } from "./useAuth";
import { apiClient } from "@/lib/api-client";
import { WS_EVENTS } from "@/lib/constants";

export interface TableStatus {
  id: string;
  label: string;
  capacity: number;
  shape: "round" | "square" | "rectangle" | "booth";
  zone: string;
  status: "free" | "reserved" | "occupied" | "cleaning" | "maintenance";
  currentOrderId?: string | null;
  currentCustomerName?: string | null;
  occupiedSince?: string | null;
  floorNumber: number;
}

interface TableStatusUpdate {
  tableId: string;
  oldStatus: TableStatus["status"];
  newStatus: TableStatus["status"];
  floor: number;
}

export function useTableStatus(branchId?: string) {
  const { branchId: authBranchId } = useAuth();
  const { on, joinRoom, emit } = useRealtime();
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetBranchId = branchId || authBranchId;

  const fetchTables = useCallback(async () => {
    if (!targetBranchId) return;

    try {
      setLoading(true);
      const data = await apiClient.get<TableStatus[]>(`/branch/${targetBranchId}/live-layout`);
      setTables(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, [targetBranchId]);

  useEffect(() => {
    if (!targetBranchId) return;

    fetchTables();
    joinRoom(`branch:${targetBranchId}`);

    // Listen for table status changes
    const unsubscribe = on(
      WS_EVENTS.TABLE_STATUS_CHANGED,
      (payload: TableStatusUpdate) => {
        setTables((prev) =>
          prev.map((table) =>
            table.id === payload.tableId
              ? { ...table, status: payload.newStatus }
              : table
          )
        );
      }
);

    return () => {
      unsubscribe();
    };
  }, [targetBranchId, fetchTables, joinRoom, on]);

  const getTablesByFloor = useCallback(() => {
    const floors: Record<number, TableStatus[]> = {};
    tables.forEach((table) => {
      if (!floors[table.floorNumber]) {
        floors[table.floorNumber] = [];
      }
      floors[table.floorNumber].push(table);
    });
    return floors;
  }, [tables]);

  const getTablesByStatus = useCallback(
    (status: TableStatus["status"]) => {
      return tables.filter((t) => t.status === status);
    },
    [tables]
  );

  const getOccupancyStats = useCallback(() => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;
    const free = tables.filter((t) => t.status === "free").length;
    const cleaning = tables.filter((t) => t.status === "cleaning").length;
    const maintenance = tables.filter((t) => t.status === "maintenance").length;

    return {
      total,
      occupied,
      reserved,
      free,
      cleaning,
      maintenance,
      occupancyRate: total > 0 ? (occupied / total) * 100 : 0,
    };
  }, [tables]);

  return {
    tables,
    loading,
    error,
    refetch: fetchTables,
    getTablesByFloor,
    getTablesByStatus,
    getOccupancyStats,
  };
}
