import type { AmbientEvent } from '../../data/ambient';
import { ActorArt } from './AmbientActor';
import { Icon } from '../Icon';
export function AmbientMoment({event,canEngage,onEngage,onIgnore}:{event:AmbientEvent;canEngage:boolean;onEngage:()=>void;onIgnore:()=>void}) {
 return <div className={`ambient-moment moment-${event.id}`}>
  <div className="moment-animation" aria-hidden="true"><ActorArt kind={event.id==='coffee_spill'?'waiter':event.id==='dog_hello'?'dog':event.id==='lost_tourists'?'tourists':'pedestrian'} tone="#966e59"/>
   {(event.id==='coffee_spill'||event.id==='pigeon_chaos')&&<div className="moment-bystander"><ActorArt kind="guest" tone="#6b7b65"/></div>}
   {event.id==='coffee_spill'&&<><span className="falling-cup">☕</span><span className="coffee-splash"/><span className="reaction-mark">!</span></>}
   {event.id==='dropped_scarf'&&<svg className="dropped-scarf" viewBox="0 0 80 40"><path d="M4 4q21 25 33 10t36 8l-4 14q-30-20-41 0T0 16Z" fill="#aa4d3d"/></svg>}
   {event.id==='pigeon_chaos'&&<><span className="stolen-croissant">🥐</span><svg className="pecking-pigeon" viewBox="0 0 90 70"><ellipse cx="35" cy="43" rx="24" ry="15" fill="#7e8981"/><path d="m42 39 18-26q22-6 20 9L60 45" fill="#6b7d72"/><path d="m78 20 12 4-13 4" fill="#c29458"/><circle cx="73" cy="19" r="2" fill="#30372e"/></svg></>}
   <span className="moment-speech">{event.id==='coffee_spill'?'Oh là là !':event.id==='dog_hello'?'Biscuit !':event.id==='pigeon_chaos'?'Mon croissant !':event.id==='lost_tourists'?'Par ici ?':'…'}</span>
  </div>
  <div className="moment-prompt"><div><span className="moment-eyebrow"><Icon name="spark" size={12}/>A LITTLE PARIS MOMENT · OPTIONAL</span><strong>{event.title}</strong><p>{event.description}</p></div><div className="moment-actions"><button disabled={!canEngage} onClick={onEngage}>{event.action}<Icon name="arrow" size={13}/></button><button className="moment-ignore" onClick={onIgnore}>Keep exploring</button></div></div>
 </div>;
}
