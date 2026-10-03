export interface CaptureStats { durationMs: number; rms: number; peak: number; sampleRate: number }
export interface CaptureResult extends CaptureStats { chunks: Float32Array[] }

/** Keep capture and its ordered flush separate from React renders and NPC audio events. */
export class MicrophoneCapture {
  private accepting = false;
  private retainAudio = true;
  private ownsContext = true;
  private finishing = false;
  private chunks: Float32Array[] = [];
  private samples = 0;
  private energy = 0;
  private peak = 0;
  private stopId = 0;
  private stopWaiter?: { resolve: (result: CaptureResult) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> };
  private constructor(
    readonly context: AudioContext,
    readonly stream: MediaStream,
    readonly source: MediaStreamAudioSourceNode,
    readonly node: AudioWorkletNode,
    readonly silent: GainNode,
    private readonly onSamples: (samples: Float32Array, stats: CaptureStats) => void
  ) {
    node.port.onmessage = event => {
      if (event.data.type === 'audio' && this.accepting) {
        const samples = event.data.samples as Float32Array;
        if(this.retainAudio)this.chunks.push(samples);
        this.samples += samples.length;
        for (const value of samples) { this.energy += value * value; this.peak = Math.max(this.peak, Math.abs(value)); }
        this.onSamples(samples, this.stats);
      } else if (event.data.type === 'stopped' && event.data.recordingId === this.stopId && this.stopWaiter) {
        this.accepting = false;
        this.finishing = false;
        clearTimeout(this.stopWaiter.timer);
        this.stopWaiter.resolve({...this.stats, chunks: this.chunks});
        this.stopWaiter = undefined;
      }
    };
  }
  static async create(onSamples: (samples: Float32Array, stats: CaptureStats) => void, sharedContext?:AudioContext) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access needs localhost or HTTPS.');
    const stream = await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    let context: AudioContext | undefined;
    try {
      context = sharedContext ?? new AudioContext();
      await context.audioWorklet.addModule('/pcm-capture.js');
      const source = context.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(context,'pcm-capture');
      const silent = context.createGain(); silent.gain.value = 0;
      source.connect(node); node.connect(silent); silent.connect(context.destination);
      const capture=new MicrophoneCapture(context,stream,source,node,silent,onSamples);
      capture.ownsContext=!sharedContext;
      return capture;
    } catch(error) { stream.getTracks().forEach(track=>track.stop());if(context&&!sharedContext)void context.close();throw error; }
  }
  get stats(): CaptureStats { return {durationMs:this.samples/this.context.sampleRate*1000,rms:Math.sqrt(this.energy/Math.max(1,this.samples)),peak:this.peak,sampleRate:this.context.sampleRate}; }
  async start(retainAudio = true) {
    this.retainAudio = retainAudio;
    if (this.accepting || this.finishing) return;
    await this.context.resume();
    this.chunks=[];this.samples=0;this.energy=0;this.peak=0;
    this.accepting=true;
    this.node.port.postMessage({type:'start'});
  }
  stop(): Promise<CaptureResult> {
    if (!this.accepting || this.finishing) return Promise.reject(new Error('Recording is not active.'));
    this.finishing=true;
    return new Promise((resolve,reject)=>{
      this.stopWaiter={resolve,reject,timer:setTimeout(()=>{
        this.accepting=false;this.finishing=false;this.stopWaiter=undefined;
        reject(new Error('Your microphone stopped responding. Retry the voice connection.'));
      },3000)};
      this.node.port.postMessage({type:'stop',recordingId:++this.stopId});
    });
  }
  close() {
    this.accepting=false;
    if(this.stopWaiter){clearTimeout(this.stopWaiter.timer);this.stopWaiter.reject(new Error('Recording closed.'));this.stopWaiter=undefined;}
    this.node.port.onmessage=null;
    this.source.disconnect();this.node.disconnect();this.silent.disconnect();
    this.stream.getTracks().forEach(track=>track.stop());if(this.ownsContext)void this.context.close();
  }
}
