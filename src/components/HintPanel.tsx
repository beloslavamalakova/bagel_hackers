import type { HintLevel, SceneConfig } from '../types/game';
import { Icon } from './Icon';
export function HintPanel({scene,level,onHint}:{scene:SceneConfig;level:HintLevel;onHint:()=>void}){
 return <section className="hint-panel"><div className="hint-title"><Icon name="spark" size={16}/><span>A little nudge</span></div>{level===0?<p>The words are in there.<br/>Sometimes you just need a little help.</p>:level===1?<><p>Try building the sentence yourself.</p><div className="word-chips">{scene.hintWords.map((word,i)=><span key={i}>{word}</span>)}</div></>:<><p className="full-hint" lang="fr">{scene.fullHint}</p>{scene.followupHint&&<p className="followup-hint" lang="fr">Then: {scene.followupHint}</p>}<small>Make it your own, then say it aloud.</small></>}{level<2&&<button className="hint-button" onClick={onHint}>{level===0?'Need a hint?':'Show me the sentence'}<Icon name="arrow" size={15}/></button>}</section>
}
