const baseUrl = (process.env.BASE_URL ?? 'http://localhost:5001').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function summarize(body) {
  if (!body || typeof body !== 'object') return body;
  return body.error?.message ?? body.message ?? body.status ?? body.success ?? body;
}

const checks = [
  {
    name: 'GET /health',
    run: async () => {
      const { response, body } = await request('/health');
      assert(response.status === 200, `expected 200, got ${response.status}`);
      assert(body?.status === 'ok', `expected status ok, got ${summarize(body)}`);
    },
  },
  {
    name: 'GET /api/v1/health',
    run: async () => {
      const { response, body } = await request('/api/v1/health');
      assert(response.status === 200, `expected 200, got ${response.status}`);
      assert(body?.status === 'ok', `expected status ok, got ${summarize(body)}`);
    },
  },
  {
    name: 'GET /api/v1/admin/health',
    run: async () => {
      const { response, body } = await request('/api/v1/admin/health');
      assert(response.status === 200, `expected 200, got ${response.status}`);
      assert(body?.success === true, `expected success true, got ${summarize(body)}`);
      assert(body?.data, 'expected admin health payload');
    },
  },
  {
    name: 'POST /api/v1/auth/signup rejects empty body',
    run: async () => {
      const { response } = await request('/api/v1/auth/signup', {
        method: 'POST',
        body: '{}',
      });
      assert(response.status === 400, `expected 400, got ${response.status}`);
    },
  },
  {
    name: 'PATCH /api/v1/menu/categories/reorder requires auth',
    run: async () => {
      const { response } = await request('/api/v1/menu/categories/reorder', {
        method: 'PATCH',
        body: '{}',
      });
      assert(response.status === 401, `expected 401, got ${response.status}`);
    },
  },
  {
    name: 'PATCH /api/v1/notifications/read-all requires auth',
    run: async () => {
      const { response } = await request('/api/v1/notifications/read-all', {
        method: 'PATCH',
      });
      assert(response.status === 401, `expected 401, got ${response.status}`);
    },
  },
  {
    name: 'POST /api/v1/queue/join validates request body',
    run: async () => {
      const { response } = await request('/api/v1/queue/join', {
        method: 'POST',
        body: '{}',
      });
      assert(response.status === 400, `expected 400, got ${response.status}`);
    },
  },
];

let failed = 0;

for (const check of checks) {
  try {
    await check.run();
    console.log(`PASS ${check.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${check.name}`);
    console.error(error instanceof Error ? error.message : String(error));
  }
}

if (failed > 0) {
  console.error(`\nSmoke test failed: ${failed} check(s) failed.`);
  process.exit(1);
}

console.log(`\nSmoke test passed: ${checks.length} checks.`);