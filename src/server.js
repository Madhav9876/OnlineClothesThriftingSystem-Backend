import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { orderRouter } from './routes/orders.js';
import { productRouter } from './routes/products.js';
import { seedMemoryStore } from './store/memoryStore.js';
import { seedMongoStore } from './store/seedMongo.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const port = process.env.PORT || 5000;
const defaultClientOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://onlineclothesthrifting.vercel.app'
];
const configuredClientOrigins = [process.env.CLIENT_ORIGIN, process.env.CLIENT_ORIGINS]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedClientOrigins = new Set([...defaultClientOrigins, ...configuredClientOrigins]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedClientOrigins.has(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'mongo' : 'memory' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.use(
  express.static(clientDist, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store');
    }
  })
);
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function start() {
  seedMemoryStore();

  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      await seedMongoStore();
      console.log('MongoDB connected');
    } catch (error) {
      console.warn('MongoDB unavailable, using in-memory demo data:', error.message);
    }
  } else {
    console.warn('MONGO_URI not set, using in-memory demo data');
  }

  app.listen(port, () => {
    console.log(`Purana API running on http://localhost:${port}`);
  });
}

start();
