import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { graphRecommendationsForBuyer } from '../services/productGraph.js';
import { recommendForBuyer } from '../services/recommendations.js';
import { systemGraphIntelligenceForBuyer } from '../services/systemGraphIntelligence.js';
import { estimateDelivery } from '../services/deliveryEstimates.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage });
export const productRouter = express.Router();

productRouter.get('/recommendations/mine', requireAuth, requireRole('buyer'), async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit || 6)));
  const recommendations = await recommendForBuyer(req.user.id, limit);
  return res.json(recommendations);
});

productRouter.get('/graph-recommendations/mine', requireAuth, requireRole('buyer'), async (req, res) => {
  const limit = Math.min(8, Math.max(1, Number(req.query.limit || 4)));
  const recommendations = await graphRecommendationsForBuyer(req.user.id, limit);
  return res.json(recommendations);
});

productRouter.get('/system-graph-intelligence/mine', requireAuth, requireRole('buyer'), async (req, res) => {
  const limit = Math.min(8, Math.max(1, Number(req.query.limit || 4)));
  const intelligence = await systemGraphIntelligenceForBuyer(req.user.id, limit);
  return res.json(intelligence);
});

productRouter.get('/', async (req, res) => {
  const { type, size, color, brand, gender, minPrice, maxPrice, seller } = req.query;
  const query = { status: 'available', quantity: { $gt: 0 } };

  if (type) query.type = type;
  if (size) query.size = size;
  if (color) query.color = color;
  if (gender) query.gender = gender;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (seller) query.seller = seller;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (isMongoReady()) {
    const products = await Product.find(query).populate('seller', 'name location').sort({ createdAt: -1 });
    const buyer = req.headers.authorization
      ? await resolveBuyerFromHeader(req.headers.authorization).catch(() => null)
      : null;
    return res.json(products.map((product) => withDeliveryEstimate(product, buyer)));
  }

  const products = memory.products
    .filter((product) => product.status === 'available')
    .filter((product) => Number(product.quantity || 0) > 0)
    .filter((product) => !type || product.type === type)
    .filter((product) => !size || product.size === size)
    .filter((product) => !color || product.color === color)
    .filter((product) => !gender || product.gender === gender)
    .filter((product) => !brand || product.brand.toLowerCase().includes(String(brand).toLowerCase()))
    .filter((product) => !seller || product.seller === seller)
    .filter((product) => !minPrice || product.price >= Number(minPrice))
    .filter((product) => !maxPrice || product.price <= Number(maxPrice))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json(products.map((product) => withDeliveryEstimate(product, null)));
});

async function resolveBuyerFromHeader(header) {
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { default: jwt } = await import('jsonwebtoken');
  const payload = jwt.verify(token, process.env.JWT_SECRET || 'purana-dev-secret');
  if (payload.role !== 'buyer') return null;
  return User.findById(payload.id).lean();
}

function withDeliveryEstimate(product, buyer) {
  const dto = productDto(product);
  if (!buyer) {
    return {
      ...dto,
      deliveryEstimate: estimateDelivery({
        sellerLocation: product.seller?.location || product.sellerLocation || '',
        buyerLocation: 'Kathmandu, Nepal'
      })
    };
  }

  return {
    ...dto,
    deliveryEstimate: estimateDelivery({
      sellerLocation: product.seller?.location || product.sellerLocation || '',
      buyerLocation: buyer.location
    })
  };
}

productRouter.get('/mine', requireAuth, requireRole('seller'), async (req, res) => {
  if (isMongoReady()) {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json(products.map(productDto));
  }

  return res.json(memory.products.filter((product) => product.seller === req.user.id).map(productDto));
});

productRouter.post('/', requireAuth, requireRole('seller'), upload.single('image'), async (req, res) => {
  const payload = {
    seller: req.user.id,
    title: req.body.title,
    brand: req.body.brand,
    type: req.body.type,
    size: req.body.size,
    color: req.body.color,
    gender: req.body.gender || 'Unisex',
    quantity: Math.max(1, Number(req.body.quantity || 1)),
    price: Number(req.body.price),
    condition: req.body.condition,
    description: req.body.description,
    imageUrl: req.file
      ? `/uploads/${path.basename(req.file.path)}`
      : req.body.imageUrl || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80'
  };

  if (isMongoReady()) {
    const product = await Product.create(payload);
    return res.status(201).json(productDto(product));
  }

  const product = {
    ...payload,
    _id: `prod-${Date.now()}`,
    sellerName: req.user.name,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  memory.products.push(product);
  return res.status(201).json(productDto(product));
});

productRouter.patch('/:id', requireAuth, requireRole('seller'), async (req, res) => {
  const description = String(req.body.description || '').trim();

  if (isMongoReady()) {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      { description },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Listing not found' });
    return res.json(productDto(product));
  }

  const product = memory.products.find((item) => item._id === req.params.id && item.seller === req.user.id);
  if (!product) return res.status(404).json({ message: 'Listing not found' });

  product.description = description;
  return res.json(productDto(product));
});

productRouter.delete('/:id', requireAuth, async (req, res) => {
  if (!['seller', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Seller or admin access required' });
  }

  if (isMongoReady()) {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, seller: req.user.id };
    const product = await Product.findOneAndDelete(filter);
    if (!product) return res.status(404).json({ message: 'Listing not found' });
    return res.json({ id: String(product._id), message: 'Listing removed' });
  }

  const index = memory.products.findIndex((product) => product._id === req.params.id && (req.user.role === 'admin' || product.seller === req.user.id));
  if (index === -1) return res.status(404).json({ message: 'Listing not found' });

  const [removed] = memory.products.splice(index, 1);
  return res.json({ id: String(removed._id), message: 'Listing removed' });
});
