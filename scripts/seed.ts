/**
 * Explicit, safe owner bootstrap. NO sample customers/orders, NO credential logging.
 * Use on a newly provisioned database after migrations, once, with a
 * randomly generated strong password. Never invoke from login or HTTP.
 */
import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { env } from '@/lib/env'
import { users } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth'
async function run() {
  if (process.env.NHBBI_BOOTSTRAP_CONFIRM !== 'I_HAVE_BACKED_UP_THIS_DATABASE') {
    throw new Error('Bootstrap is disabled. Explicit confirmation and backup required.')
  }
  if (!env.ADMIN_DEFAULT_PASSWORD || env.ADMIN_DEFAULT_PASSWORD.length < 16 || /changemenow|password123|sample/i.test(env.ADMIN_DEFAULT_PASSWORD)) {
    throw new Error('Generate a unique random administrator password (16+ characters).')
  }
  if (env.TURSO_DATABASE_URL.startsWith('file:') && process.env.NODE_ENV === 'production') {
    throw new Error('Refusing local production database for owner bootstrap.')
  }
  const client = createClient({url:env.TURSO_DATABASE_URL,authToken:env.TURSO_AUTH_TOKEN})
  const db=drizzle(client)
  const existing = await db.select({id:users.id}).from(users).limit(1)
  if (existing.length) throw new Error('Refusing bootstrap: database already has user accounts.')
  const [created] = await db.insert(users).values({
    email:env.ADMIN_DEFAULT_EMAIL.toLowerCase(),
    passwordHash:await hashPassword(env.ADMIN_DEFAULT_PASSWORD),
    role:'admin',emailVerified:true
  }).returning({id:users.id})
  if (!created?.id) throw new Error('Owner initialization did not return an account.')
  console.log('Owner account initialized. No sample members, orders or events were created.')
}
run().catch(error=>{ console.error(error instanceof Error ? error.message : 'Bootstrap failed'); process.exitCode=1 })
