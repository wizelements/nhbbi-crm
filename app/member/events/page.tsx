import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isMember } from '@/lib/auth'
import { db, events, eventRegistrations } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export const metadata = {
  title: 'My Events — NHBBJ Member Portal',
  description: 'Events you have registered for.',
}

async function getRegisteredEvents(userId: string) {
  return db
    .select({
      registration: eventRegistrations,
      event: events,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(events.id, eventRegistrations.eventId))
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(desc(events.startAt))
}

export default async function MemberEventsPage() {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    redirect('/login?callbackUrl=/member/events')
  }

  const rows = await getRegisteredEvents(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Events</h1>
        <p className="text-muted-foreground">Events you have registered for through NHBBJ.</p>
      </div>

      {rows.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You haven&apos;t registered for any events yet.</p>
            <Button asChild variant="gold" className="mt-4">
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ event, registration }) => (
          <Card key={registration.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{event.title}</CardTitle>
              <CardDescription>{event.location || 'Location TBA'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{formatDateTime(event.startAt)}</p>
              <div className="flex items-center justify-between">
                <Badge variant={registration.paymentStatus === 'paid' ? 'gold' : 'secondary'}>
                  {registration.paymentStatus}
                </Badge>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/events/${event.slug}`}>Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
