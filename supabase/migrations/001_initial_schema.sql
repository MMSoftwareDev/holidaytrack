-- ============================================================================
-- HolidayTrack: Initial Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

CREATE TYPE employee_role AS ENUM ('employee', 'manager', 'admin', 'super_admin');
CREATE TYPE contract_type AS ENUM ('full_time', 'part_time', 'zero_hours');
CREATE TYPE holiday_unit AS ENUM ('days', 'hours');
CREATE TYPE leave_type AS ENUM ('ordinary', 'additional');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'declined', 'cancelled');
CREATE TYPE approval_action_type AS ENUM ('approved', 'declined');
CREATE TYPE bank_holiday_region AS ENUM ('england_wales', 'scotland', 'northern_ireland');

-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- Returns the org_id for the currently authenticated user.
-- Used by all RLS policies for multi-tenant isolation.
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM employees WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================================
-- 3. TABLES (in FK dependency order)
-- ============================================================================

-- 3.1 Organisations — multi-tenant root entity
CREATE TABLE organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  holiday_year_start_month int NOT NULL DEFAULT 1 CHECK (holiday_year_start_month BETWEEN 1 AND 12),
  holiday_year_start_day int NOT NULL DEFAULT 1 CHECK (holiday_year_start_day BETWEEN 1 AND 31),
  default_holiday_unit holiday_unit NOT NULL DEFAULT 'days',
  bank_holiday_region bank_holiday_region NOT NULL DEFAULT 'england_wales',
  carry_forward_cap numeric NOT NULL DEFAULT 5,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Employees — user accounts linked to Supabase auth.users
CREATE TABLE employees (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  role employee_role NOT NULL DEFAULT 'employee',
  contract_type contract_type NOT NULL DEFAULT 'full_time',
  holiday_unit holiday_unit NOT NULL DEFAULT 'days',
  days_per_week numeric NOT NULL DEFAULT 5 CHECK (days_per_week BETWEEN 0 AND 7),
  hours_per_week numeric NOT NULL DEFAULT 37.5 CHECK (hours_per_week >= 0),
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_org_id ON employees(org_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_is_active ON employees(org_id, is_active);

-- 3.3 Manager assignments — many-to-many manager↔employee
CREATE TABLE manager_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (manager_id, employee_id)
);

CREATE INDEX idx_manager_assignments_employee ON manager_assignments(employee_id);
CREATE INDEX idx_manager_assignments_manager ON manager_assignments(manager_id);

-- 3.4 Entitlements — per employee per holiday year
CREATE TABLE entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  year_start date NOT NULL,
  year_end date NOT NULL,
  total_ordinary numeric NOT NULL DEFAULT 28,
  total_additional numeric NOT NULL DEFAULT 0,
  used_ordinary numeric NOT NULL DEFAULT 0,
  used_additional numeric NOT NULL DEFAULT 0,
  pending_ordinary numeric NOT NULL DEFAULT 0,
  pending_additional numeric NOT NULL DEFAULT 0,
  carried_forward numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, year_start)
);

CREATE INDEX idx_entitlements_employee ON entitlements(employee_id);
CREATE INDEX idx_entitlements_org ON entitlements(org_id);

-- 3.5 Holiday requests
CREATE TABLE holiday_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  holiday_unit holiday_unit NOT NULL,
  leave_type leave_type NOT NULL DEFAULT 'ordinary',
  status request_status NOT NULL DEFAULT 'pending',
  employee_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_holiday_requests_employee ON holiday_requests(employee_id);
CREATE INDEX idx_holiday_requests_org ON holiday_requests(org_id);
CREATE INDEX idx_holiday_requests_status ON holiday_requests(org_id, status);

-- 3.6 Approval actions
CREATE TABLE approval_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES holiday_requests(id) ON DELETE CASCADE,
  actioned_by uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  action approval_action_type NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_actions_request ON approval_actions(request_id);

-- 3.7 Bank holidays — shared reference data (no org scope)
CREATE TABLE bank_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  name text NOT NULL,
  region bank_holiday_region NOT NULL,
  UNIQUE (date, region)
);

CREATE INDEX idx_bank_holidays_region ON bank_holidays(region);
CREATE INDEX idx_bank_holidays_date ON bank_holidays(date);

-- 3.8 Holiday pay config
CREATE TABLE holiday_pay_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  include_overtime boolean NOT NULL DEFAULT false,
  include_commission boolean NOT NULL DEFAULT false,
  include_regular_bonuses boolean NOT NULL DEFAULT false,
  reference_period_weeks int NOT NULL DEFAULT 52,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_holiday_pay_config_employee ON holiday_pay_config(employee_id);

