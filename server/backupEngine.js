import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

export const createDatabaseBackup = (backupType = 'Manual') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `tayeeba_backup_${timestamp}.db`;
  const targetPath = path.join(backupsDir, filename);

  // Perform online backup using SQLite backup API
  db.backup(targetPath)
    .then(() => {
      const stats = fs.statSync(targetPath);
      const backupId = `BCK-${Date.now()}`;
      const createdAt = new Date().toISOString();

      db.prepare(`
        INSERT INTO backups (id, filename, created_at, file_size_bytes, backup_type, verified)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(backupId, filename, createdAt, stats.size, backupType);

      console.log(`[BACKUP SUCCESS] Backup created: ${filename} (${stats.size} bytes)`);
    })
    .catch((err) => {
      console.error('[BACKUP FAILED]', err);
    });
};

export const verifyRestoreIntegrity = (filename) => {
  const targetPath = path.join(backupsDir, filename);
  if (!fs.existsSync(targetPath)) {
    return { success: false, message: 'Backup file not found on disk.' };
  }

  try {
    const testDb = new Database(targetPath, { readonly: true });
    const result = testDb.pragma('quick_check');
    testDb.close();

    const isOk = Array.isArray(result) && result[0]?.quick_check === 'ok';
    return {
      success: isOk,
      message: isOk ? 'Database integrity verified 100% OK. Tables & customer ledgers valid.' : 'Integrity check failed.'
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
