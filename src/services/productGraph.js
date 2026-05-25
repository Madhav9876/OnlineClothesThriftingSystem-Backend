import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';
import { dfs, dijkstra } from './graphAlgorithms.js';

const idOf = (value) => String(value?._id || value);
const normalize = (value) => String(value || '').trim().toLowerCase();

function sharedFeatureCount(a, b) {
  return ['brand', 'type', 'size', 'color', 'condition'].reduce(
    (count, key) => count + (normalize(a[key]) && normalize(a[key]) === normalize(b[key]) ? 1 : 0),
    0
  );
}

function priceDistance(a, b) {
  const highest = Math.max(Number(a.price || 0), Number(b.price || 0), 1);
  return Math.abs(Number(a.price || 0) - Number(b.price || 0)) / highest;
}

function edgeWeight(a, b) {
  const shared = sharedFeatureCount(a, b);
  const attributeDistance = 1 - shared / 5;
  return Number((0.75 * attributeDistance + 0.25 * priceDistance(a, b) + 0.05).toFixed(4));
}

function buildProductGraph(products) {
  const graph = {};

  for (const product of products) {
    graph[idOf(product)] = [];
  }

  for (let i = 0; i < products.length; i += 1) {
    for (let j = i + 1; j < products.length; j += 1) {
      const left = products[i];
      const right = products[j];
      const shared = sharedFeatureCount(left, right);

      if (shared === 0) continue;

      const weight = edgeWeight(left, right);
      graph[idOf(left)].push({ to: idOf(right), weight });
      graph[idOf(right)].push({ to: idOf(left), weight });
    }
  }

  for (const node of Object.keys(graph)) {
    graph[node].sort((a, b) => a.weight - b.weight);
  }

  return graph;
}

function mapProductsById(products) {
  return new Map(products.map((product) => [idOf(product), product]));
}

function firstAvailableSeed({ buyerId, products, orders }) {
  const buyerOrder = orders.find((order) => idOf(order.buyer) === buyerId && order.product);
  const orderedProductId = buyerOrder ? idOf(buyerOrder.product) : null;
  const orderedProduct = products.find((product) => idOf(product) === orderedProductId);

  if (orderedProduct) return idOf(orderedProduct);
  return idOf(products.find((product) => product.status === 'available') || products[0]);
}

function toGraphProduct(product, meta) {
  return {
    ...productDto(product),
    graphAlgorithm: meta.algorithm,
    graphDistance: meta.distance,
    graphReason: meta.reason
  };
}

export async function graphRecommendationsForBuyer(buyerId, limit = 5) {
  const products = isMongoReady()
    ? await Product.find({}).populate('seller', 'name').sort({ createdAt: -1 })
    : memory.products;
  const orders = isMongoReady()
    ? await Order.find({}).populate('product').lean()
    : memory.orders;

  if (!products.length) {
    return { seedProductId: null, dfs: [], dijkstra: [] };
  }

  const graph = buildProductGraph(products);
  const productsById = mapProductsById(products);
  const purchasedIds = new Set(
    orders.filter((order) => idOf(order.buyer) === buyerId).map((order) => idOf(order.product))
  );
  const seedProductId = firstAvailableSeed({ buyerId, products, orders });
  const isRecommendable = (id) => {
    const product = productsById.get(id);
    return product && product.status === 'available' && !purchasedIds.has(id) && id !== seedProductId;
  };

  const makeTraversalResults = (ids, algorithm) =>
    ids
      .filter(isRecommendable)
      .slice(0, limit)
      .map((id, index) =>
        toGraphProduct(productsById.get(id), {
          algorithm,
          distance: index + 1,
          reason: `${algorithm} discovered this through shared product attributes`
        })
      );

  const shortestPaths = dijkstra(graph, seedProductId);
  const dijkstraResults = Object.entries(shortestPaths.distances)
    .filter(([id, distance]) => isRecommendable(id) && Number.isFinite(distance))
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([id, distance]) =>
      toGraphProduct(productsById.get(id), {
        algorithm: 'Dijkstra',
        distance: Number(distance.toFixed(4)),
        reason: 'Shortest weighted path from your graph seed product'
      })
    );

  return {
    seedProductId,
    dfs: makeTraversalResults(dfs(graph, seedProductId), 'DFS'),
    dijkstra: dijkstraResults
  };
}
