import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

function productFeatures(product) {
  return [
    `brand:${normalize(product.brand)}`,
    `type:${normalize(product.type)}`,
    `size:${normalize(product.size)}`,
    `color:${normalize(product.color)}`,
    `condition:${normalize(product.condition)}`,
    ...normalize(product.title).split(/\s+/).filter(Boolean).map((word) => `title:${word}`)
  ];
}

function vectorize(product, vocabulary) {
  const vector = Array(vocabulary.length).fill(0);
  const features = productFeatures(product);

  for (const feature of features) {
    const index = vocabulary.indexOf(feature);
    if (index >= 0) vector[index] += 1;
  }

  return vector;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aMagnitude += a[i] ** 2;
    bMagnitude += b[i] ** 2;
  }

  if (!aMagnitude || !bMagnitude) return 0;
  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

function contentBasedScores({ buyerId, products, orders }) {
  const purchasedProductIds = new Set(
    orders.filter((order) => String(order.buyer?._id || order.buyer) === buyerId).map((order) => String(order.product?._id || order.product))
  );

  const purchasedProducts = products.filter((product) => purchasedProductIds.has(String(product._id)));
  if (!purchasedProducts.length) return new Map();

  const vocabulary = [...new Set(products.flatMap(productFeatures))];
  const purchasedVectors = purchasedProducts.map((product) => vectorize(product, vocabulary));
  const scores = new Map();

  for (const product of products) {
    const productId = String(product._id);
    if (purchasedProductIds.has(productId) || product.status !== 'available' || Number(product.quantity || 0) < 1) continue;

    const vector = vectorize(product, vocabulary);
    const similarity = purchasedVectors.reduce((sum, purchasedVector) => sum + cosineSimilarity(vector, purchasedVector), 0) / purchasedVectors.length;
    scores.set(productId, similarity);
  }

  return scores;
}

function collaborativeScores({ buyerId, products, orders }) {
  const buyerIds = [...new Set(orders.map((order) => String(order.buyer?._id || order.buyer)))];
  const productIds = [...new Set(products.map((product) => String(product._id)))];
  const targetBuyerIndex = buyerIds.indexOf(buyerId);

  if (buyerIds.length < 1 || productIds.length < 2 || orders.length < 2) {
    return new Map();
  }

  const productIndex = new Map(productIds.map((id, index) => [id, index]));
  const purchasedProductIds = new Set(
    orders.filter((order) => String(order.buyer?._id || order.buyer) === buyerId).map((order) => String(order.product?._id || order.product))
  );

  const factors = 4;
  const learningRate = 0.015;
  const regularization = 0.04;
  const epochs = 80;
  const buyerFactors = buyerIds.map((_, buyerIdx) =>
    Array.from({ length: factors }, (_, factorIdx) => 0.08 + ((buyerIdx + factorIdx) % 5) * 0.01)
  );
  const productFactors = productIds.map((_, productIdx) =>
    Array.from({ length: factors }, (_, factorIdx) => 0.08 + ((productIdx + factorIdx) % 7) * 0.01)
  );

  const interactions = orders
    .map((order) => ({
      buyerIndex: buyerIds.indexOf(String(order.buyer?._id || order.buyer)),
      productIndex: productIndex.get(String(order.product?._id || order.product)),
      rating: Math.min(5, 1 + Number(order.quantity || 1))
    }))
    .filter((item) => item.buyerIndex >= 0 && item.productIndex >= 0);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    for (const interaction of interactions) {
      const userVector = buyerFactors[interaction.buyerIndex];
      const itemVector = productFactors[interaction.productIndex];
      const prediction = userVector.reduce((sum, value, index) => sum + value * itemVector[index], 0);
      const error = interaction.rating - prediction;

      for (let factor = 0; factor < factors; factor += 1) {
        const userValue = userVector[factor];
        const itemValue = itemVector[factor];
        userVector[factor] += learningRate * (error * itemValue - regularization * userValue);
        itemVector[factor] += learningRate * (error * userValue - regularization * itemValue);
      }
    }
  }

  const scores = new Map();
  const targetVector = targetBuyerIndex >= 0
    ? buyerFactors[targetBuyerIndex]
    : Array.from({ length: factors }, (_, factor) =>
        buyerFactors.reduce((sum, vector) => sum + vector[factor], 0) / buyerFactors.length
      );

  for (const product of products) {
    const productId = String(product._id);
    if (purchasedProductIds.has(productId) || product.status !== 'available' || Number(product.quantity || 0) < 1) continue;

    const itemVector = productFactors[productIndex.get(productId)];
    const score = targetVector.reduce((sum, value, index) => sum + value * itemVector[index], 0);
    scores.set(productId, score);
  }

  return scores;
}

function minMaxNormalize(scores) {
  const values = [...scores.values()];
  if (!values.length) return scores;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return new Map([...scores.keys()].map((key) => [key, 0.5]));
  return new Map([...scores.entries()].map(([key, value]) => [key, (value - min) / (max - min)]));
}

export async function recommendForBuyer(buyerId, limit = 6) {
  const products = isMongoReady()
    ? await Product.find({}).populate('seller', 'name').sort({ createdAt: -1 })
    : memory.products;
  const orders = isMongoReady()
    ? await Order.find({}).populate('product').lean()
    : memory.orders;

  const availableProducts = products.filter((product) => product.status === 'available' && Number(product.quantity || 0) > 0);
  const contentScores = minMaxNormalize(contentBasedScores({ buyerId, products, orders }));
  const collaborative = minMaxNormalize(collaborativeScores({ buyerId, products, orders }));
  const purchasedProductIds = new Set(
    orders.filter((order) => String(order.buyer?._id || order.buyer) === buyerId).map((order) => String(order.product?._id || order.product))
  );

  return availableProducts
    .filter((product) => !purchasedProductIds.has(String(product._id)))
    .map((product) => {
      const id = String(product._id);
      const contentScore = contentScores.get(id) || 0;
      const collaborativeScore = collaborative.get(id) || 0;
      const fallbackScore = Number(new Date(product.createdAt || Date.now())) / 10000000000000;
      const score = Math.max(
        contentScore * 0.6 + collaborativeScore * 0.35 + fallbackScore * 0.05,
        collaborativeScore * 0.8,
        contentScore * 0.8
      );

      return {
        ...productDto(product),
        recommendationScore: Number(score.toFixed(4)),
        recommendationReason: contentScore >= collaborativeScore
          ? 'Similar to your preferred clothes'
          : 'Personalized from buyer order patterns'
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}
