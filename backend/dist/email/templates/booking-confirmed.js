"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingConfirmedTemplate = bookingConfirmedTemplate;
function bookingConfirmedTemplate(data) {
    const { customerName, restaurantName, branchAddress, arrivalTime, partySize, tableLabel, bookingId } = data;
    const row = (icon, label, value) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:18px;margin-right:10px;">${icon}</span>
        <span style="font-size:13px;color:#6b7280;">${label}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
        <span style="font-size:14px;font-weight:600;color:#111827;">${value}</span>
      </td>
    </tr>`;
    return {
        subject: `Booking confirmed at ${restaurantName} — ${arrivalTime}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#34d399 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:40px;">✅</p>
            <h1 style="margin:10px 0 4px;color:#ffffff;font-size:22px;font-weight:700;">
              Booking Confirmed!
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">
              ${restaurantName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">
              Hi <strong>${customerName}</strong>, your table is all set! 🎉
            </p>

            <!-- Booking Details Card -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('📅', 'Date & Time', arrivalTime)}
                ${row('👥', 'Party Size', `${partySize} ${partySize === 1 ? 'guest' : 'guests'}`)}
                ${row('🪑', 'Table', tableLabel)}
                ${row('📍', 'Location', branchAddress)}
                ${row('🎫', 'Booking ID', `#${bookingId.slice(0, 8).toUpperCase()}`)}
              </table>
            </div>

            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
              Please arrive on time. Your table will be held for <strong>15 minutes</strong>
              after your reserved time. After that, it may be released to other guests.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Restaurant OS · Booking #${bookingId.slice(0, 8).toUpperCase()}
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
//# sourceMappingURL=booking-confirmed.js.map