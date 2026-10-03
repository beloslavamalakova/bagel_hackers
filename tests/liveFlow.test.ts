import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { runInNewContext } from 'node:vm';

// Exercise the real React hook and AudioWorklet transport with fake browser I/O.
// This catches wiring/startup races that isolated PCM and configuration tests miss.
test('ready-before-permission, hands-free repeat turns and barge-in work through the real hook',async()=>{
 const bundle=await build({entryPoints:['src/hooks/useGeminiLive.ts'],bundle:true,write:false,format:'cjs',platform:'browser',plugins:[{name:'react-harness',setup(b){b.onResolve({filter:/^react$/},()=>({path:'react',namespace:'harness'}));b.onLoad({filter:/.*/,namespace:'harness'},()=>({contents:'export const useState=globalThis.react.useState,useRef=globalThis.react.useRef,useEffect=globalThis.react.useEffect,useCallback=globalThis.react.useCallback;',loader:'js'}));}}]});
 const states:any[]=[],effects:(()=>any)[]=[],commands:any[]=[],sources:any[]=[],contexts:any[]=[],sockets:any[]=[],worklets:any[]=[],timers=new Map<number,()=>void>();
 let timerId=0,allowMic:(s:any)=>void=()=>{};
 const micPermission=new Promise(resolve=>{allowMic=resolve;});
 class Context {
  state='suspended';sampleRate=48000;currentTime=1;destination={};
  audioWorklet={addModule:async()=>{}};
  constructor(){contexts.push(this);}
  addEventListener(){}removeEventListener(){}
  resume(){this.state='running';return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
  createMediaStreamSource(){return {connect:()=>{},disconnect:()=>{}};}
  createGain(){return {gain:{value:1},connect:()=>{},disconnect:()=>{}};}
  createBuffer(_c:number,n:number,rate:number){return {duration:n/rate,getChannelData:()=>new Float32Array(n)};}
  createBufferSource(){const source={connect:()=>{},disconnect:()=>{},start:()=>{},stop:()=>{source.stopped=true;},stopped:false,onended:null};sources.push(source);return source;}
 }
 class Worklet {port={onmessage:null as any,postMessage:(message:any)=>commands.push(message)};constructor(){worklets.push(this);}connect(){}disconnect(){}}
 class Socket {
  static OPEN=1;readyState=1;bufferedAmount=0;onopen:any;onmessage:any;onclose:any;onerror:any;messages:any[]=[];
  constructor(){sockets.push(this);}send(message:string){this.messages.push(JSON.parse(message));}close(){this.readyState=3;}
  receive(message:any){this.onmessage({data:JSON.stringify(message)});}
 }
 const module={exports:{} as any};
 runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,react:{
  useState:(initial:any)=>{const index=states.length;states.push(initial);return [initial,(next:any)=>{states[index]=typeof next==='function'?next(states[index]):next;}];},
  useRef:(value:any)=>({current:value}),useCallback:(fn:any)=>fn,useEffect:(fn:any)=>effects.push(fn)
 },AudioContext:Context,AudioWorkletNode:Worklet,WebSocket:Socket,navigator:{mediaDevices:{getUserMedia:()=>micPermission}},document:{hidden:false,addEventListener:()=>{},removeEventListener:()=>{}},location:{protocol:'http:',host:'localhost'},Float32Array,Uint8Array,DataView,DOMException,Date,Math,JSON,
 btoa:(s:string)=>Buffer.from(s,'binary').toString('base64'),atob:(s:string)=>Buffer.from(s,'base64').toString('binary'),setTimeout:(fn:()=>void)=>{timers.set(++timerId,fn);return timerId;},clearTimeout:(id:number)=>timers.delete(id)});
 const voice=module.exports.useGeminiLive('street_recommendation',()=>{});effects.forEach(fn=>fn());
 const connecting=voice.connect();const socket=sockets[0];socket.onopen();socket.receive({type:'ready'});
 assert.equal(states[0],'connecting','Do not claim listening before microphone permission/capture.');
 allowMic({getTracks:()=>[{stop:()=>{}}]});await connecting;
 assert.equal(states[0],'ready');assert.equal(contexts.length,1,'Mic and playback must share the unlocked context.');
 assert.equal(commands.filter(c=>c.type==='start').length,1);
 const frame=(amplitude:number)=>worklets[0].port.onmessage({data:{type:'audio',samples:new Float32Array(960).fill(amplitude)}});
 socket.receive({type:'audio',data:Buffer.alloc(48000).toString('base64'),mimeType:'audio/pcm;rate=24000'});
 for(let i=0;i<6;i++)frame(.04);
 assert.equal(states[0],'listening');assert.ok(sources[0].stopped,'Barge-in must stop playback locally, without waiting for a server signal.');
 assert.equal(socket.messages.filter((m:any)=>m.type==='activity_start').length,1);
 assert.ok(socket.messages.some((m:any)=>m.type==='audio'));
 const before=sources.length;socket.receive({type:'audio',data:Buffer.alloc(48000).toString('base64'),mimeType:'audio/pcm;rate=24000'});
 assert.equal(sources.length,before,'Late interrupted audio must not restart playback.');
 for(let i=0;i<60;i++)frame(0);
 assert.equal(states[0],'thinking');assert.equal(socket.messages.filter((m:any)=>m.type==='activity_end').length,1);
 socket.receive({type:'audio',data:Buffer.alloc(48000).toString('base64'),mimeType:'audio/pcm;rate=24000'});
 assert.equal(states[0],'speaking');
 for(let i=0;i<8;i++)frame(.04);for(let i=0;i<60;i++)frame(0);
 assert.equal(socket.messages.filter((m:any)=>m.type==='activity_start').length,2);
 assert.equal(socket.messages.filter((m:any)=>m.type==='activity_end').length,2);
 voice.toggleMute();const sent=socket.messages.length;for(let i=0;i<20;i++)frame(.04);assert.equal(socket.messages.length,sent);
 voice.toggleMute();for(let i=0;i<8;i++)frame(.04);assert.equal(socket.messages.filter((m:any)=>m.type==='activity_start').length,3);
 voice.suspend(true);const paused=socket.messages.length;for(let i=0;i<20;i++)frame(.04);assert.equal(socket.messages.length,paused);
 voice.suspend(false);for(let i=0;i<8;i++)frame(.04);assert.equal(socket.messages.filter((m:any)=>m.type==='activity_start').length,4);
 // Opposite startup ordering on retry: microphone ready before Gemini setup.
 await voice.connect();assert.equal(contexts.length,1);assert.equal(contexts[0].state,'running');
 const retry=sockets[1];retry.onopen();assert.equal(states[0],'connecting');
 retry.receive({type:'ready'});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(states[0],'ready');assert.equal(commands.filter(c=>c.type==='start').length,2);
 for(let i=0;i<8;i++)worklets[1].port.onmessage({data:{type:'audio',samples:new Float32Array(960).fill(.04)}});
 assert.equal(retry.messages.filter((m:any)=>m.type==='activity_start').length,1);

});
