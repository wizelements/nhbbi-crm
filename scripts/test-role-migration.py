#!/usr/bin/env python3
"""Test NHBBI access-control SQL without any production database connection."""
from pathlib import Path
import sqlite3

migration = Path("drizzle/0001_staff_roles.sql").read_text(encoding="utf-8")
con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")
con.execute("CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL)")
con.execute("INSERT INTO users(id) VALUES ('owner'), ('member')")
con.executescript(migration)
con.execute("INSERT INTO staff_roles (id, name, permissions, created_by) VALUES ('events', 'Events', '[\"events.view\"]', 'owner')")
con.execute("INSERT INTO staff_role_assignments (id, user_id, role_id, assigned_by) VALUES ('grant', 'member', 'events', 'owner')")
try:
    con.execute("INSERT INTO staff_role_assignments (id, user_id, role_id, assigned_by) VALUES ('duplicate', 'member', 'events', 'owner')")
    raise AssertionError("Duplicate role assignment was accepted")
except sqlite3.IntegrityError:
    pass
con.execute("DELETE FROM staff_role_assignments WHERE id='grant'")
assert con.execute("SELECT count(*) FROM staff_role_assignments").fetchone()[0] == 0
con.execute("INSERT INTO staff_role_assignments (id, user_id, role_id, assigned_by) VALUES ('grant2', 'member', 'events', 'owner')")
con.execute("DELETE FROM users WHERE id='member'")
assert con.execute("SELECT count(*) FROM staff_role_assignments").fetchone()[0] == 0
print("PASS: role tables, uniqueness, revocation, user deletion cascade")
