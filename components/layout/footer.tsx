import Link from 'next/link'
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CURRENT_YEAR = 2026

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-navy">
      <section className="bg-gold/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold italic text-navy">
            Transforming Lives by{' '}
            <span className="text-gold">Discipling in Business</span> Champions
          </h2>
        </div>
      </section>

      <div className="bg-stone-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Join */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-navy">Join BBI</h4>
              <hr className="mb-4 border-navy/20" />
              <p className="mb-4 text-sm text-muted-foreground">
                A non-profit organization dedicated to continuing the legacy of
                philanthropy, business mentoring, and life skills training that
                characterized Nathaniel H. Bronner, Sr.
              </p>
              <Button asChild variant="navy">
                <Link href="/member/register">Sign Up</Link>
              </Button>
            </div>

            {/* Get Connected */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-navy">Get Connected</h4>
              <hr className="mb-4 border-navy/20" />
              <p className="mb-3 text-sm">Follow Us!</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.facebook.com/nhbbi"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/nhbbi"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Twitter className="h-4 w-4" /> Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Lend a Hand */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-navy">Lend A Hand</h4>
              <hr className="mb-4 border-navy/20" />
              <p className="mb-4 text-sm text-muted-foreground">
                Feel free to bless us as you feel led as we work to cultivate
                more spiritual leaders in our community.
              </p>
              <Button asChild variant="gold">
                <Link href="/donate">Donate</Link>
              </Button>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-navy">Contact Us</h4>
              <hr className="mb-4 border-navy/20" />
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  212 Riverside Pkwy, Austell, GA 30168
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  <a href="mailto:info@nhbbi.org" className="hover:text-gold">
                    info@nhbbi.org
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" />
                  <a href="tel:+17708748400" className="hover:text-gold">
                    (770) 874-8400
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy py-4 text-white">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm">
          <p>
            © {CURRENT_YEAR} Nathaniel H. Bronner Business Institute |
            <Link href="/privacy" className="ml-2 hover:text-gold">Privacy Policy</Link> |{' '}
            <Link href="/terms" className="hover:text-gold">Terms & Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
