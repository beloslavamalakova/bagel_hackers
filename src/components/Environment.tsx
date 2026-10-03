import type { SceneConfig } from '../types/game';
import { NPC } from './NPC';
import { Icon } from './Icon';
export function Environment({scene,speaking=false,intro=false}:{scene:SceneConfig;speaking?:boolean;intro?:boolean}){
 return <div className={`environment ${scene.environment} ${intro?'intro-environment':''}`}>
  <img className="environment-bg" src={`/scenes/${scene.environment}.svg`} alt={scene.id.startsWith('street')?'An illustrated Parisian street with cream stone buildings and wrought-iron balconies':'A warmly lit French bakery with fresh croissants and coffee'} />
  <div className="scene-vignette"/>
  {!intro&&<div className="location-tag"><Icon name="pin" size={15}/>{scene.location}<span>PARIS, FRANCE</span></div>}
  <NPC id={scene.id} speaking={speaking}/>
  {!intro&&<div className="npc-nameplate"><span className={`presence-dot ${speaking?'talking':''}`}/><div><strong>{scene.npcName}</strong><span>{scene.id==='bakery_order'?'Your bakery host':scene.id==='bakery_smalltalk'?'A fellow coffee lover':'A friendly local'}</span></div><Icon name="sound" size={17}/></div>}
  <div className="scene-caption">{intro?'A little French goes a long way.':'No maps. No translations. Just you, and a little French.'}</div>
 </div>
}
