"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DIETARY_TAGS, ALLERGENS } from "@/lib/constants";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
 
interface Category { id:string; name:string; displayOrder:number; }
interface MenuItem {
  id:string; categoryId:string; name:string; description:string;
  price:number; photoUrl:string|null; isAvailable:boolean;
  dietaryTags:string[]; allergens:string[]; isPopular:boolean;
}
 
const itemSchema = z.object({
  name:        z.string().min(2, "Name required"),
  description: z.string().optional(),
  price:       z.coerce.number().min(0, "Price must be positive"),
  categoryId:  z.string().min(1, "Category required"),
  isAvailable: z.boolean().default(true),
  isPopular:   z.boolean().default(false),
  dietaryTags: z.array(z.string()).default([]),
  allergens:   z.array(z.string()).default([]),
});
type ItemForm = z.infer<typeof itemSchema>;
 
export default function MenuManagementPage() {
  const { restaurantId }    = useAuth();
  const qc                  = useQueryClient();
  const [activeCategory, setCategory] = useState<string|null>(null);
  const [editItem, setEditItem]       = useState<MenuItem|null>(null);
  const [showForm, setShowForm]       = useState(false);
 
  const { data: categories = [] } = useQuery({
    queryKey: ["owner","menu","categories", restaurantId],
    queryFn:  () => apiClient.get<Category[]>(`/restaurant/${restaurantId}/menu/categories`),
    enabled: !!restaurantId,
  });

  // React Query v5 removed onSuccess from useQuery - use useEffect instead
  useEffect(() => {
    if (categories.length && !activeCategory) {
      setCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
 
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["owner","menu","items", restaurantId, activeCategory],
    queryFn:  () => apiClient.get<MenuItem[]>(`/restaurant/${restaurantId}/menu/items?category=${activeCategory}`),
    enabled: !!restaurantId && !!activeCategory,
  });
 
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<ItemForm>({ resolver: zodResolver(itemSchema) });
 
  const watchTags      = watch("dietaryTags", []);
  const watchAllergens = watch("allergens", []);
 
  const { mutate: saveItem } = useMutation({
    mutationFn: (data: ItemForm) => editItem
      ? apiClient.patch(`/menu-items/${editItem.id}`, data)
      : apiClient.post(`/restaurant/${restaurantId}/menu/items`, { ...data, categoryId: activeCategory }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["owner","menu","items"] });
      toast.success(editItem ? "Item updated" : "Item created");
      setShowForm(false); setEditItem(null); reset();
    },
    onError: () => toast.error("Failed to save item"),
  });
 
  const { mutate: toggleAvailability } = useMutation({
    mutationFn: ({ id, isAvailable }:{ id:string; isAvailable:boolean }) =>
      apiClient.patch(`/menu-items/${id}`, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey:["owner","menu","items"] }),
  });
 
  const { mutate: deleteItem } = useMutation({
    mutationFn: (id:string) => apiClient.delete(`/menu-items/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["owner","menu","items"] }); toast.success("Item deleted"); },
  });
 
  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    reset({
      name: item.name, description: item.description, price: item.price,
      categoryId: item.categoryId, isAvailable: item.isAvailable,
      isPopular: item.isPopular, dietaryTags: item.dietaryTags, allergens: item.allergens,
    });
    setShowForm(true);
  };
 
  const toggleTag = (tag: string, field: "dietaryTags"|"allergens") => {
    const current = field === "dietaryTags" ? watchTags : watchAllergens;
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setValue(field, next);
  };
 
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button onClick={() => { setEditItem(null); reset(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3C5E] text-white rounded-xl text-sm font-semibold hover:bg-[#15304d] transition">
          <Plus size={16}/> Add Item
        </button>
      </div>
 
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0",
              activeCategory === c.id ? "bg-[#1A3C5E] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1A3C5E]")}>
            {c.name}
          </button>
        ))}
      </div>
 
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && [1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-xl"/>)}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <StatusBadge status={item.isAvailable ? "available" : "sold_out"} size="sm"/>
              </div>
              <p className="font-bold text-[#1A3C5E] mt-2">{formatCurrency(item.price)}</p>
              {item.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.dietaryTags.map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">{t.replace("_"," ")}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => toggleAvailability({ id:item.id, isAvailable:!item.isAvailable })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                {item.isAvailable ? <EyeOff size={13}/> : <Eye size={13}/>}
                {item.isAvailable ? "Hide" : "Show"}
              </button>
              <button onClick={() => openEdit(item)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition border-x border-gray-100">
                <Pencil size={13}/> Edit
              </button>
              <button onClick={() => { if (confirm("Delete this item?")) deleteItem(item.id); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition">
                <Trash2 size={13}/> Delete
              </button>
            </div>
          </div>
        ))}
        {!isLoading && items.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400">No items in this category</div>
        )}
      </div>
 
      {/* Slide-in Form Panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{editItem ? "Edit Item" : "New Item"}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); reset(); }}
                className="p-2 rounded-lg hover:bg-gray-100 transition"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(d => saveItem(d))} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Item Name *</label>
                <input {...register("name")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea {...register("description")} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (₹) *</label>
                <input {...register("price")} type="number" step="0.01" min="0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Dietary Tags</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_TAGS.map(tag => (
                    <button type="button" key={tag} onClick={() => toggleTag(tag, "dietaryTags")}
                      className={cn("px-2.5 py-1 rounded-full text-xs font-medium border transition",
                        watchTags.includes(tag) ? "bg-green-100 border-green-400 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                      {tag.replace("_"," ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map(a => (
                    <button type="button" key={a} onClick={() => toggleTag(a, "allergens")}
                      className={cn("px-2.5 py-1 rounded-full text-xs font-medium border transition",
                        watchAllergens.includes(a) ? "bg-amber-100 border-amber-400 text-amber-700" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("isAvailable")} className="rounded"/>
                  <span className="text-sm text-gray-700">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("isPopular")} className="rounded"/>
                  <span className="text-sm text-gray-700">Popular</span>
                </label>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-[#1A3C5E] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#15304d] transition">
                {isSubmitting && <Loader2 size={15} className="animate-spin"/>}
                {editItem ? "Save Changes" : "Create Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
