/**
 * Safe settings for the ACTIVE NHBBI application's existing libSQL client.
 * Production must never fall back to "file:nhbbi-local.db" on Vercel.
 */
export type DatabaseEnv = {
  NODE_ENV?: string; VERCEL?: string;
  TURSO_DATABASE_URL?: string; TURSO_AUTH_TOKEN?: string;
}
export class DatabaseConfigurationError extends Error {
  constructor() { super('NHBBI database configuration is unavailable') }
}
export function liveDatabaseConfig(source: DatabaseEnv): { url: string; authToken?: string } {
  const production = source.NODE_ENV === 'production' || source.VERCEL === '1'
  const url=source.TURSO_DATABASE_URL?.trim()
  if (!url) {
    if (production) throw new DatabaseConfigurationError()
    return {url:'file:nhbbi-local.db'}
  }
  if (production && !/^(libsql|https):\/\//i.test(url)) {
    throw new DatabaseConfigurationError()
  }
  if (/^(libsql|https):\/\//i.test(url)) {
    const authToken=source.TURSO_AUTH_TOKEN?.trim()
    if(!authToken) throw new DatabaseConfigurationError()
    return {url,authToken}
  }
  if (url.startsWith('file:') && !production) return {url}
  throw new DatabaseConfigurationError()
}
