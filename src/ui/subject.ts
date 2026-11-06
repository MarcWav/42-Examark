import type {Exercise} from '../types.ts';
import {variants} from '../content/catalog.ts';
import {getExplanation} from '../content/explanations.ts';
import {esc,list} from './shared.ts';
export function renderSubject(e:Exercise,exam=false){
 const explanation=getExplanation(e);
 let indices=[0,1].filter(i=>i<e.examples.length);
 const opposite=e.examples.findIndex((x,i)=>i>0&&x.output!==e.examples[0]?.output);
 if(opposite>0&&e.examples[0]?.output.match(/^(True|False)$/))indices=[0,opposite];
 const card=(i:number)=>{const ex=e.examples[i];const test=e.tests.find(t=>t.input===ex.input&&t.output===ex.output);return '<article class="example-card"><div class="example-label">EXEMPLO '+(i+1)+'<button class="example-run" data-sample="'+i+'" aria-label="Executar exemplo '+(i+1)+'">Executar</button></div><div class="example-row"><span>Entrada</span><code>'+esc(ex.input)+'</code></div><div class="example-row"><span>Resultado</span><code>'+esc(ex.output)+'</code></div><p class="example-why">'+esc(test?.meta?.explanation??'Resultado previsto para esta entrada na versão selecionada.')+'</p></article>'};
 return '<section class="simple-explanation"><h2>Explicando de forma simples</h2>'+explanation.paragraphs.map(text=>'<p>'+esc(text)+'</p>').join('')+'</section>'+
 '<details class="original"><summary>Enunciado original (inglês)</summary>'+(e.status.startsWith('COMUNITÁRIO')?'<p>Esta fonte não disponibiliza um enunciado completo em inglês. O texto abaixo descreve o comportamento identificado na solução comunitária.</p>':'<p class="small muted">Texto preservado da fonte pública comunitária. Não é material autenticado oficialmente pela 42.</p>')+'<pre>'+esc(e.original)+'</pre></details>'+
 '<h3>Como a função deve começar</h3><pre class="signature">'+esc(e.signature)+'</pre><p class="signature-help">'+esc(explanation.parameters)+'</p>'+
 '<h3>Regras do exercício</h3>'+list(explanation.rules)+
 (e.restrictions.length?'<div class="restriction"><strong>Não pode usar</strong><ul><li><code>sorted()</code></li><li><code>.sort()</code></li></ul><p>Pode usar outras estruturas e funções, respeitando as demais regras do enunciado.</p></div>':'<p class="small muted">A fonte consultada não informa funções ou bibliotecas proibidas nesta versão.</p>')+
 '<p class="small muted">Retorne o resultado com return. Imprimir com print() não substitui o resultado da função.</p>'+
 '<h3>Exemplos</h3>'+indices.map(card).join('')+
 (e.examples.length>indices.length?'<details class="more-examples"><summary>Mostrar todos os exemplos ('+e.examples.length+')</summary>'+e.examples.map((_,i)=>i).filter(i=>!indices.includes(i)).map(card).join('')+'</details>':'')+
 (!exam?'<details class="common-errors"><summary>Erros comuns neste exercício</summary>'+list(e.mistakes)+'</details>':'')+
 renderSource(e,exam);
}
function renderSource(e:Exercise,exam:boolean){
 if(exam)return '<p class="source-compact small muted">Fonte comunitária, não oficial · '+esc(e.version)+'</p>';
 return '<details class="source-box source-compact"><summary>Fonte comunitária, não oficial · '+esc(e.version)+' · Ver detalhes</summary><label for="version">Versão do exercício</label><select id="version">'+variants.filter(v=>v.name===e.name).map(v=>'<option value="'+v.id+'" '+(v.id===e.id?'selected':'')+'>'+esc(v.version)+'</option>').join('')+'</select><p>'+esc(e.divergence)+'</p><a target="_blank" rel="noopener" href="'+esc(e.source)+'">Ver fonte pública</a><small>Arquivo: '+esc(e.file)+' · pasta oficial de entrega não confirmada.</small></details>';
}
