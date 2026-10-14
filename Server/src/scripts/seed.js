import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/database.js';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { SalesRecord } from '../models/SalesRecord.js';
import { WarrantyClaim } from '../models/WarrantyClaim.js';
import { Handover } from '../models/Handover.js';
import { AuditLog } from '../models/AuditLog.js';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing demo data...');
    await Promise.all([
      Shop.deleteMany({}),
      User.deleteMany({}),
      RepairOrder.deleteMany({}),
      SalesRecord.deleteMany({}),
      WarrantyClaim.deleteMany({}),
      Handover.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed] Creating demo shop...');
    const shop = await Shop.create({
      name: 'Dukkan Sports & Repair Hub',
      tagline: 'Tagless Digital Item Identity & Warranty Verification',
      ownerName: 'Ramesh Kumar',
      phone: '+91 98450 88221',
      address: 'Shop #14, Brigade Stadium Arcade, Bengaluru, Karnataka 560025',
      city: 'Bengaluru',
      currency: '₹',
      staffMembers: [
        'Ramesh Kumar (Owner)',
        'Suresh Sharma (Head Technician)',
        'Vikram Patel (Front Desk)'
      ],
      categories: [
        'Cricket Bat',
        'Badminton Racket',
        'Football / Volleyball',
        'Sports Shoes',
        'Kit Bag / Gear',
        'Tennis Racket',
        'Other'
      ],
      warrantyDurations: [
        '3 Months',
        '6 Months',
        '1 Year',
        '2 Years',
        'None'
      ]
    });

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const ownerPasswordHash = await bcrypt.hash('123456', salt);
    const staffPasswordHash = await bcrypt.hash('123456', salt);

    const ownerUser = await User.create({
      name: 'Ramesh Kumar (Owner)',
      email: 'owner@dukkan.com',
      passwordHash: ownerPasswordHash,
      role: 'owner',
      phone: '+91 98450 88221',
      shopId: shop._id,
      isActive: true
    });

    const technicianUser = await User.create({
      name: 'Suresh Sharma (Head Technician)',
      email: 'suresh@dukkan.com',
      passwordHash: staffPasswordHash,
      role: 'manager',
      phone: '+91 98450 33445',
      shopId: shop._id,
      isActive: true
    });

    const frontDeskUser = await User.create({
      name: 'Vikram Patel (Front Desk)',
      email: 'vikram@dukkan.com',
      passwordHash: staffPasswordHash,
      role: 'staff',
      phone: '+91 98450 66778',
      shopId: shop._id,
      isActive: true
    });

    console.log('[Seed] Seeding Repair Orders...');
    const repairOrders = [
      {
        recordId: 'RO-2026-1042',
        shopId: shop._id,
        name: 'SG Sunny Tonny Classic Cricket Bat',
        category: 'Cricket Bat',
        brand: 'SG',
        model: 'Sunny Tonny Classic',
        colour: 'Natural Willow / Black & Yellow',
        serialNumber: 'SG-ENG-9821',
        customerName: 'Rahul Dravid',
        customerPhone: '9845012345',
        dateReceived: '2026-06-12',
        expectedDate: '2026-06-25',
        estimatedCost: 1250,
        repairStatus: 'Ready for Pickup',
        reportedProblem: 'Loose cane handle rattling, face pressing, toe guard re-binding',
        distinctiveMarks: 'Silver grip tape on shoulder, deep notch on back spine 4 inches from toe, stamped initials "RD" on wooden face, 8 straight grains',
        notes: 'Item left for comprehensive restoration. Handle epoxy cured, new rubber toe guard attached.',
        verificationComplete: false,
        createdBy: ownerUser._id
      },
      {
        recordId: 'RO-2026-1045',
        shopId: shop._id,
        name: 'SS Ton Reserve Edition Cricket Bat',
        category: 'Cricket Bat',
        brand: 'SS',
        model: 'Ton Reserve Edition',
        colour: 'Natural / Red Whip',
        serialNumber: '',
        customerName: 'Amit Patel',
        customerPhone: '9822098765',
        dateReceived: '2026-09-02',
        expectedDate: '2026-09-14',
        estimatedCost: 850,
        repairStatus: 'Under Repair',
        reportedProblem: 'Lower handle loose whipping thread unraveling, oiling and anti-scuff sheet application',
        distinctiveMarks: 'Bright red thread whipping on lower handle, small dent on outer left edge near sticker, no toe guard',
        notes: 'Whipping thread stripped, awaiting high-tensile nylon re-whipping.',
        verificationComplete: false,
        createdBy: frontDeskUser._id
      },
      {
        recordId: 'RO-2026-1048',
        shopId: shop._id,
        name: 'MRF Genius Grand Edition Bat',
        category: 'Cricket Bat',
        brand: 'MRF',
        model: 'Genius Grand Edition',
        colour: 'Red / Black Grip',
        serialNumber: 'MRF-VK-4401',
        customerName: 'Vikram Singh',
        customerPhone: '9711045612',
        dateReceived: '2026-10-01',
        expectedDate: '2026-10-10',
        estimatedCost: 1500,
        repairStatus: 'Ready for Pickup',
        reportedProblem: 'Crack along sweet spot grain after hard leather ball impact',
        distinctiveMarks: 'Wood glue residue from previous repair at sweet spot, black wave grip, 3 distinct knot spots on rear concaving',
        notes: 'Glued and clamped with industrial araldite, twin carbon dowel pins inserted.',
        verificationComplete: false,
        createdBy: technicianUser._id
      },
      {
        recordId: 'RO-2026-1051',
        shopId: shop._id,
        name: 'Yonex Nanoray 10F Badminton Racket',
        category: 'Badminton Racket',
        brand: 'Yonex',
        model: 'Nanoray 10F',
        colour: 'Blue / Black',
        serialNumber: 'YN-NR10F-340',
        customerName: 'Priya Nair',
        customerPhone: '9848077889',
        dateReceived: '2026-10-08',
        expectedDate: '2026-10-12',
        estimatedCost: 450,
        repairStatus: 'Completed',
        reportedProblem: 'Broken main string at 10 o\'clock grommet, replace grommet strip',
        distinctiveMarks: 'White overgrip worn at base showing wooden butt cap, scratch on inner frame at 12 o\'clock',
        notes: 'Restrung with BG65 at 24 lbs tension. Customer handed over.',
        verificationComplete: true,
        handoverId: 'HND-2026-0082',
        createdBy: technicianUser._id
      },
      {
        recordId: 'RO-2026-1054',
        shopId: shop._id,
        name: 'Nivia Storm Football (Size 5)',
        category: 'Football / Volleyball',
        brand: 'Nivia',
        model: 'Storm Hand Stitched',
        colour: 'White / Black',
        serialNumber: '',
        customerName: 'Rohit Sen',
        customerPhone: '9933012988',
        dateReceived: '2026-10-09',
        expectedDate: '2026-10-15',
        estimatedCost: 250,
        repairStatus: 'Under Repair',
        reportedProblem: 'Bladder air valve leakage, pressure drops in 2 hours',
        distinctiveMarks: 'Slight stitching fray between hex panel 4 and 5, green marker dot near inflation valve',
        notes: 'Bladder valve replaced, underwater air-tightness testing underway.',
        verificationComplete: false,
        createdBy: technicianUser._id
      },
      {
        recordId: 'RO-2026-1058',
        shopId: shop._id,
        name: 'Asics Gel-Rocket 10 Indoor Court Shoes',
        category: 'Sports Shoes',
        brand: 'Asics',
        model: 'Gel-Rocket 10 (Size UK 9)',
        colour: 'Deep Blue / White / Yellow Gum',
        serialNumber: 'AS-GEL-R10-9',
        customerName: 'Karthik Rao',
        customerPhone: '9620011443',
        dateReceived: '2026-10-11',
        expectedDate: '2026-10-16',
        estimatedCost: 600,
        repairStatus: 'Received',
        reportedProblem: 'Heel cushion debonding on right shoe, front toe bumper coming unglued',
        distinctiveMarks: 'Yellow non-marking gum sole, slight scuff mark on inside arch of right shoe, custom green laces',
        notes: 'Queued for heat press vulcanization adhesive.',
        verificationComplete: false,
        createdBy: frontDeskUser._id
      }
    ];
    await RepairOrder.insertMany(repairOrders);

    console.log('[Seed] Seeding Sales Records...');
    const salesRecords = [
      {
        recordId: 'SL-2026-0815',
        shopId: shop._id,
        productName: 'SG Sunny Tonny Classic English Willow Cricket Bat',
        category: 'Cricket Bat',
        brand: 'SG',
        model: 'Sunny Tonny Classic',
        serialNumber: 'SG-ENG-9821',
        customerName: 'Rahul Dravid',
        customerPhone: '9845012345',
        purchaseDate: '2026-05-15',
        purchasePrice: 14500,
        warrantyDuration: '6 Months',
        warrantyExpiryDate: '2026-11-15',
        warrantyTerms: 'Covers handle breakage and willow split under leather ball play. Excludes moisture damage and tape alteration.',
        warrantyStatus: 'Active',
        notes: 'Registered with authentic factory laser hologram SG-ENG-9821.',
        createdBy: ownerUser._id
      },
      {
        recordId: 'SL-2026-0792',
        shopId: shop._id,
        productName: 'Kookaburra Kahuna Pro English Willow Bat',
        category: 'Cricket Bat',
        brand: 'Kookaburra',
        model: 'Kahuna Pro Edition',
        serialNumber: 'KB-KAH-4120',
        customerName: 'Sanjay Manjrekar',
        customerPhone: '9811055443',
        purchaseDate: '2026-03-10',
        purchasePrice: 22000,
        warrantyDuration: '6 Months',
        warrantyExpiryDate: '2026-09-10',
        warrantyTerms: 'Full handle replacement warranty for 6 months. Edge cracks subject to shopkeeper inspection.',
        warrantyStatus: 'Expired',
        notes: 'Purchased with premium bat cover and knocking service.',
        createdBy: frontDeskUser._id
      },
      {
        recordId: 'SL-2026-0830',
        shopId: shop._id,
        productName: 'Yonex Astrox 88D Pro Badminton Racket',
        category: 'Badminton Racket',
        brand: 'Yonex',
        model: 'Astrox 88D Pro',
        serialNumber: 'YN-AX88D-998',
        customerName: 'Pooja Verma',
        customerPhone: '9740033221',
        purchaseDate: '2026-07-20',
        purchasePrice: 16500,
        warrantyDuration: '1 Year',
        warrantyExpiryDate: '2027-07-20',
        warrantyTerms: 'Covers frame cracking without clash marks under 28 lbs tension. Factory defect covered.',
        warrantyStatus: 'Active',
        notes: 'Strings set to Yonex BG80 Power.',
        createdBy: frontDeskUser._id
      },
      {
        recordId: 'SL-2026-0845',
        shopId: shop._id,
        productName: 'SS Ton Reserve Edition English Willow Bat',
        category: 'Cricket Bat',
        brand: 'SS',
        model: 'Ton Reserve Edition',
        serialNumber: '',
        customerName: 'Tanmay Bhatt',
        customerPhone: '9988011223',
        purchaseDate: '2026-08-05',
        purchasePrice: 18500,
        warrantyDuration: '6 Months',
        warrantyExpiryDate: '2027-02-05',
        warrantyTerms: 'Handle and sweet spot break replacement coverage within 180 days.',
        warrantyStatus: 'Claim Under Review',
        notes: 'Sold without serial code; identified by wood grain pattern and red whip handle.',
        createdBy: ownerUser._id
      }
    ];
    await SalesRecord.insertMany(salesRecords);

    console.log('[Seed] Seeding Warranty Claims...');
    const warrantyClaims = [
      {
        recordId: 'CLM-2026-0034',
        shopId: shop._id,
        salesRecordId: 'SL-2026-0845',
        productName: 'SS Ton Reserve Edition English Willow Bat',
        brand: 'SS',
        model: 'Ton Reserve Edition',
        customerName: 'Tanmay Bhatt',
        customerPhone: '9988011223',
        claimDate: '2026-10-05',
        defectReported: 'Major horizontal crack on face 2 inches above the toe',
        damageDescription: 'Customer was playing club leather ball match when the lower willow split horizontally across 3 grains upon hitting a yorker.',
        verificationStatus: 'Inspected - Active Warranty Period',
        claimStatus: 'Under Review',
        shopNotes: 'Warranty is active until Feb 2027. Willow inspected; impact marks confirm standard cricket leather ball. Crack is on sweet spot boundary.',
        history: [
          { date: '2026-10-05 11:30', status: 'Pending Verification', staff: 'Ramesh Kumar', note: 'Customer brought bat without bill. Retrieved sales record SL-2026-0845 via grain characteristics.' },
          { date: '2026-10-06 14:00', status: 'Under Review', staff: 'Suresh Sharma', note: 'Shopkeeper inspection confirms defect falls under handle/face clause. Sent photo to SS distributor rep.' }
        ],
        createdBy: ownerUser._id
      },
      {
        recordId: 'CLM-2026-0028',
        shopId: shop._id,
        salesRecordId: 'SL-2026-0792',
        productName: 'Kookaburra Kahuna Pro English Willow Bat',
        brand: 'Kookaburra',
        model: 'Kahuna Pro Edition',
        customerName: 'Sanjay Manjrekar',
        customerPhone: '9811055443',
        claimDate: '2026-09-25',
        defectReported: 'Handle loose at top splice',
        damageDescription: 'Handle wobbles inside splice joint.',
        verificationStatus: 'Expired Warranty (Expired 15 days before claim)',
        claimStatus: 'Rejected',
        shopNotes: 'Purchase date 10 Mar 2026 with 6 months warranty expired on 10 Sep 2026. Advised standard paid repair service instead.',
        history: [
          { date: '2026-09-25 16:15', status: 'Pending Verification', staff: 'Vikram Patel', note: 'Claim created. Bill missing, verified by Kookaburra serial KB-KAH-4120.' },
          { date: '2026-09-26 10:00', status: 'Rejected', staff: 'Ramesh Kumar', note: 'Claim rejected due to expiry. Offered paid repair at 20% goodwill discount.' }
        ],
        createdBy: frontDeskUser._id
      }
    ];
    await WarrantyClaim.insertMany(warrantyClaims);

    console.log('[Seed] Seeding Handovers...');
    const handovers = [
      {
        recordId: 'HND-2026-0082',
        shopId: shop._id,
        repairOrderId: 'RO-2026-1051',
        itemName: 'Yonex Nanoray 10F Badminton Racket',
        customerName: 'Priya Nair',
        customerPhone: '9848077889',
        verificationMethod: 'Photo comparison & Frame scratch match',
        verificationChecklist: {
          visualInspection: true,
          photoMatch: true,
          customerSigned: true
        },
        staffMember: 'Suresh Sharma (Head Technician)',
        handoverDate: '2026-10-12 18:20',
        handoverStatus: 'Completed',
        notes: 'Customer verified restringing tension (24 lbs). Frame scratch at 12 o\'clock confirmed item identity.',
        createdBy: technicianUser._id
      }
    ];
    await Handover.insertMany(handovers);

    console.log('\n=============================================');
    console.log('✅ [Seed] Database successfully seeded!');
    console.log('Demo Shop:   ', shop.name);
    console.log('Owner Login:  email: owner@dukkan.com  pass: 123456');
    console.log('Staff Login:  email: suresh@dukkan.com pass: 123456');
    console.log('Front Desk:   email: vikram@dukkan.com pass: 123456');
    console.log('=============================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
