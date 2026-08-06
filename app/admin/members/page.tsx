import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
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
    ...row.user,
    membership: row.membership,
    profile: row.profile,
  }))
}

export default async function AdminMembersPage() {
  const session = await auth()
  if (!isAdmin(session?.user)) {
    redirect('/login?callbackUrl=/admin/members')
  }

  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Members</h2>
        <p className="text-muted-foreground">Manage member accounts, tiers, and approvals.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Members</CardTitle>
          <Badge variant="navy">{members.length}</Badge>
        </CardHeader>
        <CardContent>
          <MembersTable members={members} />
        </CardContent>
      </Card>
    </div>
  )
}
