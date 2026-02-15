# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Roles:
- `SUPER_ADMIN` - Full access
- `STAFF` - Limited access (cannot manage staff or view logs)

---

## 1. Authentication

### POST /auth/login
Login staff user.

**Request:**
```json
{
  "username": "superadmin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@kitkat-promo.com",
    "username": "superadmin",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-02-15T10:00:00.000Z"
  }
}
```

### POST /auth/logout
Logout (client-side token removal).

---

## 2. Staff Management (SUPER_ADMIN only)

### GET /staff
Get all staff members.

### POST /staff
Create new staff (Step 1: Send verification email).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "STAFF"
}
```

**Response:**
```json
{
  "message": "Verification code sent to email",
  "email": "john@example.com",
  "nextStep": "verify-email"
}
```

### POST /staff/verify-email
Verify email with OTP (Step 2).

**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

### POST /staff/complete-registration
Complete staff creation (Step 3).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "STAFF"
}
```

**Response:**
```json
{
  "message": "Staff created successfully. Credentials sent to email.",
  "staff": {
    "id": 2,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "john.doe123",
    "role": "STAFF"
  }
}
```

### POST /staff/resend-code
Resend verification code.

**Request:**
```json
{
  "email": "john@example.com"
}
```

### POST /staff/reset-password
Reset staff password (SUPER_ADMIN only).

**Request:**
```json
{
  "staffId": 2
}
```

---

## 3. Participant Registration

### POST /participants/register/start
Start registration (Step 1: Send phone OTP).

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "govId": "12345678901",
  "phone": "995555123456",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "message": "Registration started. Phone verification code sent.",
  "sessionId": "verify:1708000000000:abc123",
  "participant": {
    "firstName": "Jane",
    "lastName": "Smith",
    "govId": "12345678901",
    "phone": "995555123456",
    "email": "jane@example.com"
  },
  "nextStep": "verify-phone"
}
```

### POST /participants/register/verify-phone
Verify phone OTP (Step 2: Sends email OTP).

**Request:**
```json
{
  "sessionId": "verify:1708000000000:abc123",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Phone verified. Email verification code sent.",
  "sessionId": "verify:1708000000000:abc123",
  "nextStep": "verify-email"
}
```

### POST /participants/register/verify-email
Verify email OTP (Step 3).

**Request:**
```json
{
  "sessionId": "verify:1708000000000:abc123",
  "code": "654321"
}
```

**Response:**
```json
{
  "message": "Email verified successfully.",
  "sessionId": "verify:1708000000000:abc123",
  "nextStep": "complete-registration"
}
```

### POST /participants/register/resend-otp
Resend OTP code.

**Request:**
```json
{
  "sessionId": "verify:1708000000000:abc123",
  "type": "phone"
}
```

### POST /participants/register/complete
Complete registration (Step 4: Creates participant).

**Request:**
```json
{
  "sessionId": "verify:1708000000000:abc123",
  "firstName": "Jane",
  "lastName": "Smith",
  "govId": "12345678901",
  "phone": "995555123456",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "message": "Participant registered successfully. Unique ID sent to phone and email.",
  "participant": {
    "id": 1,
    "uniqueId": "KK-A1B2C3",
    "firstName": "Jane",
    "lastName": "Smith",
    "govId": "12345678901",
    "phone": "995555123456",
    "email": "jane@example.com",
    "totalPoints": 0,
    "activePoints": 0,
    "status": "ACTIVE",
    "createdAt": "2026-02-15T12:00:00.000Z"
  }
}
```

---

## 4. Participant Management

### GET /participants/search?query=KK-A1B2C3
Search participants by Unique ID, phone, or email.

**Response:**
```json
{
  "participants": [
    {
      "id": 1,
      "uniqueId": "KK-A1B2C3",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "995555123456",
      "email": "jane@example.com",
      "totalPoints": 150,
      "activePoints": 100,
      "status": "ACTIVE"
    }
  ]
}
```

### GET /participants/:uniqueId
Get participant by Unique ID.

### POST /participants/:uniqueId/add-points
Add points to participant.

**Request:**
```json
{
  "points": 50,
  "note": "Purchased 2 KitKat bars"
}
```

**Response:**
```json
{
  "message": "Points added successfully",
  "participant": {
    "uniqueId": "KK-A1B2C3",
    "totalPoints": 200,
    "activePoints": 150,
    ...
  }
}
```

### POST /participants/:uniqueId/lock
Lock participant (SUPER_ADMIN only).

**Request:**
```json
{
  "reason": "Suspicious activity detected"
}
```

### POST /participants/:uniqueId/unlock
Unlock participant (SUPER_ADMIN only).

---

## 5. Prize Management

### GET /prizes
Get all prizes (admin view).

**Response:**
```json
{
  "prizes": [
    {
      "id": 1,
      "name": "KitKat T-Shirt",
      "imageUrl": "https://example.com/tshirt.jpg",
      "costPoints": 100,
      "stockQty": 50,
      "status": "ACTIVE",
      "createdAt": "2026-02-15T10:00:00.000Z"
    }
  ]
}
```

### GET /prizes/active
Get only active prizes with stock.

### GET /prizes/:id
Get specific prize.

### POST /prizes
Create prize (SUPER_ADMIN only).

**Request:**
```json
{
  "name": "KitKat T-Shirt",
  "imageUrl": "https://example.com/tshirt.jpg",
  "costPoints": 100,
  "stockQty": 50
}
```

### PUT /prizes/:id
Update prize (SUPER_ADMIN only).

**Request:**
```json
{
  "stockQty": 100,
  "status": "ACTIVE"
}
```

### DELETE /prizes/:id
Delete prize (SUPER_ADMIN only).

### POST /prizes/redeem
Redeem prize for participant.

**Request:**
```json
{
  "uniqueId": "KK-A1B2C3",
  "prizeId": 1
}
```

**Response:**
```json
{
  "message": "Prize redeemed successfully"
}
```

---

## 6. Leaderboard (Admin)

### GET /admin/leaderboard?limit=100&offset=0
Get full leaderboard with names.

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "uniqueId": "KK-A1B2C3",
      "firstName": "Jane",
      "lastName": "Smith",
      "totalPoints": 500,
      "activePoints": 300
    }
  ]
}
```

