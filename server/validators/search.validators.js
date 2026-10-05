import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters').max(100, 'Search text is too long'),
  conversationId: objectId.optional(),
  senderId: objectId.optional(),
  before: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});