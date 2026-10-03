import { useEffect, useRef } from 'react';
import { HintPanel } from './HintPanel';
import { MicrophoneButton } from './MicrophoneButton';
import { Icon } from './Icon';
import type { HintLevel, SceneConfig } from '../types/game';
import type { useGeminiLive } from '../hooks/useGeminiLive';
export function ConversationPanel({scene,hintLevel,onHint,voice}:{scene:SceneConfig;hintLevel:HintLevel;onHint:()=>void;voice:ReturnType<typeof useGeminiLive>}){
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight;},[voice.transcript]);
 return <aside className="conversation-panel"><div className="conversation-heading"><div className="eyebrow">YOUR CONVERSATION</div><span className="live-badge"><span/>LIVE</span></div><h2>A moment with {scene.npcName}</h2><p className="conversation-note">A real conversation. In your own words.</p><div className="transcript" ref={scroll} role="log" aria-label="Conversation transcript" aria-live="polite">{voice.transcript.length===0?<div className="transcript-empty"><span className="quote-mark">“</span><p lang="fr">{scene.greeting}</p><span>{scene.npcName} is ready to meet you.</span></div>:voice.transcript.map(line=><div className={`transcript-line ${line.speaker}`} key={line.id}><span>{line.speaker==='you'?'YOU':scene.npcName.toUpperCase()}</span><p lang="fr">{line.text}</p></div>)}</div>
 {voice.error&&<div className="voice-error" role="alert"><p>{voice.error}</p><button onClick={()=>void voice.connect()}><Icon name="retry" size={14}/>Retry connection</button></div>}
 {voice.audioBlocked&&<button className="audio-unlock" onClick={()=>void voice.enableAudio()}><Icon name="sound" size={16}/>Enable sound</button>}
 {voice.notice&&<p className="capture-notice" role="status">{voice.notice}</p>}
 <MicrophoneButton seconds={voice.seconds} status={voice.status} name={scene.npcName} level={voice.level} connect={()=>void voice.connect()} start={()=>void voice.startSpeaking()} stop={()=>void voice.stopSpeaking()}/>
 {import.meta.env.DEV&&new URLSearchParams(location.search).get('dev')==='true'&&voice.diagnostics&&<div className="audio-diagnostics"><strong>Microphone check</strong><span>Recorded: {(voice.diagnostics.durationMs/1000).toFixed(1)}s · {voice.diagnostics.sampleRate} Hz</span><span>Peak: {Math.round(voice.diagnostics.peak*100)}% · RMS: {voice.diagnostics.rms.toFixed(4)}</span>{voice.diagnostics.receivedMs!==undefined&&<span>Server received: {(voice.diagnostics.receivedMs/1000).toFixed(1)}s</span>}<button disabled={voice.status==='listening'||voice.status==='speaking'||voice.status==='thinking'} onClick={()=>void voice.replayRecording()}>Hear my last recording</button></div>}
 <HintPanel scene={scene} level={hintLevel} onHint={onHint}/><div className="conversation-footer"><Icon name="headphones" size={14}/> Headphones make Paris sound even better.</div></aside>
}
