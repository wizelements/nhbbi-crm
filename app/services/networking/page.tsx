import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { ServiceDetail } from '@/components/public/service-detail'
import { SERVICE_NETWORKING } from '@/lib/public/data'

export const metadata = {
  title: 'Networking — NHBBJ',
  description: 'Power Networking and Kingdom Connections events from BBI.',
}

export default function NetworkingPage() {
  return (
    <PublicShell>
      <PageBanner title="BBI Networking" subtitle="Power Networking & Kingdom Connections" />
      <ServiceDetail
        title={SERVICE_NETWORKING.title}
        subtitle={SERVICE_NETWORKING.subtitle}
        body={SERVICE_NETWORKING.body}
        cta={SERVICE_NETWORKING.cta}
        benefits={[
          'Monthly Power Networking events',
          'Kingdom Connections featured gatherings',
          'Inspirational speakers',
          'Open networking format',
          'Lead generation opportunities',
          'Expanded circle of influence',
        ]}
      />
    </PublicShell>
  )
}