-- 3.9 Payments in lieu
CREATE TABLE payments_in_lieu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  untaken_days numeric NOT NULL CHECK (untaken_days >= 0),
  gross_amount numeric NOT NULL CHECK (gross_amount >= 0),
  date date NOT NULL,
  reason text,
  authorised_by uuid NOT NULL REFERENCES employees(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_in_lieu_employee ON payments_in_lieu(employee_id);
CREATE INDEX idx_payments_in_lieu_org ON payments_in_lieu(org_id);

-- 3.10 Audit log — IMMUTABLE append-only (INSERT only, NO UPDATE/DELETE ever)
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organisations(id),
  user_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before_value jsonb,
  after_value jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- 3.11 Email log
CREATE TABLE email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organisations(id),
  to_email text NOT NULL,
  subject text NOT NULL,
  template text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_log_org ON email_log(org_id);

-- 3.12 Invitations
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role employee_role NOT NULL DEFAULT 'employee',
  invited_by uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_org ON invitations(org_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- ============================================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables with an updated_at column
CREATE TRIGGER trg_organisations_updated_at BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_entitlements_updated_at BEFORE UPDATE ON entitlements FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_holiday_requests_updated_at BEFORE UPDATE ON holiday_requests FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_holiday_pay_config_updated_at BEFORE UPDATE ON holiday_pay_config FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_pay_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_in_lieu ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Helper: get the current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS employee_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM employees WHERE id = auth.uid() LIMIT 1;
$$;

-- 6.1 Organisations
CREATE POLICY "Users can view own org"
  ON organisations FOR SELECT
  USING (id = get_current_org_id());

CREATE POLICY "Admins can update own org"
  ON organisations FOR UPDATE
  USING (id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.2 Employees
CREATE POLICY "Users can view employees in own org"
  ON employees FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.3 Manager assignments
CREATE POLICY "Users can view manager assignments in own org"
  ON manager_assignments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = manager_assignments.manager_id AND employees.org_id = get_current_org_id())
  );

CREATE POLICY "Admins can insert manager assignments"
  ON manager_assignments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = manager_assignments.manager_id AND employees.org_id = get_current_org_id())
    AND get_current_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete manager assignments"
  ON manager_assignments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = manager_assignments.manager_id AND employees.org_id = get_current_org_id())
    AND get_current_user_role() IN ('admin', 'super_admin')
  );

-- 6.4 Entitlements
CREATE POLICY "Employees can view own entitlements"
  ON entitlements FOR SELECT
  USING (
    org_id = get_current_org_id()
    AND (
      employee_id = auth.uid()
      OR get_current_user_role() IN ('admin', 'super_admin')
      OR EXISTS (
        SELECT 1 FROM manager_assignments
        WHERE manager_assignments.manager_id = auth.uid()
        AND manager_assignments.employee_id = entitlements.employee_id
      )
    )
  );

CREATE POLICY "Admins can insert entitlements"
  ON entitlements FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update entitlements"
  ON entitlements FOR UPDATE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.5 Holiday requests
CREATE POLICY "Users can view relevant holiday requests"
  ON holiday_requests FOR SELECT
  USING (
    org_id = get_current_org_id()
    AND (
      employee_id = auth.uid()
      OR get_current_user_role() IN ('admin', 'super_admin')
      OR EXISTS (
        SELECT 1 FROM manager_assignments
        WHERE manager_assignments.manager_id = auth.uid()
        AND manager_assignments.employee_id = holiday_requests.employee_id
      )
    )
  );

CREATE POLICY "Employees can create own requests"
  ON holiday_requests FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id()
    AND employee_id = auth.uid()
  );

CREATE POLICY "Users can update own or admin can update any"
  ON holiday_requests FOR UPDATE
  USING (
    org_id = get_current_org_id()
    AND (
      employee_id = auth.uid()
      OR get_current_user_role() IN ('admin', 'super_admin', 'manager')
    )
  );

-- 6.6 Approval actions
CREATE POLICY "Users can view approval actions in own org"
  ON approval_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM holiday_requests
      WHERE holiday_requests.id = approval_actions.request_id
      AND holiday_requests.org_id = get_current_org_id()
    )
  );

CREATE POLICY "Managers and admins can create approval actions"
  ON approval_actions FOR INSERT
  WITH CHECK (
    actioned_by = auth.uid()
    AND get_current_user_role() IN ('manager', 'admin', 'super_admin')
    AND EXISTS (
      SELECT 1 FROM holiday_requests
      WHERE holiday_requests.id = approval_actions.request_id
      AND holiday_requests.org_id = get_current_org_id()
    )
  );

