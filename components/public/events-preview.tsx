import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFeaturedEvents, type Event } from '@/lib/public/data'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export async function EventsPreview() {
  const events: Event[] = await getFeaturedEvents()

  return (
    <section className="bg-navy py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Upcoming <span className="text-gold">Events</span>
          </h2>
          <Button asChild variant="gold">
            <Link href="/events">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="bg-white text-navy">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant="gold">
                    {formatCurrency(event.priceCents)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(event.startAt)}
                  {event.endAt && ` - ${formatDateTime(event.endAt)}`}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </p>
                <p className="line-clamp-2 text-sm">{event.description}</p>
                <Button asChild variant="navy" className="mt-2">
                  <Link href={`/events/${event.slug}`}>Register</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
