import type { TaskId } from '../types/game';
export function NPC({id,speaking=false,portrait=false}:{id:TaskId;speaking?:boolean;portrait?:boolean}) {
 if(id==='club_refused'||id==='club_return')return <Bouncer id={id} speaking={speaking} portrait={portrait}/>;
 if(id==='club_boutique')return <Shopkeeper speaking={speaking} portrait={portrait}/>;
 const boy=id==='street_directions', employee=id==='bakery_order';
 const skin='#efba94';
 const hair=boy?'#4c342a':employee?'#66402b':'#65432f';
 return <svg className={`npc-art ${speaking?'is-speaking':''} ${portrait?'portrait':''}`} viewBox="0 0 320 500" role="img" aria-label={boy?'Julien beside his bicycle':employee?'Amélie, your bakery host':'Camille, a friendly local with flowers'}>
 <defs><linearGradient id={`coat-${id}`} x2="1" y2="1"><stop stopColor={boy?'#658071':employee?'#f6e4cc':'#c6a17b'}/><stop offset="1" stopColor={boy?'#354c43':employee?'#cebaa0':'#9f7554'}/></linearGradient></defs>
 <ellipse cx="161" cy="477" rx="94" ry="12" fill="#40382d" opacity=".16"/>
 <path d="M117 367 108 465h40l12-94 8 94h40l-9-98" fill={boy?'#334149':'#3d3631'}/>
 <path d="M106 455q-16 9-20 22h65v-22M171 455v22h65q-10-19-28-22" fill="#352d2a"/>
 <path d="M115 187q-40 4-51 47l-19 112 30 7 30-91-2 114q55 18 115 0l-5-113 24 90 28-9-19-112q-13-41-51-45Z" fill={`url(#coat-${id})`}/>
 <g className="npc-hands"><path d="m75 324-7 35q-5 24-18 22-10-6-3-22l5-34M239 326l9 31q8 17 16 15 11-4 0-22l-9-28" fill={skin}/></g>
 <path d="M139 162v31q19 19 42 0v-31" fill={skin}/>
 {!boy && <path d="M112 110q-2-74 47-76 59 1 52 78l11 68-33 10-61-2-22-16Z" fill={hair}/>}
 <ellipse cx="160" cy="120" rx="48" ry="61" fill={skin}/>
 <ellipse cx="113" cy="125" rx="8" ry="13" fill={skin}/><ellipse cx="207" cy="125" rx="8" ry="13" fill={skin}/>
 <path d={boy?'M112 104q-9-61 43-67 53-3 57 57l-20-16-11-14q-24 23-69 19Z':'M112 105q-2-58 44-67 50-5 56 64l-21-9-9-29q-25 28-70 41Z'} fill={hair}/>
 <path d="M130 108q8-5 16-1M176 107q8-5 16 1" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round"/>
 <ellipse className="npc-eye" cx="139" cy="119" rx="3" ry="4" fill="#3c332e"/><ellipse className="npc-eye" cx="183" cy="119" rx="3" ry="4" fill="#3c332e"/>
 <path d="m158 121-3 15 9 1" fill="none" stroke="#c1886d" strokeWidth="2" strokeLinecap="round"/>
 <path className="npc-mouth" d="M146 151q14 13 30-1" fill={speaking?'#934f43':'none'} stroke="#984f42" strokeWidth="2.3" strokeLinecap="round"/>
 <ellipse cx="129" cy="139" rx="10" ry="5" fill="#e89f87" opacity=".4"/><ellipse cx="191" cy="139" rx="10" ry="5" fill="#e89f87" opacity=".4"/>
 {boy?<><path d="M113 188 147 230l13-28 15 28 29-42" fill="#f2e7d4"/><path d="M160 229v143" stroke="#293d34" strokeWidth="2"/><circle cx="164" cy="258" r="3" fill="#bdbaa3"/></>:employee?<><path d="m124 190 14 62h51l13-62" fill="none" stroke="#9d5040" strokeWidth="9"/><path d="M127 244h69l14 132h-99Z" fill="#a24c3c"/><path d="M133 290h59v45h-59Z" fill="#8e4033"/><text x="162" y="275" fontSize="12" fill="#f8e2c5" textAnchor="middle" fontFamily="Georgia">Lumière</text></>:<><path d="m136 186 26 22-18 45-29-59M183 186l-21 22 10 50 33-64" fill="#ead6bb"/><path d="M162 207v168" stroke="#7b5c45" strokeWidth="2"/><circle cx="168" cy="280" r="3" fill="#4c3b30"/><circle cx="168" cy="321" r="3" fill="#4c3b30"/></>}
 {id==='street_recommendation'&&<g transform="translate(48 248) rotate(-16)"><path d="m0 0 17 91 25-3 12-87" fill="#dcc49f"/><path d="M24 58 12-7M29 55 35-16M30 57 49-2" stroke="#607254" strokeWidth="3"/>{[[10,-9],[32,-18],[48,-6],[24,-2]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="12" fill={i%2?'#ebd1b6':'#ae5d60'}/><circle cx={x} cy={y} r="5" fill="#e8b263"/></g>)}</g>}
 </svg>
}
function Bouncer({id,speaking,portrait}:{id:TaskId;speaking:boolean;portrait:boolean}) {
 // Karim softens a little once the learner comes back properly dressed.
 const skin='#8a5a3e',beard='#2a1d18',pleased=id==='club_return';
 return <svg className={`npc-art ${speaking?'is-speaking':''} ${portrait?'portrait':''}`} viewBox="0 0 320 500" role="img" aria-label="Karim, the bouncer at Le Velours">
 <defs><linearGradient id={`coat-${id}`} x2="1" y2="1"><stop stopColor="#33353f"/><stop offset="1" stopColor="#15161c"/></linearGradient></defs>
 <ellipse cx="160" cy="477" rx="112" ry="13" fill="#0d0c12" opacity=".35"/>
 <path d="M106 360 98 465h48l14-92 14 92h48l-8-105" fill="#1d1f26"/>
 <path d="M96 455q-18 9-22 22h72v-22M174 455v22h72q-10-19-30-22" fill="#0e0e12"/>
 <path d="M98 180q-50 6-60 54l-12 128 36 6 24-94v100q74 20 148 0V274l24 94 36-6-12-128q-10-48-60-54Z" fill={`url(#coat-${id})`}/>
 <path d="M136 158v30q24 18 48 0v-30" fill={skin}/>
 <path d="M134 184 160 236 186 184" fill="#ebe8e1"/><path d="m160 202-7 9 7 42 7-42Z" fill="#101014"/>
 <path d="M134 184 160 236l-34-14M186 184l-26 52 34-14" fill="none" stroke="#0f1015" strokeWidth="3"/>
 <rect x="196" y="218" width="30" height="14" rx="2" fill="#c9a24a"/><text x="211" y="228" fontSize="6.5" fill="#2a2416" textAnchor="middle" fontFamily="Arial" fontWeight="700">SÉCU</text>
 <g className="npc-hands"><path d="M56 268q54 44 190 14l8 36q-134 42-206-8Z" fill="#23252e"/><path d="M262 270q-54 46-196 18l-6 34q140 40 212-10Z" fill="#1b1d25"/><ellipse cx="250" cy="302" rx="17" ry="14" fill={skin}/><ellipse cx="70" cy="306" rx="17" ry="14" fill={skin}/></g>
 <ellipse cx="160" cy="112" rx="50" ry="60" fill={skin}/>
 <ellipse cx="111" cy="120" rx="8" ry="13" fill={skin}/><ellipse cx="209" cy="120" rx="8" ry="13" fill={skin}/>
 <ellipse cx="146" cy="70" rx="17" ry="8" fill="#fff" opacity=".13"/>
 <path d="M111 118q4 66 49 68 45-2 49-68-7 32-22 38-27 9-54 0-15-6-22-38Z" fill={beard}/>
 <path d={pleased?'M127 101q11-5 21 1M193 101q-11-5-21 1':'M127 99l21 8M193 99l-21 8'} fill="none" stroke={beard} strokeWidth="5" strokeLinecap="round"/>
 <ellipse className="npc-eye" cx="139" cy="117" rx="3" ry="4" fill="#1e1814"/><ellipse className="npc-eye" cx="181" cy="117" rx="3" ry="4" fill="#1e1814"/>
 <path d="m158 119-4 18 11 1" fill="none" stroke="#5e3a28" strokeWidth="2" strokeLinecap="round"/>
 <path className="npc-mouth" d={pleased?'M145 150q15 10 30 0':'M146 152q14 3 28 0'} fill={speaking?'#5b2e26':'none'} stroke="#c58c78" strokeWidth="2.3" strokeLinecap="round"/>
 <path d="M213 116q13 12 6 46" fill="none" stroke="#c9ccd2" strokeWidth="2"/><circle cx="212" cy="117" r="4" fill="#d6d8dc"/>
 </svg>;
}
function Shopkeeper({speaking,portrait}:{speaking:boolean;portrait:boolean}) {
 const skin='#f0bf9b',hair='#a9482c';
 return <svg className={`npc-art ${speaking?'is-speaking':''} ${portrait?'portrait':''}`} viewBox="0 0 320 500" role="img" aria-label="Margaux, owner of the friperie">
 <defs><linearGradient id="coat-club_boutique" x2="1" y2="1"><stop stopColor="#d9a441"/><stop offset="1" stopColor="#a5731f"/></linearGradient></defs>
 <ellipse cx="161" cy="477" rx="94" ry="12" fill="#40382d" opacity=".16"/>
 <path d="M117 367 108 465h40l12-94 8 94h40l-9-98" fill="#3b4a6b"/>
 <path d="M106 455q-16 9-20 22h65v-22M171 455v22h65q-10-19-28-22" fill="#8c2f3a"/>
 <path d="M115 187q-40 4-51 47l-19 112 30 7 30-91-2 114q55 18 115 0l-5-113 24 90 28-9-19-112q-13-41-51-45Z" fill="url(#coat-club_boutique)"/>
 <path d="M139 188q21 34 42 0l4 186h-50Z" fill="#2f6d68"/>
 {[226,262,298].map(y=><circle key={y} cx="160" cy={y} r="3.5" fill="#f1e2b8"/>)}
 <path d="M134 186q-6 60 6 110M186 186q6 60-6 110" fill="none" stroke="#f2d65c" strokeWidth="5" strokeDasharray="5 4"/>
 <g className="npc-hands"><path d="m75 324-7 35q-5 24-18 22-10-6-3-22l5-34M239 326l9 31q8 17 16 15 11-4 0-22l-9-28" fill={skin}/>
 <g transform="translate(232 300) rotate(12)"><path d="M18 0q-2-10 6-10t6 8L36 4" fill="none" stroke="#8d8d8d" strokeWidth="3"/><path d="M0 14 30 4l30 10-6 16H6Z" fill="#8d8d8d" opacity=".5"/><path d="M8 16h44l8 72H0Z" fill="#c7d9f0"/><path d="M30 16v72" stroke="#9fb5d4" strokeWidth="2"/></g></g>
 <path d="M139 162v31q19 19 42 0v-31" fill={skin}/>
 <path d="M96 116q-14-80 64-84 78 4 64 84 18 30-4 62-16-44-14-70H114q2 26-14 70-22-32-4-62Z" fill={hair}/>
 <ellipse cx="160" cy="120" rx="48" ry="61" fill={skin}/>
 <ellipse cx="113" cy="125" rx="8" ry="13" fill={skin}/><ellipse cx="207" cy="125" rx="8" ry="13" fill={skin}/>
 <path d="M110 104q8-62 50-64 46 2 52 62-30-4-48-30-20 26-54 32Z" fill={hair}/>
 <ellipse className="npc-eye" cx="139" cy="119" rx="3" ry="4" fill="#3c332e"/><ellipse className="npc-eye" cx="183" cy="119" rx="3" ry="4" fill="#3c332e"/>
 <circle cx="139" cy="119" r="13" fill="none" stroke="#5b3a2a" strokeWidth="3"/><circle cx="183" cy="119" r="13" fill="none" stroke="#5b3a2a" strokeWidth="3"/><path d="M152 118q9-5 18 0" fill="none" stroke="#5b3a2a" strokeWidth="3"/>
 <path d="m158 123-3 14 9 1" fill="none" stroke="#c1886d" strokeWidth="2" strokeLinecap="round"/>
 <path className="npc-mouth" d="M144 152q16 14 32-1" fill={speaking?'#934f43':'none'} stroke="#b0453f" strokeWidth="2.6" strokeLinecap="round"/>
 <ellipse cx="127" cy="141" rx="10" ry="5" fill="#e89f87" opacity=".45"/><ellipse cx="193" cy="141" rx="10" ry="5" fill="#e89f87" opacity=".45"/>
 <circle cx="113" cy="140" r="4" fill="#f2d65c"/><circle cx="207" cy="140" r="4" fill="#f2d65c"/>
 </svg>;
}
