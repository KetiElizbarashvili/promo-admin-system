# KitKat Promo Admin System

Admin panel and backend API for the KitKat promotional campaign — participant management, dual-points system, prize redemption, and a public leaderboard.

---

## Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 20 + TypeScript 5 |
| Web framework | Express 4 |
| Database | PostgreSQL (via `pg`) |
| Cache / session store | Redis 4 |
| Auth | JWT (HttpOnly cookie) + bcrypt |
| Validation | Zod |
| Email | Nodemailer (SMTP) |
| SMS | Twilio (OTP delivery) |
| Frontend | React 19 + TypeScript 5 + Vite 7 |
| UI | Tailwind CSS 3 |
| Data fetching | TanStack Query 5 + Axios |
| Forms | React Hook Form + Zod |
| Deployment | Render (backend + Redis + PostgreSQL) / Vercel (frontend) |

---

## Project Structure

```
promo-admin-system/
├── backend/                  # Express API
│   ├── src/
│   │   ├── api/              # Route handlers (thin controllers)
│   │   │   ├── auth/         # Login, logout, /me
│   │   │   ├── staff/        # Staff CRUD + email verification
│   │   │   ├── participant/  # Registration, points, lock/unlock
│   │   │   ├── prize/        # Prize CRUD + redemption
│   │   │   ├── admin/        # Leaderboard (auth) + activity logs
│   │   │   └── public/       # Unauthenticated leaderboard + search
│   │   ├── domain/           # Business logic
│   │   │   ├── staff/        # Authentication + verification
│   │   │   ├── participant/  # Service + OTP verification flow
│   │   │   ├── prize/        # Prize service + atomic redemption
│   │   │   ├── transaction/  # Leaderboard queries + audit log
│   │   │   └── shared/       # Crypto utilities (OTP, password, username)
│   │   ├── infra/            # External integrations
│   │   │   ├── email/        # Nodemailer service
│   │   │   ├── sms/          # Twilio SMS service
│   │   │   └── redis/        # Redis client + token revocation
│   │   ├── middleware/       # Auth, validator, rate limiter, logger
│   │   └── config/           # env.ts (Zod-validated), database.ts
│   ├── migrations/           # Sequential SQL migrations + runner
│   └── package.json
│
├── admin-panel/              # React SPA
│   ├── src/
│   │   ├── api/              # Axios client modules per resource
│   │   ├── components/
│   │   │   ├── auth/         # ProtectedRoute
│   │   │   └── layout/       # Header, Sidebar, Layout, Toast
│   │   ├── hooks/            # useAuth, useToast
│   │   ├── pages/            # One file per page/route
│   │   └── types/            # Shared TypeScript interfaces
│   └── package.json
│
├── docker-compose.yml        # Local PostgreSQL + Redis
├── render.yaml               # Render deployment spec
└── start.sh / status.sh      # Dev convenience scripts
```

---

## Architecture

```
Admin Panel (React + Vite)
        │  JWT cookie
        ▼
Express API (backend/src/server.ts)
  ├── Middleware: Helmet · CORS · Cookie-Parser · Rate Limiter · Logger
  ├── /api/auth          – login / logout / me
  ├── /api/staff         – staff management       [SUPER_ADMIN only]
  ├── /api/participants  – registration + points  [SUPER_ADMIN, STAFF]
  ├── /api/prizes        – prize CRUD + redeem    [SUPER_ADMIN / STAFF]
  ├── /api/admin         – leaderboard + logs     [SUPER_ADMIN / STAFF*]
  └── /api/public        – open leaderboard       [no auth]
        │
        ├── PostgreSQL  – primary data store
        └── Redis       – OTP sessions + JWT revocation list
```

`*` Leaderboard is accessible to both roles; logs are SUPER_ADMIN only.

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `staff_users` | Admin panel users (SUPER_ADMIN / STAFF) |
| `staff_email_verification` | OTP records for staff creation flow |
| `participants` | Promo participants with dual-point balances |
| `participant_verification` | Phone + email OTP sessions for registration |
| `prizes` | Available prizes with optional stock tracking |
| `transaction_log` | Immutable audit trail for all state changes |

