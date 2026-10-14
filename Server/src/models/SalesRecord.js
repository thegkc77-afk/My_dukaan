import mongoose from 'mongoose';

const salesRecordSchema = new mongoose.Schema(
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
    productName: {
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
    serialNumber: {
      type: String,
      trim: true
    },
    photos: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
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
    purchaseDate: {
      type: String,
      required: true
    },
    purchasePrice: {
      type: Number,
      required: true
    },
    warrantyDuration: {
      type: String,
      required: true
    },
    warrantyExpiryDate: {
      type: String
    },
    warrantyTerms: {
      type: String,
      default: ''
    },
    warrantyStatus: {
      type: String,
      default: 'Active'
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

salesRecordSchema.index({ shopId: 1, recordId: 1 }, { unique: true });
salesRecordSchema.index({ shopId: 1, serialNumber: 1 });
salesRecordSchema.index({ shopId: 1, purchaseDate: -1 });
salesRecordSchema.index({ shopId: 1, customerName: 1 });
salesRecordSchema.index({ shopId: 1, brand: 1 });

salesRecordSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj.recordId;
  return obj;
};

export const SalesRecord = mongoose.model('SalesRecord', salesRecordSchema);
