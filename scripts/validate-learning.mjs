import './export-catalog.mjs';
import {build} from 'esbuild';
import {Worker} from 'node:worker_threads';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import fs from 'node:fs';
await build({entryPoints:['src/content/education.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/education.mjs'});
await build({entryPoints:['src/learning/literals.ts'],bundle:true,platform:'node',format:'esm',outfile:'.cache/literals.mjs'});
const {getEducation,getLineNotes}=await import('../.cache/education.mjs');
const {parseLiteral,makeCall}=await import('../.cache/literals.mjs');
const {variants}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
const worker=new Worker(new URL('../tests/python-node-worker.mjs',import.meta.url));
await once(worker,'message');
const request=async payload=>{const wait=once(worker,'message');worker.postMessage(payload);const [message]=await wait;if(message.error)throw Error(message.error);return message.data};
const report={passed:true,traceCases:0,events:0,exercises:[],checks:[]};
try{
 for(const e of variants){
  const samples=[...getEducation(e).examples.map(sample=>({input:makeCall(e.name,sample.args),output:sample.expected})),...e.examples.map(sample=>({input:sample.input,output:parseLiteral(sample.output)}))];
  let count=0;
  for(const sample of samples){const r=await request({action:'trace',code:e.solution,input:sample.input,tests:[]});assert(!r.error,`${e.id}: ${r.error}`);assert.deepEqual(r.trace.output.value,sample.output,e.id+' '+sample.input);assert.equal(r.trace.source,e.solution);for(const step of r.trace.steps){assert.ok(step.line>=1&&step.line<=getLineNotes(e).length);assert.ok(['line','return'].includes(step.event));assert.ok(step.variables&&typeof step.variables==='object');if(step.condition)assert.equal(typeof step.condition.result,'boolean')}report.traceCases++;count++;report.events+=r.trace.steps.length;}
  report.exercises.push({id:e.id,traceCases:count});console.log('TRACE PASS',e.id,count);
 }
 const bracket=variants[0];
 let r=await request({action:'trace',code:bracket.solution,input:'bracket_validator("([])")',tests:[]});const stacks=r.trace.steps.filter(s=>s.variables.stack).map(s=>JSON.stringify(s.variables.stack.value));const changes=stacks.filter((x,i)=>i===0||x!==stacks[i-1]);assert.deepEqual(changes,['[]','["("]','["(","["]','["("]','[]']);report.checks.push('Pilha real: vazio → ( → ([ → ( → vazio');
 r=await request({action:'trace',code:bracket.solution,input:'bracket_validator(")")',tests:[]});assert.equal(r.trace.output.value,false);assert.ok(r.trace.steps.some(s=>s.condition?.expression.includes('not stack or')&&s.condition.result===true));assert.ok(!r.trace.steps.some(s=>s.event==='exception'));report.checks.push('or em pilha vazia não executou pop');
 const hidden=variants.find(e=>e.id==='hidenp');r=await request({action:'trace',code:hidden.solution,input:'hidenp("", "abc")',tests:[]});assert.equal(r.trace.output.value,true);report.checks.push('and evita índice em small vazia');
 const standard=variants.find(e=>e.id==='string_sculptor'),other=variants.find(e=>e.id==='string_sculptor_examshell');for(const [e,expected] of [[standard,'hElLo WoRlD'],[other,'hElLo wOrLd']]){r=await request({action:'trace',code:e.solution,input:'string_sculptor("Hello World")',tests:[]});assert.equal(r.trace.output.value,expected)}report.checks.push('Variantes de alternância produzem estados e saídas separados');
 const one=bracket.tests[0];const grade=code=>request({code,tests:[one],restricted:false});
 r=await grade('def bracket_validator(s):\n    return 1');assert.equal(r.results[0].errorType,'type');assert.equal(r.results[0].actualType,'int');assert.equal(r.results[0].expectedType,'bool');report.checks.push('Tipo incorreto distingue bool de int');
 r=await grade('def bracket_validator(s):\n    return False');assert.equal(r.results[0].errorType,'value');assert.equal(r.results[0].actualAvailable,true);report.checks.push('Valor incorreto mantém retorno observado');
 r=await grade('def bracket_validator(s):\n    raise IndexError("teste")');assert.equal(r.results[0].errorType,'runtime');assert.equal(r.results[0].actualAvailable,false);assert.equal(r.results[0].actual,'');report.checks.push('Exceção não inventa retorno None');
 r=await grade('def bracket_validator(s)\n    pass');assert.equal(r.errorType,'syntax');assert.equal(r.results.length,0);report.checks.push('Sintaxe impede execução sem resultados inventados');
 r=await request({code:bracket.solution,tests:[{input:'not a call',output:'True'}],restricted:false});assert.equal(r.errorType,'internal');report.checks.push('Teste malformado é falha do avaliador');
 r=await grade('def bracket_validator(s):\n    print("debug")\n    return True');assert.equal(r.results[0].errorType,'side_effect');assert.equal(r.results[0].stdout,'debug\n');report.checks.push('Saída extra é separada do retorno');
 r=await request({code:'def cryptic_sorter(strings):\n    alias=sorted\n    return alias(strings)',tests:variants[1].tests,restricted:true});assert.equal(r.errorType,'restriction');assert.equal(r.checks[0].passed,false);assert.equal(r.results.length,0);report.checks.push('Restrição retorna o resultado real da inspeção AST');
 r=await grade(bracket.solution);assert.equal(r.results[0].id,one.meta.id);assert.deepEqual(r.results[0].metadata,one.meta);assert.ok(r.results[0].durationMs>=0);report.checks.push('IDs, metadados e tempo acompanham o caso efetivamente executado');
 fs.writeFileSync('docs/learning-validation.json',JSON.stringify(report,null,2));console.log(`PASS: ${report.traceCases} rastreamentos, ${report.events} eventos reais; ${report.checks.length} verificações específicas.`);
}finally{await worker.terminate()}
