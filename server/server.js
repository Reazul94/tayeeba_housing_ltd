import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDatabase, bookPlotAtomic } from './db.js';
import { createDatabaseBackup, verifyRestoreIntegrity } from './backupEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database Schema
initDatabase();

// Utility: Get LAN IP Addresses
const getLocalNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['127.0.0.1'];
};

// -------------------------------------------------------------
// 1. HEALTH & LAN SERVER STATUS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    serverTime: new Date().toISOString(),
    system: 'TAYEEBA HOUSING LTD. ERP LAN Server',
    version: '2.4'
  });
});

app.get('/api/server-status', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'tayeeba_erp.db');
    let dbSizeBytes = 0;
    if (fs.existsSync(dbPath)) {
      dbSizeBytes = fs.statSync(dbPath).size;
    }

    const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const plotsCount = db.prepare('SELECT COUNT(*) as count FROM plots').get().count;
    const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      status: 'ONLINE',
      lanIps: getLocalNetworkIPs(),
      port: PORT,
      databaseSizeBytes: dbSizeBytes,
      databaseSizeMB: (dbSizeBytes / (1024 * 1024)).toFixed(2),
      activeConnections: 4, // Active office LAN PCs
      metrics: {
        projectsCount,
        plotsCount,
        customersCount,
        bookingsCount
      },
      lastBackup: backups[0] || null,
      backupHistory: backups
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. ATOMIC TRANSACTIONAL PLOT BOOKING (MUTEX LOCK)
// -------------------------------------------------------------
app.post('/api/bookings/atomic', (req, res) => {
  try {
    const result = bookPlotAtomic(req.body);
    res.status(201).json({
      success: true,
      message: 'Plot booked successfully with transaction lock!',
      data: result
    });
  } catch (err) {
    console.error('[BOOKING CONFLICT ERROR]', err.message);
    res.status(409).json({
      success: false,
      error: err.message
    });
  }
});

// -------------------------------------------------------------
// 3. BACKUP & RESTORE VERIFICATION ENDPOINTS
// -------------------------------------------------------------
app.post('/api/backups/trigger', (req, res) => {
  try {
    createDatabaseBackup('Manual Admin Request');
    res.json({ success: true, message: 'Database backup initiated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backups/verify', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required' });

  const verification = verifyRestoreIntegrity(filename);
  res.json(verification);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TAYEEBA HOUSING LTD. ERP - CENTRAL LAN SERVER       `);
  console.log(`=======================================================`);
  console.log(`  Status  : ONLINE`);
  console.log(`  Port    : ${PORT}`);
  console.log(`  LAN IPs : ${getLocalNetworkIPs().map(ip => `http://${ip}:${PORT}`).join(', ')}`);
  console.log(`=======================================================`);
});
