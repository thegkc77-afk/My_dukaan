import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';

let app;
let ownerToken;
let staffToken;
let shopId;
let createdRepairId;
let createdSalesId;

beforeAll(async () => {
  await connectDB();
  app = createApp();

  // Login as owner to obtain token
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'owner@dukkan.com', password: '123456' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  ownerToken = res.body.data.token;
  shopId = res.body.data.shop.id;

  // Login as staff
  const staffRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'vikram@dukkan.com', password: '123456' });

  expect(staffRes.status).toBe(200);
  staffToken = staffRes.body.data.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('1. Health Check API', () => {
  it('GET /api/health returns healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('2. Authentication & Authorization', () => {
  it('Rejects login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'owner@dukkan.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me returns current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('owner@dukkan.com');
  });

  it('Rejects unauthenticated request to protected endpoints', async () => {
    const res = await request(app).get('/api/v1/repairs');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('3. Repair Orders API', () => {
  it('POST /api/v1/repairs creates a repair order', async () => {
    const payload = {
      name: 'MRF Genius Cricket Bat - Test Item',
      category: 'Cricket Bat',
      brand: 'MRF',
      model: 'Genius Virat Kohli Edition',
      colour: 'Red / White',
      serialNumber: 'MRF-TEST-999',
      customerName: 'Test Customer',
      customerPhone: '9876543210',
      dateReceived: '2026-10-13',
      expectedDate: '2026-10-20',
      estimatedCost: 1500,
      repairStatus: 'Received',
      reportedProblem: 'Handle loose, cane binding cracked',
      distinctiveMarks: 'Special laser engraved mark on spine'
    };

    const res = await request(app)
      .post('/api/v1/repairs')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recordId).toMatch(/^RO-\d{4}-\d+/);
    createdRepairId = res.body.data.recordId;
  });

  it('GET /api/v1/repairs returns list including created order', async () => {
    const res = await request(app)
      .get('/api/v1/repairs')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    const found = res.body.data.items.find((item) => item.id === createdRepairId);
    expect(found).toBeDefined();
  });

  it('PATCH /api/v1/repairs/:id/status updates status with notes', async () => {
    const res = await request(app)
      .patch(`/api/v1/repairs/${createdRepairId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        status: 'Under Repair',
        note: 'Epoxy resin applied to handle'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.repairStatus).toBe('Under Repair');
  });

  it('Rejects setting repair status to Completed directly without handover', async () => {
    const res = await request(app)
      .patch(`/api/v1/repairs/${createdRepairId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        status: 'Completed',
        note: 'Attempting direct complete'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('4. Tagless Item Search API', () => {
  it('GET /api/v1/items/search matches by distinctive marks and ranks accurately', async () => {
    const res = await request(app)
      .get('/api/v1/items/search?q=laser+engraved')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdRepairId);
    expect(res.body.data[0].matchReasons).toContain('Distinctive marks match');
  });
});

describe('5. Sales and Warranty API', () => {
  it('POST /api/v1/sales registers product and calculates expiry date', async () => {
    const payload = {
      productName: 'Yonex Arcsaber 11 Pro Racket',
      category: 'Badminton Racket',
      brand: 'Yonex',
      model: 'Arcsaber 11 Pro',
      serialNumber: 'YN-ARC11-888',
      customerName: 'Anand Kumar',
      customerPhone: '9845011122',
      purchaseDate: '2026-06-01',
      purchasePrice: 18000,
      warrantyDuration: '1 Year',
      warrantyTerms: 'Covers frame crack without clash marks'
    };

    const res = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recordId).toMatch(/^SL-\d{4}-\d+/);
    expect(res.body.data.warrantyExpiryDate).toBe('2027-06-01');
    createdSalesId = res.body.data.recordId;
  });

  it('GET /api/v1/warranty/lookup finds sale by serial number', async () => {
    const res = await request(app)
      .get('/api/v1/warranty/lookup?serial=YN-ARC11-888')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdSalesId);
    expect(res.body.data[0].warrantyDetails.isActive).toBe(true);
  });
});

describe('6. Warranty Claims API', () => {
  it('POST /api/v1/warranty-claims registers claim for existing sale', async () => {
    const payload = {
      salesRecordId: createdSalesId,
      productName: 'Yonex Arcsaber 11 Pro Racket',
      brand: 'Yonex',
      model: 'Arcsaber 11 Pro',
      customerName: 'Anand Kumar',
      customerPhone: '9845011122',
      claimDate: '2026-10-13',
      defectReported: 'Hairline frame crack at 2 o clock position',
      damageDescription: 'Crack appeared during regular stringing tension',
      claimStatus: 'Pending Verification'
    };

    const res = await request(app)
      .post('/api/v1/warranty-claims')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recordId).toMatch(/^CLM-\d{4}-\d+/);
    expect(res.body.data.history.length).toBe(1);
  });

  it('Rejects claim for non-existent sales record', async () => {
    const payload = {
      salesRecordId: 'SL-NON-EXISTENT',
      productName: 'Unknown Product',
      customerName: 'Fraud User',
      claimDate: '2026-10-13',
      defectReported: 'Broken'
    };

    const res = await request(app)
      .post('/api/v1/warranty-claims')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('7. Handover and Atomic Repair Completion', () => {
  it('POST /api/v1/handovers creates handover and marks repair Completed atomically', async () => {
    // 1. Move test repair order to Ready for Pickup
    await request(app)
      .patch(`/api/v1/repairs/${createdRepairId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'Ready for Pickup', note: 'Restoration complete' });

    // 2. Perform handover
    const payload = {
      orderId: createdRepairId,
      itemName: 'MRF Genius Cricket Bat - Test Item',
      customerName: 'Test Customer',
      customerPhone: '9876543210',
      verificationMethod: 'Laser engraving match and photo verification',
      verificationChecklist: {
        visualMatch: true,
        photoMatch: true
      },
      notes: 'Customer inspected cane handle and verified laser mark'
    };

    const res = await request(app)
      .post('/api/v1/handovers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.handover.recordId).toMatch(/^HND-\d{4}-\d+/);
    expect(res.body.data.repairOrder.repairStatus).toBe('Completed');
    expect(res.body.data.repairOrder.verificationComplete).toBe(true);
  });

  it('Prevents duplicate handover for the same repair order', async () => {
    const payload = {
      orderId: createdRepairId,
      itemName: 'MRF Genius Cricket Bat - Test Item',
      customerName: 'Test Customer',
      verificationMethod: 'Repeat handover attempt'
    };

    const res = await request(app)
      .post('/api/v1/handovers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('8. Dashboard Summary API', () => {
  it('GET /api/v1/dashboard/summary calculates correct counts from DB', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRepairs).toBeGreaterThan(0);
    expect(res.body.data.totalHandovers).toBeGreaterThan(0);
  });
});
