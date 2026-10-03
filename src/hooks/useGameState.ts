import { useCallback, useRef, useState } from 'react';
import { nextScene } from '../data/scenes';
import { getTaskIds, type GameState, type StoryId, type TaskId } from '../types/game';
export function useGameState(){
 const [state,setState]=useState<GameState>({scene:'intro',storyId:'paris',hintLevel:0,completedTasks:[]});
 const [transition,setTransition]=useState<TaskId|null>(null);
 const [feedback,setFeedback]=useState('');
 const lock=useRef(false);
 const stateRef=useRef(state);stateRef.current=state;
 const complete=useCallback((id:TaskId,shortFeedback?:string)=>{
   if(stateRef.current.scene!==id || lock.current || stateRef.current.completedTasks.includes(id))return;
   lock.current=true;setFeedback(shortFeedback??'');
   setState(s=>({...s,completedTasks:[...s.completedTasks,id]}));setTransition(id);
 },[]);
 const advance=useCallback(()=>{setState(s=>({...s,scene:nextScene(s.scene as TaskId,s.storyId),hintLevel:0}));setTransition(null);lock.current=false;},[]);
 const back=()=>{
   lock.current=false;setTransition(null);setFeedback('');
   setState(s=>{
     const storyTaskIds=getTaskIds(s.storyId);
     const currentIndex=s.scene==='completed'?storyTaskIds.length:storyTaskIds.indexOf(s.scene as TaskId);
     if(currentIndex<=0)return {...s,scene:'intro',hintLevel:0,completedTasks:[]};
     const previousIndex=currentIndex-1;
     return {...s,scene:storyTaskIds[previousIndex],hintLevel:0,completedTasks:s.completedTasks.filter(id=>storyTaskIds.indexOf(id)<previousIndex)};
   });
 };
 const reset=()=>{lock.current=false;setTransition(null);setFeedback('');setState(s=>({scene:'intro',storyId:s.storyId,hintLevel:0,completedTasks:[]}));};
 const selectStory=(storyId:StoryId)=>{lock.current=false;setTransition(null);setFeedback('');setState({scene:'intro',storyId,hintLevel:0,completedTasks:[]});};
 const restartScene=()=>{lock.current=false;setTransition(null);setFeedback('');setState(s=>({...s,hintLevel:0,completedTasks:s.completedTasks.filter(id=>id!==s.scene)}));};
 return {restartScene,state,transition,feedback,complete,advance,back,reset,selectStory,start:()=>setState(s=>({...s,scene:getTaskIds(s.storyId)[0],hintLevel:0,completedTasks:[]})),hint:()=>setState(s=>({...s,hintLevel:Math.min(2,s.hintLevel+1) as 0|1|2}))};
}
