import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { canMember } from '@/lib/admin/access'
import { getAdminAccess } from '@/lib/admin/access'
import { db, users, memberships, memberProfiles, directoryListings, jobs, events, eventRegistrations } from '@/lib/db'
import { eq, sql, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import {
  CalendarDays,
  Building2,
  Briefcase,
  Crown,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard — NHBBI Member Portal',
  description: 'Overview of your membership, events, directory listing, and job postings.',
}

async function getDashboardData(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(desc(memberships.createdAt))
    .limit(1)

  const [profile] = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1)

  const listings = await db
    .select()
    .from(directoryListings)
    .where(eq(directoryListings.ownerUserId, userId))
    .orderBy(desc(directoryListings.createdAt))
    .limit(5)

  const myJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.ownerUserId, userId))
    .orderBy(desc(jobs.createdAt))
    .limit(5)

  const registeredEvents = await db
    .select({
      registration: eventRegistrations,
      event: events,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(events.id, eventRegistrations.eventId))
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(desc(events.startAt))
    .limit(10)

  return {
    user,
    membership,
    profile,
    listings,
    jobs: myJobs,
    registeredEvents,
  }
}

export default async function MemberDashboardPage() {
  const session = await auth()
  if (!session?.user?.id || !(await canMember(session.user.id))) {
    redirect('/login?callbackUrl=/member/dashboard')
  }

  const data = await getDashboardData(session.user.id)
  const staff = await getAdminAccess(session.user.id)

  const membershipStatus = data.membership?.status ?? 'none'
  const membershipTier = data.membership?.tier ?? 'none'
  const isExpired = data.membership?.expiresAt ? new Date(data.membership.expiresAt) < new Date() : false

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">
          Welcome back, {data.user.firstName || data.user.email.split('@')[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s everything happening with your membership right now.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="next-steps-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 id="next-steps-heading" className="text-lg font-semibold text-navy">Your next step</h2>
            <p className="text-sm text-slate-600">Keep your membership and business presence current.</p></div>
          {staff.permissions.length>0&&<Button asChild variant="outline" size="sm"><Link href="/admin">Open staff workspace <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/member/profile" className="rounded-xl border p-4 transition hover:border-gold">
            <p className="font-semibold text-navy">{data.profile?.companyName?'Review your profile':'Complete your profile'}</p>
            <p className="mt-1 text-sm text-slate-600">Keep your contact and company details accurate.</p>
          </Link>
          <Link href="/member/directory" className="rounded-xl border p-4 transition hover:border-gold">
            <p className="font-semibold text-navy">{data.listings.length?'Manage your listing':'Add your business'}</p>
            <p className="mt-1 text-sm text-slate-600">{data.listings.length?(data.listings[0].approved?'Your public listing is live.':'Your listing is awaiting review.'):'Create a listing for the business directory.'}</p>
          </Link>
          <Link href="/events" className="rounded-xl border p-4 transition hover:border-gold">
            <p className="font-semibold text-navy">Explore upcoming events</p>
            <p className="mt-1 text-sm text-slate-600">Find training, networking, and opportunities.</p>
          </Link>
        </div>
      </section>

      {/* Membership status */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Membership Status</CardTitle>
              <CardDescription>Your current plan and renewal</CardDescription>
            </div>
            <Crown className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={membershipStatus === 'active' ? 'gold' : 'secondary'}>
                {membershipStatus}
              </Badge>
              {membershipTier && (
                <Badge variant="navy" className="capitalize">
                  {membershipTier}
                </Badge>
              )}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">
                  {data.membership ? formatCurrency(data.membership.priceCents) : '—'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Started: </span>
                <span className="font-medium">
                  {data.membership?.startsAt ? formatDate(data.membership.startsAt) : '—'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Expires: </span>
                <span className="font-medium">
                  {data.membership?.expiresAt ? formatDate(data.membership.expiresAt) : '—'}
                </span>
              </p>
            </div>
            {isExpired && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Your membership has expired. Renew to keep full access.
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="gold" size="sm">
                <Link href="/membership">
                  Manage Membership
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Directory Listing</CardTitle>
              <CardDescription>Public business profile</CardDescription>
            </div>
            <Building2 className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            {data.listings.length > 0 ? (
              <div className="space-y-3">
                {data.listings.slice(0, 2).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{listing.companyName}</p>
                      <p className="text-xs text-muted-foreground">{listing.category}</p>
                    </div>
                    <Badge variant={listing.approved ? 'gold' : 'secondary'}>
                      {listing.approved ? 'Live' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No directory listing yet.</p>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/member/directory">
                  {data.listings.length > 0 ? 'Edit Listing' : 'Create Listing'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Job Postings</CardTitle>
              <CardDescription>Open positions you posted</CardDescription>
            </div>
            <Briefcase className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy">{data.jobs.length}</p>
            <p className="text-sm text-muted-foreground">
              {data.jobs.filter((j) => j.published).length} published
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/member/jobs">Manage Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Registered events */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">My Registered Events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/member/events">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {data.registeredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.registeredEvents.map(({ event, registration }) => (
              <Card key={registration.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription>
                    {event.location || 'Location TBA'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {formatDateTime(event.startAt)}
                  </div>
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
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                You haven&apos;t registered for any events yet.
              </p>
              <Button asChild variant="gold" className="mt-4">
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
