'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components'
import { activationUploadService, ActivationUploadError } from '@/services/order/activation-upload.service'
import { ProofUploader } from './proof-uploader'

function Message({ title, body, action }: { title: string; body: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-raleway text-h5 font-medium tracking-wide text-gray-500">{title}</h1>
      <p className="max-w-[360px] font-poppins text-body-xs leading-5 tracking-wide text-gray-400">{body}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

export function PhoneUploadPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const token = Array.isArray(params.token) ? params.token[0] : params.token

  const context = useQuery({
    queryKey: ['activation-upload', token],
    queryFn: ({ signal }) => activationUploadService.context(token as string, signal),
    select: (response) => response.data,
    enabled: Boolean(token),
    retry: (count, error) => !(error instanceof ActivationUploadError && error.status < 500) && count < 2,
    staleTime: Infinity,
    gcTime: 0,
  })

  let body: React.ReactNode
  if (!token || (context.isError && context.error instanceof ActivationUploadError && context.error.status < 500)) {
    body = (
      <Message
        title="This upload link isn't valid"
        body={
          context.error instanceof ActivationUploadError
            ? context.error.message
            : 'Open Order Management on your computer and generate a new QR code.'
        }
      />
    )
  } else if (context.isError) {
    body = (
      <Message
        title="We couldn't load this page"
        body="Check your connection and try again."
        action={{ label: 'Try again', onClick: () => void context.refetch() }}
      />
    )
  } else if (context.isPending) {
    body = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-label="Loading" />
      </div>
    )
  } else {
    body = (
      <>
        <header className="border-b border-gray-50 px-4 py-4 text-center">
          <p className="truncate font-raleway text-h6 font-medium tracking-wide text-gray-500">{context.data.artwork_title}</p>
          <p className="font-poppins text-body-xxs tracking-wide text-gray-300">Order {context.data.order_code}</p>
        </header>
        <ProofUploader
          token={token}
          onDone={() => router.replace('/')}
          successHint="Open Order Management on your computer to download your shipping label."
        />
      </>
    )
  }

  return <main className="mx-auto min-h-screen w-full max-w-[520px] bg-white">{body}</main>
}
