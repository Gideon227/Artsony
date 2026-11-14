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