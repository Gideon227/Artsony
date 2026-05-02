import { z } from "zod";

export const signUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    termsAccepted: z.literal(true,
        ({ message: "You must accept the terms and conditions" }),
    ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;