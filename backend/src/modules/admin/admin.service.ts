import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { paginate } from '../../utils/pagination';

const DASHBOARD_CACHE_KEY = 'admin:dashboard';
const DASHBOARD_CACHE_TTL = 300; // 5 minutes

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const cached = await redis.get(DASHBOARD_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    restaurantStats,
    customerStats,
    newCustomers,
    todayOrders,
    todayRevenue,
    topRestaurants,
  ] = await Promise.all([
    // Restaurants by status
    supabaseAdmin
      .from('restaurants')
      .select('status')
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data ?? []).forEach((r: any) => {
          counts[r.status] = (counts[r.status] || 0) + 1;
        });
        return counts;
      }),

    // Total customers
    supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),

    // New customers this month
    supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', startOfMonth),

    // Today's orders count
    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday),

    // Today's revenue
    supabaseAdmin
      .from('payments')
      .select('amount')
      .gte('created_at', startOfToday)
      .eq('status', 'completed'),

    // Top 5 restaurants by revenue (last 30 days)
    supabaseAdmin.rpc('get_top_restaurants_by_revenue', {
      p_since: thirtyDaysAgo,
      p_limit: 5,
    }),
  ]);

  const revenueToday = (todayRevenue.data ?? []).reduce(
    (sum: number, p: any) => sum + (p.amount ?? 0),
    0
  );

  // Composite platform health score (0-100)
  const totalRestaurants = Object.values(restaurantStats).reduce((a, b) => a + b, 0);
  const activeRatio = totalRestaurants > 0 ? (restaurantStats['active'] || 0) / totalRestaurants : 1;
  const platformHealthScore = Math.round(activeRatio * 100);

  const dashboard = {
    restaurants: restaurantStats,
    total_customers: customerStats.count ?? 0,
    new_customers_this_month: newCustomers.count ?? 0,
    orders_today: todayOrders.count ?? 0,
    revenue_today: revenueToday,
    top_restaurants: topRestaurants.data ?? [],
    platform_health_score: platformHealthScore,
    generated_at: new Date().toISOString(),
  };

  await redis.setex(DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_TTL, JSON.stringify(dashboard));
  return dashboard;
}

// ─── Platform stats (7×24 peak hours matrix) ─────────────────────────────────
export async function getPlatformStats() {
  const { data, error } = await supabaseAdmin.rpc('get_peak_hours_matrix');
  if (error) throw error;
  return data;
}

// ─── Health check (public) ────────────────────────────────────────────────────
export async function getHealth() {
  const start = Date.now();
  const { error } = await supabaseAdmin.from('restaurants').select('id').limit(1);
  const dbLatency = Date.now() - start;

  const redisStart = Date.now();
  await redis.ping();
  const redisLatency = Date.now() - redisStart;

  return {
    status: error ? 'degraded' : 'ok',
    db_latency_ms: dbLatency,
    redis_latency_ms: redisLatency,
    timestamp: new Date().toISOString(),
  };
}

// ─── Detailed health (admin only) ────────────────────────────────────────────
export async function getDetailedHealth() {
  const basic = await getHealth();

  const [redisInfo, dbMetrics] = await Promise.all([
    redis.info('stats'),
    supabaseAdmin.rpc('get_db_metrics'),
  ]);

  // Parse Redis hit rate from INFO stats
  const hitMatch = redisInfo.match(/keyspace_hits:(\d+)/);
  const missMatch = redisInfo.match(/keyspace_misses:(\d+)/);
  const hits = hitMatch ? parseInt(hitMatch[1]) : 0;
  const misses = missMatch ? parseInt(missMatch[1]) : 0;
  const hitRate = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  return {
    ...basic,
    redis_hit_rate_percent: hitRate,
    db_metrics: dbMetrics.data ?? {},
  };
}

// ─── Get all restaurants (paginated) ─────────────────────────────────────────
export async function getRestaurants(page: number, limit: number, status?: string) {
  const { from, to } = paginate(page, limit);
  let query = supabaseAdmin
    .from('restaurants')
    .select('*, owner:users(id, name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// ─── Update restaurant status ─────────────────────────────────────────────────
export async function updateRestaurantStatus(id: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Invalidate dashboard cache
  await redis.del(DASHBOARD_CACHE_KEY);
  return data;
}

// ─── Get all customers (paginated) ───────────────────────────────────────────
export async function getCustomers(page: number, limit: number, status?: string) {
  const { from, to } = paginate(page, limit);
  let query = supabaseAdmin
    .from('users')
    .select('id, name, email, phone, is_active, created_at', { count: 'exact' })
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .range(from, to);

  // status param maps to is_active: 'active' -> true, 'inactive' -> false
  if (status === 'active') query = query.eq('is_active', true);
  else if (status === 'inactive') query = query.eq('is_active', false);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// ─── Update customer status ───────────────────────────────────────────────────
export async function updateCustomerStatus(id: string, status: string) {
  // Map 'active'/'inactive' to the boolean is_active column
  const is_active = status === 'active';
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Get anonymous staff feedback ─────────────────────────────────────────────
export async function getFeedback(page: number, limit: number) {
  const { from, to } = paginate(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('staff_feedback')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count };
}
