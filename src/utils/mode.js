import mongoose from 'mongoose';

export const isMongoReady = () => mongoose.connection.readyState === 1;

export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    phone: user.phone
  };
}

export function productDto(product) {
  const raw = product.toObject ? product.toObject() : product;
  return {
    ...raw,
    id: String(raw._id),
    seller: String(raw.seller?._id || raw.seller),
    sellerName: raw.seller?.name || raw.sellerName || 'Purana Seller'
  };
}

export function orderDto(order) {
  const raw = order.toObject ? order.toObject() : order;
  const product = raw.product?.title ? productDto(raw.product) : raw.product;
  return {
    ...raw,
    id: String(raw._id),
    buyer: String(raw.buyer?._id || raw.buyer),
    buyerName: raw.buyer?.name || raw.buyerName || 'Buyer',
    seller: String(raw.seller?._id || raw.seller),
    sellerName: raw.seller?.name || raw.sellerName || 'Seller',
    product
  };
}
