-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 004: Plot Inventory
-- ============================================================

CREATE TYPE plot_status AS ENUM (
  'Available', 'Reserved', 'Booked', 'Sold',
  'Transferred', 'Cancelled', 'On Hold'
);

CREATE TABLE IF NOT EXISTS plot (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_number         TEXT NOT NULL,
  project_id          UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  block_id            UUID REFERENCES project_block(id) ON DELETE SET NULL,
  zone_id             UUID REFERENCES project_zone(id) ON DELETE SET NULL,
  road_id             UUID REFERENCES project_road(id) ON DELETE SET NULL,
  block_name          TEXT,
  zone_name           TEXT,
  road_name           TEXT,
  size_katha          NUMERIC(10,4) NOT NULL DEFAULT 0,
  size_decimal        NUMERIC(10,4),
  facing              TEXT CHECK (facing IN ('North','South','East','West','North-East','South-East','North-West','South-West')),
  price_per_katha     NUMERIC(18,2) NOT NULL DEFAULT 0,
  base_price          NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount            NUMERIC(18,2) NOT NULL DEFAULT 0,
  final_price         NUMERIC(18,2) GENERATED ALWAYS AS (base_price - discount) STORED,
  status              plot_status NOT NULL DEFAULT 'Available',
  customer_id         UUID,                              -- set on booking
  customer_name       TEXT,
  booking_id          UUID,
  booking_date        DATE,
  agreement_date      DATE,
  handover_status     TEXT DEFAULT 'Pending',
  sales_executive_id  UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, plot_number)                       -- prevent duplicate plot numbers within a project
);

CREATE INDEX IF NOT EXISTS idx_plot_project_status ON plot(project_id, status);
CREATE INDEX IF NOT EXISTS idx_plot_status ON plot(status);
CREATE INDEX IF NOT EXISTS idx_plot_customer ON plot(customer_id);

CREATE OR REPLACE TRIGGER trg_plot_updated_at
  BEFORE UPDATE ON plot
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
