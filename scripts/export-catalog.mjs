import {build} from 'esbuild';
import fs from 'node:fs';
fs.mkdirSync('.cache',{recursive:true});
await build({entryPoints:['src/content/catalog.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/catalog.mjs'});
const {variants,catalog}=await import('../.cache/catalog.mjs?'+Date.now());
fs.writeFileSync('.cache/catalog.json',JSON.stringify({variants,catalog},null,2));
