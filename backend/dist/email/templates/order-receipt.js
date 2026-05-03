"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderReceiptTemplate = orderReceiptTemplate;
function formatINR(amount) {
    return `₹${amount.toFixed(2)}`;
}
function orderReceiptTemplate(data) {
    const { customerName, restaurantName, restaurantLogo, items, subtotal, gst, serviceCharge, total, paymentMethod, orderId, date, } = data;
    const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
        <p style="margin:0;font-size:14px;color:#111827;font-weight:500;">${item.name}</p>
        ${item.addons?.length ? `<p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">+ ${item.addons.join(', ')}</p>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;color:#6b7280;">
        x${item.quantity}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;color:#111827;font-weight:500;">
        ${formatINR(item.total)}
      </td>
    </tr>`).join('');
    const summaryRow = (label, value, bold = false, highlight = false) => `
    <tr>
      <td colspan="2" style="padding:8px 0;font-size:${bold ? '15px' : '13px'};color:${highlight ? '#E85D04' : '#6b7280'};font-weight:${bold ? '700' : '400'};">
        ${label}
      </td>
      <td style="padding:8px 0;text-align:right;font-size:${bold ? '15px' : '13px'};color:${highlight ? '#E85D04' : '#111827'};font-weight:${bold ? '700' : '500'};">
        ${value}
      </td>
    </tr>`;
    return {
        subject: `Your receipt from ${restaurantName} — ${formatINR(total)}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Receipt</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#E85D04 0%,#FAA307 100%);padding:32px 40px;text-align:center;">
            ${restaurantLogo
            ? `<img src="${restaurantLogo}" alt="${restaurantName}" style="height:48px;margin-bottom:12px;border-radius:8px;" />`
            : `<p style="margin:0 0 12px;font-size:36px;">🧾</p>`}
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${restaurantName}</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              Order #${orderId.slice(0, 8).toUpperCase()} · ${date}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">
              Thank you, <strong>${customerName}</strong>! Here's your receipt. 🙏
            </p>

            <!-- Items Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
              <thead>
                <tr style="border-bottom:2px solid #e5e7eb;">
                  <th style="padding:8px 0;text-align:left;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Item</th>
                  <th style="padding:8px 0;text-align:center;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Qty</th>
                  <th style="padding:8px 0;text-align:right;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                ${summaryRow('Subtotal', formatINR(subtotal))}
                ${summaryRow('GST (5%)', formatINR(gst))}
                ${summaryRow('Service Charge', formatINR(serviceCharge))}
                <tr><td colspan="3"><div style="border-top:2px solid #e5e7eb;margin:8px 0;"></div></td></tr>
                ${summaryRow('Total Paid', formatINR(total), true, true)}
              </tfoot>
            </table>

            <!-- Payment Method Badge -->
            <div style="margin-top:24px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:inline-block;">
              <p style="margin:0;font-size:13px;color:#166534;font-weight:500;">
                ✅ Paid via <strong>${paymentMethod}</strong>
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 6px;font-size:14px;color:#374151;">
              We hope you enjoyed your meal! ⭐
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Restaurant OS · Receipt #${orderId.slice(0, 8).toUpperCase()}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };
}
//# sourceMappingURL=order-receipt.js.map