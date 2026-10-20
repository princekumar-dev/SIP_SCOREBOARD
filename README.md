<div align="center">

# 🏆 MSEC SIP Arena

### Live Tribe Scoreboard & Score Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-live_updates-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)

**[🔗 Live Site](https://msec-notify-b5gp.vercel.app)** · **[📄 PRD](prd.md)**

</div>

---

## 📖 About

A web-based live scoring platform for the **Student Induction Program (SIP) 2026–27** at **Meenakshi Sundararajan Engineering College (MSEC)**.

The whole system is designed around one principle:

> **One Tribe → One Current Venue → Multiple Event Scores → Automatic Total → Automatic Ranking**

**90 multidisciplinary tribes** compete across **5 themed venues** (Creative & Design · Technology & Innovation · Space & Cosmic · Legends & Mythology · Power & Energy). Venue hosts enter scores as events happen, and every screen — projector, phone, or laptop — updates **in real time** via Socket.IO.

## ✨ Features

**📣 Public scoreboards**
- Overall leaderboard, venue-wise leaderboards, per-tribe pages
- **Live updates** — no refresh needed, powered by Socket.IO
- Tribe & venue directory with instant search
- Built to look great on projectors/TVs at venues and on student phones alike

**🛠 Admin platform** (role-based)
- **Super admin** — full control: users, venues, events, tribes
- **Coordinator** — cross-venue management + audit trail
- **Venue host** — score entry for their own venue only
- Audit log of every score change, JWT auth, bcrypt-hashed passwords
- Excel export for results

**🌱 Seedable demo data**
- First boot seeds **90 tribes, 5 venues, events, scores, and demo users** so you can see it working instantly.

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router, SSR), React 19, TypeScript 5, Tailwind CSS 4 |
| Realtime | Socket.IO (server push) + socket.io-client |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB (Docker Compose locally) |
| Auth | JWT + bcryptjs, role-based access |
| Export | xlsx (Excel) |
| Hosting | Vercel (frontend) + any Node host (API) |

## 📁 Repository Structure

```
SIP_SCOREBOARD/
├── prd.md               # Full product requirements document
├── docker-compose.yml   # One-command MongoDB
├── backend/             # Express + Mongoose + Socket.IO API (port 4000)
│   └── src/
└── frontend/            # Next.js app (port 3000)
    └── src/
```

## 🚀 Run Locally

### 1. Start MongoDB
```bash
docker compose up -d
```

### 2. API → http://localhost:4000
```bash
cd backend
npm install
npm run dev
```
The API seeds 90 tribes, 5 venues, events, scores, and demo users on first start. Re-seed any time with `npm run seed`.

### 3. Web app → http://localhost:3000
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Demo Logins

Password for all demo accounts: `Admin@123`

| Role | Email |
|------|-------|
| Super admin | `admin@msec.edu` |
| Coordinator | `coordinator@msec.edu` |
| Venue 1 host | `host1@msec.edu` |

## 🗺 Routes

**Public**

| Route | Purpose |
|-------|---------|
| `/` | Home / live headline scoreboard |
| `/overall` | Overall leaderboard |
| `/venues` · `/venue/:id` | Venue list & venue-wise board |
| `/tribes` · `/tribe/:id` | Tribe directory & tribe profile |
| `/search` | Instant search |
| `/scoreboard` | Full scoreboard view |

**Admin**

| Route | Purpose |
|-------|---------|
| `/login` | Role-based sign-in |
| `/admin` | Admin dashboard |
| `/admin/teams` · `/admin/scores` · `/admin/venues` · `/admin/events` | Management |
| `/admin/audit` · `/admin/users` | Audit trail & user management |

## 📄 Product Spec

The full requirements — venue structure, scoring rules, roles, and visual identity (deep purple, royal purple, gold, cream) — live in **[prd.md](prd.md)**.

---

<div align="center">

Built for **MSEC SIP 2026–27** ⚡

</div>
