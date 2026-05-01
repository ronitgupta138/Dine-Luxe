"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
 
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  addons?: { name: string; extraPrice: number }[];
  photoUrl?: string;
}
 
interface CartState {
  items:        CartItem[];
  restaurantId: string | null;
  branchId:     string | null;
  tableId:      string | null;
  addItem:       (item: CartItem, restaurantId: string | null, branchId: string | null) => void;

  removeItem:    (menuItemId: string) => void;
  updateQuantity:(menuItemId: string, quantity: number) => void;
  updateNotes:   (menuItemId: string, notes: string) => void;
  setTable:      (tableId: string) => void;
  clearCart:     () => void;
  total:         () => number;
  itemCount:     () => number;
}
 
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [], restaurantId: null, branchId: null, tableId: null,
 
      addItem: (newItem, restaurantId, branchId) => {
        const { items, restaurantId: cur } = get();
        if (cur && cur !== restaurantId) {
          set({ items: [newItem], restaurantId, branchId });
          return;
        }
        const existing = items.find((i) => i.menuItemId === newItem.menuItemId);
        if (existing) {
          set({ items: items.map((i) => i.menuItemId === newItem.menuItemId
            ? { ...i, quantity: i.quantity + newItem.quantity } : i) });
        } else {
          set({ items: [...items, newItem], restaurantId, branchId });
        }
      },
 
      removeItem: (menuItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.menuItemId !== menuItemId) })),
 
      updateQuantity: (menuItemId, quantity) =>
        set((s) => ({
          items: quantity <= 0
            ? s.items.filter((i) => i.menuItemId !== menuItemId)
            : s.items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity } : i),
        })),
 
      updateNotes: (menuItemId, notes) =>
        set((s) => ({ items: s.items.map((i) => i.menuItemId === menuItemId ? { ...i, notes } : i) })),
 
      setTable: (tableId) => set({ tableId }),
 
      clearCart: () => set({ items: [], restaurantId: null, branchId: null, tableId: null }),
 
      total: () => get().items.reduce((sum, item) => {
        const addonsTotal = item.addons?.reduce((a, b) => a + b.extraPrice, 0) ?? 0;
        return sum + (item.price + addonsTotal) * item.quantity;
      }, 0),
 
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "dineluxe-cart" }
  )
);
