import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { SpeechStream, type SpeechTransport } from '../src/lib/speechStream';
import { parseAudioChunk } from '../server/audio';
import { pcmMimeType } from '../src/lib/audio';
import { MicrophoneCapture } from '../src/lib/microphone';
function transport() {
  const events: {type:string;data?:string;rate?:number}[]=[];
  const wire:SpeechTransport={start:()=>events.push({type:'start'}),audio:(data,rate)=>events.push({type:'audio',data,rate}),end:()=>events.push({type:'end'})};
  return {events,wire};
}
test('several seconds of speech reach the server without sample loss at common device rates',()=>{
  for(const rate of [16000,24000,44100,48000]){
    const {events,wire}=transport();const stream=new SpeechStream(wire);
    const total=rate*5+127;
    let count=0;
    while(count<total){
      const length=Math.min(2048,total-count);
      const samples=Float32Array.from({length},(_,i)=>Math.sin((count+i)*2*Math.PI*440/rate)*.1);
      count+=length;
      stream.push(samples,{durationMs:count/rate*1000,rms:.07,peak:.1,sampleRate:rate});
    }
    assert.equal(stream.finish(),true);
    assert.equal(events[0].type,'start');assert.equal(events.at(-1)?.type,'end');
    const chunks=events.filter(e=>e.type==='audio');
    const duration=chunks.reduce((sum,e)=>sum+parseAudioChunk(e.data,e.rate).durationMs,0);
    assert.ok(Math.abs(duration-total/rate*1000)<.0001);
    assert.equal(chunks.reduce((sum,e)=>sum+Buffer.from(e.data!,'base64').length/2,0),total);
    assert.equal(stream.finish(),false);assert.equal(events.filter(e=>e.type==='end').length,1);
  }
});
test('a tiny click or a silent recording never starts a hallucination-prone Gemini turn',()=>{
  for(const stats of [
    {durationMs:100,rms:.05,peak:.1,sampleRate:48000},
    {durationMs:8000,rms:0,peak:0,sampleRate:48000}
  ]){
    const {events,wire}=transport();const stream=new SpeechStream(wire);
    stream.push(new Float32Array(2048),stats);assert.equal(stream.finish(),false);assert.deepEqual(events,[]);
  }
});
test('server preserves the real PCM rate and rejects malformed rate/byte framing',()=>{
  assert.equal(parseAudioChunk(Buffer.alloc(24000*2).toString('base64'),48000).durationMs,500);
  assert.equal(pcmMimeType(44100),'audio/pcm;rate=44100');
  assert.throws(()=>parseAudioChunk('AA==',48000));
  assert.throws(()=>parseAudioChunk('AAA=',undefined));
  assert.throws(()=>parseAudioChunk('AAA=',0));
});
test('the worklet flushes the final partial chunk BEFORE stop acknowledgement and mixes stereo',()=>{
  const messages: {type:string;samples?:Float32Array;recordingId?:number}[]=[];
  let Constructor:any;
  class Processor {
    port={onmessage:null as ((event:{data:object})=>void)|null,postMessage:(message:any)=>messages.push(message)};
  }
  runInNewContext(readFileSync('public/pcm-capture.js','utf8'),{AudioWorkletProcessor:Processor,Float32Array,registerProcessor:(_name:string,ctor:any)=>{Constructor=ctor;}});
  const worklet=new Constructor();
  worklet.port.onmessage({data:{type:'start'}});
  worklet.process([[new Float32Array(128).fill(.4),new Float32Array(128).fill(.2)]]);
  assert.equal(messages.length,0);
  worklet.port.onmessage({data:{type:'stop',recordingId:7}});
  assert.deepEqual(messages.map(m=>m.type),['audio','stopped']);
  assert.equal(messages[0].samples?.length,128);
  assert.ok(Math.abs(messages[0].samples![0]-.3)<1e-6);
  assert.equal(messages[1].recordingId,7);
  worklet.process([[new Float32Array(128).fill(.8)]]);assert.equal(messages.length,2);
});
test('MicrophoneCapture.stop waits for the actual worklet flush, including delayed final audio',async()=>{
  const delivered:number[]=[];
  const commands:any[]=[];
  const port={onmessage:null as ((event:{data:any})=>void)|null,postMessage:(message:any)=>commands.push(message)};
  const context={sampleRate:48000,resume:async()=>{},close:async()=>{}};
  const disconnect={disconnect:()=>{}};
  // Exercise the real class against fake WebAudio resources; no microphone hardware needed.
  const capture=new (MicrophoneCapture as any)(context,{getTracks:()=>[]},disconnect,{...disconnect,port},disconnect,(samples:Float32Array)=>delivered.push(samples.length));
  await capture.start();
  let resolved=false;
  const stopped=capture.stop().then((result:any)=>{resolved=true;return result;});
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(resolved,false,'A slow worklet must not be truncated by a 60ms timeout.');
  port.onmessage!({data:{type:'audio',samples:new Float32Array(333).fill(.1)}});
  assert.equal(resolved,false);
  const command=commands.at(-1);assert.equal(command.type,'stop');
  port.onmessage!({data:{type:'stopped',recordingId:command.recordingId}});
  const result=await stopped;
  assert.deepEqual(delivered,[333]);assert.equal(result.chunks[0].length,333);
  assert.equal(result.durationMs,333/48000*1000);
  capture.close();
});
