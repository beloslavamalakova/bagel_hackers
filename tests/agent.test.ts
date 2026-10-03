import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, completionDecision, isTaskId, liveConfig, MODEL } from '../server/agent';
import { nextScene, scenes } from '../src/data/scenes';
import { partyTaskIds, taskIds } from '../src/types/game';
import { encodePcm } from '../src/lib/audio';
test('three agent encounters form one complete journey',()=>{
 assert.deepEqual(taskIds,['street_recommendation','street_directions','bakery_order']);
 assert.equal(nextScene('street_recommendation'),'street_directions');
 assert.equal(nextScene('street_directions'),'bakery_order');
 assert.equal(nextScene('bakery_order'),'completed');
 for(const id of taskIds){assert.equal(scenes[id].id,id);assert.ok(scenes[id].hintWords.length>0);assert.ok(scenes[id].fullHint);assert.ok(buildPrompt(id).includes(scenes[id].npcName));}
});
test('first-party story is a separate beginner A1 three-encounter journey',()=>{
 assert.deepEqual(partyTaskIds,['party_arrival','party_meet_someone','party_join_chat']);
 assert.equal(nextScene('party_arrival','first_party'),'party_meet_someone');
 assert.equal(nextScene('party_meet_someone','first_party'),'party_join_chat');
 assert.equal(nextScene('party_join_chat','first_party'),'completed');
 for(const id of partyTaskIds){
  assert.equal(scenes[id].languageLevel,'A1');
  assert.ok(scenes[id].localKnowledge);
  assert.match(buildPrompt(id),/A1 level/);
  assert.match(buildPrompt(id),/A1 sentences/);
 }
 assert.equal(isTaskId('party_join_chat'),true);
});
test('all encounters support beginner clarification requests in simple English',()=>{
 for(const id of [...taskIds,...partyTaskIds]){
  const prompt=buildPrompt(id);
  assert.match(prompt,/UNDERSTANDING SUPPORT:/);
  assert.match(prompt,/En anglais, s’il vous plaît/);
  assert.match(prompt,/translate your last French sentence in simple English/);
  assert.match(prompt,/do not treat it as completing the objective/);
 }
});
test('Live config uses native audio with client VAD turn detection and interruption',()=>{
 assert.equal(MODEL,'gemini-3.8-live');
 const c=liveConfig('street_recommendation');
 assert.deepEqual(c.responseModalities,['AUDIO']);
 assert.equal(c.realtimeInputConfig?.automaticActivityDetection?.disabled,true);
 assert.equal(c.realtimeInputConfig?.activityHandling,'START_OF_ACTIVITY_INTERRUPTS');

 assert.ok(c.inputAudioTranscription);assert.ok(c.outputAudioTranscription);
 assert.equal(c.thinkingConfig,undefined);
});
test('completion rejects stale scene, false success, duplicate, and greeting-only calls',()=>{
 const current='street_recommendation';
 assert.equal(completionDecision(current,{taskId:'street_directions',success:true},false,1).accepted,false);
 assert.equal(completionDecision(current,{taskId:current,success:false},false,1).accepted,false);
 assert.equal(completionDecision(current,{taskId:current,success:true},true,1).accepted,false);
 assert.equal(completionDecision(current,{taskId:current,success:true},false,0).accepted,false);
 assert.equal(completionDecision(current,{taskId:current,success:true},false,1).accepted,true);
 assert.equal(isTaskId('intro'),false);assert.equal(isTaskId('bakery_order'),true);
});
test('bakery order requires a separate follow-up speech turn',()=>{
 assert.equal(completionDecision('bakery_order',{taskId:'bakery_order',success:true},false,1).accepted,false);
 assert.equal(completionDecision('bakery_order',{taskId:'bakery_order',success:true},false,2).accepted,true);
 assert.match(buildPrompt('bakery_order'),/WAIT for a NEW learner spoken turn/);
});
test('microphone PCM preserves every native sample, clamps and uses little-endian',()=>{
 const bytes=Buffer.from(encodePcm(new Float32Array([1,-1,.5,2])),'base64');
 assert.equal(bytes.length,8);
 assert.equal(bytes.readInt16LE(0),32767);assert.equal(bytes.readInt16LE(2),-32768);
 assert.equal(bytes.readInt16LE(4),16383);assert.equal(bytes.readInt16LE(6),32767);
});
