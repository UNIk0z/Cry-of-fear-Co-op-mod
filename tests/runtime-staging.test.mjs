import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256} from '../scripts/bsp.mjs';

test('runtime staging creates independent files, excludes saves, verifies critical hashes and refuses merging',
  {skip:process.platform!=='win32'},()=>{
    const scratch=path.resolve(import.meta.dirname,'../../../work/test-runs');fs.mkdirSync(scratch,{recursive:true});
    const root=fs.mkdtempSync(path.join(scratch,'runtime-'));
    try {
      const source=path.join(root,'game');fs.mkdirSync(source);
      const critical=['cof.exe','CoFLaunchApp.exe','hlds.exe','Core.dll','hw.dll','swds.dll','steam_api.dll',
        'cryoffear/cl_dlls/hl.dll','cryoffear/cl_dlls/client.dll','cryoffear/liblist.gam',
        'cryoffear/maps/c_cof_bridge.bsp','cryoffear/maps/c_start2.bsp','config.cfg','cryoffear/autoexec.cfg'];
      for(const filename of [...critical,'SAVE/private.sav','cryoffear/SAVE/private.sav','cryoffear/models/example.mdl']) {
        const filepath=path.join(source,filename);fs.mkdirSync(path.dirname(filepath),{recursive:true});
        fs.writeFileSync(filepath,`synthetic ${filename}`);
      }
      const script=path.resolve(import.meta.dirname,'../scripts/stage-runtime.ps1');
      const run=out=>spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass',
        '-File',script,'-GameDirectory',source,'-OutputDirectory',out],{encoding:'utf8',timeout:30000});
      const output=path.join(root,'snapshot'), result=run(output);
      assert.equal(result.status,0,result.stderr);
      const manifest=JSON.parse(fs.readFileSync(path.join(output,'runtime-manifest.json')));
      assert.equal(manifest.criticalAndConfigHashes.length,critical.length);
      assert.equal(manifest.sharedWritableAssets,false);
      assert.equal(fs.existsSync(path.join(output,'SAVE/private.sav')),false);
      assert.equal(fs.existsSync(path.join(output,'cryoffear/SAVE/private.sav')),false);
      for(const entry of manifest.criticalAndConfigHashes){
        assert.equal(sha256(fs.readFileSync(path.join(source,entry.relative))),entry.sha256);
        assert.equal(sha256(fs.readFileSync(path.join(output,entry.relative))),entry.sha256);
      }
      fs.writeFileSync(path.join(output,'cof.exe'),'changed snapshot only');
      assert.equal(fs.readFileSync(path.join(source,'cof.exe'),'utf8'),'synthetic cof.exe');
      assert.equal(run(output).status,1);
    } finally {fs.rmSync(root,{recursive:true,force:true});}
  });
