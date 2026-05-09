const BASE = process.env.BASE ?? 'http://localhost:5001/api/v1';

async function request(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }

  return { status: res.status, data };
}

async function login(emailOrUsername, password) {
  const { data } = await request('POST', '/auth/login', null, {
    emailOrUsername,
    password,
  });
  return data?.data?.accessToken ?? null;
}

async function bootstrapTokens() {
  const ownerToken = await login('priya.mehta1@restaurant.com', 'Owner@1234');
  const managerToken = await login('arjun.manager@spicegarden.com', '15051988');

  const waiterLoginCandidates = [
    ['waiter@spicegarden.com', 'Waiter@1234'],
    ['arjun.waiter@spicegarden.com', '15051988'],
    ['waiter1@spicegarden.com', 'Waiter@1234'],
  ];

  let waiterToken = null;
  for (const [email, pass] of waiterLoginCandidates) {
    waiterToken = await login(email, pass);
    if (waiterToken) break;
  }

  return { ownerToken, managerToken, waiterToken };
}

function pickFirstBranchId(branchesRes) {
  const data = branchesRes.data;
  const arr = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.data)
      ? data.data.data
      : Array.isArray(data)
        ? data
        : null;

  return arr?.[0]?.id ?? null;
}

function firstInventoryItem(res) {
  return Array.isArray(res.data?.data?.data)
    ? res.data.data.data[0]
    : Array.isArray(res.data?.data)
      ? res.data.data[0]
      : null;
}

async function runStep(results, expectedStatuses, step) {
  const res = await request(step.method, step.path, step.token, step.body);
  const passed = expectedStatuses.includes(res.status);

  results.push({
    step: step.label,
    method: step.method,
    path: step.path,
    expectedStatuses,
    status: res.status,
    passed,
    dataSummary: res.data?.error?.message ?? res.data?.message ?? res.data?.status ?? null,
    data: res.data,
  });

  return res;
}

