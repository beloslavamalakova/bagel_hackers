import type { VoiceStatus } from '../types/game';
import { Icon } from './Icon';

interface Props {
  status: VoiceStatus;
  name: string;
  salutation?: string;
  level: number;
  connect: () => void;
  startSpeaking: () => void;
  finishSpeaking: () => void;
}

export function MicrophoneButton({status,name,salutation='bonjour',level,connect,startSpeaking,finishSpeaking}:Props) {
  const offline = status === 'offline' || status === 'error';
  const busy = status === 'connecting';
  const recording = status === 'listening';
  const waiting = status === 'thinking' || status === 'speaking';
  const buttonLabel = offline
    ? status === 'error' ? 'Retry' : 'Connect'
    : busy ? 'Connecting…'
    : waiting ? 'Wait for reply'
    : recording ? 'Finish speaking'
    : 'Speak';
  const labels: Record<VoiceStatus,string> = {
    offline: `Say ${salutation} to ${name}`,
    error: 'Try connecting again',
    connecting: 'Preparing your microphone…',
    ready: 'Your turn — tap Speak when you’re ready.',
    listening: 'You’re speaking. Tap Finish speaking when you’re done.',
    thinking: 'Your turn is sent.',
    speaking: `${name} is speaking…`
  };
  const instructions: Record<VoiceStatus,string> = {
    offline: 'Connect once to begin your conversation.',
    error: 'Tap Retry to reconnect.',
    connecting: 'Allow microphone access if your browser asks.',
    ready: 'Tap the button to start; tap Finish speaking to send your turn.',
    listening: 'Your turn only ends when you tap Finish speaking. Pauses are okay.',
    thinking: 'Wait for the reply. The button will be ready when it’s your turn.',
    speaking: `${name} is speaking. The Speak button will be ready when they finish.`
  };

  return <div className={`mic-area ${status}`}>
    {recording&&<div className="waveform" aria-hidden="true">{Array.from({length:21},(_,i)=><span key={i} style={{height:`${5+level*35*Math.abs(Math.sin(i*1.7))}px`,animationDelay:`${i*45}ms`}}/>)}</div>}
    <button
      className={`mic-button turn-button${recording?' is-recording':''}`}
      aria-label={offline?status==='error'?'Retry voice connection':`Connect to ${name}`:buttonLabel}
      aria-pressed={recording}
      disabled={busy||waiting}
      onClick={offline?connect:recording?finishSpeaking:startSpeaking}
    >
      <Icon name={recording?'check':'mic'} size={21}/>
      <span>{buttonLabel}</span>
    </button>
    <strong aria-live="polite">{labels[status]}</strong>
    <span>{busy?'Waiting for microphone and voice connection…':instructions[status]}</span>
  </div>;
}
