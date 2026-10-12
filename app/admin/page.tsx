import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAdminAccess } from '@/lib/admin/access'
export default async function AdminHome() {
  const session = await auth()
  const access = await getAdminAccess(session?.user?.id)
  if (access.isOwnerAdmin) redirect('/admin/dashboard')
  const destinations = [
    ['members.view','/admin/members'],['directory.view','/admin/directory'],
    ['events.view','/admin/events'],['jobs.view','/admin/jobs'],
    ['leads.view','/admin/leads'],['orders.view','/admin/orders'],
  ] as const
  const route = destinations.find(([permission]) => access.permissions.includes(permission))
  if (route) redirect(route[1])
  redirect('/member/dashboard')
}
