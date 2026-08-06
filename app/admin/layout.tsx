import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export const metadata: Metadata = {
  title: 'Admin — NHBBJ CRM',
  description: 'NHBBJ admin AI CRM dashboard.',
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
    redirect('/login?callbackUrl=/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar user={session.user} />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
