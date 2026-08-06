import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'

const CURRENT_YEAR = 2026

export const metadata = {
  title: 'Privacy Policy — NHBBJ',
  description: 'Privacy policy for the Bronner Business Institute website.',
}

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PageBanner title="Privacy Policy" />
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <p>Last updated: {CURRENT_YEAR}.</p>
          <p>
            The Bronner Business Institute respects your privacy. This policy
            describes how we collect, use, and protect your personal information
            when you use our website and services.
          </p>
          <h2 className="text-xl font-semibold text-navy">Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name,
            email, phone number, and business details when you register,
            contact us, or make a payment.
          </p>
          <h2 className="text-xl font-semibold text-navy">How We Use Your Information</h2>
          <p>
            We use your information to provide membership services, process
            payments, communicate with you, and improve our programs.
          </p>
          <h2 className="text-xl font-semibold text-navy">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at info@nhbbi.org.
          </p>
        </div>
      </section>
    </PublicShell>
  )
}
