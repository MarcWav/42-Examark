import type {Attempt} from './types.ts';
const DB='42-exam-trainer-history';
let database:Promise<IDBDatabase>|undefined;
function open(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('attempts',{keyPath:'id'});store.createIndex('exerciseId','exerciseId');store.createIndex('examId','examId')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>{database=undefined;reject(request.error)}})}
function done(transaction:IDBTransaction){return new Promise<void>((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error)})}
export async function saveAttempt(attempt:Attempt){const db=await open();const tx=db.transaction('attempts','readwrite');const complete=done(tx);tx.objectStore('attempts').put(attempt);await complete}
export async function allAttempts():Promise<Attempt[]>{const db=await open();const tx=db.transaction('attempts','readonly');return new Promise((resolve,reject)=>{const req=tx.objectStore('attempts').getAll();req.onsuccess=()=>resolve((req.result as Attempt[]).sort((a,b)=>b.timestamp-a.timestamp));req.onerror=()=>reject(req.error)})}
export async function attemptsFor(filter:{exerciseId?:string;examId?:string}){return (await allAttempts()).filter(a=>(!filter.exerciseId||a.exerciseId===filter.exerciseId)&&(!filter.examId||a.examId===filter.examId))}
export async function replaceHistory(attempts:Attempt[]){const db=await open();const tx=db.transaction('attempts','readwrite');const complete=done(tx);const store=tx.objectStore('attempts');store.clear();for(const attempt of attempts)store.put(attempt);await complete}
export function isAttempt(value:unknown):value is Attempt{
 if(!value||typeof value!=='object')return false;const a=value as Attempt;
 const e=a.exercise;
 const names=['bracket_validator','cryptic_sorter','echo_validator','mirror_matrix','hidenp','inter','number_base_converter','pattern_tracker','anagram','shadow_merge','string_permutation_checker','string_sculptor','twist_sequence','whisper_cipher'];
 const strings=(x:unknown)=>Array.isArray(x)&&x.every(s=>typeof s==='string');
 const meta=(m:any)=>m===undefined||m&&['id','name','objective','explanation','diagnosis','concept','version','source'].every(key=>typeof m[key]==='string')&&['examples','additional','edge','restrictions'].includes(m.category)&&Array.isArray(m.parameters);
 const cases=(tests:unknown)=>Array.isArray(tests)&&tests.every(t=>t&&typeof t.input==='string'&&typeof t.output==='string'&&meta(t.meta));
 return typeof a.id==='string'&&Number.isFinite(a.timestamp)&&typeof a.exerciseId==='string'&&typeof a.code==='string'&&(a.kind==='grade'||a.kind==='replay')&&!!e&&e.id===a.exerciseId&&names.includes(e.name)&&['solution','signature','summary','strategy','file','version','source','status','original','divergence','alternative'].every(key=>typeof e[key as keyof typeof e]==='string')&&['rules','hints','mistakes','concepts','restrictions'].every(key=>strings(e[key as keyof typeof e]))&&Array.isArray(e.examples)&&e.examples.every(t=>typeof t.input==='string'&&typeof t.output==='string')&&Array.isArray(e.frames)&&cases(e.tests)&&(a.cases===undefined||cases(a.cases))&&!!a.execution&&Array.isArray(a.execution.results)&&a.execution.results.every(r=>typeof r.input==='string'&&typeof r.expected==='string'&&typeof r.actual==='string'&&typeof r.passed==='boolean'&&meta(r.metadata));
}
