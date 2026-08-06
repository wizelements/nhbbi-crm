import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { ServiceDetail } from '@/components/public/service-detail'
import { SERVICE_CONSULTING } from '@/lib/public/data'

export const metadata = {
  title: 'Consulting — NHBBJ',
  description: 'One-on-one business consulting and empowered referrals from BBI.',
}

export default function ConsultingPage() {
  return (
    <PublicShell>
      <PageBanner title="BBI Consulting" subtitle="One-on-one sessions and empowered referrals" />
      <ServiceDetail
        title={SERVICE_CONSULTING.title}
        subtitle={SERVICE_CONSULTING.subtitle}
        body={SERVICE_CONSULTING.body}
        cta={SERVICE_CONSULTING.cta}
        benefits={[
          'One-on-one business counseling',
          'Tactical referral network',
          'SBA Community Express Loan Program support',
          'Capital access guidance',
          'Customized action plans',
          'Follow-up accountability',
        ]}
      />
    </PublicShell>
  )
}
