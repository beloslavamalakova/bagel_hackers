/** Gemini consumes mono signed 16-bit little-endian PCM, not a WebM/Opus recording. */
export function encodePcm(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, value < 0 ? value * 32768 : value * 32767, true);
  }
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Preserve the device's real sample rate. Gemini resamples native PCM itself. */
export function pcmMimeType(sampleRate: number): string {
  if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000) {
    throw new Error('Unsupported microphone sample rate.');
  }
  return `audio/pcm;rate=${sampleRate}`;
}
export class AudioPlayer {
  private nextTime=0;
  private sources=new Set<AudioBufferSourceNode>();
  constructor(readonly context: AudioContext) {}
  get pendingMs() { return Math.max(0,(this.nextTime-this.context.currentTime)*1000); }
  async unlock() { await this.context.resume(); }
  play(data: string, mimeType: string) {
    const binary=atob(data);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const view=new DataView(bytes.buffer);
    const rate=Number(mimeType.match(/rate=(\d+)/)?.[1] ?? 24000);
    const buffer=this.context.createBuffer(1,Math.floor(bytes.length/2),rate);
    const channel=buffer.getChannelData(0);
    for(let i=0;i<channel.length;i++) channel[i]=view.getInt16(i*2,true)/32768;
    const source=this.context.createBufferSource();
    source.buffer=buffer; source.connect(this.context.destination);
    // Schedule chunks consecutively instead of playing each immediately (which overlaps speech).
    this.nextTime=Math.max(this.nextTime,this.context.currentTime+0.035);
    source.start(this.nextTime); this.nextTime+=buffer.duration;
    this.sources.add(source);
    source.onended=()=>{this.sources.delete(source);source.disconnect();};
  }
  stop() { for(const source of this.sources) {source.onended=null;try{source.stop();}catch{}source.disconnect();} this.sources.clear();this.nextTime=0; }
  close() {this.stop();if(this.context.state!=='closed')void this.context.close().catch(()=>{});}
}
