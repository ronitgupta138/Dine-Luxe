import { supabaseAdmin } from '../../config/supabase';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

function isMissingRpc(error: { message?: string } | null): boolean {
  return (error?.message ?? '').includes('Could not find the function');
}

// ─── Sales report ──────────────────────────────────────────────────────────────
export async function getSales(params: {
  branch_id?: string;
  restaurant_id: string;
  from: string;
  to: string;
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
}) {
  const { branch_id, restaurant_id, from, to, granularity } = params;

  const truncMap: Record<string, string> = {
    hourly: 'hour',
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
  };
  const trunc = truncMap[granularity];

  const { data, error } = await supabaseAdmin.rpc('get_sales_report', {
    p_restaurant_id: restaurant_id,
    p_branch_id: branch_id ?? null,
    p_from: from,
    p_to: to,
    p_trunc: trunc,
  });

  if (error) {
    if (isMissingRpc(error)) return [];
    throw error;
  }
  return data ?? [];
}

// ─── Menu performance ─────────────────────────────────────────────────────────
export async function getMenuPerformance(restaurantId: string, branchId?: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin.rpc('get_menu_performance', {
    p_restaurant_id: restaurantId,
    p_branch_id: branchId ?? null,
    p_since: thirtyDaysAgo,
  });

  if (error) {
    if (isMissingRpc(error)) return [];
    throw error;
  }

  // Flag slow movers (< 5 orders in 30 days)
  const enriched = (data ?? []).map((item: any) => ({
    ...item,
    is_slow_mover: item.order_count < 5,
  }));

  return enriched;
}

// ─── Kitchen performance ──────────────────────────────────────────────────────
export async function getKitchenPerformance(branchId: string, from: string, to: string) {
  const { data, error } = await supabaseAdmin.rpc('get_kitchen_performance', {
    p_branch_id: branchId,
    p_from: from,
    p_to: to,
  });

  if (error) {
    if (isMissingRpc(error)) return [];
    throw error;
  }
  return data ?? [];
}

// ─── Customer insights ────────────────────────────────────────────────────────
export async function getCustomerInsights(restaurantId: string) {
  const [newCustomers, returning, topSpenders] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('customer_id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

    supabaseAdmin.rpc('get_returning_customers', { p_restaurant_id: restaurantId }),

    supabaseAdmin.rpc('get_top_spenders', {
      p_restaurant_id: restaurantId,
      p_limit: 10,
    }),
  ]);

  return {
    new_customers_30d: newCustomers.count ?? 0,
    returning_customers: returning.error && isMissingRpc(returning.error) ? [] : (returning.data ?? []),
    top_spenders: topSpenders.error && isMissingRpc(topSpenders.error) ? [] : (topSpenders.data ?? []),
  };
}

// ─── Admin platform report ────────────────────────────────────────────────────
export async function getAdminPlatformReport() {
  const { data, error } = await supabaseAdmin.rpc('get_platform_report');
  if (error) {
    if (isMissingRpc(error)) return [];
    throw error;
  }
  return data ?? [];
}

// ─── Admin trends ─────────────────────────────────────────────────────────────
export async function getAdminTrends(from: string, to: string) {
  const { data, error } = await supabaseAdmin.rpc('get_platform_trends', {
    p_from: from,
    p_to: to,
  });
  if (error) {
    if (isMissingRpc(error)) return [];
    throw error;
  }
  return data ?? [];
}

// ─── Export report (non-blocking) ─────────────────────────────────────────────
export async function exportReport(params: {
  report_type: string;
  branch_id?: string;
  restaurant_id: string;
  from: string;
  to: string;
  format: 'csv' | 'pdf';
  requested_by: string;
}) {
  const { report_type, branch_id, restaurant_id, from, to, format, requested_by } = params;

  // BUG FIX: kitchen-performance export required branch_id (non-null assertion)
  // but the caller never validated it was provided — guard explicitly here.
  if (report_type === 'kitchen-performance' && !branch_id) {
    throw Object.assign(
      new Error('branch_id is required for kitchen-performance export'),
      { status: 422 }
    );
  }

  // BUG FIX: 'customer-insights' and 'platform' were valid report_type enum
  // values in the schema but unreachable in exportReport — added both branches
  // so the export matches every value the schema allows.
  let reportData: any[] = [];

  if (report_type === 'sales') {
    reportData = await getSales({ branch_id, restaurant_id, from, to, granularity: 'daily' });
  } else if (report_type === 'menu-performance') {
    reportData = await getMenuPerformance(restaurant_id, branch_id);
  } else if (report_type === 'kitchen-performance') {
    reportData = await getKitchenPerformance(branch_id!, from, to);
  } else if (report_type === 'customer-insights') {
    const insights = await getCustomerInsights(restaurant_id);
    // Flatten nested arrays for tabular export
    reportData = [
      { metric: 'new_customers_30d', value: insights.new_customers_30d },
      ...insights.top_spenders.map((s: any) => ({ metric: 'top_spender', ...s })),
    ];
  } else if (report_type === 'platform') {
    const raw = await getAdminPlatformReport();
    reportData = Array.isArray(raw) ? raw : [raw];
  }

  // Generate file buffer
  let fileBuffer: Buffer;
  let contentType: string;
  let extension: string;

  if (format === 'csv') {
    // BUG FIX: json2csv Parser throws when reportData is empty — guard it.
    if (reportData.length === 0) {
      fileBuffer = Buffer.from('No data available for the selected period.\n', 'utf-8');
    } else {
      const parser = new Parser();
      fileBuffer = Buffer.from(parser.parse(reportData), 'utf-8');
    }
    contentType = 'text/csv';
    extension = 'csv';
  } else {
    fileBuffer = await generatePDF(reportData, report_type);
    contentType = 'application/pdf';
    extension = 'pdf';
  }

  const fileName = `reports/${restaurant_id}/${report_type}-${Date.now()}.${extension}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from('exports')
    .upload(fileName, fileBuffer, { contentType });

  if (uploadError) throw uploadError;

  // Create signed URL valid for 1 hour
  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from('exports')
    .createSignedUrl(fileName, 3600);

  if (urlError) throw urlError;

  return { download_url: urlData.signedUrl, expires_in: 3600 };
}

async function generatePDF(data: any[], title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title.toUpperCase().replace(/-/g, ' '), { align: 'center' });
    doc.moveDown();

    if (data.length === 0) {
      doc.fontSize(12).text('No data available for the selected period.');
    } else {
      const keys = Object.keys(data[0]);
      doc.fontSize(10).text(keys.join(' | '), { underline: true });
      doc.moveDown(0.5);
      for (const row of data) {
        doc.text(keys.map((k) => String(row[k] ?? '')).join(' | '));
      }
    }

    doc.end();
  });
}
