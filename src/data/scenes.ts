import { type SceneConfig, type StoryId, type TaskId, getTaskIds } from '../types/game';
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
  party_arrival: {
    id:'party_arrival', npcName:'Emma', npcRole:'a friendly host welcoming a new guest to Club Minuit',
    title:'Arrive at your first party', objective:'Greet the host and introduce yourself.',
    context:'You made it to the party. A friendly host opens the door and welcomes you in.',
    successCriteria:'The learner greets you and introduces themselves or says their name in understandable beginner French. Welcome them warmly, tell them you are Emma, and invite them inside. Accept simple or imperfect French. Do not require an exact memorized sentence.',
    hintWords:['bonjour','m’appelle','je','suis'], fullHint:'Bonjour ! Je m’appelle…',
    greeting:'Bonsoir ! Bienvenue !', location:'Club Minuit · Le Marais', environment:'first-party',
    transition:'Emma welcomes you in. The party is just getting started.', voice:'Kore', feedback:'You introduced yourself at the party.',
    languageLevel:'A1', localKnowledge:'This is a friendly beginner night at Club Minuit in Le Marais. Guests are friendly and happy to meet someone new. There is a DJ, a dance floor, soft drinks, and a quieter lounge for conversation.'
  },
  party_meet_someone: {
    id:'party_meet_someone', npcName:'Lucas', npcRole:'a friendly guest who has just arrived at the party',
    title:'Meet someone new', objective:'Ask this guest their name and where they are from.',
    context:'There are new faces everywhere. Lucas smiles and introduces himself.',
    successCriteria:'The learner asks your name OR where you are from in understandable beginner French. Answer naturally with a short A1 sentence: Je m’appelle Lucas. Je viens de Lyon. Then ask one simple question back, such as Et vous ? Accept imperfect grammar and do not require both questions.',
    hintWords:['comment','vous','appelez','vous','venez','d’où'], fullHint:'Comment vous appelez-vous ? Vous venez d’où ?',
    greeting:'Salut ! Moi, c’est Lucas. Et vous ?', location:'The club lounge', environment:'first-party',
    transition:'You have a new name to remember—and someone to talk to.', voice:'Puck', feedback:'You met someone new in French.',
    languageLevel:'A1', localKnowledge:'This is a friendly beginner night at Club Minuit in Le Marais. Lucas is a guest from Lyon. Guests are friendly and conversations are informal.'
  },
  party_join_chat: {
    id:'party_join_chat', npcName:'Inès', npcRole:'a warm party guest chatting about music and snacks',
    title:'Join the conversation', objective:'Say what you like at the party and ask a simple question.',
    context:'Music is playing and snacks are on the table. Inès invites you into the conversation.',
    successCriteria:'The learner communicates one thing they like or want at the party, such as music, dancing, or a snack, and asks a relevant simple question or responds to your question in understandable beginner French. Keep turns short and encouraging; accept beginner mistakes. After a meaningful exchange, warmly say you are glad they came and call complete_task.',
    hintWords:['j’aime','la musique','je voudrais','un jus','et vous'], fullHint:'J’aime la musique ! Et vous ?',
    greeting:'Tu aimes la musique ?', location:'Beside the dance floor', environment:'first-party',
    transition:'The conversation flows, and the party starts to feel like yours.', voice:'Aoede', feedback:'You joined the party conversation in French.',
    languageLevel:'A1', localKnowledge:'This is a friendly beginner night at Club Minuit in Le Marais. Inès enjoys music and dancing. There are soft drinks and simple snacks in the quieter lounge.'
  },
  club_refused: {
    id:'club_refused', npcName:'Karim',
    npcRole:'the stern but fair bouncer at Le Velours, a nightclub on Rue Oberkampf. He has just stopped the learner at the door because they are wearing sneakers and a tracksuit. Firm, unimpressed, a little dry humour, never rude or insulting. Comment only on the clothes, never on the person',
    title:'Not tonight', objective:'The bouncer won’t let you in. Ask him why.',
    context:'Your friends are already inside. The music is loud. The bouncer is louder.',
    successCriteria:'The learner asks in understandable French why they cannot come in, what the problem is, or whether they can enter. Accept imperfect grammar and any equivalent question. Only after that, briefly explain the dress code: Pas de baskets, pas de jogging. Il faut des chaussures de ville et une chemise. Then suggest the friperie Chez Margaux around the corner, open until midnight. Say this before calling complete_task. Do not let the learner in during this encounter, whatever they say.',
    hintWords:['pourquoi','je','ne','peux','pas','entrer'], fullHint:'Excusez-moi, pourquoi je ne peux pas entrer ?',
    greeting:'Bonsoir. Non, non, non. Pas ce soir.', location:'Le Velours · Rue Oberkampf', environment:'club-entrance',
    transition:'No sneakers. No tracksuit. Chez Margaux is just around the corner.', voice:'Charon', feedback:'You found out why the door stayed shut.',
    languageLevel:'A1', localKnowledge:'Le Velours is a fictional nightclub on Rue Oberkampf with a strict dress code: no sneakers (baskets), no tracksuits (jogging); city shoes and a shirt required. Entry 15 € including one drink. Chez Margaux is a fictional late-night vintage clothing shop (friperie) around the corner, open until midnight. Shoes 25 €, shirts 10 €.'
  },
  club_boutique: {
    id:'club_boutique', npcName:'Margaux',
    npcRole:'the cheerful owner of Chez Margaux, a tiny late-night vintage clothing shop (friperie) that closes in ten minutes. She has dressed many people the Le Velours bouncer turned away',
    title:'A quick change', objective:'Explain your problem and buy shoes and a shirt.',
    context:'Ten minutes before closing. Racks of shirts, a wall of shoes. Your last chance.',
    successCriteria:'TWO STAGES REQUIRED. First the learner must ask in understandable French for shoes (chaussures) AND a shirt (chemise), or explain that they need clothes to get into the club. If one item is missing, suggest it naturally: the bouncer wants both. After both are requested, you MUST ask Quelle est votre pointure ? and WAIT for a NEW learner spoken turn. Only after the learner gives a shoe size (any number, or a clear French equivalent), hand over the items, say the total is 35 €, wish them a good night, then call complete_task. Never complete after the first request alone. Do not invent extra mandatory payment steps.',
    hintWords:['voudrais','chaussures','chemise','je','des','et','une'], fullHint:'Je voudrais des chaussures et une chemise, s’il vous plaît.',
    followupHint:'Je fais du quarante-deux. / Du trente-neuf, s’il vous plaît.',
    greeting:'Bonsoir ! On ferme bientôt… Je peux vous aider ?', location:'Chez Margaux · Friperie', environment:'friperie',
    transition:'New shoes. Crisp shirt. Back to the velvet rope.', voice:'Aoede', feedback:'You explained a problem and bought exactly what you needed.',
    languageLevel:'A1', localKnowledge:'Le Velours is a fictional nightclub on Rue Oberkampf with a strict dress code: no sneakers (baskets), no tracksuits (jogging); city shoes and a shirt required. Entry 15 € including one drink. Chez Margaux is a fictional late-night vintage clothing shop (friperie) around the corner, open until midnight. Shoes 25 €, shirts 10 €.', minTurns:2
  },
  club_return: {
    id:'club_return', npcName:'Karim',
    npcRole:'the same bouncer at Le Velours. He turned the learner away earlier for wearing sneakers; now they are back in city shoes and a shirt. Still serious, secretly a little impressed',
    title:'Second chance', objective:'Convince the bouncer to let you in this time.',
    context:'Same door. Same bouncer. Completely different shoes.',
    successCriteria:'TWO STAGES REQUIRED. First the learner must politely ask again to come in, or point out their new shoes or shirt, in understandable French. React with mild surprise and approval. Then you MUST ask Vous êtes combien ? and WAIT for a NEW learner spoken turn. Only after the learner answers (for example je suis seul, nous sommes deux, mes amis sont à l’intérieur, or a clear French equivalent), say entry is 15 € with one drink included, step aside, say Bonne soirée !, then call complete_task. Never complete after the first request alone.',
    hintWords:['est-ce que','je','peux','entrer','maintenant'], fullHint:'Bonsoir ! Est-ce que je peux entrer maintenant ?',
    followupHint:'Je suis seul. / Mes amis sont à l’intérieur.',
    greeting:'Encore vous ? … Hmm. Voyons voir.', location:'Le Velours · Rue Oberkampf', environment:'club-entrance',
    transition:'The rope lifts. The bass hits. You’re in.', voice:'Charon', feedback:'You talked your way past a Paris bouncer.',
    languageLevel:'A1', localKnowledge:'Le Velours is a fictional nightclub on Rue Oberkampf with a strict dress code: no sneakers (baskets), no tracksuits (jogging); city shoes and a shirt required. Entry 15 € including one drink. Chez Margaux is a fictional late-night vintage clothing shop (friperie) around the corner, open until midnight. Shoes 25 €, shirts 10 €.', minTurns:2
  }
};
export const missionLabels = ['Find a friendly local','Find the bakery’s street','Order in French'];
export function nextScene(id: TaskId, storyId: StoryId='paris'):TaskId|'completed' {
  const storyTaskIds=getTaskIds(storyId);
  return storyTaskIds[storyTaskIds.indexOf(id)+1] ?? 'completed';
}
