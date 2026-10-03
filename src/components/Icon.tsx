import type { CSSProperties } from 'react';
type Name = 'mic'|'arrow'|'pin'|'check'|'spark'|'sound'|'coffee'|'croissant'|'battery'|'close'|'retry'|'headphones';
const paths:Record<Name,string>= {
 mic:'M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Zm-7-4v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8',
 arrow:'M4 12h16M14 6l6 6-6 6', pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 check:'m5 12 4 4L19 6',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3',
 sound:'m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
 coffee:'M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 2v3M12 2v3M2 22h18',
 croissant:'M3 17 2 12l5-6 5-2 5 2 5 6-1 5-4-2-2-4-3-1-3 1-2 4-4 2ZM7 6l2 5M17 6l-2 5M12 4v6',
 battery:'M20 8h2v8h-2M3 6h15v14H3V6Zm3 5 9 6M15 11l-9 6',
 close:'m6 6 12 12M18 6 6 18',retry:'M3 10a9 9 0 1 1 1 8M3 4v6h6',headphones:'M3 14v-3a9 9 0 0 1 18 0v3M3 13h4v8H3v-8Zm14 0h4v8h-4v-8'
};
export function Icon({name,size=20,style,className=''}:{name:Name;size?:number;style?:CSSProperties;className?:string}){return <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}
