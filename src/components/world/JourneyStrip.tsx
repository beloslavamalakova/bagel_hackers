import { taskIds, type TaskId } from '../../types/game';
import { Icon } from '../Icon';
const labels=['Start','Street','Corner','Bakery','Inside'];
export function JourneyStrip({scene,traveling=false}:{scene:TaskId;traveling?:boolean}) {
 const current=taskIds.indexOf(scene)+1;
 return <nav className={`journey-strip ${traveling?'is-traveling':''}`} aria-label="Your path through Paris"><div className="journey-track"><div style={{width:`${current*25}%`}}/></div>{labels.map((label,i)=><div key={label} className={`journey-node ${i<current?'visited':''} ${i===current?'active':''}`} aria-current={i===current?'step':undefined}><span>{i<current?<Icon name="check" size={9}/>:i===current?<Icon name="pin" size={10}/>:null}</span><small>{label}</small></div>)}</nav>;
}
