export function dfs(graph, start) {
  if (!graph[start]) return [];

  const visited = new Set();
  const order = [];

  function visit(node) {
    visited.add(node);
    order.push(node);

    for (const edge of graph[node]) {
      if (!visited.has(edge.to)) visit(edge.to);
    }
  }

  visit(start);
  return order;
}

export function dijkstra(graph, start) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) {
    distances[node] = Number.POSITIVE_INFINITY;
    previous[node] = null;
  }

  if (!graph[start]) return { distances, previous };
  distances[start] = 0;

  while (unvisited.size) {
    let current = null;
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) current = node;
    }

    if (current === null || distances[current] === Number.POSITIVE_INFINITY) break;
    unvisited.delete(current);

    for (const edge of graph[current]) {
      if (!unvisited.has(edge.to)) continue;

      const candidateDistance = distances[current] + edge.weight;
      if (candidateDistance < distances[edge.to]) {
        distances[edge.to] = candidateDistance;
        previous[edge.to] = current;
      }
    }
  }

  return { distances, previous };
}
