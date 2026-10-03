import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Header } from './components/Header';
import { IntroScene } from './components/IntroScene';
import { CompletionScene } from './components/CompletionScene';
import { Environment } from './components/Environment';
import { MissionPanel } from './components/MissionPanel';
import { ConversationPanel } from './components/ConversationPanel';
import { TravelSequence } from './components/world/TravelSequence';
import { JourneyStrip } from './components/world/JourneyStrip';
import { AmbientMoment } from './components/world/AmbientMoment';
import { ActorArt } from './components/world/AmbientActor';
import { SideConversation } from './components/world/SideConversation';
import { Icon } from './components/Icon';
import { useGameState } from './hooks/useGameState';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useAmbientWorld } from './hooks/useAmbientWorld';
import { scenes, nextScene } from './data/scenes';
import { ambientEvents, planAmbientEvents, type PlannedEvent, type SideEventId } from './data/ambient';
import { taskIds, type TaskId } from './types/game';
function newRunSeed(){const fixed=new URLSearchParams(location.search).get('seed');return fixed!==null&&Number.isFinite(Number(fixed))?Number(fixed):Date.now();}
export default function App(){
 const game=useGameState();
 const [restart,setRestart]=useState(0),[seed,setSeed]=useState(newRunSeed);
 const [memories,setMemories]=useState<SideEventId[]>([]);
 const plan=useMemo(()=>planAmbientEvents(seed),[seed]);
 const voiceEnabled=useRef(false);
 const active=taskIds.includes(game.state.scene as TaskId);
 const scene=active?scenes[game.state.scene as TaskId]:null;
 const dev=import.meta.env.DEV&&new URLSearchParams(location.search).get('dev')==='true';
 const reset=()=>{game.reset();setMemories([]);setSeed(newRunSeed());};
 const reward=useCallback((id:SideEventId)=>setMemories(old=>old.includes(id)?old:[...old,id]),[]);
 return <div className={`app ${scene?'in-game':''}`}><Header home={!scene} onHome={reset}/>{game.state.scene==='intro'?<IntroScene onStart={game.start}/>:game.state.scene==='completed'?<CompletionScene onReset={reset} memories={memories.map(id=>ambientEvents[id].reward)}/>:scene&&<Game key={`${scene.id}-${restart}`} scene={scene} game={game} voiceEnabled={voiceEnabled} plan={plan} memories={memories.map(id=>ambientEvents[id].reward)} onReward={reward}/>}{dev&&<div className="dev-controls"><span>DEV</span>{scene?<><button onClick={()=>game.complete(scene.id,'Completed with development controls.')}>Mark complete / skip</button><button onClick={()=>{game.restartScene();setRestart(r=>r+1);}}>Restart scene</button></>:<button onClick={game.start}>Start journey</button>}<button onClick={reset}>Reset</button></div>}</div>;
}
function Game({scene,game,voiceEnabled,plan,memories,onReward}:{scene:typeof scenes[TaskId];game:ReturnType<typeof useGameState>;voiceEnabled:MutableRefObject<boolean>;plan:PlannedEvent[];memories:string[];onReward:(id:SideEventId)=>void}){
 const voice=useGeminiLive(scene.id,game.complete);
 const [side,setSide]=useState<SideEventId|null>(null);
 const world=useAmbientWorld(scene.id,plan,Boolean(game.transition),Boolean(side));
 useEffect(()=>{if(voiceEnabled.current)void voice.connect();},[scene.id,voice.connect,voiceEnabled]);
 const number=taskIds.indexOf(scene.id)+1,destination=nextScene(scene.id);
 const sideEvent=side?ambientEvents[side]:null;
 const exitSide=(success:boolean)=>{if(success&&side)onReward(side);setSide(null);world.dismiss();};
 const canEngage=['ready','offline','error'].includes(voice.status)&&!game.transition;
 return <main className="game-layout"><MissionPanel state={game.state} traveling={Boolean(game.transition)} memories={memories}/><section className="game-center"><div className="scene-heading"><div><div className="eyebrow">ENCOUNTER {String(number).padStart(2,'0')} <span>/ 04</span></div><h1>{sideEvent?sideEvent.title:scene.title}</h1></div><div className="scene-chapter">{number<3?'THE STREETS':'THE BOULANGERIE'}</div></div><JourneyStrip scene={scene.id} traveling={Boolean(game.transition)}/><div className={`scene-window ${game.transition?'scene-traveling':''} ${side?'has-side':''}`}><Environment scene={scene} speaking={!side&&voice.status==='speaking'}/><div className="objective-card"><span className="objective-icon"><Icon name={side?'spark':scene.id==='bakery_order'?'coffee':'mic'} size={20}/></span><div><span>{side?'AN OPTIONAL LITTLE DETOUR':'YOUR NEXT MOVE'}</span><h2>{sideEvent?.objective??scene.objective}</h2></div></div>{world.event&&!side&&!game.transition&&<AmbientMoment event={world.event} canEngage={canEngage} onEngage={()=>setSide(world.event!.id)} onIgnore={world.dismiss}/>} {sideEvent&&<div className="side-npc-portrait"><ActorArt kind={sideEvent.id==='coffee_spill'?'waiter':sideEvent.id==='dog_hello'?'dog':sideEvent.id==='lost_tourists'?'tourists':'pedestrian'} tone="#98745d"/></div>}{sideEvent&&<div className={`active-side-world moment-${sideEvent.id}`}><span><Icon name="spark" size={14}/>{sideEvent.npcName} noticed you</span><p lang="fr">{sideEvent.greeting}</p></div>}{game.transition&&<TravelSequence source={scene} destination={destination==='completed'?undefined:scenes[destination]} feedback={game.feedback} onDone={game.advance}/>}</div><div className="scene-context"><span className="context-dot"/>{scene.context}<span className="scene-time">PARIS · 10:24 AM</span></div></section>{game.transition?<aside className="travel-sidebar"><div className="eyebrow">YOUR FRENCH OPENS DOORS</div><Icon name="pin" size={30}/><h2>The city moves<br/>with you.</h2><p>{scene.npcName} understood your intent.<br/>A new corner of Paris is waiting.</p><span className="travel-sidebar-line"/><small>No maps. Just a conversation.</small></aside>:sideEvent?<SideConversation event={sideEvent} scene={scene} onExit={exitSide}/>:<ConversationPanel scene={scene} hintLevel={game.state.hintLevel} onHint={game.hint} voice={{...voice,connect:async()=>{voiceEnabled.current=true;await voice.connect();}}}/>}</main>;
}
