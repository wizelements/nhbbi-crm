'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Training', href: '/services/training' },
      { label: 'Consulting', href: '/services/consulting' },
      { label: 'Networking', href: '/services/networking' },
    ],
  },
  { label: 'Membership', href: '/membership' },
  { label: 'Directory', href: '/directory' },
  { label: 'Events', href: '/events' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-navy text-gold border-b border-gold">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
          <p className="hidden sm:block italic">
            Transforming Lives by Discipling in Business Champions
          </p>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/directory" className="hover:underline">
              Business Directory
            </Link>
            <Link href="/login" className="hover:underline">
              Login / Register
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-navy text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold text-navy flex items-center justify-center font-bold">
                BBI
              </div>
              <span className="text-lg font-semibold hidden sm:inline">
                Bronner Business Institute
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.label} className="group relative">
                    <span className="cursor-pointer hover:text-gold transition-colors">
                      {link.label}
                    </span>
                    <ul className="absolute left-0 top-full z-50 hidden min-w-[12rem] rounded-md border bg-white text-navy shadow group-hover:block">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 hover:bg-gold/20"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>

            <div className="hidden lg:flex items-center gap-2">
              <form action="/directory" className="flex items-center">
                <input
                  name="q"
                  type="search"
                  placeholder="Search"
                  className="h-8 rounded-l-md border-0 px-3 text-sm text-navy focus:outline-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="gold"
                  className="rounded-l-none h-8 w-8"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button asChild variant="gold" size="sm">
                <Link href="/donate">Donate</Link>
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className={cn(
            'lg:hidden border-t border-white/10 overflow-hidden transition-all',
            mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="container mx-auto px-4 py-3 space-y-2">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="space-y-1">
                  <p className="font-semibold text-gold">{link.label}</p>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block pl-3 py-1 text-sm hover:text-gold"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-1 text-sm hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2">
              <Button asChild variant="gold" className="w-full">
                <Link href="/donate">Donate</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
