import { useEffect, useState } from 'react';
import type { SceneConfig } from '../../types/game';
import { NPC } from '../NPC';
import { Icon } from '../Icon';
import { AmbientActor, AmbientCyclist, AmbientPedestrian } from './AmbientActor';
interface Props {source:SceneConfig;destination?:SceneConfig;narration?:string;feedback?:string;onDone:()=>void}
const narrations:Record<SceneConfig['id'],string>={
 street_recommendation:'Camille points you toward a busier street near the bakery.',
 street_directions:'You follow the directions toward Maison Lumière.',
 bakery_order:'Croissant in hand, you find a sunny little spot by the window.',
 party_arrival:'Emma welcomes you in. The music is playing and the evening begins.',
 party_meet_someone:'You learn Lucas’s name—and share a little about yourself.',
 party_join_chat:'You join the conversation. The party feels a little less new.',
 club_refused:'Sneakers squeaking, you hurry round the corner to Chez Margaux.',
 club_boutique:'Dressed to impress, you walk back to Le Velours.',
 club_return:'The velvet rope lifts. Paris nightlife, here you come.',
};
export function TravelSequence({source,destination,narration,feedback,onDone}:Props) {
 const [phase,setPhase]=useState(0);
 const party=source.environment==='first-party';
 const night=source.id.startsWith('club_');
 const entering=destination?.id==='bakery_order';
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers=[setTimeout(()=>setPhase(1),reduced?100:1100),setTimeout(()=>setPhase(2),reduced?300:3900),setTimeout(()=>setPhase(3),reduced?650:5400),setTimeout(onDone,reduced?1200:6900)];
  return()=>timers.forEach(clearTimeout);
 },[onDone]);
 return <div className={`travel-sequence travel-${source.id} phase-${phase} ${entering?'entering-bakery':''} ${party?'party-transition':''} ${night?'travel-night':''}`} role="status" aria-label={narration??narrations[source.id]}>
  <div className="travel-camera">
   <img className="travel-background" src={`/scenes/${source.environment}.svg`} alt=""/>
   <img className="travel-destination" src={`/scenes/${destination?.environment??source.environment}.svg`} alt=""/>
   {!party&&<div className="travel-midground"><Storefronts names={night?['BAR TABAC','CHEZ MARGAUX','LE VELOURS','KEBAB']:['LE PETIT CAFÉ','FLEURISTE','MAISON LUMIÈRE','LIBRAIRIE']}/></div>}
   {!party&&<div className="travel-pavement"/>}
   <div className="travel-goodbye"><NPC id={source.id}/></div>
   {!party&&<div className="travel-foreground" aria-hidden="true">
    <AmbientCyclist speed={7} delay={-.5} position={85} scale={.85}/>
    <AmbientActor kind={source.id==='street_directions'?'scooter':'waiter'} speed={5} delay={-1.7} direction="left" position={89} scale={.95} tone="#7e8b72"/>
    <AmbientPedestrian speed={4.5} delay={-2.4} position={98} scale={1.35} tone="#ac8c72"/>
    <svg className="travel-pigeon" viewBox="0 0 100 70"><path d="M45 44Q3 19 3 8q30 5 42 24Q57 2 95 9L58 43l-3 17-19-4Z" fill="#75817b"/><circle cx="57" cy="36" r="8" fill="#596761"/></svg>
   </div>}
   {entering&&<div className="bakery-entry"><div className="bakery-entry-sign">Maison Lumière<small>BOULANGERIE · FAIT AVEC AMOUR</small></div><div className="doorway"><div className="door-light"/><div className="bakery-door"><div className="door-glass"/><span className="door-handle"/><span className="door-lettering">Entrez</span></div><svg className="entry-bell" viewBox="0 0 32 40"><path d="M7 27V14q0-12 9-12t9 12v13l4 4H3Z" fill="#c4a065"/><circle cx="16" cy="34" r="4" fill="#8e7046"/></svg></div></div>}
   <div className="travel-arrival"><NPC id={destination?.id??source.id}/></div>
  </div>
  <div className="travel-letterbox top"/><div className="travel-letterbox bottom"/>
  <div className="travel-topline"><Icon name={phase===0?'check':'pin'} size={16}/><span>{phase===0?`${source.npcName} understood you`:party?phase<3?'THE CONVERSATION CONTINUES':destination?`NEXT UP · ${destination.location}`:'YOUR PARTY STORY':phase<3?night?'NIGHT WALK · OBERKAMPF':'WALKING THROUGH LE MARAIS':destination?`ARRIVING · ${destination.location}`:'YOUR PARIS STORY'}</span><span className="travel-step">{party?'AT THE PARTY':phase===0?'A DOOR OPENS':'ON FOOT · PARIS'}</span></div>
  <div className="travel-narration"><span>{phase===0?'YOUR FRENCH MOVED THE WORLD':'THE NEXT CHAPTER'}</span><h2>{narration??narrations[source.id]}</h2>{phase===0&&<p>{feedback||source.feedback}</p>}<div className="travel-progress"><span/></div></div>
 </div>;
}
function Storefronts({names}:{names:string[]}){return <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>{[0,400,800,1200].map((x,i)=><g key={x} transform={`translate(${x} 0)`}><rect width="395" height="700" fill={i%2?'#d9c8a7':'#eadcbd'}/><path d="M0 178h395M0 355h395" stroke="#bdaa87" strokeWidth="9"/>{[45,155,265].map(wx=><g key={wx}>{[50,220].map(y=><g key={y}><rect x={wx} y={y} width="68" height="112" fill="#6d8377"/><path d={`M${wx+34} ${y}v112M${wx} ${y+52}h68`} stroke="#ddcead" strokeWidth="5"/><path d={`M${wx-9} ${y+80}h86M${wx-9} ${y+110}h86`} stroke="#4d584c" strokeWidth="4"/></g>)}</g>)}<rect x="15" y="399" width="365" height="285" fill={i%2?'#8a5040':'#5d725d'}/><text x="197" y="450" textAnchor="middle" fontFamily="Georgia" fill="#efe1bd" fontSize="26" letterSpacing="4">{names[i]}</text><path d="M15 469h365l12 48H3Z" fill={i%2?'#b07859':'#9baf89'}/><rect x="38" y="540" width="142" height="134" fill="#bea37b"/><rect x="214" y="540" width="142" height="134" fill="#bea37b"/></g>)}</g></svg>}
