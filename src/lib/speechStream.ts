import { encodePcm, pcmMimeType } from './audio';
import type { CaptureStats } from './microphone';
export interface SpeechTransport {
  start: () => void;
  audio: (data:string,sampleRate:number) => void;
  end: () => void;
}
/** Don't give Gemini an empty click/silence turn; retain the prefix when speech does start. */
export class SpeechStream {
  private pending: Float32Array[] = [];
  private started = false;
  private ended = false;
  constructor(private readonly transport:SpeechTransport) {}
  push(samples:Float32Array,stats:CaptureStats) {
    if(this.ended)return;
    pcmMimeType(stats.sampleRate);
    if(!this.started) {
      this.pending.push(samples);
      if(stats.durationMs < 600 || stats.peak < 0.008 || stats.rms < 0.001)return;
      this.started=true;
      this.transport.start();
      for(const chunk of this.pending)this.transport.audio(encodePcm(chunk),stats.sampleRate);
      this.pending=[];
    } else this.transport.audio(encodePcm(samples),stats.sampleRate);
  }
  finish():boolean {
    if(this.ended)return false;
    this.ended=true;this.pending=[];
    if(!this.started)return false;
    this.transport.end();return true;
  }
}
