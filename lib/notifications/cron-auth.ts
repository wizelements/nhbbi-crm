import { timingSafeEqual } from 'node:crypto'
/** Vercel Cron uses Authorization: Bearer CRON_SECRET, never a URL parameter. */
export function verifyCronAuthorization(header: string | null, secret: string): boolean {
  if (!header || secret.length < 32 || !/^Bearer [^\s]+$/.test(header)) return false
  const supplied=Buffer.from(header.slice(7),'utf8')
  const expected=Buffer.from(secret,'utf8')
  return supplied.length === expected.length && timingSafeEqual(supplied,expected)
}
