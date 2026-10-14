import { z } from 'zod';

export const updateSettingsSchema = {
  body: z.object({
    shopName: z.string().optional(),
    name: z.string().optional(),
    tagline: z.string().optional(),
    ownerName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    currency: z.string().optional(),
    categories: z.array(z.string()).optional(),
    warrantyDurations: z.array(z.string()).optional(),
    staffMembers: z.array(z.string()).optional()
  })
};

export const createStaffSchema = {
  body: z.object({
    name: z.string().min(1, 'Staff name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['owner', 'manager', 'staff']).default('staff'),
    phone: z.string().optional()
  })
};