### Two-Point System

- **`total_points`** — ever-increasing; drives leaderboard rank
- **`active_points`** — decreases on redemption; acts as spending balance

### Transaction Log Types

`REGISTER` · `ADD_POINTS` · `REDEEM` · `ADJUST` · `STAFF_CREATE` · `STAFF_ACTIVATE` · `STAFF_DEACTIVATE` · `RESET_PASSWORD` · `LOCK_PARTICIPANT` · `UNLOCK_PARTICIPANT`

### Migrations

```
migrations/
  001_initial_schema.sql          – all tables, indexes, triggers
  002_seed_super_admin.sql        – default super admin account
  003_add_prize_description.sql   – adds description column to prizes
  004_extend_transaction_log_types.sql – adds STAFF_ACTIVATE / STAFF_DEACTIVATE
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | Username + password → sets HttpOnly JWT cookie |
| POST | `/logout` | ✓ | Revokes token in Redis, clears cookie |
| GET | `/me` | ✓ | Returns current user object |

### Staff — `/api/staff` (SUPER_ADMIN only)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all staff |
| POST | `/` | Initiate creation: sends email OTP |
| POST | `/verify-email` | Verify OTP |
| POST | `/complete-registration` | Finalize staff account; credentials emailed |
| POST | `/resend-code` | Re-send email OTP |
| POST | `/reset-password` | Generate + email new password |
| PATCH | `/:id/status` | Enable / disable staff account |

### Participants — `/api/participants`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register/start` | STAFF+ | Validate fields; start OTP flow; send phone OTP |
| POST | `/register/verify-phone` | STAFF+ | Verify phone OTP; send email OTP |
| POST | `/register/verify-email` | STAFF+ | Verify email OTP |
| POST | `/register/resend-otp` | STAFF+ | Resend phone or email OTP |
| POST | `/register/complete` | STAFF+ | Create participant; send Unique ID via SMS + email |
| GET | `/search?query=` | STAFF+ | Search by name, phone, email, gov ID, or unique ID |
| GET | `/:uniqueId` | STAFF+ | Get participant details |
| POST | `/:uniqueId/add-points` | STAFF+ | Add points (logged) |
| POST | `/:uniqueId/lock` | SUPER_ADMIN | Lock participant |
| POST | `/:uniqueId/unlock` | SUPER_ADMIN | Unlock participant |

### Prizes — `/api/prizes`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | STAFF+ | All prizes |
| GET | `/active` | STAFF+ | Active prizes only |
| GET | `/:id` | STAFF+ | Single prize |
| POST | `/` | SUPER_ADMIN | Create prize |
| PUT | `/:id` | SUPER_ADMIN | Update prize |
| DELETE | `/:id` | SUPER_ADMIN | Delete prize |
| POST | `/redeem` | STAFF+ | Atomic redemption (points + stock) |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | STAFF+ | Paginated leaderboard |
| GET | `/logs` | SUPER_ADMIN | Filterable transaction log |

### Public — `/api/public` (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/leaderboard?limit=` | Public leaderboard (name + points only) |
| GET | `/search/:uniqueId` | Participant lookup by Unique ID |

### Health

```
GET /health  →  { "status": "ok", "timestamp": "..." }
```

---

## Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/countdown` | `CountdownPage` | Public |
| `/` | `DashboardPage` | All staff |
| `/participants/register` | `RegisterParticipantPage` | All staff |
| `/participants` | `ParticipantsPage` | All staff |
| `/prizes` | `PrizesPage` | All staff |
| `/leaderboard` | `LeaderboardPage` | All staff |
| `/staff` | `StaffPage` | SUPER_ADMIN |
| `/logs` | `ActivityLogsPage` | SUPER_ADMIN |

---

## Key Flows

