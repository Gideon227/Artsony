import { z } from 'zod'

const optionalText = (max: number) => z.string().max(max).optional()

const baseSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(200),
  email: z.string().email('Enter a valid email address'),
  phone_dial_code: z.string().optional(),
  phone: z.string().min(5, 'Phone number is required').max(20),
  address_line_1: optionalText(300),
  address_line_2: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  postal_code: optionalText(20),
  country_code: z.string().length(2, 'Select a country').optional(),
  save_address: z.boolean().optional(),
  delivery_speed: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY']),
})

const SHIPPING_REQUIRED = [
  ['address_line_1', 'Address is required'],
  ['city', 'City is required'],
  ['state', 'State / Province is required'],
  ['postal_code', 'Postal code is required'],
  ['country_code', 'Select a country'],
] as const

export type CheckoutInfoInput = z.infer<typeof baseSchema>

export function createCheckoutInfoSchema(requiresShipping: boolean) {
  return baseSchema.superRefine((values, ctx) => {
    if (!requiresShipping) return
    for (const [field, message] of SHIPPING_REQUIRED) {
      if (!values[field]?.trim()) {
        ctx.addIssue({ code: 'custom', path: [field], message })
      }
    }
  })
}
