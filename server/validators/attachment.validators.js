import { z } from 'zod';

// The optional text that travels with the files (like a photo caption).
export const captionSchema = z.object({
  content: z.string().trim().max(4000, 'Caption is too long').optional(),
});