import { useEffect, useRef, useState } from 'react';
import type { AmbientEvent } from '../../data/ambient';
import type { HintLevel, SceneConfig, VoiceStatus } from '../../types/game';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { ConversationPanel } from '../ConversationPanel';
import { Icon } from '../Icon';
export function SideConversation({event,scene,onExit}:{event:AmbientEvent;scene:SceneConfig;onExit:(success:boolean)=>void}) {
 const [done,setDone]=useState(false),[hint,setHint]=useState<HintLevel>(0),[turns,setTurns]=useState(0);
 const doneRef=useRef(false),previous=useRef<VoiceStatus>('offline');
 const exitRef=useRef(onExit);exitRef.current=onExit;
 const voice=useGeminiLive(scene.id,()=>{doneRef.current=true;setDone(true);},event.id);
 useEffect(()=>{void voice.connect();},[voice.connect]);
 useEffect(()=>{
  if(previous.current==='listening'&&voice.status==='thinking')setTurns(n=>n+1);
  previous.current=voice.status;
 },[voice.status]);
 useEffect(()=>{
  if(done){const timer=setTimeout(()=>exitRef.current(true),1700);return()=>clearTimeout(timer);}
  if(turns>=2&&voice.status==='ready'){
   const timer=setTimeout(()=>{if(!doneRef.current)exitRef.current(false);},1800);return()=>clearTimeout(timer);
  }
 },[done,turns,voice.status]);
 const config:SceneConfig={...scene,npcName:event.npcName,npcRole:event.npcRole,objective:event.objective,greeting:event.greeting,hintWords:event.hintWords,fullHint:event.fullHint,followupHint:undefined};
 return <div className="side-conversation"><div className="side-heading"><span><Icon name="spark" size={14}/>A LITTLE DETOUR</span><button onClick={()=>exitRef.current(false)} aria-label="Leave optional conversation"><Icon name="close" size={16}/></button></div>{done?<div className="side-reward" role="status"><span>✦</span><h2>French, in the moment.</h2><p>One little act. One new Paris memory.</p><strong>+1 Paris star</strong></div>:<><div className="side-return-note">Your main conversation is waiting.<br/>You can leave this moment at any time.</div><ConversationPanel scene={config} hintLevel={hint} onHint={()=>setHint(n=>Math.min(2,n+1) as HintLevel)} voice={turns>=2&&voice.status==='ready'?{...voice,status:'thinking'}:voice}/></>}</div>;
}
