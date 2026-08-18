// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: Supabase Storage Service
// Handles private document uploads and signed URL generation
// ============================================================

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { query } from '../db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Local fallback upload directory when running completely offline
const localUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

/**
 * Upload a document buffer to Supabase Storage bucket
 * Falls back to secure local storage if Supabase credentials are not configured yet
 */
export async function uploadDocument({
  file,
  bucketName = 'customer-documents',
  customerId = null,
  projectId = null,
  plotId = null,
  employeeId = null,
  documentType = 'Other',
  description = '',
  uploadedBy = 'SYSTEM'
}) {
  if (!file) throw new Error('No file provided for upload.');

  const ext = path.extname(file.originalname).toLowerCase();
  const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
  const storagePath = `${bucketName}/${safeFilename}`;

  let storageType = 'local';

  // 1. Try uploading to Supabase Storage REST API
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${safeFilename}`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': file.mimetype,
          'x-upsert': 'true'
        },
        body: file.buffer
      });

      if (response.ok) {
        storageType = 'supabase';
      } else {
        console.warn('Supabase Storage upload warning:', await response.text());
      }
    } catch (err) {
      console.warn('Supabase Storage connection warning, using local backup:', err.message);
    }
  }

  // 2. Fallback to local storage if not Supabase
  if (storageType === 'local') {
    const targetPath = path.join(localUploadsDir, safeFilename);
    fs.writeFileSync(targetPath, file.buffer);
  }

  // 3. Record document metadata in PostgreSQL document table
  const insertResult = await query(
    `INSERT INTO document (
      document_type, customer_id, project_id, plot_id, employee_id,
      storage_bucket, storage_path, original_filename, safe_filename,
      mime_type, file_size_bytes, description, is_private, uploaded_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13)
    RETURNING *`,
    [
      documentType,
      customerId || null,
      projectId || null,
      plotId || null,
      employeeId || null,
      bucketName,
      storagePath,
      file.originalname,
      safeFilename,
      file.mimetype,
      file.size || file.buffer.length,
      description,
      uploadedBy
    ]
  );

  return {
    document: insertResult.rows[0],
    storageType
  };
}

/**
 * Generate a secure signed URL for private document download (60s TTL)
 */
export async function getSignedUrl(documentId, expiresInSeconds = 60) {
  const result = await query(`SELECT * FROM document WHERE id = $1 AND is_deleted = false`, [documentId]);
  if (result.rows.length === 0) {
    throw new Error('Document not found or has been deleted.');
  }

  const doc = result.rows[0];

  // If Supabase is configured, generate signed URL from Supabase Storage
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${doc.storage_bucket}/${doc.safe_filename}`;
      const res = await fetch(signUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: expiresInSeconds })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          signedUrl: `${SUPABASE_URL}/storage/v1${data.signedURL}`,
          document: doc,
          expiresIn: expiresInSeconds
        };
      }
    } catch (e) {
      console.warn('Failed to generate Supabase signed URL:', e.message);
    }
  }

  // Local signed token fallback
  return {
    downloadUrl: `/api/documents/${doc.id}/file`,
    document: doc,
    expiresIn: expiresInSeconds
  };
}

export default { uploadDocument, getSignedUrl };
