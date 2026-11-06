import './export-catalog.mjs';
import {build} from 'esbuild';
await build({entryPoints:['scripts/review-exports.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/review-exports.mjs'});
