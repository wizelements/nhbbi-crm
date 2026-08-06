import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface ServiceDetailProps {
  title: string
  subtitle: string
  body: string[]
  benefits: string[]
  cta: { label: string; href: string }
}

export function ServiceDetail({ title, subtitle, body, benefits, cta }: ServiceDetailProps) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-navy md:text-4xl">
            {title}
          </h2>
          <p className="text-xl text-gold font-medium">{subtitle}</p>
          {body.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground">{paragraph}</p>
          ))}
          <Button asChild variant="gold" size="lg">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>

        <Card className="h-fit">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-navy">What you gain</h3>
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
