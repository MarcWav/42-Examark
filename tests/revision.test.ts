import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type {Exercise} from '../src/types.ts';
import {initial,emptyRecord} from '../src/storage.ts';
import {studyStatistics} from '../src/statistics.ts';
import {getExplanation} from '../src/content/explanations.ts';
import {getSolutions,getSolution,solutionLines,solutionValidation} from '../src/content/answer-key.ts';
import {renderSubject} from '../src/ui/subject.ts';
import {renderHints,renderAnswerKey} from '../src/ui/education.ts';
import {renderProgress,renderExamLanding} from '../src/ui/overview.ts';
const {variants,catalog}:{variants:Exercise[];catalog:Exercise[]}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
test('all subjects and variants explain input, task, result and real rules near the original',()=>{
 for(const e of variants){
  const text=getExplanation(e),html=renderSubject(e);
  assert(text.paragraphs.length>=2&&text.parameters.length>35&&text.rules.length>=2);
  const positions=['Explicando de forma simples','Enunciado original (inglês)','Como a função deve começar','Regras do exercício','<h3>Exemplos</h3>','source-compact'].map(label=>html.indexOf(label));
  assert(positions.every((v,i)=>v>=0&&(i===0||v>positions[i-1])),e.id);
  assert(!html.includes('Subject verificado'));
  assert(html.includes('comunitária'));
  if(e.id==='cryptic_sorter_xornic')assert(html.includes('não disponibiliza um enunciado completo'));
  else assert(html.includes(e.original.split('\n')[0].replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;")));
 }
});
test('all examples stay available, with no more than two visible before expansion',()=>{
 for(const e of variants){const html=renderSubject(e);const folded=html.split('<details class="more-examples">')[0];assert((folded.match(/data-sample=/g)??[]).length<=2);assert.equal((html.match(/data-sample=/g)??[]).length,e.examples.length);assert(html.includes('example-why'))}
});
test('answer key starts hidden and reveals exactly the selected implementation',()=>{
 for(const e of variants){const before=JSON.stringify(e);const hidden=renderAnswerKey(e,false);assert(hidden.includes('Ver gabarito'));assert(!hidden.includes('solution-code'));assert(!hidden.includes('data-line='));
  for(const s of getSolutions(e)){const shown=renderAnswerKey(e,true,0,s.id);assert.equal((shown.match(/data-line=/g)??[]).length,s.notes.length);assert(shown.includes('Testes locais: '+e.tests.length+'/'+e.tests.length+' aprovados.'));assert(shown.includes('data-answer-picker'))}
  assert.equal(JSON.stringify(e),before);
  assert(!renderHints(e,false).includes('solution-code'));
  assert(renderHints(e,false).includes('Dica 4 — Gabarito'));
 }
});
test('all 32 solutions have matching signature, line notes and a fresh real test report',()=>{
 let count=0;for(const e of variants){const solutions=getSolutions(e);assert.equal(solutions.length,2);assert.notEqual(solutions[0].strategy,solutions[1].strategy);
 for(const s of solutions){assert.equal(s.code.split('\n')[0],e.signature);const lines=solutionLines(s);assert.equal(lines.length,s.notes.length);assert(lines.every(row=>row.note.text.length>25));const checked=solutionValidation(e,s);assert.equal(checked?.passed,e.tests.length);assert.equal(checked?.total,e.tests.length);count++}}
 assert.equal(count,32);
});
test('validation badge refuses changed code or changed tests even with the same exercise version',()=>{
 const e=variants[0],s=getSolution(e);assert(solutionValidation(e,s));assert.equal(solutionValidation(e,{...s,code:s.code+'# changed'}),undefined);const changed=structuredClone(e);changed.tests[0].output='different';assert.equal(solutionValidation(changed,s),undefined);
});
test('sorter and sculptor answer variants preserve distinct comparison and space rules',()=>{
 const stable=getSolution(variants.find(e=>e.id==='cryptic_sorter')!,'alternative');const original=getSolution(variants.find(e=>e.id==='cryptic_sorter_xornic')!,'alternative');assert(!stable.code.includes('vowels, word)'));assert(original.code.includes('vowels, word)'));assert(!stable.code.includes('sorted('));assert(!stable.code.includes('.sort('));
 const continuous=getSolution(variants.find(e=>e.id==='string_sculptor')!,'alternative');const reset=getSolution(variants.find(e=>e.id==='string_sculptor_examshell')!,'alternative');assert(!continuous.code.includes("text.split(' ')"));assert(reset.code.includes("text.split(' ')"));
});
test('untouched exercises are not review failures and resolved concepts leave the review list',()=>{
 const p=initial();assert.deepEqual(studyStatistics(p,catalog).review,[]);p.records.hidenp={...emptyRecord('meu código'),attempts:1,errors:1};assert.deepEqual(studyStatistics(p,catalog).review,['hidenp']);p.records.hidenp.passed=true;p.records.hidenp.understood=true;assert.deepEqual(studyStatistics(p,catalog).review,[]);assert.equal(p.records.hidenp.code,'meu código');
});
test('compact overview has useful empty states and all exam configuration controls',()=>{
 const p=initial(),html=renderProgress(p,catalog);for(const label of ['Progresso','Exercícios concluídos','Conceitos compreendidos','Tempo de estudo','Tentativas','Progresso por nível','Exercícios para revisar','Nenhuma revisão pendente.','Nenhum simulado realizado.'])assert(html.includes(label),label);
 const exam=renderExamLanding(p);for(const id of ['exam-duration','exam-reroll','start-exam'])assert(exam.includes('id="'+id+'"'));assert(exam.includes('Iniciar simulado'));assert(!exam.includes('exam-symbol'));
});
test('main UI removes decorative slogans and keeps legacy persistence identifiers',()=>{
 const source=fs.readFileSync('src/main.ts','utf8')+fs.readFileSync('src/ui/education.ts','utf8')+renderProgress(initial(),catalog)+renderExamLanding(initial());
 for(const text of ['Você está construindo o próximo nível','Pratique sob pressão','Cada tentativa conta','Pequenos passos. Progresso real.','Um nível de cada vez','Uma boa hora para revisar','Seu próximo passo começa aqui','Sua jornada','Um desafio, seis níveis','Travou? Tudo bem.','Seu espaço de estudo, no seu ritmo.'])assert(!source.toLowerCase().includes(text.toLowerCase()),text);
 assert(fs.readFileSync('index.html','utf8').includes('<title>42 Examark</title>'));
 const electron=fs.readFileSync('electron/main.cjs','utf8');assert(electron.includes("app.setName('42 Examark')"));assert(electron.includes("app.getPath('appData'),'42 Exam Trainer'"));assert(electron.includes("path.join(portable,'42 Exam Trainer Dados')"));assert(electron.includes('contextIsolation:true,sandbox:true'));
 assert(fs.readFileSync('src/storage.ts','utf8').includes('42-exam-trainer-v1'));assert(fs.readFileSync('src/history.ts','utf8').includes('42-exam-trainer-history'));
});
