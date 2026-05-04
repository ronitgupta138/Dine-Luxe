const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOWI1OGMzMS0xYzc1LTQxMGEtODc3NS05Mzg3YzljMTY2NzAiLCJlbWFpbCI6ImFkbWluLnRlc3QrMjAyNjA1MDRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJyZXN0YXVyYW50X2lkIjoiY2ZhYWEzY2QtZjFjMC00Y2I1LTkxMTItZDg5YTRhZmFmZDMzIiwiYnJhbmNoX2lkIjoiNDY2NjdhNjYtMGY0OC00MmI0LTk2MDYtMWQ2MGU1NWU3MmQyIiwiaWF0IjoxNzc3ODkyOTQ1LCJleHAiOjE3Nzc4OTM4NDV9.V3nujJ2HsftiBwcInY3gHDcwGa4qPkU2ESk0tMmCJuE';
const BASE = 'http://localhost:5001/api/v1';
const branchId = '46667a66-0f48-42b4-9606-1d60e55e72d2';
const restaurantId = 'cfaaa3cd-f1c0-4cb5-9112-d89a4afafd33';
const orderId = 'd047e774-7dd1-4a26-a311-695f2cbf7fe1';
const bookingId = '75a161b4-ac62-4ef0-921f-ccacdaf561d6';

async function hit(name, method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let text = '';
  try { text = await res.text(); } catch {}
  let message = '';
  try {
    const parsed = JSON.parse(text || '{}');
    message = parsed.message || parsed.error?.message || parsed.error || '';
  } catch {}
  console.log(JSON.stringify({ name, method, path, status: res.status, message }));
}

(async () => {
  await hit('floor-layout-live', 'GET', `/floor-layout/branch/${branchId}/live`);
  await hit('inventory-list', 'GET', `/inventory/branch/${branchId}`);
  await hit('inventory-alerts', 'GET', `/inventory/branch/${branchId}/alerts`);
  await hit('kitchen-tickets', 'GET', `/kitchen/branch/${branchId}/tickets`);
  await hit('kitchen-overdue', 'GET', `/kitchen/branch/${branchId}/overdue`);
  await hit('analytics-menu', 'GET', `/analytics/menu-suggestions/${branchId}`);
  await hit('analytics-forecast', 'GET', `/analytics/demand-forecast/${branchId}`);
  await hit('loyalty-balance', 'GET', '/loyalty/balance');
  await hit('notifications', 'GET', '/notifications');
  await hit('orders-active', 'GET', `/orders/branch/${branchId}/active`);
  await hit('order-items', 'GET', `/order-items/order/${orderId}`);
  await hit('payments-status', 'GET', `/payments/upi/status/${orderId}`);
  await hit('payments-receipt', 'GET', `/payments/receipt/${orderId}`);
  await hit('queue-branch', 'GET', `/queue/branch/${branchId}`);
  await hit('reports-sales', 'GET', '/reports/sales');
  await hit('reports-menu', 'GET', '/reports/menu-performance');
  await hit('reviews-restaurant', 'GET', `/reviews/restaurant/${restaurantId}`, null, false);
  await hit('staff-branch', 'GET', `/staff/branch/${branchId}`);
  await hit('support-tickets', 'GET', '/support/tickets');
  await hit('geo-arrival', 'POST', '/geo/arrival-check', { lat: 12.9716, lon: 77.5946, bookingId });
})();
