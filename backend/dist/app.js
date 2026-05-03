"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./types/express-augmentation");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const hpp_1 = __importDefault(require("hpp"));
const cors_1 = require("./config/cors");
const error_middleware_1 = require("./middleware/error.middleware");
// ─── Route modules ───────────────────────────────────────────────────────────
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const bookings_routes_1 = __importDefault(require("./modules/bookings/bookings.routes"));
const branches_routes_1 = __importDefault(require("./modules/branches/branches.routes"));
const branding_routes_1 = __importDefault(require("./modules/branding/branding.routes"));
const delivery_routes_1 = __importDefault(require("./modules/delivery/delivery.routes"));
const floor_layout_routes_1 = __importDefault(require("./modules/floor-layout/floor-layout.routes"));
const geo_routes_1 = __importDefault(require("./modules/geo/geo.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const kitchen_routes_1 = __importDefault(require("./modules/kitchen/kitchen.routes"));
const loyalty_routes_1 = __importDefault(require("./modules/loyalty/loyalty.routes"));
const menu_routes_1 = __importDefault(require("./modules/menu/menu.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
const order_items_routes_1 = __importDefault(require("./modules/order-items/order-items.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const queue_routes_1 = __importDefault(require("./modules/queue/queue.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const restaurants_routes_1 = __importDefault(require("./modules/restaurants/restaurants.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const staff_routes_1 = __importDefault(require("./modules/staff/staff.routes"));
const support_routes_1 = __importDefault(require("./modules/support/support.routes"));
const tables_routes_1 = __importDefault(require("./modules/tables/tables.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const app = (0, express_1.default)();
// ─── Global middleware (ORDER MATTERS) ──────────────────────────────────────
app.use((0, helmet_1.default)());
app.use(cors_1.corsMiddleware);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
app.use((0, hpp_1.default)());
// ─── Routes ─────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, auth_routes_1.default);
app.use(`${API}/admin`, admin_routes_1.default);
app.use(`${API}/analytics`, analytics_routes_1.default);
app.use(`${API}/bookings`, bookings_routes_1.default);
app.use(`${API}/branches`, branches_routes_1.default);
app.use(`${API}/branding`, branding_routes_1.default);
app.use(`${API}/delivery`, delivery_routes_1.default);
app.use(`${API}/floor-layout`, floor_layout_routes_1.default);
app.use(`${API}/geo`, geo_routes_1.default);
app.use(`${API}/inventory`, inventory_routes_1.default);
app.use(`${API}/kitchen`, kitchen_routes_1.default);
app.use(`${API}/loyalty`, loyalty_routes_1.default);
app.use(`${API}/menu`, menu_routes_1.default);
app.use(`${API}/notifications`, notifications_routes_1.default);
app.use(`${API}/order-items`, order_items_routes_1.default);
app.use(`${API}/orders`, orders_routes_1.default);
app.use(`${API}/payments`, payments_routes_1.default);
app.use(`${API}/queue`, queue_routes_1.default);
app.use(`${API}/reports`, reports_routes_1.default);
app.use(`${API}/restaurants`, restaurants_routes_1.default);
app.use(`${API}/reviews`, reviews_routes_1.default);
app.use(`${API}/staff`, staff_routes_1.default);
app.use(`${API}/support`, support_routes_1.default);
app.use(`${API}/tables`, tables_routes_1.default);
app.use(`${API}/users`, users_routes_1.default);
// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── 404 & Error handlers (must be last) ────────────────────────────────────
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map