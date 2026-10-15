import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, jobs, directoryListings, users } from '@/lib/db'
import { sql, eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobsTable } from '@/components/admin/jobs-table'

async function getJobs() {
  const rows = await db
    .select({
      job: jobs,
      company: directoryListings,
      owner: users,
    })
    .from(jobs)
    .leftJoin(directoryListings, eq(directoryListings.id, jobs.companyId))
    .leftJoin(users, eq(users.id, jobs.ownerUserId))
    .orderBy(sql`${jobs.createdAt} desc`)
    .limit(200)

  return rows.map((row) => ({
    ...row.job,
    companyName: row.company?.companyName ?? null,
    ownerEmail: row.owner?.email ?? null,
  }))
}

export default async function AdminJobsPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'jobs.view'))) {
    redirect('/login?callbackUrl=/admin/jobs')
  }

  const rows = await getJobs()
  const pending = rows.filter((j) => !j.published).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">Moderate job postings from member businesses.</p>
        </div>
        {pending > 0 && <Badge variant="gold">{pending} pending</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <JobsTable jobs={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
