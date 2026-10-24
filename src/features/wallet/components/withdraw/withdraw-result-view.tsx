'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/utils'
import { WithdrawFrame } from './withdraw-frame'

export type WithdrawResultViewProps = {
  tone: 'success' | 'error'
  title: string
  description: string
  imageSrc: string
  /** The failed screen keeps a close button; the success screen ends with "Finish". */
  showClose?: boolean
  action: React.ReactNode
}

export function WithdrawResultView({ tone, title, description, imageSrc, showClose = false, action }: WithdrawResultViewProps) {
  return (
    <WithdrawFrame title={title} description={description} showTitle={false} showClose={showClose}>
      <div className="flex flex-1 flex-col items-center justify-between gap-y-8 px-6 pb-8 pt-12 text-center lg:px-10 lg:pb-14" role="status">
        <div className="flex flex-col items-center gap-y-10">
          <div className="flex max-w-md flex-col gap-y-4">
            <h3 className={cn('font-raleway text-h5 lg:text-h4', tone === 'success' ? 'text-successful-500' : 'text-error-500')}>{title}</h3>
            <p className="font-poppins text-body-s leading-5 text-body">{description}</p>
          </div>
          <Image src={imageSrc} alt="" width={320} height={280} priority className="h-auto w-full max-w-[320px]" />
        </div>
        <div className="w-full lg:max-w-[332px]">{action}</div>
      </div>
    </WithdrawFrame>
  )
}