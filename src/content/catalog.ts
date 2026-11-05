import subjects from './subjects.json';
import extra from './additional-tests.json';
import oldSubjects from '../../docs/sources/secondary/examshell-selected.json';
import {solutions} from './solutions.ts';
import {lessons} from './lessons.ts';
import {enrichTests} from '../learning/test-metadata.ts';
import type {Exercise, TestCase} from '../types.ts';
export const SOURCE='https://rank03.42exam.net/js/data.js';
export const catalog:Exercise[]=subjects.map(s=>{
 const name=s.name.replace(/^py_/,'');
 return {...lessons[name],id:name,level:s.level,name,file:s.file,signature:s.signature,original:s.description.en,examples:s.examples,tests:[...s.examples,...(extra as Record<string,TestCase[]>)[name]],solution:solutions[name],version:'rank03 · 04/11/2026',source:SOURCE,status:'VERIFICADO · subject público não oficial',restrictions:name==='cryptic_sorter'?['sorted() e list.sort() proibidos']:[],divergence:name==='string_sculptor'?'examshell 0.1.12 reinicia a alternância após espaços; esta versão mantém a contagem global.':name==='cryptic_sorter'?'A solução de xornic usa a palavra original como último desempate; esta versão mantém a estabilidade.':name==='whisper_cipher'?'xornic usa whisper_checker.py, mas a função se chama whisper_cipher.':'O subject não confirma a pasta de entrega da prova. O nome do arquivo é o publicado nesta fonte.'};
});
// A shared name does not make a C Rank 02 subject interchangeable with a Python Rank 03 contract.
const pythonHidenp=catalog.find(e=>e.name==='hidenp')!;
pythonHidenp.rules.push('Este é o subject Python listado na fonte não oficial de Rank 03: recebe duas strings e retorna bool. O subject homônimo em C do Rank 02 é separado e não é avaliado aqui.');
pythonHidenp.divergence='hidenp · Python · Rank 03, conforme a fonte pública não oficial. Não corresponde ao subject de C do Rank 02. Não use argv nem imprima 0/1; esta assinatura retorna bool. A pasta oficial de entrega não foi confirmada.';
const sorter=catalog.find(e=>e.name==='cryptic_sorter')!;
const sculptor=catalog.find(e=>e.name==='string_sculptor')!;
export const variants:Exercise[]=[...catalog,{
 ...sorter,id:'cryptic_sorter_xornic',file:'cryptic_sorter.py',version:'xornic · desempate original',source:'https://github.com/xornic1229/EXAM-RANK-3/blob/a3b1222461b0e9cd9c86390ac97136dfc670b7f8/ex1/cryptic_sorter.py',status:'COMUNITÁRIO · comportamento da solução',restrictions:[],rules:['Comprimento, texto em minúsculas, vogais e texto original como último desempate.','Esta solução comunitária usa sorted(); não corresponde à restrição da versão padrão.'],original:'Versão inferida diretamente da solução comunitária de xornic: chave (len(word), word.lower(), vowelcount, word). Não existe subject completo nesta fonte.',examples:[{input:'cryptic_sorter(["aaa","bbb","AAA","BBB"])',output:'["AAA","aaa","BBB","bbb"]'}],tests:[{input:'cryptic_sorter(["aaa","bbb","AAA","BBB"])',output:'["AAA","aaa","BBB","bbb"]',local:true},...extra.cryptic_sorter_xornic.slice(1)],solution:sorter.solution.replace('vowels)  #','vowels, word)  #'),frames:[{title:'Desempate comunitário',cells:['AAA','aaa','BBB','bbb'],active:[0,2],detail:'Na chave final, ASCII diferencia caixa. Compare com aaa, AAA, bbb, BBB na versão estável.'}],hints:['Compare com a versão estável: qual é o último critério?','A chave possui quatro componentes nesta variante.','Use (tamanho, texto em minúsculas, vogais, texto original) para posicionar cada palavra.'],strategy:'A mesma inserção manual, com o texto original como quarto critério.',mistakes:['Usar estabilidade quando o desempate final é o texto original.']
},{
 ...sculptor,id:'string_sculptor_examshell',version:'examshell · 0.1.12',source:'https://pypi.org/project/examshell-python/0.1.12/',original:oldSubjects.find(e=>e.name==='py_string_sculptor')!.description.en,examples:oldSubjects.find(e=>e.name==='py_string_sculptor')!.examples,tests:[...oldSubjects.find(e=>e.name==='py_string_sculptor')!.examples,...extra.string_sculptor_examshell],rules:['Alterne a caixa apenas das letras.','Espaço ASCII reinicia o contador; a próxima letra será minúscula.'],solution:sculptor.solution.replace('Conta somente letras, mesmo através de espaços.','Conta letras desde o último espaço ASCII.').replace('else:\n            result += char','else:\n            if char == \' \':\n                index = 0  # Espaços reiniciam a contagem nesta versão.\n            result += char'),frames:[{title:'Reinício no espaço',cells:['hElLo','␣','wOrLd'],active:[1,2],detail:'O espaço reinicia o contador. Hello World → hElLo wOrLd.'}],hints:['Observe a regra adicional sobre espaços.','Mantenha o contador de letras e reinicie quando encontrar espaço.','Ao ler uma letra, alterne a caixa. Ao ler espaço, zere o contador. Copie os demais símbolos.'],strategy:'Um contador exclusivo de letras, reiniciado em cada espaço ASCII.',mistakes:['Continuar a alternância através do espaço enquanto pratica examshell.']
}];
export const getExercise=(id:string)=>variants.find(e=>e.id===id)??catalog[0];
for(const exercise of variants)exercise.tests=enrichTests(exercise);
export const starter=(e:Exercise)=>`${e.signature}\n    pass\n`;
