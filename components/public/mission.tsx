import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ABOUT_BLURB, ABOUT_HISTORY, MISSION_STATEMENT } from '@/lib/public/data'

export function Mission() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-navy md:text-4xl">
            Welcome to{' '}
            <span className="text-gold">BBI</span>
          </h2>
          <p className="text-muted-foreground">{ABOUT_BLURB}</p>
          <p className="text-muted-foreground">{ABOUT_HISTORY}</p>
          <Button asChild variant="navy">
            <Link href="/member/register">Join BBI</Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gold p-6 text-navy shadow">
            <ul className="space-y-3 text-sm md:text-base">
              <li>
                <span className="font-semibold">Founded:</span> 2003 as a
                non-profit, service-oriented membership organization.
              </li>
              <li>
                <span className="font-semibold">Services:</span> Certified
                NxLevel™ Entrepreneurial Training, Business Networking Events
                & Consulting.
              </li>
              <li>
                <span className="font-semibold">Mission:</span>{' '}
                {MISSION_STATEMENT}
              </li>
              <li>
                <span className="font-semibold">Membership:</span> 1,500+
                current and aspiring business owners; 100+ member companies.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
