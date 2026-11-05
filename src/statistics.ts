import type {Exercise, Progress} from './types.ts';
export function studyStatistics(progress:Progress,catalog:Exercise[]){
 const records=catalog.map(e=>({exercise:e,record:progress.records[e.id]}));
 return {
  completed:records.filter(x=>x.record?.passed).length,
  understood:records.filter(x=>x.record?.understood).length,
  attempts:Object.values(progress.records).reduce((n,r)=>n+r.attempts,0),
  seconds:Object.values(progress.records).reduce((n,r)=>n+r.seconds,0),
  levels:Array.from({length:6},(_,i)=>{const pool=records.filter(x=>x.exercise.level===i+1);return {level:i+1,total:pool.length,passed:pool.filter(x=>x.record?.passed).length}}),
  review:records.filter(x=>!x.record?.understood||(x.record?.errors??0)>0).sort((a,b)=>(b.record?.errors??0)-(a.record?.errors??0)).slice(0,5).map(x=>x.exercise.id)
 };
}
