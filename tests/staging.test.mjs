import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REQUIRED_MAPS} from '../scripts/cof-inspect.mjs';
import {sha256} from '../scripts/bsp.mjs';

test('PowerShell staging copies only requested maps, verifies hashes, and refuses existing/outside destinations',
  {skip: process.platform !== 'win32'}, () => {
    const scratch = path.resolve(import.meta.dirname, '../../../work/test-runs');
    fs.mkdirSync(scratch, {recursive: true});
    const root = fs.mkdtempSync(path.join(scratch, 'staging-'));
    try {
      const maps = path.join(root, 'source maps'); fs.mkdirSync(maps);
      const originals = new Map();
      for (const name of REQUIRED_MAPS) {
        const content = Buffer.from(`synthetic staging fixture for ${name}`);
        fs.writeFileSync(path.join(maps, name + '.bsp'), content);
        originals.set(name, sha256(content));
      }
      fs.writeFileSync(path.join(maps, 'unrelated.bsp'), 'leave behind');
      const script = path.resolve(import.meta.dirname, '../scripts/stage-map-samples.ps1');
      const run = output => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
        '-File', script, '-MapsDirectory', maps, '-OutputDirectory', output], {encoding: 'utf8', timeout: 30000});
      const output = path.join(root, 'staged maps');
      const result = run(output);
      assert.equal(result.status, 0, result.stderr);
      const manifest = JSON.parse(fs.readFileSync(path.join(output, 'staging-manifest.json'), 'utf8'));
      assert.equal(manifest.files.length, 8);
      assert.equal(manifest.originalFilesWritten, false);
      assert.equal(fs.existsSync(path.join(output, 'unrelated.bsp')), false);
      for (const entry of manifest.files) {
        const name = path.basename(entry.name, '.bsp');
        assert.equal(entry.sha256, originals.get(name));
        assert.equal(sha256(fs.readFileSync(path.join(output, entry.name))), originals.get(name));
        assert.equal(sha256(fs.readFileSync(path.join(maps, entry.name))), originals.get(name));
      }
      assert.equal(run(output).status, 1);
      const outside = path.join(root, '../../../outputs/disallowed-test-destination');
      const rejected = run(outside);
      assert.equal(rejected.status, 1);
      assert.match(rejected.stderr, /workspace work/);
      assert.equal(fs.existsSync(outside), false);
      fs.unlinkSync(path.join(maps, 'c_start.bsp'));
      const incomplete = path.join(root, 'incomplete');
      assert.equal(run(incomplete).status, 1);
      assert.equal(fs.existsSync(incomplete), false);
    } finally { fs.rmSync(root, {recursive: true, force: true}); }
  });
