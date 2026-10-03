import type { CSSProperties } from 'react';
export type ActorKind='pedestrian'|'waiter'|'cyclist'|'dog'|'guest'|'baguette'|'tourists'|'scooter';
export interface ActorProps {kind?:ActorKind;direction?:'left'|'right';speed?:number;delay?:number;position?:number;scale?:number;tone?:string;stationary?:boolean;className?:string}
export function ActorArt({kind='pedestrian',tone='#7e8c76'}:{kind?:ActorKind;tone?:string}) {
 const cycle=kind==='cyclist',scooter=kind==='scooter',guest=kind==='guest';
 return <svg viewBox="0 0 180 230" className={`actor-art actor-${kind}`} aria-hidden="true">
  <ellipse cx="90" cy="219" rx="55" ry="6" fill="#443a2e" opacity=".13"/>
  {(cycle||scooter)&&<g fill="none" stroke="#44574d" strokeWidth="4"><circle className="wheel" cx="38" cy="188" r={cycle?'29':'22'}/><circle className="wheel" cx="142" cy="188" r={cycle?'29':'22'}/>{cycle?<path d="m38 188 35-51 30 51H38l18-53h56l30 53M107 138l-5-27h21M68 131H48"/>:<><path d="M36 187h74l20-72h20"/><path d="M120 172q-46-49-79 3" stroke={tone} strokeWidth="22"/></>}</g>}
  <g className="actor-person">
   <path className="actor-leg actor-leg-a" d={cycle?'M90 129 72 165l29 14':guest?'M73 148 90 183l-15 25':'M77 142 65 207'} stroke="#48504b" strokeWidth="16" fill="none" strokeLinecap="round"/>
   <path className="actor-leg actor-leg-b" d={cycle?'M101 131 125 150l-17 32':guest?'M97 148 112 184l-8 22':'M100 142 112 207'} stroke="#3a433d" strokeWidth="16" fill="none" strokeLinecap="round"/>
   <path d="M67 73q21-11 39 2l10 73H59Z" fill={tone}/>
   <path className="actor-arm" d={kind==='waiter'?'M70 84 45 122l-24-8':cycle||scooter?'M101 85 126 107l4 24':guest?'M105 85 123 112l-16-4':'M104 87 123 142'} stroke={tone} strokeWidth="13" fill="none" strokeLinecap="round"/>
   <path d="M84 55v23" stroke="#d4a17b" strokeWidth="14"/>
   <ellipse cx="88" cy="43" rx="20" ry="26" fill="#d8ac87"/>
   <path d="M68 46q-10-40 25-33 19 1 17 32l-10-18q-13 11-32 7Z" fill="#5a4838"/>
   <path d="M94 48h1" stroke="#493e32" strokeWidth="3" strokeLinecap="round"/>
   <path d="M76 211h-15M109 212h15" stroke="#3e3933" strokeWidth="7" strokeLinecap="round"/>
   {kind==='baguette'&&<g transform="translate(121 124) rotate(18)"><rect x="-7" y="-60" width="14" height="80" rx="7" fill="#c99349"/><path d="m-4-40 8-4m-8 17 8-4m-8 17 8-4" stroke="#e8ca87" strokeWidth="3"/></g>}
   {kind==='waiter'&&<g className="waiter-tray"><path d="M9 110h45" stroke="#6c5140" strokeWidth="4"/><path d="M15 93h12v15H15Zm23 0h12v15H38Z" fill="#f4ead4"/><path d="M27 98h5v5h-5M50 98h5v5h-5" fill="none" stroke="#f4ead4" strokeWidth="2"/></g>}
   {kind==='pedestrian'&&<path d="M113 143h26v32h-26Z" fill="#a58361"/>}
  </g>
  {kind==='dog'&&<g className="little-dog" transform="translate(125 191)"><path d="M-5-5q17-12 33-1l8 15H-3Z" fill="#b38350"/><path d="M20-4v-18q17-15 24 3l-3 15Z" fill="#bb905e"/><path d="m27-20 2 15" stroke="#715537" strokeWidth="5" strokeLinecap="round"/><path d="M0 7v14m22-14v14M-4 0l-10-12" stroke="#a3794d" strokeWidth="5" strokeLinecap="round"/><circle cx="37" cy="-14" r="2" fill="#403a2c"/><path d="M20-16-24-37" stroke="#867452" strokeWidth="1.5"/></g>}
  {guest&&<g><path d="M51 171v-45q17-20 38 0" stroke="#9a7855" strokeWidth="6" fill="none"/><ellipse cx="130" cy="148" rx="45" ry="8" fill="#b8976b"/><path d="M129 155v63" stroke="#69543f" strokeWidth="5"/><path d="M114 106h15v19h-15Z" fill="#f5e8ce"/></g>}
  {kind==='tourists'&&<g><path d="m112 100 39 7-6 48-34-9Z" fill="#ece0bd"/><path d="m123 104-2 45m16-40-5 42m-14-20 32-9" stroke="#a59f7f" strokeWidth="2"/><path d="m126 122 9 13 10-8" stroke="#aa604c" strokeWidth="2" fill="none"/></g>}
 </svg>
}
export function AmbientActor({kind='pedestrian',direction='right',speed=25,delay=0,position=65,scale=.55,tone,stationary=false,className=''}:ActorProps) {
 const style={'--actor-duration':`${speed}s`,'--actor-delay':`${delay}s`,'--actor-bottom':`${100-position}%`,'--actor-scale':scale,'--actor-direction':direction==='left'?-1:1} as CSSProperties;
 return <div className={`ambient-actor ${stationary?'stationary':'moving'} direction-${direction} ${className}`} style={style}><div className="actor-size"><ActorArt kind={kind} tone={tone}/></div></div>;
}
export const AmbientPedestrian=(props:ActorProps)=><AmbientActor {...props} kind="pedestrian"/>;
export const AmbientCyclist=(props:ActorProps)=><AmbientActor {...props} kind="cyclist"/>;
export const AmbientDogWalker=(props:ActorProps)=><AmbientActor {...props} kind="dog"/>;
export const AmbientCafeGuest=(props:ActorProps)=><AmbientActor {...props} kind="guest" stationary/>;
