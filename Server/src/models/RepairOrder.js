import mongoose from 'mongoose';

const repairOrderSchema = new mongoose.Schema(
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
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    colour: {
      type: String,
      trim: true
    },
    serialNumber: {
      type: String,
      trim: true
    },
    reportedProblem: {
      type: String,
      trim: true
    },
    distinctiveMarks: {
      type: String,
      trim: true
    },
    photos: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    dateReceived: {
      type: String,
      required: true
    },
    expectedDate: {
      type: String
    },
    estimatedCost: {
      type: Number,
      default: 0
    },
    repairStatus: {
      type: String,
      enum: ['Received', 'Under Repair', 'Ready for Pickup', 'Completed'],
      default: 'Received'
    },
    notes: {
      type: String,
      default: ''
    },
    verificationComplete: {
      type: Boolean,
      default: false
    },
    verificationHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    handoverId: {
      type: String,
      trim: true
    },
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

// Indexes
repairOrderSchema.index({ shopId: 1, recordId: 1 }, { unique: true });
repairOrderSchema.index({ shopId: 1, repairStatus: 1 });
repairOrderSchema.index({ shopId: 1, dateReceived: -1 });
repairOrderSchema.index({ shopId: 1, brand: 1 });
repairOrderSchema.index({ shopId: 1, serialNumber: 1 });
repairOrderSchema.index({ shopId: 1, customerName: 1 });

// Helper to provide both recordId and id
repairOrderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj.recordId;
  return obj;
};

export const RepairOrder = mongoose.model('RepairOrder', repairOrderSchema);
