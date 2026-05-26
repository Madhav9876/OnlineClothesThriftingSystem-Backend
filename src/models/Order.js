import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['eSewa', 'Khalti', 'Cash on Delivery', 'Bank Transfer'],
      default: 'Cash on Delivery'
    },
    paymentDetails: {
      walletId: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      branch: { type: String, default: '' }
    },
    deliveryAddress: { type: String, required: true },
    deliveryEstimate: {
      from: { type: String, default: '' },
      to: { type: String, default: '' },
      route: [{ type: String }],
      distanceKm: { type: Number, default: null },
      estimatedCost: { type: Number, default: null },
      estimatedDays: { type: String, default: '' },
      estimatedText: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['placed', 'in-progress', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'placed'
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
