import harness from './python/evaluator.py?raw';
import type {Exercise,Execution,TestCase,TestResult,FailureKind} from './types.ts';

export class ExecutionFailure extends Error {
 constructor(message:string,public execution:Execution){super(message)}
}
export class PythonRunner {
 private worker?:Worker;private ready=false;
 private bootTimer?:ReturnType<typeof setTimeout>;private timer?:ReturnType<typeof setTimeout>;
 private pending?:{resolve:(value:Execution)=>void;reject:(reason:Error)=>void;payload:any};
 private completed:TestResult[]=[];private started=0;private timeout=5000;
 constructor(private onStatus:(text:string,ready:boolean)=>void){}
 start(){
  this.worker?.terminate();this.ready=false;this.onStatus('Carregando Python local…',false);
  // Protocol 2 streams individual cases. Avoid reusing a v1 worker cached by an older app.
  this.worker=new Worker('/python-worker.js?protocol=2');
  this.bootTimer=setTimeout(()=>this.fail('O carregamento de Python excedeu 90 segundos. Tente reiniciar o runtime.'),90000);
  this.worker.onmessage=({data})=>{
   if(data.type==='status')this.onStatus(data.text,false);
   if(data.type==='ready'){clearTimeout(this.bootTimer);this.ready=true;this.onStatus('Python 3.12 · pronto',true);if(this.pending)this.dispatch()}
   if(data.type==='case')this.completed.push(data.data);
   if(data.type==='error')this.fail(data.error);
   if(data.type==='result'){clearTimeout(this.timer);const pending=this.pending;this.pending=undefined;this.completed=[];pending?.resolve(data.data);this.start()}
  };
  this.worker.onerror=e=>this.fail(e.message||'Falha ao carregar o runtime.');
 }
 execute(code:string,e:Exercise,grade:boolean,sample:number,timeout:number,tests?:TestCase[]){
  return this.request({code,tests:tests??(grade?e.tests:sample<0?[]:[e.examples[sample]]),restricted:(grade||!!tests)&&e.restrictions.length>0,newMatrix:(grade||!!tests)&&e.name==='mirror_matrix'},timeout);
 }
 traceReference(e:Exercise,input:string,timeout:number){return this.request({action:'trace',code:e.solution,input,tests:[]},timeout)}
 private request(payload:unknown,timeout:number){
  if(this.pending)return Promise.reject(new Error('Uma execução já está ativa.'));
  this.timeout=timeout;this.completed=[];this.started=0;
  return new Promise<Execution>((resolve,reject)=>{this.pending={resolve,reject,payload};if(!this.worker)this.start();if(this.ready)this.dispatch()});
 }
 private dispatch(){this.started=performance.now();this.onStatus('Executando Python…',true);this.timer=setTimeout(()=>this.cancel('Tempo excedido. O worker foi encerrado; seu código está salvo.','timeout'),this.timeout);this.worker?.postMessage({harness,payload:this.pending?.payload})}
 private interrupted(message:string,type:FailureKind):Execution{
  const results=[...this.completed];const tests:TestCase[]=this.pending?.payload.tests??[];
  const current=tests[results.length];
  if(current&&this.started)results.push({id:current.meta?.id,input:current.input,expected:current.output,actual:'',actualAvailable:false,passed:false,status:type==='timeout'?'timeout':'cancelled',errorType:type,error:message,stdout:'',stderr:'',metadata:current.meta});
  return {results,error:message,errorType:type,planned:tests.length,durationMs:this.started?performance.now()-this.started:0};
 }
 cancel(message='Execução interrompida. O worker foi reiniciado.',type:FailureKind='cancelled'){
  clearTimeout(this.timer);clearTimeout(this.bootTimer);const execution=this.interrupted(message,type);const pending=this.pending;this.pending=undefined;this.worker?.terminate();pending?.reject(new ExecutionFailure(message,execution));this.start();
 }
 private fail(message:string){clearTimeout(this.timer);clearTimeout(this.bootTimer);this.worker?.terminate();this.worker=undefined;this.ready=false;const execution=this.interrupted(message,'internal');const pending=this.pending;this.pending=undefined;pending?.reject(new ExecutionFailure(message,execution));this.onStatus(message,false)}
 destroy(){clearTimeout(this.timer);clearTimeout(this.bootTimer);this.worker?.terminate()}
}
