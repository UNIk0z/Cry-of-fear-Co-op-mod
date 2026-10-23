import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp, sha256, uniqueValue} from './bsp.mjs';
import {worldHull, sampleSpawn} from './collision.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export function buildSpawnExperiment(bytes, patch) {
  const original = decodeBsp(bytes);
  if (patch.schemaVersion !== 1 || patch.operation !== 'append-native-coop-spawns'
    || patch.status !== 'EXPERIMENTAL_NOT_RUNTIME_TESTED') throw new Error('Unsupported experiment manifest');
  if (patch.sourceSha256 !== original.sha256) throw new Error('Source SHA256 does not match manifest');
  if (!Array.isArray(patch.spawns) || patch.spawns.length !== 4) throw new Error('Require native spawn slots 1 through 4');
  const hull = worldHull(bytes, 1);
  const samples = [];
  const newEntities = patch.spawns.map((spawn, index) => {
    const classname = `cof_coop_spawn${index + 1}`;
    if (spawn.classname !== classname) throw new Error('Spawn slots must be ordered 1 through 4');
    if (original.entities.some(e => uniqueValue(e, 'classname') === classname)) throw new Error('Native spawn class already exists');
    if (!Array.isArray(spawn.origin) || spawn.origin.length !== 3 || !spawn.origin.every(Number.isFinite)
      || !Array.isArray(spawn.angles) || spawn.angles.length !== 3 || !spawn.angles.every(Number.isFinite)) {
      throw new Error('Spawn origin and angles must be finite xyz arrays');
    }
    const sample = sampleSpawn(hull, spawn.origin);
    if (!sample.staticCandidate) throw new Error(`Spawn slot ${index + 1} fails static world hull checks`);
    samples.push(sample);
    return {pairs: [['origin', spawn.origin.join(' ')], ['angles', spawn.angles.join(' ')], ['classname', classname]]};
  });
  // CoF-specific dynamic collisions remain a runtime test; this only rejects obvious
  // overlap using the conventional standing hull extents of +/-16,+/-16,+/-36.
  for (let i = 0; i < patch.spawns.length; i++) {
    for (let j = i + 1; j < patch.spawns.length; j++) {
      const delta = patch.spawns[i].origin.map((v, axis) => Math.abs(v - patch.spawns[j].origin[axis]));
      if (delta[0] < 32 && delta[1] < 32 && delta[2] < 72) throw new Error('Spawn candidates overlap');
    }
  }
  const appendText = newEntities.map(e => '{\n' + e.pairs.map(([k,v]) => `"${k}" "${v}"`).join('\n') + '\n}\n').join('');
  const entityBytes = Buffer.from(original.entityText + '\n' + appendText + '\0', 'latin1');
  const offset = Math.ceil(bytes.length / 4) * 4;
  if (offset + entityBytes.length > 2147483647) throw new Error('Output exceeds classic BSP offsets');
  const output = Buffer.alloc(offset + entityBytes.length);
  bytes.copy(output);
  entityBytes.copy(output, offset);
  output.writeInt32LE(offset, 4);
  output.writeInt32LE(entityBytes.length, 8);
  const rebuilt = decodeBsp(output);
  if (rebuilt.entities.length !== original.entities.length + 4
    || JSON.stringify(rebuilt.entities.slice(0, original.entities.length)) !== JSON.stringify(original.entities)
    || !rebuilt.lumps.slice(1).every(l => l.sha256 === original.lumps[l.index].sha256)
    || !output.subarray(12, bytes.length).equals(bytes.subarray(12))) {
    throw new Error('Output preservation checks failed');
  }
  return {output, report: {schemaVersion: 1, status: patch.status, sourceSha256: original.sha256,
    outputSha256: sha256(output), originalEntityCount: original.entities.length,
    outputEntityCount: rebuilt.entities.length, addedSpawns: patch.spawns, staticWorldSamples: samples,
    unchangedNonEntityLumps: rebuilt.lumps.slice(1).map(l => l.name),
    originalEntityPairsPreserved: true, originalBytesPreservedExceptEntityHeader: true,
    deploymentStatus: 'NOT DEPLOYED', gameplayStatus: 'NOT TESTED',
    caveat: 'Experimental spawn initialization only. Doors, transitions, cameras, inventory, runtime hulls and visibility are not verified.'}};
}

export function main(args) {
  if (args.length !== 3) throw new Error('Usage: append-spawns.mjs SOURCE.bsp PATCH.json NEW_OUT_DIR');
  const [source, manifest, destination] = args;
  const patch = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  if (path.basename(source).toLowerCase() !== patch.sourceMap) throw new Error('Source map filename does not match manifest');
  const bytes = fs.readFileSync(source);
  const result = buildSpawnExperiment(bytes, patch);
  const output = prepareOutput(destination, [path.dirname(source)]);
  fs.writeFileSync(path.join(output, patch.sourceMap), result.output, {flag: 'wx'});
  fs.writeFileSync(path.join(output, 'experiment-report.json'), JSON.stringify(result.report, null, 2) + '\n', {flag: 'wx'});
  console.log(`Generated experimental ${patch.sourceMap}: ${result.report.originalEntityCount} -> ${result.report.outputEntityCount} entities; 14 non-entity lumps unchanged. NOT DEPLOYED / NOT RUNTIME TESTED. ${output}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}
