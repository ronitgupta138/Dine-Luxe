import { resend } from '../config/resend';
import { welcomeTemplate } from './templates/welcome';
import { otpTemplate } from './templates/otp-verify';
import { bookingConfirmedTemplate } from './templates/booking-confirmed';
import { bookingReminderTemplate } from './templates/booking-reminder';
import { orderReceiptTemplate } from './templates/order-receipt';

// ─── Template Registry ────────────────────────────────────────────────────────
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  welcome: welcomeTemplate,
  'otp-verify': otpTemplate,
  'booking-confirmed': bookingConfirmedTemplate,
  'booking-reminder': bookingReminderTemplate,
  'order-receipt': orderReceiptTemplate,
};

// ─── Send Email ───────────────────────────────────────────────────────────────
interface SendEmailParams {
  to: string;
  templateName: string;
  data: Record<string, any>;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, templateName, data, replyTo } = params;

  const templateFn = templates[templateName];
  if (!templateFn) {
    console.error(`[Email] Unknown template: "${templateName}"`);
    return;
  }

  let subject: string;
  let html: string;

  try {
    ({ subject, html } = templateFn(data));
  } catch (err) {
    console.error(`[Email] Template render error for "${templateName}":`, err);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@restaurantos.app',
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    console.info(`[Email] Sent "${templateName}" to ${to} | id: ${result.data?.id}`);
  } catch (err) {
    // Log but never throw — email failures are non-fatal
    console.error(`[Email] Failed to send "${templateName}" to ${to}:`, err);
  }
}
