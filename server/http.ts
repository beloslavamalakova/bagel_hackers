import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { readFileSync, existsSync, createReadStream } from 'node:fs';
import { MODEL } from './agent';
const contentTypes:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.json':'application/json','.map':'application/json'};
export function createAppHandler(dev:boolean,configured:()=>boolean) {
  return (req:IncomingMessage,res:ServerResponse)=>{
    let pathname:string, decoded:string;
    try{pathname=new URL(req.url??'/','http://localhost').pathname;decoded=decodeURIComponent(pathname);}
    catch{res.writeHead(400);res.end('Invalid request');return;}
    if(pathname==='/api/health'){
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ok:true,configured:configured(),model:MODEL}));return;
    }
    if(pathname.startsWith('/api/') || pathname==='/live'){res.writeHead(404);res.end('Not found');return;}
    // Serve only dedicated public directories; secrets, server code, and dependencies are never assets.
    const root=dev?(pathname.startsWith('/assets/')?resolve('.dev'):resolve('public')):resolve('dist');
    const file=resolve(root,'.'+decoded);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    if(pathname==='/'){
      res.setHeader('Content-Type',contentTypes['.html']);
      try{
        const html=readFileSync(dev?'index.html':'dist/index.html','utf8');
        res.end(dev?html.replace('<script type="module" src="/src/main.tsx"></script>','<link rel="stylesheet" href="/assets/main.css"/><script type="module" src="/assets/main.js"></script>'):html);
      }catch{res.writeHead(503);res.end('Run npm run build before npm start.');}
      return;
    }
    if(!existsSync(file)){res.writeHead(404);res.end('Not found');return;}
    res.setHeader('Content-Type',contentTypes[extname(file)]??'application/octet-stream');
    res.setHeader('Cache-Control',dev?'no-store':'public, max-age=300');
    const stream=createReadStream(file);
    stream.on('error',()=>{if(!res.headersSent)res.writeHead(404);res.end('Not found');});stream.pipe(res);
  };
}
