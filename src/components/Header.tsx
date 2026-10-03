import { useState } from 'react';
import { Icon } from './Icon';
export function Header({home,onHome}:{home:boolean;onHome:()=>void}){
 const [open,setOpen]=useState(false);
 return <header className="header"><button className="brand" onClick={onHome} aria-label="Lost in Paris home"><span className="brand-symbol"><Icon name="croissant" size={24}/></span>Lost in <i>Paris</i><span className="brand-period">.</span></button><div className="header-right">{home&&<span className="header-tagline">A LANGUAGE ADVENTURE</span>}<div className="language-select"><button aria-expanded={open} onClick={()=>setOpen(!open)}>🇫🇷 <span>French</span><span className="language-level">A1</span><span className="chevron">⌄</span></button>{open&&<div className="language-menu"><strong>Your next destination</strong><div>🇫🇷 French <span>Let’s go</span></div>{['🇪🇸 Spanish','🇮🇹 Italian','🇸🇪 Swedish'].map(x=><div key={x} aria-disabled="true">{x}<span>Coming soon</span></div>)}</div>}</div></div></header>
}
