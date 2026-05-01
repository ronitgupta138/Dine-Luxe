export const ROLES = {
  SUPER_ADMIN:      "super_admin",
  OWNER:            "owner",
  MANAGER:          "manager",
  HOST:             "host",
  WAITER:           "waiter",
  CHEF:             "chef",
  CASHIER:          "cashier",
  CUSTOMER:         "customer",
  DELIVERY_PARTNER: "delivery_partner",
  SUPPORT:          "support",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
 
export const ORDER_STATUS = {
  CREATED:    "created",
  CONFIRMED:  "confirmed",
  PREPARING: "preparing",
  READY:     "ready",
  SERVED:    "served",
  PAID:      "paid",
  CLOSED:    "closed",
  CANCELLED:  "cancelled",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
 
export const TABLE_STATUS = {
  FREE:        "free",
  RESERVED:    "reserved",
  OCCUPIED:    "occupied",
  CLEANING:    "cleaning",
  MAINTENANCE: "maintenance",
} as const;
export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];
 
export const BOOKING_STATUS = {
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  ARRIVED:   "arrived",
  SEATED:    "seated",
  NO_SHOW:   "no_show",
  CANCELLED: "cancelled",
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
 
export const PAYMENT_METHODS = {
  CASH:  "cash",
  CARD:  "card",
  UPI:   "upi",
  SPLIT: "split",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
 
export const ORDER_TYPES = {
  DINE_IN:  "dine_in",
  DELIVERY: "delivery",
  TAKEAWAY: "takeaway",
} as const;
export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];
 
export const COLORS = {
  PRIMARY:   "#1A3C5E",
  ACCENT:    "#E8A020",
  SUCCESS:   "#1E7E34",
  WARNING:   "#F39C12",
  DANGER:    "#C0392B",
  INFO:      "#2980B9",
  NEUTRAL:   "#7F8C8D",
  CLEANING:  "#F1C40F",
  DARK_BG:   "#111111",
  DARK_SURFACE: "#1A1A1A",
} as const;
 
export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  free:        COLORS.SUCCESS,
  reserved:    COLORS.INFO,
  occupied:    COLORS.DANGER,
  cleaning:    COLORS.CLEANING,
  maintenance: COLORS.NEUTRAL,
};
 
export const WS_EVENTS = {
  ORDER_CREATED:          "order_created",
  ORDER_CANCELLED:        "order_cancelled",
  ORDER_STATUS_UPDATED:   "order_status_updated",
  KITCHEN_STATUS_UPDATED: "kitchen_status_updated",
  FOOD_READY:             "food_ready",
  TABLE_STATUS_CHANGED:   "table_status_changed",
  QUEUE_UPDATED:          "queue_updated",
  ARRIVAL_DETECTED:       "arrival_detected",
  QUEUE_POSITION_UPDATE:  "queue_position_update",
  PAYMENT_CONFIRMED:      "payment_confirmed",
  INVENTORY_LOW:          "inventory_low",
  OVERDUE_ORDER:          "overdue_order",
  CUSTOMER_CALL_WAITER:   "customer_call_waiter",
  BRANDING_UPDATED:       "branding_updated",
  LOCATION_UPDATE:        "location_update",
  DELIVERY_COMPLETE:      "delivery_complete",
} as const;
 
export const DIETARY_TAGS = ["veg","non_veg","vegan","halal","jain","gluten_free"] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];
 
export const ALLERGENS = ["nuts","dairy","gluten","eggs","soy","shellfish"] as const;
export type Allergen = (typeof ALLERGENS)[number];
 
export const CACHE_TTL = {
  BRANDING:        60 * 60 * 1000,
  MENU:            10 * 60 * 1000,
  NEARBY_SEARCH:    5 * 60 * 1000,
  DASHBOARD_STATS:  5 * 60 * 1000,
} as const;
 
export const GEO_ARRIVAL_RADIUS_METERS = 150;
export const PAGINATION = { DEFAULT_LIMIT: 20, MAX_LIMIT: 100 } as const;
