import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeBsp, sha256} from '../scripts/bsp.mjs';
import {worldHull, sampleSpawn} from '../scripts/collision.mjs';
import {buildSpawnExperiment} from '../scripts/append-spawns.mjs';

function fixture() {
  const entity = Buffer.from('{ "classname" "worldspawn" "classname" "worldspawn" }\n\0');
  const plane = Buffer.alloc(20); plane.writeFloatLE(1, 8); plane.writeFloatLE(-36, 12); plane.writeInt32LE(2, 16);
  const nodes = Buffer.alloc(8); nodes.writeInt16LE(-1, 4); nodes.writeInt16LE(-2, 6);
  const models = Buffer.alloc(64); models.writeInt32LE(0, 40);
  const lumps = new Map([[0, entity], [1, plane], [9, nodes], [14, models]]);
  const header = Buffer.alloc(124); header.writeInt32LE(30);
  let offset = 124;
  for (const [index, bytes] of lumps) {
    header.writeInt32LE(offset, 4 + index * 8); header.writeInt32LE(bytes.length, 8 + index * 8); offset += bytes.length;
  }
  return Buffer.concat([header, ...lumps.values()]);
}
function manifest(bytes) {
  return {schemaVersion:1, operation:'append-native-coop-spawns', status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',
    sourceSha256:sha256(bytes),spawns:[0,1,2,3].map(i=>({classname:`cof_coop_spawn${i+1}`,origin:[i*64,0,0],angles:[0,90,0]}))};
}
test('world hull classifies an empty center and nearby floor without mutating bytes', () => {
  const bytes=fixture(), before=sha256(bytes), hull=worldHull(bytes);
  assert.equal(hull.contents([0,0,0]), -1);
  assert.equal(hull.contents([0,0,-37]), -2);
  assert.equal(sampleSpawn(hull,[0,0,0]).firstSolidDepth,38);
  assert.equal(sha256(bytes),before);
});
test('world hull rejects cycles, invalid planes, nonfinite input and unsupported formats', () => {
  const original=fixture(), bsp=decodeBsp(original);
  const cyclic=Buffer.from(original); cyclic.writeInt16LE(0,bsp.lumps[9].offset+4);
  assert.throws(()=>worldHull(cyclic).contents([0,0,0]),/cyclic/);
  const plane=Buffer.from(original); plane.writeInt32LE(9,bsp.lumps[9].offset);
  assert.throws(()=>worldHull(plane).contents([0,0,0]),/plane/);
  assert.throws(()=>worldHull(original).contents([Infinity,0,0]),/finite/);
  assert.throws(()=>worldHull(original,0),/Only clipnode/);
});
test('spawn append is deterministic and preserves all original entity pairs and non-entity bytes', () => {
  const bytes=fixture(), before=Buffer.from(bytes), patch=manifest(bytes);
  const first=buildSpawnExperiment(bytes,patch), second=buildSpawnExperiment(bytes,patch);
  assert.deepEqual(first.output,second.output);
  assert.deepEqual(bytes,before);
  const old=decodeBsp(bytes), next=decodeBsp(first.output);
  assert.equal(next.entities.length,old.entities.length+4);
  assert.deepEqual(next.entities.slice(0,old.entities.length),old.entities);
  assert.ok(next.entityText.startsWith(old.entityText));
  assert.deepEqual(first.output.subarray(12,bytes.length),bytes.subarray(12));
  assert.ok(next.lumps.slice(1).every(l=>l.sha256===old.lumps[l.index].sha256));
  assert.equal(first.report.deploymentStatus,'NOT DEPLOYED');
  assert.equal(first.report.gameplayStatus,'NOT TESTED');
});
test('wrong source hash and repeated application fail closed', () => {
  const bytes=fixture(), patch=manifest(bytes);
  assert.throws(()=>buildSpawnExperiment(bytes,{...patch,sourceSha256:'bad'}),/SHA256/);
  const first=buildSpawnExperiment(bytes,patch);
  assert.throws(()=>buildSpawnExperiment(first.output,patch),/SHA256/);
  const rehashed={...patch,sourceSha256:sha256(first.output)};
  assert.throws(()=>buildSpawnExperiment(first.output,rehashed),/already exists/);
});
test('invalid, solid, overlapping or unordered spawn candidates fail before producing a BSP', () => {
  const bytes=fixture();
  for (const modify of [p=>p.spawns[1].origin=[0,0,0], p=>p.spawns[0].origin=[0,0,-40],
    p=>p.spawns[0].origin=[NaN,0,0], p=>p.spawns[0].classname='info_player_deathmatch',p=>p.spawns.pop()]) {
    const patch=manifest(bytes);modify(patch);
    assert.throws(()=>buildSpawnExperiment(bytes,patch));
  }
});
