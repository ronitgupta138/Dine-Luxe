"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        order_id: zod_1.z.string().uuid(),
        restaurant_id: zod_1.z.string().uuid(),
        overall_rating: zod_1.z.number().int().min(1).max(5),
        text_review: zod_1.z.string().max(2000).optional(),
        item_ratings: zod_1.z
            .array(zod_1.z.object({
            order_item_id: zod_1.z.string().uuid(),
            rating: zod_1.z.number().int().min(1).max(5),
        }))
            .max(20)
            .optional(),
        photos: zod_1.z.array(zod_1.z.string().url()).max(3).optional(),
    }),
});
//# sourceMappingURL=reviews.schema.js.map