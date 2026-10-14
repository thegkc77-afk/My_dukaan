import { z } from 'zod';

export const createClaimSchema = {
  body: z.object({
    id: z.string().optional(),
    salesRecordId: z.string().min(1, 'Sales record ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    brand: z.string().optional().default(''),
    model: z.string().optional().default(''),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional().default(''),
    claimDate: z.string().min(1, 'Claim date is required'),
    defectReported: z.string().min(1, 'Defect description is required'),
    damageDescription: z.string().optional().default(''),
    shopNotes: z.string().optional().default(''),
    damagePhotos: z.array(z.any()).optional().default([]),
    verificationStatus: z.string().optional().default('Pending Inspection'),
    claimStatus: z.enum([
      'Pending Verification',
      'Under Review',
      'Eligible',
      'Rejected',
      'Repair in Progress',
      'Replacement Approved',
      'Resolved'
    ]).optional().default('Pending Verification')
  })
};

export const updateClaimStatusSchema = {
  body: z.object({
    status: z.enum([
      'Pending Verification',
      'Under Review',
      'Eligible',
      'Rejected',
      'Repair in Progress',
      'Replacement Approved',
      'Resolved'
    ]),
    staff: z.string().optional(),
    note: z.string().optional().default('')
  })
};
