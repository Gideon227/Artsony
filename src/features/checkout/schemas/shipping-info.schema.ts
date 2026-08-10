import { z } from 'zod'

// Single schema shared by both digital and physical checkouts. For digital
// orders the address/city/state/postal/country fields are rendered disabled
// and pre-filled with harmless placeholders (see checkout-form.tsx) — they
// pass validation but are never actually sent to the backend for a
// digital-only order (only full_name + phone are submitted in that case).
export const shippingInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(200),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(5, 'Phone number is required').max(30),
  address_line_1: z.string().min(1, 'Address is required').max(300),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State / Province is required').max(100),
  postal_code: z.string().min(1, 'Postal code is required').max(20),
  country_code: z.string().length(2, 'Select a country'),
  save_address: z.boolean().optional(),
  delivery_speed: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY']),
})

export type ShippingInfoInput = z.infer<typeof shippingInfoSchema>
