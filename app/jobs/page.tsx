import Link from 'next/link'
import { MapPin, Mail, Calendar, ArrowRight } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getJobs, type Job } from '@/lib/public/data'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'BBI Connector Job Board — NHBBJ',
  description: 'Job openings posted by BBI Champion businesses.',
}

export default async function JobsPage() {
  const jobs: Job[] = await getJobs()

  return (
    <PublicShell>
      <PageBanner title="BBI Connector" subtitle="Job openings from BBI Champion businesses." />

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy">Now Hiring</h2>
            <p className="text-muted-foreground">
              A free service connecting BBI members with opportunity.
            </p>
          </div>
          <Button asChild variant="gold">
            <Link href="/member/jobs/manage">
              Post a Job <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <Badge variant="navy">{job.companyName}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location || 'Location not specified'}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Posted {formatDate(job.postedAt)}
                </p>
                <p className="text-muted-foreground">{job.description}</p>
                <a
                  href={`mailto:${job.contactEmail}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
                >
                  <Mail className="h-4 w-4" /> Apply via email
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
