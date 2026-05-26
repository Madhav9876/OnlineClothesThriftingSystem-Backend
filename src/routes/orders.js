import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { estimateDelivery } from '../services/deliveryEstimates.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, orderDto } from '../utils/mode.js';

export const orderRouter = express.Router();

orderRouter.get('/mine', requireAuth, async (req, res) => {
  if (isMongoReady()) {
    const filter = req.user.role === 'seller' ? { seller: req.user.id } : { buyer: req.user.id };
    const orders = await Order.find(filter)
      .populate('product')
      .populate('buyer', 'name email location phone')
      .populate('seller', 'name email location phone')
      .sort({ createdAt: -1 });
    return res.json(orders.map((order) => withOrderEstimate(order)));
  }

  const orders = memory.orders
    .filter((order) => (req.user.role === 'seller' ? order.seller === req.user.id : order.buyer === req.user.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(orders.map((order) => withOrderEstimate(order)));
});

function withOrderEstimate(order) {
  const dto = orderDto(order);
  const deliveryEstimate = estimateDelivery({
    sellerLocation: order.seller?.location || '',
    buyerLocation: order.deliveryAddress || order.buyer?.location || ''
  });
  const subtotal = dto.subtotal ?? Number(dto.product?.price || 0) * Number(dto.quantity || 1);
  const deliveryCharge = Number(deliveryEstimate.estimatedCost || 0);
  const serviceCharge = dto.serviceCharge ?? (dto.paymentMethod === 'Cash on Delivery' ? 10 : 0);

  return {
    ...dto,
    subtotal,
    deliveryCharge,
    serviceCharge,
    total: subtotal + deliveryCharge + serviceCharge,
    deliveryEstimate
  };
}

orderRouter.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can place orders' });
  }

  const { productId, deliveryAddress, paymentMethod } = req.body;
  const paymentDetails = req.body.paymentDetails || {};
  const quantity = Math.max(1, Number(req.body.quantity || 1));
  const allowedPayments = ['eSewa', 'Khalti', 'Cash on Delivery', 'Bank Transfer'];

  if (!deliveryAddress?.trim()) {
    return res.status(400).json({ message: 'Delivery address is required' });
  }

  if (!allowedPayments.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Please choose a valid payment method' });
  }

  if (paymentMethod === 'eSewa') {
    const allowedEsewaIds = (process.env.ESEWA_TEST_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const isValidEsewaId = allowedEsewaIds.includes(String(paymentDetails.walletId || '').trim());
    const isValidEsewaPassword = paymentDetails.password === process.env.ESEWA_TEST_PASSWORD;
    const isValidEsewaMpin = paymentDetails.mpin === process.env.ESEWA_TEST_MPIN;
    const isValidEsewaToken = paymentDetails.token === process.env.ESEWA_TEST_TOKEN;

    if (!paymentDetails.walletId || !paymentDetails.password || !paymentDetails.mpin || !paymentDetails.token) {
      return res.status(400).json({ message: 'eSewa ID, password, MPIN and token are required' });
    }

    if (!isValidEsewaId || !isValidEsewaPassword || !isValidEsewaMpin || !isValidEsewaToken) {
      return res.status(400).json({ message: 'Invalid eSewa test credentials' });
    }
  }

  if (paymentMethod === 'Khalti' && (!paymentDetails.walletId || !paymentDetails.password)) {
    return res.status(400).json({ message: 'Khalti ID and password are required' });
  }

  if (
    paymentMethod === 'Bank Transfer' &&
    (!paymentDetails.bankName || !paymentDetails.accountName || !paymentDetails.accountNumber)
  ) {
    return res.status(400).json({ message: 'Bank name, account name and account number are required' });
  }

  const savedPaymentDetails = {
    walletId: paymentDetails.walletId || '',
    bankName: paymentDetails.bankName || '',
    accountName: paymentDetails.accountName || '',
    accountNumber: paymentDetails.accountNumber || '',
    branch: paymentDetails.branch || ''
  };

  if (isMongoReady()) {
    const product = await Product.findById(productId).populate('seller', 'location');
    if (!product || product.status !== 'available' || Number(product.quantity || 0) < quantity) {
      return res.status(404).json({ message: 'Product is not available' });
    }

    const deliveryEstimate = estimateDelivery({
      sellerLocation: product.seller?.location || '',
      buyerLocation: deliveryAddress || req.user.location
    });
    const subtotal = Number(product.price || 0) * quantity;
    const deliveryCharge = Number(deliveryEstimate.estimatedCost || 0);
    const serviceCharge = paymentMethod === 'Cash on Delivery' ? 10 : 0;

    const order = await Order.create({
      buyer: req.user.id,
      seller: product.seller._id || product.seller,
      product: product._id,
      quantity,
      subtotal,
      deliveryCharge,
      serviceCharge,
      total: subtotal + deliveryCharge + serviceCharge,
      paymentMethod,
      paymentDetails: savedPaymentDetails,
      deliveryAddress,
      deliveryEstimate
    });

    product.quantity = Math.max(0, Number(product.quantity || 0) - quantity);
    product.status = product.quantity > 0 ? 'available' : 'reserved';
    await product.save();

    const populated = await order.populate(['product', 'buyer', 'seller']);
    return res.status(201).json(withOrderEstimate(populated));
  }

  const product = memory.products.find((item) => item._id === productId && item.status === 'available');
  if (!product || Number(product.quantity || 0) < quantity) return res.status(404).json({ message: 'Product is not available' });

  const deliveryEstimate = estimateDelivery({
    sellerLocation: product.sellerLocation || '',
    buyerLocation: deliveryAddress || req.user.location
  });
  const subtotal = Number(product.price || 0) * quantity;
  const deliveryCharge = Number(deliveryEstimate.estimatedCost || 0);
  const serviceCharge = paymentMethod === 'Cash on Delivery' ? 10 : 0;

  product.quantity = Math.max(0, Number(product.quantity || 0) - quantity);
  product.status = product.quantity > 0 ? 'available' : 'reserved';
  const order = {
    _id: `order-${Date.now()}`,
    buyer: req.user.id,
    buyerName: req.user.name,
    seller: product.seller,
    sellerName: product.sellerName,
    product,
    quantity,
    subtotal,
    deliveryCharge,
    serviceCharge,
    total: subtotal + deliveryCharge + serviceCharge,
    paymentMethod,
    paymentDetails: savedPaymentDetails,
    deliveryAddress,
    deliveryEstimate,
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  memory.orders.push(order);
  return res.status(201).json(withOrderEstimate(order));
});

orderRouter.patch('/:id/cancel', requireAuth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can cancel orders' });
  }

  if (isMongoReady()) {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id })
      .populate('product')
      .populate('buyer', 'name email location phone')
      .populate('seller', 'name email location phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'delivered') return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
    if (order.status === 'cancelled') return res.json(withOrderEstimate(order));

    if (order.product) {
      order.product.quantity = Math.max(0, Number(order.product.quantity || 0)) + Number(order.quantity || 1);
      order.product.status = 'available';
      await order.product.save();
    }

    order.status = 'cancelled';
    await order.save();
    return res.json(withOrderEstimate(order));
  }

  const order = memory.orders.find((item) => item._id === req.params.id && item.buyer === req.user.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'delivered') return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
  if (order.status === 'cancelled') return res.json(withOrderEstimate(order));

  const productId = order.product?._id || order.product;
  const product = memory.products.find((item) => item._id === productId);
  if (product) {
    product.quantity = Math.max(0, Number(product.quantity || 0)) + Number(order.quantity || 1);
    product.status = 'available';
  } else if (order.product && typeof order.product === 'object') {
    order.product.quantity = Math.max(0, Number(order.product.quantity || 0)) + Number(order.quantity || 1);
    order.product.status = 'available';
  }

  order.status = 'cancelled';
  return res.json(withOrderEstimate(order));
});

orderRouter.patch('/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can update order status' });
  }

  const { status } = req.body;
  const allowed = ['placed', 'in-progress', 'out-for-delivery', 'delivered'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid order status' });

  if (isMongoReady()) {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      { status },
      { new: true }
    ).populate(['product', 'buyer', 'seller']);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(withOrderEstimate(order));
  }

  const order = memory.orders.find((item) => item._id === req.params.id && item.seller === req.user.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status;
  return res.json(withOrderEstimate(order));
});
