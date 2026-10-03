import { taskIds, type GameState } from '../types/game';
import { Icon } from './Icon';
const storyLabels=['Camille recommended Maison Lumière','Julien showed you the way','Ordered a croissant and café','Made a new friend in French'];
const nextLabels=['Find a friendly local','Find the bakery’s street','Order in French','Talk to someone inside'];
export function MissionPanel({state,traveling=false,memories=[]}:{state:GameState;traveling?:boolean;memories?:string[]}) {
 const index=taskIds.indexOf(state.scene as typeof taskIds[number]);
 return <aside className="mission-panel"><div className="eyebrow">A PARISIAN ADVENTURE</div><h2>Your Paris story</h2><div className="mission-croissant"><Icon name="croissant" size={46}/></div><h3>Find the best<br/>croissant in Paris.</h3><p>Four conversations.<br/>A few unexpected little moments.</p><div className="progress-label"><span>Your journey</span><span>{state.completedTasks.length} / 4</span></div><div className="progress-track"><div style={{width:`${state.completedTasks.length*25}%`}}/></div><ol className="mission-steps story-timeline"><li className="done story-prologue"><span className="step-marker"><Icon name="check" size={13}/></span><div>Your phone died.<small>THE ADVENTURE BEGAN</small></div></li>{taskIds.map((id,i)=>{
 const done=state.completedTasks.includes(id),active=index===i&&!done;
 return <li key={id} className={`${done?'done':''} ${active?'current':''}`}><span className="step-marker">{done?<Icon name="check" size={13}/>:String(i+1).padStart(2,'0')}</span><div>{done?storyLabels[i]:nextLabels[i]}{active&&<small>YOU ARE HERE</small>}</div></li>;
 })}</ol>{traveling&&<div className="story-travel"><span className="presence-dot talking"/>Following the next chapter…</div>}{memories.length>0&&<div className="story-memories"><span>THE LITTLE THINGS · {memories.length} ✦</span>{memories.map(memory=><p key={memory}><span>✦</span>{memory}</p>)}</div>}<div className="pocket-card"><Icon name="battery" size={23}/><div><strong>0% battery. 100% possibility.</strong><span>Your French will get you there.</span></div></div><div className="mission-bottom"><span>LE MARAIS</span><span>48°51′ N 2°21′ E</span></div></aside>;
}
