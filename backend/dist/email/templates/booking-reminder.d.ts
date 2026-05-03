interface BookingReminderData {
    customerName: string;
    restaurantName: string;
    arrivalTime: string;
    tableLabel: string;
    mapUrl?: string;
}
export declare function bookingReminderTemplate(data: BookingReminderData): {
    subject: string;
    html: string;
};
export {};
//# sourceMappingURL=booking-reminder.d.ts.map