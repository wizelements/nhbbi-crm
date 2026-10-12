import sqlite3
from pathlib import Path
db=sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
db.executescript(Path('integrations/native-nhbbi/0001-native-staff-roles.sql').read_text())
a='47e5a019-4830-41a6-8a0f-413c282ef133'
db.execute("INSERT INTO nhbbi_staff_roles(id,name,permissions,created_by) VALUES(?,?,?,?)",(a,'Events','["events.view"]',1))
db.execute("INSERT INTO nhbbi_staff_role_assignments(account_id,role_id,assigned_by) VALUES(?,?,?)",(22,a,1))
try:
 db.execute("INSERT INTO nhbbi_staff_role_assignments(account_id,role_id,assigned_by) VALUES(?,?,?)",(22,a,1))
 raise AssertionError('duplicate role accepted')
except sqlite3.IntegrityError: pass
try:
 db.execute("INSERT INTO nhbbi_staff_roles(id,name,permissions,created_by) VALUES(?,?,?,?)",('other','EVENTS','[]',1))
 raise AssertionError('duplicate role name accepted')
except sqlite3.IntegrityError: pass
db.execute("DELETE FROM nhbbi_staff_roles WHERE id=?",(a,))
assert db.execute("SELECT count(*) FROM nhbbi_staff_role_assignments").fetchone()[0]==0
print('PASS native numeric-identity role migration uniqueness and cascade')
