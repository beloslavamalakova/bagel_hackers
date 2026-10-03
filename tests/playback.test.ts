import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AudioPlayer } from '../src/lib/audio';
test('barge-in stops every queued chunk and the next reply starts at current time',()=>{
 const sources:any[]=[];
 const context={currentTime:1,destination:{},createBuffer:(_channels:number,n:number,rate:number)=>({duration:n/rate,getChannelData:()=>new Float32Array(n)}),createBufferSource:()=>{const s={connect:()=>{},disconnect:()=>{},stop:()=>{s.stopped=true;},start:(time:number)=>{s.time=time;},stopped:false,time:0,onended:null};sources.push(s);return s;}};
 const player=new AudioPlayer(context as unknown as AudioContext);
 const chunk=Buffer.alloc(24000*2).toString('base64');
 player.play(chunk,'audio/pcm;rate=24000');player.play(chunk,'audio/pcm;rate=24000');
 assert.ok(player.pendingMs>2000);
 player.stop();assert.ok(sources.every(s=>s.stopped));assert.equal(player.pendingMs,0);
 context.currentTime=2;player.play(chunk,'audio/pcm;rate=24000');
 assert.equal(sources[2].time,2.035);
});
