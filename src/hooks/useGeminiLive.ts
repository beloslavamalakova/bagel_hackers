import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskId, TranscriptLine, VoiceStatus } from '../types/game';
import { AudioPlayer, encodePcm } from '../lib/audio';
import { MicrophoneCapture, type CaptureStats } from '../lib/microphone';
import { primeConversationAudio } from '../lib/audioContext';
import { VoiceActivity } from '../lib/voiceActivity';
import type { SideEventId } from '../data/ambient';
interface Resources { socket:WebSocket; player:AudioPlayer; microphone?:MicrophoneCapture; ready:boolean; canSpeak:boolean; completed:boolean; vad?:VoiceActivity; removeStateListener?:()=>void }
export function useGeminiLive(scene:TaskId|null,onComplete:(id:TaskId,feedback?:string)=>void,sideEvent?:SideEventId) {
 const [status,setStatus]=useState<VoiceStatus>('offline'),[error,setError]=useState<string|null>(null);
 const [transcript,setTranscript]=useState<TranscriptLine[]>([]),[level,setLevel]=useState(0);
 const [audioBlocked,setAudioBlocked]=useState(false);
 const [diagnostics,setDiagnostics]=useState<CaptureStats|null>(null),[learnerTurns,setLearnerTurns]=useState(0);
 const resources=useRef<Resources | undefined>(undefined),generation=useRef(0),callback=useRef(onComplete);callback.current=onComplete;
 const suspended=useRef(false),completionTimers=useRef<ReturnType<typeof setTimeout>[]>([]),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
 const dispose=useCallback(()=>{generation.current++;clearTimers();completionTimers.current.forEach(clearTimeout);completionTimers.current=[];const r=resources.current;resources.current=undefined;r?.removeStateListener?.();r?.socket.close();r?.microphone?.close();r?.player.close();},[]);
 useEffect(()=>{dispose();setStatus('offline');setTranscript([]);setError(null);return dispose;},[scene,dispose]);
 const connect=useCallback(async()=>{
  if(!scene)return;
  dispose();setError(null);setTranscript([]);setLearnerTurns(0);setAudioBlocked(false);setStatus('connecting');
  const own=generation.current;
  const active=()=>own===generation.current;
  let player:AudioPlayer|undefined;
  try {
   const audioContext=primeConversationAudio();
   player=new AudioPlayer(audioContext,false);const output=player;
   void output.unlock().catch(()=>{if(active())setAudioBlocked(true);});
   const socket=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/live`);
   const r:Resources={socket,player:output,ready:false,canSpeak:false,completed:false};resources.current=r;
   let completion:{id:TaskId;feedback?:string}|undefined,completionScheduled=false;
   let replyRevision=0,captureStarted=false,startPending=false;
   const contextState=()=>{if(active()&&captureStarted)setAudioBlocked(audioContext.state!=='running');};
   audioContext.addEventListener('statechange',contextState);
   r.removeStateListener=()=>audioContext.removeEventListener('statechange',contextState);
   const finish=()=>{
    if(!completion||completionScheduled||!active())return;
    completionScheduled=true;const done=completion;
    completionTimers.current.push(setTimeout(()=>{if(active())callback.current(done.id,done.feedback);},output.pendingMs+350));
   };
   const fail=(message:string)=>{if(!active())return;dispose();setLevel(0);setError(message);setStatus('error');};
   const send=(msg:object)=>{if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(msg));};
   const startCapture=async()=>{
    if(!r.microphone||!r.ready||!active()||captureStarted||startPending)return;
    startPending=true;
    // resume() may stay pending under autoplay policy. Surface a user-gesture recovery.
    const blocked=setTimeout(()=>{if(active()&&audioContext.state!=='running')setAudioBlocked(true);},1200);
    try {
     await r.microphone.start(false);
     if(active()){captureStarted=true;r.canSpeak=output.pendingMs===0;setAudioBlocked(false);setStatus(r.canSpeak?'ready':'speaking');}
    } finally {clearTimeout(blocked);startPending=false;}
   };
   r.vad=new VoiceActivity({
    start:()=>{
     replyRevision++;r.canSpeak=false;clearTimers();output.stop();setStatus('listening');
     send({type:'activity_start'});
    },
    audio:(samples,sampleRate)=>send({type:'audio',data:encodePcm(samples),sampleRate}),
    end:()=>{
     send({type:'activity_end'});setLearnerTurns(n=>n+1);
     if(r.completed||suspended.current)return;
     setStatus('thinking');const revision=replyRevision;
     timers.current.push(setTimeout(()=>{if(active()&&replyRevision===revision&&!r.vad?.active)fail('No voice reply arrived. Retry the connection.');},25000));
    }
   },true);
   socket.onopen=()=>send({type:'start',scene,...(sideEvent?{sideEvent}:{})});
   socket.onmessage=event=>{
    if(!active())return;
    try {
     const msg=JSON.parse(event.data);
     if(msg.type==='error'){fail(msg.message);return;}
     if(msg.type==='ready'){r.ready=true;clearTimers();void startCapture().catch(e=>fail(e.message));}
     // Listening is driven by the local microphone, not optional Gemini VAD events.
     // Late chunks from an interrupted generation must not re-enter the playback queue.
     if(msg.type==='interrupted'){output.stop();r.canSpeak=false;if(!r.vad?.active&&!suspended.current)setStatus('thinking');}
     if(msg.type==='audio'&&!r.vad?.active&&!suspended.current&&!document.hidden){
      clearTimers();
      if(output.context.state!=='running')setAudioBlocked(true);
      r.canSpeak=false;output.play(msg.data,msg.mimeType);if(captureStarted)setStatus('speaking');
     }
     if(msg.type==='transcript'){
      setTranscript(lines=>{const last=lines.at(-1);return last&&last.speaker===msg.speaker?[...lines.slice(0,-1),{...last,text:last.text+msg.text}]:[...lines,{id:Date.now()+Math.random(),speaker:msg.speaker,text:msg.text}];});
     }
     if(msg.type==='task_complete'&&msg.taskId===scene&&!completion){
      completion={id:scene,feedback:msg.shortFeedback};r.completed=true;
      void r.microphone?.stop().catch(()=>{});
      completionTimers.current.push(setTimeout(finish,12000));
     }
     if(msg.type==='turn_complete'){
      if(completion)finish();
      else if(!r.vad?.active&&captureStarted){
       clearTimers();const revision=replyRevision;
       timers.current.push(setTimeout(()=>{if(active()&&revision===replyRevision&&!r.vad?.active){r.canSpeak=true;setStatus('ready');}},output.pendingMs+80));
      }
     }
    }catch{fail('Could not process voice audio. Retry this conversation.');}
   };
   socket.onerror=()=>fail('Could not reach the voice server. Check your connection and retry.');
   socket.onclose=()=>{if(active()){if(completion)finish();else fail('Your voice connection was lost. Retry to continue.');}};
   timers.current.push(setTimeout(()=>{if(active()&&!r.ready)fail('Voice setup took too long. Please retry.');},30000));
   const mic=await MicrophoneCapture.create((samples,stats)=>{
    if(!active()||!r.ready||!r.vad?.active||r.completed||suspended.current||document.hidden)return;
    let energy=0;for(const sample of samples)energy+=sample*sample;
    setLevel(Math.min(1,Math.sqrt(energy/samples.length)*10));setDiagnostics(stats);
    if(socket.readyState!==WebSocket.OPEN)return;
    if(socket.bufferedAmount>=256*1024){fail('The network is too slow for live voice. Retry your connection.');return;}
    r.vad?.push(samples,stats.sampleRate,output.pendingMs>0);

   },audioContext);
   if(!active()){mic.close();return;}r.microphone=mic;await startCapture();
  }catch(e){if(!active()){player?.close();return;}dispose();setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Microphone access was denied. Allow it in your browser’s site settings, then retry.':e instanceof Error?e.message:'Could not prepare your microphone.');setStatus('error');}
 },[scene,sideEvent,dispose]);
 const startSpeaking=useCallback(()=>{const r=resources.current;if(!r?.ready||!r.canSpeak||r.completed||suspended.current||document.hidden)return;r.canSpeak=false;r.vad?.start();},[]);
 const finishSpeaking=useCallback(()=>{resources.current?.vad?.finish();},[]);
 // Pause the main session while an optional NPC owns the microphone, preserving its context.
 const suspend=useCallback((value:boolean)=>{suspended.current=value;const r=resources.current;if(value&&r){r.canSpeak=false;r.player.stop();r.vad?.finish();}else if(!value&&r?.ready){r.canSpeak=true;setStatus('ready');}},[]);
 useEffect(()=>{const visibility=()=>{const r=resources.current;if(document.hidden){if(r)r.canSpeak=false;r?.player.stop();r?.vad?.finish();}else if(r?.ready&&!r.vad?.active&&!suspended.current){r.canSpeak=true;setStatus('ready');}};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[suspend]);
 const enableAudio=async()=>{try{await resources.current?.player.unlock();await resources.current?.microphone?.context.resume();setAudioBlocked(false);}catch{setError('Enable sound in your browser settings.');}};
 return {status,error,notice:null,transcript,level,audioBlocked,diagnostics,connect,startSpeaking,finishSpeaking,suspend,learnerTurns,enableAudio};
}
