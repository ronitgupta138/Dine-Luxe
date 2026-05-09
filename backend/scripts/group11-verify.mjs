const BASE = 'http://localhost:5001/api/v1';

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
    data = null;
  }

  return { status: res.status, data };
}

async function login(emailOrUsername, password) {
  const { status, data } = await request('POST', '/auth/login', null, {
    emailOrUsername,
    password,
  });

  return {
    status,
    token: data?.data?.accessToken ?? null,
    data,
  };
}

async function bootstrapTokens() {
  let owner = await login('priya.mehta@restaurant.com', 'Owner@1234');
  if (!owner.token) {
    owner = await login('priya.mehta1@restaurant.com', 'Owner@1234');
  }

  const manager = await login('arjun.manager@spicegarden.com', '15051988');
  let admin = await login('admin@platform.com', 'Admin@Secure123');

  if (!admin.token) {
    const superEmail = `superadmin.${Date.now()}@platform.com`;
    await request('POST', '/admin/signup', null, {
      email: superEmail,
      password: 'Admin@Secure123',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '9876543219',
    });

    const superAdmin = await login(superEmail, 'Admin@Secure123');
    if (superAdmin.token) {
      await request('POST', '/admin/create-admin', superAdmin.token, {
        email: 'admin@platform.com',
        password: 'Admin@Secure123',
        first_name: 'Platform',
        last_name: 'Admin',
        phone: '9876543220',
      });
    }

    admin = await login('admin@platform.com', 'Admin@Secure123');
  }

  return {
    ownerToken: owner.token,
    managerToken: manager.token,
    adminToken: admin.token,
    debug: {
      ownerLoginStatus: owner.status,
      managerLoginStatus: manager.status,
      adminLoginStatus: admin.status,
    },
  };
}

function pushResult(results, run, step, expected, actual) {
  results.push({ run, step, expected, actual, pass: expected === actual });
}

