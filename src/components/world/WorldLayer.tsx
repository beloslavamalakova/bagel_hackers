import type { TaskId } from '../../types/game';
import { AmbientActor, AmbientCafeGuest, AmbientCyclist, AmbientDogWalker, AmbientPedestrian } from './AmbientActor';
export function WorldLayer({scene}:{scene:TaskId}) {
 if(scene==='club_refused'||scene==='club_return')return <div className="world-layer outdoors night" aria-hidden="true">
  <div className="club-door-glow"/>
  <AmbientPedestrian speed={33} delay={-9} position={74} scale={.42} tone="#3d3a52"/>
  <AmbientPedestrian direction="left" speed={41} delay={-24} position={80} scale={.55} tone="#5a3346"/>
  <AmbientActor kind="scooter" speed={19} delay={-14} position={86} scale={.6} tone="#2f3a44"/>
  <div className="neon-flicker"/>
 </div>;
 if(scene==='club_boutique')return <div className="world-layer indoors shop" aria-hidden="true">
  <div className="string-light light-one"/><div className="string-light light-two"/><div className="string-light light-three"/>
 </div>;
 const street=scene.startsWith('street');
 return <div className={`world-layer ${street?'outdoors':'indoors'}`} aria-hidden="true">
  {street?<>
   <AmbientPedestrian speed={29} delay={-7} position={70} scale={.39} tone="#a88870"/>
   <AmbientPedestrian direction="left" speed={37} delay={-19} position={76} scale={.51} tone="#737f70"/>
   <AmbientCyclist speed={17} delay={-10} position={83} scale={.63}/>
   <AmbientDogWalker direction="left" speed={43} delay={-28} position={87} scale={.65} tone="#9f6654"/>
   <AmbientCafeGuest position={84} scale={.53} className="cafe-guest-left"/>
   <AmbientActor kind="waiter" speed={35} delay={-23} position={81} scale={.51} tone="#637267"/>
   <div className="wind-leaf leaf-one"/><div className="wind-leaf leaf-two"/>
  </>:<>
   <AmbientCafeGuest position={72} scale={.43} className="cafe-guest-left" tone="#9b7864"/>
   <AmbientCafeGuest position={75} scale={.46} className="cafe-guest-right" tone="#708274"/>
   <AmbientActor kind="baguette" speed={45} delay={-13} position={81} scale={.52} tone="#96724e"/>
   <AmbientActor kind="waiter" direction="left" speed={38} delay={-22} position={79} scale={.49} tone="#a58966"/>
   <div className="coffee-steam steam-one"/><div className="coffee-steam steam-two"/>
   <div className="sunbeam"/>
  </>}
 </div>;
}
