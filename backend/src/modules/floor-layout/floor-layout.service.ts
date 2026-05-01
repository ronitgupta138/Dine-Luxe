import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TableInLayout {
  label: string;
  x: number;
  y: number;
  capacity: number;
  shape: 'round' | 'square' | 'rectangle' | 'booth';
  zone: string;
  photo_url?: string;
  floor_number: number;
}

interface FloorData {
  floor_number: number;
  tables: TableInLayout[];
}

interface LayoutInput {
  floors: FloorData[];
  layout_version?: number;
}

// ─── Validate no overlapping positions ───────────────────────────────────────

function validateLayout(floors: FloorData[]): void {
  for (const floor of floors) {
    const labels = new Set<string>();
    const positions = new Set<string>();

    for (const table of floor.tables) {
      if (labels.has(table.label)) {
        throw Object.assign(new Error(`Duplicate label "${table.label}" on floor ${floor.floor_number}`), { statusCode: 422 });
      }
      const posKey = `${floor.floor_number}:${table.x}:${table.y}`;
      if (positions.has(posKey)) {
        throw Object.assign(new Error(`Overlapping position (${table.x},${table.y}) on floor ${floor.floor_number}`), { statusCode: 422 });
      }
      labels.add(table.label);
      positions.add(posKey);
    }
  }
}

// ─── Save draft ───────────────────────────────────────────────────────────────

export async function saveDraft(branchId: string, input: LayoutInput, userId: string) {
  validateLayout(input.floors);

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

  const { data, error } = await supabaseAdmin
    .from('floor_layouts')
    .insert({
      branch_id: branchId,
      layout_data: { floors: input.floors },
      status: 'draft',
      layout_version: newVersion,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Publish layout ───────────────────────────────────────────────────────────

export async function publishLayout(branchId: string, layoutVersion: number) {
  // Fetch draft
  const { data: draft, error: fetchErr } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'draft')
    .single();

  if (fetchErr || !draft) throw Object.assign(new Error('No draft layout found'), { statusCode: 404 });

  // Optimistic lock check
  if (draft.layout_version !== layoutVersion) {
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

  // Upsert tables from layout JSON — preserve existing IDs by label match
  const floors: FloorData[] = draft.layout_data.floors;
  for (const floor of floors) {
    for (const t of floor.tables) {
      await supabaseAdmin
        .from('tables')
        .upsert(
          {
            branch_id: branchId,
            label: t.label,
            capacity: t.capacity,
            shape: t.shape,
            zone: t.zone,
            photo_url: t.photo_url ?? null,
            floor_number: floor.floor_number,
            x_pos: t.x,
            y_pos: t.y,
          },
          { onConflict: 'branch_id,label', ignoreDuplicates: false },
        );
    }
  }

  // Invalidate cache
  await redis.del(`live_layout:${branchId}`);

  // Broadcast event
  await supabaseAdmin.channel(`branch:${branchId}`)
    .send({ type: 'broadcast', event: 'floor_layout_updated', payload: { layout_id: draft.id, version: draft.layout_version } });

  return published;
}

// ─── Get current (active) layout ─────────────────────────────────────────────

export async function getLayout(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .in('status', ['active', 'draft'])
    .order('status', { ascending: true }) // active before draft alphabetically? use version
    .order('layout_version', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

// ─── Get live layout with real-time table statuses ────────────────────────────

export async function getLiveLayout(branchId: string) {
  const CACHE_KEY = `live_layout:${branchId}`;
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const { data: layout, error: layoutErr } = await supabaseAdmin
    .from('floor_layouts')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'active')
    .single();

  if (layoutErr || !layout) throw Object.assign(new Error('No active layout found'), { statusCode: 404 });

  const { data: tables, error: tableErr } = await supabaseAdmin
    .from('tables')
    .select('id, label, x_pos, y_pos, status, capacity, floor_number, shape, zone')
    .eq('branch_id', branchId);

  if (tableErr) throw tableErr;

  // Map table statuses back onto layout positions
  const tableMap = new Map(tables!.map(t => [t.label, t]));

  const enrichedFloors = layout.layout_data.floors.map((floor: FloorData) => ({
    ...floor,
    tables: floor.tables.map(t => ({
      ...t,
      ...(tableMap.get(t.label) ?? {}),
    })),
  }));

  const result = {
    layout_id: layout.id,
    branch_id: branchId,
    layout_version: layout.layout_version,
    published_at: layout.published_at,
    floors: enrichedFloors,
  };

  await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', 30); // 30s TTL for live data
  return result;
}
