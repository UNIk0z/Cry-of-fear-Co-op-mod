import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {decodeBsp, parseEntities, inspectEntities, compareMaps, inspectFile, sha256, values} from '../scripts/bsp.mjs';
import {prepareOutput, REQUIRED_MAPS} from '../scripts/cof-inspect.mjs';

const world = '{\n"classname" "worldspawn"\n}\n';
function fixture(text = world, geometry = Buffer.from([1, 2, 3, 4])) {
  const entities = Buffer.from(text + '\0', 'latin1');
  const bytes = Buffer.alloc(124 + entities.length + geometry.length);
  bytes.writeInt32LE(30, 0);
  bytes.writeInt32LE(124, 4);
  bytes.writeInt32LE(entities.length, 8);
  bytes.writeInt32LE(124 + entities.length, 12);
  bytes.writeInt32LE(geometry.length, 16);
  entities.copy(bytes, 124);
  geometry.copy(bytes, 124 + entities.length);
  return bytes;
}
const report = text => {
  const bsp = decodeBsp(fixture(text));
  return {...bsp, source: '<synthetic>', analysis: inspectEntities(bsp.entities)};
};
const scratch = path.resolve(import.meta.dirname, '../../../work/test-runs');
fs.mkdirSync(scratch, {recursive: true});
const root = fs.mkdtempSync(path.join(scratch, 'cof-'));
test.after(() => fs.rmSync(root, {recursive: true, force: true}));

test('BSP30 yields all 15 hashes and exact entity text without changing input', () => {
  const bytes = fixture();
  const before = Buffer.from(bytes);
  const bsp = decodeBsp(bytes);
  assert.equal(bsp.version, 30);
  assert.equal(bsp.entityText, world);
  assert.equal(bsp.entities.length, 1);
  assert.equal(bsp.lumps.length, 15);
  assert.equal(bsp.sha256, sha256(before));
  assert.deepEqual(bytes, before);
});
test('duplicate keys, backslashes, non-ASCII bytes and comments are preserved', () => {
  const text = '// comment\n{ "classname" "multi_manager" "door" "0" "door" "1" "path" "models\\test.mdl" "label" "caf\xe9" }';
  const bsp = decodeBsp(fixture(text));
  assert.equal(bsp.entityText, text);
  assert.deepEqual(values(bsp.entities[0], 'door'), ['0', '1']);
  assert.deepEqual(values(bsp.entities[0], 'path'), ['models\\test.mdl']);
  assert.deepEqual(values(bsp.entities[0], 'label'), ['caf\xe9']);
  assert.equal(inspectEntities(bsp.entities).diagnostics[0].type, 'duplicate-key');
});
test('unsupported variants and truncated headers fail closed', () => {
  assert.throws(() => decodeBsp(Buffer.alloc(123)), /Truncated/);
  for (const version of [29, 31, 0x50534256]) {
    const bytes = fixture(); bytes.writeInt32LE(version, 0);
    assert.throws(() => decodeBsp(bytes), /Unsupported/);
  }
});
test('negative, header-crossing and out-of-bounds lump ranges are rejected', () => {
  for (const [offset, length] of [[-1, 4], [124, -1], [12, 4], [2147483647, 2147483647], [125, 999]]) {
    const bytes = fixture(); bytes.writeInt32LE(offset, 4); bytes.writeInt32LE(length, 8);
    assert.throws(() => decodeBsp(bytes), /Invalid/);
  }
});
test('overlapping and absent entity lumps are rejected', () => {
  const bytes = fixture(); bytes.writeInt32LE(124, 12);
  assert.throws(() => decodeBsp(bytes), /Overlapping/);
  const empty = fixture(); empty.writeInt32LE(0, 8);
  assert.throws(() => decodeBsp(empty), /Missing entity/);
});
test('unterminated and hidden trailing entity data are rejected', () => {
  const bytes = fixture(); bytes[124 + Buffer.byteLength(world, 'latin1')] = 32;
  assert.throws(() => decodeBsp(bytes), /NUL terminator/);
  assert.throws(() => decodeBsp(fixture(world + '\0{"hidden" "x"}')), /after entity NUL/);
});
test('invalid braces, unquoted tokens and incomplete pairs are rejected', () => {
  for (const text of ['{ "a" "b"', '{ "a" }', '{ classname "x" }', '{ "a" "b }', 'garbage', '}']) {
    assert.throws(() => parseEntities(text));
  }
});
test('target graph resolves shared names and multi_manager suffixes without calling warnings failures', () => {
  const entities = parseEntities(world + '{ "classname" "func_door" "targetname" "door" }\n'
    + '{ "classname" "func_door" "targetname" "door" }\n'
    + '{ "classname" "multi_manager" "targetname" "manager" "door#1" "0.5" "absent" "1" "spawnflags" "1" }');
  const analysis = inspectEntities(entities);
  assert.equal(analysis.references.length, 2);
  assert.deepEqual(analysis.references[0].resolvedEntities, [1, 2]);
  assert.equal(analysis.references[1].status, 'unresolved-static-reference');
});
test('entity comparison is order independent and retains duplicate multiplicity', () => {
  const door = '{ "classname" "func_door" "targetname" "d" }\n';
  const result = compareMaps(report(world + door + door), report(door + world));
  assert.equal(result.unchangedEntityCount, 2);
  assert.equal(result.onlyOriginal.length, 1);
  assert.equal(result.candidateCorrespondences.length, 0);
  assert.equal(result.classDifferences[0].original, 2);
});
test('unique named entities expose key changes, while different non-entity bytes remain visible', () => {
  const original = report(world + '{ "classname" "func_door" "targetname" "d" "spawnflags" "1" }');
  const coop = report(world + '{ "classname" "func_door" "targetname" "d" "spawnflags" "2" }');
  const comparison = compareMaps(original, coop);
  assert.deepEqual(comparison.candidateCorrespondences[0].changedKeys,
    [{key: 'spawnflags', original: ['1'], coop: ['2']}]);
  assert.ok(comparison.nonEntityLumps.every(l => l.identicalBytes));
  coop.lumps[1].sha256 = 'different';
  assert.equal(compareMaps(original, coop).nonEntityLumps[0].identicalBytes, false);
});
test('duplicates are never collapsed into inferred engine key semantics', () => {
  const original = report(world + '{ "classname" "x" "classname" "y" "targetname" "d" }');
  assert.equal(original.analysis.classCounts['<missing-or-duplicate-classname>'], 1);
  assert.equal(compareMaps(original, original).unchangedEntityCount, 2);
  assert.equal(original.analysis.diagnostics.length, 2);
});
test('repeated identical classnames in shipped maps remain classifiable, with duplicate diagnostics', () => {
  const inspected = report('{ "classname" "worldspawn" "classname" "worldspawn" }'
    + '{ "classname" "cof_coop_spawn1" "origin" "0 0 0" }');
  assert.equal(inspected.analysis.classCounts.worldspawn, 1);
  assert.equal(inspected.analysis.diagnostics[0].type, 'duplicate-key');
  assert.equal(inspected.entities[0].pairs.length, 2);
  assert.equal(inspected.analysis.relevantEntities.length, 1);
});
test('output directories cannot overwrite a previous run or sit in the source directory', () => {
  const maps = path.join(root, 'maps-safe'); fs.mkdirSync(maps);
  assert.throws(() => prepareOutput(path.join(maps, 'out'), [maps]), /outside/);
  const output = prepareOutput(path.join(root, 'safe-out'), [maps]);
  assert.throws(() => prepareOutput(output, [maps]), /already exists/);
});

