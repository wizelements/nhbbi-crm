import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAdminAccess } from '@/lib/admin/access'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export const metadata: Metadata = {
  title: 'Admin — NHBBI CRM',
  description: 'NHBBI admin AI CRM dashboard.',
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  const access = await getAdminAccess(session?.user?.id)
  if (!session || access.permissions.length === 0) {
    redirect('/login?callbackUrl=/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar user={session.user} permissions={access.permissions} />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
