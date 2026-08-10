'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, Check, Clock } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button, Input, Spinner } from '@/components'
import { useOrderStore } from '@/store/order.store'
import { useOrder, useConfirmPayment } from '@/hooks/use-order'
import { useCopyToClipboard } from '@/hooks'
import { useZodForm } from '@/lib/form'
import { z } from 'zod'

const confirmSchema = z.object({
  tx_hash: z.string().min(10, 'Enter the transaction hash from your wallet'),
  sender_wallet_address: z.string().min(10, 'Enter the wallet address you paid from'),
})

// 1. Move all the search params and logic into this inner component
function PaymentContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''

  const { activeCheckout } = useOrderStore()
  const { data: order, isLoading } = useOrder(orderId)
  const { mutate: confirmPayment, isPending, isSuccess } = useConfirmPayment(orderId)
  const [copied, copy] = useCopyToClipboard()

  const instructions =
    activeCheckout?.order.id === orderId ? activeCheckout.payment_instructions : null

  const { register, handleSubmit, formState: { errors } } = useZodForm(confirmSchema, {
    defaultValues: { tx_hash: '', sender_wallet_address: '' },
  })

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  
  useEffect(() => {
    if (!instructions) return
    const tick = () => {
      const diff = Math.floor((new Date(instructions.expires_at).getTime() - Date.now()) / 1000)
      setSecondsLeft(Math.max(diff, 0))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [instructions])

  const onSubmit = handleSubmit((values) => {
    if (!instructions) return
    confirmPayment({
      tx_hash: values.tx_hash,
      sender_wallet_address: values.sender_wallet_address,
      network: instructions.network,
    })
  })

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-16">
      <h1 className="font-raleway text-h4 font-semibold text-gray-900">Complete Payment</h1>

      {isLoading && !order ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-success-100 bg-success-50 py-16 text-center">
          <Check className="h-10 w-10 text-success-600" />
          <p className="font-poppins font-medium text-success-700">
            Transaction submitted — we&apos;re monitoring it on-chain.
          </p>
          <Link
            href="/my-orders"
            className="rounded-full bg-primary-500 px-6 py-3 font-poppins text-[14px] font-medium text-white hover:bg-primary-600"
          >
            View My Orders
          </Link>
        </div>
      ) : !instructions ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-50 py-16 text-center">
          <p className="max-w-sm font-poppins text-gray-500">
            Payment details are only shown right after checkout. If you refreshed this page or
            came back later, check your order status instead.
          </p>
          <Link
            href="/my-orders"
            className="rounded-full bg-primary-500 px-6 py-3 font-poppins text-[14px] font-medium text-white hover:bg-primary-600"
          >
            View My Orders
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-secondary-50 p-6">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-[14px] text-gray-500">Amount due</span>
              <span className="font-raleway text-[22px] font-semibold text-primary-500">
                {instructions.amount.toLocaleString('en-US')} {instructions.currency}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-poppins text-[14px] text-gray-500">Network</span>
              <span className="font-poppins text-[14px] font-medium text-gray-900">
                {instructions.network}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-poppins text-[14px] text-gray-500">Send to wallet address</span>
              <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-3">
                <code className="flex-1 truncate font-poppins text-[13px] text-gray-800">
                  {instructions.recipient_wallet_address}
                </code>
                <button
                  type="button"
                  onClick={() => copy(instructions.recipient_wallet_address)}
                  aria-label="Copy wallet address"
                  className="text-gray-400 hover:text-primary-500"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {secondsLeft !== null && (
              <div className="flex items-center gap-1.5 font-poppins text-[12px] text-gray-400">
                <Clock size={13} />
                {secondsLeft > 0
                  ? `Expires in ${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`
                  : 'This payment window has expired — contact support if you already paid.'}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <p className="font-poppins text-[13px] text-gray-500">
              Once you&apos;ve sent the payment from your wallet, paste the transaction hash and
              the sending wallet address below so we can verify it on-chain.
            </p>

            <Input
              placeholder="Transaction hash"
              {...register('tx_hash')}
              error={errors.tx_hash?.message}
            />
            <Input
              placeholder="Sender wallet address"
              {...register('sender_wallet_address')}
              error={errors.sender_wallet_address?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isPending}
              loadingText="Submitting…"
            >
              Submit Payment
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

// 2. Export the main page, wrapping the inner component in Suspense
export default function CheckoutPaymentPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </div>
  )
}