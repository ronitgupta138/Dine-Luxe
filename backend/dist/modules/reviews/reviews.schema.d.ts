import { z } from 'zod';
export declare const createReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        order_id: z.ZodString;
        restaurant_id: z.ZodString;
        overall_rating: z.ZodNumber;
        text_review: z.ZodOptional<z.ZodString>;
        item_ratings: z.ZodOptional<z.ZodArray<z.ZodObject<{
            order_item_id: z.ZodString;
            rating: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rating: number;
            order_item_id: string;
        }, {
            rating: number;
            order_item_id: string;
        }>, "many">>;
        photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        restaurant_id: string;
        order_id: string;
        overall_rating: number;
        text_review?: string | undefined;
        photos?: string[] | undefined;
        item_ratings?: {
            rating: number;
            order_item_id: string;
        }[] | undefined;
    }, {
        restaurant_id: string;
        order_id: string;
        overall_rating: number;
        text_review?: string | undefined;
        photos?: string[] | undefined;
        item_ratings?: {
            rating: number;
            order_item_id: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        restaurant_id: string;
        order_id: string;
        overall_rating: number;
        text_review?: string | undefined;
        photos?: string[] | undefined;
        item_ratings?: {
            rating: number;
            order_item_id: string;
        }[] | undefined;
    };
}, {
    body: {
        restaurant_id: string;
        order_id: string;
        overall_rating: number;
        text_review?: string | undefined;
        photos?: string[] | undefined;
        item_ratings?: {
            rating: number;
            order_item_id: string;
        }[] | undefined;
    };
}>;
//# sourceMappingURL=reviews.schema.d.ts.map