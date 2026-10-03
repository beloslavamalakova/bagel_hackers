import { getTaskIds, type GameState } from '../types/game';
import { Icon } from './Icon';
const parisStoryLabels=['Camille recommended Maison Lumière','Julien showed you the way','Ordered a croissant and café'];
const parisNextLabels=['Find a friendly local','Find the bakery’s street','Order in French'];
const partyStoryLabels=['You introduced yourself to Emma','You met Lucas','You joined Inès’s conversation'];
const partyNextLabels=['Say hello to the host','Meet someone new','Join the conversation'];
export function MissionPanel({state,traveling=false,memories=[]}:{state:GameState;traveling?:boolean;memories?:string[]}) {
 const taskIds=getTaskIds(state.storyId);
 const index=taskIds.indexOf(state.scene as typeof taskIds[number]);
 const party=state.storyId==='first_party';
 const doneLabels=party?partyStoryLabels:parisStoryLabels;
 const nextLabels=party?partyNextLabels:parisNextLabels;
 return <aside className="mission-panel"><div className="eyebrow">{party?'A FIRST-PARTY ADVENTURE':'A PARISIAN ADVENTURE'}</div><h2>{party?'Your party story':'Your Paris story'}</h2><div className="mission-croissant"><Icon name={party?'spark':'croissant'} size={46}/></div><h3>{party?<>Find your place<br/>at the party.</>:<>Find the best<br/>croissant in Paris.</>}</h3><p>Three conversations.<br/>{party?'A few new faces and new phrases.':'A few unexpected little moments.'}</p><div className="progress-label"><span>Your journey</span><span>{state.completedTasks.length} / {taskIds.length}</span></div><div className="progress-track"><div style={{width:`${state.completedTasks.length/taskIds.length*100}%`}}/></div><ol className="mission-steps story-timeline"><li className="done story-prologue"><span className="step-marker"><Icon name="check" size={13}/></span><div>{party?'You got your first-party invite.':'Your phone died.'}<small>{party?'THE EVENING BEGINS':'THE ADVENTURE BEGAN'}</small></div></li>{taskIds.map((id,i)=>{
 const done=state.completedTasks.includes(id),active=index===i&&!done;
 return <li key={id} className={`${done?'done':''} ${active?'current':''}`}><span className="step-marker">{done?<Icon name="check" size={13}/>:String(i+1).padStart(2,'0')}</span><div>{done?doneLabels[i]:nextLabels[i]}{active&&<small>YOU ARE HERE</small>}</div></li>;
 })}</ol>{traveling&&<div className="story-travel"><span className="presence-dot talking"/>Following the next chapter…</div>}{memories.length>0&&<div className="story-memories"><span>THE LITTLE THINGS · {memories.length} ✦</span>{memories.map(memory=><p key={memory}><span>✦</span>{memory}</p>)}</div>}<div className="pocket-card"><Icon name={party?'spark':'battery'} size={23}/><div><strong>{party?'One party. Three chances to say bonjour.':'0% battery. 100% possibility.'}</strong><span>{party?'Your French is your plus-one.':'Your French will get you there.'}</span></div></div><div className="mission-bottom"><span>{party?'LE MARAIS · CE SOIR':'LE MARAIS'}</span>{!party&&<span>48°51′ N 2°21′ E</span>}</div></aside>;
}
