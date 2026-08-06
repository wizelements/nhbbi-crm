import { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact — NHBBJ',
  description: 'Contact the Bronner Business Institute.',
}

export default function ContactPage() {
  return (
    <PublicShell>
      <PageBanner title="Contact Us" subtitle="We are ready to assist you." />

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-navy">Member Service</h2>
            <p className="text-muted-foreground">
              The dedicated BBI staff is ready to assist you. Contact us using
              the form, or reach out directly. Please include your email address
              or phone number so our staff can respond promptly.
            </p>

            <Card>
              <CardContent className="space-y-4 p-6">
                <p className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                  Bronner Business Institute
                  <br />
                  212 Riverside Pkwy, Austell, GA 30168
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gold" />
                  <a href="mailto:info@nhbbi.org" className="hover:text-gold">
                    info@nhbbi.org
                  </a>
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gold" />
                  <a href="tel:+17708748400" className="hover:text-gold">
                    (770) 874-8400 ext. 1105
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  )
}
