import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { isMongoReady, orderDto, productDto, publicUser } from '../utils/mode.js';

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/summary', async (_req, res) => {
  if (!isMongoReady()) {
    return res.json({ users: [], products: [], orders: [] });
  }

  const [users, products, orders] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }),
    Product.find({}).populate('seller', 'name location').sort({ createdAt: -1 }),
    Order.find({}).populate('product').populate('buyer', 'name email location phone').populate('seller', 'name email location phone').sort({ createdAt: -1 })
  ]);

  return res.json({
    users: users.map(publicUser),
    products: products.map(productDto),
    orders: orders.map(orderDto)
  });
});

adminRouter.delete('/users/:id', async (req, res) => {
  if (!isMongoReady()) return res.status(400).json({ message: 'MongoDB is required for admin user removal' });
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'Admin cannot remove their own account' });

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await Product.deleteMany({ seller: req.params.id });
  return res.json({ id: req.params.id, message: 'User and their listings removed' });
});
