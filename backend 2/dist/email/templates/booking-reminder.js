"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingReminderTemplate = bookingReminderTemplate;
function bookingReminderTemplate(data) {
    const { customerName, restaurantName, arrivalTime, tableLabel, mapUrl } = data;
    return {
        subject: `⏰ Reminder: Your table at ${restaurantName} is in 1 hour`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:40px;">⏰</p>
            <h1 style="margin:10px 0 4px;color:#ffffff;font-size:22px;font-weight:700;">
              See you in 1 hour!
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">
              ${restaurantName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              Hi <strong>${customerName}</strong>! Just a friendly reminder that your table
              is reserved for <strong>${arrivalTime}</strong>.
            </p>

            <!-- Quick Info -->
            <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 10px;font-size:14px;color:#6b21a8;">
                🪑 &nbsp;<strong>${tableLabel}</strong>
              </p>
              <p style="margin:0;font-size:14px;color:#6b21a8;">
                🕐 &nbsp;<strong>${arrivalTime}</strong>
              </p>
            </div>

            <!-- Map Button (optional) -->
            ${mapUrl ? `
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#7c3aed;border-radius:8px;">
                  <a href="${mapUrl}"
                     style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                    📍 Get Directions
                  </a>
                </td>
              </tr>
            </table>` : ''}

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
              Your table will be held for 15 minutes after your reservation time.
              Please inform us if you're running late.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Restaurant OS · See you soon! 🍽️
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
//# sourceMappingURL=booking-reminder.js.map