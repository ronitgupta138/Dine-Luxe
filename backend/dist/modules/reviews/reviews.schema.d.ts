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
            order_item_id?: string;
            rating?: number;
        }, {
            order_item_id?: string;
            rating?: number;
        }>, "many">>;
        photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        restaurant_id?: string;
        order_id?: string;
        overall_rating?: number;
        text_review?: string;
        photos?: string[];
        item_ratings?: {
            order_item_id?: string;
            rating?: number;
        }[];
    }, {
        restaurant_id?: string;
        order_id?: string;
        overall_rating?: number;
        text_review?: string;
        photos?: string[];
        item_ratings?: {
            order_item_id?: string;
            rating?: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    body?: {
        restaurant_id?: string;
        order_id?: string;
        overall_rating?: number;
        text_review?: string;
        photos?: string[];
        item_ratings?: {
            order_item_id?: string;
            rating?: number;
        }[];
    };
}, {
    body?: {
        restaurant_id?: string;
        order_id?: string;
        overall_rating?: number;
        text_review?: string;
        photos?: string[];
        item_ratings?: {
            order_item_id?: string;
            rating?: number;
        }[];
    };
}>;
//# sourceMappingURL=reviews.schema.d.ts.map