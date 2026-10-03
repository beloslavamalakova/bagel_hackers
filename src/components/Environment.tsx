import type { SceneConfig } from '../types/game';
import { NPC } from './NPC';
import { Icon } from './Icon';
import { WorldLayer } from './world/WorldLayer';
import type { PointerEvent } from 'react';
export function Environment({scene,speaking=false,intro=false}:{scene:SceneConfig;speaking?:boolean;intro?:boolean}){
 const moveCamera=(event:PointerEvent<HTMLDivElement>)=>{
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const bounds=event.currentTarget.getBoundingClientRect();
   event.currentTarget.style.setProperty('--camera-x',`${((event.clientX-bounds.left)/bounds.width-.5)*5}px`);
   event.currentTarget.style.setProperty('--camera-y',`${((event.clientY-bounds.top)/bounds.height-.5)*3}px`);
 };
 return <div onPointerMove={moveCamera} onPointerLeave={event=>{event.currentTarget.style.setProperty('--camera-x','0px');event.currentTarget.style.setProperty('--camera-y','0px');}} className={`environment ${scene.environment} ${intro?'intro-environment':''}`}>
  <div className="environment-camera"><img className="environment-bg" src={`/scenes/${scene.environment}.svg`} alt={scene.environment==='club-entrance'?'A Paris street at night outside a nightclub with a neon sign and a velvet rope':scene.environment==='friperie'?'A cosy vintage clothing shop at night with racks of shirts and a wall of shoes':scene.environment==='first-party'?'A Paris nightclub with violet spotlights, a DJ booth, dancing guests and an amber-lit lounge bar':scene.id.startsWith('street')?'An illustrated Parisian street with cream stone buildings and wrought-iron balconies':'A warmly lit French bakery with fresh croissants and coffee'} />
  <WorldLayer scene={scene.id}/></div>
  <div className="scene-vignette"/>
  {!intro&&<div className="location-tag"><Icon name="pin" size={15}/>{scene.location}<span>PARIS, FRANCE</span></div>}
  <NPC id={scene.id} speaking={speaking}/>
  {!intro&&<div className="npc-nameplate"><span className={`presence-dot ${speaking?'talking':''}`}/><div><strong>{scene.npcName}</strong><span>{scene.id==='bakery_order'?'Your bakery host':scene.id==='club_boutique'?'The shop owner':scene.id.startsWith('club_')?'The bouncer':scene.id.startsWith('party_')?'A fellow party guest':'A friendly local'}</span></div><Icon name="sound" size={17}/></div>}
  <div className="scene-caption">{intro?'A little French goes a long way.':scene.id.startsWith('party_')?'One hello can start a whole conversation.':'No maps. No translations. Just you, and a little French.'}</div>
 </div>
}
