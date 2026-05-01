"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { FloorMap } from "./FloorMap";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface Props {
  branchId: string;
}

function mapShapeToSize(shape: string) {
  if (shape === "round") return { width: 64, height: 64 };
  if (shape === "rectangle") return { width: 120, height: 56 };
  if (shape === "booth") return { width: 140, height: 80 };
  return { width: 64, height: 64 };
}

export default function CustomerTableSelector({ branchId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["floor-layout","live", branchId],
    queryFn: () => apiClient.get<any>(`/floor-layout/branch/${branchId}/live`),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });

  const setTable = useCart.getState().setTable;
  const [selected, setSelected] = useState<string | null>(null);

  const firstFloorTables = useMemo(() => {
    if (!data || !data.floors || data.floors.length === 0) return [];
    const floor = data.floors[0];
    return (floor.tables || []).map((t: any) => {
      const size = mapShapeToSize(t.shape);
      return {
        id: t.id ?? t.label,
        label: t.label,
        capacity: t.capacity,
        shape: t.shape,
        x: t.x ?? t.x_pos ?? 0,
        y: t.y ?? t.y_pos ?? 0,
        width: size.width,
        height: size.height,
        status: t.status ?? "free",
      };
    });
  }, [data]);

  const handleTableClick = (table: any) => {
    if (table.status !== "free") {
      toast.info(`Table ${table.label} is ${table.status}`);
      return;
    }
    setSelected(table.id);
    setTable(table.id);
    toast.success(`Selected table ${table.label}`);
  };

  if (isLoading) return <div className="p-6">Loading layout…</div>;
  if (!branchId) return <div className="p-6 text-sm text-gray-500">Branch not selected</div>;

  const handleConfirm = () => {
    if (!selected) {
      toast.error('Please select a table first');
      return;
    }
    setTable(selected);
    toast.success('Table saved to cart');
    router.push('/customer/cart');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select a table</h3>
        {selected && <div className="text-sm text-gray-600">Selected: {selected}</div>}
      </div>

      <FloorMap tables={firstFloorTables} branchId={branchId} readOnly onTableClick={handleTableClick} />

      <div className="flex items-center gap-3 pt-3">
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
          disabled={!selected}
          onClick={handleConfirm}
        >
          Confirm table
        </button>
        <button
          className="px-3 py-2 border rounded text-sm"
          onClick={() => { setSelected(null); toast('Selection cleared'); }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