const cli = path.resolve(import.meta.dirname, '../scripts/cof-inspect.mjs');
const run = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8'});
test('end-to-end inspect exports exact latin1 entity bytes and leaves source hashes unchanged', () => {
  const maps = path.join(root, 'maps-inspect'); fs.mkdirSync(maps);
  const input = path.join(maps, 'intro map.bsp');
  const text = world + '{ "classname" "x" "label" "caf\xe9" }';
  fs.writeFileSync(input, fixture(text));
  const before = sha256(fs.readFileSync(input));
  const output = path.join(root, 'inspect out');
  const result = run(['inspect', input, output]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readFileSync(path.join(output, 'intro map.ent')), Buffer.from(text, 'latin1'));
  assert.equal(sha256(fs.readFileSync(input)), before);
  assert.equal(inspectFile(input).entities.length, 2);
  const repeat = run(['inspect', input, output]);
  assert.equal(repeat.status, 1);
  assert.match(repeat.stderr, /already exists/);
});
test('end-to-end compare persists candidate changes without touching either BSP', () => {
  const maps = path.join(root, 'maps-compare'); fs.mkdirSync(maps);
  const original = path.join(maps, 'original.bsp'), coop = path.join(maps, 'coop.bsp');
  fs.writeFileSync(original, fixture(world));
  fs.writeFileSync(coop, fixture(world + '{ "classname" "info_player_deathmatch" }'));
  const before = [original, coop].map(p => sha256(fs.readFileSync(p)));
  const output = path.join(root, 'compare-out');
  const result = run(['compare', original, coop, output]);
  assert.equal(result.status, 0, result.stderr);
  const comparison = JSON.parse(fs.readFileSync(path.join(output, 'comparison.json')));
  assert.equal(comparison.onlyCoop.length, 1);
  assert.deepEqual([original, coop].map(p => sha256(fs.readFileSync(p))), before);
});
test('scan reports missing/invalid maps, compares valid pairs, and exits nonzero for incomplete inputs', () => {
  const maps = path.join(root, 'maps-scan'); fs.mkdirSync(maps);
  for (const name of REQUIRED_MAPS.slice(0, 4)) fs.writeFileSync(path.join(maps, name + '.bsp'), fixture());
  fs.writeFileSync(path.join(maps, 'c_city.bsp'), Buffer.from('corrupt'));
  const output = path.join(root, 'scan-out');
  const result = run(['scan', maps, output]);
  assert.equal(result.status, 2, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json')));
  assert.equal(manifest.results.filter(r => r.status === 'INSPECTED').length, 4);
  assert.equal(manifest.results.filter(r => r.status === 'FAILED').length, 1);
  assert.equal(manifest.results.filter(r => r.status === 'MISSING').length, 3);
  assert.equal(manifest.comparisons.length, 1);
  assert.equal(manifest.gameplayStatus, 'NOT TESTED');
});
test('scan completes for all eight synthetic maps; inaccessible input is an error, not missing maps', () => {
  const maps = path.join(root, 'maps-complete'); fs.mkdirSync(maps);
  for (const name of REQUIRED_MAPS) fs.writeFileSync(path.join(maps, name.toUpperCase() + '.BSP'), fixture());
  const output = path.join(root, 'complete-out');
  assert.equal(run(['scan', maps, output]).status, 0);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json')));
  assert.equal(manifest.comparisons.length, 3);
  assert.equal(manifest.results.length, 8);
  const badOutput = path.join(root, 'bad-out');
  const failure = run(['scan', path.join(root, 'not-present'), badOutput]);
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /ENOENT/);
  assert.equal(fs.existsSync(badOutput), false);
});