-- 6.7 Bank holidays — public read
CREATE POLICY "Anyone can view bank holidays"
  ON bank_holidays FOR SELECT
  USING (true);

-- 6.8 Holiday pay config
CREATE POLICY "Admins can view holiday pay config"
  ON holiday_pay_config FOR SELECT
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert holiday pay config"
  ON holiday_pay_config FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update holiday pay config"
  ON holiday_pay_config FOR UPDATE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete holiday pay config"
  ON holiday_pay_config FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.9 Payments in lieu
CREATE POLICY "Admins can view payments in lieu"
  ON payments_in_lieu FOR SELECT
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert payments in lieu"
  ON payments_in_lieu FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.10 Audit log — SELECT only for admins, INSERT via service role / triggers
-- NO UPDATE OR DELETE POLICIES — EVER
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.11 Email log
CREATE POLICY "Admins can view email log"
  ON email_log FOR SELECT
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

-- 6.12 Invitations
CREATE POLICY "Admins can view invitations"
  ON invitations FOR SELECT
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete invitations"
  ON invitations FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone can view invitation by token"
  ON invitations FOR SELECT
  USING (token IS NOT NULL AND expires_at > now() AND accepted_at IS NULL);

-- ============================================================================
-- 7. AUDIT LOG TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_entity_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_action text;
BEGIN
  -- Determine action
  v_action := lower(TG_OP);

  -- Determine entity_id and org_id based on operation
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_org_id := OLD.org_id;
    v_before := to_jsonb(OLD);
    v_after := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_entity_id := NEW.id;
    v_org_id := NEW.org_id;
    v_before := NULL;
    v_after := to_jsonb(NEW);
  ELSE -- UPDATE
    v_entity_id := NEW.id;
    v_org_id := NEW.org_id;
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_log (org_id, user_id, entity_type, entity_id, action, before_value, after_value)
  VALUES (v_org_id, auth.uid(), TG_TABLE_NAME, v_entity_id, v_action, v_before, v_after);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers
CREATE TRIGGER trg_audit_holiday_requests
  AFTER INSERT OR UPDATE OR DELETE ON holiday_requests
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_entitlements
  AFTER INSERT OR UPDATE OR DELETE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================================
-- 8. SEED DATA: UK BANK HOLIDAYS 2026–2028
-- ============================================================================

-- ---- 2026 ----

-- England & Wales 2026
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2026-01-01', 'New Year''s Day', 'england_wales'),
  ('2026-04-03', 'Good Friday', 'england_wales'),
  ('2026-04-06', 'Easter Monday', 'england_wales'),
  ('2026-05-04', 'Early May bank holiday', 'england_wales'),
  ('2026-05-25', 'Spring bank holiday', 'england_wales'),
  ('2026-08-31', 'Summer bank holiday', 'england_wales'),
  ('2026-12-25', 'Christmas Day', 'england_wales'),
  ('2026-12-28', 'Boxing Day (substitute)', 'england_wales');

-- Scotland 2026
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2026-01-01', 'New Year''s Day', 'scotland'),
  ('2026-01-02', '2nd January', 'scotland'),
  ('2026-04-03', 'Good Friday', 'scotland'),
  ('2026-05-04', 'Early May bank holiday', 'scotland'),
  ('2026-05-25', 'Spring bank holiday', 'scotland'),
  ('2026-08-03', 'Summer bank holiday', 'scotland'),
  ('2026-11-30', 'St Andrew''s Day', 'scotland'),
  ('2026-12-25', 'Christmas Day', 'scotland'),
  ('2026-12-28', 'Boxing Day (substitute)', 'scotland');

-- Northern Ireland 2026
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2026-01-01', 'New Year''s Day', 'northern_ireland'),
  ('2026-03-17', 'St Patrick''s Day', 'northern_ireland'),
  ('2026-04-03', 'Good Friday', 'northern_ireland'),
  ('2026-04-06', 'Easter Monday', 'northern_ireland'),
  ('2026-05-04', 'Early May bank holiday', 'northern_ireland'),
  ('2026-05-25', 'Spring bank holiday', 'northern_ireland'),
  ('2026-07-13', 'Battle of the Boyne (substitute)', 'northern_ireland'),
  ('2026-08-31', 'Summer bank holiday', 'northern_ireland'),
  ('2026-12-25', 'Christmas Day', 'northern_ireland'),
  ('2026-12-28', 'Boxing Day (substitute)', 'northern_ireland');

-- ---- 2027 ----

