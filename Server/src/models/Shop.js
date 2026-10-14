import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    currency: {
      type: String,
      default: '₹'
    },
    tagline: {
      type: String,
      default: 'Tagless Digital Item Identity & Warranty Verification'
    },
    categories: {
      type: [String],
      default: [
        'Cricket Bat',
        'Badminton Racket',
        'Football / Volleyball',
        'Sports Shoes',
        'Kit Bag / Gear',
        'Tennis Racket',
        'Other'
      ]
    },
    warrantyDurations: {
      type: [String],
      default: [
        '3 Months',
        '6 Months',
        '1 Year',
        '2 Years',
        'None'
      ]
    },
    staffMembers: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Shop = mongoose.model('Shop', shopSchema);
