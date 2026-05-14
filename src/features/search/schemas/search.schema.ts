import { z } from "zod";

export const searchFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  color: z.string().optional(),
  medium: z.string().optional(),
  location: z.string().optional(),
});

export type SearchFilterInput = z.infer<typeof searchFilterSchema>;