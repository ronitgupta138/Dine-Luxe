interface BookingConfirmedData {
    customerName: string;
    restaurantName: string;
    branchAddress: string;
    arrivalTime: string;
    partySize: number;
    tableLabel: string;
    bookingId: string;
}
export declare function bookingConfirmedTemplate(data: BookingConfirmedData): {
    subject: string;
    html: string;
};
export {};
//# sourceMappingURL=booking-confirmed.d.ts.map