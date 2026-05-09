-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'owner', 'manager', 'host', 'waiter', 'chef', 'cashier', 'customer', 'delivery_partner', 'support');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('free', 'reserved', 'occupied', 'cleaning', 'maintenance');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('created', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'closed');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('dine_in', 'delivery', 'takeaway');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'arrived', 'seated', 'no_show', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('app', 'walk_in', 'phone');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('active', 'suspended', 'pending', 'inactive');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('round', 'square', 'rectangle', 'booth');

-- CreateEnum
CREATE TYPE "MenuItemStatus" AS ENUM ('available', 'sold_out', 'hidden');

-- CreateEnum
CREATE TYPE "FloorLayoutStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'upi', 'split', 'wallet');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('waiting', 'arrived', 'seated', 'no_show', 'cancelled');

-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'assigned', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_update', 'booking_update', 'payment', 'queue_update', 'system_alert', 'promotional');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('normal', 'low', 'critical');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "restaurant_id" UUID,
    "branch_id" UUID,
    "employee_id" VARCHAR(50),
    "profile_pic_url" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(100),
    "pin_code" VARCHAR(10),
    "device_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "force_password_change" BOOLEAN NOT NULL DEFAULT false,
    "created_by_restaurant" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "cuisine_type" VARCHAR(100),
    "gst_number" VARCHAR(50),
    "status" "RestaurantStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DECIMAL(10,8),
    "lon" DECIMAL(11,8),
    "manager_id" UUID,
    "operating_hours" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_branding" (
    "restaurant_id" UUID NOT NULL,
    "primary_color" VARCHAR(7) NOT NULL DEFAULT '#1A3C5E',
    "secondary_color" VARCHAR(7) NOT NULL DEFAULT '#E8A020',
    "logo_url" TEXT,
    "banner_url" TEXT,
    "app_name_display" VARCHAR(100),
    "tagline" VARCHAR(200),
    "font_preference" VARCHAR(50) DEFAULT 'Inter',
    "welcome_animation" VARCHAR(50),
    "receipt_footer" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_branding_pkey" PRIMARY KEY ("restaurant_id")
);

