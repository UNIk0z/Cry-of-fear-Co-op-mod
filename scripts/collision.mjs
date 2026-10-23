import {decodeBsp} from './bsp.mjs';

// Static BSP world hull queries only. These do not simulate dynamic brush entities
// or prove CoF's runtime player hull selection, movement, or spawn clearance.
export function worldHull(bytes, hull = 1) {
  if (![1, 2, 3].includes(hull)) throw new Error('Only clipnode hulls 1, 2, 3 supported');
  const bsp = decodeBsp(bytes);
  const slice = index => {
    const l = bsp.lumps[index];
    return bytes.subarray(l.offset, l.offset + l.length);
  };
  const planes = slice(1), nodes = slice(9), models = slice(14);
  if (!planes.length || planes.length % 20 || !nodes.length || nodes.length % 8
    || models.length < 64 || models.length % 64) throw new Error('Invalid classic collision lump sizes');
  // Signed classic child indices cannot represent extended clipnode tables.
  if (nodes.length / 8 > 32767) throw new Error('Extended clipnode table requires separate format verification');
  const root = models.readInt32LE(36 + hull * 4);
  function contents(point) {
    if (point.length !== 3 || !point.every(Number.isFinite)) throw new Error('Expected finite xyz point');
    let node = root;
    const visited = new Set();
    while (node >= 0) {
      if (node >= nodes.length / 8 || visited.has(node)) throw new Error('Out-of-range or cyclic clipnode reference');
      visited.add(node);
      const at = node * 8;
      const plane = nodes.readInt32LE(at);
      if (plane < 0 || plane >= planes.length / 20) throw new Error('Out-of-range clipnode plane');
      const p = plane * 20;
      const normal = [0, 4, 8].map(i => planes.readFloatLE(p + i));
      const distance = planes.readFloatLE(p + 12);
      if (![...normal, distance].every(Number.isFinite)) throw new Error('Non-finite collision plane');
      const side = normal.reduce((sum, n, i) => sum + n * point[i], 0) - distance >= 0 ? 0 : 1;
      node = nodes.readInt16LE(at + 4 + side * 2);
    }
    if (node < -15) throw new Error('Unrecognized classic contents code');
    return node;
  }
  return {contents, hull, root, nodeCount: nodes.length / 8};
}

export function sampleSpawn(hull, origin) {
  const center = [...origin]; center[2] += 1;
  const centerContents = hull.contents(center);
  let firstSolidDepth = null;
  for (let depth = 1; depth <= 64; depth++) {
    if (hull.contents([center[0], center[1], center[2] - depth]) === -2) {
      firstSolidDepth = depth; break;
    }
  }
  return {origin, sampledCenter: center, hull: hull.hull, centerContents, firstSolidDepth,
    staticCandidate: centerContents === -1 && firstSolidDepth !== null,
    caveat: 'Static world hull sampling, not an engine spawn/ground trace; excludes doors and other dynamic entities.'};
}
