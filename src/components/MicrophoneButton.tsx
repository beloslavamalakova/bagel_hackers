import type { VoiceStatus } from '../types/game';
import { Icon } from './Icon';
interface Props {
  status: VoiceStatus;
  muted: boolean;
  name: string;
  salutation?: string;
  level: number;
  connect: () => void;
  toggleMute: () => void;
}
export function MicrophoneButton({status,name,salutation='bonjour',level,connect,toggleMute,muted}:Props) {
  const offline = status === 'offline' || status === 'error';
  const busy = status==='connecting';
  const labels: Record<VoiceStatus,string> = {
    offline: `Say ${salutation} to ${name}`, error: 'Try connecting again',
    connecting: 'Preparing your microphone…', ready: muted?'Microphone muted':'Listening — speak naturally',
    listening: 'Listening…', thinking: 'Thinking…',
    speaking: `${name} is speaking…`
  };
  return <div className={`mic-area ${status}`}>
    {!muted&&<div className="waveform" aria-hidden="true">{Array.from({length:21},(_,i)=><span key={i} style={{height:!offline&&status!=='connecting'?`${5+level*35*Math.abs(Math.sin(i*1.7))}px`:undefined,animationDelay:`${i*45}ms`}}/>)}</div>}
    <button className="mic-button" aria-label={offline?`Connect to ${name}`:muted?'Unmute microphone':'Mute microphone'} aria-pressed={!offline&&!muted} disabled={busy}
      onClick={offline?connect:toggleMute}>
      <Icon name={muted?'close':'mic'} size={29}/>
    </button>
    <strong aria-live="polite">{muted&&!offline?'Microphone muted':labels[status]}</strong>
    <span>{offline?'Connect once to begin':busy?'Waiting for microphone and voice connection…':muted?'Click to unmute and continue.':'Mic is open. Pause for a reply, or speak to interrupt.'}</span>
  </div>;
}
