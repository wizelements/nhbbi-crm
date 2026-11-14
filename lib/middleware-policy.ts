type RoleUser = { role: string } | null | undefined

export function isAdmin(user: RoleUser): boolean {
  return user?.role === 'admin'
}

export function isMember(user: RoleUser): boolean {
  return user?.role === 'member' || user?.role === 'admin'
}

export type MiddlewareAuthorizationDecision =
  | { type: 'redirect'; callbackUrl: string }
  | { type: 'next' }

/**
 * Page-route decision used by middleware. Paths that do not start with
 * `/admin` or `/member` pass through, including CRM API routes. Those
 * handlers authorize again before reading data.
 */
export function middlewareAuthorizationDecision(
  pathname: string,
  user: RoleUser,
): MiddlewareAuthorizationDecision {
  if (pathname.startsWith('/admin') && !isAdmin(user)) {
    return { type: 'redirect', callbackUrl: pathname }
  }

  if (pathname.startsWith('/member') && !isMember(user)) {
    return { type: 'redirect', callbackUrl: pathname }
  }

  return { type: 'next' }
}
