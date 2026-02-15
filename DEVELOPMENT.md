# Development Guide

## Setup Instructions

### 1. Install Dependencies

#### Docker
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in
```

#### Node.js
```bash
cd backend
npm install
```

### 2. Start Services

```bash
# From project root
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your credentials
```

**Required changes:**
- `JWT_SECRET` - Already set with secure value
- `SMTP_*` - Your email service credentials
- `TWILIO_*` or SMS provider credentials

### 4. Run Migrations

```bash
cd backend
npm run migrate:up
```

### 5. Start Backend

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Default Login

- Username: `superadmin`
- Password: `Admin@123`

## Testing API Endpoints

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"Admin@123"}'

# Save token
TOKEN="your-jwt-token-here"

# Get leaderboard
curl http://localhost:3000/api/admin/leaderboard \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman/Insomnia

1. Import API collection
2. Set base URL: `http://localhost:3000/api`
3. Login and copy token
4. Add token to Authorization header for protected routes

## Database Access

```bash
# Connect to PostgreSQL
docker exec -it promo-admin-db psql -U promo_admin -d promo_admin

# Useful queries
\dt                                    # List tables
SELECT * FROM staff_users;             # View staff
SELECT * FROM participants LIMIT 10;   # View participants
SELECT * FROM transaction_log ORDER BY created_at DESC LIMIT 20;
```

## Redis Access

```bash
# Connect to Redis
docker exec -it promo-admin-redis redis-cli

# Useful commands
KEYS *                  # List all keys
GET otp:phone:995555123456
TTL otp:phone:995555123456
FLUSHALL               # Clear all (dev only!)
```

## Project Structure

```
backend/
├── src/
│   ├── api/                    # HTTP routes
│   │   ├── auth/              # Login/logout
│   │   ├── staff/             # Staff management
│   │   ├── participant/       # Participant registration & management
│   │   ├── prize/             # Prize CRUD & redemption
│   │   ├── admin/             # Leaderboard & logs
│   │   └── public/            # Public leaderboard
│   ├── domain/                 # Business logic
│   │   ├── shared/            # Crypto utilities
│   │   ├── staff/             # Staff service & verification
│   │   ├── participant/       # Participant service & verification
│   │   ├── prize/             # Prize service
│   │   └── transaction/       # Leaderboard & logs
│   ├── infra/                  # External services
│   │   ├── db/                # Database (via config)
│   │   ├── email/             # Email service
│   │   ├── sms/               # SMS service
│   │   └── redis/             # Redis client
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts            # JWT authentication
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   └── validator.ts       # Request validation
│   ├── config/                 # Configuration
│   │   ├── env.ts             # Environment variables
│   │   └── database.ts        # Database connection
│   └── server.ts               # Express app entry point
├── migrations/                 # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_seed_super_admin.sql
│   └── run.ts                 # Migration runner
├── package.json
├── tsconfig.json
└── .env                        # Environment config
```

## Common Tasks

### Add New Staff
```bash
# Via API
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "STAFF"
  }'
```

### Register Participant
```bash
# Step 1: Start registration
curl -X POST http://localhost:3000/api/participants/register/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "govId": "12345678901",
    "phone": "995555123456",
    "email": "jane@example.com"
  }'

# Step 2: Verify phone (get code from SMS)
curl -X POST http://localhost:3000/api/participants/register/verify-phone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "verify:...",
    "code": "123456"
  }'

# Step 3: Verify email (get code from email)
curl -X POST http://localhost:3000/api/participants/register/verify-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "verify:...",
    "code": "654321"
  }'

# Step 4: Complete registration
curl -X POST http://localhost:3000/api/participants/register/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "verify:...",
    "firstName": "Jane",
    "lastName": "Smith",
    "govId": "12345678901",
    "phone": "995555123456",
    "email": "jane@example.com"
  }'
```

### Add Points
```bash
curl -X POST http://localhost:3000/api/participants/KK-A1B2C3/add-points \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 50,
    "note": "Purchased 2 KitKat bars"
  }'
```

### Create Prize
```bash
curl -X POST http://localhost:3000/api/prizes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KitKat T-Shirt",
    "imageUrl": "https://example.com/tshirt.jpg",
    "costPoints": 100,
    "stockQty": 50
  }'
```

### Redeem Prize
```bash
curl -X POST http://localhost:3000/api/prizes/redeem \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueId": "KK-A1B2C3",
    "prizeId": 1
  }'
```

## Development Tips

### Watch Logs
```bash
# Backend logs
npm run dev  # Auto-reloads on file changes

# Database logs
docker compose logs -f postgres

# Redis logs
docker compose logs -f redis
```

### Reset Database
```bash
# Stop containers
docker compose down -v

# Start fresh
docker compose up -d

# Re-run migrations
cd backend && npm run migrate:up
```

### Check Migration Status
```bash
cd backend
npm run migrate:status
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart database
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Redis Connection Error
```bash
# Check Redis
docker compose ps

# Test connection
docker exec -it promo-admin-redis redis-cli ping
```

### Email Not Sending
Check `.env` SMTP settings:
- For Gmail: Use App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check firewall/network restrictions

### SMS Not Sending
- Currently using mock SMS (logs to console)
- Integrate Twilio or your SMS provider
- Update `src/infra/sms/service.ts`

## Next Steps

1. Build frontend admin panel (React)
2. Build public leaderboard site
3. Set up production environment
4. Configure real SMS provider
5. Add comprehensive tests
6. Set up CI/CD pipeline
7. Deploy to production
