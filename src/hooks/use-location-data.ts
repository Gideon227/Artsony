import { useQuery } from '@tanstack/react-query'
import { COUNTRIES } from '@/constants/countries'
import { STALE_TIMES } from '@/constants'

const API_BASE = 'https://countriesnow.space/api/v0.1'
const REQUEST_TIMEOUT_MS = 15_000
const MAX_RETRIES = 3

export type LocationCountry = {
  code: string
  name: string
}

type CountriesResponse = {
  error?: boolean
  msg?: string
  data?: Array<{ iso2?: string; country?: string }>
}

type StatesResponse = {
  error?: boolean
  msg?: string
  data?: { states?: Array<{ name?: string }> }
}

class LocationApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'LocationApiError'
  }
}

const NAME_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c.name]))
const CODE_BY_NAME = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]))
const NO_COUNTRIES: LocationCountry[] = []
const NO_STATES: string[] = []

export const getCountryName = (code: string): string | undefined => NAME_BY_CODE.get(code.toUpperCase())

const retryDelay = (attempt: number) => Math.min(500 * 2 ** attempt, 4_000)

async function request<T>(path: string, init: RequestInit | undefined, signal: AbortSignal | undefined): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const forwardAbort = () => controller.abort()
  signal?.addEventListener('abort', forwardAbort)

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal })
    if (!res.ok) throw new LocationApiError(`Location request failed (${res.status})`, res.status)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

async function fetchCountries(signal: AbortSignal | undefined): Promise<LocationCountry[]> {
  const json = await request<CountriesResponse>('/countries', undefined, signal)
  if (json.error || !Array.isArray(json.data)) {
    throw new LocationApiError(json.msg ?? 'Unexpected countries response')
  }

  const seen = new Set<string>()
  const countries: LocationCountry[] = []
  for (const entry of json.data) {
    const name = typeof entry.country === 'string' ? entry.country.trim() : ''
    if (!name) continue
    const iso = typeof entry.iso2 === 'string' && entry.iso2 ? entry.iso2 : CODE_BY_NAME.get(name.toLowerCase())
    const code = iso?.toUpperCase()
    if (!code || !/^[A-Z]{2}$/.test(code) || seen.has(code)) continue
    seen.add(code)
    countries.push({ code, name })
  }

  if (countries.length === 0) throw new LocationApiError('Countries response contained no usable entries')
  return countries.sort((a, b) => a.name.localeCompare(b.name))
}

async function fetchStates(country: string, signal: AbortSignal | undefined): Promise<string[]> {
  let json: StatesResponse
  try {
    json = await request<StatesResponse>(
      '/countries/states',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      },
      signal,
    )
  } catch (err) {
    if (err instanceof LocationApiError && err.status === 404) return NO_STATES
    throw err
  }

  if (json.error) throw new LocationApiError(json.msg ?? 'Could not load states')

  const names = (json.data?.states ?? [])
    .map((s) => (typeof s.name === 'string' ? s.name.trim() : ''))
    .filter(Boolean)
  return [...new Set(names)].sort((a, b) => a.localeCompare(b))
}

export function useCountryOptions() {
  const query = useQuery({
    queryKey: ['location', 'countries'],
    queryFn: ({ signal }) => fetchCountries(signal),
    staleTime: STALE_TIMES.static,
    gcTime: Infinity,
    retry: MAX_RETRIES,
    retryDelay,
    refetchOnWindowFocus: false,
  })

  return {
    countries: query.data ?? (query.isError ? COUNTRIES : NO_COUNTRIES),
    isLoading: query.isPending,
    isFallback: query.isError,
    refetch: query.refetch,
  }
}

export function useStateOptions(countryName: string | undefined) {
  const query = useQuery({
    queryKey: ['location', 'states', countryName],
    queryFn: ({ signal }) => fetchStates(countryName as string, signal),
    enabled: Boolean(countryName),
    staleTime: STALE_TIMES.static,
    gcTime: Infinity,
    retry: MAX_RETRIES,
    retryDelay,
    refetchOnWindowFocus: false,
  })

  return {
    states: query.data ?? NO_STATES,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}