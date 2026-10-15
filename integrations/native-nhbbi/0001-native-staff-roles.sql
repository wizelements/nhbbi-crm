-- Isolated, additive migration for the currently deployed NHBBI account model.
-- Live accounts use NUMERIC IDs. Do NOT import UUID CRM users or sessions.
-- Add an FK against the correct live-user table only after production schema
-- introspection confirms its exact name. This migration never changes accounts.
CREATE TABLE IF NOT EXISTS nhbbi_staff_roles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(name)) BETWEEN 2 AND 64),
  description TEXT NOT NULL DEFAULT '',
  permissions TEXT NOT NULL CHECK (json_valid(permissions)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_by INTEGER NOT NULL CHECK (created_by > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS nhbbi_staff_roles_unique_name
  ON nhbbi_staff_roles(name COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS nhbbi_staff_role_assignments (
  account_id INTEGER NOT NULL CHECK (account_id > 0),
  role_id TEXT NOT NULL REFERENCES nhbbi_staff_roles(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL CHECK (assigned_by > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (account_id,role_id)
);
CREATE INDEX IF NOT EXISTS nhbbi_staff_assignment_user_idx
  ON nhbbi_staff_role_assignments(account_id);
CREATE TABLE IF NOT EXISTS nhbbi_access_audit (
  id TEXT PRIMARY KEY NOT NULL,
  actor_id INTEGER NOT NULL CHECK (actor_id > 0),
  event TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS nhbbi_access_audit_time_idx ON nhbbi_access_audit(created_at);
