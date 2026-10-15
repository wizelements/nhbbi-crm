import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, leads, users } from '@/lib/db'
import { sql, eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadsTable } from '@/components/admin/leads-table'

async function getLeads() {
  const rows = await db
    .select({
      lead: leads,
      assignee: users,
    })
    .from(leads)
    .leftJoin(users, eq(users.id, leads.assignedTo))
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(200)

  return rows.map((row) => ({
    ...row.lead,
    assignedEmail: row.assignee?.email ?? null,
  }))
}

export default async function AdminLeadsPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'leads.view'))) {
    redirect('/login?callbackUrl=/admin/leads')
  }

  const rows = await getLeads()
  const newLeads = rows.filter((l) => l.status === 'new').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">Track and manage inbound leads and inquiries.</p>
        </div>
        {newLeads > 0 && <Badge variant="gold">{newLeads} new</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsTable leads={rows} admins={[]} />
        </CardContent>
      </Card>
    </div>
  )
}
