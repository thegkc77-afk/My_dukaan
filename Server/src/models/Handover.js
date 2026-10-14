import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema(
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
    repairOrderId: {
      type: String,
      required: true,
      trim: true
    },
    itemName: {
      type: String,
      required: true,
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
    itemPhoto: {
      type: String,
      default: ''
    },
    verificationMethod: {
      type: String,
      required: true,
      trim: true
    },
    verificationChecklist: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    staffMember: {
      type: String,
      required: true,
      trim: true
    },
    handoverDate: {
      type: String,
      required: true
    },
    handoverStatus: {
      type: String,
      enum: ['Completed'],
      default: 'Completed'
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

handoverSchema.index({ shopId: 1, recordId: 1 }, { unique: true });
// Unique constraint on shopId + repairOrderId ensures no duplicate handovers for the same repair order
handoverSchema.index({ shopId: 1, repairOrderId: 1 }, { unique: true });
handoverSchema.index({ shopId: 1, createdAt: -1 });

handoverSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj.recordId;
  obj.orderId = obj.repairOrderId;
  return obj;
};

export const Handover = mongoose.model('Handover', handoverSchema);
