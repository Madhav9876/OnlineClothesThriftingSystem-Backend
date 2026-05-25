import { dijkstra } from './graphAlgorithms.js';

export const nepalDeliveryGraph = {
  kathmandu: [{ to: 'lalitpur', weight: 7 }, { to: 'bhaktapur', weight: 14 }, { to: 'chitwan', weight: 150 }],
  lalitpur: [{ to: 'kathmandu', weight: 7 }, { to: 'bhaktapur', weight: 18 }],
  bhaktapur: [{ to: 'kathmandu', weight: 14 }, { to: 'lalitpur', weight: 18 }],
  chitwan: [{ to: 'kathmandu', weight: 150 }, { to: 'pokhara', weight: 145 }, { to: 'butwal', weight: 115 }],
  pokhara: [{ to: 'chitwan', weight: 145 }, { to: 'butwal', weight: 160 }],
  butwal: [{ to: 'chitwan', weight: 115 }, { to: 'pokhara', weight: 160 }, { to: 'nepalgunj', weight: 240 }],
  nepalgunj: [{ to: 'butwal', weight: 240 }],
  biratnagar: [{ to: 'dharan', weight: 40 }, { to: 'kathmandu', weight: 375 }],
  dharan: [{ to: 'biratnagar', weight: 40 }]
};

export function cityOf(location = '') {
  const text = String(location).toLowerCase();
  const cities = Object.keys(nepalDeliveryGraph);
  return cities.find((city) => text.includes(city)) || 'kathmandu';
}

export function pathFromPrevious(previous, start, end) {
  const path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    if (current === start) break;
    current = previous[current];
  }

  return path[0] === start ? path : [];
}

export function estimateDelivery({ sellerLocation, buyerLocation }) {
  const from = cityOf(sellerLocation);
  const to = cityOf(buyerLocation);
  const { distances, previous } = dijkstra(nepalDeliveryGraph, from);
  const distanceKm = distances[to];

  if (!Number.isFinite(distanceKm)) {
    return {
      from,
      to,
      route: [],
      distanceKm: null,
      estimatedCost: null,
      estimatedDays: 'Not available',
      estimatedText: 'Delivery estimate unavailable'
    };
  }

  const days = Math.max(1, Math.ceil(distanceKm / 140));
  const estimatedDays = days === 1 ? '1 day' : `${days}-${days + 1} days`;
  const estimatedCost = from === to ? 50 : Math.min(200, Math.max(80, Math.round(distanceKm * 8)));

  return {
    from,
    to,
    route: pathFromPrevious(previous, from, to),
    distanceKm,
    estimatedCost,
    estimatedDays,
    estimatedText: `${estimatedDays} from ${from} to ${to}`
  };
}
