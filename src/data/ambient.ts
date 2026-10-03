import type { TaskId } from '../types/game';
export const sideEventIds = ['coffee_spill','dropped_scarf','pigeon_chaos','dog_hello','lost_tourists'] as const;
export type SideEventId = typeof sideEventIds[number];
export interface AmbientEvent {
  id:SideEventId; weight:number; durationMs:number; sceneIds:TaskId[];
  title:string; description:string; action:string; npcName:string; npcRole:string;
  objective:string; greeting:string; hintWords:string[]; fullHint:string;
  successCriteria:string; reward:string; voice:string;
}
export const ambientEvents:Record<SideEventId,AmbientEvent> = {
 coffee_spill:{id:'coffee_spill',weight:4,durationMs:24000,sceneIds:['street_recommendation','bakery_order'],title:'A little café mishap',description:'A waiter bumps a table. A cup of coffee goes flying.',action:'Ask if they’re okay',npcName:'Thomas',npcRole:'a café waiter who just spilled coffee; nobody is hurt',objective:'Ask the waiter if he is okay or offer to help.',greeting:'Oh là là ! Mon café…',hintWords:['ça','va','vous','aider'],fullHint:'Ça va ? Je peux vous aider ?',successCriteria:'Accept a meaningful French wellbeing question or offer to help. Reassure them warmly: Oui, ça va. Merci, c’est gentil ! Then complete. One useful learner utterance is enough.',reward:'Helped after a coffee spill',voice:'Puck'},
 dropped_scarf:{id:'dropped_scarf',weight:3,durationMs:24000,sceneIds:['street_recommendation','street_directions'],title:'Something left behind',description:'A passer-by drops a red scarf without noticing.',action:'Let them know',npcName:'Élise',npcRole:'a passer-by who has accidentally dropped her scarf',objective:'Tell the passer-by they dropped their scarf.',greeting:'Bonjour ? Vous voulez me dire quelque chose ?',hintWords:['écharpe','votre','tombée','excusez-moi'],fullHint:'Excusez-moi, votre écharpe est tombée.',successCriteria:'Accept understandable French alerting you to a dropped scarf or returning it. Thank them and pick it up. Complete after one useful learner utterance.',reward:'Returned a dropped scarf',voice:'Kore'},
 pigeon_chaos:{id:'pigeon_chaos',weight:2,durationMs:21000,sceneIds:['street_recommendation','bakery_order'],title:'Paris has a hungry visitor',description:'A cheeky pigeon has its eye on someone’s croissant.',action:'Say something',npcName:'Hugo',npcRole:'a café customer laughing as a pigeon pecks at his croissant',objective:'Make a simple French comment about the pigeon or croissant.',greeting:'Ce pigeon aime mon croissant !',hintWords:['pigeon','le','croissant','aime'],fullHint:'Le pigeon aime votre croissant !',successCriteria:'Accept any understandable relevant French comment, question or offer about the pigeon, croissant or incident. Laugh gently and respond naturally, then complete.',reward:'Shared a laugh over a croissant',voice:'Puck'},
 dog_hello:{id:'dog_hello',weight:3,durationMs:22000,sceneIds:['street_recommendation','street_directions'],title:'Meet a four-legged Parisian',description:'A little dog trots ahead of its owner and stops to say hello.',action:'Meet the dog',npcName:'Paul',npcRole:'a friendly local walking his little dog Biscuit',objective:'Comment on the dog or ask its name in French.',greeting:'Bonjour ! Il est très gentil.',hintWords:['mignon','il','comment','appelle'],fullHint:'Il est mignon ! Comment il s’appelle ?',successCriteria:'Accept a French compliment, a question about the dog, or a friendly relevant comment. Tell them the dog is called Biscuit, then complete. One useful utterance is enough.',reward:'Made friends with Biscuit',voice:'Puck'},
 lost_tourists:{id:'lost_tourists',weight:2,durationMs:22000,sceneIds:['street_directions'],title:'You’re not the only one lost',description:'Two visitors turn their paper map upside down.',action:'Offer a little help',npcName:'Sophie',npcRole:'a French-speaking tourist looking for the café next to Maison Lumière',objective:'Offer to help the visitors in French.',greeting:'Excusez-moi, nous cherchons un café.',hintWords:['vous','aider','je','peux'],fullHint:'Je peux vous aider ?',successCriteria:'Accept a French offer of help or relevant simple directions. Thank them and mention you are looking for the café. Complete after one useful utterance.',reward:'Helped two lost visitors',voice:'Aoede'}
};
export function isSideEventId(value:unknown):value is SideEventId { return sideEventIds.includes(value as SideEventId); }
export function seededRandom(seed:number) {
 let state=seed>>>0;
 return ()=>{state+=0x6D2B79F5;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
}
export interface PlannedEvent { scene:TaskId; event:SideEventId; delayMs:number }
/** At most two moments per run. Stable seed + weighted choices keep demos reproducible. */
export function planAmbientEvents(seed:number):PlannedEvent[] {
 const random=seededRandom(seed),result:PlannedEvent[]=[];
 const candidates:TaskId[]=['street_recommendation','street_directions','bakery_order'];
 const used=new Set<SideEventId>();
 for(const scene of candidates){
  if(result.length>=2 || random()>(scene==='street_recommendation'?.9:.6))continue;
  const choices=sideEventIds.map(id=>ambientEvents[id]).filter(e=>e.sceneIds.includes(scene)&&!used.has(e.id));
  let choice=random()*choices.reduce((sum,e)=>sum+e.weight,0);
  const event=choices.find(e=>(choice-=e.weight)<0)??choices.at(-1);
  if(!event)continue;
  used.add(event.id);result.push({scene,event:event.id,delayMs:9000+Math.round(random()*5000)});
 }
 return result;
}
