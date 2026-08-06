import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllEvents, type Event } from '@/lib/public/data'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export const metadata = {
  title: 'Events — NHBBJ',
  description: 'Upcoming BBI events, training, and Kingdom Connections gatherings.',
}

export default async function EventsPage() {
  const events: Event[] = await getAllEvents()

  return (
    <PublicShell>
      <PageBanner title="Upcoming Events" subtitle="Trainings, networking, and special gatherings." />

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge variant="gold">{formatCurrency(event.priceCents)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(event.startAt)}
                    {event.endAt && ` - ${formatDateTime(event.endAt)}`}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </p>
                  <p className="text-muted-foreground">{event.description}</p>
                  {event.deadline && (
                    <p className="text-sm font-medium text-navy">
                      Registration deadline: {event.deadline}
                    </p>
                  )}
                </div>
                <Button asChild variant="navy" className="self-start">
                  <Link href={`/events/${event.slug}`}>
                    Register <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
