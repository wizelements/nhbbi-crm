import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, directoryListings, users } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DirectoryTable } from '@/components/admin/directory-table'

async function getListings() {
  const rows = await db
    .select({
      listing: directoryListings,
      owner: users,
    })
    .from(directoryListings)
    .leftJoin(users, eq(users.id, directoryListings.ownerUserId))
    .orderBy(sql`${directoryListings.createdAt} desc`)
    .limit(200)

  return rows.map((row) => ({
    ...row.listing,
    ownerEmail: row.owner?.email ?? null,
  }))
}

export default async function AdminDirectoryPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'directory.view'))) {
    redirect('/login?callbackUrl=/admin/directory')
  }

  const listings = await getListings()
  const pending = listings.filter((l) => !l.approved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Directory</h2>
          <p className="text-muted-foreground">Approve and feature member business listings.</p>
        </div>
        {pending > 0 && <Badge variant="gold">{pending} pending</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <DirectoryTable listings={listings} />
        </CardContent>
      </Card>
    </div>
  )
}
