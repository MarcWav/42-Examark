const fs=require('node:fs');
const path=require('node:path');
const {once}=require('node:events');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
module.exports=async function revisionQA(window){
 const wc=window.webContents,checks=[],layouts=[],screenshotErrors=[];
 const capture=async file=>{try{fs.writeFileSync(file,(await wc.capturePage()).toPNG())}catch(error){screenshotErrors.push({file,error:String(error)})}};
 const run=async(fn,arg)=>{const result=await wc.executeJavaScript('(async()=>{try{return await ('+fn.toString()+')('+JSON.stringify(arg??null)+')}catch(error){return {__qaError:String(error),stack:error.stack}}})()');if(result?.__qaError)throw Error(result.__qaError+'\n'+result.stack+'\n'+fn.toString().slice(0,350));return result};
 const assert=(ok,message)=>{if(!ok)throw Error(message)};
 const wait=async(fn,label,timeout=15000)=>{for(let t=0;t<timeout;t+=100){if(await run(fn))return;await pause(100)}throw Error('Esperando '+label+': '+await run(()=>document.body.innerText.slice(-1800)))};
 const click=selector=>run(selector=>{const el=document.querySelector(selector);if(!el)throw Error('Elemento ausente: '+selector);el.click()},selector);
 const setCode=async code=>{
  await run(code=>{const content=document.querySelector('.cm-content');content.focus();if(!document.execCommand('selectAll')||!document.execCommand('insertText',false,code))throw Error('Não foi possível editar o documento pelo fluxo de entrada do Chromium')},code);
  let actual;
  for(let i=0;i<100;i++){actual=await run(()=>{const p=JSON.parse(localStorage.getItem('42-exam-trainer-v1'));return p.records[p.selected]?.code});if(actual===code)return;await pause(50)}
  throw Error('O editor não salvou exatamente o texto inserido: '+JSON.stringify({expected:code,actual}));
 };
 const {variants}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
 const {assertNoSlogans}=require('../scripts/verify-ui-language.cjs');
 const {getSolutions}=await import(require('node:url').pathToFileURL(path.resolve('.cache/review-exports.mjs')).href);
 const solutions=variants.map(e=>({id:e.id,name:e.name,signature:e.signature,solutions:getSolutions(e)}));
 assert(await run(()=>document.title==='42 Examark'),'Título visível');
 const marker='# código preservado na revisão\ndef bracket_validator(s: str) -> bool:\n    return False\n';
 await setCode(marker);assert(await run(code=>JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records.bracket_validator.code===code,marker),'Entrada no editor Python e salvamento automático');
 for(const entry of solutions){
  await click('[data-exercise="'+entry.name+'"]');
  if(entry.id!==entry.name)await run(id=>{const el=document.querySelector('#version');el.closest('details').open=true;el.value=id;el.dispatchEvent(new Event('change',{bubbles:true}))},entry.id);
  const original=await run(id=>JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records[id]?.code??Array.from(document.querySelectorAll('.cm-content .cm-line')).map(el=>el.textContent).join('\n'),entry.id);
  await click('[data-tab="solution"]');
  assert(await run(()=>!!document.querySelector('#reveal')&&!document.querySelector('.solution-code')),'Gabarito inicialmente oculto: '+entry.id);
  await click('#reveal');
  assert(await run(()=>!document.querySelector('dialog[open]')&&!!document.querySelector('.solution-code')),'Revelar com um clique');
  for(const option of entry.solutions){
   await run(id=>{const el=document.querySelector('#answer-solution');el.value=id;el.dispatchEvent(new Event('change',{bubbles:true}))},option.id);
   const displayed=await run(()=>Array.from(document.querySelectorAll('.solution-line code')).map(el=>el.textContent).join('\n'));
   assert(displayed===option.code.trimEnd(),'Código selecionado: '+entry.id+'/'+option.id);
   assertNoSlogans(await run(()=>document.body.innerText),entry.id+'/'+option.id);
   const line=Math.min(2,option.notes.length-1);await click('[data-line="'+line+'"]');
   assert(await run(note=>document.querySelector('.line-detail').textContent.includes(note),option.notes[line].text),'Explicação da linha selecionada');
  }
  assert(await run(({id,original})=>JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records[id].code===original,{id:entry.id,original}),'O gabarito substituiu o código do estudante');
 }
 console.log('UI QA checkpoint',checks.length+1);checks.push('32 soluções selecionadas na interface, com linhas corretas e código do estudante preservado');
 await click('[data-exercise="bracket_validator"]');await click('[data-tab="solution"]');
 assert(await run(()=>!!document.querySelector('#reveal')&&!document.querySelector('.solution-code')),'Voltar a um exercício deve ocultar o gabarito');
 await click('#reveal');await run(()=>{const el=document.querySelector('#answer-solution');el.value='alternative';el.dispatchEvent(new Event('change',{bubbles:true}))});
 await click('[data-tab="visual"]');await wait(()=>!!document.querySelector('.live-trace'),'visualização');
 assert(await run(()=>document.querySelector('#visual-solution').value==='alternative'&&!document.querySelector('.stack-graphic')),'Rastreamento da alternativa selecionada');
 await run(()=>{const el=document.querySelector('#trace-position');el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}))});
 assert(await run(()=>document.querySelector('.final-return strong')?.textContent==='True'),'Retorno real da alternativa');
 console.log('UI QA checkpoint',checks.length+1);checks.push('Gabarito ocultado ao trocar de exercício e rastreamento vinculado à solução escolhida');
 await click('[data-tab="subject"]');await setCode('def bracket_validator(s: str) -> bool:\n    return 1\n');await click('#grade');
 await wait(()=>!!document.querySelector('.result-summary')&&!document.querySelector('#grade').disabled,'correção detalhada');
 assert(await run(()=>document.querySelectorAll('[data-test-result]').length===63),'Transparência dos 63 casos');
 assert(await run(()=>document.querySelector('.primary-diagnosis')?.textContent.includes('True ou False')&&document.querySelector('.primary-diagnosis')?.textContent.includes('inteiro')),'Diagnóstico simples de tipo: '+JSON.stringify(await run(()=>({diagnosis:document.querySelector('.primary-diagnosis')?.textContent,code:JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records.bracket_validator.code}))));
 await click('#exercise-history-console');await wait(()=>!!document.querySelector('[data-review-attempt]'),'histórico');
 await click('[data-review-attempt]');
 assert(await run(()=>document.querySelector('.cm-content').getAttribute('contenteditable')==='false'),'Revisão somente leitura');
 await click('#back-review');
 console.log('UI QA checkpoint',checks.length+1);checks.push('63 casos inspecionáveis, diagnóstico de tipo em português e histórico com código somente leitura');
 await setCode('while True:\n    pass\n');await run(()=>{const el=document.querySelector('#sample');el.value='-1';el.dispatchEvent(new Event('change',{bubbles:true}))});await click('#run');await wait(()=>!document.querySelector('#stop').hidden,'execução ativa');await click('#stop');await wait(()=>!document.querySelector('#run').disabled&&document.querySelector('#runtime')?.textContent.includes('pronto'),'recuperação após interrupção');
 await click('#settings');await run(()=>{document.querySelector('#timeout-setting').value='2000'});await click('#save-settings');
 await click('#run');await wait(()=>document.querySelector('#console-output').textContent.includes('Tempo excedido')&&!document.querySelector('#run').disabled,'timeout',12000);await wait(()=>document.querySelector('#runtime')?.textContent.includes('pronto'),'recuperação após timeout');
 await setCode(variants[0].solution);await click('#grade');await wait(()=>document.querySelector('.result-summary')?.textContent.includes('63/63')&&!document.querySelector('#grade').disabled,'nova correção');
 console.log('UI QA checkpoint',checks.length+1);checks.push('Interrupção manual, timeout e nova correção 63/63 sem congelar a interface');
 await click('[data-tab="notes"]');await run(()=>{const note=document.querySelector('#notes');note.value='Índice e pilha — nota preservada';note.dispatchEvent(new Event('input',{bubbles:true}));const el=document.querySelector('#comprehension');el.value='partial';el.dispatchEvent(new Event('change',{bubbles:true}))});
 const saved=await run(()=>JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records.bracket_validator);
 const loaded=once(wc,'did-finish-load');wc.reload();await loaded;await wait(()=>!!document.querySelector('#runtime')?.textContent.includes('pronto'),'recarregar');
 assert(await run(saved=>{const now=JSON.parse(localStorage.getItem('42-exam-trainer-v1')).records.bracket_validator;return now.code===saved.code&&now.notes===saved.notes&&now.passed&&now.comprehension==='partial'},saved),'Persistência após recarregar');
 await click('[data-mode="exam"]');assert(await run(()=>document.querySelector('main h1').textContent==='Simulado'),'Tela de simulado compacta');
 await click('#start-exam');assert(await run(()=>!!document.querySelector('#exam-clock')&&document.querySelectorAll('[role="tab"]').length===1&&!document.querySelector('#reveal')&&!document.querySelector('[data-answer-picker]')),'Dicas e gabaritos indisponíveis');
 await click('#grade');await wait(()=>!!document.querySelector('.result-summary')&&!document.querySelector('#grade').disabled,'correção no simulado');
 assert(await run(()=>!document.querySelector('[data-test-result]')&&!document.querySelector('.primary-diagnosis')),'Casos adicionais ocultos durante simulado');
 await click('#end-exam');await click('#confirm-dialog');
 assert(await run(code=>{const p=JSON.parse(localStorage.getItem('42-exam-trainer-v1'));return !p.activeExam&&p.records.bracket_validator.code===code&&p.exams.length===1},saved.code),'Código de estudo preservado após simulado');
 await click('[data-mode="stats"]');const examSnapshot=await run(()=>JSON.stringify(JSON.parse(localStorage.getItem('42-exam-trainer-v1')).exams));
 await click('[data-review-exam]');await wait(()=>!!document.querySelector('[data-review-attempt]'),'revisão do simulado');await click('[data-review-attempt]');assert(await run(()=>!!document.querySelector('[data-test-result]')),'Casos visíveis após encerrar');await click('#grade');await wait(()=>!document.querySelector('#grade').disabled&&!!document.querySelector('.result-summary'),'replay da revisão');
 assert(await run(before=>JSON.stringify(JSON.parse(localStorage.getItem('42-exam-trainer-v1')).exams)===before,examSnapshot),'Replay alterou resultado histórico');
 console.log('UI QA checkpoint',checks.length+1);checks.push('Notas e códigos persistem; simulado isola códigos, oculta respostas e permite revisão sem mudar o resultado');
 await click('#back-review');await click('[data-mode="study"]');await click('[data-exercise="bracket_validator"]');await click('[data-tab="solution"]');await click('#reveal');await click('[data-line="7"]');
 window.setMinimumSize(360,480);
 for(const [width,height] of [[1920,1080],[1280,720],[900,650],[540,800]]){
  window.setContentSize(width,height);await pause(450);
  const layout=await run(()=>({width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,editor:document.querySelector('#editor').getBoundingClientRect().width,tabs:document.querySelectorAll('[role="tab"]').length}));
  assert(layout.documentWidth<=layout.width+1,'Rolagem horizontal da página: '+JSON.stringify(layout));assert(layout.editor>200,'Editor estreito demais');
  layouts.push(layout);
  if(width===1920)await capture('docs/revision-learning.png');
  if(width===900)await capture('docs/revision-compact.png');
  if(width===540)await capture('docs/revision-mobile.png');
 }
 window.setContentSize(1280,720);await click('[data-tab="subject"]');await run(()=>document.querySelector('[role="tab"][data-tab="subject"]').focus());wc.sendInputEvent({type:'keyDown',keyCode:'Right'});wc.sendInputEvent({type:'keyUp',keyCode:'Right'});await pause(100);
 assert(await run(()=>document.activeElement?.getAttribute('data-tab')==='hints'&&document.querySelector('[role="tab"][data-tab="hints"]').getAttribute('aria-selected')==='true'),'Navegação entre abas por teclado');
 console.log('UI QA checkpoint',checks.length+1);checks.push('Quatro resoluções sem rolagem horizontal da página; editor e navegação entre abas por teclado funcionam');
 window.setContentSize(1440,940);await pause(400);
 return {passed:true,checks,layouts,screenshotErrors};
};
