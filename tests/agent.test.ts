import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, completionDecision, isTaskId, liveConfig, MODEL } from '../server/agent';
import { nextScene, scenes } from '../src/data/scenes';
import { taskIds } from '../src/types/game';
import { encodePcm } from '../src/lib/audio';
test('four agent encounters form one complete journey',()=>{
 assert.equal(nextScene('street_recommendation'),'street_directions');
 assert.equal(nextScene('street_directions'),'bakery_order');
 assert.equal(nextScene('bakery_order'),'bakery_smalltalk');
 assert.equal(nextScene('bakery_smalltalk'),'completed');
 for(const id of taskIds){assert.equal(scenes[id].id,id);assert.ok(scenes[id].hintWords.length>0);assert.ok(scenes[id].fullHint);assert.ok(buildPrompt(id).includes(scenes[id].npcName));}
});
test('Live config uses requested native audio model and hands-free client turn detection and interruption',()=>{
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
test('bakery requires a separate follow-up and small talk at least three speech turns',()=>{
 for(const [id,min] of [['bakery_order',2],['bakery_smalltalk',3]] as const){
  assert.equal(completionDecision(id,{taskId:id,success:true},false,min-1).accepted,false);
  assert.equal(completionDecision(id,{taskId:id,success:true},false,min).accepted,true);
 }
 assert.match(buildPrompt('bakery_order'),/WAIT for a NEW learner spoken turn/);
 assert.match(buildPrompt('bakery_smalltalk'),/THREE meaningful learner turns/);
});
test('microphone PCM preserves every native sample, clamps and uses little-endian',()=>{
 const bytes=Buffer.from(encodePcm(new Float32Array([1,-1,.5,2])),'base64');
 assert.equal(bytes.length,8);
 assert.equal(bytes.readInt16LE(0),32767);assert.equal(bytes.readInt16LE(2),-32768);
 assert.equal(bytes.readInt16LE(4),16383);assert.equal(bytes.readInt16LE(6),32767);
});
