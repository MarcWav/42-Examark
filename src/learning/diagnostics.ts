import type {Execution,Exercise,TestCase,TestResult,FailureKind} from '../types.ts';
export const failureNames:Record<FailureKind,string>={syntax:'Erro de sintaxe',runtime:'Erro durante a execução',value:'Resultado incorreto',type:'Tipo de resultado diferente',timeout:'Tempo limite excedido',cancelled:'Execução interrompida',restriction:'Regra do exercício não atendida',internal:'Falha interna do avaliador',side_effect:'Sua função imprimiu algo que não deveria',mutation:'Você modificou ou reutilizou os dados recebidos'};
const typeDescription=(type?:string):string=>({bool:'True ou False',int:'um número inteiro',float:'um número com casas decimais',str:'um texto',list:'uma lista',dict:'um dicionário',NoneType:'nenhum resultado (None)'}[type??'']??type??'um tipo não registrado');
export function explainResult(result:TestResult,test:TestCase){
 if(result.passed)return {title:'Comportamento confirmado',message:test.meta?.explanation??'O retorno observado coincide com o valor e o tipo exigidos.',concept:test.meta?.concept??'Retorno'};
 const kind=result.errorType;
 if(kind==='type')return {title:failureNames.type,message:`Era esperado ${typeDescription(result.expectedType)}, mas sua função retornou ${typeDescription(result.actualType)}.`,concept:'Retorno e tipos Python'};
 if(kind==='runtime')return {title:failureNames.runtime,message:'O código encontrou um erro antes de retornar um resultado. Não há um valor obtido para comparar. Abra os detalhes técnicos para ver o tipo do erro e a linha indicada.',concept:test.meta?.concept??'Índices e condições'};
 if(kind==='timeout'||kind==='cancelled'||kind==='internal')return {title:failureNames[kind],message:'A execução não foi concluída, por isso não há resultado disponível para este teste. Os testes restantes não foram executados.',concept:'Limites e condições de parada'};
 if(kind==='mutation')return {title:failureNames.mutation,message:'A função precisa devolver uma nova matriz sem modificar a recebida. Mesmo com números corretos, devolver a mesma lista externa não atende à regra.',concept:'Listas e cópias'};
 if(kind==='side_effect')return {title:failureNames.side_effect,message:'A função escreveu no console. Estes testes locais esperam apenas o resultado devolvido com return. Abra o teste para consultar o texto impresso.',concept:'Retorno e print'};
 return {title:failureNames.value,message:`${test.meta?.diagnosis??'O valor observado não coincide com o esperado.'} ${result.difference?.reason??''}`,concept:test.meta?.concept??'Comparação'};
}
export function testsForResults(e:Exercise,execution:Execution,fullSuite:boolean){
 const selected=fullSuite?e.tests:execution.results.map(result=>e.tests.find(t=>t.meta?.id===result.id)??e.tests.find(t=>t.input===result.input)??{input:result.input,output:result.expected,meta:result.metadata});
 return selected.map((test,i)=>({test,result:execution.results.find(r=>test.meta?.id&&r.id===test.meta.id)??(!execution.results.some(r=>r.id)?execution.results.find(r=>r.input===test.input):undefined),index:i}));
}
export function canInspectTests(mode:'study'|'exam'|'review',activeExam:boolean){return mode!=='exam'&&!activeExam}
