import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeNetworkLog} from '../scripts/analyze-network-log.mjs';
test('diagnostics retain map, actor, repeat and case context without equating unknown overflow with root cause',()=>{
 const r=analyzeNetworkLog('[STORYCOOP] CASE NATIVE 01\r\nmap : cof_campaign_01\r\nSZ_GetSpace: overflow on netchan->message\r\nWARNING: reliable overflow for friend\r\nunknown(1) overflowed\r\n[STORYCOOP] CASE CONVERTED 02\r\nmap : c_start2_story_rc1\r\nSteam validation rejected\r\nToo many entities in visible packet list\r\nToo many entities in visible packet list',{client:'P2'});
 assert.equal(r.counts['reliable-sizebuf'],1);assert.equal(r.counts['client-overflowed'],1);assert.equal(r.counts['authentication-rejected'],1);
 assert.equal(r.events[0].case,'NATIVE:01');assert.equal(r.events[0].map,'cof_campaign_01');assert.equal(r.events[0].client,'P2');
 assert.equal(r.events.at(-1).case,'CONVERTED:02');assert.equal(r.repeatedDiagnosticLines[0].count,2);
});
test('empty/clean/truncated logs never constitute network fix evidence',()=>{
 for(const s of ['', 'map : c_start2_story_rc1\nplayer connected', 'SZ_GetSpace: overflow'])assert.equal(analyzeNetworkLog(s).conclusion,'NO_MATCHING_DIAGNOSTICS_IN_SUPPLIED_LOG');
 const r=analyzeNetworkLog('Netchan_Clear() : reliable length not 0\nWARNING: datagram overflowed for player\nMESSAGE_END called, but message buffer from .dll had overflowed');
 assert.equal(r.counts['reliable-clear-nonzero'],1);assert.equal(r.counts['unreliable-datagram-overflow'],1);assert.equal(r.counts['dll-message-overflow'],1);
});
