import mongoose from 'mongoose';

const warrantyClaimSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      trim: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true
    },
    salesRecordId: {
      type: String,
      required: true,
      trim: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    claimDate: {
      type: String,
      required: true
    },
    defectReported: {
      type: String,
      required: true,
      trim: true
    },
    damageDescription: {
      type: String,
      default: ''
    },
    shopNotes: {
      type: String,
      default: ''
    },
    damagePhotos: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    verificationStatus: {
      type: String,
      default: 'Pending Inspection'
    },
    claimStatus: {
      type: String,
      enum: [
        'Pending Verification',
        'Under Review',
        'Eligible',
        'Rejected',
        'Repair in Progress',
        'Replacement Approved',
        'Resolved'
      ],
      default: 'Pending Verification'
    },
    history: [
      {
        date: { type: String, required: true },
        status: { type: String, required: true },
        staff: { type: String, required: true },
        note: { type: String, default: '' }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

warrantyClaimSchema.index({ shopId: 1, recordId: 1 }, { unique: true });
warrantyClaimSchema.index({ shopId: 1, salesRecordId: 1 });
warrantyClaimSchema.index({ shopId: 1, claimStatus: 1 });
warrantyClaimSchema.index({ shopId: 1, claimDate: -1 });

warrantyClaimSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj.recordId;
  return obj;
};

export const WarrantyClaim = mongoose.model('WarrantyClaim', warrantyClaimSchema);
