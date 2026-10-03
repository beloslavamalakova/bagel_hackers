import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ambientEvents, planAmbientEvents, isSideEventId } from '../src/data/ambient';
import { buildSidePrompt, completionDecision, liveConfig } from '../server/agent';
import { taskIds } from '../src/types/game';

test('ambient choreography is deterministic, weighted, and limited to two unique moments',()=>{
 const seen=new Set<string>();
 for(let seed=0;seed<200;seed++){
  const plan=planAmbientEvents(seed);
  assert.deepEqual(plan,planAmbientEvents(seed));
  assert.ok(plan.length<=2);
  assert.equal(new Set(plan.map(e=>e.event)).size,plan.length);
  for(const item of plan){
   assert.ok(ambientEvents[item.event].sceneIds.includes(item.scene));
   assert.ok(item.delayMs>=9000&&item.delayMs<=14000);
   seen.add(item.event);
  }
 }
 assert.equal(seen.size,5,'All five optional moments should occur across different runs.');
});
test('main Live setup retains its voice, tool, client turn boundaries and bakery safeguards',()=>{
 for(const id of taskIds){
  const config=liveConfig(id);
  assert.equal(config.realtimeInputConfig?.automaticActivityDetection?.disabled,true);
  assert.deepEqual(config.responseModalities,['AUDIO']);
  assert.ok(config.inputAudioTranscription&&config.outputAudioTranscription);
  assert.match(config.systemInstruction as string,/CURRENT OBJECTIVE:/);
  assert.doesNotMatch(config.systemInstruction as string,/OPTIONAL short side encounter/);
 }
 assert.equal(completionDecision('bakery_order',{taskId:'bakery_order',success:true},false,1).accepted,false);
});
test('optional NPC setup reuses Live audio but has its own objective and one-turn success guard',()=>{
 const config=liveConfig('street_recommendation','coffee_spill');
 assert.match(config.systemInstruction as string,/OPTIONAL short side encounter/);
 assert.match(config.systemInstruction as string,/Thomas/);
 assert.match(config.systemInstruction as string,/rewards ONLY this side encounter/);
 assert.equal(config.realtimeInputConfig?.automaticActivityDetection?.disabled,true);
 assert.equal(completionDecision('street_recommendation',{taskId:'street_recommendation',success:true},false,1,'coffee_spill').accepted,true);
 assert.equal(completionDecision('street_recommendation',{taskId:'street_directions',success:true},false,1,'coffee_spill').accepted,false);
 assert.equal(completionDecision('street_recommendation',{taskId:'street_recommendation',success:true},true,1,'coffee_spill').accepted,false);
 assert.equal(completionDecision('street_recommendation',{taskId:'street_recommendation',success:true},false,0,'coffee_spill').accepted,false);
 assert.match(buildSidePrompt('street_recommendation','coffee_spill'),/after the second, politely end/);
 assert.equal(isSideEventId('arbitrary_prompt'),false);
});
