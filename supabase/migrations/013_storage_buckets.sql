-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 013: Supabase Storage Buckets & Policies
-- ============================================================

-- Ensure storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- 1. Create Private Storage Buckets for ERP Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'customer-documents',
    'customer-documents',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'project-documents',
    'project-documents',
    FALSE,
    52428800, -- 50 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  ),
  (
    'land-documents',
    'land-documents',
    FALSE,
    52428800, -- 50 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  ),
  (
    'employee-documents',
    'employee-documents',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  ),
  (
    'receipts',
    'receipts',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Security Policies
-- Private bucket security: objects can only be accessed via signed URLs or Service Role
CREATE POLICY "Service role full access to storage"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
