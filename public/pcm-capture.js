// Record until an explicit stop. The acknowledgement follows the final PCM chunk
// on the same ordered MessagePort, so the client cannot end a turn too early.
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.active = false;
    this.buffer = [];
    this.port.onmessage = event => {
      if (event.data.type === 'start') {
        this.buffer = [];
        this.active = true;
      } else if (event.data.type === 'stop') {
        this.active = false;
        this.flush();
        this.port.postMessage({type: 'stopped', recordingId: event.data.recordingId});
      }
    };
  }
  flush() {
    if (!this.buffer.length) return;
    const samples = new Float32Array(this.buffer);
    this.buffer = [];
    this.port.postMessage({type: 'audio', samples}, [samples.buffer]);
  }
  process(inputs) {
    const channels = inputs[0];
    if (this.active && channels?.length && channels[0]?.length) {
      // Some devices supply stereo; mix it to mono instead of dropping one channel.
      for (let i = 0; i < channels[0].length; i++) {
        let sample = 0;
        for (const channel of channels) sample += channel[i] ?? 0;
        this.buffer.push(sample / channels.length);
      }
      if (this.buffer.length >= 2048) this.flush();
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
