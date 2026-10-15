import { Client, Environment } from 'square'
import { env } from '@/lib/env'
import { assertSquareTransactionsAllowed } from './preview-gate'

export type SquareEnvironment = 'sandbox' | 'production'

let cachedClient: Client | null = null
let cachedEnvironment: SquareEnvironment | null = null

export function getSquareEnvironment(): SquareEnvironment {
  return env.SQUARE_ENVIRONMENT ?? 'sandbox'
}

export function getSquareClient(): Client {
  assertSquareTransactionsAllowed()
  const environment = getSquareEnvironment()

  if (cachedClient && cachedEnvironment === environment) {
    return cachedClient
  }

  const accessToken = env.SQUARE_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('SQUARE_ACCESS_TOKEN is not configured')
  }

  if (accessToken.startsWith('sq0csp-')) {
    throw new Error(
      'SQUARE_ACCESS_TOKEN appears to be a Client Secret (sq0csp-). Use an Access Token (EAAA... or sq0atp-...).'
    )
  }

  const squareEnv =
    environment === 'production' ? Environment.Production : Environment.Sandbox

  cachedClient = new Client({
    environment: squareEnv,
    accessToken,
    userAgentDetail: 'nhbbi-crm/0.1.0',
  })

  cachedEnvironment = environment
  return cachedClient
}

export function getSquareApplicationId(): string {
  return env.SQUARE_APPLICATION_ID
}

export function getSquareLocationId(): string {
  return env.SQUARE_LOCATION_ID
}

export function getSquareWebhookSignatureKey(): string {
  const key = env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!key) {
    throw new Error('SQUARE_WEBHOOK_SIGNATURE_KEY is not configured')
  }
  return key
}

export function invalidateSquareClientCache(): void {
  cachedClient = null
  cachedEnvironment = null
}

export function squareMoney(cents: number, currency = 'USD') {
  return {
    amount: BigInt(cents),
    currency,
  }
}

export function fromSquareMoney(money?: { amount?: bigint | number; currency?: string } | null): number {
  if (!money || money.amount === undefined || money.amount === null) return 0
  const amount = typeof money.amount === 'bigint' ? Number(money.amount) : money.amount
  return amount / 100
}
