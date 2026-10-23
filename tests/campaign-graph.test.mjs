import test from 'node:test';
import assert from 'node:assert/strict';
import {mapReferences,reachableMaps} from '../scripts/audit-campaign.mjs';
const e=(index,pairs)=>({index,pairs});
test('campaign edges distinguish supported fields, unsafe map commands and unknown references',()=>{
 const result=mapReferences([
  e(0,[['classname','cof_changelevel'],['message','C_START']]),
  e(1,[['classname','trigger_changelevel'],['map','c_start2']]),
  e(2,[['classname','trigger_command'],['netname','echo starting; changelevel c_start2; map c_intro']]),
  e(3,[['classname','trigger_changevalue'],['m_iszNewValue','c_start2']]),
 ],new Set(['c_start','c_start2','c_intro']));
 assert.deepEqual(result.edges.map(x=>[x.to,x.kind]),[['c_start','native-map-field'],['c_start2','native-map-field'],['c_start2','server-changelevel-command'],['c_intro','singleplayer-command-review']]);
 assert.equal(result.unresolved.length,1);assert.equal(result.unresolved[0].entity,3);
});
test('conditional graph traversal terminates through backtracking and excludes unavailable maps',()=>{
 assert.deepEqual(reachableMaps([{map:'c_intro',edges:[{to:'c_start'}]},{map:'c_start',edges:[{to:'c_start2'},{to:'missing'}]},{map:'c_start2',edges:[{to:'c_start'}]},{map:'custom',edges:[]}],'c_intro'),['c_intro','c_start','c_start2']);
});
