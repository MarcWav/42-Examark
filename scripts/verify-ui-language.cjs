const path=require('node:path');
const forbidden=[
 'Você está construindo o próximo nível','Pratique sob pressão','Ganhe confiança',
 'Cada tentativa conta','Pequenos passos','Progresso real','Um nível de cada vez',
 'Uma boa hora para revisar','Seu próximo passo começa aqui','Sua jornada',
 'Um desafio, seis níveis','Travou? Tudo bem','Comece pela primeira dica ou visualize um exemplo',
 'Seu primeiro simulado começa quando você decidir','Cada erro é uma pista',
 'Seu espaço de prática','Seu espaço de estudo, no seu ritmo','Do seu jeito',
 'Um passo de cada vez','Seu próximo nível','Você consegue','Parabéns','Boa sorte'
];
const normalize=text=>String(text)
 .replace(/\\u(?:\{([0-9a-f]+)\}|([0-9a-f]{4}))/gi,(_,point,unit)=>String.fromCodePoint(parseInt(point||unit,16)))
 .normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function assertNoSlogans(text,label='interface'){
 const normalized=normalize(text);
 for(const phrase of forbidden)if(normalized.includes(normalize(phrase)))throw Error('Frase decorativa antiga encontrada em '+label+': '+phrase);
}
function assertPackagedUI(asar,archive){
 const files=asar.listPackage(archive).map(file=>file.replaceAll('\\','/'));
 let checked=0;
 for(const file of files){
  if(!/^\/dist\/(?!runtime\/|licenses\/).*\.(?:js|css|html|json)$/.test(file)&&!/^\/electron\/.*\.cjs$/.test(file)&&file!=='/package.json')continue;
  assertNoSlogans(asar.extractFile(archive,path.normalize(file.slice(1))).toString('utf8'),file);checked++;
 }
 if(!files.includes('/dist/index.html')||checked<5)throw Error('Inspeção da interface incompleta.');
 return {passed:true,checkedFiles:checked,forbiddenPhrases:forbidden.length};
}
module.exports={assertNoSlogans,assertPackagedUI};
