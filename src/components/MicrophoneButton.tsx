import type { VoiceStatus } from '../types/game';
import { Icon } from './Icon';
interface Props {
  status: VoiceStatus;
  name: string;
  level: number;
  seconds: number;
  connect: () => void;
  start: () => void;
  stop: () => void;
}
export function MicrophoneButton({status,name,level,seconds,connect,start,stop}:Props) {
  const offline = status === 'offline' || status === 'error';
  const busy = ['connecting','thinking','speaking'].includes(status);
  const labels: Record<VoiceStatus,string> = {
    offline: `Say bonjour to ${name}`, error: 'Try connecting again',
    connecting: 'Preparing your microphone…', ready: 'Click to speak',
    listening: `Listening · ${seconds}s`, thinking: 'Thinking…',
    speaking: `${name} is speaking…`
  };
  return <div className={`mic-area ${status}`}>
    <div className="waveform" aria-hidden="true">{Array.from({length:21},(_,i)=><span key={i} style={{height:status==='listening'?`${5+level*35*Math.abs(Math.sin(i*1.7))}px`:undefined,animationDelay:`${i*45}ms`}}/>)}</div>
    <button className="mic-button" aria-label={offline?`Connect to ${name}`:status==='listening'?'Send your French sentence':labels[status]} aria-pressed={status==='listening'} disabled={busy}
      onClick={offline?connect:status==='listening'?stop:start}>
      <Icon name={status==='listening'?'check':status==='speaking'?'sound':'mic'} size={29}/>
    </button>
    <strong aria-live="polite">{labels[status]}</strong>
    <span>{offline?'Tap to begin your voice conversation':status==='listening'?'Take your time. Click again when you’re finished.':status==='ready'?'Click once, speak French, then click again to send.':status==='speaking'?'Listen, then make your next move.':'A little patience. A little Paris.'}</span>
  </div>;
}
