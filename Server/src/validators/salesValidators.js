import { z } from 'zod';

export const createSaleSchema = {
  body: z.object({
    id: z.string().optional(),
    productName: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().optional().default(''),
    serialNumber: z.string().optional().default(''),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional().default(''),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    purchasePrice: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
    warrantyDuration: z.string().min(1, 'Warranty duration is required'),
    warrantyTerms: z.string().optional().default(''),
    notes: z.string().optional().default(''),
    photos: z.array(z.any()).optional().default([])
  })
};

export const updateSaleSchema = {
  body: z.object({
    productName: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    purchaseDate: z.string().optional(),
    purchasePrice: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0).optional(),
    warrantyDuration: z.string().optional(),
    warrantyTerms: z.string().optional(),
    notes: z.string().optional(),
    photos: z.array(z.any()).optional()
  })
};
