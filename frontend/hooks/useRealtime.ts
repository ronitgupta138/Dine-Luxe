"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getBrowserSupabase } from "@/lib/supabase-client";

export function useRealtime() {
  const { session } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const supabase = await getBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
        auth: { token: session.access_token },
      });
      
      socketRef.current = socket;
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketRef.current?.emit("join", room);
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { joinRoom, on, emit };
}
