"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.getByRestaurant = getByRestaurant;
exports.getByBranch = getByBranch;
exports.getByOrder = getByOrder;
exports.deleteReview = deleteReview;
const supabase_1 = require("../../config/supabase");
const pagination_1 = require("../../utils/pagination");
const POSITIVE_WORDS = ['great', 'excellent', 'amazing', 'good', 'fantastic', 'delicious', 'love', 'perfect', 'wonderful', 'best'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'poor', 'disappointing', 'slow', 'rude'];
// ─── Create review ─────────────────────────────────────────────────────────────
async function create(userId, payload) {
    // Validate: user must have a completed order at this restaurant
    const { data: order, error: orderErr } = await supabase_1.supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('id', payload.order_id)
        .eq('customer_id', userId)
        .eq('status', 'completed')
        .single();
    if (orderErr || !order) {
        throw new Error('No completed order found for this user');
    }
    // Check duplicate
    const { data: existing } = await supabase_1.supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('order_id', payload.order_id)
        .eq('user_id', userId)
        .single();
    if (existing)
        throw new Error('Review already submitted for this order');
    // Insert main review
    const { data: review, error } = await supabase_1.supabaseAdmin
        .from('reviews')
        .insert({
        user_id: userId,
        order_id: payload.order_id,
        restaurant_id: payload.restaurant_id,
        overall_rating: payload.overall_rating,
        text_review: payload.text_review ?? null,
        photos: payload.photos ?? [],
        sentiment_label: null,
    })
        .select()
        .single();
    if (error)
        throw error;
    // Insert item-level ratings
    if (payload.item_ratings?.length) {
        const itemRatings = payload.item_ratings.map((r) => ({
            review_id: review.id,
            order_item_id: r.order_item_id,
            rating: r.rating,
        }));
        await supabase_1.supabaseAdmin.from('review_item_ratings').insert(itemRatings);
    }
    // Recalculate restaurant avg rating
    await recalculateAvgRating(payload.restaurant_id);
    // Async sentiment analysis — fire and forget
    calculateSentiment(review.id, payload.text_review ?? '');
    return review;
}
// ─── Get reviews by restaurant ─────────────────────────────────────────────────
async function getByRestaurant(restaurantId, page, limit, minRating, maxRating) {
    const { from, to } = (0, pagination_1.paginate)(page, limit);
    let query = supabase_1.supabaseAdmin
        .from('reviews')
        .select(`
      *,
      user:users(id, name, profile_pic_url),
      item_ratings:review_item_ratings(*, order_item:order_items(menu_item_id))
    `, { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .range(from, to);
    if (minRating !== undefined)
        query = query.gte('overall_rating', minRating);
    if (maxRating !== undefined)
        query = query.lte('overall_rating', maxRating);
    const { data, error, count } = await query;
    if (error)
        throw error;
    return { data, count };
}
// ─── Get reviews by branch ─────────────────────────────────────────────────────
async function getByBranch(branchId, page, limit) {
    const { from, to } = (0, pagination_1.paginate)(page, limit);
    const { data, error, count } = await supabase_1.supabaseAdmin
        .from('reviews')
        .select('*, user:users(id, name, profile_pic_url)', { count: 'exact' })
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .range(from, to);
    if (error)
        throw error;
    return { data, count };
}
// ─── Get review by order ───────────────────────────────────────────────────────
async function getByOrder(orderId, userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
// ─── Delete review ─────────────────────────────────────────────────────────────
async function deleteReview(id) {
    const { data: review, error: fetchErr } = await supabase_1.supabaseAdmin
        .from('reviews')
        .select('restaurant_id')
        .eq('id', id)
        .single();
    if (fetchErr)
        throw fetchErr;
    const { error } = await supabase_1.supabaseAdmin.from('reviews').delete().eq('id', id);
    if (error)
        throw error;
    await recalculateAvgRating(review.restaurant_id);
}
// ─── Recalculate restaurant avg rating ────────────────────────────────────────
async function recalculateAvgRating(restaurantId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('reviews')
        .select('overall_rating')
        .eq('restaurant_id', restaurantId);
    if (error || !data?.length)
        return;
    const avg = data.reduce((sum, r) => sum + r.overall_rating, 0) / data.length;
    await supabase_1.supabaseAdmin
        .from('restaurants')
        .update({ avg_rating: Math.round(avg * 10) / 10 })
        .eq('id', restaurantId);
}
// ─── Sentiment analysis (async, internal) ────────────────────────────────────
async function calculateSentiment(reviewId, text) {
    if (!text)
        return;
    const lower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    for (const word of POSITIVE_WORDS) {
        if (lower.includes(word))
            positiveCount++;
    }
    for (const word of NEGATIVE_WORDS) {
        if (lower.includes(word))
            negativeCount++;
    }
    let label = 'neutral';
    if (positiveCount > negativeCount)
        label = 'positive';
    else if (negativeCount > positiveCount)
        label = 'negative';
    await supabase_1.supabaseAdmin
        .from('reviews')
        .update({ sentiment_label: label })
        .eq('id', reviewId);
}
//# sourceMappingURL=reviews.service.js.map