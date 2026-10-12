import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canMember } from '@/lib/admin/access'
import { MemberShell } from '@/components/member/member-shell'

export const metadata = {
  title: 'Member Portal — NHBBJ',
  description: 'Manage your NHBBJ membership, profile, directory listing, jobs, and events.',
}

export default async function MemberLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id || !(await canMember(session.user.id))) {
    redirect('/login?callbackUrl=/member/dashboard')
  }

  return <MemberShell user={session.user}>{children}</MemberShell>
}
