interface VoiceCallbacks {
 start:()=>void;
 audio:(samples:Float32Array,sampleRate:number)=>void;
 end:()=>void;
}
/** Hands-free turn boundaries with pre-roll, hysteresis and sample-clock timing.
 * Never uses React status or NPC events to decide whether microphone samples count.
 */
export class VoiceActivity {
 private prefix:{samples:Float32Array;rate:number;ms:number}[]=[];
 private prefixMs=0;
 private candidateMs=0;
 private quietMs=0;
 private durationMs=0;
 private noise=.001;
 active=false;
 constructor(private callbacks:VoiceCallbacks){}
 push(samples:Float32Array,rate:number,playing=false) {
  const ms=samples.length/rate*1000;
  let energy=0;for(const value of samples)energy+=value*value;
  const rms=Math.sqrt(energy/Math.max(1,samples.length));
  // Echo-cancelled audio uses a slightly higher threshold during NPC playback.
  const threshold=Math.max(playing?.012:.006,this.noise*(playing?4:3));
  const voiced=rms>threshold;
  if(!this.active){
   if(!voiced)this.noise=Math.min(.008,this.noise*.98+rms*.02);
   this.prefix.push({samples,rate,ms});this.prefixMs+=ms;
   while(this.prefixMs>350&&this.prefix.length>1)this.prefixMs-=this.prefix.shift()!.ms;
   this.candidateMs=voiced?this.candidateMs+ms:0;
   if(this.candidateMs<100)return;
   this.active=true;this.quietMs=0;this.durationMs=0;
   this.callbacks.start();
   for(const chunk of this.prefix){this.callbacks.audio(chunk.samples,chunk.rate);this.durationMs+=chunk.ms;}
   this.prefix=[];this.prefixMs=0;
   return;
  }
  this.callbacks.audio(samples,rate);this.durationMs+=ms;
  this.quietMs=voiced?0:this.quietMs+ms;
  if(this.quietMs>=1200||this.durationMs>=60000)this.finish();
 }
 finish(){
  const wasActive=this.active;
  this.active=false;this.prefix=[];this.prefixMs=0;this.candidateMs=0;this.quietMs=0;this.durationMs=0;
  if(wasActive)this.callbacks.end();
 }
}
