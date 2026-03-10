-- ============================================================
--  RWA Community Hub — Database Schema (v1)
--  Run this in your Supabase / Neon SQL editor
-- ============================================================

-- Users table (v1 — basic registration details)
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  email            VARCHAR(150)  UNIQUE NOT NULL,
  password_hash    VARCHAR(255)  NOT NULL,
  flat_number      VARCHAR(20)   NOT NULL,
  role             VARCHAR(20)   NOT NULL DEFAULT 'resident',
                                 -- roles: 'resident' | 'admin' | 'collector'
  is_regular_payer BOOLEAN       NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index on email for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- Seed: Admin user (password: admin123)
-- Re-generate hash at: https://bcrypt-generator.com (rounds=12)
-- ============================================================
INSERT INTO users (name, email, password_hash, flat_number, role)
VALUES (
  'Admin',
  'admin@rwa.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCBCe8Yjzf.x2lqvTqlE6Vu',  -- admin123
  'ADMIN-01',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Future v2 additions (run separately when you add these features):
-- ============================================================
-- ALTER TABLE users ADD COLUMN phone VARCHAR(15);
-- ALTER TABLE users ADD COLUMN vehicle_number VARCHAR(20);
-- ALTER TABLE users ADD COLUMN vehicle_type VARCHAR(30);
-- ALTER TABLE users ADD COLUMN parking_slot VARCHAR(10);
-- ALTER TABLE users ADD COLUMN profile_image_url TEXT;
-- ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
