import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Header } from './components/Header';
import { IntroScene } from './components/IntroScene';
import { CompletionScene } from './components/CompletionScene';
import { Environment } from './components/Environment';
import { MissionPanel } from './components/MissionPanel';
import { ConversationPanel } from './components/ConversationPanel';
import { SceneTransition } from './components/SceneTransition';
import { Icon } from './components/Icon';
import { useGameState } from './hooks/useGameState';
import { useGeminiLive } from './hooks/useGeminiLive';
import { scenes } from './data/scenes';
import { taskIds, type TaskId } from './types/game';
export default function App(){
 const game=useGameState();
 const [restart,setRestart]=useState(0);
 const voiceEnabled=useRef(false);
 const active=taskIds.includes(game.state.scene as TaskId);
 const scene=active?scenes[game.state.scene as TaskId]:null;
 const dev=import.meta.env.DEV&&new URLSearchParams(location.search).get('dev')==='true';
 return <div className={`app ${scene?'in-game':''}`}><Header home={!scene} onHome={game.reset}/>{game.state.scene==='intro'?<IntroScene onStart={game.start}/>:game.state.scene==='completed'?<CompletionScene onReset={game.reset}/>:scene&&<Game key={`${scene.id}-${restart}`} scene={scene} game={game} voiceEnabled={voiceEnabled}/>}{dev&&<div className="dev-controls"><span>DEV</span>{scene?<><button onClick={()=>game.complete(scene.id,'Completed with development controls.')}>Mark complete / skip</button><button onClick={()=>{game.restartScene();setRestart(r=>r+1);}}>Restart scene</button></>:<button onClick={game.start}>Start journey</button>}<button onClick={game.reset}>Reset</button></div>}</div>
}
function Game({scene,game,voiceEnabled}:{scene:typeof scenes[TaskId];game:ReturnType<typeof useGameState>;voiceEnabled:MutableRefObject<boolean>}){
 const voice=useGeminiLive(scene.id,game.complete);
 useEffect(()=>{if(voiceEnabled.current)void voice.connect();},[scene.id,voice.connect,voiceEnabled]);
 const number=taskIds.indexOf(scene.id)+1;
 return <main className="game-layout"><MissionPanel state={game.state}/><section className="game-center"><div className="scene-heading"><div><div className="eyebrow">ENCOUNTER {String(number).padStart(2,'0')} <span>/ 04</span></div><h1>{scene.title}</h1></div><div className="scene-chapter">{number<3?'THE STREETS':'THE BOULANGERIE'}</div></div><div className="scene-window"><Environment scene={scene} speaking={voice.status==='speaking'}/><div className="objective-card"><span className="objective-icon"><Icon name={scene.id==='bakery_order'?'coffee':'mic'} size={20}/></span><div><span>YOUR NEXT MOVE</span><h2>{scene.objective}</h2></div></div>{game.transition&&<SceneTransition scene={scene} feedback={game.feedback} onDone={game.advance}/>}</div><div className="scene-context"><span className="context-dot"/>{scene.context}<span className="scene-time">PARIS · 10:24 AM</span></div></section><ConversationPanel scene={scene} hintLevel={game.state.hintLevel} onHint={game.hint} voice={{...voice,connect:async()=>{voiceEnabled.current=true;await voice.connect();}}}/></main>
}
