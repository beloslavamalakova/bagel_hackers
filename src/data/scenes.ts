import { type SceneConfig, type TaskId, taskIds } from '../types/game';
export const language = { code: 'fr', name: 'French', level: 'A1', flag: '🇫🇷' };
export const scenes: Record<TaskId, SceneConfig> = {
  street_recommendation: {
    id:'street_recommendation', npcName:'Camille', npcRole:'a friendly Parisian local carrying flowers',
    title:'A little help from a local', objective:'Ask this person where you can find a really good croissant.',
    context:'Your phone is dead. But a good croissant is never far away in Paris.',
    successCriteria:'The learner asks in understandable French for a good croissant or a good bakery. Accept imperfect grammar and any equivalent request. Only after their request, recommend fictional Maison Lumière, an excellent bakery near the square. Say the recommendation before calling complete_task.',
    hintWords:['croissant','bon','trouver','où','peux','je'], fullHint:'Où est-ce que je peux trouver un bon croissant ?',
    greeting:'Bonjour !', location:'Rue des Rosiers', environment:'paris-street-1',
    transition:'Camille knows just the place. Maison Lumière awaits.', voice:'Kore', feedback:'You asked a local for a recommendation.'
  },
  street_directions: {
    id:'street_directions', npcName:'Julien', npcRole:'a relaxed local beside a bicycle at a street intersection',
    title:'Find your way', objective:'Ask someone how to get to Maison Lumière.',
    context:'You have a name. Now you just need a little direction.',
    successCriteria:'The learner asks in understandable French how to reach Maison Lumière or the recommended bakery. Then give these short directions: Continuez tout droit, puis tournez à gauche. La boulangerie est à côté du café. Do not require the learner to repeat directions. Call complete_task after giving them.',
    hintWords:['comment','aller','Maison Lumière','je','peux'], fullHint:'Excusez-moi, comment aller à Maison Lumière ?',
    greeting:'Bonjour ! Vous cherchez quelque chose ?', location:'Place Sainte-Catherine', environment:'paris-street-2',
    transition:'Straight ahead. A left turn. And the smell of fresh bread.', voice:'Puck', feedback:'You found your way using French.'
  },
  bakery_order: {
    id:'bakery_order', npcName:'Amélie', npcRole:'the welcoming employee at Maison Lumière bakery',
    title:'One croissant, s’il vous plaît', objective:'Order one croissant and one coffee.',
    context:'Warm butter, fresh bread. You made it to Maison Lumière.',
    successCriteria:'TWO STAGES REQUIRED. First the learner must order BOTH one croissant AND one coffee in understandable French. If one is missing ask about it naturally. After BOTH are ordered, you MUST ask Sur place ou à emporter ? and WAIT for a NEW learner spoken turn. Only after the learner answers sur place or à emporter (or a clear French equivalent), confirm the order and call complete_task. Never complete after the first order alone. Total 4,70 €. Do not invent extra mandatory payment steps.',
    hintWords:['voudrais','café','croissant','je','un','et','un'], fullHint:'Je voudrais un croissant et un café, s’il vous plaît.',
    followupHint:'Sur place, s’il vous plaît. / À emporter, s’il vous plaît.',
    greeting:'Bonjour ! Qu’est-ce que vous désirez ?', location:'Maison Lumière', environment:'bakery-interior',
    transition:'One golden croissant. One café. One well-earned pause.', voice:'Aoede', feedback:'You placed an order and answered a follow-up.'
  },
  bakery_smalltalk: {
    id:'bakery_smalltalk', npcName:'Léa', npcRole:'a friendly customer enjoying coffee at a nearby table',
    title:'Stay for a conversation', objective:'Have a short conversation in French with another customer.',
    context:'The croissant is yours. The best part of Paris? The people.',
    successCriteria:'Have genuine unscripted small talk. Talk about travel, weather, food, where they are from, or another simple topic the learner chooses. Ask one short contextual question at a time. Track meaningful French learner turns. Complete after THREE meaningful learner turns; a very short beginner reply can count if it communicates something relevant. Greetings alone, silence and English alone do not count. Do not force memorized lines. Respond naturally to the third contribution, then call complete_task.',
    hintWords:['Paris','aime','viens','je','vacances','beau'], fullHint:'Je suis en vacances à Paris. Et vous ?',
    greeting:'Vous êtes en vacances à Paris ?', location:'Le petit coin café', environment:'bakery-customer',
    transition:'A croissant, a conversation, and a little more confidence.', voice:'Leda', feedback:'You had a real conversation in French.'
  }
};
export const missionLabels = ['Ask a local for a recommendation','Ask for directions','Order at the bakery','Talk to someone in French'];
export function nextScene(id: TaskId) { return taskIds[taskIds.indexOf(id)+1] ?? 'completed' as const; }
