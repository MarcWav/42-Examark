import type {Exam,Exercise} from './types.ts';
export function createExam(catalog:Exercise[],duration:number,reroll:boolean,random= Math.random):Exam{
 const sequence=Array.from({length:6},(_,i)=>{const pool=catalog.filter(e=>e.level===i+1);return pool[Math.floor(random()*pool.length)].id});
 return {id:crypto.randomUUID(),start:Date.now(),duration:duration*60000,sequence,index:0,codes:{},attempts:0,reroll};
}
export const remaining=(exam:Exam,now=Date.now())=>Math.max(0,exam.duration-(now-exam.start));
export const finishExam=(exam:Exam,reason:string):Exam=>({...exam,ended:Date.now(),reason});
