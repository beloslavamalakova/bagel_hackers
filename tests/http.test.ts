import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createAppHandler } from '../server/http';
function request(url:string){
 const result={status:200,body:'',headers:{} as Record<string,string>};
 const response={setHeader:(name:string,value:string)=>{result.headers[name]=value;},writeHead:(code:number)=>{result.status=code;},end:(body:string)=>{result.body=body;}};
 createAppHandler(true,()=>false)({url} as IncomingMessage,response as unknown as ServerResponse);
 return result;
}
test('the local home route serves the real app and compiled asset references',()=>{
 const r=request('/');assert.equal(r.status,200);assert.match(r.body,/Lost in Paris/);
 assert.match(r.body,/\/assets\/main.js/);assert.match(r.body,/\/assets\/main.css/);
 assert.doesNotMatch(r.body,/src\/main.tsx/);
});
test('health exposes model and readiness, never a key',()=>{
 const r=request('/api/health');assert.deepEqual(JSON.parse(r.body),{ok:true,configured:false,model:'gemini-3.8-live'});
 assert.equal(r.headers['Content-Type'],'application/json');
});
test('server rejects secret paths and malformed requests',()=>{
 assert.equal(request('/.env').status,404);
 assert.equal(request('/server/index.ts').status,404);
 assert.equal(request('/node_modules/ws/package.json').status,404);
 assert.equal(request('/%2e%2e%2f.env').status,403);
 assert.equal(request('/%E0%A4%A').status,400);
});
