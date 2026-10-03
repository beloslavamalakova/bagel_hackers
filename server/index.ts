import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, type Session, type LiveServerMessage } from '@google/genai';
import { readFileSync, existsSync } from 'node:fs';
import { createAppHandler } from './http';
import { context } from 'esbuild';
import { ambientEvents, isSideEventId, type SideEventId } from '../src/data/ambient';
import { parseAudioChunk } from './audio';
import { isTaskId, liveConfig, MODEL, completionDecision } from './agent';
// Only the server reads .env. Never bundle process.env or the API key into browser code.
if (existsSync('.env')) {
  for (const line of readFileSync('.env','utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if(match && !process.env[match[1]]) process.env[match[1]]=match[2].replace(/^['"]|['"]$/g,'');
  }
}
const dev=process.argv.includes('--dev');
const port=Number(process.env.PORT ?? (dev ? 5173 : 3001));
if(dev){
  const builder=await context({entryPoints:['src/main.tsx'],bundle:true,outdir:'.dev/assets',format:'esm',sourcemap:true,target:'es2022',jsx:'automatic',define:{'import.meta.env.DEV':'true'}});
  await builder.watch();
  // Rebuild before the first HTTP request; subsequent edits are picked up by watch.
  await builder.rebuild();
  const shutdown=()=>{void builder.dispose();process.exit(0);};
  process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}
const configured = () => Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here');
const server = createServer(createAppHandler(dev,configured));
const wss = new WebSocketServer({server,path:'/live',maxPayload:128*1024});
wss.on('connection', (socket, req) => {
  // Restrict browser connections to the app's own origin; never relay user-supplied prompts or credentials.
  const origin = req.headers.origin;
  try{if (origin && new URL(origin).host !== req.headers.host) { socket.close(1008,'Origin not allowed'); return; }}
  catch{socket.close(1008,'Invalid origin');return;}
  let session: Session | undefined;
  let ended = false, starting = false, ready = false, completed = false;
  let learnerTurns = 0;
  let recording=false,audioDurationMs=0;
  const send = (value: object) => { if(socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value)); };
  const fail = (message: string) => send({type:'error',message});
  const cleanup = () => { ended=true; ready=false; session?.close(); session=undefined; };
  const initTimeout = setTimeout(() => { if(!ready) { fail('The voice connection timed out. Please retry.'); cleanup(); socket.close(); } },20_000);
  socket.on('message', async raw => {
    try {
      const msg = JSON.parse(raw.toString());
      if(msg.type === 'start') {
        if(starting || ready || ended) return;
        if(!isTaskId(msg.scene)) { fail('Unknown encounter. Please restart the adventure.'); return; }
        if(!configured()) { fail('Voice is not configured yet. Add GEMINI_API_KEY to .env and restart the server.'); clearTimeout(initTimeout); return; }
        starting=true;
        const scene = msg.scene;
        const sideEvent:SideEventId|undefined|null = msg.sideEvent === undefined ? undefined : isSideEventId(msg.sideEvent) ? msg.sideEvent : null;
        if(sideEvent===null || (sideEvent&&!ambientEvents[sideEvent].sceneIds.includes(scene))){fail('This side encounter is not available here.');return;}
        const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY!,httpOptions:{apiVersion:'v1beta'}});
        const onmessage = (event: LiveServerMessage) => {
          if(ended) return;
          const content = event.serverContent;
          if(content) {
            // A Gemini event may include several simultaneous audio/text parts. Process every one.
            for(const part of content.modelTurn?.parts ?? []) {
              if(part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) send({type:'audio',data:part.inlineData.data,mimeType:part.inlineData.mimeType});
            }
            if(content.inputTranscription?.text?.trim()) {
              send({type:'transcript',speaker:'you',text:content.inputTranscription.text});
            }
            if(content.outputTranscription?.text) send({type:'transcript',speaker:'npc',text:content.outputTranscription.text});
            if(content.interrupted) send({type:'interrupted'});
            if(content.turnComplete) send({type:'turn_complete'});
          }
          if(event.toolCall) {
            for(const call of event.toolCall.functionCalls ?? []) {
              const result = call.name === 'complete_task' ? completionDecision(scene,call.args,completed,learnerTurns,sideEvent) : {accepted:false,reason:'Unknown tool.'};
              session?.sendToolResponse({functionResponses:[{id:call.id,name:call.name,response:{result:result.reason,accepted:result.accepted}}]});
              if(result.accepted) {
                completed=true;
                send({type:'task_complete',taskId:scene,shortFeedback:typeof call.args?.shortFeedback === 'string' ? call.args.shortFeedback.slice(0,180) : undefined});
              }
            }
          }
          if(event.goAway) { fail('This voice session is ending. Retry to reconnect with this character.'); }
        };
        const connected = await ai.live.connect({model:MODEL,config:liveConfig(scene,sideEvent),callbacks:{
          onmessage, onerror:() => { if(!ended) fail('Gemini could not connect. Check your key, model access, and network, then retry.'); },
          onclose:() => { if(!ended) { ready=false; fail('The voice connection closed. Retry to continue this encounter.'); } }
        }});
        if(ended || socket.readyState !== WebSocket.OPEN) { connected.close(); return; }
        session=connected; ready=true; clearTimeout(initTimeout); send({type:'ready'});
        session.sendClientContent({turns:[{role:'user',parts:[{text:'The learner has arrived. Greet them in character with your opening French line, then wait. This is not a learner objective attempt.'}]}],turnComplete:true});
      } else if(ready && session && !completed) {
        if(msg.type === 'activity_start'&&!recording){
          recording=true;audioDurationMs=0;session.sendRealtimeInput({activityStart:{}});
        } else if(msg.type === 'audio' && recording && typeof msg.data === 'string' && msg.data.length <= 100000) {
          const audio = parseAudioChunk(msg.data,msg.sampleRate);
          audioDurationMs+=audio.durationMs;
          session.sendRealtimeInput({audio:{data:audio.data,mimeType:audio.mimeType}});
        } else if(msg.type === 'activity_end'&&recording) {
          recording=false;
          if(audioDurationMs>=250)learnerTurns++;
          session.sendRealtimeInput({activityEnd:{}});
          send({type:'capture_received',durationMs:audioDurationMs});
        }
      }
    } catch {
      fail('Unable to establish the Gemini voice session. Check GEMINI_API_KEY and access to gemini-3.8-live, then retry.');
    }
  });
  socket.on('close', () => {clearTimeout(initTimeout); cleanup();});
  socket.on('error', () => {clearTimeout(initTimeout); cleanup();});
});
server.on('error',(error:NodeJS.ErrnoException)=>{console.error(`Could not start Lost in Paris on port ${port}: ${error.code}. Check the port is free and local servers are allowed.`);process.exit(1);});
wss.on('error',()=>{});
server.listen(port,'127.0.0.1',()=>console.log(`Lost in Paris: http://localhost:${port} (${configured() ? 'key configured' : 'add GEMINI_API_KEY to .env'})`));
