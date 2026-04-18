# 📋 RWA Pocket-19 — Project Task Tracker

> **Project**: Residents Welfare Association Portal — Sector-24, Rohini, Pocket-19  
> **Stack**: React + Vite + TypeScript (Frontend) · Express + Node.js (Backend) · Supabase/PostgreSQL (DB)  
> **Deployment**: Vercel (Frontend) · Render (Backend) · Supabase (Database)  
> **Last Updated**: April 2026

---

## Legend
- ✅ Done — Already implemented and functional
- 🔄 In Progress — Partially done, needs completion
- 🔲 To Do — Not yet started
- 🚫 Removed — Feature to be scrapped

---

## Phase 0 — Housekeeping & Code Ownership

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Remove all `lovable-tagger` dev dependency references | 🔲 | `package.json` still has `lovable-tagger` in devDependencies |
| 0.2 | Remove any Lovable-injected comments/metadata from source files | 🔲 | Audit all `.tsx` files for Lovable-specific artifacts |
| 0.3 | Rename `package.json` `name` field from `vite_react_shadcn_ts` | 🔲 | Change to `rwa-pocket19-portal` |
| 0.4 | Update `index.html` — title, meta description, favicon | 🔲 | Change to "RWA Pocket-19 | Sector-24 Rohini" |
| 0.5 | Add a proper `README.md` to the project root | ✅ | Done |
| 0.6 | Add `TASKS.md` (this file) | ✅ | Done |
| 0.7 | Add a `.env.example` for the frontend (Vite env vars) | 🔲 | Document `VITE_API_URL` etc. |

---

## Phase 1 — Authentication & User Management

### 1A — Registration (Multi-step Form)

The current registration form only collects: Name, Email, Flat Number, Password.
Required fields (per specifications):