-- England & Wales 2027
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2027-01-01', 'New Year''s Day', 'england_wales'),
  ('2027-03-26', 'Good Friday', 'england_wales'),
  ('2027-03-29', 'Easter Monday', 'england_wales'),
  ('2027-05-03', 'Early May bank holiday', 'england_wales'),
  ('2027-05-31', 'Spring bank holiday', 'england_wales'),
  ('2027-08-30', 'Summer bank holiday', 'england_wales'),
  ('2027-12-27', 'Christmas Day (substitute)', 'england_wales'),
  ('2027-12-28', 'Boxing Day (substitute)', 'england_wales');

-- Scotland 2027
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2027-01-01', 'New Year''s Day', 'scotland'),
  ('2027-01-04', '2nd January (substitute)', 'scotland'),
  ('2027-03-26', 'Good Friday', 'scotland'),
  ('2027-05-03', 'Early May bank holiday', 'scotland'),
  ('2027-05-31', 'Spring bank holiday', 'scotland'),
  ('2027-08-02', 'Summer bank holiday', 'scotland'),
  ('2027-11-30', 'St Andrew''s Day', 'scotland'),
  ('2027-12-27', 'Christmas Day (substitute)', 'scotland'),
  ('2027-12-28', 'Boxing Day (substitute)', 'scotland');

-- Northern Ireland 2027
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2027-01-01', 'New Year''s Day', 'northern_ireland'),
  ('2027-03-17', 'St Patrick''s Day', 'northern_ireland'),
  ('2027-03-26', 'Good Friday', 'northern_ireland'),
  ('2027-03-29', 'Easter Monday', 'northern_ireland'),
  ('2027-05-03', 'Early May bank holiday', 'northern_ireland'),
  ('2027-05-31', 'Spring bank holiday', 'northern_ireland'),
  ('2027-07-12', 'Battle of the Boyne', 'northern_ireland'),
  ('2027-08-30', 'Summer bank holiday', 'northern_ireland'),
  ('2027-12-27', 'Christmas Day (substitute)', 'northern_ireland'),
  ('2027-12-28', 'Boxing Day (substitute)', 'northern_ireland');

-- ---- 2028 ----

-- England & Wales 2028
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2028-01-03', 'New Year''s Day (substitute)', 'england_wales'),
  ('2028-04-14', 'Good Friday', 'england_wales'),
  ('2028-04-17', 'Easter Monday', 'england_wales'),
  ('2028-05-01', 'Early May bank holiday', 'england_wales'),
  ('2028-05-29', 'Spring bank holiday', 'england_wales'),
  ('2028-08-28', 'Summer bank holiday', 'england_wales'),
  ('2028-12-25', 'Christmas Day', 'england_wales'),
  ('2028-12-26', 'Boxing Day', 'england_wales');

-- Scotland 2028
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2028-01-03', 'New Year''s Day (substitute)', 'scotland'),
  ('2028-01-04', '2nd January (substitute)', 'scotland'),
  ('2028-04-14', 'Good Friday', 'scotland'),
  ('2028-05-01', 'Early May bank holiday', 'scotland'),
  ('2028-05-29', 'Spring bank holiday', 'scotland'),
  ('2028-08-07', 'Summer bank holiday', 'scotland'),
  ('2028-11-30', 'St Andrew''s Day', 'scotland'),
  ('2028-12-25', 'Christmas Day', 'scotland'),
  ('2028-12-26', 'Boxing Day', 'scotland');

-- Northern Ireland 2028
INSERT INTO bank_holidays (date, name, region) VALUES
  ('2028-01-03', 'New Year''s Day (substitute)', 'northern_ireland'),
  ('2028-03-17', 'St Patrick''s Day', 'northern_ireland'),
  ('2028-04-14', 'Good Friday', 'northern_ireland'),
  ('2028-04-17', 'Easter Monday', 'northern_ireland'),
  ('2028-05-01', 'Early May bank holiday', 'northern_ireland'),
  ('2028-05-29', 'Spring bank holiday', 'northern_ireland'),
  ('2028-07-12', 'Battle of the Boyne', 'northern_ireland'),
  ('2028-08-28', 'Summer bank holiday', 'northern_ireland'),
  ('2028-12-25', 'Christmas Day', 'northern_ireland'),
  ('2028-12-26', 'Boxing Day', 'northern_ireland');

-- ============================================================================
-- DONE. Verify:
--   1. Table Editor → 12 tables visible
--   2. Database → Functions → get_current_org_id, get_current_user_role, fn_audit_log, fn_update_updated_at
--   3. Authentication → Policies → RLS enabled on all tables
--   4. Run: SELECT count(*) FROM bank_holidays;  → should return 83
-- ============================================================================
