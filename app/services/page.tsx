import Link from 'next/link'
import { GraduationCap, Users, Network, ArrowRight } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Services — NHBBJ',
  description: 'Training, consulting, and networking services from Bronner Business Institute.',
}

const services = [
  {
    icon: GraduationCap,
    title: 'BBI Training',
    description:
      'Certified NxLevel™ Entrepreneurship curriculum for aspiring, advanced, and youth entrepreneurs.',
    href: '/services/training',
  },
  {
    icon: Users,
    title: 'BBI Consulting',
    description:
      'One-on-one counseling, tactical referrals, and SBA Community Express Loan Program support.',
    href: '/services/consulting',
  },
  {
    icon: Network,
    title: 'BBI Networking',
    description:
      'Power Networking events and Kingdom Connections to expand your circle of influence.',
    href: '/services/networking',
  },
]

export default function ServicesPage() {
  return (
    <PublicShell>
      <PageBanner
        title="Services of BBI"
        subtitle="Training, consulting, and networking to help you establish and expand your business."
      />

      <section className="container mx-auto px-4 py-16">
        <p className="mx-auto mb-12 max-w-3xl text-center text-muted-foreground">
          The Bronner Business Institute focuses on developing and delivering
          outstanding programs to help aspiring and current business owners
          establish and expand exemplary businesses.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy">
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild variant="navy">
                  <Link href={service.href}>
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
