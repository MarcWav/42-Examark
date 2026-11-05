import fs from 'node:fs';
// Oracles in JavaScript use different algorithms from the instructional Python.
let seed=4203; const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
const word=(alphabet='abAB 123!?',n=rand(14))=>Array.from({length:n},()=>alphabet[rand(alphabet.length)]).join('');
const list=()=>Array.from({length:rand(15)},()=>rand(31)-15);
const lex=(a,b)=>a<b?-1:a>b?1:0;
const keySort=(xs,original=false)=>xs.map((w,i)=>({w,i})).sort((a,b)=>a.w.length-b.w.length||lex(a.w.toLowerCase(),b.w.toLowerCase())||(original?lex(a.w,b.w):a.i-b.i)).map(x=>x.w);
const alpha=c=>/[a-z]/i.test(c);
const freq=s=>JSON.stringify([...new Set(s)].sort().map(c=>[c,s.split(c).length-1]));
const oracles={
bracket_validator:s=>{let prev;do{prev=s;s=s.replace(/[^()[\]{}]/g,'').replace(/\(\)|\[\]|\{\}/g,'')}while(s!==prev);return s===''},
cryptic_sorter:xs=>keySort(xs),
echo_validator:s=>{s=s.replace(/[^a-z]/gi,'').toLowerCase();return s.length>0&&s===s.split('').reverse().join('')},
mirror_matrix:m=>m.map(row=>row.slice().reverse()),
hidenp:(s,b)=>{let start=0;for(const c of s){const found=b.indexOf(c,start);if(found<0)return false;start=found+1}return true},
inter:(a,b)=>[...new Set(a)].filter(c=>b.includes(c)).join(''),
number_base_converter:(s,a,b)=>{if(a<2||a>36||b<2||b>36||!s||[...s].some(c=>!'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0,a).includes(c)))return 'ERROR';return parseInt(s,a).toString(b).toUpperCase()},
pattern_tracker:s=>Array.from(s).slice(1).reduce((n,c,i)=>n+Number('012345678'.includes(s[i])&&'123456789'.includes(c)&&Number(c)-Number(s[i])===1),0),
anagram:(a,b)=>freq(a.toLowerCase().replace(/ /g,''))===freq(b.toLowerCase().replace(/ /g,'')),
shadow_merge:(a,b)=>[...a,...b].sort((a,b)=>a-b),
string_permutation_checker:(a,b)=>freq(a)===freq(b),
string_sculptor:s=>{let i=0;return [...s].map(c=>alpha(c)?(i++%2?c.toUpperCase():c.toLowerCase()):c).join('')},
twist_sequence:(a,k)=>{const out=a.slice();if(!out.length)return out;for(let i=0;i<k%a.length;i++)out.unshift(out.pop());return out},
whisper_cipher:(s,k)=>s.replace(/[a-z]/gi,c=>{const alphabet=c===c.toLowerCase()?'abcdefghijklmnopqrstuvwxyz':'ABCDEFGHIJKLMNOPQRSTUVWXYZ';return alphabet[((alphabet.indexOf(c)+k)%26+26)%26]})
};
const inputs={
bracket_validator:[[''],['a'],['([)]'],[')('],['(()'],['[{}]'],['{a[b(c)d]e}']],
cryptic_sorter:[[[]],[['aaa','AAA','bbb','BBB']],[['a','A','a','A']],[['!','a','1','B']]],
echo_validator:[[''],['a'],['A!b,a'],['ab'],['Aa'],['abccba']],
mirror_matrix:[[[]],[[[]]],[[[1,2,3],[4,5,6]]],[[[-2,-1,0],[0,-1,-2]]]],
hidenp:[['',''],['','a'],['a',''],['A','a'],['aa','a'],['abc','acb'],['a a','a-- a']],
inter:[['',''],['ab','ba'],['aaa','aa'],['A a','a A'],['!?!!','?!']],
number_base_converter:[['0',2,36],['000',10,2],['G',16,10],['2',2,10],['1',37,2],['1',2,1],['Z',36,2]],
pattern_tracker:[[''],['123'],['90'],['12a23'],['112233'],['1 2'],['0123456789']],
anagram:[['',''],['aa','a'],['Dormitory','Dirty Room'],['a A','aa'],['abc','abC']],
shadow_merge:[[[],[]],[[1,1],[1,1]],[[-4,-1],[-5,0]],[[],[1,2]]],
string_permutation_checker:[['',''],['Aa','aa'],['a ','a'],['a!','!a'],['aa','a']],
string_sculptor:[[''],['hello world'],['abc123def'],['AB C D'],[' !A?B9C D']],
twist_sequence:[[[],0],[[],100],[[1],999],[[1,2,3],0],[[1,2,3],3],[[1,2,3],100]],
whisper_cipher:[['',1],['ZzAa!?',1],['Aa',-1],['Hello!',52],['xyz',-55]]
};
for(let i=0;i<48;i++){
 const s=word();const t=i%3===0?[...s].reverse().join(''):word();
 inputs.bracket_validator.push([word('()[]{}ab')]);
 inputs.cryptic_sorter.push([Array.from({length:rand(12)},()=>word('abAB!?12',rand(5)))]);
 // Exercise ambiguous no-letter inputs only when the actual source gives a clear example.
 inputs.echo_validator.push([i%3===0?word('abAB')+'x'+word('abAB'):s+'a']);
 inputs.mirror_matrix.push([Array.from({length:rand(5)+1},()=>list())]);
 inputs.hidenp.push([i%3===0?s.slice(0,3):t,s]);
 inputs.inter.push([s,t]);
 const a=rand(35)+2,b=rand(35)+2; inputs.number_base_converter.push([(rand(999999)).toString(a).toUpperCase(),a,b]);
 inputs.pattern_tracker.push([word('00112233445566778899xyz',rand(40))]);
 const anagramText=word('abAB ');inputs.anagram.push([anagramText,i%3===0?[...anagramText].reverse().join(''):word('abAB ')]);inputs.string_permutation_checker.push([s,t]);
 inputs.shadow_merge.push([list().sort((a,b)=>a-b),list().sort((a,b)=>a-b)]);
 inputs.string_sculptor.push([s]);inputs.twist_sequence.push([list(),rand(200)]);
 inputs.whisper_cipher.push([word('azAZbyBY019!? '),rand(401)-200]);
}
const py=x=>x===true?'True':x===false?'False':JSON.stringify(x);
const output={};for(const [id,cases] of Object.entries(inputs))output[id]=cases.map(args=>({input:`${id}(${args.map(py).join(', ')})`,output:py(oracles[id](...args)),hidden:true}));
output.cryptic_sorter_xornic=inputs.cryptic_sorter.map(args=>({input:`cryptic_sorter(${py(args[0])})`,output:py(keySort(args[0],true)),hidden:true}));
output.string_sculptor_examshell=inputs.string_sculptor.map(([s])=>({input:`string_sculptor(${py(s)})`,output:py(s.split(' ').map(oracles.string_sculptor).join(' ')),hidden:true}));
fs.writeFileSync('src/content/additional-tests.json',JSON.stringify(output,null,2));
console.log(`${Object.values(output).flat().length} additional test cases generated.`);
