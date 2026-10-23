import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectFile, compareMaps} from './bsp.mjs';

export const REQUIRED_MAPS = ['c_start', 'c_start2', 'c_village2', 'c_cof_village2',
  'c_city', 'c_cof_city', 'c_bridge', 'c_cof_bridge'];
const PAIRS = [['c_village2', 'c_cof_village2'], ['c_city', 'c_cof_city'], ['c_bridge', 'c_cof_bridge']];

// Fail if a destination exists. Resolve symlinks so exports cannot land inside inputs.
export function prepareOutput(destination, sources) {
  const resolved = path.resolve(destination);
  if (fs.existsSync(resolved)) throw new Error(`Output already exists: ${resolved}; choose a fresh directory`);
  const parent = path.dirname(resolved);
  if (!fs.existsSync(parent)) throw new Error(`Create output parent first: ${parent}`);
  const physical = path.join(fs.realpathSync(parent), path.basename(resolved));
  for (const source of sources) {
    const relative = path.relative(fs.realpathSync(source), physical);
    if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
      throw new Error('Output must be outside the source game/map directory');
    }
  }
  fs.mkdirSync(resolved);
  return resolved;
}

const writeJson = (directory, name, data) => fs.writeFileSync(path.join(directory, name), JSON.stringify(data, null, 2) + '\n', {flag: 'wx'});
function exportMap(output, name, report) {
  // The .ent export is the exact entity text as bytes; JSON retains ordered duplicate keys.
  fs.writeFileSync(path.join(output, `${name}.ent`), Buffer.from(report.entityText, 'latin1'), {flag: 'wx'});
  const {entityText, ...json} = report;
  writeJson(output, `${name}.json`, json);
}

export function main(args) {
  const [command, ...params] = args;
  if (command === 'inspect' && params.length === 2) {
    const [source, dest] = params;
    const report = inspectFile(source);
    const output = prepareOutput(dest, [path.dirname(source)]);
    exportMap(output, path.basename(source, path.extname(source)), report);
    console.log(`Inspected ${report.entities.length} entities; reports: ${output}`);
  } else if (command === 'compare' && params.length === 3) {
    const [leftPath, rightPath, dest] = params;
    const left = inspectFile(leftPath), right = inspectFile(rightPath);
    const report = compareMaps(left, right);
    const output = prepareOutput(dest, [path.dirname(leftPath), path.dirname(rightPath)]);
    writeJson(output, 'comparison.json', report);
    console.log(`Compared maps; ${report.classDifferences.length} class count differences; report: ${output}`);
  } else if (command === 'scan' && params.length === 2) {
    const [maps, dest] = params;
    // Read the directory first: access failures must not be reported as missing files.
    const listed = fs.readdirSync(maps, {withFileTypes: true});
    const filenames = new Map(listed.filter(e => e.isFile()).map(e => [e.name.toLowerCase(), e.name]));
    const reports = new Map();
    const results = [];
    for (const name of REQUIRED_MAPS) {
      const actual = filenames.get(`${name}.bsp`);
      if (!actual) { results.push({map: name, status: 'MISSING'}); continue; }
      try {
        const report = inspectFile(path.join(maps, actual));
        reports.set(name, report);
        results.push({map: name, status: 'INSPECTED', sha256: report.sha256, entities: report.entities.length});
      } catch (error) { results.push({map: name, status: 'FAILED', error: error.message}); }
    }
    const output = prepareOutput(dest, [maps]);
    for (const [name, report] of reports) exportMap(output, name, report);
    const comparisons = [];
    for (const [left, right] of PAIRS) {
      if (!reports.has(left) || !reports.has(right)) continue;
      const name = `${left}--${right}.json`;
      writeJson(output, name, compareMaps(reports.get(left), reports.get(right)));
      comparisons.push(name);
    }
    writeJson(output, 'manifest.json', {schemaVersion: 1, mapsDirectory: path.resolve(maps), results, comparisons,
      gameplayStatus: 'NOT TESTED', note: 'Inspection is not gameplay validation. No source files were written.'});
    console.log(`Inspected ${reports.size}/${REQUIRED_MAPS.length} requested maps; ${comparisons.length} comparisons; reports: ${output}`);
    if (results.some(r => r.status !== 'INSPECTED')) process.exitCode = 2;
  } else {
    throw new Error('Usage: cof-inspect.mjs inspect MAP.bsp OUT_DIR | compare ORIGINAL.bsp COOP.bsp OUT_DIR | scan MAPS_DIR OUT_DIR');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}
