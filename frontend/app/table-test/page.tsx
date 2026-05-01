"use client"

import CustomerTableSelector from "@/components/floor/CustomerTableSelector";

export default function Page() {
  // use the mock branch id that the API route doesn't validate
  const branchId = 'demo-branch';

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Table selector test (demo)</h2>
        <CustomerTableSelector branchId={branchId} />
      </div>
    </div>
  );
}
