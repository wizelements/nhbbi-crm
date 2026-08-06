import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { env } from '@/lib/env'
import { users, memberships, events, directoryListings, jobs, leads, contacts } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client)

async function seed() {
  const existing = await db.select().from(users).limit(1)
  if (existing.length > 0) {
    console.log('Database already seeded. Skipping.')
    return
  }

  const adminPassword = await hashPassword(env.ADMIN_DEFAULT_PASSWORD)
  const memberPassword = await hashPassword('MemberPass123!')

  const [admin] = await db
    .insert(users)
    .values({
      email: env.ADMIN_DEFAULT_EMAIL,
      passwordHash: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
    })
    .returning({ id: users.id })

  const [member] = await db
    .insert(users)
    .values({
      email: 'member@example.com',
      passwordHash: memberPassword,
      role: 'member',
      firstName: 'Sample',
      lastName: 'Member',
      emailVerified: true,
    })
    .returning({ id: users.id })

  await db.insert(memberships).values({
    userId: member.id,
    tier: 'silver',
    status: 'active',
    priceCents: 50000,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  })

  await db.insert(events).values([
    {
      title: 'Kingdom Connections Networking',
      slug: 'kingdom-connections-networking',
      description: 'Monthly networking event for BBI members and guests.',
      location: 'Word of Faith Family Worship Center',
      startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priceCents: 2500,
      published: true,
      capacity: 120,
    },
    {
      title: 'NxLevel Graduation Ceremony',
      slug: 'nxlevel-graduation',
      description: 'Celebrate the newest class of NxLevel entrepreneurs.',
      location: 'Riverside Epicenter',
      startAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      priceCents: 0,
      published: true,
    },
  ])

  await db.insert(directoryListings).values({
    ownerUserId: member.id,
    companyName: 'Sample Business LLC',
    slug: 'sample-business',
    description: 'A sample member business for demonstration.',
    category: 'Consulting',
    contactEmail: 'member@example.com',
    website: 'https://example.com',
    approved: true,
    featured: false,
  })

  await db.insert(jobs).values({
    ownerUserId: member.id,
    title: 'Marketing Assistant',
    description: 'Part-time marketing assistant for a growing faith-based business.',
    location: 'Atlanta, GA',
    contactEmail: 'member@example.com',
    published: true,
  })

  await db.insert(leads).values({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '404-555-0100',
    interest: 'Membership',
    message: 'I am interested in learning more about BBI membership tiers.',
    source: 'website',
    status: 'new',
  })

  await db.insert(contacts).values({
    name: 'John Smith',
    email: 'john@example.com',
    subject: 'General Inquiry',
    message: 'How can I partner with BBI for an upcoming event?',
    status: 'new',
  })

  console.log('Seeded database.')
  console.log(`Admin: ${env.ADMIN_DEFAULT_EMAIL} / ${env.ADMIN_DEFAULT_PASSWORD}`)
  console.log('Member: member@example.com / MemberPass123!')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
