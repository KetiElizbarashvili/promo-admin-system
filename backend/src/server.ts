import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { pool } from './config/database';
import { connectRedis } from './infra/redis/client';
import { generalLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './api/auth/routes';
import staffRoutes from './api/staff/routes';
import participantRoutes from './api/participant/routes';
import prizeRoutes from './api/prize/routes';
import publicRoutes from './api/public/routes';
import adminRoutes from './api/admin/routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// Health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function start() {
  try {
    await connectRedis();
    console.log('Redis connected');
    
    await pool.query('SELECT 1');
    console.log('Database connected');
    
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
