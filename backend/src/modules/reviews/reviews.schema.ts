import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    order_id: z.string().uuid(),
    restaurant_id: z.string().uuid(),
    overall_rating: z.number().int().min(1).max(5),
    text_review: z.string().max(2000).optional(),
    item_ratings: z
      .array(
        z.object({
          order_item_id: z.string().uuid(),
          rating: z.number().int().min(1).max(5),
        })
      )
      .max(20)
      .optional(),
    photos: z.array(z.string().url()).max(3).optional(),
  }),
});
