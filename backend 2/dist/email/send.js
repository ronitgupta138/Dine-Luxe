"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("../config/resend");
const welcome_1 = require("./templates/welcome");
const otp_verify_1 = require("./templates/otp-verify");
const booking_confirmed_1 = require("./templates/booking-confirmed");
const booking_reminder_1 = require("./templates/booking-reminder");
const order_receipt_1 = require("./templates/order-receipt");
// ─── Template Registry ────────────────────────────────────────────────────────
const templates = {
    welcome: welcome_1.welcomeTemplate,
    'otp-verify': otp_verify_1.otpTemplate,
    'booking-confirmed': booking_confirmed_1.bookingConfirmedTemplate,
    'booking-reminder': booking_reminder_1.bookingReminderTemplate,
    'order-receipt': order_receipt_1.orderReceiptTemplate,
};
async function sendEmail(params) {
    const { to, templateName, data, replyTo } = params;
    const templateFn = templates[templateName];
    if (!templateFn) {
        console.error(`[Email] Unknown template: "${templateName}"`);
        return;
    }
    let subject;
    let html;
    try {
        ({ subject, html } = templateFn(data));
    }
    catch (err) {
        console.error(`[Email] Template render error for "${templateName}":`, err);
        return;
    }
    try {
        const result = await resend_1.resend.emails.send({
            from: process.env.EMAIL_FROM ?? 'noreply@restaurantos.app',
            to,
            subject,
            html,
            ...(replyTo ? { reply_to: replyTo } : {}),
        });
        console.info(`[Email] Sent "${templateName}" to ${to} | id: ${result.data?.id}`);
    }
    catch (err) {
        // Log but never throw — email failures are non-fatal
        console.error(`[Email] Failed to send "${templateName}" to ${to}:`, err);
    }
}
//# sourceMappingURL=send.js.map