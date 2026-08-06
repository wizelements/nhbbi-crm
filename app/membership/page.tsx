import Link from 'next/link'
import { Check } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MEMBERSHIP_TIERS, type MembershipTier } from '@/lib/public/data'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Membership — NHBBJ',
  description: 'Join the Bronner Business Institute. Compare Associate, Bronze, Silver, and Gold membership tiers.',
}

function TierCard({ tier }: { tier: MembershipTier }) {
  return (
    <Card
      className={`flex flex-col ${
        tier.highlighted ? 'ring-2 ring-gold shadow-xl' : ''
      }`}
    >
      <CardHeader className={`${tier.highlighted ? 'bg-gold text-navy' : 'bg-navy text-white'}`}>
        <CardTitle className="text-center text-2xl">{tier.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <p className="mb-4 text-center italic text-muted-foreground">{tier.description}</p>
        <div className="mb-4 text-center">
          <span className="text-5xl font-bold text-gold">{formatCurrency(tier.priceCents)}</span>
          <p className="text-sm text-muted-foreground">per year</p>
        </div>
        <hr className="mb-4" />
        <ul className="mb-6 flex-1 space-y-2">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild variant={tier.highlighted ? 'gold' : 'navy'} className="w-full">
          <Link href={tier.cta.href}>{tier.cta.label}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function MembershipPage() {
  return (
    <PublicShell>
      <PageBanner title="BBI Members" subtitle="Choose the membership level that fits your business season." />

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-navy">
            Membership <span className="text-gold">In BBI</span>
          </h2>
          <p className="text-muted-foreground">
            The Bronner Business Institute wants like-minded individuals to join
            us in our mission to transform lives by discipling business champions.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
