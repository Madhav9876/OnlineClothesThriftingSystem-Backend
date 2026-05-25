import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';
import { estimateDelivery } from './deliveryEstimates.js';
import { dfs } from './graphAlgorithms.js';

const idOf = (value) => String(value?._id || value);

const categoryGraph = {
  Clothes: [{ to: 'Tops', weight: 1 }, { to: 'Outerwear', weight: 1 }, { to: 'Bottoms', weight: 1 }, { to: 'Traditional', weight: 1 }, { to: 'Footwear', weight: 1 }],
  Tops: [{ to: 'Shirt', weight: 1 }, { to: 'Sweater', weight: 1 }],
  Outerwear: [{ to: 'Jacket', weight: 1 }],
  Bottoms: [{ to: 'Pants', weight: 1 }],
  Traditional: [{ to: 'Kurta', weight: 1 }, { to: 'Saree', weight: 1 }],
  Footwear: [{ to: 'Shoes', weight: 1 }],
  Shirt: [],
  Sweater: [],
  Jacket: [],
  Pants: [],
  Kurta: [],
  Saree: [],
  Shoes: []
};

function productTypeCounts(products) {
  return products.reduce((counts, product) => {
    counts[product.type] = (counts[product.type] || 0) + 1;
    return counts;
  }, {});
}

function categoryDfs(products) {
  const counts = productTypeCounts(products);
  return dfs(categoryGraph, 'Clothes').map((category, index) => ({
    category,
    depthOrder: index + 1,
    productCount: counts[category] || 0
  }));
}

function deliveryDijkstra({ buyer, products, limit }) {
  const paths = [];

  for (const product of products.filter((item) => item.status === 'available')) {
    const estimate = estimateDelivery({
      sellerLocation: product.seller?.location || product.sellerLocation || '',
      buyerLocation: buyer.location
    });

    if (!Number.isFinite(estimate.distanceKm)) continue;

    paths.push({
      product: productDto(product),
      ...estimate
    });
  }

  return paths.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export async function systemGraphIntelligenceForBuyer(buyerId, limit = 4) {
  const users = isMongoReady() ? await User.find({}).lean() : memory.users;
  const products = isMongoReady()
    ? await Product.find({}).populate('seller', 'name location').sort({ createdAt: -1 })
    : memory.products;
  const buyer = users.find((user) => idOf(user) === buyerId);

  return {
    dfsCategories: categoryDfs(products),
    dijkstraDelivery: buyer ? deliveryDijkstra({ buyer, products, limit }) : []
  };
}
