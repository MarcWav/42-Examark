import type {Progress,RecordData} from './types.ts';
import {isAttempt} from './history.ts';
export const KEY='42-exam-trainer-v1';
export const emptyRecord=(code:string):RecordData=>({code,passed:false,understood:false,comprehension:'none',attempts:0,best:0,total:0,hints:0,notes:'',seconds:0,errors:0,solutionViewed:false});
export const initial=():Progress=>({schema:1,records:{},exams:[],selected:'bracket_validator',settings:{fontSize:14,timeout:5000,duration:180,reroll:false}});
export function validate(value:unknown):value is Progress{
 if(!value||typeof value!=='object')return false;const p=value as Progress;
 const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 const exam=(e:any)=>e&&typeof e.id==='string'&&finite(e.start)&&finite(e.duration)&&Array.isArray(e.sequence)&&e.sequence.length===6&&e.sequence.every((s:unknown)=>typeof s==='string')&&Number.isInteger(e.index)&&e.index>=0&&e.index<=6&&e.codes&&typeof e.codes==='object'&&Object.values(e.codes).every(s=>typeof s==='string')&&finite(e.attempts);
 return p.schema===1&&typeof p.selected==='string'&&!!p.records&&typeof p.records==='object'&&!Array.isArray(p.records)&&Object.values(p.records).every(r=>r&&typeof r.code==='string'&&typeof r.notes==='string'&&typeof r.passed==='boolean'&&typeof r.understood==='boolean'&&(r.comprehension===undefined||['none','partial','understood'].includes(r.comprehension))&&['attempts','best','total','hints','seconds','errors'].every(k=>finite(r[k as keyof RecordData])))&&Array.isArray(p.exams)&&p.exams.every(exam)&&(!p.activeExam||exam(p.activeExam))&&!!p.settings&&finite(p.settings.fontSize)&&p.settings.fontSize>=11&&p.settings.fontSize<=24&&finite(p.settings.timeout)&&p.settings.timeout>=1000&&p.settings.timeout<=15000&&finite(p.settings.duration)&&p.settings.duration>=1&&p.settings.duration<=360&&typeof p.settings.reroll==='boolean'&&(p.history===undefined||Array.isArray(p.history)&&p.history.every(isAttempt));
}
export const migrate=(p:Progress):Progress=>{for(const record of Object.values(p.records)){record.comprehension??=record.understood?'understood':'none';record.understood=record.comprehension==='understood'}return p};
export const load=():Progress=>{try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return validate(p)?migrate(p):initial()}catch{return initial()}};
export const persist=(p:Progress)=>{localStorage.setItem(KEY,JSON.stringify(p))};
export const exportProgress=(p:Progress)=>JSON.stringify(p,null,2);
export const importProgress=(text:string)=>{const p:unknown=JSON.parse(text);if(!validate(p))throw new Error('Arquivo inválido ou versão de progresso incompatível.');return migrate(p)};
