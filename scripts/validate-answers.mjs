import './export-catalog.mjs';
import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {once} from 'node:events';
await build({entryPoints:['src/content/answer-key.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/answer-key.mjs'});
await build({entryPoints:['src/learning/literals.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/literals.mjs'});
const {getSolutions,fingerprint,suiteFingerprint}=await import('../.cache/answer-key.mjs');
const {parseLiteral}=await import('../.cache/literals.mjs');
const {variants}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
const worker=new Worker(new URL('../tests/python-node-worker.mjs',import.meta.url));await once(worker,'message');
const request=async payload=>{const wait=once(worker,'message');worker.postMessage(payload);const [message]=await wait;if(message.error)throw Error(message.error);return message.data};
const report={runtime:'Pyodide 0.27.7 / CPython 3.12',passed:true,cases:0,traces:0,solutions:[]};
try{
 for(const e of variants)for(const s of getSolutions(e)){
  const result=await request({code:s.code,tests:e.tests,restricted:e.restrictions.length>0,newMatrix:e.name==='mirror_matrix'});
  assert(!result.error&&!result.restriction&&result.results.length===e.tests.length&&result.results.every(r=>r.passed),e.id+'/'+s.id+': '+JSON.stringify(result.error||result.restriction||result.results.filter(r=>!r.passed)));
  for(const sample of e.examples){const trace=await request({action:'trace',code:s.code,input:sample.input,tests:[]});assert(!trace.error,e.id+'/'+s.id+': '+trace.error);assert.deepEqual(trace.trace.output.value,parseLiteral(sample.output));assert.equal(trace.trace.source,s.code);for(const step of trace.trace.steps){assert(step.line>=1&&step.line<=s.notes.length)}report.traces++}
  const row={exerciseId:e.id,solutionId:s.id,label:s.label,version:e.version,fingerprint:fingerprint(s.code),suiteFingerprint:suiteFingerprint(e),passed:result.results.filter(r=>r.passed).length,total:e.tests.length,restrictionsChecked:true};
  report.solutions.push(row);report.cases+=row.total;console.log('PASS',e.id,s.label,row.passed+'/'+row.total);
 }
 fs.writeFileSync('src/content/answer-validation.json',JSON.stringify({solutions:report.solutions},null,2)+'\n');
 fs.writeFileSync('docs/answer-validation.json',JSON.stringify(report,null,2)+'\n');
 console.log('PASS:',report.solutions.length,'soluções;',report.cases,'casos;',report.traces,'rastreamentos.');
}finally{await worker.terminate()}
