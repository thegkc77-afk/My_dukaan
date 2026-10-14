import { z } from 'zod';

export const createRepairSchema = {
  body: z.object({
    id: z.string().optional(), // allow client draft ID, but server validates/generates if needed
    name: z.string().min(1, 'Item name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().optional().default(''),
    colour: z.string().optional().default(''),
    serialNumber: z.string().optional().default(''),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional().default(''),
    dateReceived: z.string().min(1, 'Date received is required'),
    expectedDate: z.string().optional().default(''),
    estimatedCost: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
    repairStatus: z.enum(['Received', 'Under Repair', 'Ready for Pickup', 'Completed']).optional().default('Received'),
    reportedProblem: z.string().optional().default(''),
    distinctiveMarks: z.string().optional().default(''),
    notes: z.string().optional().default(''),
    photos: z.array(z.any()).optional().default([]),
    verificationComplete: z.boolean().optional().default(false)
  })
};

export const updateRepairSchema = {
  body: z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    colour: z.string().optional(),
    serialNumber: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    expectedDate: z.string().optional(),
    estimatedCost: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0).optional(),
    reportedProblem: z.string().optional(),
    distinctiveMarks: z.string().optional(),
    notes: z.string().optional(),
    photos: z.array(z.any()).optional()
  })
};

export const updateRepairStatusSchema = {
  body: z.object({
    status: z.enum(['Received', 'Under Repair', 'Ready for Pickup', 'Completed']),
    note: z.string().optional().default('')
  })
};
