import type { TaskId } from '../types/game';
export function NPC({id,speaking=false,portrait=false}:{id:TaskId;speaking?:boolean;portrait?:boolean}) {
 const boy=id==='street_directions', employee=id==='bakery_order', lea=id==='bakery_smalltalk';
 const skin=boy?'#c28d68':lea?'#b97b58':'#efba94';
 const hair=boy?'#4c342a':employee?'#66402b':lea?'#342a27':'#65432f';
 return <svg className={`npc-art ${speaking?'is-speaking':''} ${portrait?'portrait':''}`} viewBox="0 0 320 500" role="img" aria-label={boy?'Julien beside his bicycle':employee?'Amélie, your bakery host':lea?'Léa, a fellow coffee lover':'Camille, a friendly local with flowers'}>
 <defs><linearGradient id={`coat-${id}`} x2="1" y2="1"><stop stopColor={boy?'#658071':employee?'#f6e4cc':lea?'#b76449':'#c6a17b'}/><stop offset="1" stopColor={boy?'#354c43':employee?'#cebaa0':lea?'#8c3d31':'#9f7554'}/></linearGradient></defs>
 <ellipse cx="161" cy="477" rx="94" ry="12" fill="#40382d" opacity=".16"/>
 <path d="M117 367 108 465h40l12-94 8 94h40l-9-98" fill={boy?'#334149':'#3d3631'}/>
 <path d="M106 455q-16 9-20 22h65v-22M171 455v22h65q-10-19-28-22" fill="#352d2a"/>
 <path d="M115 187q-40 4-51 47l-19 112 30 7 30-91-2 114q55 18 115 0l-5-113 24 90 28-9-19-112q-13-41-51-45Z" fill={`url(#coat-${id})`}/>
 <g className="npc-hands"><path d="m75 324-7 35q-5 24-18 22-10-6-3-22l5-34M239 326l9 31q8 17 16 15 11-4 0-22l-9-28" fill={skin}/></g>
 <path d="M139 162v31q19 19 42 0v-31" fill={skin}/>
 {!boy && <path d="M112 110q-2-74 47-76 59 1 52 78l11 68-33 10-61-2-22-16Z" fill={hair}/>}
 <ellipse cx="160" cy="120" rx="48" ry="61" fill={skin}/>
 <ellipse cx="113" cy="125" rx="8" ry="13" fill={skin}/><ellipse cx="207" cy="125" rx="8" ry="13" fill={skin}/>
 <path d={boy?'M112 104q-9-61 43-67 53-3 57 57l-20-16-11-14q-24 23-69 19Z':lea?'M112 100q-4-70 58-67 51 12 40 82l-22-30q-17-9-19-25-17 30-57 40Z':'M112 105q-2-58 44-67 50-5 56 64l-21-9-9-29q-25 28-70 41Z'} fill={hair}/>
 <path d="M130 108q8-5 16-1M176 107q8-5 16 1" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round"/>
 <ellipse className="npc-eye" cx="139" cy="119" rx="3" ry="4" fill="#3c332e"/><ellipse className="npc-eye" cx="183" cy="119" rx="3" ry="4" fill="#3c332e"/>
 <path d="m158 121-3 15 9 1" fill="none" stroke="#c1886d" strokeWidth="2" strokeLinecap="round"/>
 <path className="npc-mouth" d="M146 151q14 13 30-1" fill={speaking?'#934f43':'none'} stroke="#984f42" strokeWidth="2.3" strokeLinecap="round"/>
 <ellipse cx="129" cy="139" rx="10" ry="5" fill="#e89f87" opacity=".4"/><ellipse cx="191" cy="139" rx="10" ry="5" fill="#e89f87" opacity=".4"/>
 {boy?<><path d="M113 188 147 230l13-28 15 28 29-42" fill="#f2e7d4"/><path d="M160 229v143" stroke="#293d34" strokeWidth="2"/><circle cx="164" cy="258" r="3" fill="#bdbaa3"/></>:employee?<><path d="m124 190 14 62h51l13-62" fill="none" stroke="#9d5040" strokeWidth="9"/><path d="M127 244h69l14 132h-99Z" fill="#a24c3c"/><path d="M133 290h59v45h-59Z" fill="#8e4033"/><text x="162" y="275" fontSize="12" fill="#f8e2c5" textAnchor="middle" fontFamily="Georgia">Lumière</text></>:lea?<><path d="M139 188q19 30 45 0l5 29h-53Z" fill="#f3dbc3"/><path d="M131 197q31 46 65 0" fill="none" stroke="#d2a657" strokeWidth="2"/><circle cx="164" cy="226" r="4" fill="#d2a657"/></>:<><path d="m136 186 26 22-18 45-29-59M183 186l-21 22 10 50 33-64" fill="#ead6bb"/><path d="M162 207v168" stroke="#7b5c45" strokeWidth="2"/><circle cx="168" cy="280" r="3" fill="#4c3b30"/><circle cx="168" cy="321" r="3" fill="#4c3b30"/></>}
 {id==='street_recommendation'&&<g transform="translate(48 248) rotate(-16)"><path d="m0 0 17 91 25-3 12-87" fill="#dcc49f"/><path d="M24 58 12-7M29 55 35-16M30 57 49-2" stroke="#607254" strokeWidth="3"/>{[[10,-9],[32,-18],[48,-6],[24,-2]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="12" fill={i%2?'#ebd1b6':'#ae5d60'}/><circle cx={x} cy={y} r="5" fill="#e8b263"/></g>)}</g>}
 {lea&&<g transform="translate(225 326)"><path d="M0 0h27v25q-13 12-27 0Z" fill="#f6ebd6"/><path d="M27 5q18-1 12 16H27" fill="none" stroke="#f6ebd6" strokeWidth="4"/><ellipse cx="13" cy="0" rx="14" ry="4" fill="#5e3d2c"/></g>}
 </svg>
}
