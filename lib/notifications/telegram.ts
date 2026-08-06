import { env } from '@/lib/env'

export async function sendTelegramAlert(message: string): Promise<{ ok: boolean; error?: string }> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured; alert not sent.')
    return { ok: false, error: 'Telegram bot token or chat ID not configured' }
  }

  try {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const error = data?.description || `Telegram HTTP ${res.status}`
      console.error('Telegram alert failed:', error)
      return { ok: false, error }
    }

    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Telegram alert exception:', msg)
    return { ok: false, error: msg }
  }
}

export function formatAlert({
  title,
  body,
  url,
}: {
  title: string
  body: string
  url?: string
}): string {
  return `<b>${title}</b>\n${body}${url ? `\n\n<a href="${url}">Open in CRM</a>` : ''}`
}
