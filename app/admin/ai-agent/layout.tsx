import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
export default async function AiAgentLayout({children}:{children:ReactNode}) {
  const session=await auth()
  if (!(await canAdmin(session?.user?.id, 'ai.view'))) redirect('/admin')
  return <>{children}</>
}