async function main() {
  const tokens = await bootstrapTokens();
  const missing = [];
  if (!tokens.ownerToken) missing.push('ownerToken');
  if (!tokens.managerToken) missing.push('managerToken');

  if (missing.length) {
    console.log(JSON.stringify({ ok: false, reason: 'missing_tokens', missing }, null, 2));
    process.exit(0);
  }

  const branchesRes = await request('GET', '/branches', tokens.ownerToken);
  const branchId = pickFirstBranchId(branchesRes);

  if (!branchId) {
    console.log(JSON.stringify({ ok: false, reason: 'branch_not_found', branchesStatus: branchesRes.status, branchesData: branchesRes.data }, null, 2));
    process.exit(0);
  }

  const results = [];
  const ids = {};

  await runStep(results, [200], {
    label: 'STEP1 GET /inventory/branch/:branchId',
    method: 'GET',
    token: tokens.managerToken,
    path: `/inventory/branch/${branchId}`,
  });

  const createItems = [
    ['paneer', { name: 'Paneer', unit: 'kg', quantity: 10, min_threshold: 2, cost_per_unit: 320, category: 'dairy', supplier: 'Fresh Dairy Co.' }],
    ['chicken', { name: 'Chicken', unit: 'kg', quantity: 15, min_threshold: 3, cost_per_unit: 180, category: 'protein', supplier: 'Fresh Meats Ltd.' }],
    ['tomato', { name: 'Tomatoes', unit: 'kg', quantity: 8, min_threshold: 2, cost_per_unit: 40, category: 'vegetable', supplier: 'Local Market' }],
    ['flour', { name: 'Wheat Flour', unit: 'kg', quantity: 25, min_threshold: 5, cost_per_unit: 45, category: 'dry_goods', supplier: 'Grain Suppliers Inc.' }],
    ['butter', { name: 'Butter', unit: 'kg', quantity: 4, min_threshold: 1, cost_per_unit: 500, category: 'dairy', supplier: 'Fresh Dairy Co.' }],
    ['oil', { name: 'Cooking Oil', unit: 'l', quantity: 1, min_threshold: 3, cost_per_unit: 160, category: 'oil', supplier: 'Oil Depot' }],
  ];

  for (const [key, item] of createItems) {
    const res = await runStep(results, [201], {
      label: `STEP2 POST /inventory (${item.name})`,
      method: 'POST',
      token: tokens.managerToken,
      path: '/inventory',
      body: { branch_id: branchId, ...item },
    });
    ids[key] = res.data?.data?.id;
  }

  await runStep(results, [200], {
    label: 'STEP3 PATCH /inventory/:id (restock paneer)',
    method: 'PATCH',
    token: tokens.managerToken,
    path: `/inventory/${ids.paneer}`,
    body: { quantity: 20, min_threshold: 3, cost_per_unit: 310, notes: 'Restocked - new supplier price' },
  });

  await runStep(results, [200], {
    label: 'STEP4 POST /inventory/deduct',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/deduct',
    body: {
      items: [
        { inventory_id: ids.paneer, quantity: 0.5 },
        { inventory_id: ids.tomato, quantity: 1.2 },
        { inventory_id: ids.flour, quantity: 0.3 },
      ],
      reason: 'Used for lunch service orders',
    },
  });

  await runStep(results, [201], {
    label: 'STEP5 POST /inventory/waste-log (chicken)',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/waste-log',
    body: { inventory_id: ids.chicken, quantity: 0.8, reason: 'Spoiled overnight - fridge issue' },
  });

  await runStep(results, [201], {
    label: 'STEP6 POST /inventory/waste-log (tomatoes)',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/waste-log',
    body: { inventory_id: ids.tomato, quantity: 0.5, reason: 'Overripe batch discarded' },
  });

  await runStep(results, [200], {
    label: 'STEP7 GET /inventory/branch/:branchId/alerts',
    method: 'GET',
    token: tokens.managerToken,
    path: `/inventory/branch/${branchId}/alerts`,
  });

  await runStep(results, [200], {
    label: 'STEP8 POST /inventory/deduct (flour below threshold)',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/deduct',
    body: { items: [{ inventory_id: ids.flour, quantity: 21 }], reason: 'Large banquet order' },
  });

  await runStep(results, [200], {
    label: 'STEP8 GET /inventory/branch/:branchId/alerts',
    method: 'GET',
    token: tokens.managerToken,
    path: `/inventory/branch/${branchId}/alerts`,
  });

  await runStep(results, [200], {
    label: 'STEP9 PATCH /inventory/:id (restock oil)',
    method: 'PATCH',
    token: tokens.managerToken,
    path: `/inventory/${ids.oil}`,
    body: { quantity: 10 },
  });

  await runStep(results, [200], {
    label: 'STEP10 GET /inventory/branch/:branchId',
    method: 'GET',
    token: tokens.managerToken,
    path: `/inventory/branch/${branchId}`,
  });

  await runStep(results, [400], {
    label: 'Negative: deduct more than available',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/deduct',
    body: { items: [{ inventory_id: ids.paneer, quantity: 9999 }], reason: 'Impossible deduction' },
  });

  await runStep(results, [400], {
    label: 'Negative: create inventory with negative quantity',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory',
    body: { branch_id: branchId, name: 'Negative Item', unit: 'kg', quantity: -5, min_threshold: 1, cost_per_unit: 100, category: 'dairy' },
  });

  if (tokens.waiterToken) {
    await runStep(results, [403], {
      label: 'Negative: waiter GET inventory',
      method: 'GET',
      token: tokens.waiterToken,
      path: `/inventory/branch/${branchId}`,
    });
  }

  await runStep(results, [404], {
    label: 'Negative: waste for non-existent inventory',
    method: 'POST',
    token: tokens.managerToken,
    path: '/inventory/waste-log',
    body: { inventory_id: '00000000-0000-0000-0000-000000000000', quantity: 1, reason: 'Test' },
  });

  const latestInventory = await request('GET', `/inventory/branch/${branchId}`, tokens.managerToken);
  const sampleItem = firstInventoryItem(latestInventory);
  console.log(JSON.stringify({
    ok: results.every(result => result.passed),
    branchId,
    ids,
    sampleItem,
    results,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
