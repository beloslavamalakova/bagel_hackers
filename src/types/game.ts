export const taskIds = ['street_recommendation', 'street_directions', 'bakery_order'] as const;
export const partyTaskIds = ['party_arrival', 'party_meet_someone', 'party_join_chat'] as const;
export const clubTaskIds = ['club_refused', 'club_boutique', 'club_return'] as const;
export const allTaskIds = [...taskIds, ...partyTaskIds, ...clubTaskIds] as const;
export type TaskId = typeof allTaskIds[number];
export type StoryId = 'paris' | 'first_party' | 'club';
export const taskIdsByStory: Record<StoryId, readonly TaskId[]> = {
  paris: taskIds,
  first_party: partyTaskIds,
  club: clubTaskIds
};
export function getTaskIds(storyId: StoryId): readonly TaskId[] {
  return taskIdsByStory[storyId];
}
export type SceneId = 'intro' | TaskId | 'completed';
export type HintLevel = 0 | 1 | 2;
export interface GameState { scene: SceneId; storyId: StoryId; hintLevel: HintLevel; completedTasks: TaskId[] }
export interface SceneConfig {
  id: TaskId; npcName: string; npcRole: string; title: string; objective: string;
  context: string; successCriteria: string; hintWords: string[]; fullHint: string;
  followupHint?: string; greeting: string; location: string; environment: string;
  transition: string; voice: string; feedback: string; languageLevel?: string;
  localKnowledge?: string;
  /** Minimum learner speech turns before the server accepts complete_task. */
  minTurns?: number;
}
export interface TranscriptLine { id: number; speaker: 'you' | 'npc'; text: string }
export type VoiceStatus = 'offline' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';
