// A pragmatic, non-exhaustive list of common countries for the checkout
// shipping form. Values are real ISO 3166-1 alpha-2 codes — the backend's
// checkoutValidation enforces `isISO31661Alpha2()`, so any code picked from
// this list is guaranteed to pass server-side validation.
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'SN', name: 'Senegal' },
  { code: 'NZ', name: 'New Zealand' },
]

export const DELIVERY_OPTIONS = [
  {
    id: 'STANDARD' as const,
    label: 'Standard',
    eta: '3-7 business days',
    range: '3–7',
    price: 15.99,
  },
  {
    id: 'EXPRESS' as const,
    label: 'Express',
    eta: '2-4 business days',
    range: '2–4',
    price: 21,
  },
  {
    id: 'PRIORITY' as const,
    label: 'Priority',
    eta: '1-2 business days',
    range: '1–2',
    price: 30.21,
  },
]

export type DeliverySpeed = (typeof DELIVERY_OPTIONS)[number]['id']
