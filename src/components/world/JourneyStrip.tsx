import { getTaskIds, type StoryId, type TaskId } from '../../types/game';
import { Icon } from '../Icon';
const labels:Record<StoryId,string[]>={paris:['Friendly local','Bakery street','Order in French'],first_party:['Meet the host','Meet someone','Join the chat'],club:['Refused','Friperie','Second try']};
const aria:Record<StoryId,string>={paris:'Your path through Paris',first_party:'Your path through the party',club:'Your path through the night'};
export function JourneyStrip({scene,storyId='paris',traveling=false}:{scene:TaskId;storyId?:StoryId;traveling?:boolean}) {
 const storyLabels=labels[storyId];
 const current=getTaskIds(storyId).indexOf(scene);
 return <nav className={`journey-strip ${traveling?'is-traveling':''}`} aria-label={aria[storyId]}><div className="journey-track"><div style={{width:`${current/(storyLabels.length-1)*100}%`}}/></div>{storyLabels.map((label,i)=><div key={label} className={`journey-node ${i<current?'visited':''} ${i===current?'active':''}`} aria-current={i===current?'step':undefined}><span>{i<current?<Icon name="check" size={9}/>:i===current?<Icon name="pin" size={10}/>:null}</span><small>{label}</small></div>)}</nav>;
}
