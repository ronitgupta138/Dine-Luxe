"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpTemplate = otpTemplate;
function otpTemplate(data) {
    const { name, otp, expiryMinutes } = data;
    // Split OTP into individual digits for large display
    const digits = otp.split('').map((d) => `<span style="
      display:inline-block;
      width:44px;height:56px;line-height:56px;
      background:#f9fafb;border:2px solid #e5e7eb;
      border-radius:8px;text-align:center;
      font-size:28px;font-weight:700;color:#111827;
      margin:0 4px;
    ">${d}</span>`).join('');
    return {
        subject: `${otp} is your Restaurant OS verification code`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#E85D04 0%,#FAA307 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:36px;">🔐</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
              Verify your email
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:16px;color:#374151;">
              Hi <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
              Use the code below to verify your email address.
            </p>

            <!-- OTP Display -->
            <div style="margin:0 auto 8px;">${digits}</div>
            <p style="margin:16px 0 32px;font-size:13px;color:#EF4444;font-weight:500;">
              ⏱ Expires in ${expiryMinutes} minutes
            </p>

            <!-- Security Note -->
            <div style="background:#fef9f0;border:1px solid #fde68a;border-radius:8px;padding:16px;text-align:left;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                🛡️ <strong>Security reminder:</strong> Restaurant OS will never call you
                and ask for this code. If you didn't request this, please ignore this email.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Restaurant OS · This code expires in ${expiryMinutes} minutes.
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
//# sourceMappingURL=otp-verify.js.map