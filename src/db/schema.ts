import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  gender: text("gender").notNull().default("unisex"), // men | women | unisex
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percent"), // percent | fixed
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  status: text("status").notNull().default("pending"), // pending | processing | shipped | delivered | cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  image: text("image"),
  size: text("size"),
  color: text("color"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer accounts. When Supabase Auth is configured, `id` mirrors the
// Supabase auth user id (uuid) and passwordHash stays null. In local/fallback
// mode we store a scrypt hash here.
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  passwordHash: text("password_hash"),
  provider: text("provider").notNull().default("local"), // local | supabase
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin panel users (managed inside the admin panel → Team).
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("manager"), // owner | manager | staff
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Customer = typeof customers.$inferSelect;
