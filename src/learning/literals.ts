// Small literal parser, never eval(). It accepts the literal subset used by the audited subjects.
export function parseLiteral(text:string):unknown {
 let i=0;
 const whitespace=()=>{while(/\s/.test(text[i]??'')&&i<text.length)i++};
 const value=():unknown=>{
  whitespace();const char=text[i];
  if(char==='"'||char==="'"){
   const quote=char;i++;let result='';let closed=false;
   while(i<text.length){let c=text[i++];if(c===quote){closed=true;break}if(c==='\\'){const escaped=text[i++];const escapes:Record<string,string>={n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','\\':'\\','"':'"',"'":"'"};if(escaped==='u'){const hex=text.slice(i,i+4);if(!/^[\da-f]{4}$/i.test(hex))throw Error('Escape Unicode inválido.');c=String.fromCharCode(parseInt(hex,16));i+=4}else if(escaped==='x'){const hex=text.slice(i,i+2);if(!/^[\da-f]{2}$/i.test(hex))throw Error('Escape inválido.');c=String.fromCharCode(parseInt(hex,16));i+=2}else if(escaped in escapes)c=escapes[escaped];else throw Error('Escape de string não suportado.')}result+=c}
   if(!closed)throw Error('String sem fechamento.');return result;
  }
  if(char==='['||char==='('){const end=char==='['?']':')';i++;const result:unknown[]=[];whitespace();while(text[i]!==end){result.push(value());whitespace();if(text[i]===','){i++;whitespace();if(text[i]===end)break}else if(text[i]!==end)throw Error('Esperava vírgula ou fechamento.')}if(text[i++]!==end)throw Error('Lista sem fechamento.');return result}
  for(const [literal,result] of [['True',true],['False',false],['None',null]] as const)if(text.slice(i,i+literal.length)===literal){i+=literal.length;return result}
  const number=text.slice(i).match(/^-?\d+(?:\.\d+)?/);if(number){i+=number[0].length;return Number(number[0])}
  throw Error('Use apenas strings, números, booleanos e listas literais.');
 };
 const result=value();whitespace();if(i!==text.length)throw Error('Há conteúdo depois do valor literal.');return result;
}
export function parseCall(input:string):{name:string;args:unknown[]}{const match=input.match(/^([a-zA-Z_]\w*)\((.*)\)$/s);if(!match)throw Error('Chamada de função inválida.');return {name:match[1],args:parseLiteral(`[${match[2]}]`) as unknown[]}}
export const pythonRepr=(value:unknown):string=>value===true?'True':value===false?'False':value===null?'None':typeof value==='string'?JSON.stringify(value):Array.isArray(value)?`[${value.map(pythonRepr).join(', ')}]`:String(value);
export const makeCall=(name:string,args:unknown[])=>`${name}(${args.map(pythonRepr).join(', ')})`;

export function validateInteractive(name:string,args:unknown[]){
 const string=(x:unknown)=>typeof x==='string'&&x.length<=120;
 const int=(x:unknown)=>typeof x==='number'&&Number.isSafeInteger(x)&&Math.abs(x)<=1000000;
 const list=(x:unknown)=>Array.isArray(x)&&x.length<=40&&x.every(int);
 const shapes:Record<string,((x:unknown)=>boolean)[]>={bracket_validator:[string],cryptic_sorter:[x=>Array.isArray(x)&&x.length<=20&&x.every(string)],echo_validator:[string],mirror_matrix:[x=>Array.isArray(x)&&x.length<=12&&x.every(list)],hidenp:[string,string],inter:[string,string],number_base_converter:[string,int,int],pattern_tracker:[string],anagram:[string,string],shadow_merge:[list,list],string_permutation_checker:[string,string],string_sculptor:[string],twist_sequence:[list,int],whisper_cipher:[string,int]};
 const shape=shapes[name];if(!shape||args.length!==shape.length||!args.every((x,i)=>shape[i](x)))throw Error('Parâmetros incompatíveis. Use os tipos da assinatura e exemplos pequenos (texto até 120 caracteres, listas até 40 itens).');
 if(name==='shadow_merge'&&args.some(x=>(x as number[]).some((n,i,arr)=>i>0&&n<arr[i-1])))throw Error('As duas listas de shadow_merge precisam estar em ordem crescente.');
 if(name==='twist_sequence'&&(args[1] as number)<0)throw Error('Para esta demonstração, use k não negativo; o subject não define k negativo.');
 if(['echo_validator','string_sculptor','whisper_cipher','cryptic_sorter','anagram','pattern_tracker'].includes(name)&&args.some(x=>/[^\x00-\x7f]/.test(typeof x==='string'?x:JSON.stringify(x))))throw Error('Use caracteres ASCII nesta demonstração: o comportamento Unicode não foi confirmado no subject.');
}
