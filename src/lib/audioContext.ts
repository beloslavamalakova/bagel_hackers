let context:AudioContext|undefined;
/** Prime in the Start click, then reuse across permission dialogs and scene changes.
 * Using one graph also lets browser echo cancellation reference NPC playback.
 */
export function conversationAudioContext(){
 if(!context||context.state==='closed')context=new AudioContext();
 return context;
}
export function primeConversationAudio(){
 const audio=conversationAudioContext();
 void audio.resume().catch(()=>{});
 return audio;
}
