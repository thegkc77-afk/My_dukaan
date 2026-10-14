import { z } from 'zod';

export const createHandoverSchema = {
  body: z.object({
    id: z.string().optional(),
    orderId: z.string().min(1, 'Repair order ID is required'),
    repairOrderId: z.string().optional(),
    itemName: z.string().min(1, 'Item name is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional().default(''),
    itemPhoto: z.string().optional().default(''),
    verificationMethod: z.string().min(1, 'Verification method is required'),
    verificationChecklist: z.any().optional().default({}),
    staffMember: z.string().optional().default('Staff'),
    notes: z.string().optional().default('')
  })
};
