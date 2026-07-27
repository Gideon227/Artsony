import { useMemo } from 'react'
import { COUNTRIES, type Country } from '@/constants/countries'

export type { Country }

// Static bundle — see constants/countries.ts for why this replaced a live
// fetch to restcountries.com. Kept as a hook (rather than importing the
// constant directly) so call sites don't need to change if this ever needs
// to become async again (e.g. locale-aware names).
export function useCountries() {
  const countries = useMemo(() => COUNTRIES, [])
  return { countries, isLoading: false, error: null as string | null }
}
