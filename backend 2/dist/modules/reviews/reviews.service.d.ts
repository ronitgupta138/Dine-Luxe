export declare function create(userId: string, payload: {
    order_id: string;
    restaurant_id: string;
    overall_rating: number;
    text_review?: string;
    item_ratings?: {
        order_item_id: string;
        rating: number;
    }[];
    photos?: string[];
}): Promise<any>;
export declare function getByRestaurant(restaurantId: string, page: number, limit: number, minRating?: number, maxRating?: number): Promise<{
    data: any[];
    count: number | null;
}>;
export declare function getByBranch(branchId: string, page: number, limit: number): Promise<{
    data: any[];
    count: number | null;
}>;
export declare function getByOrder(orderId: string, userId: string): Promise<any>;
export declare function deleteReview(id: string): Promise<void>;
//# sourceMappingURL=reviews.service.d.ts.map