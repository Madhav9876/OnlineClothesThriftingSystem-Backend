import bcrypt from 'bcryptjs';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export async function seedMongoStore() {
  const adminEmail = 'admin@purana.com';
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      name: 'Purana Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('Nepal@123', 10),
      role: 'admin',
      location: 'Kathmandu, Nepal'
    });
  }

  const sellerEmail = 'seed.seller@purana.com';
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    seller = await User.create({
      name: 'Purana Seed Seller',
      email: sellerEmail,
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'seller',
      location: 'Pokhara, Nepal'
    });
  }

  await Product.updateMany({ quantity: { $exists: false } }, { $set: { quantity: 1 } });
  await Product.updateMany({ gender: { $exists: false } }, { $set: { gender: 'Unisex' } });
  const seedProducts = [
    {
      seller: seller._id,
      title: 'Cotton Graphic Tee',
      brand: 'H&M',
      type: 'Shirt',
      size: 'M',
      color: 'White',
      gender: 'Men',
      quantity: 3,
      price: 700,
      condition: 'Good',
      description: 'Soft cotton tee in clean condition.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Oxford Button Shirt',
      brand: 'Uniqlo',
      type: 'Shirt',
      size: 'L',
      color: 'Blue',
      gender: 'Men',
      quantity: 2,
      price: 950,
      condition: 'Gently used',
      description: 'Clean button-down shirt for daily wear.',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Linen Casual Shirt',
      brand: 'Muji',
      type: 'Shirt',
      size: 'M',
      color: 'Green',
      gender: 'Unisex',
      quantity: 3,
      price: 850,
      condition: 'Good',
      description: 'Breathable linen shirt with relaxed fit.',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Floral Summer Dress',
      brand: 'Zara',
      type: 'Dress',
      size: 'S',
      color: 'Pink',
      gender: 'Women',
      quantity: 2,
      price: 1350,
      condition: 'Like new',
      description: 'Light floral dress for warm days.',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Black Evening Dress',
      brand: 'Mango',
      type: 'Dress',
      size: 'M',
      color: 'Black',
      gender: 'Women',
      quantity: 2,
      price: 1650,
      condition: 'Good',
      description: 'Simple evening dress with classic silhouette.',
      imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Party Dress',
      brand: 'Mothercare',
      type: 'Dress',
      size: 'XS',
      color: 'Pink',
      gender: 'Kids',
      quantity: 2,
      price: 900,
      condition: 'Like new',
      description: 'Small party dress for children.',
      imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Denim Jacket',
      brand: 'Gap',
      type: 'Jacket',
      size: 'XS',
      color: 'Blue',
      gender: 'Kids',
      quantity: 2,
      price: 1100,
      condition: 'Gently used',
      description: 'Durable denim jacket for kids.',
      imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Vintage Bomber Jacket',
      brand: 'Levis',
      type: 'Jacket',
      size: 'M',
      color: 'Black',
      gender: 'Men',
      quantity: 2,
      price: 2200,
      condition: 'Good',
      description: 'Classic bomber jacket with light wear.',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Women Denim Jacket',
      brand: 'Zara',
      type: 'Jacket',
      size: 'S',
      color: 'Blue',
      gender: 'Women',
      quantity: 2,
      price: 1900,
      condition: 'Gently used',
      description: 'Cropped denim jacket in clean condition.',
      imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Unisex Hoodie',
      brand: 'Nike',
      type: 'Sweater',
      size: 'L',
      color: 'Black',
      gender: 'Unisex',
      quantity: 4,
      price: 1800,
      condition: 'Good',
      description: 'Warm hoodie with minimal wear.',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Wool Blend Sweater',
      brand: 'H&M',
      type: 'Sweater',
      size: 'M',
      color: 'Cream',
      gender: 'Women',
      quantity: 2,
      price: 1250,
      condition: 'Good',
      description: 'Soft wool blend sweater for cooler evenings.',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Knit Sweater',
      brand: 'Gap',
      type: 'Sweater',
      size: 'XS',
      color: 'Red',
      gender: 'Kids',
      quantity: 3,
      price: 750,
      condition: 'Gently used',
      description: 'Warm knit sweater for kids.',
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Straight Fit Jeans',
      brand: 'Levis',
      type: 'Pants',
      size: 'L',
      color: 'Blue',
      gender: 'Men',
      quantity: 2,
      price: 1400,
      condition: 'Good',
      description: 'Straight fit denim jeans.',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Wide Leg Trousers',
      brand: 'Zara',
      type: 'Pants',
      size: 'M',
      color: 'Black',
      gender: 'Women',
      quantity: 2,
      price: 1300,
      condition: 'Like new',
      description: 'Comfortable wide leg trousers.',
      imageUrl: 'https://images.unsplash.com/photo-1506629905607-d9c297d2f5f2?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Jogger Pants',
      brand: 'Nike',
      type: 'Pants',
      size: 'S',
      color: 'Black',
      gender: 'Kids',
      quantity: 3,
      price: 800,
      condition: 'Good',
      description: 'Soft joggers for active kids.',
      imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Printed Cotton Kurta',
      brand: 'Local',
      type: 'Kurta',
      size: 'M',
      color: 'Green',
      gender: 'Women',
      quantity: 3,
      price: 950,
      condition: 'Good',
      description: 'Printed cotton kurta for everyday wear.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Men Cotton Kurta',
      brand: 'Local',
      type: 'Kurta',
      size: 'L',
      color: 'White',
      gender: 'Men',
      quantity: 2,
      price: 1100,
      condition: 'Gently used',
      description: 'Simple cotton kurta in breathable fabric.',
      imageUrl: 'https://images.unsplash.com/photo-1602810319250-a663f0af2f75?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Festive Kurta',
      brand: 'Local',
      type: 'Kurta',
      size: 'XS',
      color: 'Blue',
      gender: 'Kids',
      quantity: 2,
      price: 700,
      condition: 'Like new',
      description: 'Festive kurta for kids.',
      imageUrl: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Silk Blend Saree',
      brand: 'Local',
      type: 'Saree',
      size: 'Free Size',
      color: 'Red',
      gender: 'Women',
      quantity: 2,
      price: 2400,
      condition: 'Good',
      description: 'Elegant silk blend saree with border work.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469668-8e9f641a3c3f?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Cotton Printed Saree',
      brand: 'Local',
      type: 'Saree',
      size: 'Free Size',
      color: 'Green',
      gender: 'Women',
      quantity: 2,
      price: 1500,
      condition: 'Gently used',
      description: 'Light cotton saree for daily wear.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Classic Draped Saree',
      brand: 'Local',
      type: 'Saree',
      size: 'Free Size',
      color: 'Cream',
      gender: 'Women',
      quantity: 1,
      price: 1750,
      condition: 'Good',
      description: 'Classic saree with soft drape.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469668-8e9f641a3c3f?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'White Running Shoes',
      brand: 'Adidas',
      type: 'Shoes',
      size: 'M',
      color: 'White',
      gender: 'Unisex',
      quantity: 2,
      price: 2100,
      condition: 'Good',
      description: 'Lightweight running shoes.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Kids Sneakers',
      brand: 'Nike',
      type: 'Shoes',
      size: 'XS',
      color: 'Blue',
      gender: 'Kids',
      quantity: 2,
      price: 950,
      condition: 'Gently used',
      description: 'Comfortable sneakers for kids.',
      imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Black Casual Shoes',
      brand: 'Puma',
      type: 'Shoes',
      size: 'L',
      color: 'Black',
      gender: 'Men',
      quantity: 2,
      price: 1800,
      condition: 'Good',
      description: 'Black casual shoes with clean soles.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Striped Everyday Shirt',
      brand: 'H&M',
      type: 'Shirt',
      size: 'S',
      color: 'Blue',
      gender: 'Women',
      quantity: 3,
      price: 780,
      condition: 'Good',
      description: 'Striped shirt with a light relaxed fit.',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Light Rain Jacket',
      brand: 'Uniqlo',
      type: 'Jacket',
      size: 'L',
      color: 'Green',
      gender: 'Unisex',
      quantity: 2,
      price: 1750,
      condition: 'Gently used',
      description: 'Packable rain jacket for daily commutes.',
      imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Ribbed Cardigan Sweater',
      brand: 'Mango',
      type: 'Sweater',
      size: 'M',
      color: 'Cream',
      gender: 'Women',
      quantity: 2,
      price: 1450,
      condition: 'Like new',
      description: 'Soft cardigan sweater with button front.',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Cotton Midi Dress',
      brand: 'Zara',
      type: 'Dress',
      size: 'M',
      color: 'Green',
      gender: 'Women',
      quantity: 2,
      price: 1550,
      condition: 'Good',
      description: 'Cotton midi dress with simple daywear styling.',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Pleated Formal Pants',
      brand: 'Uniqlo',
      type: 'Pants',
      size: 'M',
      color: 'Black',
      gender: 'Unisex',
      quantity: 3,
      price: 1200,
      condition: 'Gently used',
      description: 'Pleated pants suitable for office or college wear.',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Embroidered Kurta Set',
      brand: 'Local',
      type: 'Kurta',
      size: 'S',
      color: 'Red',
      gender: 'Women',
      quantity: 2,
      price: 1350,
      condition: 'Like new',
      description: 'Kurta set with light embroidery and clean seams.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Festive Border Saree',
      brand: 'Local',
      type: 'Saree',
      size: 'Free Size',
      color: 'Blue',
      gender: 'Women',
      quantity: 2,
      price: 2100,
      condition: 'Good',
      description: 'Festive saree with a neat border design.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80'
    },
    {
      seller: seller._id,
      title: 'Low Top Canvas Shoes',
      brand: 'Converse',
      type: 'Shoes',
      size: 'S',
      color: 'White',
      gender: 'Unisex',
      quantity: 2,
      price: 1250,
      condition: 'Good',
      description: 'Canvas shoes with minor wear and clean soles.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'
    }
  ];

  await Product.bulkWrite(
    seedProducts.map((product) => ({
      updateOne: {
        filter: { title: product.title, seller: seller._id },
        update: { $setOnInsert: product },
        upsert: true
      }
    }))
  );

  const buyerSeeds = [
    { name: 'Aarya Buyer', email: 'seed.buyer.aarya@purana.com', location: 'Kathmandu, Nepal' },
    { name: 'Nima Buyer', email: 'seed.buyer.nima@purana.com', location: 'Lalitpur, Nepal' },
    { name: 'Sita Buyer', email: 'seed.buyer.sita@purana.com', location: 'Bhaktapur, Nepal' }
  ];

  const buyers = [];
  for (const buyerSeed of buyerSeeds) {
    let buyer = await User.findOne({ email: buyerSeed.email });
    if (!buyer) {
      buyer = await User.create({
        ...buyerSeed,
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'buyer'
      });
    }
    buyers.push(buyer);
  }

  const seededProducts = await Product.find({ seller: seller._id });
  const productByTitle = new Map(seededProducts.map((product) => [product.title, product]));
  const orderSeeds = [
    [buyers[0], 'Cotton Graphic Tee', 1, 'delivered'],
    [buyers[0], 'Oxford Button Shirt', 1, 'delivered'],
    [buyers[0], 'Straight Fit Jeans', 1, 'delivered'],
    [buyers[1], 'Floral Summer Dress', 1, 'delivered'],
    [buyers[1], 'Cotton Midi Dress', 1, 'delivered'],
    [buyers[1], 'Wool Blend Sweater', 1, 'in-progress'],
    [buyers[2], 'Kids Party Dress', 1, 'delivered'],
    [buyers[2], 'Kids Denim Jacket', 1, 'delivered'],
    [buyers[2], 'Kids Sneakers', 1, 'out-for-delivery'],
    [buyers[0], 'Low Top Canvas Shoes', 1, 'placed']
  ];

  for (const [buyer, title, quantity, status] of orderSeeds) {
    const product = productByTitle.get(title);
    if (!product) continue;
    const exists = await Order.findOne({ buyer: buyer._id, product: product._id });
    if (exists) continue;
    const subtotal = product.price * quantity;
    const deliveryCharge = buyer.location.toLowerCase().includes('pokhara') ? 50 : 200;
    await Order.create({
      buyer: buyer._id,
      seller: seller._id,
      product: product._id,
      quantity,
      subtotal,
      deliveryCharge,
      serviceCharge: 0,
      total: subtotal + deliveryCharge,
      paymentMethod: 'eSewa',
      deliveryAddress: buyer.location,
      deliveryEstimate: {
        from: 'pokhara',
        to: buyer.location.split(',')[0].trim().toLowerCase(),
        estimatedCost: deliveryCharge,
        estimatedText: deliveryCharge === 50 ? '1 day from pokhara to pokhara' : '3-4 days from pokhara to kathmandu'
      },
      status
    });
  }
}
