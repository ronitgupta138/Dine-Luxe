"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { useAuth }   from "@/hooks/useAuth";
import { ROLES }     from "@/lib/constants";
import { maskPhone } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plus, Pencil, UserX, UserCheck, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
 
interface StaffMember {
  id:string; name:string; email:string; phone:string;
  role:string; isActive:boolean; tablesAssigned:number; joinedAt:string;
}
 
const STAFF_ROLES = [ROLES.MANAGER, ROLES.HOST, ROLES.WAITER, ROLES.CHEF, ROLES.CASHIER] as const;
 
const staffSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  phone:    z.string().min(10),
  role:     z.enum(STAFF_ROLES),
  branchId: z.string().min(1, "Branch required"),
});
type StaffForm = z.infer<typeof staffSchema>;
 
export default function StaffPage() {
  const { restaurantId } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch]       = useState("");
  const [editStaff, setEdit]      = useState<StaffMember|null>(null);
  const [showForm, setShowForm]   = useState(false);
  const debouncedSearch           = useDebounce(search, 350);
 
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["owner","staff", restaurantId, debouncedSearch],
    queryFn:  () => apiClient.get<StaffMember[]>(`/restaurant/${restaurantId}/staff?q=${debouncedSearch}`),
    enabled: !!restaurantId,
  });
 
  const { data: branches = [] } = useQuery({
    queryKey: ["owner","branches", restaurantId],
    queryFn:  () => apiClient.get<{ id:string; name:string }[]>(`/restaurant/${restaurantId}/branches`),
    enabled: !!restaurantId,
  });
 
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<StaffForm>({ resolver: zodResolver(staffSchema) });
 
  const { mutate: saveStaff } = useMutation({
    mutationFn: (data: StaffForm) => editStaff
      ? apiClient.patch(`/staff/${editStaff.id}`, data)
      : apiClient.post(`/restaurant/${restaurantId}/staff`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["owner","staff"] });
      toast.success(editStaff ? "Staff updated" : "Staff invited  login credentials sent via email");
      setShowForm(false); setEdit(null); reset();
    },
    onError: () => toast.error("Operation failed"),
  });
 
  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }:{ id:string; isActive:boolean }) =>
      apiClient.patch(`/staff/${id}`, { isActive }),
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey:["owner","staff"] });
      toast.success(isActive ? "Staff activated" : "Staff deactivated");
    },
  });
 
  const openEdit = (member: StaffMember) => {
    setEdit(member);
    reset({ name:member.name, email:member.email, phone:member.phone, role:member.role as any, branchId:"" });
    setShowForm(true);
  };
 
  const ROLE_COLORS: Record<string, string> = {
    manager:"bg-purple-100 text-purple-700", host:"bg-blue-100 text-blue-700",
    waiter:"bg-green-100 text-green-700",    chef:"bg-amber-100 text-amber-700",
    cashier:"bg-rose-100 text-rose-700",
  };
 
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff Roster</h1>
        <button onClick={() => { setEdit(null); reset(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3C5E] text-white rounded-xl text-sm font-semibold hover:bg-[#15304d] transition">
          <Plus size={16}/> Add Staff
        </button>
      </div>
 
      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full max-w-sm">
        <Search size={16} className="text-gray-400 shrink-0"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or role..."
          className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"/>
      </div>
 
      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Name","Role","Contact","Tables","Status","Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              )}
              {staff.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{maskPhone(m.phone)}</td>
                  <td className="px-5 py-3 text-gray-600">{m.tablesAssigned}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.isActive ? "active" : "inactive"} size="sm"/>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => toggleActive({ id:m.id, isActive:!m.isActive })}
                        className={`p-1.5 rounded-lg transition ${m.isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}>
                        {m.isActive ? <UserX size={14}/> : <UserCheck size={14}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && staff.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No staff found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Slide-in Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editStaff ? "Edit Staff" : "Add Staff Member"}</h2>
              <button onClick={() => { setShowForm(false); setEdit(null); reset(); }}
                className="p-2 rounded-lg hover:bg-gray-100 transition"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(d => saveStaff(d))} className="px-5 py-4 space-y-4">
              {[
                { label:"Full Name", name:"name", type:"text",  placeholder:"e.g. Priya Sharma" },
                { label:"Email",     name:"email", type:"email", placeholder:"staff@email.com" },
                { label:"Phone",     name:"phone", type:"tel",   placeholder:"+91 98765 43210" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input {...register(f.name as any)} type={f.type} placeholder={f.placeholder}
                    disabled={!!editStaff && f.name === "email"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30 disabled:bg-gray-50"/>
                  {errors[f.name as keyof StaffForm] && (
                    <p className="text-xs text-red-500 mt-1">{errors[f.name as keyof StaffForm]?.message}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                <select {...register("role")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30">
                  {STAFF_ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Branch</label>
                <select {...register("branchId")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30">
                  <option value="">Select branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-[#1A3C5E] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#15304d] transition">
                {isSubmitting && <Loader2 size={15} className="animate-spin"/>}
                {editStaff ? "Save Changes" : "Invite Staff"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