| # | Field | Status | Notes |
|---|-------|--------|-------|
| 1A.1 | Full Name | ✅ | Already collected |
| 1A.2 | Email | ✅ | Already collected |
| 1A.3 | Password | ✅ | Already collected |
| 1A.4 | Phone Number (primary) | 🔲 | Missing from form & DB |
| 1A.5 | Alternate Phone Number (optional) | 🔲 | Missing from form & DB |
| 1A.6 | Flat Number | ✅ | Collected but stored as plain text — needs floor + flat split |
| 1A.7 | Floor Number | 🔲 | Needs separate field; critical for forgot-password lookup |
| 1A.8 | Number of Vehicles | 🔲 | Stepper to choose how many vehicles the resident owns |
| 1A.9 | Vehicle Details — Per Vehicle Sub-form | 🔲 | One form card per vehicle, added dynamically based on 1A.8 count |
| 1A.9a | → Registration Number (RC number) | 🔲 | Required; triggers RC API auto-fill on blur |
| 1A.9b | → Name as Registered on RC | 🔲 | Required; pre-filled from API if available |
| 1A.9c | → Contact Info linked to vehicle | 🔲 | Required; phone/email for vehicle-related comms |
| 1A.9d | → Vehicle Type (2-Wheeler / 4-Wheeler / Other) | 🔲 | Required; dropdown |
| 1A.9e | → Vehicle Image Upload (photo of vehicle) | 🔲 | Optional; upload to Supabase Storage |
| 1A.9f | → RC API auto-populate: Make, Model, RTO, Owner Type, Age | 🔲 | Fetched via RC API on registration number entry |
| 1A.9g | → RC API auto-populate: Insurance validity, PUC validity | 🔲 | Fetched via RC API; stored for admin view |
| 1A.10 | Resident Type (Owner / Tenant) | 🔲 | Missing from form & DB |
| 1A.11 | Tenant Details (move-in date, owner's name, owner phone) | 🔲 | Conditional — shown only if type = Tenant |
| 1A.12 | Convert to multi-step/stepper form UI | 🔲 | Too many fields for a single page |

### 1B — Database Schema Updates

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1B.1 | Add `phone` column to `users` table | 🔲 | VARCHAR(15), NOT NULL |
| 1B.2 | Add `alternate_phone` column | 🔲 | VARCHAR(15), nullable |
| 1B.3 | Add `floor_number` column | 🔲 | INT or VARCHAR, NOT NULL |
| 1B.4 | Add `resident_type` column | 🔲 | ENUM: 'owner' or 'tenant' |
| 1B.5 | Create `vehicles` table (FK to users) | 🔲 | See full schema in Phase 1E below |
| 1B.6 | Create `tenant_details` table (FK to users) | 🔲 | Fields: move_in_date, owner_name, owner_phone |
| 1B.7 | Create DB migration script `schema_v2.sql` | 🔲 | Additive migration from v1 |

---

### 1E — Vehicle Details & RC API Integration

#### Vehicle Form (per vehicle added during registration)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1E.1 | Registration Number input (RC number) | 🔲 | Required; text field — format: DL01AB1234 |
| 1E.2 | "Lookup" button / on-blur RC API call | 🔲 | Calls backend proxy to RC API with reg number |
| 1E.3 | Name as Registered field | 🔲 | Required; pre-filled from API response if available |
| 1E.4 | Contact Info for vehicle | 🔲 | Required; linked phone/email for this vehicle |
| 1E.5 | Vehicle Type selector (2-Wheeler / 4-Wheeler / Heavy / Other) | 🔲 | Required dropdown |
| 1E.6 | Vehicle image upload (optional) | 🔲 | File upload → Supabase Storage; returns URL stored in DB |
| 1E.7 | Show API-fetched details preview card after lookup | 🔲 | Make, Model, RTO, Insurance, PUC, Owner Type, Age |
| 1E.8 | Allow manual override if API fails / data is wrong | 🔲 | Editable fields pre-filled from API |
| 1E.9 | Store all vehicle data in `vehicles` DB table | 🔲 | Both user-entered and API-fetched fields |

#### Database — `vehicles` Table Schema

```sql
CREATE TABLE vehicles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- User-entered (required)
  registration_number VARCHAR(20)  NOT NULL,
  registered_name     VARCHAR(150) NOT NULL,
  contact_info        VARCHAR(150) NOT NULL,
  vehicle_type        VARCHAR(30)  NOT NULL,  -- '2-wheeler', '4-wheeler', 'heavy', 'other'

  -- User-entered (optional)
  image_url           TEXT,                   -- Supabase Storage URL

  -- RC API auto-fetched (stored for admin view, nullable if API fails)
  make                VARCHAR(100),
  model               VARCHAR(100),
  fuel_type           VARCHAR(30),
  color               VARCHAR(50),
  owner_type          VARCHAR(50),            -- e.g. 'Individual', 'Company'
  rto_code            VARCHAR(20),            -- e.g. 'DL-01'
  registration_date   DATE,
  vehicle_age_years   INTEGER,               -- computed from registration_date
  fitness_upto        DATE,
  insurance_upto      DATE,
  puc_upto            DATE,
  financer_name       VARCHAR(150),
  rc_status           VARCHAR(30),            -- 'ACTIVE', 'SUSPENDED', etc.
  api_last_fetched_at TIMESTAMPTZ,            -- when API was last queried

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_reg_no  ON vehicles(registration_number);
```

#### Backend — RC API Integration

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1E.10 | Choose RC API provider | 🔲 | **Recommended: Surepass.io** (sandbox free, paid production) or **RapidAPI: India Vehicle Info** |
| 1E.11 | Backend proxy route: POST /api/vehicles/rc-lookup | 🔲 | Accepts { registrationNumber }, calls RC API, returns parsed data — NEVER expose API key to frontend |
| 1E.12 | Cache RC API response in DB on first lookup | 🔲 | Avoid duplicate API calls — reuse stored data with `api_last_fetched_at` check |
| 1E.13 | Backend: POST /api/vehicles — save vehicle to DB | 🔲 | Authenticated; validates required fields |
| 1E.14 | Backend: GET /api/vehicles/:userId — get user's vehicles | 🔲 | Used by profile page |
| 1E.15 | Backend: PATCH /api/vehicles/:id — update vehicle details | 🔲 | User can edit own; admin can edit any |
| 1E.16 | Backend: DELETE /api/vehicles/:id | 🔲 | Only owner or admin |
| 1E.17 | Backend: GET /api/admin/vehicles — all vehicles (admin only) | 🔲 | With pagination, search, filter by type/RTO/insurance status |
| 1E.18 | Store RC API key in backend .env only | 🔲 | NEVER on the frontend — proxy all lookups through backend |

#### Admin — Vehicle Directory View

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1E.19 | Admin vehicles page `/admin/vehicles` | 🔲 | Table view of all pocket-19 registered vehicles |
| 1E.20 | Show: Reg. No, Owner Name, Flat, Type, Make/Model, RTO | 🔲 | Columnar table with sort |
| 1E.21 | Show: Insurance expiry status (valid / expiring soon / expired) | 🔲 | Color-coded badges |
| 1E.22 | Show: PUC expiry status (valid / expiring / expired) | 🔲 | Color-coded badges |
| 1E.23 | Show: RC status (Active / Suspended) | 🔲 | Badge |
| 1E.24 | Click row → Full vehicle detail drawer/modal | 🔲 | All DB fields including API-fetched data |
| 1E.25 | Filter by: vehicle type, insurance status, PUC status, RTO | 🔲 | — |
| 1E.26 | Export vehicle list as CSV (admin only) | 🔲 | Phase 2 |
| 1E.27 | Alert admin if insurance/PUC expiring within 30 days | 🔲 | Dashboard notification or dedicated alert panel |

#### Recommended API Providers (choose one)

| Provider | URL | Sandbox | Pricing Model | Data Quality |
|----------|-----|---------|--------------|-------------|
| **Surepass** | surepass.io | Free sandbox | Per-call (contact sales) | High — Vahan DB |
| **Attestr** | attestr.com | Free trial | Per-call subscription | High — Vahan DB |
| **RapidAPI — India Vehicle Info** | rapidapi.com | ~10 free calls | Per-call / monthly | Medium |
| **CarRegistrationAPI.in** | carregistrationapi.in | Limited free | Per-call | Medium |

> **Recommendation**: Use **Surepass** for production (most reliable, Vahan-direct) and their free sandbox for development/testing. The API key must be stored only in the backend `.env` — never shipped to the frontend.

#### RC API Response Fields Used

```json
{
  "registration_number": "DL01AB1234",
  "owner_name": "NIDHISH KUMAR",
  "vehicle_class": "MOTOR CAR (LMV)",
  "make": "MARUTI SUZUKI",
  "model": "SWIFT VXI",
  "fuel_type": "PETROL",
  "color": "WHITE",
  "registration_date": "12-Mar-2019",
  "fitness_upto": "11-Mar-2034",
  "insurance_upto": "11-Mar-2027",
  "pollution_upto": "10-Mar-2026",
  "rto_code": "DL-01",
  "owner_type": "Individual",
  "financer_name": "HDFC BANK",
  "status": "ACTIVE"
}
```

### 1C — Login & Session

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1C.1 | Persistent login via `localStorage` | ✅ | JWT stored, user restored on load |
| 1C.2 | Session until explicit logout | ✅ | JWT 7-day expiry |
| 1C.3 | Token expiry handling (auto logout on 401) | 🔲 | Need interceptor in API calls |
| 1C.4 | Forgot Password feature (via email) | 🔲 | Backend route + reset token flow |
| 1C.5 | Forgot Email feature (lookup by flat + floor number) | 🔲 | Backend route: POST /api/auth/find-account |
| 1C.6 | Update `AuthContext` register() to pass new fields | 🔲 | Phone, floor, vehicle data, resident type |
| 1C.7 | Update backend POST /api/auth/register for new fields | 🔲 | Validate and persist all new fields |

### 1D — Profile / Account Section

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1D.1 | Create `/profile` page (currently missing entirely) | 🔲 | New page & route |
| 1D.2 | Display all resident details on profile page | 🔲 | Name, flat, floor, phones, vehicles, type |
| 1D.3 | Allow editing of resident details | 🔲 | PATCH /api/users/:id backend route |
| 1D.4 | Add "My Profile" link to sidebar/header | 🔲 | Show avatar + name with link |
| 1D.5 | Profile photo upload (optional — Phase 2) | 🔲 | Supabase Storage integration |

---

## Phase 2 — Dashboard

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | "At a Glance" stats cards | ✅ | Using mock data |
| 2.2 | Monthly collection bar chart | ✅ | Using mock/static data |
| 2.3 | Grievances by sector pie chart | ✅ | Using mock/static data |
| 2.4 | Quick Actions section | ✅ | Navigates to pages |
| 2.5 | Recent Activity feed | ✅ | Static mock entries |
| 2.6 | Remove "Book Park" quick action | 🔲 | Park booking being removed |
| 2.7 | Add "My Profile" quick action | 🔲 | Replace park booking slot |
| 2.8 | Wire dashboard stats to real DB data | 🔲 | API calls via React Query |
| 2.9 | Show resident's active offline ticket status on dashboard | 🔲 | Banner if ticket is pending |
| 2.10 | Real-time activity feed from DB | 🔲 | Phase 2 / backend events |

---

## Phase 3 — Maintenance (Primary Feature)

### 3A — Online Payment

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3A.1 | Duration selector (2/4/6/12 months) | ✅ | Functional |
| 3A.2 | Amount display | ✅ | Functional |
| 3A.3 | "Pay Now" demo button (simulated) | ✅ | Simulated 1.5s delay |
| 3A.4 | Razorpay SDK integration | 🔲 | Load script, create order via backend, handle callback |
| 3A.5 | Backend: POST /api/payments/create-order | 🔲 | Calls Razorpay API with amount |
| 3A.6 | Backend: POST /api/payments/verify | 🔲 | Verify Razorpay signature |
| 3A.7 | Store verified payment in `payments` DB table | 🔲 | Create payments table |
| 3A.8 | Generate PDF invoice after successful payment | 🔲 | Use jspdf or pdf-lib on frontend |
| 3A.9 | Invoice download button | 🔲 | Trigger PDF download |
| 3A.10 | Payment reflected in History tab from DB | 🔲 | Via DB, not mock state |

### 3B — Offline Payment

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3B.1 | Time slot text input (basic) | ✅ | Exists but needs replacement |
| 3B.2 | Replace with dropdown (12pm–6pm, 30min slots) | 🔲 | Generate slots: 12:00, 12:30, 1:00 ... 5:30 |
| 3B.3 | Reconfirmation dialog before slot booking | 🔲 | Modal with full details summary |
| 3B.4 | One-active-ticket-per-user enforcement | 🔲 | Check DB before allowing new booking |
| 3B.5 | Generate downloadable ticket PDF | 🔲 | jspdf — name, flat, slot, amount, ticket ID |
| 3B.6 | Email notification 1 hour before slot | 🔲 | Backend cron job + email service |
| 3B.7 | Store offline tickets in DB `offline_tickets` table | 🔲 | Create table |
| 3B.8 | Dashboard shows active pending ticket | 🔲 | See task 2.9 |
| 3B.9 | After admin approval — generate invoice PDF | 🔲 | Trigger on status = 'approved' |
| 3B.10 | Prevent duplicate active tickets per user | 🔲 | Backend + frontend validation |

### 3C — Collector View

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3C.1 | Collector sees list of pending tickets | ✅ | Basic implementation |
| 3C.2 | Filter by all/pending/collected | ✅ | Functional |
| 3C.3 | Mark Collected action | ✅ | Updates status |
| 3C.4 | Show today's schedule sorted by time slot | 🔲 | Group by date, sort by time |
| 3C.5 | Wire collector view to real DB | 🔲 | Via API |

### 3D — Admin Ticket Verification

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3D.1 | Admin sees collected tickets for approval | ✅ | Basic list |
| 3D.2 | Approve action | ✅ | Updates status |
| 3D.3 | Wire to real DB | 🔲 | Via API |
| 3D.4 | On approval, trigger invoice + notify resident | 🔲 | Email service required |

---

## Phase 4 — Notices

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | List notices by category with colored border | ✅ | Functional |
| 4.2 | Admin: Create new notice dialog | ✅ | Functional (mock state) |
| 4.3 | Filter by category | 🔲 | Filter buttons needed |
| 4.4 | Filter by urgency level | 🔲 | Add `urgency` field to Notice type + DB |
| 4.5 | Sort by date / urgency | 🔲 | Sort control UI needed |
| 4.6 | Click to expand full notice in modal | 🔲 | Currently renders inline only |
| 4.7 | Add `urgency` field to Notice type + DB | 🔲 | Values: normal / important / urgent |
| 4.8 | Wire notices to DB (GET / POST) | 🔲 | Backend CRUD routes + DB table |
| 4.9 | Highlight urgent notices with visual indicator | 🔲 | Pulse dot or banner |

---

## Phase 5 — Gallery

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Flat image grid with lightbox | ✅ | Basic grid |
| 5.2 | Lightbox image viewer with prev/next | ✅ | Functional |
| 5.3 | Upload image via URL | ✅ | Basic (URL-based) |
| 5.4 | Redesign as event-based gallery | 🔲 | Event cards with title, desc, photos, videos |
| 5.5 | Create `events` + `event_media` DB tables | 🔲 | events(id, title, desc, date), event_media(id, event_id, url, type, uploaded_by) |
| 5.6 | File upload to Supabase Storage | 🔲 | Photos & videos — not just URLs |
| 5.7 | Filter: Photos only / Videos only / Uploaded by me | 🔲 | Per-event filter controls |
| 5.8 | Video playback in lightbox | 🔲 | Detect media type, render video tag |
| 5.9 | Admin: Create new event card | 🔲 | Title + description + date |
| 5.10 | Any resident can upload media to an event | 🔲 | Upload flow per event |

---

## Phase 6 — Park Booking (TO BE REMOVED)

> Not compliant with DDA guidelines — feature to be removed completely.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Remove ParkBooking.tsx | 🔲 | — |
| 6.2 | Remove /park-booking route from App.tsx | 🔲 | — |
| 6.3 | Remove Park Booking from all nav menus | 🔲 | AppLayout.tsx — all roles |
| 6.4 | Remove "Book Park" from Dashboard quick actions | 🔲 | Dashboard.tsx |
| 6.5 | Remove MOCK_PARK_BOOKINGS and ParkBooking type | 🔲 | mockData.ts, types.ts |
| 6.6 | Remove upcomingBookings stat from Dashboard | 🔲 | Replace with meaningful stat |

---

## Phase 7 — Grievances

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | List grievances with sector filters | ✅ | Functional |
| 7.2 | Resident: Raise new complaint | ✅ | Functional (mock state) |
| 7.3 | Admin: Resolve grievance | ✅ | Functional (mock state) |
| 7.4 | Expand grievance types | 🔲 | Electricity lamp, pothole, sewage, etc. |
| 7.5 | Add photo attachment to grievances | 🔲 | Upload to Supabase Storage |
| 7.6 | Add urgency/priority level | 🔲 | Low / Medium / High |
| 7.7 | My Complaints vs All tab | 🔲 | Resident default = own; admin = all |
| 7.8 | Wire grievances to real DB | 🔲 | CRUD API routes + DB table |
| 7.9 | Admin: Add comment/response | 🔲 | Phase 2 feature |

---

## Phase 8 — Service People

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Directory grid with search + category filter | ✅ | Functional |
| 8.2 | Call button linking to phone number | ✅ | Functional |
| 8.3 | Admin: Add new service person | ✅ | Functional (mock state) |
| 8.4 | Expand service categories (plumber, carpenter, etc.) | 🔲 | Update SERVICE_CATEGORIES |
| 8.5 | Click card to view full details modal | 🔲 | Name, category, phone, notes |
| 8.6 | Wire to real DB | 🔲 | CRUD API + service_people table |
| 8.7 | Admin: Edit / delete service person | 🔲 | — |
| 8.8 | Resident: Rate a service person | 🔲 | Phase 2 |

---

## Phase 9 — Quick Links

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Static grid of govt portal links | ✅ | 5 links + 3 emergency numbers |
| 9.2 | Add TPDDL / TATA Power-DDL portal link | 🔲 | Correct electricity board for Rohini |
| 9.3 | Click card — expand sub-links modal | 🔲 | Show specific services within portal |
| 9.4 | Add Rohini/Sector-24 specific links | 🔲 | Ward office, local police station etc. |
| 9.5 | Admin: Add/edit quick links dynamically | 🔲 | Via DB — optional phase |

---

## Phase 10 — Admin Panel

| # | Task | Status | Notes |
|---|------|--------|-------|
| 10.1 | Users list page (/users) | ✅ | Basic page exists |
| 10.2 | View full user details | 🔲 | Wire to DB |
| 10.3 | Edit user details (name, role, flat, phone) | 🔲 | Admin override |
| 10.4 | Delete / deactivate user | 🔲 | Soft-delete preferred |
| 10.5 | Oversee all payments/transactions | 🔲 | Dedicated admin view |
| 10.6 | View/resolve all grievances | 🔲 | Consolidated view |
| 10.7 | Post/manage notices | ✅ | Post notice done |
| 10.8 | Manage gallery events | 🔲 | Create/delete events |
| 10.9 | Manage service people | ✅ | Add done |
| 10.10 | Approve offline payment tickets | ✅ | Basic implementation |
| 10.11 | Admin analytics dashboard | 🔲 | Phase 2 |

---

## Phase 11 — Super Admin (Future)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 11.1 | Super Admin role in DB | 🔲 | Add super_admin to role enum |
| 11.2 | Admin management (view/create/remove admins) | 🔲 | — |
| 11.3 | Audit log of admin actions | 🔲 | — |
| 11.4 | Full override access to all data | 🔲 | — |

---

## Phase 12 — UI/UX Polish & Layout

| # | Task | Status | Notes |
|---|------|--------|-------|
| 12.1 | Add site-wide Footer | 🔲 | Nav links, contact info, copyright |
| 12.2 | Add "Account" / Profile link in sidebar | 🔲 | Currently only name + logout |
| 12.3 | Sidebar — show profile avatar/initials | 🔲 | — |
| 12.4 | Responsive improvements for mobile | 🔄 | Mobile sheet sidebar exists; needs testing |
| 12.5 | 404 page polish | ✅ | Exists but minimal |
| 12.6 | Page loading skeleton states | 🔲 | Replace spinners with Skeleton UI |
| 12.7 | Dark/Light mode toggle | 🔲 | Currently hard dark — optional enhancement |
| 12.8 | Consistent page header component | 🔲 | Extract repeated h1 + subtitle pattern |

---

## Phase 13 — Backend Infrastructure

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13.1 | Auth routes (login, register, me) | ✅ | Done |
| 13.2 | JWT middleware for protected routes | 🔲 | Create `authenticate` middleware |
| 13.3 | Role-based access middleware | 🔲 | `authorize('admin')` etc. |
| 13.4 | Payments API routes | 🔲 | CRUD + Razorpay hooks |
| 13.5 | Notices API routes | 🔲 | CRUD |
| 13.6 | Grievances API routes | 🔲 | CRUD |
| 13.7 | Service People API routes | 🔲 | CRUD |
| 13.8 | Gallery Events API routes | 🔲 | CRUD + media upload |
| 13.9 | Users API routes (admin) | 🔲 | GET all, PATCH, DELETE |
| 13.10 | Offline Tickets API routes | 🔲 | CRUD + status transitions |
| 13.11 | Email service integration (Resend / Nodemailer) | 🔲 | Slot reminders, payment confirmations |
| 13.12 | Cron job for 1-hour slot reminders | 🔲 | `node-cron` package |
| 13.13 | Razorpay integration | 🔲 | Order creation + webhook verification |
| 13.14 | Rate limiting & security hardening | 🔲 | `express-rate-limit`, `helmet` |
| 13.15 | Input validation middleware | 🔲 | Zod schemas on the backend |

---

## Phase 14 — Database Schema (Full v2)

Tables to create beyond the current `users` table:

| Table | Status | Description |
|-------|--------|-------------|
| users (v2) | 🔄 | Add phone, alt_phone, floor_number, resident_type |
| vehicles | 🔲 | Full schema defined in Phase 1E — includes RC API fields |
| tenant_details | 🔲 | Tenant-specific info (FK: user_id) |
| payments | 🔲 | Online + approved offline payments |
| offline_tickets | 🔲 | Offline slot booking tickets |
| notices | 🔲 | Community notices |
| grievances | 🔲 | Resident complaints |
| service_people | 🔲 | Service directory |
| events | 🔲 | Gallery events |
| event_media | 🔲 | Photos/videos attached to events |
| quick_links | 🔲 | Admin-managed quick links (optional) |

---

## Implementation Priority Order

### 🔴 Immediate (Sessions 1–2)
1. Phase 0 — Remove Lovable artifacts, rename package, update index.html
2. Phase 6 — Remove Park Booking everywhere  
3. Phase 12.1 — Add Footer component
4. Phase 1A/1B/1C — Expanded multi-step Registration + DB schema v2

### 🟡 Short-term (Sessions 3–5)
5. Phase 1D — Profile/Account page
6. Phase 13 — Backend routes (Notices, Grievances, Service People, Users)
7. Phase 4/7/8 — Wire Notices, Grievances, Service People to DB
8. Phase 3B.2 — Fix offline slot dropdown (12pm–6pm, 30-min windows)
9. Phase 3A.4 — Razorpay integration

### 🟢 Medium-term (Sessions 6–10)
10. Phase 3A.8 / 3B.5 — PDF invoice + ticket generation
11. Phase 5 — Gallery redesign to event-based model
12. Phase 13.11 / 13.12 — Email service + cron job for reminders
13. Phase 10 — Full Admin panel wired to DB
14. Phase 2.8 — Live dashboard data from DB

### 🔵 Future
15. Phase 11 — Super Admin role
16. Remaining Phase 14 DB tables
17. Rating system for service people
18. Grievance photo attachments
19. Admin analytics and reporting

---

*This document is the source of truth for all development decisions. Update statuses as tasks are completed.*
