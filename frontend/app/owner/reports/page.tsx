"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth }   from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, ShoppingBag, Star } from "lucide-react";
 
interface ReportData {
  summary: { totalRevenue:number; totalOrders:number; avgOrderValue:number; avgRating:number };
  daily:   { date:string; revenue:number; orders:number }[];
  topItems:{ name:string; revenue:number; orderCount:number }[];
  byType:  { type:string; revenue:number; count:number }[];
}
 
type Range = "7d"|"30d"|"90d"|"custom";
 
export default function ReportsPage() {
  const { restaurantId } = useAuth();
  const [range, setRange]     = useState<Range>("30d");
  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");
 
  const queryRange = range === "custom" ? `from=${from}&to=${to}` : `range=${range}`;
 
  const { data, isLoading } = useQuery({
    queryKey: ["owner","reports", restaurantId, queryRange],
    queryFn:  () => apiClient.get<ReportData>(`/restaurant/${restaurantId}/reports?${queryRange}`),
    enabled: !!restaurantId && (range !== "custom" || (!!from && !!to)),
  });
 
  const exportCSV = async () => {
    const blob = await fetch(`/api/v1/restaurant/${restaurantId}/reports/export?${queryRange}`)
      .then(r => r.blob());
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url; a.download = `report_${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
 
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Range Selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(["7d","30d","90d","custom"] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${range===r?"bg-white shadow text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "Custom"}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Download size={15}/> Export CSV
          </button>
        </div>
      </div>
 
      {/* Custom Date Range */}
      {range === "custom" && (
        <div className="flex items-center gap-3">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
          <span className="text-gray-400">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/30"/>
        </div>
      )}
 
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label:"Total Revenue",    val:formatCurrency(data?.summary.totalRevenue ?? 0),       icon:TrendingUp,  color:"bg-[#1A3C5E]" },
          { label:"Total Orders",     val:String(data?.summary.totalOrders ?? 0),                icon:ShoppingBag, color:"bg-[#E8A020]" },
          { label:"Avg Order Value",  val:formatCurrency(data?.summary.avgOrderValue ?? 0),      icon:TrendingUp,  color:"bg-emerald-500" },
          { label:"Avg Rating",       val:(data?.summary.avgRating ?? 0).toFixed(1) + " ",     icon:Star,        color:"bg-purple-500" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.color}`}><c.icon size={14} className="text-white"/></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? "" : c.val}</p>
          </div>
        ))}
      </div>
 
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Revenue</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data?.daily ?? []}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1A3C5E" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#1A3C5E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="date" tick={{ fontSize:11 }}/>
            <YAxis tickFormatter={v => `${v/1000}k`} tick={{ fontSize:11 }}/>
            <Tooltip formatter={(v:number) => formatCurrency(v)}/>
            <Area type="monotone" dataKey="revenue" stroke="#1A3C5E" strokeWidth={2} fill="url(#rev)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
 
      {/* Top Items */}
      {data?.topItems && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Top Performing Items</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Item","Orders","Revenue"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.topItems.map((item,i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-5 py-3 text-gray-600">{item.orderCount}</td>
                  <td className="px-5 py-3 font-semibold text-[#1A3C5E]">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
