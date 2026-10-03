export const taskIds = ['street_recommendation', 'street_directions', 'bakery_order', 'bakery_smalltalk'] as const;
export type TaskId = typeof taskIds[number];
export type SceneId = 'intro' | TaskId | 'completed';
export type HintLevel = 0 | 1 | 2;
export interface GameState { scene: SceneId; hintLevel: HintLevel; completedTasks: TaskId[] }
export interface SceneConfig {
  id: TaskId; npcName: string; npcRole: string; title: string; objective: string;
  context: string; successCriteria: string; hintWords: string[]; fullHint: string;
  followupHint?: string; greeting: string; location: string; environment: string;
  transition: string; voice: string; feedback: string;
}
export interface TranscriptLine { id: number; speaker: 'you' | 'npc'; text: string }
export type VoiceStatus = 'offline' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';
