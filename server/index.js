// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: Main Express Server Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { checkConnection } from './src/db.js';
import authRouter from './src/routes/auth.js';
import apiRouter from './src/routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS Configuration
// ============================================================
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed.`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Request Logger (development)
// ============================================================
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(`${statusColor}${req.method}\x1b[0m ${req.path} → ${res.statusCode} [${duration}ms]`);
    });
    next();
  });
}

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

// ============================================================
// Health Check Endpoints (public — used by frontend offline guard)
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    app: 'TAYEEBA HOUSING LTD. ERP',
  });
});

app.get('/api/health/database', async (req, res) => {
  const db = await checkConnection();
  if (db.connected) {
    return res.json({
      status: 'ok',
      database: 'PostgreSQL (Supabase)',
      ...db,
    });
  }
  return res.status(503).json({
    status: 'error',
    database: 'PostgreSQL (Supabase)',
    ...db,
  });
});

app.get('/api/health/info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const ips = [];
  for (const ifaces of Object.values(networkInterfaces)) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    networkIPs: ips,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error.',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
});

// ============================================================
// Start Server
// ============================================================
const networkInterfaces = os.networkInterfaces();
const ips = [];
for (const ifaces of Object.values(networkInterfaces)) {
  for (const iface of ifaces) {
    if (iface.family === 'IPv4' && !iface.internal) {
      ips.push(iface.address);
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n\x1b[1m\x1b[36m╔══════════════════════════════════════════════╗');
  console.log('║     TAYEEBA HOUSING LTD. ERP v2.6           ║');
  console.log('╚══════════════════════════════════════════════╝\x1b[0m');
  console.log(`\n\x1b[32m✓\x1b[0m Server started on port \x1b[1m${PORT}\x1b[0m`);
  console.log(`\n\x1b[33mLocal:\x1b[0m     http://localhost:${PORT}/api/health`);
  for (const ip of ips) {
    console.log(`\x1b[33mNetwork:\x1b[0m   http://${ip}:${PORT}/api/health`);
  }
  console.log(`\n\x1b[33mDatabase:\x1b[0m  ${process.env.DATABASE_URL ? '✓ Supabase PostgreSQL' : '⚠ Not configured (set DATABASE_URL in .env)'}`);
  console.log('\x1b[90mPress CTRL+C to stop\x1b[0m\n');

  // Test DB connection on startup
  checkConnection().then(status => {
    if (status.connected) {
      console.log(`\x1b[32m✓\x1b[0m PostgreSQL connected — Server time: ${status.serverTime}\n`);
    } else {
      console.log(`\x1b[31m✗\x1b[0m PostgreSQL NOT connected: ${status.error}\n`);
      console.log('\x1b[90mSet DATABASE_URL in server/.env to connect to Supabase\x1b[0m\n');
    }
  });
});

export default app;
