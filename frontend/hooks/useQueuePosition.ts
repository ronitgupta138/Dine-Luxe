"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./useRealtime";
import { useAuth } from "./useAuth";
import { apiClient } from "@/lib/api-client";
import { WS_EVENTS } from "@/lib/constants";

export type QueueStatus = "waiting" | "arrived" | "seated" | "no_show" | "cancelled";

export interface QueueEntry {
  id: string;
  queueId: string;
  userId?: string;
  userName?: string;
  phone?: string;
  partySize: number;
  position: number;
  status: QueueStatus;
  source: "walk_in" | "pre_booked" | "digital";
  estimatedWaitMinutes: number;
  arrivedAt?: string;
  seatedAt?: string;
  createdAt: string;
}

interface QueueUpdate {
  queueId: string;
  position: number;
  estimatedWait: number;
}

interface ArrivalEvent {
  queueId: string;
  customerName: string;
  partySize: number;
  bookingId?: string;
}

export function useQueuePosition(branchId?: string) {
  const { branchId: authBranchId } = useAuth();
  const { on, joinRoom, emit } = useRealtime();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetBranchId = branchId || authBranchId;

  const fetchQueue = useCallback(async () => {
    if (!targetBranchId) return;

    try {
      setLoading(true);
      const data = await apiClient.get<QueueEntry[]>(`/queue/branch/${targetBranchId}`);
      setQueue(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch queue");
    } finally {
      setLoading(false);
    }
  }, [targetBranchId]);

  useEffect(() => {
    if (!targetBranchId) return;

    fetchQueue();
    joinRoom(`branch:${targetBranchId}:host`);

    // Listen for queue updates
    const unsubscribe = on(
      WS_EVENTS.QUEUE_UPDATED,
      (payload: QueueUpdate) => {
        setQueue((prev) =>
          prev.map((entry) =>
            entry.queueId === payload.queueId
              ? {
                  ...entry,
                  position: payload.position,
                  estimatedWaitMinutes: payload.estimatedWait,
                }
              : entry
          )
        );
      }
    );

    // Listen for arrival detection
    const unsubscribeArrival = on(
      WS_EVENTS.ARRIVAL_DETECTED,
      (payload: ArrivalEvent) => {
        setQueue((prev) =>
          prev.map((entry) =>
            entry.queueId === payload.queueId
              ? { ...entry, status: "arrived", arrivedAt: new Date().toISOString() }
              : entry
          )
        );
      }
    );

    // Listen for position updates
    const unsubscribePosition = on(
      WS_EVENTS.QUEUE_POSITION_UPDATE,
      (payload: QueueUpdate) => {
        setQueue((prev) =>
          prev.map((entry) =>
            entry.queueId === payload.queueId
              ? {
                  ...entry,
                  position: payload.position,
                  estimatedWaitMinutes: payload.estimatedWait,
                }
              : entry
          )
        );
      }
    );

    return () => {
      unsubscribe();
      unsubscribeArrival();
      unsubscribePosition();
    };
  }, [targetBranchId, fetchQueue, joinRoom, on]);

  const joinQueue = useCallback(async (partySize: number) => {
    if (!targetBranchId) return;

    try {
      const entry = await apiClient.post<QueueEntry>(`/queue/join`, {
        branchId: targetBranchId,
        peopleCount: partySize,
      });
      setQueue((prev) => [entry, ...prev]);
      return entry;
    } catch (err) {
      throw err;
    }
  }, [targetBranchId]);

  const markArrived = useCallback(async (queueId: string) => {
    try {
      await apiClient.post(`/queue/${queueId}/mark-arrived`, {});
      setQueue((prev) =>
        prev.map((entry) =>
          entry.queueId === queueId
            ? { ...entry, status: "arrived" as QueueStatus, arrivedAt: new Date().toISOString() }
            : entry
        )
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const markNoShow = useCallback(async (queueId: string) => {
    try {
      await apiClient.post(`/queue/${queueId}/no-show`, {});
      setQueue((prev) => prev.filter((entry) => entry.queueId !== queueId));
    } catch (err) {
      throw err;
    }
  }, []);

  const removeFromQueue = useCallback(async (queueId: string) => {
    try {
      await apiClient.delete(`/queue/${queueId}`);
      setQueue((prev) => prev.filter((entry) => entry.queueId !== queueId));
    } catch (err) {
      throw err;
    }
  }, []);

  const getMyPosition = useCallback((): QueueEntry | undefined => {
    return queue.find((entry) => entry.status === "waiting" || entry.status === "arrived");
  }, [queue]);

  const getWaitTime = useCallback((): number => {
    const myEntry = getMyPosition();
    return myEntry?.estimatedWaitMinutes || 0;
  }, [getMyPosition]);

  const isFirstInQueue = useCallback((): boolean => {
    const myEntry = getMyPosition();
    if (!myEntry) return false;
    return myEntry.position === 1;
  }, [getMyPosition]);

  return {
    queue,
    loading,
    error,
    refetch: fetchQueue,
    joinQueue,
    markArrived,
    markNoShow,
    removeFromQueue,
    getMyPosition,
    getWaitTime,
    isFirstInQueue,
  };
}
