import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VoiceActivity } from '../src/lib/voiceActivity';
function setup(){
 const events:string[]=[],chunks:Float32Array[]=[];
 const vad=new VoiceActivity({start:()=>events.push('start'),audio:s=>chunks.push(s),end:()=>events.push('end')});
 const feed=(ms:number,amplitude:number,playing=false)=>{for(let elapsed=0;elapsed<ms;elapsed+=20)vad.push(new Float32Array(320).fill(amplitude),16000,playing);};
 return {vad,events,chunks,feed};
}
test('background noise and brief clicks do not start a turn; pre-roll keeps the first syllable',()=>{
 const s=setup();s.feed(2000,.001);s.feed(40,.03);s.feed(400,.001);
 assert.deepEqual(s.events,[]);
 s.feed(200,.02);assert.deepEqual(s.events,['start']);
 assert.ok(s.chunks.some(c=>Math.abs(c[0]-.02)<.0001));
 assert.ok(s.chunks.some(c=>Math.abs(c[0]-.001)<.0001),'Pre-speech context must be preserved.');
});
test('hesitation does not split a sentence and repeated turns work without clicking',()=>{
 const s=setup();s.feed(600,.02);s.feed(800,0);assert.equal(s.vad.active,true);
 s.feed(600,.02);s.feed(1200,0);assert.deepEqual(s.events,['start','end']);
 s.feed(2000,0);s.feed(500,.02);s.feed(1200,0);
 assert.deepEqual(s.events,['start','end','start','end']);
});
test('manual turns stay open through pauses until explicitly finished',()=>{
 const events:string[]=[],chunks:Float32Array[]=[];
 const vad=new VoiceActivity({start:()=>events.push('start'),audio:s=>chunks.push(s),end:()=>events.push('end')},true);
 const feed=(ms:number,amplitude:number)=>{for(let elapsed=0;elapsed<ms;elapsed+=20)vad.push(new Float32Array(320).fill(amplitude),16000);};
 feed(400,.02);assert.deepEqual(events,[]);assert.deepEqual(chunks,[]);
 vad.start();feed(400,.02);feed(1600,0);
 assert.equal(vad.active,true);assert.deepEqual(events,['start']);
 vad.finish();assert.deepEqual(events,['start','end']);
 feed(400,.02);assert.deepEqual(events,['start','end']);
 vad.start();feed(100,.02);vad.finish();
 assert.deepEqual(events,['start','end','start','end']);
});
test('sustained speech can barge in during playback; small residual echo does not',()=>{
 const s=setup();s.feed(2000,.003,true);assert.deepEqual(s.events,[]);
 s.feed(120,.035,true);assert.equal(s.vad.active,true);assert.deepEqual(s.events,['start']);
 s.vad.finish();s.vad.finish();assert.deepEqual(s.events,['start','end']);
 s.feed(1500,0);assert.deepEqual(s.events,['start','end']);
});
