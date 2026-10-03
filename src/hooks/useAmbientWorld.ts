import { useEffect, useRef, useState } from 'react';
import { ambientEvents, type PlannedEvent, type SideEventId } from '../data/ambient';
import type { TaskId } from '../types/game';
export function useAmbientWorld(scene:TaskId,plan:PlannedEvent[],blocked:boolean,engaged:boolean) {
 const [visible,setVisible]=useState<SideEventId|null>(null);
 const triggered=useRef(false);
 useEffect(()=>{
  const entry=plan.find(e=>e.scene===scene);
  if(!entry||blocked||triggered.current)return;
  const timer=setTimeout(()=>{triggered.current=true;setVisible(entry.event);},entry.delayMs);
  return()=>clearTimeout(timer);
 },[scene,plan,blocked]);
 useEffect(()=>{
  if(!visible||engaged)return;
  const timer=setTimeout(()=>setVisible(null),ambientEvents[visible].durationMs);
  return()=>clearTimeout(timer);
 },[visible,engaged]);
 return {event:visible?ambientEvents[visible]:null,dismiss:()=>setVisible(null)};
}