-- CreateTable
CREATE TABLE "floor_layouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "layout_data" JSONB NOT NULL,
    "status" "FloorLayoutStatus" NOT NULL DEFAULT 'draft',
    "layout_version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "label" VARCHAR(10) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "floor_number" INTEGER NOT NULL DEFAULT 0,
    "shape" "TableShape" NOT NULL DEFAULT 'square',
    "zone" VARCHAR(50) NOT NULL DEFAULT 'indoor',
    "photo_url" TEXT,
    "status" "TableStatus" NOT NULL DEFAULT 'free',
    "x_pos" INTEGER,
    "y_pos" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "discounted_price" DECIMAL(10,2),
    "photo_url" TEXT,
    "dietary_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prep_time_minutes" INTEGER,
    "availability" JSONB,
    "addons" JSONB,
    "status" "MenuItemStatus" NOT NULL DEFAULT 'available',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "table_id" UUID,
    "people_count" INTEGER NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "source" "BookingSource" NOT NULL DEFAULT 'app',
    "special_requests" TEXT,
    "preferred_table_remembered" BOOLEAN NOT NULL DEFAULT false,
    "arrived_at" TIMESTAMP(3),
    "seated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "user_id" UUID,
    "table_id" UUID,
    "people_count" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'waiting',
    "source" "BookingSource" NOT NULL DEFAULT 'walk_in',
    "guest_name" VARCHAR(100),
    "guest_phone" VARCHAR(20),
    "arrived_at" TIMESTAMP(3),
    "seated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "table_id" UUID,
    "customer_id" UUID,
    "waiter_id" UUID,
    "branch_id" UUID NOT NULL,
    "order_type" "OrderType" NOT NULL DEFAULT 'dine_in',
    "status" "OrderStatus" NOT NULL DEFAULT 'created',
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "addons" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "prepared_at" TIMESTAMP(3),
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2),
    "service_charge" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transaction_ref" VARCHAR(200),
    "gateway_order_id" VARCHAR(200),
    "gateway_payment_id" VARCHAR(200),
    "receipt_url" TEXT,
    "coupon_id" UUID,
    "split_details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_amount" DECIMAL(10,2),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_partners" (
    "id" UUID NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "current_lat" DECIMAL(10,8),
    "current_lon" DECIMAL(11,8),
    "active_delivery_id" UUID,
    "rating" DECIMAL(3,2),
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'assigned',
    "pickup_address" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "delivery_lat" DECIMAL(10,8),
    "delivery_lon" DECIMAL(11,8),
    "earning" DECIMAL(10,2),
    "accepted_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "order_id" UUID,
    "overall_rating" INTEGER NOT NULL,
    "text_review" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "item_ratings" JSONB,
    "sentiment_label" "SentimentLabel",
    "sentiment_score" DECIMAL(4,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "ingredient_name" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "current_quantity" DECIMAL(10,3) NOT NULL,
    "reorder_threshold" DECIMAL(10,3) NOT NULL,
    "cost_per_unit" DECIMAL(10,2),
    "last_updated" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "menu_item_id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "quantity_per_serving" DECIMAL(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_waste_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventory_item_id" UUID NOT NULL,
    "quantity_wasted" DECIMAL(10,3) NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "logged_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_waste_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reference_id" UUID,
    "reference_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "reference_id" UUID,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "branch_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "branch_id" UUID,
    "user_id" UUID,
    "role_label" VARCHAR(50) NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "sentiment_label" "SentimentLabel",
    "sentiment_score" DECIMAL(4,3),
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID,
    "preferred_table_id" UUID,
    "preferred_table_label" VARCHAR(10),
    "times_selected" INTEGER NOT NULL DEFAULT 1,
    "last_selected" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dietary_profiles" (
    "user_id" UUID NOT NULL,
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_dietary_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "loyalty_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "loyalty_account_id" UUID NOT NULL,
    "points_change" INTEGER NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "reference_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID,
    "subject" VARCHAR(200) NOT NULL,
    "conversation" JSONB NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
    "agent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" UUID,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_restaurant_id_branch_id_idx" ON "users"("restaurant_id", "branch_id");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "branches_manager_id_key" ON "branches"("manager_id");

-- CreateIndex
CREATE INDEX "branches_restaurant_id_idx" ON "branches"("restaurant_id");

-- CreateIndex
CREATE INDEX "floor_layouts_branch_id_status_idx" ON "floor_layouts"("branch_id", "status");

-- CreateIndex
CREATE INDEX "tables_branch_id_status_idx" ON "tables"("branch_id", "status");

-- CreateIndex
CREATE INDEX "tables_branch_id_floor_number_idx" ON "tables"("branch_id", "floor_number");

-- CreateIndex
CREATE UNIQUE INDEX "tables_branch_id_label_key" ON "tables"("branch_id", "label");

-- CreateIndex
CREATE INDEX "menu_categories_branch_id_is_active_idx" ON "menu_categories"("branch_id", "is_active");

-- CreateIndex
CREATE INDEX "menu_items_branch_id_status_idx" ON "menu_items"("branch_id", "status");

-- CreateIndex
CREATE INDEX "menu_items_restaurant_id_idx" ON "menu_items"("restaurant_id");

-- CreateIndex
CREATE INDEX "bookings_branch_id_arrival_time_idx" ON "bookings"("branch_id", "arrival_time");

-- CreateIndex
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");

-- CreateIndex
CREATE INDEX "queue_entries_branch_id_status_position_idx" ON "queue_entries"("branch_id", "status", "position");

-- CreateIndex
CREATE INDEX "orders_branch_id_status_idx" ON "orders"("branch_id", "status");

-- CreateIndex
CREATE INDEX "orders_table_id_idx" ON "orders"("table_id");

-- CreateIndex
CREATE INDEX "orders_waiter_id_idx" ON "orders"("waiter_id");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_branch_id_created_at_idx" ON "orders"("branch_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_partners_active_delivery_id_key" ON "delivery_partners"("active_delivery_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_assignments_order_id_key" ON "delivery_assignments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "reviews_restaurant_id_created_at_idx" ON "reviews"("restaurant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_branch_id_idx" ON "reviews"("branch_id");

-- CreateIndex
CREATE INDEX "inventory_items_branch_id_idx" ON "inventory_items"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_menu_item_id_inventory_item_id_key" ON "recipe_ingredients"("menu_item_id", "inventory_item_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "branch_alerts_branch_id_is_resolved_idx" ON "branch_alerts"("branch_id", "is_resolved");

-- CreateIndex
CREATE INDEX "staff_feedback_restaurant_id_idx" ON "staff_feedback"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_user_id_branch_id_key" ON "customer_preferences"("user_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_accounts_user_id_key" ON "loyalty_accounts"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_branding" ADD CONSTRAINT "restaurant_branding_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_layouts" ADD CONSTRAINT "floor_layouts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_waiter_id_fkey" FOREIGN KEY ("waiter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_partners" ADD CONSTRAINT "delivery_partners_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "delivery_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_waste_logs" ADD CONSTRAINT "inventory_waste_logs_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_alerts" ADD CONSTRAINT "branch_alerts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_feedback" ADD CONSTRAINT "staff_feedback_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_feedback" ADD CONSTRAINT "staff_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_preferred_table_id_fkey" FOREIGN KEY ("preferred_table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dietary_profiles" ADD CONSTRAINT "user_dietary_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_loyalty_account_id_fkey" FOREIGN KEY ("loyalty_account_id") REFERENCES "loyalty_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: add merged_table_id column to tables
ALTER TABLE "tables" ADD COLUMN "merged_table_id" UUID;

-- CreateTable: merged_tables
CREATE TABLE "merged_tables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "table_id_1" UUID NOT NULL,
    "table_id_2" UUID NOT NULL,
    "merged_by" UUID NOT NULL,
    "unmerged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merged_tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merged_tables_branch_id_idx" ON "merged_tables"("branch_id");
CREATE INDEX "merged_tables_table_id_1_idx" ON "merged_tables"("table_id_1");
CREATE INDEX "merged_tables_table_id_2_idx" ON "merged_tables"("table_id_2");

-- AddForeignKey
ALTER TABLE "merged_tables" ADD CONSTRAINT "merged_tables_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "merged_tables" ADD CONSTRAINT "merged_tables_table_id_1_fkey" FOREIGN KEY ("table_id_1") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "merged_tables" ADD CONSTRAINT "merged_tables_table_id_2_fkey" FOREIGN KEY ("table_id_2") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
