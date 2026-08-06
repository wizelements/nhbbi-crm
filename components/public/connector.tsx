import Link from 'next/link'
import { Briefcase, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Connector() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-navy md:text-4xl">
            BBI Connector{' '}
            <span className="text-gold">Service</span>
          </h2>
          <p className="text-lg font-semibold">BBI CHAMPS Now Hiring</p>
          <p className="text-muted-foreground">
            Are you or someone you know looking for new job opportunities? View
            a listing of job openings posted by BBI Champion businesses. This
            BBI Connector service is a free service for our community.
          </p>
          <Button asChild variant="navy">
            <Link href="/jobs">
              BBI Connector <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-stone-100 p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy">
              <Briefcase className="h-10 w-10" />
            </div>
            <p className="text-muted-foreground">
              Connect with employers and talent across the BBI network.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
