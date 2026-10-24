// Single source for the USDT → NGN preview rate shown in the withdrawal modal.
//
// Static for now: the backend doesn't expose a rate yet. When it does, replace
// this constant with a query hook and pass the live value into
// `useWithdrawAmount` — nothing else in the withdrawal flow needs to change.
// The rate is display-only; the API always receives the amount in USDT.
export const USDT_NGN_RATE = 1450

const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatNgn = (value: number): string => ngnFormatter.format(value)
export const formatUsdCurrency = (value: number): string => usdFormatter.format(value)