import { useEffect } from 'react';
import type { SceneConfig } from '../types/game';
import { Icon } from './Icon';
export function SceneTransition({scene,feedback,onDone}:{scene:SceneConfig;feedback:string;onDone:()=>void}){
 useEffect(()=>{const id=setTimeout(onDone,3400);return()=>clearTimeout(id);},[onDone]);
 return <div className="transition-overlay" role="status"><div className="transition-card"><div className="success-icons">{scene.id==='bakery_order'?<><span>🥐</span><span>☕</span></>:<Icon name="check" size={28}/>}</div><div className="eyebrow">NICELY DONE</div><h2>{scene.id==='bakery_order'?'Bon appétit.':'Your French opened a door.'}</h2><p>{feedback||scene.feedback}</p><div className="walking-line"><span/><span/><span/><span/><i><Icon name="pin" size={17}/></i></div><small>{scene.transition}</small></div></div>
}
