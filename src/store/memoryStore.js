import bcrypt from 'bcryptjs';

export const memory = {
  users: [],
  products: [],
  orders: []
};

export const usingMongo = () => Boolean(process.env.MONGO_URI && global.mongooseConnected);

export function seedMemoryStore() {
  if (memory.users.length) return;

  const buyerId = 'buyer-demo';
  const sellerId = 'seller-demo';

  memory.users.push(
    {
      _id: buyerId,
      name: 'Aarya Buyer',
      email: 'buyer@purana.com',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'buyer',
      location: 'Lalitpur, Nepal',
      phone: '9800000001'
    },
    {
      _id: sellerId,
      name: 'Maya Seller',
      email: 'seller@purana.com',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'seller',
      location: 'Pokhara, Nepal',
      phone: '9800000002'
    }
  );

  memory.products.push(
    {
      _id: 'prod-1',
      seller: sellerId,
      sellerName: 'Maya Seller',
      title: 'Vintage Denim Jacket',
      brand: 'Levis',
      type: 'Jacket',
      size: 'M',
      color: 'Blue',
      price: 1850,
      condition: 'Gently used',
      description: 'Structured denim jacket, ideal for Kathmandu evenings.',
      imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80',
      status: 'available',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'prod-2',
      seller: sellerId,
      sellerName: 'Maya Seller',
      title: 'Linen Summer Shirt',
      brand: 'Uniqlo',
      type: 'Shirt',
      size: 'L',
      color: 'Green',
      price: 950,
      condition: 'Like new',
      description: 'Breathable linen shirt for warm Terai days.',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
      status: 'available',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'prod-3',
      seller: sellerId,
      sellerName: 'Maya Seller',
      title: 'Wool Blend Sweater',
      brand: 'H&M',
      type: 'Sweater',
      size: 'S',
      color: 'Cream',
      price: 1250,
      condition: 'Good',
      description: 'Soft neutral sweater with light wear.',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
      status: 'available',
      createdAt: new Date().toISOString()
    }
  );

  memory.orders.push({
    _id: 'order-1',
    buyer: buyerId,
    buyerName: 'Aarya Buyer',
    seller: sellerId,
    sellerName: 'Maya Seller',
    product: memory.products[2],
    quantity: 1,
    total: 1250,
    paymentMethod: 'Cash on Delivery',
    paymentDetails: {},
    deliveryAddress: 'Jawalakhel, Lalitpur',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  });
}
