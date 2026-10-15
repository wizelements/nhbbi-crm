import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@/lib/env'
import { isReadOnlyPreview } from '@/lib/preview/read-only'
import * as schema from './schema'

const configured = Boolean(env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN)
if (!configured && !isReadOnlyPreview()) {
  throw new Error('Turso database credentials are required')
}

// No database connection is created for a read-only preview. All DB-backed
// routes are rejected in middleware before execution. The placeholder client
// throws if a future route attempts to query through it regardless.
const unavailableClient = new Proxy({} as ReturnType<typeof createClient>, {
  // The ORM reads client methods while constructing its driver. Return a
  // function here, but fail closed if any database method is actually called.
  get() {
    return () => {
      throw new Error('Database access is disabled in this read-only preview')
    }
  },
})
const client = configured
  ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
  : unavailableClient

export const db = drizzle(client, { schema })
export * from './schema'
