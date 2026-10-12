import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, events } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventsManager } from '@/components/admin/events-manager'

async function getEvents() {
  return db.select().from(events).orderBy(sql`${events.startAt} desc`).limit(200)
}

export default async function AdminEventsPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'events.view'))) {
    redirect('/login?callbackUrl=/admin/events')
  }

  const rows = await getEvents()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Events</h2>
        <p className="text-muted-foreground">Create, edit, and publish NHBBJ events.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Manager</CardTitle>
          <Badge variant="navy">{rows.length} events</Badge>
        </CardHeader>
        <CardContent>
          <EventsManager events={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
