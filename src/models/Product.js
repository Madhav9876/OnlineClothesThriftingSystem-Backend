import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Unisex' },
    quantity: { type: Number, default: 1, min: 0 },
    price: { type: Number, required: true },
    condition: { type: String, default: 'Gently used' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
