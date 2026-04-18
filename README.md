# 🏘️ RWA Pocket-19 Community Portal

> **Residents Welfare Association** — Sector-24, Rohini, New Delhi  
> Pocket-19 | Built for community, managed by residents.

---

## 📌 Overview

The **RWA Pocket-19 Portal** is a full-stack web application designed to digitize and streamline the operations of the Residents Welfare Association of Pocket-19, Sector-24, Rohini. It serves three user roles — **Residents**, **Collectors**, and **Admins** — each with tailored access and capabilities.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui + Framer Motion |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL via Supabase |
| **Auth** | JWT (JSON Web Tokens) stored in localStorage |
| **Deployment** | Vercel (Frontend) · Render (Backend) |

---

## 🗂️ Project Structure

```
rwa_latest/
├── src/                        # Frontend source
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── AppLayout.tsx       # Sidebar + header layout
│   │   ├── ProtectedRoute.tsx  # Role-based route guard
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global auth state + JWT handling
│   ├── data/
│   │   ├── mockData.ts         # Placeholder data (to be replaced by API)
│   │   └── types.ts            # TypeScript interfaces
│   ├── pages/                  # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── Maintenance.tsx
│   │   ├── Notices.tsx
│   │   ├── Gallery.tsx
│   │   ├── Grievances.tsx
│   │   ├── ServicePeople.tsx
│   │   ├── QuickLinks.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── App.tsx                 # Root router
│
├── backend/                    # Express API server
│   ├── src/
│   │   ├── routes/
│   │   │   └── auth.ts         # Login, Register, /me
│   │   ├── db.ts               # PostgreSQL pool (pg)
│   │   └── index.ts            # App entry + CORS setup
│   ├── schema.sql              # DB schema v1
│   └── .env.example            # Required environment variables
│
├── public/                     # Static assets
└── ...config files
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- npm or bun
- A Supabase project (or any PostgreSQL instance)

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Runs at http://localhost:5173
```

### Backend

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env

# Start backend
npm run dev
# → Runs at http://localhost:3001
```

### Environment Variables

**Backend (`backend/.env`)**:
```
DATABASE_URL=postgresql://your_supabase_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## 🗃️ Database Setup

Run the schema against your Supabase (or PostgreSQL) project:

```sql
-- Run backend/schema.sql first (v1 base schema)
-- Then run backend/schema_v2.sql when available (adds phones, vehicles, etc.)
```

Default admin credentials seeded by schema:
- **Email**: `admin@rwa.com`
- **Password**: `admin123`

---

## 👥 User Roles

### 🏠 Resident
- Register with full details (name, phone, flat, floor, vehicle info, resident type)
- Pay maintenance fees (online via Razorpay or offline via slot booking)
- Download invoices and payment tickets as PDFs
- View and filter community notices
- Browse the community gallery and upload event photos/videos
- Raise and track complaints in the Grievance Portal
- Browse the Service People directory
- Access government quick links and emergency numbers
- Manage their profile from the Account section

### 🚚 Collector
- View their assigned offline payment slots for the day
- Mark slots as collected once payment is received
- Sorted schedule view by time slot

### 🛡️ Admin
- All resident features
- Create and manage community notices
- Approve/reject offline payment tickets (generates invoice on approval)
- Resolve grievances
- Manage service people directory
- Create gallery events
- View and manage all user accounts
- Access transaction history and analytics

### 👑 Super Admin *(planned)*
- Oversee and manage admins
- Full audit access across all data

---

## 📄 Features

### ✅ Implemented
- JWT-based auth with persistent session (login, register, logout)
- Role-based route protection and navigation
- Dashboard with stats, charts (bar + pie), quick actions, and activity feed
- Maintenance page — duration picker, online (demo) + offline payment flows, history timeline
- Notice board with category labels and admin posting
- Gallery with lightbox image viewer and upload form
- Grievances portal with sector filters and admin resolve action
- Service People directory with search, category filter, and call button
- Quick Links to Delhi govt portals + emergency contacts
- Collector view for offline tickets with mark-collected action
- Admin section for ticket approval

### 🔲 Planned / In Progress
- Multi-step registration with full resident profile fields
- Forgot Password + Forgot Email (by flat + floor number)
- Profile / Account page with edit support
- Razorpay integration for online payments
- PDF invoice and ticket download
- Offline slot time dropdown (12pm–6pm, 30min windows)
- Email reminders (1 hour before offline collection slot)
- Gallery redesign — event cards with photos + video upload
- Complete backend API for all features (currently using mock data)
- Park Booking removal (not compliant with DDA guidelines)
- Site-wide footer with quick navigation

---

## 🗺️ Roadmap

See [`TASKS.md`](./TASKS.md) for the detailed phase-by-phase development plan.

---

## 🔒 Security Notes

- Passwords are hashed using `bcrypt` (12 rounds) — never stored in plain text
- JWT tokens expire after 7 days
- CORS is configured to only allow the production frontend URL
- All admin routes require role validation (middleware in progress)
- Razorpay payments will be server-side signature verified before being recorded

---

## 📦 Deployment

### Frontend (Vercel)
- Auto-deploys on push to `main` branch
- Configure `VITE_API_URL` environment variable in Vercel dashboard

### Backend (Render)
- Auto-deploys from the `backend/` directory
- Set all env vars (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`) in Render dashboard
- Health check endpoint: `GET /health`

---

## 🙏 Credits

Built and maintained by the residents of Pocket-19, Sector-24, Rohini — with ❤️ for the community.

---

## 📬 Contact

For issues or queries, raise a grievance through the portal or contact the RWA committee directly.
