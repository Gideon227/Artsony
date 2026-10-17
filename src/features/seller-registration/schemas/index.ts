import { z } from 'zod'

export const accountBasicsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(120, 'Full name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(254, 'Email is too long'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(40, 'Username is too long')
    .regex(/^@?[A-Za-z0-9._-]+$/, 'Use letters, numbers, dots, dashes and underscores only'),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, '').replace(/^0+/, '')
      return digits.length >= 7 && digits.length <= 14
    }, 'Enter a valid phone number'),
  dialCode: z.string().min(2),
})

export type AccountBasicsFormValues = z.infer<typeof accountBasicsSchema>