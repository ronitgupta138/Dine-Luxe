import { CreateBookingInput, CancelBookingInput } from './bookings.schema';
export declare function createBooking(input: CreateBookingInput, userId: string): Promise<any>;
export declare function getBookingById(bookingId: string, userId: string, role: string): Promise<any>;
export declare function getMyBookings(userId: string, query: Record<string, string>): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getBranchBookings(branchId: string, query: Record<string, string>): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function cancelBooking(bookingId: string, input: CancelBookingInput, userId: string, role: string): Promise<{
    cancelled: boolean;
}>;
export declare function markArrived(bookingId: string): Promise<any>;
export declare function markSeated(bookingId: string): Promise<any>;
export declare function markNoShow(bookingId: string): Promise<any>;
//# sourceMappingURL=bookings.service.d.ts.map