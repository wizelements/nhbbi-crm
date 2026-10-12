import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin, getAdminAccess } from '@/lib/admin/access'
import { db, users, memberships, memberProfiles } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MembersTable } from '@/components/admin/members-table'

async function getMembers() {
  const rows = await db
    .select({
      user: users,
      membership: memberships,
      profile: memberProfiles,
    })
    .from(users)
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(eq(users.role, 'member'))
    .orderBy(sql`${users.createdAt} desc`)
    .limit(200)

  return rows.map((row) => ({
    id: row.user.id,
    email: row.user.email,
    role: row.user.role,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    createdAt: row.user.createdAt,
    membership: row.membership,
    profile: row.profile,
  }))
}

export default async function AdminMembersPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'members.view'))) {
    redirect('/login?callbackUrl=/admin/members')
  }

  const members = await getMembers()
  const permissions = (await getAdminAccess(session?.user?.id)).permissions

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Members</h2>
        <p className="text-muted-foreground">Review memberships and approve business profiles. Billing changes are controlled through Square.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Members</CardTitle>
          <Badge variant="navy">{members.length}</Badge>
        </CardHeader>
        <CardContent>
          <MembersTable members={members} canManage={permissions.includes('members.manage')} />
        </CardContent>
      </Card>
    </div>
  )
}
