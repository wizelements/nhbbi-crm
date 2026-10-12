import { canDelegate, type NativeAccount, type NativePermission, validAccount } from './permissions'

type DBArg = string | number | null
type MutationResult = { changes?: number }
export type NativeTransaction = {
  query: <T extends Record<string, unknown>>(sql: string, params: DBArg[]) => Promise<T[]>,
  execute: (sql: string, params: DBArg[]) => Promise<MutationResult>,
}
export type NativeDatabase = {
  transaction: <T>(operation: (tx: NativeTransaction) => Promise<T>) => Promise<T>,
  getAccountRole: (numericId: number) => Promise<'member' | 'admin' | null>,
}
export class Denied extends Error { constructor(){super('Administrative authorization required')} }
function requireOwner(actor: NativeAccount | null | undefined): asserts actor is NativeAccount {
  if (!validAccount(actor) || actor.role !== 'admin') throw new Denied()
}
function positiveAccountId(input: number) {
  if (!Number.isSafeInteger(input) || input <= 0) throw new TypeError('Invalid numeric NHBBI account ID')
}
function requireUuid(input: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input))
    throw new TypeError('Invalid role ID')
}
function label(input: string, max: number, min = 0) {
  const trimmed = input.trim()
  if (trimmed.length < min || trimmed.length > max) throw new TypeError('Invalid role details')
  return trimmed
}
/** Atomic role creation + security audit: both succeed or neither does. */
export async function createRole(
  actor: NativeAccount | null | undefined,
  input: {name: string; description: string; permissions: NativePermission[]},
  db: NativeDatabase,
  randomId: () => string = () => crypto.randomUUID(),
) {
  requireOwner(actor)
  if (!canDelegate(input.permissions)) throw new Denied()
  const name = label(input.name, 64, 2), description = label(input.description, 240)
  const roleId = randomId()
  requireUuid(roleId)
  const grants = Array.from(new Set(input.permissions))
  await db.transaction(async tx => {
    await tx.execute(
      'INSERT INTO nhbbi_staff_roles(id,name,description,permissions,created_by) VALUES(?,?,?,?,?)',
      [roleId,name,description,JSON.stringify(grants),actor.id])
    await tx.execute('INSERT INTO nhbbi_access_audit(id,actor_id,event,subject_type,subject_id,detail) VALUES(?,?,?,?,?,?)',
      [randomId(),actor.id,'role.created','role',roleId,JSON.stringify({name,grants})])
  })
  return { id: roleId }
}
/** Assignment is allowed ONLY to an existing member on the LIVE site, never a CRM account. */
export async function assignRole(
  actor: NativeAccount | null | undefined,
  targetId: number,
  roleId: string,
  db: NativeDatabase,
  randomId: () => string = () => crypto.randomUUID(),
) {
  requireOwner(actor); positiveAccountId(targetId); requireUuid(roleId)
  if (actor.id === targetId || (await db.getAccountRole(targetId)) !== 'member') throw new Denied()
  return db.transaction(async tx => {
    const roles = await tx.query<{active: number}>('SELECT active FROM nhbbi_staff_roles WHERE id=?', [roleId])
    if (roles.length !== 1 || roles[0].active !== 1) throw new Denied()
    const changed = await tx.execute(
      'INSERT INTO nhbbi_staff_role_assignments(account_id,role_id,assigned_by) VALUES(?,?,?) ON CONFLICT(account_id,role_id) DO NOTHING',
      [targetId,roleId,actor.id])
    if (changed.changes === 0) return { assigned: false }
    await tx.execute('INSERT INTO nhbbi_access_audit(id,actor_id,event,subject_type,subject_id,detail) VALUES(?,?,?,?,?,?)',
      [randomId(),actor.id,'role.assigned','account',String(targetId),JSON.stringify({roleId})])
    return { assigned: true }
  })
}
export async function revokeRole(
  actor: NativeAccount | null | undefined,
  targetId: number,
  roleId: string,
  db: NativeDatabase,
  randomId: () => string = () => crypto.randomUUID(),
) {
  requireOwner(actor);positiveAccountId(targetId);requireUuid(roleId)
  return db.transaction(async tx=>{
    const changed=await tx.execute(
      'DELETE FROM nhbbi_staff_role_assignments WHERE account_id=? AND role_id=?',
      [targetId,roleId])
    if (changed.changes === 0) return { revoked: false }
    await tx.execute('INSERT INTO nhbbi_access_audit(id,actor_id,event,subject_type,subject_id,detail) VALUES(?,?,?,?,?,?)',
      [randomId(),actor.id,'role.revoked','account',String(targetId),JSON.stringify({roleId})])
    return { revoked: true }
  })
}
export async function disableRole(
  actor: NativeAccount | null | undefined,
  roleId: string,
  db: NativeDatabase,
  randomId: () => string = () => crypto.randomUUID(),
) {
  requireOwner(actor);requireUuid(roleId)
  return db.transaction(async tx=>{
    const changed=await tx.execute('UPDATE nhbbi_staff_roles SET active=0,updated_at=unixepoch() WHERE id=? AND active=1',[roleId])
    if (changed.changes === 0) return { disabled: false }
    await tx.execute('INSERT INTO nhbbi_access_audit(id,actor_id,event,subject_type,subject_id,detail) VALUES(?,?,?,?,?,?)',
      [randomId(),actor.id,'role.disabled','role',roleId,'{}'])
    return { disabled: true }
  })
}
