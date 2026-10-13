const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const createApp = require('./src/app');
const RedisLockService = require('./src/services/redisLock');

// Helper to make local HTTP requests to Express app without external supertest library
function makeRequest(server, options, payload = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

test('Dine Luxe API Test Suite', async (t) => {
  let server;
  let app;

  t.beforeEach(() => {
    app = createApp(null);
    server = app.listen(0);
  });

  t.afterEach(() => {
    server.close();
  });

  await t.test('1. Valid reservation creation succeeds with 201 Created', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, {
      customerName: 'Marcus Vance',
      customerEmail: 'marcus@corp.io',
      tableId: 't4',
      timeSlot: '2026-11-20T19:00:00.000Z',
      partySize: 4
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.customerName, 'Marcus Vance');
    assert.strictEqual(res.body.data.status, 'CONFIRMED');
  });

  await t.test('2. Reservation with invalid party size returns 400 Bad Request', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, {
      customerName: 'Marcus Vance',
      customerEmail: 'marcus@corp.io',
      tableId: 't4',
      timeSlot: '2026-11-20T19:00:00.000Z',
      partySize: 0
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Party size must be an integer between 1 and 20/);
  });

  await t.test('3. Reservation with missing customerName returns 400 Bad Request', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, {
      customerEmail: 'marcus@corp.io',
      tableId: 't4',
      timeSlot: '2026-11-20T19:00:00.000Z',
      partySize: 2
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Customer name is required/);
  });

  await t.test('4. Duplicate reservation for identical table and timeSlot returns 409 Conflict', async () => {
    const payload = {
      customerName: 'Customer A',
      customerEmail: 'a@corp.io',
      tableId: 't12',
      timeSlot: '2026-11-20T20:00:00.000Z',
      partySize: 2
    };

    const first = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, payload);
    assert.strictEqual(first.status, 201);

    const duplicate = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, {
      ...payload,
      customerName: 'Customer B',
      customerEmail: 'b@corp.io'
    });
    assert.strictEqual(duplicate.status, 409);
    assert.strictEqual(duplicate.body.success, false);
    assert.match(duplicate.body.error, /Table is already reserved/);
  });

  await t.test('5. Redis Lock: client cannot release lock owned by different token', async () => {
    const lockService = new RedisLockService(null);
    const tableId = 't5';
    const slot = '2026-11-20T18:00:00.000Z';
    const tokenA = 'token-uuid-alice';
    const tokenB = 'token-uuid-bob';

    const acquired = await lockService.acquireLock(tableId, slot, tokenA, 10);
    assert.strictEqual(acquired, true);

    // Bob attempts to release Alice's lock -> must return false
    const releasedByBob = await lockService.releaseLock(tableId, slot, tokenB);
    assert.strictEqual(releasedByBob, false);

    // Alice releases her own lock -> must return true
    const releasedByAlice = await lockService.releaseLock(tableId, slot, tokenA);
    assert.strictEqual(releasedByAlice, true);
  });

  await t.test('6. Reservation cancellation updates status to CANCELLED', async () => {
    const createRes = await makeRequest(server, { method: 'POST', path: '/api/reservations' }, {
      customerName: 'Elena Rostova',
      customerEmail: 'elena@test.io',
      tableId: 't8',
      timeSlot: '2026-11-21T19:30:00.000Z',
      partySize: 3
    });
    assert.strictEqual(createRes.status, 201);
    const bookingId = createRes.body.data.id;

    const cancelRes = await makeRequest(server, { method: 'DELETE', path: `/api/reservations/${bookingId}` });
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
  });

  await t.test('7. Menu listing and category filtering works', async () => {
    const all = await makeRequest(server, { method: 'GET', path: '/api/menu' });
    assert.strictEqual(all.status, 200);
    assert.strictEqual(all.body.count, 5);

    const mainCourses = await makeRequest(server, { method: 'GET', path: '/api/menu?category=MAIN_COURSE' });
    assert.strictEqual(mainCourses.status, 200);
    assert.strictEqual(mainCourses.body.count, 2);
  });

  await t.test('8. Order creation and Kitchen Display status updates succeed', async () => {
    const orderRes = await makeRequest(server, { method: 'POST', path: '/api/orders' }, {
      tableId: 't4',
      items: [{ menuItemId: 'm1', quantity: 2 }, { menuItemId: 'm5', quantity: 1 }]
    });
    assert.strictEqual(orderRes.status, 201);
    const orderId = orderRes.body.data.id;

    const statusRes = await makeRequest(server, { method: 'PATCH', path: `/api/orders/${orderId}/status` }, {
      status: 'PREPARING'
    });
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.body.data.status, 'PREPARING');
  });
});
