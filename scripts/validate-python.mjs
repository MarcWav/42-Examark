import './export-catalog.mjs';
import {Worker} from 'node:worker_threads';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {variants,catalog}=JSON.parse(fs.readFileSync('.cache/catalog.json','utf8'));
let worker;
async function start(){worker=new Worker(new URL('../tests/python-node-worker.mjs',import.meta.url));const [init]=await once(worker,'message');console.log('Pyodide:',init.version);return worker}
await start();
const call=async(code,e,tests=e.tests)=>{const pending=once(worker,'message');worker.postMessage({code,tests,restricted:e.restrictions.length>0,newMatrix:e.name==='mirror_matrix'});const [message]=await pending;if(message.error)throw Error(message.error);return message.data};
const mutants={
 bracket_validator:'return s.count("(") == s.count(")") and s.count("[") == s.count("]") and s.count("{") == s.count("}")',
 cryptic_sorter:'return strings',echo_validator:'return text == text[::-1]',mirror_matrix:'return matrix[::-1]',
 hidenp:'return small in big',inter:'return "".join(c for c in s1 if c in s2)',
 number_base_converter:'return str(int(number, from_base))',pattern_tracker:'return sum(1 for i in range(0,len(text)-1,2) if text[i:i+2] in ["01","12","23","34","45","56","67","78","89"])',
 anagram:'return s1 == s2',shadow_merge:'return list(set(list1 + list2))',
 string_permutation_checker:'return set(s1) == set(s2)',string_sculptor:'return "".join(c.lower() if i%2 == 0 else c.upper() for i,c in enumerate(text))',
 twist_sequence:'return arr[k:] + arr[:k]',whisper_cipher:'return text'
};
const report={runtime:'Pyodide 0.27.7 / CPython 3.12 WASM',reference:[],mutations:[],checks:[]};
try{
 for(const e of variants){
  const result=await call(e.solution,e);const failures=result.results.filter(r=>!r.passed);
  assert(!result.error&&!result.restriction&&failures.length===0,`${e.id}: ${JSON.stringify(result.error||result.restriction||failures.slice(0,3))}`);
  console.log(`PASS ${e.id}: ${result.results.length}/${e.tests.length}`);report.reference.push({id:e.id,passed:result.results.length,total:e.tests.length});
  const wrong=await call(`${e.signature}\n    ${mutants[e.name]}\n`,e);
  assert(wrong.results.some(r=>!r.passed)||wrong.error||wrong.restriction,`${e.id}: mutant survived`);report.mutations.push({id:e.id,rejected:true});
  // A deliberately hard-coded lookup memorizes every public example, but not unseen inputs.
  if(e.examples.length){const clauses=e.examples.map(x=>{
    const argsLiteral='('+x.input.slice(x.input.indexOf('(')+1,-1)+',)';
    return `    if args == __import__('ast').literal_eval(${JSON.stringify(argsLiteral)}):\n        return ${x.output}`;
   }).join('\n');
   const memorizer=`def ${e.name}(*args):\n${clauses}\n    return None\n`;
   const memorized=await call(memorizer,e);assert(memorized.results.filter(r=>!r.hidden).every(r=>r.passed)&&!memorized.error,'Memorizer must pass public examples '+e.id+JSON.stringify(memorized.error));assert(memorized.results.some(r=>r.hidden&&!r.passed),'Memorizer survived '+e.id);report.checks.push('Memorized public examples rejected: '+e.id);
  }
 }
 const bracket=catalog[0];
 let r=await call(`${bracket.signature}\n    return 1\n`,bracket,[{input:'bracket_validator("()")',output:'True'}]);assert(!r.results[0].passed);report.checks.push('bool != int');
 r=await call(`${bracket.signature}\n    print(True)\n`,bracket,[{input:'bracket_validator("()")',output:'True'}]);assert(!r.results[0].passed&&r.results[0].stdout==='True\n');report.checks.push('stdout is not return');
 r=await call(`${bracket.signature}\n    raise ValueError("teste")\n`,bracket);assert(r.results[0].error.includes('ValueError'));report.checks.push('exceptions captured');
 r=await call('import sys\nprint("saída")\nprint("aviso",file=sys.stderr)',bracket,[]);assert(r.stdout==='saída\n'&&r.stderr==='aviso\n');report.checks.push('stdout and stderr captured');
 r=await call('global_counter = 0\ndef bracket_validator(s: str) -> bool:\n    global global_counter\n    global_counter += 1\n    return global_counter == 1',bracket,[{input:'bracket_validator("()")',output:'True'},{input:'bracket_validator("[]")',output:'True'}]);assert(r.results.every(x=>x.passed));report.checks.push('fresh namespace per test');
 r=await call('def cryptic_sorter(strings: list[str]) -> list[str]:\n    alias = sorted\n    return alias(strings)',catalog[1]);assert(r.restriction);report.checks.push('forbidden aliases rejected');
 // Native worker termination runs the same WASM interpreter without freezing its owner.
 const hung=once(worker,'message');worker.postMessage({code:'while True:\n    pass',tests:[],restricted:false});
 const outcome=await Promise.race([hung.then(()=>false),new Promise(resolve=>setTimeout(()=>resolve(true),250))]);assert(outcome);await worker.terminate();report.checks.push('infinite loop terminated by worker owner');
 await start();r=await call(bracket.solution,bracket);assert(r.results.every(x=>x.passed));report.checks.push('worker recovery after infinite loop');
 fs.writeFileSync('docs/python-validation.json',JSON.stringify(report,null,2));
 console.log(`SUCCESS: ${report.reference.reduce((n,x)=>n+x.total,0)} reference cases, ${report.mutations.length} algorithm mutants + ${variants.length} memorizers rejected; ${report.checks.length} checks.`);
}finally{await worker.terminate()}
