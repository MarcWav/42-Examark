const fs=require('node:fs');
const path=require('node:path');
const {once}=require('node:events');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function runDesktopQA(window,reportFile){
 const wc=window.webContents;
 if(wc.isLoading())await once(wc,'did-finish-load');
 const errors=[];wc.on('console-message',(_event,...args)=>{const message=args.length===1?args[0]?.message:args[1];if(message&&/error|failed|Refused/i.test(message))errors.push(message)});
 for(let i=0;i<90;i++){const ready=await wc.executeJavaScript("document.querySelector('#runtime')?.textContent.includes('pronto')");if(ready)break;if(i===89)throw Error('Python da interface não ficou pronto: '+await wc.executeJavaScript("document.body.innerText"));await pause(1000)}
 const {variants}=JSON.parse(fs.readFileSync(path.join(process.cwd(),'.cache/catalog.json'),'utf8'));
 const payload={harness:fs.readFileSync(path.join(process.cwd(),'src/python/evaluator.py'),'utf8'),variants,samples:JSON.parse(fs.readFileSync('.cache/teaching-samples.json','utf8'))};
 const result=await wc.executeJavaScript(`(${async function(data){
   const assert=(ok,text)=>{if(!ok)throw Error(text)};
   const checks=[];
   assert(location.origin==='trainer://app','origem estável');
   assert(document.querySelectorAll('[data-exercise]').length===14,'catálogo de 14 exercícios');checks.push('Interface de produção abriu no protocolo local');
   assert(typeof window.require==='undefined'&&typeof window.process==='undefined','Node indisponível no renderer');checks.push('Renderer sem Node.js');
   const key='42-exam-trainer-desktop-smoke';localStorage.setItem(key,'persistência á');assert(localStorage.getItem(key)==='persistência á','localStorage');localStorage.removeItem(key);checks.push('localStorage no protocolo local');
   await new Promise((resolve,reject)=>{const req=indexedDB.open('42-exam-desktop-history-smoke',1);req.onupgradeneeded=()=>req.result.createObjectStore('history',{keyPath:'id'});req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('history','readwrite');tx.objectStore('history').put({id:'qa',notes:'índices e pilha'});tx.oncomplete=()=>{const read=db.transaction('history','readonly').objectStore('history').get('qa');read.onsuccess=()=>{assert(read.result.notes==='índices e pilha','IndexedDB preservou os dados');db.close();resolve()};read.onerror=()=>reject(read.error)};tx.onerror=()=>reject(tx.error)}});checks.push('IndexedDB disponível para histórico no protocolo desktop');
   assert((await fetch('/runtime/pyodide.asm.wasm')).headers.get('Content-Type')==='application/wasm','MIME WASM');
   const styles=await (await fetch(document.querySelector('link[rel=stylesheet]').href)).text();assert(!styles.includes('fonts.googleapis.com'),'fontes offline');checks.push('Runtime e fontes locais');
   let worker;
   const boot=()=>new Promise((resolve,reject)=>{worker=new Worker('/python-worker.js?protocol=2');const timer=setTimeout(()=>reject(Error('boot excedeu 60 segundos')),60000);worker.onmessage=({data:d})=>{if(d.type==='ready'){clearTimeout(timer);resolve()}if(d.type==='error'){clearTimeout(timer);reject(Error(d.error))}};worker.onerror=e=>{clearTimeout(timer);reject(Error(e.message))}});
   await boot();
   let caseEvents=0;
   const request=payload=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('execução excedeu 15 segundos')),15000);worker.onmessage=({data:d})=>{if(d.type==='case')caseEvents++;if(d.type==='result'){clearTimeout(timer);resolve(d.data)}if(d.type==='error'){clearTimeout(timer);reject(Error(d.error))}};worker.postMessage({harness:data.harness,payload})});
   const grade=e=>request({code:e.solution,tests:e.tests,restricted:e.restrictions.length>0,newMatrix:e.name==='mirror_matrix'});
   const grades=[];for(const exercise of data.variants){const result=await grade(exercise);assert(!result.error&&!result.restriction&&result.results.length===exercise.tests.length&&result.results.every(t=>t.passed),exercise.id+': '+JSON.stringify(result));grades.push({id:exercise.id,passed:result.results.length})}
   checks.push('Todas as referências executadas no Web Worker do Electron');
   const referenceStreamEvents=caseEvents;assert(referenceStreamEvents===949,'eventos de progresso de cada caso');checks.push('949 resultados individuais transmitidos pelo worker');
   for(const sample of data.samples){const e=data.variants.find(e=>e.id===sample.id);const result=await request({action:'trace',code:e.solution,input:sample.input,tests:[]});assert(!result.error&&JSON.stringify(result.trace?.output.value)===JSON.stringify(sample.expected),'trace '+sample.id+': '+JSON.stringify(result.error));assert(result.trace.steps.length>0,'trace sem estados')}
   checks.push('Exemplos didáticos de todos os exercícios e variantes rastreados no Electron');
   worker.postMessage({harness:data.harness,payload:{code:'while True:\n    pass',tests:[],restricted:false}});await new Promise(resolve=>setTimeout(resolve,300));worker.terminate();await boot();const recovered=await grade(data.variants[0]);assert(recovered.results.every(t=>t.passed),'recuperação');worker.terminate();checks.push('Worker com loop infinito encerrado e recuperado');
   return {passed:true,origin:location.origin,checks,grades,referenceCases:grades.reduce((n,e)=>n+e.passed,0),referenceStreamEvents,teachingTraces:data.samples.length};
 }} )(${JSON.stringify(payload)})`);
 result.revision=await require('./revision-qa.cjs')(window);
 result.consoleErrors=errors;
 fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(result,null,2));
 try{fs.writeFileSync(reportFile.replace(/\.json$/,'.png'),(await wc.capturePage()).toPNG())}catch(error){result.screenshotError=String(error);fs.writeFileSync(reportFile,JSON.stringify(result,null,2))}
}
module.exports={runDesktopQA};
