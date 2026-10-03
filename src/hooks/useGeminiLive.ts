import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskId, TranscriptLine, VoiceStatus } from '../types/game';
import { AudioPlayer, encodePcm, pcmMimeType } from '../lib/audio';
import { MicrophoneCapture, type CaptureResult, type CaptureStats } from '../lib/microphone';
import { SpeechStream } from '../lib/speechStream';
interface Resources {
  socket:WebSocket; player:AudioPlayer; microphone?:MicrophoneCapture;
  speech?:SpeechStream; recording:boolean; stopping:boolean;
}
interface Diagnostics extends CaptureStats { receivedMs?:number }
export function useGeminiLive(scene:TaskId|null,onComplete:(id:TaskId,feedback?:string)=>void) {
  const [status,setStatus]=useState<VoiceStatus>('offline');
  const [error,setError]=useState<string|null>(null);
  const [notice,setNotice]=useState<string|null>(null);
  const [transcript,setTranscript]=useState<TranscriptLine[]>([]);
  const [level,setLevel]=useState(0),[seconds,setSeconds]=useState(0);
  const [audioBlocked,setAudioBlocked]=useState(false);
  const [diagnostics,setDiagnostics]=useState<Diagnostics|null>(null);
  const lastRecording=useRef<CaptureResult | undefined>(undefined);
  const resources=useRef<Resources | undefined>(undefined);
  const generation=useRef(0);
  const currentStatus=useRef<VoiceStatus>('offline');
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const callback=useRef(onComplete);callback.current=onComplete;
  const preparing=useRef(false);
  const stopRef=useRef<()=>void>(()=>{});
  const update=(value:VoiceStatus)=>{currentStatus.current=value;setStatus(value);};
  const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
  const dispose=useCallback(()=>{
    generation.current++;preparing.current=false;clearTimers();
    const r=resources.current;resources.current=undefined;
    r?.socket.close();r?.microphone?.close();r?.player.close();
  },[]);
  useEffect(()=>{
    dispose();update('offline');setError(null);setNotice(null);setTranscript([]);setAudioBlocked(false);
    setDiagnostics(null);lastRecording.current=undefined;
    return dispose;
  },[scene,dispose]);
  const connect=useCallback(async()=>{
    if(!scene)return;
    dispose();setError(null);setNotice(null);setAudioBlocked(false);setTranscript([]);update('connecting');
    const own=generation.current;
    let player:AudioPlayer|undefined;
    try {
      player=new AudioPlayer(new AudioContext({sampleRate:24000}));
      const output=player;
      void output.unlock().catch(()=>{if(own===generation.current)setAudioBlocked(true);});
      const socket=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/live`);
      const r:Resources={socket,player:output,recording:false,stopping:false};resources.current=r;
      let completion:{id:TaskId;feedback?:string}|undefined,completed=false,agentReady=false,greetingDone=false;
      const active=()=>resources.current===r && own===generation.current;
      const scheduleComplete=()=>{
        if(!completion||completed||!active())return;
        completed=true;const done=completion;
        timers.current.push(setTimeout(()=>{if(active()){update('ready');callback.current(done.id,done.feedback);}},output.pendingMs+450));
      };
      const fail=(message:string)=>{
        if(!active())return;
        r.recording=false;r.stopping=false;r.microphone?.close();r.microphone=undefined;
        clearTimers();output.stop();setLevel(0);
        socket.onmessage=null;socket.onerror=null;socket.onclose=null;socket.close();
        if(completion){setError(null);scheduleComplete();}
        else{setError(message);update('error');}
      };
      let audioWatchdog:ReturnType<typeof setTimeout>|undefined;
      socket.onopen=()=>{if(active())socket.send(JSON.stringify({type:'start',scene}));};
      socket.onmessage=event=>{
        if(!active())return;
        try {
          const msg=JSON.parse(event.data);
          if(msg.type==='ready') {
            agentReady=true;
            if(r.microphone)update('thinking');
            timers.current.push(setTimeout(()=>{if(active()&&currentStatus.current==='thinking')fail('No greeting arrived. Please retry the voice connection.');},25000));
          }
          if(msg.type==='error'){fail(msg.message);return;}
          if(msg.type==='audio') {
            // Never let a late NPC event stop capture or change its acceptance of microphone chunks.
            if(r.recording)return;
            if(output.context.state!=='running')setAudioBlocked(true);
            output.play(msg.data,msg.mimeType);
            if(r.microphone)update('speaking');
            clearTimeout(audioWatchdog);
            audioWatchdog=setTimeout(()=>{if(active()&&currentStatus.current==='speaking'){if(completion)scheduleComplete();else fail('The voice response stalled. Please retry this encounter.');}},output.pendingMs+15000);
            timers.current.push(audioWatchdog);
          }
          if(msg.type==='transcript')setTranscript(lines=>{
            const last=lines.at(-1);
            if(last&&last.speaker===msg.speaker)return [...lines.slice(0,-1),{...last,text:last.text+msg.text}];
            return [...lines,{id:Date.now()+Math.random(),speaker:msg.speaker,text:msg.text}];
          });
          if(msg.type==='capture_received')setDiagnostics(d=>d?{...d,receivedMs:msg.durationMs}:d);
          if(msg.type==='interrupted')output.stop();
          if(msg.type==='task_complete'&&msg.taskId===scene&&!completion){
            completion={id:msg.taskId,feedback:msg.shortFeedback};
            timers.current.push(setTimeout(scheduleComplete,12000));
          }
          if(msg.type==='turn_complete') {
            greetingDone=true;
            // A delayed greeting/previous-turn completion must never terminate a learner recording.
            if(r.recording)return;
            clearTimers();
            if(completion)scheduleComplete();
            else timers.current.push(setTimeout(()=>{if(active()&&r.microphone&&currentStatus.current!=='error')update('ready');},output.pendingMs+80));
          }
        }catch{fail('The voice response could not be played. Please retry the encounter.');}
      };
      socket.onerror=()=>fail('Could not reach the voice server. Check your connection and retry.');
      socket.onclose=()=>{if(active()&&!completed)fail('Your voice connection was lost. Retry to continue this encounter.');};
      timers.current.push(setTimeout(()=>{if(active()&&currentStatus.current==='connecting')fail('Microphone or voice setup took too long. Please retry.');},30000));
      // Set up permissions and the AudioWorklet before displaying the speak button.
      const microphone=await MicrophoneCapture.create((samples,stats)=>{
        if(!active()||!r.recording)return;
        let energy=0;for(const sample of samples)energy+=sample*sample;
        setLevel(Math.min(1,Math.sqrt(energy/Math.max(1,samples.length))*10));
        setSeconds(Math.floor(stats.durationMs/1000));
        setDiagnostics(stats);
        if(socket.readyState===WebSocket.OPEN)r.speech?.push(samples,stats);
      });
      if(!active()||currentStatus.current==='error'){microphone.close();return;}
      r.microphone=microphone;
      if(agentReady){
        // The greeting may already have finished during a microphone permission dialog.
        update(!greetingDone?'thinking':output.pendingMs>0?'speaking':'ready');
        if(greetingDone)timers.current.push(setTimeout(()=>{if(active()&&!r.recording&&currentStatus.current==='speaking')update('ready');},output.pendingMs+80));
      }
    }catch(e) {
      if(own!==generation.current){player?.close();return;}
      dispose();
      const denied=e instanceof DOMException&&e.name==='NotAllowedError';
      setError(denied?'Microphone access was denied. Allow the microphone in your browser’s site settings, then retry.':e instanceof Error?e.message:'Could not prepare audio. Check your microphone and retry.');
      update('error');
    }
  },[scene,dispose]);
  const startSpeaking=useCallback(async()=>{
    const r=resources.current;
    if(!r?.microphone||currentStatus.current!=='ready'||preparing.current||r.recording||r.stopping)return;
    preparing.current=true;
    setError(null);setNotice(null);setSeconds(0);setLevel(0);
    try {
      await r.player.unlock();r.player.stop();
      r.speech=new SpeechStream({
        start:()=>r.socket.send(JSON.stringify({type:'activity_start'})),
        audio:(data,sampleRate)=>r.socket.send(JSON.stringify({type:'audio',data,sampleRate})),
        end:()=>r.socket.send(JSON.stringify({type:'activity_end'}))
      });
      // The worklet receives 'start' only once setup is complete. The first syllable is buffered.
      await r.microphone.start();
      if(resources.current!==r)return;
      r.recording=true;r.stopping=false;update('listening');clearTimers();
      timers.current.push(setTimeout(()=>{if(resources.current===r&&r.recording)stopRef.current();},60000));
    }catch(e) {if(resources.current===r){setError(e instanceof Error?e.message:'Could not start the microphone.');update('error');}}
    finally{preparing.current=false;}
  },[]);
  const stopSpeaking=useCallback(async()=>{
    const r=resources.current;
    if(!r?.microphone||!r.recording||r.stopping)return;
    r.stopping=true;clearTimers();
    try {
      // Await the acknowledgement after the final PCM message, not an arbitrary timeout.
      const captured=await r.microphone.stop();
      if(resources.current!==r)return;
      lastRecording.current=captured;
      setDiagnostics(captured);setLevel(0);r.recording=false;r.stopping=false;
      const sent=r.speech?.finish();
      if(!sent) {
        setNotice(captured.durationMs<600?'That recording was too short. Click once, say your whole sentence, then click again.':'Your microphone picked up almost no sound. Check the selected microphone and speak closer to it.');
        update('ready');return;
      }
      update('thinking');
      timers.current.push(setTimeout(()=>{if(resources.current===r&&currentStatus.current==='thinking'){setError('No reply arrived. Please retry the voice connection.');update('error');}},25000));
    }catch(e){if(resources.current===r){r.recording=false;r.stopping=false;setError(e instanceof Error?e.message:'Could not send the recording.');update('error');}}
  },[]);
  stopRef.current=()=>{void stopSpeaking();};
  useEffect(()=>{
    // Only leaving the page ends a recording. Normal focus changes and pointer-up events do not.
    const visibility=()=>{if(document.hidden)void stopSpeaking();};
    document.addEventListener('visibilitychange',visibility);
    return()=>document.removeEventListener('visibilitychange',visibility);
  },[stopSpeaking]);
  const enableAudio=async()=>{try{await resources.current?.player.unlock();setAudioBlocked(false);}catch{setError('Audio is blocked. Enable sound in your browser settings.');}};
  const replayRecording=async()=>{
    const captured=lastRecording.current,r=resources.current;
    if(!captured||!r||r.recording)return;
    const samples=new Float32Array(captured.chunks.reduce((sum,chunk)=>sum+chunk.length,0));
    if(!samples.length)return;
    let offset=0;for(const chunk of captured.chunks){samples.set(chunk,offset);offset+=chunk.length;}
    await r.player.unlock();r.player.stop();
    r.player.play(encodePcm(samples),pcmMimeType(captured.sampleRate));
  };
  return {status,error,notice,transcript,level,seconds,audioBlocked,diagnostics,connect,startSpeaking,stopSpeaking,enableAudio,replayRecording};
}
