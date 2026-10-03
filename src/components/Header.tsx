import { useState } from 'react';
import { Icon } from './Icon';
import { Handbook } from './Handbook';
import type { SceneConfig } from '../types/game';
export function Header({home,onHome,onBack,handbookScene}:{home:boolean;onHome:()=>void;onBack?:()=>void;handbookScene?:SceneConfig}){
 const [open,setOpen]=useState(false);
 return <header className="header"><div className="header-left">{onBack&&<button className="header-back" type="button" onClick={onBack}><Icon name="arrow" size={16}/>Back</button>}<button className="brand" onClick={onHome} aria-label="Elsewhere home"><span className="brand-symbol"><Icon name="croissant" size={24}/></span>Elsewhere<span className="brand-period">.</span></button></div><div className="header-right">{home&&<span className="header-tagline">A LANGUAGE ADVENTURE</span>}{handbookScene&&<Handbook key={handbookScene.id} scene={handbookScene}/>}<div className="language-select"><button aria-expanded={open} onClick={()=>setOpen(!open)}>🇫🇷 <span>French</span><span className="language-level">A1</span><span className="chevron">⌄</span></button>{open&&<div className="language-menu"><strong>Your next destination</strong><div>🇫🇷 French <span>Let’s go</span></div>{['🇪🇸 Spanish','🇮🇹 Italian','🇸🇪 Swedish'].map(x=><div key={x} aria-disabled="true">{x}<span>Coming soon</span></div>)}</div>}</div></div></header>
}