async function runSuite(runLabel, tokens, branchId) {
  const results = [];
  const from = '2026-05-01';
  const to = '2026-05-08';
  const today = new Date().toISOString().slice(0, 10);

  const cases = [
    ['1', 200, 'GET', `/analytics/menu-suggestions/${branchId}`, tokens.ownerToken],
    ['2', 200, 'GET', `/analytics/demand-forecast/${branchId}`, tokens.ownerToken],
    ['3', 200, 'GET', `/analytics/bundle-opportunities/${branchId}`, tokens.ownerToken],
    ['4', 200, 'GET', `/analytics/staffing-recommendation/${branchId}`, tokens.ownerToken],
    ['5a', 200, 'GET', `/analytics/menu-suggestions/${branchId}`, tokens.managerToken],
    ['5b', 200, 'GET', `/analytics/demand-forecast/${branchId}`, tokens.managerToken],
    ['6', 200, 'GET', `/reports/sales?branch_id=${branchId}&from=${from}&to=${to}`, tokens.ownerToken],
    ['7', 200, 'GET', `/reports/sales?branch_id=${branchId}&from=${today}&to=${today}`, tokens.managerToken],
    ['8', 200, 'GET', `/reports/menu-performance?branch_id=${branchId}`, tokens.ownerToken],
    ['9', 200, 'GET', `/reports/kitchen-performance?branch_id=${branchId}`, tokens.managerToken],
    ['10', 200, 'GET', `/reports/customer-insights?branch_id=${branchId}`, tokens.ownerToken],
    ['11', 403, 'GET', `/reports/customer-insights?branch_id=${branchId}`, tokens.managerToken],
    ['12', 200, 'POST', '/reports/export', tokens.ownerToken, { report_type: 'sales', branch_id: branchId, from, to, format: 'csv' }],
    ['13', 200, 'POST', '/reports/export', tokens.ownerToken, { report_type: 'menu_performance', branch_id: branchId, format: 'pdf' }],
    ['14', 200, 'GET', '/admin/health', null],
    ['15', 200, 'GET', '/admin/health/detailed', tokens.adminToken],
    ['16', 200, 'GET', '/admin/dashboard', tokens.adminToken],
    ['17', 200, 'GET', '/admin/platform-stats', tokens.adminToken],
    ['18', 200, 'GET', '/admin/restaurants?page=1&limit=20&status=active', tokens.adminToken],
    ['19', 200, 'GET', '/admin/customers?page=1&limit=20', tokens.adminToken],
    ['22', 200, 'GET', '/admin/feedback?page=1&limit=20', tokens.adminToken],
    ['23', 200, 'GET', '/reports/admin/platform', tokens.adminToken],
    ['24', 200, 'GET', '/reports/admin/trends', tokens.adminToken],
    ['N1', 403, 'GET', '/admin/dashboard', tokens.ownerToken],
    ['N2', 403, 'GET', '/admin/platform-stats', tokens.managerToken],
    ['N3', 400, 'GET', `/reports/sales?from=${from}&to=${to}`, tokens.ownerToken],
    ['N4', 400, 'GET', `/reports/sales?branch_id=${branchId}&from=${to}&to=${from}`, tokens.ownerToken],
    ['N6', 400, 'POST', '/reports/export', tokens.ownerToken, { report_type: 'sales', branch_id: branchId, format: 'xlsx' }],
  ];

  for (const [step, expected, method, path, token, body] of cases) {
    const { status } = await request(method, path, token, body);
    pushResult(results, runLabel, step, expected, status);
  }

  const customersRes = await request('GET', '/admin/customers?page=1&limit=20', tokens.adminToken);
  const customerRows = customersRes.data?.data?.data ?? customersRes.data?.data ?? customersRes.data ?? [];
  const rahul = Array.isArray(customerRows)
    ? customerRows.find((row) => row.email === 'rahul.sharma@gmail.com')
    : null;
  const customerId = rahul?.id ?? customerRows?.[0]?.id ?? null;

  if (customerId) {
    const s20 = await request('PATCH', `/admin/customers/${customerId}/status`, tokens.adminToken, {
      status: 'banned',
      reason: 'Fraudulent chargebacks',
    });
    pushResult(results, runLabel, '20', 200, s20.status);

    const s20b = await request('POST', '/auth/login', null, {
      emailOrUsername: 'rahul.sharma@gmail.com',
      password: 'Customer@123',
    });
    pushResult(results, runLabel, '20b', 403, s20b.status);

    const s21 = await request('PATCH', `/admin/customers/${customerId}/status`, tokens.adminToken, {
      status: 'active',
    });
    pushResult(results, runLabel, '21', 200, s21.status);
  } else {
    results.push({
      run: runLabel,
      step: '20/20b/21',
      expected: 'customer id',
      actual: 'missing',
      pass: false,
    });
  }

  return results;
}

(async () => {
  const tokens = await bootstrapTokens();

  if (!tokens.ownerToken || !tokens.managerToken || !tokens.adminToken) {
    console.log(JSON.stringify({
      ok: false,
      reason: 'token_bootstrap_failed',
      tokens: {
        owner: Boolean(tokens.ownerToken),
        manager: Boolean(tokens.managerToken),
        admin: Boolean(tokens.adminToken),
      },
      debug: tokens.debug,
    }, null, 2));
    process.exit(0);
  }

  const branchesRes = await request('GET', '/branches', tokens.ownerToken);
  const branchId = branchesRes.data?.data?.[0]?.id ?? branchesRes.data?.[0]?.id ?? null;

  if (!branchId) {
    console.log(JSON.stringify({ ok: false, reason: 'branch_not_found' }, null, 2));
    process.exit(0);
  }

  const run1 = await runSuite('RUN1', tokens, branchId);
  const run2 = await runSuite('RUN2', tokens, branchId);
  const all = [...run1, ...run2];

  const failed = all.filter((r) => !r.pass);
  console.log(JSON.stringify({
    ok: failed.length === 0,
    tokens: {
      owner: Boolean(tokens.ownerToken),
      manager: Boolean(tokens.managerToken),
      admin: Boolean(tokens.adminToken),
    },
    branchId,
    total: all.length,
    failedCount: failed.length,
    failed,
  }, null, 2));
})();
