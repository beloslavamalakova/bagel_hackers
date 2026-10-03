import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,outdir:'dist/assets',minify:true,format:'esm',target:'es2022',jsx:'automatic',define:{'import.meta.env.DEV':'false'}});
const html=await readFile('index.html','utf8');
await writeFile('dist/index.html',html.replace('<script type="module" src="/src/main.tsx"></script>','<link rel="stylesheet" href="/assets/main.css"/><script type="module" src="/assets/main.js"></script>'));
console.log('Built Lost in Paris → dist/');
