import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['visitor', 'member', 'admin'] }).notNull().default('visitor'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}))

export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: text('tier', { enum: ['bronze', 'silver', 'gold'] }).notNull(),
  status: text('status', { enum: ['active', 'pending', 'cancelled', 'expired'] }).notNull().default('pending'),
  squareSubscriptionId: text('square_subscription_id'),
  squareOrderId: text('square_order_id'),
  priceCents: integer('price_cents').notNull(),
  startsAt: integer('starts_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const memberProfiles = sqliteTable('member_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  website: text('website'),
  phone: text('phone'),
  bio: text('bio'),
  logoUrl: text('logo_url'),
  category: text('category'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const directoryListings = sqliteTable('directory_listings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  category: text('category').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  website: text('website'),
  logoUrl: text('logo_url'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  location: text('location'),
  startAt: integer('start_at', { mode: 'timestamp' }).notNull(),
  endAt: integer('end_at', { mode: 'timestamp' }),
  priceCents: integer('price_cents').notNull().default(0),
  squareItemId: text('square_item_id'),
  published: integer('published', { mode: 'boolean' }).default(false),
  capacity: integer('capacity'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const eventRegistrations = sqliteTable('event_registrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['registered', 'attended', 'cancelled'] }).notNull().default('registered'),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'waived', 'refunded'] }).notNull().default('pending'),
  squareOrderId: text('square_order_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id').references(() => directoryListings.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  contactEmail: text('contact_email').notNull(),
  published: integer('published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['membership', 'event', 'donation'] }).notNull(),
  squareOrderId: text('square_order_id').notNull().unique(),
  totalCents: integer('total_cents').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const leads = sqliteTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  interest: text('interest'),
  message: text('message'),
  source: text('source').default('website'),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['new', 'contacted', 'qualified', 'closed', 'lost'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status', { enum: ['new', 'open', 'resolved'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorType: text('actor_type', { enum: ['user', 'ai_agent', 'system'] }).notNull(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const aiAgentSessions = sqliteTable('ai_agent_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').notNull(),
  sessionKey: text('session_key').notNull(),
  intent: text('intent'),
  actions: text('actions'),
  result: text('result'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})
