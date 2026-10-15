/**
 * Public, non-transactional preview when private integration credentials are
 * intentionally absent. The opt-in is scoped to Vercel Preview, never Production.
 */
export function isReadOnlyPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview'
    && process.env.NHBBI_PREVIEW_READ_ONLY === 'true'
}

export function canAccessPreviewPath(pathname: string, method: string): boolean {
  if (!isReadOnlyPreview()) return true
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) return false
  return !(
    pathname === '/login' || pathname === '/register'
    || pathname.startsWith('/admin') || pathname.startsWith('/member')
    || pathname.startsWith('/api')
    || pathname.startsWith('/donate')
  )
}
