export declare function arrivalCheck(params: {
    lat: number;
    lon: number;
    bookingId: string;
}, userId: string): Promise<{
    throttled: boolean;
    retryAfterSeconds: number;
    shouldPrompt?: undefined;
    within_fence?: undefined;
    distance_meters?: undefined;
    fence_radius_meters?: undefined;
    restaurant_name?: undefined;
    booking_status?: undefined;
} | {
    shouldPrompt: boolean;
    within_fence: boolean;
    distance_meters: number;
    fence_radius_meters: number;
    throttled?: undefined;
    retryAfterSeconds?: undefined;
    restaurant_name?: undefined;
    booking_status?: undefined;
} | {
    shouldPrompt: boolean;
    within_fence: boolean;
    distance_meters: number;
    fence_radius_meters: number;
    restaurant_name: any;
    booking_status: any;
    throttled?: undefined;
    retryAfterSeconds?: undefined;
}>;
//# sourceMappingURL=geo.service.d.ts.map