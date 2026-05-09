import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address").min(6, "A minimum of 6 characters is required"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;