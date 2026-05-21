-- WriteMaster — Neon Database Schema
-- Run this in your Neon project's SQL Editor to create all tables.
-- neon.tech → Your Project → SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users (auth) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'writer',  -- 'admin' | 'writer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country TEXT,
  writing_level TEXT,          -- 'beginner' | 'intermediate' | 'advanced'
  referral_code TEXT,
  activated BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT DEFAULT 'basic',  -- 'basic' | 'premium'
  word_count INTEGER,
  base_payout NUMERIC(10,2),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Tasks (assignments) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'assigned',  -- 'assigned' | 'completed' | 'cancelled'
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Job Applications (public — no account needed) ───────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  writing_level TEXT,
  experience TEXT,
  motivation TEXT,
  portfolio TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'reviewed' | 'approved' | 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Training Applications (registered writers) ───────────────────────────────
CREATE TABLE IF NOT EXISTS training_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  experience_level TEXT,
  goals TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Books ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2),
  is_free BOOLEAN DEFAULT FALSE,
  pdf_key TEXT,     -- Cloudflare R2 object key for the PDF
  cover_key TEXT,   -- Cloudflare R2 object key for the cover image
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2),
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  file_key TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Purchases ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID,
  product_type TEXT,   -- 'book' | 'product' | 'activation'
  phone TEXT,
  amount NUMERIC(10,2),
  status TEXT DEFAULT 'PENDING',  -- 'PENDING' | 'SUCCESS' | 'FAILED'
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Ads ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_key TEXT,
  link_url TEXT,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-article ad slot assignments (null ad_id = random)
CREATE TABLE IF NOT EXISTS article_ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  slot INTEGER NOT NULL,
  ad_id UUID,
  UNIQUE(article_id, slot)
);

-- ─── Articles (News / Blog) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  status TEXT DEFAULT 'draft',    -- 'draft' | 'published'
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add delivery columns to existing task_bids (safe to run even if they exist)
ALTER TABLE task_bids ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE;
ALTER TABLE task_bids ADD COLUMN IF NOT EXISTS delivery_note TEXT;
ALTER TABLE task_bids ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Ad slots in settings
INSERT INTO settings (key, value) VALUES ('ad_slot_1', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('ad_slot_2', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('ad_slot_3', '') ON CONFLICT (key) DO NOTHING;

-- ─── Task Bids ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_description TEXT,
  status TEXT DEFAULT 'pending',   -- 'pending' | 'accepted' | 'rejected'
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)         -- one bid per user per task
);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  parent_id UUID,                  -- null = thread root; set to root message id for replies
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Settings (admin-configurable key/value pairs) ───────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default fees (edit amounts here or via admin panel)
INSERT INTO settings (key, value) VALUES ('activation_fee', '700')   ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('resources_fee',  '500')   ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('activation_description', 'One-time fee to unlock writing tasks and full platform access.') ON CONFLICT (key) DO NOTHING;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_training_applications_user_id ON training_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline ASC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- ─── Seed: First Admin Account ────────────────────────────────────────────────
-- After running this schema, create your admin account via the /signup page,
-- then run this to promote it to admin:
--
--   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
