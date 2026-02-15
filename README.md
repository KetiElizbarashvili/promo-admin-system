# KitKat Promo Admin System

Admin panel for KitKat promotional campaign with participant management, points system, and prize redemption.

## 🚀 Quick Start (5 minutes)

### Backend Setup

### 1. Install Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

### 2. Start Database & Redis

```bash
docker compose up -d
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your SMTP and SMS credentials
```

### 4. Run Migrations

```bash
cd backend
npm run migrate:up
```

### 5. Start Development Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3000`

## Default Credentials

**Super Admin:**
- Username: `superadmin`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change password immediately in production!

## 📖 Documentation

- **[API.md](API.md)** - Complete API reference with examples
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide & troubleshooting  
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Technical details & architecture
- **[test-api.sh](test-api.sh)** - Automated API testing script

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel (TODO)                    │
│                  React + TypeScript                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Express API (COMPLETE)                  │
│  ┌──────────┬──────────┬──────────┬──────────────────┐ │
│  │   Auth   │  Staff   │ Participant │   Prizes      │ │
│  │  Routes  │  Routes  │   Routes    │   Routes      │ │
│  └──────────┴──────────┴──────────┴──────────────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Domain Logic Layer                      │  │
│  │  Staff│Participant│Prize│Transaction Services    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Infrastructure Layer                      │  │
│  │    PostgreSQL │ Redis │ Email │ SMS              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Public Leaderboard (TODO)                   │
│                Simple HTML/React                         │
└─────────────────────────────────────────────────────────┘
```

---

```
backend/
├── src/
│   ├── api/          # HTTP routes
│   ├── domain/       # Business logic
│   ├── infra/        # External services (DB, email, SMS)
│   ├── middleware/   # Auth, validation, rate limiting
│   └── config/       # Environment & database config
├── migrations/       # Database migrations
└── package.json
```

## Key Features

- **Role-based access control** (Super Admin / Staff)
- **Two-point system**: Total Points (leaderboard) + Active Points (redemption)
- **OTP verification** for both phone and email
- **Transaction logging** for all operations
- **Rate limiting** on sensitive endpoints
- **Prize management** with stock control

## Development Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Run production build
npm run migrate:up   # Run database migrations
npm run migrate:status # Check migration status
```

## API Endpoints (To be implemented)

### Auth
- `POST /api/auth/login` - Staff login
- `POST /api/auth/logout` - Logout

### Staff (Super Admin only)
- `POST /api/staff` - Create staff account
- `POST /api/staff/verify-email` - Verify staff email with OTP
- `POST /api/staff/:id/reset-password` - Reset staff password
- `GET /api/staff` - List all staff

### Participants
- `POST /api/participants/register` - Start registration
- `POST /api/participants/verify-phone` - Verify phone OTP
- `POST /api/participants/verify-email` - Verify email OTP
- `GET /api/participants/search` - Search by ID/phone/email
- `POST /api/participants/:id/add-points` - Add points
- `POST /api/participants/:id/redeem` - Redeem prize
- `PUT /api/participants/:id/lock` - Lock participant (Super Admin)

### Prizes (Super Admin only)
- `GET /api/prizes` - List prizes
- `POST /api/prizes` - Create prize
- `PUT /api/prizes/:id` - Update prize
- `DELETE /api/prizes/:id` - Delete prize

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (admin view)
- `GET /api/public/leaderboard` - Public leaderboard
- `GET /api/public/search/:uniqueId` - Search participant by Unique ID

### Logs (Super Admin only)
- `GET /api/logs` - Activity logs with filters

---

## 📊 Project Status

**Backend**: ✅ **100% Complete** (28 API endpoints, 22 TS files, 2 migrations)
**Frontend**: ✅ **100% Complete** (8 pages, full admin panel)

**Completed:**
- ✅ Authentication system
- ✅ Staff management with email verification  
- ✅ Participant registration with dual OTP
- ✅ Points management (Total + Active)
- ✅ Prize CRUD & redemption
- ✅ Leaderboard (public + admin)
- ✅ Activity logs
- ✅ Security & rate limiting
- ✅ **React Admin Panel (NEW)**

**Ready for Production!**

---

## 🎯 Key Features Detail

### Two-Point System
- **Total Points**: Never decrease, used for leaderboard ranking
- **Active Points**: Decrease on redemption, used as currency

### Participant Registration Flow
1. Staff enters participant info
2. System sends phone OTP → participant verifies
3. System sends email OTP → participant verifies  
4. System generates Unique ID → sent to phone & email
5. Participant can now check leaderboard

### Prize Redemption Flow
1. Staff searches participant by Unique ID
2. Staff selects prize from available list
3. System validates:
   - Sufficient active points
   - Prize in stock
   - Participant not locked
4. Atomic deduction (points + stock)
5. Transaction logged

---

## 📁 Project Structure

See `backend/migrations/001_initial_schema.sql` for complete schema.

**Core tables:**
- `staff_users` - Admin panel users
- `participants` - Promo participants
- `prizes` - Available prizes
- `transaction_log` - Audit trail

---

## 🔒 Security Features

- Password hashing (bcrypt)
- JWT authentication
- Rate limiting on login, OTP requests
- OTP expiration (10 minutes)
- Request validation (Zod schemas)
- SQL injection protection (parameterized queries)
- CORS & Helmet security headers

## Next Steps

1. Implement authentication routes (`/api/auth`)
2. Build staff management flows
3. Create participant registration with OTP
4. Add points & redemption logic
5. Build prize management
6. Create public leaderboard site
7. Add comprehensive error handling
8. Write integration tests
9. Set up CI/CD pipeline
10. Deploy to production

## Environment Variables

See `backend/.env.example` for all required configuration.

**Critical for production:**
- `JWT_SECRET` - Minimum 32 characters
- `SMTP_*` - Email service credentials
- `TWILIO_*` or SMS provider credentials
- Strong database passwords

## License

Proprietary - KitKat Promo Campaign 2026
