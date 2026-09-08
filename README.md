# MSEC SIP Arena

Live tribe scoreboard for Meenakshi Sundararajan Engineering College SIP 2026–27.

- Public React SSR site (Next.js)
- Node.js + Express API
- MongoDB
- Socket.IO live updates

## Run locally

1. Start MongoDB (Docker or local):

```bash
docker compose up -d
```

2. API (http://localhost:4000)

```bash
cd backend
npm install
npm run dev
```

The API seeds 90 tribes, 5 venues, events, scores, and demo users on first start.

3. Web app (http://localhost:3000)

```bash
cd frontend
npm install
npm run dev
```

## Demo logins

Password for all demo accounts: `Admin@123`

- Super admin: `admin@msec.edu`
- Coordinator: `coordinator@msec.edu`
- Venue 1 host: `host1@msec.edu`

## Routes

Public: `/` `/overall` `/venues` `/venue/:id` `/tribes` `/tribe/:id` `/search` `/scoreboard`

Admin: `/login` `/admin` `/admin/teams` `/admin/scores` `/admin/venues` `/admin/events` `/admin/audit` `/admin/users`
