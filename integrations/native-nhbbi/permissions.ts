/**
 * Standalone authorization policy for the ACTIVE NHBBI website.
 *
 * Unlike the CRM's Auth.js/UUID model, the deployed NHBBI site uses a
 * cookie-backed server-side session and numeric account IDs.
 * All callers must obtain NativeAccount from the LIVE site's getCurrentUser()
 * (which must re-read the server-side session). Never derive actor/role from
 * an HTTP body, client session, or the separate CRM user table.
 */
export const NATIVE_PERMISSIONS = {
  'members.view': 'View membership requests',
  'members.review': 'Review membership applications (not payments)',
  'directory.view': 'View submitted businesses',
  'directory.review': 'Approve or reject business listings',
  'events.view': 'View event registrations',
  'events.manage': 'Manage event content and registrations',
  'jobs.view': 'View job opportunities',
  'jobs.manage': 'Moderate job postings',
  'leads.view': 'View contact requests',
  'leads.manage': 'Assign and respond to contact requests',
  'orders.view': 'Review reconciled orders',
  'roles.manage': 'Control staff permissions',
} as const

export type NativePermission = keyof typeof NATIVE_PERMISSIONS;
export const PERMISSIONS = Object.keys(NATIVE_PERMISSIONS) as NativePermission[];
export const OWNER_ONLY: readonly NativePermission[] = ['roles.manage'];
export const DELEGABLE = PERMISSIONS.filter(p => !OWNER_ONLY.includes(p));

export type NativeAccount = { id: number; role: 'member' | 'admin' };
export type NativeAccess = { isOwner: boolean; permissions: NativePermission[] };
export type SQLRow = Record<string, unknown>;
export type ReadClient = {
  query: <T extends SQLRow>(sql: string, args: readonly (number | string)[]) => Promise<T[]>
};
export function validAccount(input: NativeAccount | null | undefined): input is NativeAccount {
  return !!input && Number.isSafeInteger(input.id) && input.id > 0 &&
    (input.role === 'admin' || input.role === 'member');
}
export function parsePermissions(value: unknown): NativePermission[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((v): v is NativePermission =>
      typeof v === 'string' && DELEGABLE.some(p => p === v)))];
  } catch { return []; }
}
export function canDelegate(input: unknown): input is NativePermission[] {
  return Array.isArray(input) && input.length > 0 && input.length <= DELEGABLE.length &&
    input.every(p => typeof p === 'string' && DELEGABLE.some(d => d === p));
}
export async function resolveAccess(
  actor: NativeAccount | null | undefined,
  database: ReadClient,
): Promise<NativeAccess> {
  const denied: NativeAccess = { isOwner: false, permissions: [] };
  if (!validAccount(actor)) return denied;
  if (actor.role === 'admin') return { isOwner: true, permissions: [...PERMISSIONS] };
  try {
    const rows = await database.query<{ permissions: string }>(
      `SELECT r.permissions FROM nhbbi_staff_role_assignments a
       JOIN nhbbi_staff_roles r ON r.id = a.role_id
       WHERE a.account_id = ? AND r.active = 1`, [actor.id]);
    return { isOwner: false, permissions: Array.from(new Set(rows.flatMap(r => parsePermissions(r.permissions)))) };
  } catch {
    // An uninstalled migration or DB error MUST NEVER confer staff rights.
    return denied;
  }
}
export function can(access: NativeAccess, permission: NativePermission): boolean {
  return access.isOwner || access.permissions.includes(permission);
}
