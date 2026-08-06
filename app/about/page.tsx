import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ABOUT_BLURB, ABOUT_HISTORY, MISSION_STATEMENT, VALUES, CREED, LEADERSHIP } from '@/lib/public/data'

export const metadata = {
  title: 'About — NHBBJ',
  description: 'Learn about the Bronner Business Institute, our mission, values, creed, and leadership.',
}

export default function AboutPage() {
  return (
    <PublicShell>
      <PageBanner title="About BBI" subtitle="Our story, mission, and leadership." />

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-navy">
              About <span className="text-gold">Us</span>
            </h2>
            <p className="text-muted-foreground">{ABOUT_BLURB}</p>
            <p className="text-muted-foreground">{ABOUT_HISTORY}</p>
          </div>

          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-navy">
              Our <span className="text-gold">Mission</span>
            </h2>
            <p className="text-lg text-muted-foreground">{MISSION_STATEMENT}</p>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-navy">
            Our <span className="text-gold">Values</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-navy">
          Creed of <span className="text-gold">BBI</span>
        </h2>
        <div className="mx-auto max-w-3xl rounded-2xl bg-navy p-8 text-white shadow">
          <h3 className="mb-4 text-xl font-semibold text-gold">The Charge of BBI</h3>
          <ul className="space-y-3">
            {CREED.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold">•</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gold/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-navy">
            BBI <span className="text-gold">Leadership</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((leader) => (
              <Card key={leader.name}>
                <CardHeader>
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-bold text-gold">
                    {leader.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-1 font-medium text-gold">{leader.role}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
