"use client"

import RouteShell from '@/components/shared/RouteShell'
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import CustomerTableSelector from "@/components/floor/CustomerTableSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Props {
  params: { restaurantId: string };
}

export default function Page({ params }: Props) {
  const { restaurantId } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => apiClient.get<any>(`/restaurants/${restaurantId}`),
    enabled: !!restaurantId,
  });

  const branchId = data?.branches?.[0]?.id;

  return (
    <RouteShell>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{data?.name ?? 'Restaurant'}</h1>
            <p className="text-sm text-gray-500">{data?.tagline}</p>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4 rounded-lg shadow-sm">
          {isLoading ? (
            <div>Loading restaurant…</div>
          ) : (
            <CustomerTableSelector branchId={branchId} />
          )}
        </div>
      </div>
    </RouteShell>
  );
}
