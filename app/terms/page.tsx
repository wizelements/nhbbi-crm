import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'

const CURRENT_YEAR = 2026

export const metadata = {
  title: 'Terms & Conditions — NHBBJ',
  description: 'Terms and conditions for the Bronner Business Institute website.',
}

export default function TermsPage() {
  return (
    <PublicShell>
      <PageBanner title="Terms & Conditions" />
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <p>Last updated: {CURRENT_YEAR}.</p>
          <p>
            By accessing and using the Bronner Business Institute website, you
            accept and agree to be bound by the terms and conditions of this
            agreement.
          </p>
          <h2 className="text-xl font-semibold text-navy">Use of Site</h2>
          <p>
            You agree to use the site only for lawful purposes and in a way that
            does not infringe the rights of, restrict, or inhibit anyone else’s
            use and enjoyment of the site.
          </p>
          <h2 className="text-xl font-semibold text-navy">Membership & Payments</h2>
          <p>
            Membership fees and event payments are processed securely. Refunds
            are handled according to the specific program or event policy.
          </p>
          <h2 className="text-xl font-semibold text-navy">Contact Us</h2>
          <p>
            Questions about these terms may be directed to info@nhbbi.org.
          </p>
        </div>
      </section>
    </PublicShell>
  )
}
