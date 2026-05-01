"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth }  from "@/hooks/useAuth";
import { useCart }  from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingCart, User, UtensilsCrossed, ChefHat, CreditCard, LayoutDashboard, CalendarDays } from "lucide-react";
 
interface TabItem { label:string; href:string; icon:React.ElementType; badge?:()=>number; }
 
const CUSTOMER_TABS: TabItem[] = [
  { label:"Home",     href:"/home",              icon:Home },
  { label:"Search",   href:"/customer/search",   icon:Search },
  { label:"Cart",     href:"/customer/cart",      icon:ShoppingCart, badge:() => useCart.getState().itemCount() },
  { label:"Profile",  href:"/customer/profile",  icon:User },
];
 
const STAFF_TABS: Record<string, TabItem[]> = {
  manager: [
    { label:"Overview", href:"/staff/manager",        icon:LayoutDashboard },
    { label:"Orders",   href:"/staff/manager/orders", icon:ShoppingCart },
    { label:"Tables",   href:"/staff/manager/floor",  icon:UtensilsCrossed },
  ],
  waiter: [
    { label:"Tables",   href:"/staff/waiter",          icon:UtensilsCrossed },
    { label:"Orders",   href:"/staff/waiter/orders",   icon:ShoppingCart },
  ],
  chef: [
    { label:"Kitchen",  href:"/staff/chef/kds",        icon:ChefHat },
  ],
  cashier: [
    { label:"Bills",    href:"/staff/cashier",         icon:CreditCard },
  ],
  host: [
    { label:"Queue",    href:"/staff/host",            icon:CalendarDays },
  ],
};
 
export function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  const cartCount = useCart(s => s.itemCount());
 
  let tabs: TabItem[] = [];
  if (role === "customer")                        tabs = CUSTOMER_TABS;
  else if (role && STAFF_TABS[role])              tabs = STAFF_TABS[role];
  else                                            return null;
 
  if (tabs.length === 0) return null;
 
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
      <div className="flex">
        {tabs.map(tab => {
          const Icon     = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const badge    = tab.label === "Cart" ? cartCount : 0;
          return (
            <Link key={tab.href} href={tab.href}
              className={cn("flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition",
                isActive ? "text-[#1A3C5E]" : "text-gray-400 hover:text-gray-600")}>
              <div className="relative">
                <Icon size={22}/>
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E8A020] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && <span className="absolute bottom-0 w-10 h-0.5 bg-[#1A3C5E] rounded-t-full"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
