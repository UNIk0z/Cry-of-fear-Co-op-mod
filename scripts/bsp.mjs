import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const LUMP_NAMES = ['entities', 'planes', 'textures', 'vertices', 'visibility',
  'nodes', 'texinfo', 'faces', 'lighting', 'clipnodes', 'leaves', 'marksurfaces',
  'edges', 'surfedges', 'models'];
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

// Deliberately only classic BSP30: modified formats must be verified before support.
export function decodeBsp(bytes) {
  if (bytes.length < 124) throw new Error('Truncated BSP header (need 124 bytes)');
  const version = bytes.readInt32LE(0);
  if (version !== 30) throw new Error(`Unsupported BSP version ${version}; only classic BSP30 is supported`);
  const lumps = LUMP_NAMES.map((name, index) => {
    const offset = bytes.readInt32LE(4 + index * 8);
    const length = bytes.readInt32LE(8 + index * 8);
    if (offset < 0 || length < 0 || offset + length > bytes.length || (length && offset < 124)) {
      throw new Error(`Invalid ${name} lump range: ${offset}+${length}/${bytes.length}`);
    }
    return {index, name, offset, length, sha256: sha256(bytes.subarray(offset, offset + length))};
  });
  const ranges = lumps.filter(l => l.length).sort((a, b) => a.offset - b.offset);
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].offset < ranges[i - 1].offset + ranges[i - 1].length) {
      throw new Error(`Overlapping lumps: ${ranges[i - 1].name} and ${ranges[i].name}`);
    }
  }
  const {offset, length} = lumps[0];
  if (!length) throw new Error('Missing entity lump');
  const raw = bytes.subarray(offset, offset + length);
  const end = raw.indexOf(0);
  if (end < 0) throw new Error('Entity lump has no NUL terminator');
  if (raw.subarray(end).some(b => b !== 0 && b !== 9 && b !== 10 && b !== 13 && b !== 32)) {
    throw new Error('Unexpected data after entity NUL terminator');
  }
  const entityText = raw.subarray(0, end).toString('latin1');
  return {version, fileBytes: bytes.length, sha256: sha256(bytes), lumps,
    entityText, entities: parseEntities(entityText)};
}

export function parseEntities(text) {
  let cursor = 0;
  const entities = [];
  function skip() {
    while (cursor < text.length) {
      if (text.charCodeAt(cursor) <= 32) { cursor++; continue; }
      if (text.startsWith('//', cursor)) {
        const end = text.indexOf('\n', cursor);
        cursor = end < 0 ? text.length : end + 1;
        continue;
      }
      break;
    }
  }
  function quoted() {
    skip();
    if (text[cursor] !== '"') throw new Error(`Expected quoted key/value at character ${cursor}`);
    const start = ++cursor;
    const end = text.indexOf('"', start);
    if (end < 0) throw new Error(`Unterminated quote at character ${start - 1}`);
    cursor = end + 1;
    // Backslashes remain literal, as in Valve's SDK token reader; this is not JSON.
    return text.slice(start, end);
  }
  skip();
  while (cursor < text.length) {
    if (text[cursor++] !== '{') throw new Error(`Expected entity opening brace at character ${cursor - 1}`);
    const pairs = [];
    skip();
    while (cursor < text.length && text[cursor] !== '}') {
      const key = quoted();
      const value = quoted();
      pairs.push([key, value]);
      skip();
    }
    if (text[cursor++] !== '}') throw new Error('Unterminated entity');
    entities.push({index: entities.length, pairs});
    skip();
  }
  return entities;
}

