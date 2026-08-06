import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { ServiceDetail } from '@/components/public/service-detail'
import { SERVICE_TRAINING } from '@/lib/public/data'

export const metadata = {
  title: 'Training — NHBBJ',
  description: 'Certified NxLevel™ entrepreneurial training from Bronner Business Institute.',
}

export default function TrainingPage() {
  return (
    <PublicShell>
      <PageBanner title="BBI Training" subtitle="Certified NxLevel™ Entrepreneurial Training" />
      <ServiceDetail
        title={SERVICE_TRAINING.title}
        subtitle={SERVICE_TRAINING.subtitle}
        body={SERVICE_TRAINING.body}
        cta={SERVICE_TRAINING.cta}
        benefits={[
          'Aspiring (Micro) Start-Up Course',
          'Advanced Entrepreneurship Course',
          'Youth Entrepreneurship Course',
          'Hands-on business plan development',
          'Biblical principles as a foundation',
          'Peer cohorts and accountability',
        ]}
      />
    </PublicShell>
  )
}
