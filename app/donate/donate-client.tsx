'use client'

import { useState, type FormEvent } from 'react'
import { Heart, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const PRESET_AMOUNTS = [2500, 5000, 10000, 25000, 50000, 100000]

export function DonateClient() {
  const [amountCents, setAmountCents] = useState(5000)
  const [custom, setCustom] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    // Stub: wire to Square payment flow when backend is ready.
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus('ok')
  }

  const displayAmount = custom ? Number(custom) * 100 : amountCents

  return (
    <Card>
      <CardContent className="p-6 md:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy">Make a Donation</h2>
          <p className="text-muted-foreground">
            Your gift helps us cultivate more spiritual leaders in the
            marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select an amount</Label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((cents) => (
                <Button
                  key={cents}
                  type="button"
                  variant={amountCents === cents && !custom ? 'gold' : 'outline'}
                  onClick={() => {
                    setAmountCents(cents)
                    setCustom('')
                  }}
                >
                  {formatCurrency(cents)}
                </Button>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="custom">Custom amount (USD)</Label>
              <Input
                id="custom"
                type="number"
                min={1}
                placeholder="Enter amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-stone-50 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-navy">
              <Info className="h-4 w-4" />
              Payment processing
            </div>
            <p>
              Donations are processed securely via Square. You will be able to
              enter your card details on the next step. No payment is charged in
              this preview.
            </p>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={status === 'submitting'}
          >
            {status === 'submitting'
              ? 'Processing...'
              : `Donate ${formatCurrency(displayAmount || 0)}`}
          </Button>

          {status === 'ok' && (
            <p className="text-center text-sm text-green-600">
              Thank you for your generosity! (Preview — no charge processed.)
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