export const values = (entity, key) => entity.pairs.filter(p => p[0] === key).map(p => p[1]);
export const uniqueValue = (entity, key) => {
  const found = values(entity, key);
  return found.length && found.every(value => value === found[0]) ? found[0] : undefined;
};
const canonical = entity => JSON.stringify([...entity.pairs].sort((a, b) => a[0].localeCompare(b[0], 'en')));
const histogram = entities => {
  const counts = new Map();
  for (const e of entities) {
    const name = uniqueValue(e, 'classname') ?? '<missing-or-duplicate-classname>';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Object.fromEntries([...counts].sort(([a], [b]) => a.localeCompare(b, 'en')));
};

export function inspectEntities(entities) {
  const diagnostics = [];
  const names = new Map();
  for (const e of entities) {
    const count = new Map();
    for (const [key] of e.pairs) count.set(key, (count.get(key) ?? 0) + 1);
    for (const [key, total] of count) {
      if (total > 1) diagnostics.push({type: 'duplicate-key', entity: e.index, key, total});
    }
    if (!uniqueValue(e, 'classname')) diagnostics.push({type: 'missing-or-ambiguous-classname', entity: e.index});
    for (const name of values(e, 'targetname').filter(Boolean)) {
      if (!names.has(name)) names.set(name, []);
      names.get(name).push(e.index);
    }
  }
  const references = [];
  const managerMetadata = new Set(['classname', 'targetname', 'origin', 'angles', 'angle', 'spawnflags']);
  for (const e of entities) {
    for (const [key, value] of e.pairs) {
      let destination;
      if (['target', 'killtarget', 'master'].includes(key) && value) destination = value;
      else if (uniqueValue(e, 'classname') === 'multi_manager' && !managerMetadata.has(key)
        && value.trim() && Number.isFinite(Number(value))) destination = key.replace(/#\d+$/, '');
      if (destination === undefined) continue;
      const resolved = names.get(destination) ?? [];
      references.push({entity: e.index, key, destination, resolvedEntities: resolved,
        status: resolved.length ? 'resolved-exact-name' : 'unresolved-static-reference'});
    }
  }
  return {classCounts: histogram(entities), diagnostics, references,
    referenceCaveat: 'Heuristic exact-name analysis only. Dynamic/special targets and CoF-specific keys require SDK and runtime evidence. Shared targetnames may be intentional.',
    relevantEntities: entities.filter(e => /^(cof_|inter_door|info_player|info_simon|info_coop|info_game|game_|trigger_|func_coop|func_door|func_button|scripted_|multi_manager|env_|item_|weapon_|monster_)/.test(uniqueValue(e, 'classname') ?? ''))};
}

export function inspectFile(filename) {
  const bsp = decodeBsp(fs.readFileSync(filename));
  return {source: path.resolve(filename), ...bsp, analysis: inspectEntities(bsp.entities)};
}

export function compareMaps(original, coop) {
  const classes = [...new Set([...Object.keys(original.analysis.classCounts), ...Object.keys(coop.analysis.classCounts)])].sort();
  const classDifferences = classes.map(classname => ({classname,
    original: original.analysis.classCounts[classname] ?? 0, coop: coop.analysis.classCounts[classname] ?? 0}))
    .filter(row => row.original !== row.coop);
  // Multisets handle entity reordering and repeated identical entities without guessing identity.
  const pools = new Map();
  for (const e of coop.entities) {
    const key = canonical(e);
    if (!pools.has(key)) pools.set(key, []);
    pools.get(key).push(e);
  }
  let unchangedEntityCount = 0;
  const onlyOriginal = [];
  for (const e of original.entities) {
    const pool = pools.get(canonical(e));
    if (pool?.length) { pool.pop(); unchangedEntityCount++; }
    else onlyOriginal.push(e);
  }
  const onlyCoop = [...pools.values()].flat().sort((a, b) => a.index - b.index);
  const candidateCorrespondences = [];
  const identity = e => {
    const name = uniqueValue(e, 'targetname'), cls = uniqueValue(e, 'classname');
    return name && cls ? JSON.stringify([cls, name]) : undefined;
  };
  // Uniqueness is checked across the complete maps, including unchanged entities.
  const group = entities => {
    const map = new Map();
    for (const e of entities) {
      const id = identity(e);
      if (id === undefined) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(e);
    }
    return map;
  };
  const left = group(original.entities), right = group(coop.entities);
  for (const e of onlyOriginal) {
    const id = identity(e);
    if (left.get(id)?.length !== 1 || right.get(id)?.length !== 1) continue;
    const match = right.get(id)[0];
    const changedKeys = [...new Set([...e.pairs, ...match.pairs].map(p => p[0]))].sort()
      .filter(key => JSON.stringify(values(e, key)) !== JSON.stringify(values(match, key)))
      .map(key => ({key, original: values(e, key), coop: values(match, key)}));
    candidateCorrespondences.push({originalEntity: e.index, coopEntity: match.index,
      classname: uniqueValue(e, 'classname'), targetname: uniqueValue(e, 'targetname'), changedKeys});
  }
  const nonEntityLumps = original.lumps.slice(1).map(l => ({name: l.name,
    identicalBytes: l.sha256 === coop.lumps[l.index].sha256,
    originalLength: l.length, coopLength: coop.lumps[l.index].length}));
  return {schemaVersion: 1, original: {source: original.source, sha256: original.sha256},
    coop: {source: coop.source, sha256: coop.sha256}, classDifferences, unchangedEntityCount,
    onlyOriginal, onlyCoop, candidateCorrespondences, nonEntityLumps,
    caveat: 'Candidate matches are unique classname+targetname pairs, not verified logical equivalents. Differences do not establish root causes or safe transformations.',
    originalAnalysis: original.analysis, coopAnalysis: coop.analysis};
}
