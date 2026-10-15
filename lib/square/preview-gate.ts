/**
 * In Vercel Preview deployments, Square access is fail-closed unless explicitly
 * enabled by the operator AFTER separate sandbox credentials have been verified.
 * VERCEL_ENV is provided by Vercel even when NODE_ENV is "production".
 */
export function arePreviewSquareTransactionsDisabled(
  vercelEnvironment: string | undefined = process.env.VERCEL_ENV,
  explicitOptIn: string | undefined = process.env.NHBBI_PREVIEW_PAYMENTS_ENABLED
): boolean {
  return vercelEnvironment === 'preview' && explicitOptIn !== 'true'
}

export function assertSquareTransactionsAllowed(): void {
  if (arePreviewSquareTransactionsDisabled()) {
    throw new Error('Square payments and catalog mutations are disabled for this preview deployment')
  }
}
