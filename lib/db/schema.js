import { pgTable, text, timestamp, boolean, uuid, integer, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('writer'), // 'admin', 'writer'
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  country: text('country'),
  writingLevel: text('writing_level'), // 'beginner', 'intermediate', 'advanced'
  referralCode: text('referral_code'),
  activated: boolean('activated').default(false),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  level: text('level').default('basic'), // 'basic', 'premium'
  wordCount: integer('word_count'),
  basePayout: numeric('base_payout', { precision: 10, scale: 2 }),
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userTasks = pgTable('user_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  status: text('status').default('assigned'), // 'assigned', 'completed', 'cancelled'
  assignedAt: timestamp('assigned_at').defaultNow(),
});

// People applying to work WITH the platform (job applicants — no account needed)
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  country: text('country'),
  writingLevel: text('writing_level'),
  experience: text('experience'),
  motivation: text('motivation'),
  portfolio: text('portfolio'),
  status: text('status').default('pending'), // 'pending', 'reviewed', 'approved', 'rejected'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Training enrollments by registered writers
export const trainingApplications = pgTable('training_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  email: text('email'),
  experienceLevel: text('experience_level'),
  goals: text('goals'),
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected'
  submittedAt: timestamp('submitted_at').defaultNow(),
});

export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  isFree: boolean('is_free').default(false),
  pdfKey: text('pdf_key'),    // R2 object key for the PDF
  coverKey: text('cover_key'), // R2 object key for the cover image
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  featured: boolean('featured').default(false),
  status: text('status').default('active'),
  fileKey: text('file_key'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Advertisements displayed inside articles
export const ads = pgTable('ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  imageKey: text('image_key'),   // R2 key for the ad image
  linkUrl: text('link_url'),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Per-article ad slot assignments (null adId = random active ad)
export const articleAdSlots = pgTable('article_ad_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id').notNull(),
  slot: integer('slot').notNull(),  // 1 | 2 | 3
  adId: uuid('ad_id'),              // null → random
});

// News / Blog articles
export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('cover_image'), // R2 key
  status: text('status').default('draft'), // 'draft' | 'published'
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  readCount: integer('read_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const articleComments = pgTable('article_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bids users submit on tasks
export const taskBids = pgTable('task_bids', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bidDescription: text('bid_description'),
  status: text('status').default('pending'), // 'pending', 'accepted', 'rejected'
  adminNote: text('admin_note'),
  delivered: boolean('delivered').default(false),
  deliveryNote: text('delivery_note'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Admin ↔ user direct messages
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: text('subject'),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false),
  parentId: uuid('parent_id'), // thread root (null = top-level)
  createdAt: timestamp('created_at').defaultNow(),
});

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  productId: uuid('product_id'),
  productType: text('product_type'), // 'book', 'product', 'activation'
  phone: text('phone'),
  amount: numeric('amount', { precision: 10, scale: 2 }),
  status: text('status').default('PENDING'), // 'PENDING', 'SUCCESS', 'FAILED'
  reference: text('reference'),
  createdAt: timestamp('created_at').defaultNow(),
});
