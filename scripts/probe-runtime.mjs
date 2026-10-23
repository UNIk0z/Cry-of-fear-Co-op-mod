import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {sha256} from './bsp.mjs';

// One bounded attempt using an isolated snapshot, never the original installation.
const [rootArgument, reportArgument] = process.argv.slice(2);
if (!rootArgument || !reportArgument) throw new Error('Usage: probe-runtime.mjs ISOLATED_ROOT NEW_REPORT.json');
const root = fs.realpathSync(rootArgument);
const work = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../work'));
const relative = path.relative(work, root);
if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Runtime must be a child of workspace work/');
const reportPath = path.resolve(reportArgument);
const reportRelative = path.relative(work, reportPath);
if (reportRelative.startsWith('..') || path.isAbsolute(reportRelative) || fs.existsSync(reportPath)) throw new Error('Choose a new report file below workspace work/');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'runtime-manifest.json')));
if (manifest.originalFilesWritten !== false || manifest.sharedWritableAssets !== false
  || path.resolve(manifest.destination) !== root) throw new Error('Invalid isolated runtime manifest');
for (const entry of manifest.criticalAndConfigHashes) {
  const filepath = path.resolve(root, entry.relative);
  const rel = path.relative(root, filepath);
  if (rel.startsWith('..') || path.isAbsolute(rel) || sha256(fs.readFileSync(filepath)) !== entry.sha256) {
    throw new Error(`Baseline snapshot hash mismatch: ${entry.relative}`);
  }
}
const args = ['-console', '-game', 'cryoffear', '-ip', '127.0.0.1', '-port', '27019', '-nomaster',
  '-condebug', '+maxplayers', '2', '+map', 'c_cof_bridge'];
const started = Date.now();
let child;
try {
  child = spawn(path.join(root, 'hlds.exe'), args, {cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']});
} catch (error) {
  const report = {schemaVersion: 1, executable: path.join(root, 'hlds.exe'), args,
    elapsedMs: Date.now()-started, result: 'FAILED_TO_START', launchError: error.message,
    errorCode: error.code, gameplayStatus: 'NOT TESTED', note: 'Synchronous OS process-creation failure; no native server was started.'};
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2)+'\n', {flag:'wx'});
  console.error(JSON.stringify(report));
  process.exit(1);
}
const chunks = []; let kept = 0, timedOut = false, launchError;
const keep = data => { if (kept < 65536) { const part = data.subarray(0, 65536 - kept); chunks.push(part); kept += part.length; } };
child.stdout.on('data', keep); child.stderr.on('data', keep);
child.on('error', error => { launchError = error.message; });
const graceful = setTimeout(() => { if (!child.stdin.destroyed) child.stdin.end('quit\n'); }, 10000);
const deadline = setTimeout(() => { timedOut = true; child.kill(); }, 15000);
const exit = await new Promise(resolve => child.on('close', (code, signal) => resolve({code, signal})));
clearTimeout(graceful); clearTimeout(deadline);
const logs = [];
for (const filepath of [path.join(root, 'qconsole.log'), path.join(root, 'cryoffear/qconsole.log')]) {
  if (fs.existsSync(filepath)) logs.push({path: filepath, tail: fs.readFileSync(filepath, 'utf8').slice(-65536)});
}
const report = {schemaVersion: 1, executable: path.join(root, 'hlds.exe'), args, elapsedMs: Date.now()-started,
  exit, timedOut, launchError, capturedOutput: Buffer.concat(chunks).toString('utf8'), logs,
  result: launchError ? 'FAILED_TO_START' : 'REQUIRES_LOG_REVIEW', gameplayStatus: 'NOT TESTED',
  note: 'Native dedicated-server diagnostic only. No connected clients. Exit/survival alone does not establish successful map load or multiplayer.'};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2)+'\n', {flag:'wx'});
console.log(JSON.stringify({exit, timedOut, launchError, elapsedMs:report.elapsedMs, outputBytes:kept, logs:logs.length, reportPath}));
