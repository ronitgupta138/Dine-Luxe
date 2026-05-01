"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatDate, isValidHexColor } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Save, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
 
interface RestaurantDetail {
  id:string; name:string; ownerName:string; ownerEmail:string;
  city:string; plan:string; isActive:boolean; createdAt:string;
  branding:{ primaryColor:string; secondaryColor:string; appNameDisplay:string; logoUrl:string|null };
  branches:{ id:string; name:string; city:string; isActive:boolean }[];
}
 
export default function RestaurantDetailPage() {
  const { id } = useParams<{ id:string }>();
  const qc     = useQueryClient();
 
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["admin","restaurant", id],
    queryFn:  () => apiClient.get<RestaurantDetail>(`/admin/restaurants/${id}`),
    enabled: !!id,
  });
 
  const [branding, setBranding] = useState({ primaryColor:"", secondaryColor:"", appNameDisplay:"" });
 
  const { mutate: saveBranding, isPending: savingBranding } = useMutation({
    mutationFn: () => apiClient.patch(`/admin/restaurants/${id}/branding`, branding),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:["admin","restaurant",id] }); toast.success("Branding saved"); },
    onError:    () => toast.error("Failed to save branding"),
  });
 
  const { mutate: toggleRestaurant } = useMutation({
    mutationFn: (isActive:boolean) => apiClient.patch(`/admin/restaurants/${id}`, { isActive }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:["admin","restaurant",id] }); toast.success("Restaurant updated"); },
  });
 
  const { mutate: changePlan } = useMutation({
    mutationFn: (plan:string) => apiClient.patch(`/admin/restaurants/${id}`, { plan }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:["admin","restaurant",id] }); toast.success("Plan updated"); },
  });
 
  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-32 rounded-xl"/>)}</div>;
  if (!restaurant) return null;
 
  const b = branding.primaryColor ? branding : restaurant.branding;
 
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{restaurant.ownerName}  {restaurant.city}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={restaurant.isActive ? "active" : "inactive"}/>
          <button onClick={() => toggleRestaurant(!restaurant.isActive)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${restaurant.isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}>
            {restaurant.isActive ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
 
      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Plan",     val:restaurant.plan },
          { label:"Branches", val:String(restaurant.branches.length) },
          { label:"Owner",    val:restaurant.ownerEmail },
          { label:"Joined",   val:formatDate(restaurant.createdAt) },
        ].map(f => (
          <div key={f.label}>
            <p className="text-xs text-gray-400 font-medium">{f.label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{f.val}</p>
          </div>
        ))}
      </div>
 
      {/* Plan Upgrade */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Subscription Plan</h3>
        <div className="flex gap-2 flex-wrap">
          {["starter","growth","pro","enterprise"].map(plan => (
            <button key={plan} onClick={() => changePlan(plan)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize border transition ${restaurant.plan === plan ? "bg-[#1A3C5E] text-white border-[#1A3C5E]" : "border-gray-200 text-gray-600 hover:border-[#1A3C5E]"}`}>
              {plan}
            </button>
          ))}
        </div>
      </div>
 
      {/* Branding Editor */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Branding</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">App Name Display</label>
            <input value={b.appNameDisplay}
              onChange={e => setBranding(prev => ({ ...prev, appNameDisplay: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={b.primaryColor}
                onChange={e => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
              <input value={b.primaryColor}
                onChange={e => isValidHexColor(e.target.value) && setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={b.secondaryColor}
                onChange={e => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
              <input value={b.secondaryColor}
                onChange={e => isValidHexColor(e.target.value) && setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none"/>
            </div>
          </div>
        </div>
        <button onClick={() => saveBranding()} disabled={savingBranding}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#1A3C5E] text-white rounded-xl text-sm font-semibold disabled:opacity-60 hover:bg-[#15304d] transition">
          {savingBranding ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
          Save Branding
        </button>
      </div>
 
      {/* Branches */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 size={16} className="text-gray-500"/>
          <h3 className="text-sm font-semibold text-gray-700">Branches ({restaurant.branches.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {restaurant.branches.map(branch => (
            <div key={branch.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{branch.name}</p>
                <p className="text-xs text-gray-400">{branch.city}</p>
              </div>
              <StatusBadge status={branch.isActive ? "active" : "inactive"} size="sm"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
