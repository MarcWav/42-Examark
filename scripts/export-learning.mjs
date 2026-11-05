import './export-catalog.mjs';
import {build} from 'esbuild';
import fs from 'node:fs';
await build({entryPoints:['src/content/education.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/education.mjs'});
await build({entryPoints:['src/learning/literals.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/literals.mjs'});
const {getEducation}=await import('../.cache/education.mjs');
const {makeCall}=await import('../.cache/literals.mjs');
const {variants}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
fs.writeFileSync('.cache/teaching-samples.json',JSON.stringify(variants.flatMap(e=>getEducation(e).examples.map(sample=>({id:e.id,input:makeCall(e.name,sample.args),expected:sample.expected}))),null,2));
