import type {Execution,Exercise,TestCase,TestResult,FailureKind} from '../types.ts';
export const failureNames:Record<FailureKind,string>={syntax:'Erro de sintaxe',runtime:'Erro durante a execução',value:'Retorno incorreto',type:'Tipo de retorno incorreto',timeout:'Tempo limite excedido',cancelled:'Execução interrompida',restriction:'Violação de restrição',internal:'Falha interna do avaliador',side_effect:'Saída extra no console',mutation:'Alteração ou reutilização da entrada'};
export function explainResult(result:TestResult,test:TestCase){
 if(result.passed)return {title:'Comportamento confirmado',message:test.meta?.explanation??'O retorno observado coincide com o valor e o tipo exigidos.',concept:test.meta?.concept??'Retorno'};
 const kind=result.errorType;
 if(kind==='type')return {title:failureNames.type,message:`Era necessário retornar ${result.expectedType}; a função devolveu ${result.actualType}. O corretor preserva a diferença entre tipos: imprimir ou converter para outro tipo não substitui o retorno pedido.`,concept:'Retorno e tipos Python'};
 if(kind==='runtime')return {title:failureNames.runtime,message:'A execução lançou uma exceção antes de produzir um retorno. Leia o traceback e a linha indicada. Não há um valor obtido para comparar.',concept:test.meta?.concept??'Índices e condições'};
 if(kind==='timeout'||kind==='cancelled'||kind==='internal')return {title:failureNames[kind],message:'A execução não foi concluída. Nenhum valor de retorno foi inventado. As entradas restantes estão marcadas como não executadas.',concept:'Limites e condições de parada'};
 if(kind==='mutation')return {title:failureNames.mutation,message:'O retorno precisa ser uma nova matriz e a entrada deve permanecer preservada. Uma saída com valores iguais pode falhar nesse contrato se reutilizar a matriz externa ou modificar a entrada.',concept:'Listas e cópias'};
 if(kind==='side_effect')return {title:failureNames.side_effect,message:'O valor retornado pode até coincidir, mas houve stdout ou stderr adicional. Nesta correção local estrita, os subjects de função não devem produzir saída extra. Veja os fluxos capturados.',concept:'Retorno e print'};
 return {title:failureNames.value,message:`${test.meta?.diagnosis??'O valor observado não coincide com o esperado.'} ${result.difference?.reason??''} A saída, sozinha, não permite afirmar exatamente qual linha do seu código causou a falha.`,concept:test.meta?.concept??'Comparação'};
}
export function testsForResults(e:Exercise,execution:Execution,fullSuite:boolean){
 const selected=fullSuite?e.tests:execution.results.map(result=>e.tests.find(t=>t.meta?.id===result.id)??e.tests.find(t=>t.input===result.input)??{input:result.input,output:result.expected,meta:result.metadata});
 return selected.map((test,i)=>({test,result:execution.results.find(r=>test.meta?.id&&r.id===test.meta.id)??(!execution.results.some(r=>r.id)?execution.results.find(r=>r.input===test.input):undefined),index:i}));
}
export function canInspectTests(mode:'study'|'exam'|'review',activeExam:boolean){return mode!=='exam'&&!activeExam}
