import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAdminAccess } from '@/lib/admin/access'
import { RoleManager } from '@/components/admin/role-manager'
export const metadata = { title: 'People & Roles — NHBBI' }
export default async function RolesPage() {
  const session = await auth()
  if (!(await getAdminAccess(session?.user?.id)).isOwnerAdmin) redirect('/admin')
  return <main className="mx-auto max-w-6xl space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Access governance</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">People & Roles</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Create staff roles, grant only the access each person needs, and revoke privileges when responsibilities change.</p></div>
    <RoleManager />
  </main>
}
