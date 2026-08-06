import { Resend } from 'resend'
import { env } from '@/lib/env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured; email not sent.')
    return { ok: false, error: 'Resend API key not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: payload.from || env.RESEND_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo,
    })

    if (error) {
      console.error('Resend error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Resend exception:', message)
    return { ok: false, error: message }
  }
}

export function welcomeEmail({ firstName, loginUrl }: { firstName: string; loginUrl: string }) {
  return {
    subject: 'Welcome to NHBBJ',
    html: `
      <p>Hi ${firstName || 'there'},</p>
      <p>Welcome to the Bronner Business Institute (NHBBJ). Your account has been created.</p>
      <p><a href="${loginUrl}">Sign in to your member portal</a></p>
      <p>Blessings,<br/>The NHBBJ Team</p>
    `,
    text: `Welcome to NHBBJ. Sign in: ${loginUrl}`,
  }
}

export function membershipConfirmationEmail({
  firstName,
  tier,
  amount,
}: {
  firstName: string
  tier: string
  amount: string
}) {
  return {
    subject: `Your NHBBJ ${tier} membership is confirmed`,
    html: `
      <p>Hi ${firstName || 'there'},</p>
      <p>Thank you for joining NHBBJ as a ${tier} member. Your payment of ${amount} has been received.</p>
      <p>You can now access the member portal and directory.</p>
      <p>Blessings,<br/>The NHBBJ Team</p>
    `,
    text: `NHBBJ ${tier} membership confirmed. Amount: ${amount}`,
  }
}

export function eventRegistrationEmail({
  firstName,
  eventTitle,
  eventDate,
}: {
  firstName: string
  eventTitle: string
  eventDate: string
}) {
  return {
    subject: `Registered for ${eventTitle}`,
    html: `
      <p>Hi ${firstName || 'there'},</p>
      <p>You are registered for <strong>${eventTitle}</strong> on ${eventDate}.</p>
      <p>We look forward to seeing you there.</p>
      <p>Blessings,<br/>The NHBBJ Team</p>
    `,
    text: `Registered for ${eventTitle} on ${eventDate}.`,
  }
}

export function receiptEmail({
  firstName,
  type,
  amount,
  orderId,
}: {
  firstName: string
  type: string
  amount: string
  orderId: string
}) {
  return {
    subject: `Receipt for your ${type} payment`,
    html: `
      <p>Hi ${firstName || 'there'},</p>
      <p>Thank you for your ${type} payment of ${amount}.</p>
      <p>Order ID: ${orderId}</p>
      <p>Blessings,<br/>The NHBBJ Team</p>
    `,
    text: `Receipt: ${type} payment of ${amount}. Order ${orderId}`,
  }
}

export function contactConfirmationEmail({ name }: { name: string }) {
  return {
    subject: 'We received your message',
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for contacting NHBBJ. We have received your message and will respond soon.</p>
      <p>Blessings,<br/>The NHBBJ Team</p>
    `,
    text: 'Thank you for contacting NHBBJ. We will respond soon.',
  }
}

export function leadAlertEmail({
  name,
  email,
  interest,
  message,
}: {
  name: string
  email: string
  interest?: string | null
  message?: string | null
}) {
  return {
    subject: `New lead: ${name}`,
    html: `
      <p><strong>New lead submitted</strong></p>
      <ul>
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
        ${interest ? `<li>Interest: ${interest}</li>` : ''}
      </ul>
      ${message ? `<p>Message:</p><blockquote>${message}</blockquote>` : ''}
    `,
    text: `New lead: ${name} (${email}). Interest: ${interest || 'n/a'}. Message: ${message || 'n/a'}`,
  }
}
