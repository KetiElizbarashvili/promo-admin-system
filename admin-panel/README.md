# KitKat Promo Admin Panel

Modern React admin panel for managing the KitKat promotional campaign.

## Features

- **Authentication** - Secure staff login with JWT
- **Dashboard** - Quick access to all features
- **Participant Registration** - Multi-step wizard with OTP verification
- **Participant Management** - Search, add points, lock/unlock
- **Prize Management** - CRUD operations and redemptions
- **Leaderboard** - Real-time rankings
- **Staff Management** - Create and manage staff (Super Admin)
- **Activity Logs** - Complete audit trail (Super Admin)

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- TanStack Query (data fetching)
- Axios (HTTP client)
- React Hook Form + Zod (forms)
- TailwindCSS (styling)
- Lucide React (icons)

## Quick Start

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if backend is not on localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

App runs on `http://localhost:5173`

### 4. Login

Default credentials:
- Username: `superadmin`
- Password: `Admin@123`

## Build for Production

```bash
npm run build
```

Build output in `dist/` directory.

## Project Structure

```
src/
├── api/              # API client & endpoints
│   ├── client.ts     # Axios instance
│   ├── auth.ts       # Authentication
│   ├── participant.ts
│   ├── prize.ts
│   ├── staff.ts
│   └── admin.ts
├── components/       # Reusable components
│   ├── auth/         # Auth components
│   ├── layout/       # Layout components
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx   # Auth context
│   └── useToast.ts   # Toast notifications
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RegisterParticipantPage.tsx
│   ├── ParticipantsPage.tsx
│   ├── PrizesPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── StaffPage.tsx
│   └── ActivityLogsPage.tsx
├── types/            # TypeScript types
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Features Guide

### Participant Registration
1. Navigate to "Register Participant"
2. Fill in participant details
3. System sends SMS OTP to phone
4. Verify phone code
5. System sends email OTP
6. Verify email code
7. Participant receives Unique ID via SMS & email

### Add Points
1. Navigate to "Participants"
2. Search by Unique ID, phone, or email
3. Select participant
4. Click "Add Points"
5. Enter points and optional note
6. Confirm

### Prize Redemption
1. Navigate to "Prizes"
2. Click "Redeem Prize"
3. Enter participant Unique ID
4. Select prize
5. System validates and processes

### Staff Management (Super Admin Only)
1. Navigate to "Staff Management"
2. Click "Add Staff"
3. Enter staff details
4. System sends email verification
5. Enter verification code
6. System creates account and emails credentials

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Development Tips

### Hot Reload
Changes auto-reload in development mode.

### API Errors
Check browser console for detailed error messages.

### Authentication Issues
If stuck in login loop:
1. Open browser DevTools
2. Go to Application > Local Storage
3. Clear `token` and `user`
4. Refresh page

## Deployment

### Static Hosting (Netlify, Vercel)
```bash
npm run build
# Deploy dist/ directory
```

### Configure API URL
Set `VITE_API_URL` environment variable in hosting platform.

### CORS
Ensure backend allows your domain in CORS settings.

## License

Proprietary - KitKat Promo Campaign 2026
