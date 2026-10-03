/** Narrow types for the small subset of ws used by this proxy. */
declare module 'ws' {
  import { EventEmitter } from 'node:events';
  import type { IncomingMessage, Server } from 'node:http';
  export class WebSocket extends EventEmitter {
    static readonly OPEN: number;
    readonly readyState: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    on(event:'message', listener:(data:Buffer)=>void):this;
    on(event:'close'|'error',listener:()=>void):this;
  }
  export class WebSocketServer extends EventEmitter {
    constructor(options:{server:Server;path:string;maxPayload:number});
    on(event:'error',listener:()=>void):this;
    on(event:'connection',listener:(socket:WebSocket,request:IncomingMessage)=>void):this;
  }
}
