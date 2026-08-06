import crypto from 'crypto'
import { getSquareWebhookSignatureKey } from './client'

const SIGNATURE_HEADER = 'x-square-hmacsha256-signature'

export function verifySquareWebhookSignature(
  requestUrl: string,
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) {
    return false
  }

  let webhookKey: string
  try {
    webhookKey = getSquareWebhookSignatureKey()
  } catch {
    return false
  }

  try {
    const normalizedSignature = signatureHeader.trim()
    if (!normalizedSignature) {
      return false
    }

    const stringToSign = requestUrl + rawBody
    const hmac = crypto.createHmac('sha256', webhookKey)
    hmac.update(stringToSign)
    const calculatedSignature = hmac.digest('base64')

    const calculatedBuffer = Buffer.from(calculatedSignature)
    const providedBuffer = Buffer.from(normalizedSignature)

    if (calculatedBuffer.length !== providedBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(calculatedBuffer, providedBuffer)
  } catch {
    return false
  }
}

export function getSquareWebhookSignatureHeader(headers: Headers): string | null {
  return (
    headers.get(SIGNATURE_HEADER) ??
    headers.get(SIGNATURE_HEADER.toUpperCase()) ??
    headers.get('X-Square-HmacSha256-Signature') ??
    null
  )
}

export function isWebhookVerificationSkipped(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.SQUARE_SKIP_WEBHOOK_VERIFICATION === 'true'
  )
}

export interface SquareWebhookEvent {
  type: string
  eventId: string
  createdAt?: string
  data?: any
}

export function parseSquareWebhookBody(rawBody: string): SquareWebhookEvent {
  const parsed = JSON.parse(rawBody)
  return {
    type: parsed.type ?? 'unknown',
    eventId: parsed.id ?? parsed.event_id ?? 'unknown',
    createdAt: parsed.created_at,
    data: parsed.data,
  }
}

export function mapSquarePaymentStatus(paymentStatus?: string | null): 'pending' | 'paid' | 'failed' | 'refunded' {
  switch (paymentStatus) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'paid'
    case 'FAILED':
    case 'CANCELED':
      return 'failed'
    case 'REFUNDED':
      return 'refunded'
    default:
      return 'pending'
  }
}
