-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 003: Projects, Blocks, Zones, Roads
-- ============================================================

CREATE TABLE IF NOT EXISTS project (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code              TEXT UNIQUE NOT NULL,       -- e.g. THL-PRJ-001
  project_name              TEXT NOT NULL,
  location                  TEXT NOT NULL,
  land_area_decimal         NUMERIC(10,4) DEFAULT 0,
  land_area_katha           NUMERIC(10,4) DEFAULT 0,
  total_plots               INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'Planning'
                              CHECK (status IN ('Planning','Ongoing','Near Completion','Completed','Cancelled')),
  launch_date               DATE,
  expected_completion       DATE,
  manager_id                UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  manager_name              TEXT,
  development_budget        NUMERIC(18,2) DEFAULT 0,
  actual_development_cost   NUMERIC(18,2) DEFAULT 0,
  description               TEXT,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_status ON project(status, is_active);

CREATE TABLE IF NOT EXISTS project_block (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  block_name    TEXT NOT NULL,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, block_name)
);

CREATE TABLE IF NOT EXISTS project_zone (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id      UUID NOT NULL REFERENCES project_block(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  zone_name     TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (block_id, zone_name)
);

CREATE TABLE IF NOT EXISTS project_road (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id       UUID REFERENCES project_zone(id) ON DELETE SET NULL,
  block_id      UUID REFERENCES project_block(id) ON DELETE SET NULL,
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  road_name     TEXT NOT NULL,
  width_feet    NUMERIC(6,2),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_project_updated_at
  BEFORE UPDATE ON project
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
