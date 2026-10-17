"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDraft = saveDraft;
exports.publishLayout = publishLayout;
exports.getLayout = getLayout;
exports.getLiveLayout = getLiveLayout;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
// ─── Save draft ───────────────────────────────────────────────────────────────
// BUG FIX: old service expected { floors: FloorData[] } but the test sends
// { layout: { tables: [{table_id, x, y, rotation}] } }.
// Rewritten to accept the test format and store it as-is.
async function saveDraft(branchId, input, userId) {
    if (!input.layout || !Array.isArray(input.layout.tables)) {
        throw Object.assign(new Error('Request body must include a "layout" object with a "tables" array'), { statusCode: 400 });
    }
    // Validate all table_ids belong to this branch
    const tableIds = input.layout.tables.map((t) => t.table_id).filter(Boolean);
    if (tableIds.length > 0) {
        const { data: found } = await supabase_1.supabaseAdmin
            .from('tables')
            .select('id')
            .eq('branch_id', branchId)
            .in('id', tableIds);
        const foundIds = new Set((found ?? []).map((t) => t.id));
        const missing = tableIds.filter((id) => !foundIds.has(id));
        if (missing.length > 0) {
            throw Object.assign(new Error(`Table IDs not found in this branch: ${missing.join(', ')}`), { statusCode: 422 });
        }
    }
    // Get next version
    const { data: current } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .select('layout_version')
        .eq('branch_id', branchId)
        .eq('status', 'draft')
        .order('layout_version', { ascending: false })
        .limit(1)
        .maybeSingle();
    const newVersion = (current?.layout_version ?? 0) + 1;
    // Archive any existing draft
    await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .update({ status: 'archived' })
        .eq('branch_id', branchId)
        .eq('status', 'draft');
    const now = new Date().toISOString();
    const { data, error } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .insert({
        branch_id: branchId,
        layout_data: input.layout, // store the layout object directly
        status: 'draft',
        layout_version: newVersion,
        created_by: userId,
        created_at: now,
        updated_at: now,
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ─── Publish layout ───────────────────────────────────────────────────────────
// BUG FIX: layout_version is now optional (null = skip optimistic lock check)
async function publishLayout(branchId, layoutVersion) {
    const { data: draft, error: fetchErr } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'draft')
        .order('layout_version', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (fetchErr || !draft)
        throw Object.assign(new Error('No draft layout found'), { statusCode: 404 });
    // Only enforce optimistic lock when caller provides a version
    if (layoutVersion !== null && draft.layout_version !== layoutVersion) {
        throw Object.assign(new Error(`Layout version mismatch. Expected ${draft.layout_version}, got ${layoutVersion}`), { statusCode: 409 });
    }
    // Archive existing active layout
    await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .update({ status: 'archived' })
        .eq('branch_id', branchId)
        .eq('status', 'active');
    // Activate this draft
    const { data: published, error: pubErr } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .update({ status: 'active', published_at: new Date().toISOString() })
        .eq('id', draft.id)
        .select()
        .single();
    if (pubErr)
        throw pubErr;
    // Update x_pos/y_pos on each table from the saved layout positions
    const layoutData = draft.layout_data;
    if (Array.isArray(layoutData.tables)) {
        for (const pos of layoutData.tables) {
            await supabase_1.supabaseAdmin
                .from('tables')
                .update({ x_pos: pos.x, y_pos: pos.y, updated_at: new Date().toISOString() })
                .eq('id', pos.table_id)
                .eq('branch_id', branchId);
        }
    }
    await redis_1.redis.del(`live_layout:${branchId}`);
    supabase_1.supabaseAdmin
        .channel(`branch:${branchId}`)
        .send({
        type: 'broadcast',
        event: 'floor_layout_updated',
        payload: { layout_id: draft.id, version: draft.layout_version },
    })
        .then(() => { })
        .catch(() => { });
    return published;
}
// ─── Get current layout ───────────────────────────────────────────────────────
async function getLayout(branchId) {
    const { data: active } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'active')
        .order('layout_version', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (active)
        return active;
    const { data: draft, error } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'draft')
        .order('layout_version', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error)
        throw error;
    if (!draft)
        throw Object.assign(new Error('No layout found for this branch'), { statusCode: 404 });
    return draft;
}
// ─── Get live layout with real-time table statuses ────────────────────────────
// BUG FIX: old version read layout_data.floors (old format).
// Now reads layout_data.tables (new format) and joins live table status from DB.
async function getLiveLayout(branchId) {
    const CACHE_KEY = `live_layout:${branchId}`;
    const cached = await redis_1.redis.get(CACHE_KEY);
    if (cached)
        return JSON.parse(cached);
    const { data: layout, error: layoutErr } = await supabase_1.supabaseAdmin
        .from('floor_layouts')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'active')
        .order('layout_version', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (layoutErr || !layout)
        throw Object.assign(new Error('No active layout found'), { statusCode: 404 });
    const { data: tables, error: tableErr } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id, label, x_pos, y_pos, status, capacity, floor_number, shape, zone')
        .eq('branch_id', branchId);
    if (tableErr)
        throw tableErr;
    const tableMap = new Map((tables ?? []).map((t) => [t.id, t]));
    // Enrich each position in the layout with live table data
    const layoutData = layout.layout_data;
    const enrichedTables = (layoutData.tables ?? []).map((pos) => ({
        ...pos,
        ...(tableMap.get(pos.table_id) ?? {}),
    }));
    const result = {
        layout_id: layout.id,
        branch_id: branchId,
        layout_version: layout.layout_version,
        published_at: layout.published_at,
        canvas_width: layoutData.canvas_width,
        canvas_height: layoutData.canvas_height,
        tables: enrichedTables,
        walls: layoutData.walls ?? [],
        decorations: layoutData.decorations ?? [],
    };
    await redis_1.redis.set(CACHE_KEY, JSON.stringify(result), 'EX', 30);
    return result;
}
//# sourceMappingURL=floor-layout.service.js.map