# Backend Deployment Guide

## Option 1: Render (Recommended)

### Automatic Deployment with Blueprint:

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign in
3. Click **New** → **Blueprint**
4. Connect your repository
5. Select the `backend/render.yaml` file
6. Render will automatically create:
   - Web Service (Node.js backend)
   - PostgreSQL database
   - Redis instance
7. Add environment variables in the Render dashboard:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (email config)
   - SMS provider settings (optional for now)

### Manual Deployment:

1. Create **PostgreSQL Database**:
   - New → PostgreSQL
   - Name: `promo-db`
   - Plan: Free
   - Copy the **Internal Database URL**

2. Create **Redis**:
   - New → Redis
   - Name: `promo-redis`
   - Plan: Free
   - Copy the **Internal Redis URL**

3. Create **Web Service**:
   - New → Web Service
   - Connect your repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables:
     - `NODE_ENV=production`
     - `DATABASE_URL` = (paste PostgreSQL URL)
     - `REDIS_URL` = (paste Redis URL)
     - `JWT_SECRET` = (generate random 32+ char string)
     - `JWT_EXPIRES_IN=8h`
     - Email/SMS configs (if needed)

4. **Run migrations** (after first deploy):
   - Go to service → Shell
   - Run: `npm run migrate:up`

5. **Get your backend URL**:
   - Should be like: `https://your-app.onrender.com`

---

## Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL and Redis from marketplace
4. Configure environment variables (Railway auto-injects `DATABASE_URL` and `REDIS_URL`)
5. Deploy and run migrations in terminal

---

## Option 3: Heroku

```bash
cd backend
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
heroku config:set NODE_ENV=production JWT_SECRET=your-secret-here
git push heroku main
heroku run npm run migrate:up
```

---

## Update Frontend

After backend is deployed, update Vercel environment variable:

1. Go to Vercel → Project Settings → Environment Variables
2. Update `VITE_API_URL` to your backend URL:
   - Render: `https://your-app.onrender.com/api`
   - Railway: `https://your-app.up.railway.app/api`
   - Heroku: `https://your-app.herokuapp.com/api`
3. Redeploy frontend (or auto-deploys on next commit)

---

## Testing

Test your deployed backend:

```bash
# Health check
curl https://your-backend-url.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

Test login from frontend - it should now work!

---

## Free Tier Limits

- **Render**: 750hrs/month (sleeps after 15min inactivity, wakes on request)
- **Railway**: $5/month credit (runs continuously)
- **Heroku**: Requires credit card, limited free hours

**Recommendation**: Start with Render (easiest + free), upgrade if you need 24/7 uptime.
