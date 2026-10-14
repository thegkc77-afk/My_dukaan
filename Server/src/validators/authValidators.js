import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    email: z.string().min(1, 'Email or username is required').trim(),
    password: z.string().min(1, 'Password is required'),
    shopName: z.string().optional()
  })
};