### Participant Registration
1. Staff enters: first name, last name, gov ID, phone, email
2. Backend validates uniqueness of phone, email, gov ID
3. Phone OTP sent via SMS → staff enters code from participant
4. Email OTP sent → staff enters code from participant
5. Unique ID generated and sent to participant via SMS + email
6. Event logged as `REGISTER`

### Staff Creation (SUPER_ADMIN)
1. Admin enters: first name, last name, email, role
2. Email OTP sent to new staff's inbox
3. Admin confirms OTP
4. System generates username + random password, emails credentials
5. Event logged as `STAFF_CREATE`

### Prize Redemption
1. Staff searches participant by Unique ID
2. Staff selects prize
3. Backend atomically checks: active points ≥ cost, stock > 0, participant not locked
4. Deducts active points + decrements stock
5. Event logged as `REDEEM`

---

## Local Setup

### Prerequisites
- Node.js 20+
- Docker (for local PostgreSQL + Redis)

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in SMTP and Twilio credentials in .env
npm install
npm run migrate:up
npm run dev
# → http://localhost:3000
```

### 3. Frontend

```bash
cd admin-panel
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000
npm install
npm run dev
# → http://localhost:5173
```

### Default credentials

| Field | Value |
|---|---|
| Username | `superadmin` |
| Password | `Admin@123` |

**Change the default password before deploying to production.**

---

## Environment Variables (Backend)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | — | `development` / `production` |
| `PORT` | — | Default `3000` |
| `ALLOWED_ORIGINS` | ✓ | Comma-separated CORS allowlist |
| `DATABASE_URL` | ✓* | Postgres connection string |
| `REDIS_URL` | ✓* | Redis connection string |
| `JWT_SECRET` | ✓ | Min 32 chars |
| `JWT_EXPIRES_IN` | — | Default `8h` |
| `COOKIE_SECRET` | ✓ | Min 32 chars |
| `SMTP_HOST` | ✓ | Email provider host |
| `SMTP_PORT` | ✓ | e.g. `587` |
| `SMTP_USER` | ✓ | SMTP username |
| `SMTP_PASSWORD` | ✓ | SMTP password |
| `SMTP_FROM` | ✓ | Sender address |
| `TWILIO_ACCOUNT_SID` | ✓ | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ✓ | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | ✓ | Twilio sending number |
| `OTP_EXPIRY_MINUTES` | — | Default `10` |
| `OTP_MAX_ATTEMPTS` | — | Default `3` |
| `OTP_RESEND_COOLDOWN_SECONDS` | — | Default `60` |
| `RATE_LIMIT_WINDOW_MS` | — | Default `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | — | Default `100` |

`*` Can alternatively be split into `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` and `REDIS_HOST` / `REDIS_PORT`.

---

## Deployment (Render)

`render.yaml` provisions:
- **Web service** (`kitkat-promo-backend`) — Node, Oregon region
- **Redis** (`promo-redis`) — `noeviction` policy
- **PostgreSQL** (`promo-db`) — database `promo_admin`

`JWT_SECRET` and `COOKIE_SECRET` are auto-generated by Render. Set `ALLOWED_ORIGINS` manually to your frontend URL.

Frontend is deployed separately (Vercel) using the `admin-panel/vercel.json` config; `_redirects` handles SPA routing on Netlify/CDN if used instead.

---

## Security

- Passwords hashed with **bcrypt**
- JWT stored in **HttpOnly, Secure, SameSite** cookie (never accessible via JS)
- Token revocation via Redis set (logout immediately invalidates)
- **Zod** schema validation on all request bodies and query strings
- Parameterized SQL queries (no ORM string interpolation)
- **Helmet** with strict CSP, HSTS, no-sniff, frame-deny
- Deny-by-default CORS — explicit origin allowlist only
- Rate limiting: general (100 req/15 min), login (stricter), OTP send/verify (stricter)
- OTP codes hashed before storage; expire in 10 minutes; max 3 attempts

---

## License

Proprietary — KitKat Promo Campaign 2026
