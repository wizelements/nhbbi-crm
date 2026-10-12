import { getSquareClient, getSquareLocationId } from './client'
import { createSquareOrder, calculateOrderTotal, type CreateOrderInput } from './orders'
import { z } from 'zod'

export const processPaymentInputSchema = z.object({
  sourceId: z.string().min(1),
  verificationToken: z.string().optional(),
  referenceId: z.string().min(1),
  lineItems: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().min(1).default('1'),
      catalogObjectId: z.string().optional(),
      variationId: z.string().optional(),
      basePriceCents: z.number().int().nonnegative(),
      note: z.string().optional(),
    })
  ).min(1),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  buyerGivenName: z.string().optional(),
  buyerFamilyName: z.string().optional(),
  note: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

export type ProcessPaymentInput = z.infer<typeof processPaymentInputSchema>

export async function processSquarePayment(input: ProcessPaymentInput) {
  const parsed = processPaymentInputSchema.parse(input)
  const square = getSquareClient()
  const locationId = getSquareLocationId()

  const orderInput: CreateOrderInput = {
    referenceId: parsed.referenceId,
    lineItems: parsed.lineItems,
    buyerEmail: parsed.buyerEmail,
    buyerPhone: parsed.buyerPhone,
    buyerGivenName: parsed.buyerGivenName,
    buyerFamilyName: parsed.buyerFamilyName,
    note: parsed.note,
    metadata: parsed.metadata,
  }

  const order = await createSquareOrder(orderInput)

  const serverTotal = await calculateOrderTotal(parsed.lineItems)
  if (order.totalCents !== serverTotal.totalCents) {
    throw new Error(
      `Order total mismatch: server calculated ${serverTotal.totalCents} cents but Square returned ${order.totalCents} cents`
    )
  }

  const paymentRequest: Record<string, unknown> = {
    locationId,
    sourceId: parsed.sourceId,
    amountMoney: {
      amount: BigInt(order.totalCents),
      currency: 'USD',
    },
    orderId: order.squareOrderId,
    referenceId: parsed.referenceId,
    note: parsed.note,
    metadata: parsed.metadata,
  }

  if (parsed.verificationToken) {
    paymentRequest.verificationToken = parsed.verificationToken
  }

  const response = await square.paymentsApi.createPayment(paymentRequest as unknown as Parameters<typeof square.paymentsApi.createPayment>[0])
  const payment = response.result.payment

  if (!payment?.id) {
    throw new Error('Square did not return a payment ID')
  }

  return {
    success: payment.status === 'COMPLETED' || payment.status === 'APPROVED',
    squarePaymentId: payment.id,
    squareOrderId: order.squareOrderId,
    referenceId: parsed.referenceId,
    status: payment.status,
    totalCents: order.totalCents,
    total: order.totalCents / 100,
    currency: 'USD',
    receiptUrl: payment.receiptUrl ?? null,
    cardBrand: payment.cardDetails?.card?.cardBrand ?? null,
    cardLast4: payment.cardDetails?.card?.last4 ?? null,
    rawPayment: payment,
    rawOrder: order.raw,
  }
}

export async function getSquarePayment(squarePaymentId: string) {
  const square = getSquareClient()
  const response = await square.paymentsApi.getPayment(squarePaymentId)
  return response.result.payment
}
