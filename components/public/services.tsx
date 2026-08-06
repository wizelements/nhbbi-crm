import Link from 'next/link'
import { GraduationCap, Users, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const services = [
  {
    icon: GraduationCap,
    title: 'BBI Training',
    description:
      'Certified training body for the NxLevel™ Entrepreneurship curriculum — practical, hands-on learning for business development.',
    href: '/services/training',
  },
  {
    icon: Users,
    title: 'BBI Consulting',
    description:
      'One-on-one sessions and an empowered tactical referral system to address select business topics and access capital.',
    href: '/services/consulting',
  },
  {
    icon: Network,
    title: 'BBI Networking',
    description:
      'Power Networking events and Kingdom Connections — designed to help entrepreneurs meet, greet, and develop leads.',
    href: '/services/networking',
  },
]

export function Services() {
  return (
    <section className="bg-stone-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-navy md:text-4xl">
          Our{' '}
          <span className="text-gold">Services</span>
        </h2>

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
                <Button asChild variant="gold">
                  <Link href={service.href}>Read more…</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