---

## 7. Activity Logs (SUPER_ADMIN only)

### GET /admin/logs
Get transaction logs with filters.

**Query params:**
- `type` - Filter by transaction type
- `participantId` - Filter by participant
- `staffUserId` - Filter by staff
- `startDate` - Filter from date
- `endDate` - Filter to date
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset

**Response:**
```json
{
  "logs": [
    {
      "id": 123,
      "type": "ADD_POINTS",
      "participantId": 1,
      "participantName": "Jane Smith",
      "staffUserId": 2,
      "staffName": "John Doe",
      "pointsChange": 50,
      "prizeId": null,
      "prizeName": null,
      "note": "Purchased 2 KitKat bars",
      "createdAt": "2026-02-15T14:30:00.000Z"
    }
  ]
}
```

---

## 8. Public API (No authentication required)

### GET /public/leaderboard?limit=100
Get public leaderboard (only Unique IDs and points).

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "uniqueId": "KK-A1B2C3",
      "totalPoints": 500
    }
  ]
}
```

### GET /public/search/:uniqueId
Search participant in leaderboard.

**Response:**
```json
{
  "participant": {
    "rank": 5,
    "uniqueId": "KK-A1B2C3",
    "totalPoints": 300,
    "activePoints": 150
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad request / Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Rate Limits

- General API: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- OTP send: 1 request per 60 seconds per identifier
- OTP verify: 10 attempts per 15 minutes
- Max OTP attempts: 3 per code
- OTP expiry: 10 minutes
