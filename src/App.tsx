import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { primeConversationAudio } from './lib/audioContext';
import { WelcomeScene } from './components/WelcomeScene';
import { ScenarioPicker } from './components/ScenarioPicker';
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
import { allTaskIds, getTaskIds, type StoryId, type TaskId } from './types/game';
function newRunSeed(){const fixed=new URLSearchParams(location.search).get('seed');return fixed!==null&&Number.isFinite(Number(fixed))?Number(fixed):Date.now();}
export default function App(){
 const game=useGameState();
 const [showWelcome,setShowWelcome]=useState(true);
 const [showScenarioPicker,setShowScenarioPicker]=useState(true);
 const [restart,setRestart]=useState(0),[seed,setSeed]=useState(newRunSeed);
 const [memories,setMemories]=useState<SideEventId[]>([]);
 const plan=useMemo(()=>planAmbientEvents(seed),[seed]);
 const voiceEnabled=useRef(false);
 const active=allTaskIds.includes(game.state.scene as TaskId);
 const scene=active?scenes[game.state.scene as TaskId]:null;
 const dev=import.meta.env.DEV&&new URLSearchParams(location.search).get('dev')==='true';
 const reset=()=>{voiceEnabled.current=false;game.reset();setMemories([]);setSeed(newRunSeed());};
 const reward=useCallback((id:SideEventId)=>setMemories(old=>old.includes(id)?old:[...old,id]),[]);
 if(showWelcome)return <WelcomeScene onExplore={()=>setShowWelcome(false)}/>;
 if(showScenarioPicker)return <div className="app"><ScenarioPicker onBack={()=>setShowWelcome(true)} onEnter={(storyId:StoryId)=>{reset();game.selectStory(storyId);setShowScenarioPicker(false);}}/></div>;
 return <div className={`app ${scene?'in-game':''}`}><Header home={!scene} handbookScene={scene??undefined} onBack={()=>{if(game.state.scene==='intro'){reset();setShowScenarioPicker(true);}else game.back();}} onHome={()=>{reset();setShowScenarioPicker(true);setShowWelcome(true);}}/>{game.state.scene==='intro'?<IntroScene onStart={()=>{primeConversationAudio();voiceEnabled.current=true;game.start();}} storyId={game.state.storyId}/>:game.state.scene==='completed'?<CompletionScene onReset={reset} memories={memories.map(id=>ambientEvents[id].reward)} storyId={game.state.storyId}/>:scene&&<Game key={`${scene.id}-${restart}`} scene={scene} game={game} voiceEnabled={voiceEnabled} plan={plan} memories={memories.map(id=>ambientEvents[id].reward)} onReward={reward}/>}{dev&&<div className="dev-controls"><span>DEV</span>{scene?<><button onClick={()=>game.complete(scene.id,'Completed with development controls.')}>Mark complete / skip</button><button onClick={()=>{game.restartScene();setRestart(r=>r+1);}}>Restart scene</button></>:<button onClick={game.start}>Start journey</button>}<button onClick={reset}>Reset</button></div>}</div>;
}
function Game({scene,game,voiceEnabled,plan,memories,onReward}:{scene:typeof scenes[TaskId];game:ReturnType<typeof useGameState>;voiceEnabled:MutableRefObject<boolean>;plan:PlannedEvent[];memories:string[];onReward:(id:SideEventId)=>void}){
 const voice=useGeminiLive(scene.id,game.complete);
 const [side,setSide]=useState<SideEventId|null>(null);
 useEffect(()=>{voice.suspend(Boolean(side));return()=>voice.suspend(false);},[side,voice.suspend]);
 const world=useAmbientWorld(scene.id,plan,Boolean(game.transition),Boolean(side));
 useEffect(()=>{if(voiceEnabled.current)void voice.connect();},[scene.id,voice.connect,voiceEnabled]);
 const storyTaskIds=getTaskIds(game.state.storyId);
 const number=storyTaskIds.indexOf(scene.id)+1,destination=nextScene(scene.id,game.state.storyId);
 const sideEvent=side?ambientEvents[side]:null;
 const exitSide=(success:boolean)=>{if(success&&side)onReward(side);setSide(null);world.dismiss();};
 const canEngage=['ready','offline','error'].includes(voice.status)&&!game.transition;
 return <main className={`game-layout ${game.state.storyId==='first_party'?'party-game':''}`}><MissionPanel state={game.state} traveling={Boolean(game.transition)} memories={memories}/><section className="game-center"><div className="scene-heading"><div><div className="eyebrow">ENCOUNTER {String(number).padStart(2,'0')} <span>/ {String(storyTaskIds.length).padStart(2,'0')}</span></div><h1>{sideEvent?sideEvent.title:scene.title}</h1></div><div className="scene-chapter">{game.state.storyId==='club'?(number===2?'THE FRIPERIE':'THE DOOR'):game.state.storyId==='first_party'?'AT THE PARTY':number<storyTaskIds.length?'THE STREETS':'THE BOULANGERIE'}</div></div><JourneyStrip scene={scene.id} storyId={game.state.storyId} traveling={Boolean(game.transition)}/><div className={`scene-window ${game.transition?'scene-traveling':''} ${side?'has-side':''}`}><Environment scene={scene} speaking={!side&&voice.status==='speaking'}/><div className="objective-card"><span className="objective-icon"><Icon name={side?'spark':scene.id==='bakery_order'?'coffee':'mic'} size={20}/></span><div><span>{side?'AN OPTIONAL LITTLE DETOUR':'YOUR NEXT MOVE'}</span><h2>{sideEvent?.objective??scene.objective}</h2></div></div>{world.event&&!side&&!game.transition&&<AmbientMoment event={world.event} canEngage={canEngage} onEngage={()=>setSide(world.event!.id)} onIgnore={world.dismiss}/>} {sideEvent&&<div className="side-npc-portrait"><ActorArt kind={sideEvent.id==='coffee_spill'?'waiter':sideEvent.id==='dog_hello'?'dog':sideEvent.id==='lost_tourists'?'tourists':'pedestrian'} tone="#98745d"/></div>}{sideEvent&&<div className={`active-side-world moment-${sideEvent.id}`}><span><Icon name="spark" size={14}/>{sideEvent.npcName} noticed you</span><p lang="fr">{sideEvent.greeting}</p></div>}{game.transition&&<TravelSequence source={scene} destination={destination==='completed'?undefined:scenes[destination]} feedback={game.feedback} onDone={game.advance}/>}</div><div className="scene-context"><span className="context-dot"/>{scene.context}<span className="scene-time">{game.state.storyId==='club'?'PARIS · 11:48 PM':game.state.storyId==='first_party'?'LE MARAIS · CE SOIR':'PARIS · 10:24 AM'}</span></div></section>{game.transition?<aside className="travel-sidebar"><div className="eyebrow">YOUR FRENCH OPENS DOORS</div><Icon name="pin" size={30}/><h2>{game.state.storyId==='club'?<>The night is<br/>on your side.</>:game.state.storyId==='first_party'?<>The evening gets<br/>more familiar.</>:<>The city moves<br/>with you.</>}</h2><p>{scene.npcName} understood your intent.<br/>{game.state.storyId==='club'?'The next stop is just around the corner.':game.state.storyId==='first_party'?'Another friendly face is waiting.':'A new corner of Paris is waiting.'}</p><span className="travel-sidebar-line"/><small>{game.state.storyId==='club'?'One door at a time.':game.state.storyId==='first_party'?'One small conversation at a time.':'No maps. Just a conversation.'}</small></aside>:sideEvent?<SideConversation event={sideEvent} scene={scene} onExit={exitSide}/>:<ConversationPanel scene={scene} hintLevel={game.state.hintLevel} onHint={game.hint} voice={{...voice,connect:async()=>{voiceEnabled.current=true;await voice.connect();}}}/>}</main>;
}
