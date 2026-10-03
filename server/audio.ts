import { pcmMimeType } from '../src/lib/audio';
export function parseAudioChunk(data:unknown,sampleRate:unknown) {
  if(typeof data!=='string'||data.length>100000||typeof sampleRate!=='number')throw new Error('Invalid microphone audio.');
  const mimeType=pcmMimeType(sampleRate);
  const bytes=Buffer.from(data,'base64');
  if(!bytes.length||bytes.length%2!==0)throw new Error('Invalid PCM audio bytes.');
  return {data,mimeType,durationMs:bytes.length/2/sampleRate*1000};
}
