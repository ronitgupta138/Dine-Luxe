"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient }   from "@/lib/api-client";
import { useDebounce } from "@/hooks/useDebounce";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate }  from "@/lib/utils";
import { Search, Plus, Power, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
 
interface Restaurant {
  id:string; name:string; ownerName:string; ownerEmail:string;
  city:string; plan:string; isActive:boolean; createdAt:string; totalBranches:number;
}
 
export default function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debounced           = useDebounce(search, 350);
 
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["admin","restaurants", debounced],
    queryFn:  () => apiClient.get<Restaurant[]>(`/admin/restaurants?q=${debounced}`),
  });
 
  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }:{ id:string; isActive:boolean }) =>
      apiClient.patch(`/admin/restaurants/${id}`, { isActive }),
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey:["admin","restaurants"] });
      toast.success(isActive ? "Restaurant activated" : "Restaurant suspended");
    },
    onError: () => toast.error("Failed to update restaurant"),
  });
 
  const PLAN_COLORS: Record<string,string> = {
    starter:"bg-gray-100 text-gray-600",
    growth: "bg-blue-100 text-blue-700",
    pro:    "bg-purple-100 text-purple-700",
    enterprise:"bg-amber-100 text-amber-700",
  };
 
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
        <Link href="/admin/restaurants/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3C5E] text-white rounded-xl text-sm font-semibold hover:bg-[#15304d] transition">
          <Plus size={16}/> Onboard Restaurant
        </Link>
      </div>
 
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full max-w-sm">
        <Search size={16} className="text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city, owner..."
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"/>
      </div>
 
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Restaurant","Owner","City","Plan","Branches","Status","Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
              )}
              {restaurants.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">Since {formatDate(r.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-gray-800">{r.ownerName}</p>
                    <p className="text-xs text-gray-400">{r.ownerEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.city}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${PLAN_COLORS[r.plan] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.totalBranches}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.isActive ? "active" : "inactive"} size="sm"/>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/restaurants/${r.id}`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
                        <ExternalLink size={14}/>
                      </Link>
                      <button onClick={() => toggleActive({ id:r.id, isActive:!r.isActive })}
                        className={`p-1.5 rounded-lg transition ${r.isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}>
                        <Power size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && restaurants.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No restaurants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
