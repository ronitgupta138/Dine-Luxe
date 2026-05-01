import { supabaseAdmin } from '../../config/supabase';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

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

  let query = supabaseAdmin.rpc('get_sales_report', {
    p_restaurant_id: restaurant_id,
    p_branch_id: branch_id ?? null,
    p_from: from,
    p_to: to,
    p_trunc: trunc,
  });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── Menu performance ─────────────────────────────────────────────────────────
export async function getMenuPerformance(restaurantId: string, branchId?: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin.rpc('get_menu_performance', {
    p_restaurant_id: restaurantId,
    p_branch_id: branchId ?? null,
    p_since: thirtyDaysAgo,
  });

  if (error) throw error;

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

  if (error) throw error;
  return data;
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
    returning_customers: returning.data ?? [],
    top_spenders: topSpenders.data ?? [],
  };
}

// ─── Admin platform report ────────────────────────────────────────────────────
export async function getAdminPlatformReport() {
  const { data, error } = await supabaseAdmin.rpc('get_platform_report');
  if (error) throw error;
  return data;
}

// ─── Admin trends ─────────────────────────────────────────────────────────────
export async function getAdminTrends(from: string, to: string) {
  const { data, error } = await supabaseAdmin.rpc('get_platform_trends', {
    p_from: from,
    p_to: to,
  });
  if (error) throw error;
  return data;
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

  // Fetch report data based on type
  let reportData: any[] = [];

  if (report_type === 'sales') {
    reportData = await getSales({ branch_id, restaurant_id, from, to, granularity: 'daily' });
  } else if (report_type === 'menu-performance') {
    reportData = await getMenuPerformance(restaurant_id, branch_id);
  } else if (report_type === 'kitchen-performance') {
    reportData = await getKitchenPerformance(branch_id!, from, to);
  }

  // Generate file buffer
  let fileBuffer: Buffer;
  let contentType: string;
  let extension: string;

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(reportData);
    fileBuffer = Buffer.from(csv, 'utf-8');
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
