import { z } from 'zod'

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username too long')
      .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
    email: z.string().email('Enter a valid email address'),
    password,
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((v) => v === true, { message: 'You must accept the terms' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const editProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

export const uploadArtworkSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  category: z.enum([
    'painting', 'digital', 'photography', 'sculpture',
    'illustration', 'mixed-media', 'other',
  ]),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
  availability: z.enum(['for-sale', 'not-for-sale']),
  status: z.enum(['draft', 'published']),
})

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type EditProfileInput = z.infer<typeof editProfileSchema>
export type UploadArtworkInput = z.infer<typeof uploadArtworkSchema>
export type CommentInput = z.infer<typeof commentSchema>
