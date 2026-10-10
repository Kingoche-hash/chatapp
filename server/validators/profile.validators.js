import { z } from 'zod';

const privacySchema = z.object({
  showPresence: z.boolean().optional(),
  readReceipts: z.boolean().optional(),
  typingIndicators: z.boolean().optional(),
});

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().max(40, 'Display name must be at most 40 characters').optional(),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores')
      .optional(),
    bio: z.string().trim().max(160, 'About must be at most 160 characters').optional(),
    status: z.string().trim().max(60, 'Status must be at most 60 characters').optional(),
    privacy: privacySchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});