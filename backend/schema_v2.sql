-- ============================================================
--  RWA Community Hub — Database Schema v2 (Migration)
--  Run this AFTER schema.sql (v1) has been applied.
--  Safe to run multiple times — uses IF NOT EXISTS / DO NOTHING.
-- ============================================================

-- ============================================================
-- 1. Extend users table with new profile fields
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone           VARCHAR(15),
  ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(15),
  ADD COLUMN IF NOT EXISTS floor_number    VARCHAR(10),
  ADD COLUMN IF NOT EXISTS resident_type   VARCHAR(10) DEFAULT 'owner';
  -- resident_type: 'owner' | 'tenant'

-- ============================================================
-- 2. Vehicles table
--    One row per vehicle per resident.
--    Stores both user-submitted data AND RC API-fetched data.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ── User-entered (required) ────────────────────────────────
  registration_number VARCHAR(20)  NOT NULL,
  registered_name     VARCHAR(150) NOT NULL,   -- name as on RC
  contact_info        VARCHAR(150) NOT NULL,   -- phone/email linked to this vehicle
  vehicle_type        VARCHAR(30)  NOT NULL,   -- '2-wheeler' | '4-wheeler' | 'heavy' | 'other'

  -- ── User-entered (optional) ────────────────────────────────
  image_url           TEXT,                    -- Supabase Storage public URL

  -- ── RC API auto-fetched (nullable — populated after lookup) ─
  make                VARCHAR(100),
  model               VARCHAR(100),
  fuel_type           VARCHAR(30),
  color               VARCHAR(50),
  owner_type          VARCHAR(50),             -- 'Individual' | 'Company' etc.
  rto_code            VARCHAR(20),             -- e.g. 'DL-01'
  registration_date   DATE,
  vehicle_age_years   INTEGER,                 -- computed: EXTRACT(year FROM AGE(NOW(), registration_date))
  fitness_upto        DATE,
  insurance_upto      DATE,
  puc_upto            DATE,
  financer_name       VARCHAR(150),
  rc_status           VARCHAR(30),             -- 'ACTIVE' | 'SUSPENDED' | 'NOC ISSUED' etc.
  api_last_fetched_at TIMESTAMPTZ,             -- timestamp of last successful RC API call

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg_no  ON vehicles(registration_number);

-- ============================================================
-- 3. Tenant details table
--    One row per tenant-type resident (conditional on resident_type).
-- ============================================================

CREATE TABLE IF NOT EXISTS tenant_details (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  move_in_date  DATE         NOT NULL,
  owner_name    VARCHAR(150) NOT NULL,
  owner_phone   VARCHAR(15)  NOT NULL,
  owner_email   VARCHAR(150),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. Notices table
-- ============================================================

CREATE TABLE IF NOT EXISTS notices (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  category    VARCHAR(50)  NOT NULL,   -- 'local_event' | 'electricity' | 'water_supply' | 'weekly_meeting' | ...
  urgency     VARCHAR(20)  NOT NULL DEFAULT 'normal', -- 'normal' | 'important' | 'urgent'
  date        DATE         NOT NULL,
  created_by  INTEGER      NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_date     ON notices(date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_urgency  ON notices(urgency);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);

-- ============================================================
-- 5. Grievances table
-- ============================================================

CREATE TABLE IF NOT EXISTS grievances (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id),
  sector      VARCHAR(50)  NOT NULL,   -- 'roads' | 'sewage' | 'electricity' | 'water' | 'security' | ...
  description TEXT         NOT NULL,
  priority    VARCHAR(20)  NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high'
  status      VARCHAR(20)  NOT NULL DEFAULT 'open',   -- 'open' | 'in_progress' | 'resolved'
  image_url   TEXT,                                   -- optional photo attachment (Supabase Storage)
  resolved_by INTEGER      REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status  ON grievances(status);

-- ============================================================
-- 6. Payments table (online, verified)
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER     NOT NULL REFERENCES users(id),
  duration_months  INTEGER     NOT NULL,              -- 2 | 4 | 6 | 12
  amount           INTEGER     NOT NULL,              -- in INR
  status           VARCHAR(20) NOT NULL DEFAULT 'paid', -- 'paid' | 'failed' | 'refunded'
  payment_type     VARCHAR(20) NOT NULL DEFAULT 'online', -- 'online'
  razorpay_order_id   VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  invoice_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ============================================================
-- 7. Offline tickets table
-- ============================================================

CREATE TABLE IF NOT EXISTS offline_tickets (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(id),
  duration_months INTEGER     NOT NULL,
  amount          INTEGER     NOT NULL,
  time_slot       VARCHAR(20) NOT NULL,   -- e.g. '14:00', '14:30' (24hr format)
  slot_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                              -- 'pending' | 'collected' | 'approved' | 'cancelled'
  collected_by    INTEGER     REFERENCES users(id),  -- collector user_id
  collected_at    TIMESTAMPTZ,
  approved_by     INTEGER     REFERENCES users(id),  -- admin user_id
  approved_at     TIMESTAMPTZ,
  reminder_sent   BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offline_tickets_user_id   ON offline_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_tickets_status    ON offline_tickets(status);
CREATE INDEX IF NOT EXISTS idx_offline_tickets_slot_date ON offline_tickets(slot_date);

-- ============================================================
-- 8. Service People table
-- ============================================================

CREATE TABLE IF NOT EXISTS service_people (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  category       VARCHAR(50)  NOT NULL,   -- 'maid' | 'electrician' | 'plumber' | 'carpenter' | ...
  contact_number VARCHAR(15)  NOT NULL,
  notes          TEXT,
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  added_by       INTEGER      REFERENCES users(id),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. Gallery Events table
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  event_date  DATE         NOT NULL,
  created_by  INTEGER      NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. Event Media table (photos + videos per event)
-- ============================================================

CREATE TABLE IF NOT EXISTS event_media (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  uploaded_by INTEGER      NOT NULL REFERENCES users(id),
  media_url   TEXT         NOT NULL,      -- Supabase Storage URL
  media_type  VARCHAR(10)  NOT NULL,      -- 'photo' | 'video'
  caption     VARCHAR(300),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);

-- ============================================================
-- Auto-update updated_at trigger (reusable)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to all tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','vehicles','tenant_details','notices','grievances',
                            'offline_tickets','service_people','events']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================
-- End of schema v2
-- ============================================================
