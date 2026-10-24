'use client'

import { BrandLoader } from './brand-loader'
import { WithdrawFrame } from './withdraw-frame'

export function WithdrawProcessingView() {
  return (
    <WithdrawFrame title="Processing withdrawal" description="Your withdrawal request is being processed" showTitle={false} showClose={false} decor>
      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-y-8 px-6 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col gap-y-3">
          <p className="font-raleway text-h5 text-heading">Processing</p>
          <p className="font-poppins text-body-s leading-5 text-body">Your withdrawal request is being processed please wait</p>
        </div>
        <BrandLoader />
      </div>
    </WithdrawFrame>
  )
}