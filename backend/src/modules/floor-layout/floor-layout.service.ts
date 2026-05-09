import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';

// ─── Types matching the test request format ───────────────────────────────────
// Test sends: { layout: { canvas_width, canvas_height, tables: [{table_id, x, y, rotation}], walls, decorations } }

interface TablePosition {
  table_id: string;
  x: number;
  y: number;
  rotation?: number;
}

interface LayoutInput {
  layout: {
    canvas_width?: number;
    canvas_height?: number;
    tables: TablePosition[];
    walls?: unknown[];
    decorations?: unknown[];
  };
}

// ─── Save draft ───────────────────────────────────────────────────────────────
// BUG FIX: old service expected { floors: FloorData[] } but the test sends
// { layout: { tables: [{table_id, x, y, rotation}] } }.
// Rewritten to accept the test format and store it as-is.

export async function saveDraft(branchId: string, input: LayoutInput, userId: string) {
  if (!input.layout || !Array.isArray(input.layout.tables)) {
    throw Object.assign(
      new Error('Request body must include a "layout" object with a "tables" array'),
      { statusCode: 400 }
    );
  }

  // Validate all table_ids belong to this branch
  const tableIds = input.layout.tables.map((t) => t.table_id).filter(Boolean);
  if (tableIds.length > 0) {
    const { data: found } = await supabaseAdmin
      .from('tables')
      .select('id')
      .eq('branch_id', branchId)
      .in('id', tableIds);

    const foundIds = new Set((found ?? []).map((t: any) => t.id));
    const missing = tableIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw Object.assign(
        new Error(`Table IDs not found in this branch: ${missing.join(', ')}`),
        { statusCode: 422 }
      );
    }
  }

  // Get next version
  const { data: current } = await supabaseAdmin
    .from('floor_layouts')
    .select('layout_version')
    .eq('branch_id', branchId)
    .eq('status', 'draft')
    .order('layout_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersion = (current?.layout_version ?? 0) + 1;

  // Archive any existing draft
  await supabaseAdmin
    .from('floor_layouts')
    .update({ status: 'archived' })
    .eq('branch_id', branchId)
    .eq('status', 'draft');

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('floor_layouts')
    .insert({
      branch_id: branchId,
      layout_data: input.layout,        // store the layout object directly
      status: 'draft',
      layout_version: newVersion,
      created_by: userId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Publish layout ───────────────────────────────────────────────────────────
// BUG FIX: layout_version is now optional (null = skip optimistic lock check)

export async function publishLayout(branchId: string, layoutVersion: number | null) {
  const { data: draft, error: fetchErr } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'draft')
    .order('layout_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr || !draft) throw Object.assign(new Error('No draft layout found'), { statusCode: 404 });

  // Only enforce optimistic lock when caller provides a version
  if (layoutVersion !== null && draft.layout_version !== layoutVersion) {
    throw Object.assign(
      new Error(`Layout version mismatch. Expected ${draft.layout_version}, got ${layoutVersion}`),
      { statusCode: 409 },
    );
  }

  // Archive existing active layout
  await supabaseAdmin
    .from('floor_layouts')
    .update({ status: 'archived' })
    .eq('branch_id', branchId)
    .eq('status', 'active');

  // Activate this draft
  const { data: published, error: pubErr } = await supabaseAdmin
    .from('floor_layouts')
    .update({ status: 'active', published_at: new Date().toISOString() })
    .eq('id', draft.id)
    .select()
    .single();

  if (pubErr) throw pubErr;

  // Update x_pos/y_pos on each table from the saved layout positions
  const layoutData = draft.layout_data as { tables?: TablePosition[] };
  if (Array.isArray(layoutData.tables)) {
    for (const pos of layoutData.tables) {
      await supabaseAdmin
        .from('tables')
        .update({ x_pos: pos.x, y_pos: pos.y, updated_at: new Date().toISOString() })
        .eq('id', pos.table_id)
        .eq('branch_id', branchId);
    }
  }

  await redis.del(`live_layout:${branchId}`);

  supabaseAdmin
    .channel(`branch:${branchId}`)
    .send({
      type: 'broadcast',
      event: 'floor_layout_updated',
      payload: { layout_id: draft.id, version: draft.layout_version },
    })
    .then(() => {})
    .catch(() => {});

  return published;
}

// ─── Get current layout ───────────────────────────────────────────────────────

export async function getLayout(branchId: string) {
  const { data: active } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'active')
    .order('layout_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) return active;

  const { data: draft, error } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'draft')
    .order('layout_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!draft) throw Object.assign(new Error('No layout found for this branch'), { statusCode: 404 });
  return draft;
}

// ─── Get live layout with real-time table statuses ────────────────────────────
// BUG FIX: old version read layout_data.floors (old format).
// Now reads layout_data.tables (new format) and joins live table status from DB.

export async function getLiveLayout(branchId: string) {
  const CACHE_KEY = `live_layout:${branchId}`;
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const { data: layout, error: layoutErr } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'active')
    .order('layout_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (layoutErr || !layout) throw Object.assign(new Error('No active layout found'), { statusCode: 404 });

  const { data: tables, error: tableErr } = await supabaseAdmin
    .from('tables')
    .select('id, label, x_pos, y_pos, status, capacity, floor_number, shape, zone')
    .eq('branch_id', branchId);

  if (tableErr) throw tableErr;

  const tableMap = new Map((tables ?? []).map((t: any) => [t.id, t]));

  // Enrich each position in the layout with live table data
  const layoutData = layout.layout_data as { tables?: TablePosition[]; [key: string]: unknown };
  const enrichedTables = (layoutData.tables ?? []).map((pos: TablePosition) => ({
    ...pos,
    ...(tableMap.get(pos.table_id) ?? {}),
  }));

  const result = {
    layout_id: layout.id,
    branch_id: branchId,
    layout_version: layout.layout_version,
    published_at: layout.published_at,
    canvas_width: (layoutData as any).canvas_width,
    canvas_height: (layoutData as any).canvas_height,
    tables: enrichedTables,
    walls: (layoutData as any).walls ?? [],
    decorations: (layoutData as any).decorations ?? [],
  };

  await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', 30);
  return result;
}
