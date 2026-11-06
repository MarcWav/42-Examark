import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './style.css';
import './ui/learning.css';
import './ui/compact.css';
import {EditorView, keymap} from '@codemirror/view';
import {EditorState,Prec} from '@codemirror/state';
import {basicSetup} from 'codemirror';
import {python} from '@codemirror/lang-python';
import {oneDark} from '@codemirror/theme-one-dark';
import {indentWithTab} from '@codemirror/commands';
import {catalog,getExercise,starter,variants} from './content/catalog.ts';
import {emptyRecord,load,persist,exportProgress,importProgress} from './storage.ts';
import {createExam,remaining,finishExam} from './exam.ts';
import {PythonRunner,ExecutionFailure} from './runner.ts';
import {studyStatistics} from './statistics.ts';
import type {Exercise,Execution,RecordData,TestCase,Attempt} from './types.ts';
import {getEducation} from './content/education.ts';
import {renderHints,renderAnswerKey} from './ui/education.ts';
import {getSolution} from './content/answer-key.ts';
import {renderSubject} from './ui/subject.ts';
import {renderProgress,renderExamLanding} from './ui/overview.ts';
import {renderVisualization,initialVisual} from './ui/visualization.ts';
import {renderResults,renderTestExplanation,renderAttemptList} from './ui/results.ts';
import {parseCall,makeCall,validateInteractive} from './learning/literals.ts';
import {saveAttempt,allAttempts,replaceHistory} from './history.ts';

const paths:Record<string,string>={code:'m16 18 6-6-6-6M8 6l-6 6 6 6',book:'M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4zM20 3h-4a3 3 0 0 0-3 3v15a4 4 0 0 1 4-2h3z',chart:'M4 19V5m0 14h16M9 15v-4m5 4V7m5 8v-6',clock:'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',settings:'m9 3-1 3-3 1-2 3 2 2v3l2 3h3l2 3 3-2 3-1 1-3-1-3 1-3-3-2-3 1zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',check:'m5 12 4 4L19 6',chevron:'m9 5 7 7-7 7',play:'m8 4 12 8-12 8z',reset:'M3 11a9 9 0 1 1 2 7M3 4v7h7',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',terminal:'m4 5 6 6-6 6m9 1h7',bulb:'M9 18h6m-6 3h6M8 15a7 7 0 1 1 8 0l-1 3H9z',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',note:'M5 3h10l4 4v14H5zM9 12h6m-6 4h6',download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',x:'m6 6 12 12M6 18 18 6',arrow:'M4 12h16m-6-6 6 6-6 6',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z',spark:'m12 3 2 6 6 3-6 2-2 7-2-7-6-2 6-3z'};
const icon=(name:string)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.code}"/></svg>`;
const esc=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let data=load();let mode:'study'|'exam'|'stats'|'review'=data.activeExam?'exam':'study';
let selected=data.selected;let tab='subject';let editor:EditorView|undefined;let busy=false;let output:Execution|undefined;let gradeOutput=false;let runtime='Carregando Python…';let runtimeReady=false;let sample=0;let frame=0;let search='';let level='all';let expanded=false;let revealed=new Set<string>();let saveFailed=false;
let solutionChoice='simple';let solutionLine=0;let hintOpen=0;let visual=initialVisual(getExercise(selected));let visualTimer:ReturnType<typeof setInterval>|undefined;
let resultsExpanded=false;let outputContext:Exercise|undefined;let onlyFailures=false;let reviewAttempt:Attempt|undefined;let reviewReturn:'study'|'stats'='study';
const historyMemory=new Map<string,Attempt>();
function save(){try{persist(data);$('#saved')?.classList.remove('warning')}catch{if(!saveFailed)toast('Não foi possível salvar. Exporte seu progresso para não perder alterações.');saveFailed=true;$('#saved')?.classList.add('warning')}}
const active=()=>mode==='review'&&reviewAttempt?reviewAttempt.exercise:mode==='exam'&&data.activeExam?getExercise(data.activeExam.sequence[Math.min(data.activeExam.index,5)]):getExercise(selected);
const rec=(e=active()):RecordData=>data.records[e.id]??(data.records[e.id]=emptyRecord(starter(e)));
function currentCode(e=active()){return mode==='review'&&reviewAttempt?reviewAttempt.code:mode==='exam'&&data.activeExam?(data.activeExam.codes[e.id]??starter(e)):rec(e).code}
function changeCode(code:string){if(mode==='review')return;const e=active();if(mode==='exam'&&data.activeExam)data.activeExam.codes[e.id]=code;else rec(e).code=code;save()}
const completed=()=>catalog.filter(e=>rec(e).passed).length;
const fmt=(seconds:number)=>`${Math.floor(seconds/3600)}h ${Math.floor(seconds%3600/60)}min`;
const clockText=(ms:number)=>{const t=Math.ceil(ms/1000);return `${String(Math.floor(t/3600)).padStart(2,'0')}:${String(Math.floor(t%3600/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`};
function toast(message:string){const item=document.createElement('div');item.className='toast';item.setAttribute('role','status');item.textContent=message;document.body.append(item);setTimeout(()=>item.remove(),4500)}
const runner=new PythonRunner((text,ready)=>{runtime=text;runtimeReady=ready;updateRuntime()});
function updateRuntime(){const el=$('#runtime');if(el){el.innerHTML=`<span class="status-dot ${runtimeReady?'on':''}"></span>${esc(runtime)}`;el.title=runtime}}
function sidebar(){return `<aside class="sidebar"><a class="brand" href="#" data-home><span class="logo">42<span>_</span></span><span>Examark</span></a><nav class="main-nav"><button data-mode="study" class="${mode==='study'?'active':''}">${icon('book')}Aprendizado <span class="key">14</span></button><button data-mode="exam" class="${mode==='exam'?'active':''}">${icon('clock')}Simulado</button><button data-mode="stats" class="${mode==='stats'?'active':''}">${icon('chart')}Progresso</button></nav><div class="catalog-heading">PYTHON · RANK 03 <span>14</span></div><div class="search">${icon('search')}<input id="search" aria-label="Pesquisar exercício" placeholder="Buscar exercício…" value="${esc(search)}"><kbd>/</kbd></div><select id="level" aria-label="Filtrar dificuldade"><option value="all">Todos os níveis</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${level===String(n)?'selected':''}>Nível ${n} · ${n<3?'Fácil':n<5?'Intermediário':'Avançado'}</option>`).join('')}</select><div id="exercise-list" class="exercise-list">${exerciseList()}</div><div class="sidebar-bottom"><div class="progress-label"><span>Progresso</span><strong>${completed()} <span>/ 14</span></strong></div><div class="progress-track"><div style="width:${completed()/14*100}%"></div></div><button class="subtle" id="settings">${icon('settings')}Configurações</button></div></aside>`}
function exerciseList(){return [1,2,3,4,5,6].map(n=>{const list=catalog.filter(e=>e.level===n&&(level==='all'||+level===n)&&e.name.includes(search.toLowerCase()));return list.length?`<div class="level-title">NÍVEL ${n}<span>${n<3?'Básico':n<5?'Intermediário':'Avançado'}</span></div>${list.map(e=>`<button class="exercise ${active().name===e.name&&mode!=='stats'?'selected':''}" data-exercise="${e.id}" ${mode==='exam'?'disabled':''}><span class="exercise-state ${rec(e).passed?'done':''}">${rec(e).passed?icon('check'):'<span></span>'}</span><span>${e.name}</span>${active().name===e.name&&mode!=='stats'?icon('chevron'):''}</button>`).join('')}`:''}).join('')||'<p class="empty">Nenhum exercício encontrado.</p>'}
function header(){const e=active();const trail=mode==='stats'?'Python · Exam Rank 03':mode==='exam'&&!data.activeExam?'Simulado':(mode==='exam'?'Simulado':mode==='review'?'Revisão':'Aprendizado')+'<span>/</span><strong>'+esc(e.name)+'</strong>';return '<header class="topbar"><div class="breadcrumb">'+trail+'</div><div class="topbar-right"><span class="general-progress">'+icon('chart')+' '+Math.round(completed()/14*100)+'% concluído</span><span class="top-divider"></span><button id="export-quick" '+(data.activeExam?'disabled':'')+' class="icon-button" aria-label="Exportar progresso" title="Exportar progresso">'+icon('download')+'</button><button class="icon-button mobile-settings" id="settings-top" aria-label="Configurações">'+icon('settings')+'</button></div></header>'}
function subjectPane(){const e=active();return '<section class="subject-pane"><div class="subject-top"><h1>'+esc(e.name)+'</h1><p class="subject-meta">Python · Exam Rank 03 · Nível '+e.level+'</p></div><div class="tabs" role="tablist" aria-label="Conteúdo do exercício">'+[['subject','book','Enunciado'],['hints','bulb','Dicas'],['visual','eye','Visualizar'],['notes','note','Notas'],['solution','code','Gabarito']].filter(t=>!data.activeExam||t[0]==='subject').map(([id,i,label])=>'<button role="tab" tabindex="'+(tab===id?'0':'-1')+'" aria-selected="'+(tab===id)+'" data-tab="'+id+'" class="'+(tab===id?'active':'')+'">'+icon(i)+label+'</button>').join('')+'</div><div class="subject-content" id="subject-content">'+tabContent(e)+'</div></section>'}
function tabContent(e:Exercise):string{
 if(!data.activeExam&&tab==='hints')return renderHints(e,revealed.has(e.id),hintOpen);
 if(!data.activeExam&&tab==='visual')return renderVisualization(e,visual,revealed.has(e.id),getSolution(e,solutionChoice));
 if(!data.activeExam&&tab==='solution')return renderAnswerKey(e,revealed.has(e.id),solutionLine,solutionChoice);
 if(!data.activeExam&&tab==='notes')return '<h2>Notas</h2><textarea id="notes" placeholder="Anotações deste exercício" aria-label="Anotações pessoais">'+esc(rec(e).notes)+'</textarea><label class="comprehension-label">Compreensão<select id="comprehension"><option value="none" '+((rec(e).comprehension??'none')==='none'?'selected':'')+'>Ainda não entendi</option><option value="partial" '+(rec(e).comprehension==='partial'?'selected':'')+'>Entendi parcialmente</option><option value="understood" '+(rec(e).understood?'selected':'')+'>Entendi</option></select></label><p class="muted small">Esta marcação não altera o resultado dos testes.</p><button class="secondary" id="exercise-history">Histórico de correções</button>';
 return renderSubject(e,!!data.activeExam);
}
function editorPane(){const e=active();return `<section class="editor-pane"><div class="editor-top"><span class="file-name">${icon('code')} ${esc(e.file)} <span class="file-dot"></span></span><div><span class="language-label">Python 3.12</span><button class="icon-button" id="download" aria-label="Baixar solução Python" title="Baixar .py">${icon('download')}</button><button class="icon-button" id="restore" ${mode==='review'?'disabled':''} aria-label="Restaurar código inicial" title="Restaurar código inicial">${icon('reset')}</button><button class="icon-button" id="expand" aria-label="${expanded?'Reduzir':'Ampliar'} editor" title="Ampliar editor">${icon('expand')}</button></div></div><div id="editor" aria-label="Editor de código Python"></div><div class="editor-status"><span id="saved">${icon('check')}Salvo automaticamente ${mode==='exam'?'· simulado':''}</span><span>UTF-8 <span class="status-divider">|</span> Tab: 4 espaços</span></div><div class="actions"><span class="shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> para executar</span><div><button id="stop" class="danger" ${!busy?'hidden':''}>${icon('x')}Interromper</button><button id="run" class="secondary" ${busy?'disabled':''}>${icon('play')}Executar</button><button id="grade" class="primary" ${busy?'disabled':''}>${icon('check')}${mode==='review'?'Reproduzir tentativa':'Corrigir'}</button></div></div><div class="console ${resultsExpanded?'expanded-results':''}"><div class="console-top"><span>${icon('terminal')}Console <span class="console-dot"></span></span><div><button class="text-button" id="results-expand">${resultsExpanded?'Reduzir resultados':'Ampliar resultados'}</button><button class="text-button" id="exercise-history-console" ${data.activeExam?'disabled title="Disponível após encerrar o simulado"':''}>Histórico</button><button class="text-button" id="clear-console">Limpar</button></div></div><div class="sample-select"><label for="sample">Executar:</label><select id="sample"><option value="-1" ${sample<0?'selected':''}>Código livre (sem chamada automática)</option>${e.examples.map((_,i)=>`<option value="${i}" ${sample===i?'selected':''}>${e.status.startsWith('COMUNITÁRIO')?'Exemplo local':'Exemplo público'} ${i+1}</option>`).join('')}</select></div><div id="console-output" class="console-output" aria-live="polite">${consoleContent()}</div></div><footer class="runtime-footer"><span id="runtime"></span><button id="restart-runtime" class="text-button" title="Reiniciar o Python">${icon('reset')}</button><span>EXECUÇÃO LOCAL</span></footer></section>`}
function consoleContent(){
 if(busy)return `<div class="console-empty"><span class="loader"></span><p>${visual.loading?'Executando a solução selecionada…':'Executando seu código…'}</p><small>Você pode interromper a execução.</small></div>`;
 if(!output)return `<div class="console-empty">${icon('terminal')}<p>Nenhum resultado disponível</p><small>Execute um exemplo ou corrija para inspecionar os testes.</small></div>`;
 if(outputContext&&outputContext.tests.length)return renderResults(output,outputContext,{mode:mode==='exam'?'exam':mode==='review'?'review':'study',activeExam:!!data.activeExam,fullSuite:true,onlyFailures});
 return `${output.error?`<pre class="error-text">${esc(output.error)}</pre>`:''}<span class="console-caption">stdout</span><pre>${esc(output.stdout||'(sem saída)')}</pre>${output.stderr?`<pre class="error-text">${esc(output.stderr)}</pre>`:''}`;
}

function stats(){return renderProgress(data,catalog)}
function examLanding(){return renderExamLanding(data)}
function render(){
 editor?.destroy();const e=active();
 $('#app').innerHTML=`${sidebar()}<div class="workspace">${header()}${mode==='stats'?stats():mode==='exam'&&!data.activeExam?examLanding():`${mode==='exam'?`<div class="exam-banner">${icon('clock')}<strong id="exam-clock">${clockText(remaining(data.activeExam!))}</strong><span>Nível ${data.activeExam!.index+1} de 6 · ${data.activeExam!.attempts} tentativas</span><button class="text-button" id="end-exam">Encerrar simulado</button></div>`:''}${mode==='review'?`<div class="review-banner"><strong>Revisão · ${new Date(reviewAttempt!.timestamp).toLocaleString('pt-BR')}</strong><span>O código salvo está somente para leitura. O resultado histórico não será modificado.</span><button class="text-button" id="back-review">Voltar</button></div>`:''}<main class="split ${expanded?'expanded':''}">${subjectPane()}<div class="resizer" role="separator" tabindex="0" aria-label="Redimensionar painéis" aria-orientation="vertical" aria-valuenow="48"></div>${editorPane()}</main>`}</div><input type="file" accept="application/json,.json" id="import-file" hidden><dialog id="dialog"></dialog>`;
 if($('#editor')){
  editor=new EditorView({state:EditorState.create({doc:currentCode(e),extensions:[EditorState.readOnly.of(mode==='review'),EditorView.editable.of(mode!=='review'),basicSetup,python(),oneDark,Prec.highest(keymap.of([indentWithTab,{key:'Ctrl-Enter',run:()=>{void execute(false);return true}}])),EditorState.tabSize.of(4),EditorView.theme({'&':{fontSize:`${data.settings.fontSize}px`},'.cm-content':{fontFamily:'"Cascadia Code", "Consolas", monospace',padding:'24px 0'},'.cm-scroller':{overflow:'auto'},'.cm-gutters':{backgroundColor:'#13161d',border:'none',color:'#525968'},'.cm-activeLineGutter':{backgroundColor:'#1d222b'},'.cm-activeLine':{backgroundColor:'#ffffff03'}}),EditorView.updateListener.of(u=>{if(u.docChanged)changeCode(u.state.doc.toString())})]}),parent:$('#editor')});
 }
 bind();updateRuntime();
}
function selectExercise(id:string){if(busy){toast('Interrompa a execução antes de trocar de exercício.');return}if(data.activeExam){toast('Encerre o simulado antes de escolher outro exercício.');return}mode='study';selected=id;data.selected=id;tab='subject';frame=0;sample=0;output=undefined;outputContext=undefined;expanded=false;solutionLine=0;hintOpen=0;resetLearning(getExercise(id));reviewAttempt=undefined;save();render()}
function setTab(id:string){if(data.activeExam&&id!=='subject')return;stopVisual();tab=id;frame=0;render();if(id==='visual'&&!visual.trace&&!busy)void buildTrace()}
function refreshLesson(){const target=$('#subject-content');if(!target)return;const position=target.scrollTop;const oldCode=target.querySelector('.solution-code');const codePosition=oldCode?.scrollTop??0;const focused=document.activeElement as HTMLElement|null;const focusId=focused?.id;const line=focused?.dataset.line;target.innerHTML=tabContent(active());target.scrollTop=position;const newCode=target.querySelector('.solution-code');if(newCode)newCode.scrollTop=codePosition;bindLearning();if(tab==='solution')target.querySelector<HTMLElement>('.solution-line.current')?.scrollIntoView({block:'nearest',inline:'nearest'});if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});else if(line!==undefined)target.querySelector<HTMLElement>('[data-line="'+line+'"]')?.focus({preventScroll:true})}
function resetLearning(e:Exercise){stopVisual();revealed.clear();solutionChoice='simple';solutionLine=0;hintOpen=0;visual=initialVisual(e)}
function stopVisual(){clearInterval(visualTimer);visualTimer=undefined;visual.playing=false}
function playVisual(){
 if(!visual.trace||visual.step>=visual.trace.steps.length-1)return;
 visual.playing=true;clearInterval(visualTimer);
 visualTimer=setInterval(()=>{if(tab!=='visual'||document.visibilityState!=='visible'){stopVisual();return}if(visual.step>=visual.trace!.steps.length-1){stopVisual();refreshLesson();return}visual.step++;if(visual.step===visual.trace!.steps.length-1)stopVisual();refreshLesson()},visual.speed);refreshLesson();
}
async function buildTrace(){
 if(busy||data.activeExam)return;stopVisual();const e=active();
 try{const args=JSON.parse(visual.input);if(!Array.isArray(args))throw Error('Use uma lista JSON com um item por parâmetro.');validateInteractive(e.name,args);visual.loading=true;visual.error=undefined;busy=true;render();const result=await runner.traceReference({...e,solution:getSolution(e,solutionChoice).code},makeCall(e.name,args),data.settings.timeout);if(result.error)throw Error(result.error);visual.trace=result.trace;visual.step=0}
 catch(error){visual.error=error instanceof Error?error.message:String(error);visual.trace=undefined}
 finally{visual.loading=false;busy=false;render()}
}
function showVisualInput(input:string){if(data.activeExam)return;stopVisual();visual={...initialVisual(active()),input:JSON.stringify(parseCall(input).args)};tab='visual';render();void buildTrace()}
function bindLearning(){
 document.querySelectorAll<HTMLElement>('[data-line]').forEach(el=>el.onclick=()=>{solutionLine=+el.dataset.line!;refreshLesson()});
 on('#prev-line',()=>{solutionLine--;refreshLesson()});on('#next-line',()=>{solutionLine++;refreshLesson()});on('#reset-line',()=>{solutionLine=0;refreshLesson()});
 document.querySelectorAll<HTMLElement>('[data-teaching-trace]').forEach(el=>el.onclick=()=>showVisualInput(makeCall(active().name,getEducation(active()).examples[+el.dataset.teachingTrace!].args)));
 on('#reveal',()=>{if(data.activeExam)return;revealed.add(active().id);rec().solutionViewed=true;rec().hints=Math.max(rec().hints,4);solutionLine=0;save();tab='solution';render()});
 document.querySelectorAll<HTMLSelectElement>('[data-answer-picker]').forEach(el=>el.onchange=()=>{if(data.activeExam||!revealed.has(active().id))return;solutionChoice=el.value;solutionLine=0;stopVisual();const input=visual.input;visual={...initialVisual(active()),input};if(tab==='visual')void buildTrace();else refreshLesson()});
 document.querySelectorAll<HTMLDetailsElement>('[data-hint]').forEach(el=>el.ontoggle=()=>{if(el.open&&!data.activeExam){rec().hints=Math.max(rec().hints,+el.dataset.hint!);save()}});
 document.querySelectorAll<HTMLElement>('#subject-content [data-tab]').forEach(el=>el.onclick=()=>setTab(el.dataset.tab!));
 on('#prev-frame',()=>{stopVisual();visual.step=Math.max(0,visual.step-1);refreshLesson()});on('#next-frame',()=>{stopVisual();visual.step=Math.min((visual.trace?.steps.length??1)-1,visual.step+1);refreshLesson()});on('#reset-frame',()=>{stopVisual();visual.step=0;refreshLesson()});
 on('#play-trace',()=>{if(visual.playing){stopVisual();refreshLesson()}else playVisual()});
 on('#build-trace',()=>void buildTrace());
 $('#trace-input')?.addEventListener('input',ev=>{visual.input=(ev.target as HTMLTextAreaElement).value;stopVisual()});
 $('#trace-example')?.addEventListener('change',ev=>{const index=(ev.target as HTMLSelectElement).value;if(index==='custom')return;const e=active();const examples=[...getEducation(e).examples.map(x=>x.args),...e.examples.map(x=>parseCall(x.input).args)];visual.input=JSON.stringify(examples[+index]);void buildTrace()});
 $('#trace-speed')?.addEventListener('change',ev=>{visual.speed=+(ev.target as HTMLSelectElement).value;if(visual.playing)playVisual()});
 $('#trace-position')?.addEventListener('input',ev=>{stopVisual();visual.step=+(ev.target as HTMLInputElement).value;refreshLesson()});
 $('#comprehension')?.addEventListener('change',ev=>{rec().comprehension=(ev.target as HTMLSelectElement).value as RecordData['comprehension'];rec().understood=rec().comprehension==='understood';save()});
 on('#exercise-history',()=>void openHistory({exerciseId:active().id}));
}
function bindResults(){
 $('#only-failures')?.addEventListener('change',ev=>{onlyFailures=(ev.target as HTMLInputElement).checked;$('#console-output').innerHTML=consoleContent();bindResults()});
 on('#expand-results',()=>document.querySelectorAll<HTMLDetailsElement>('#console-output .test-result').forEach(el=>el.open=true));on('#collapse-results',()=>document.querySelectorAll<HTMLDetailsElement>('#console-output .test-result').forEach(el=>el.open=false));
 const find=(id:string)=>outputContext?.tests.find(test=>test.meta?.id===id);
 document.querySelectorAll<HTMLElement>('[data-understand-test]').forEach(el=>el.onclick=()=>{const test=find(el.dataset.understandTest!);if(test)explainTest(test)});
 document.querySelectorAll<HTMLElement>('[data-replay-test]').forEach(el=>el.onclick=()=>{const test=find(el.dataset.replayTest!);if(test)void execute(false,test)});
 document.querySelectorAll<HTMLElement>('[data-visual-test]').forEach(el=>el.onclick=()=>{const test=find(el.dataset.visualTest!);if(test)showVisualInput(test.input)});
}
function explainTest(test:TestCase){
 if(data.activeExam)return;const result=output?.results.find(r=>r.id===test.meta?.id);const dialog=$<HTMLDialogElement>('#dialog');
 dialog.innerHTML=`<button class="dialog-close icon-button" aria-label="Fechar">${icon('x')}</button>${renderTestExplanation(test,result)}`;dialog.showModal();
 dialog.querySelector('.dialog-close')!.addEventListener('click',()=>dialog.close());
 on('#related-hint',()=>{dialog.close();hintOpen=2;tab='hints';render()});
 const button=dialog.querySelector<HTMLElement>('[data-dialog-visual]');if(button)button.onclick=()=>{dialog.close();showVisualInput(test.input)};
}
async function getHistory(){const stored=await allAttempts().catch(()=>[]);return [...new Map([...stored,...historyMemory.values()].map(a=>[a.id,a])).values()].sort((a,b)=>b.timestamp-a.timestamp)}
async function openHistory(filter:{exerciseId?:string;examId?:string}){
 if(data.activeExam||busy)return;const attempts=(await getHistory()).filter(a=>(!filter.exerciseId||a.exerciseId===filter.exerciseId)&&(!filter.examId||a.examId===filter.examId));const dialog=$<HTMLDialogElement>('#dialog');
 dialog.innerHTML=`<button class="dialog-close icon-button" aria-label="Fechar">${icon('x')}</button><h2>${filter.examId?'Revisão do simulado':'Histórico de correções'}</h2><p>Abra uma correção para ver o código, os testes e os valores efetivamente usados. A revisão não altera o resultado original.</p><div class="attempt-list">${renderAttemptList(attempts)}</div>`;dialog.showModal();dialog.querySelector('.dialog-close')!.addEventListener('click',()=>dialog.close());
 dialog.querySelectorAll<HTMLElement>('[data-review-attempt]').forEach(el=>el.onclick=()=>{const attempt=attempts.find(a=>a.id===el.dataset.reviewAttempt)!;reviewReturn=mode==='stats'?'stats':'study';reviewAttempt=attempt;mode='review';output=attempt.execution;outputContext={...attempt.exercise,tests:attempt.cases??attempt.exercise.tests};resetLearning(attempt.exercise);tab='subject';sample=0;solutionLine=0;hintOpen=0;dialog.close();render()});
}

function bind(){
 document.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>el.onclick=()=>{if(busy)return;if(data.activeExam&&el.dataset.mode!=='exam'){toast('Encerre o simulado antes de acessar o Aprendizado ou o progresso.');return}mode=el.dataset.mode as typeof mode;resetLearning(active());tab='subject';output=undefined;expanded=false;render()});
 document.querySelectorAll<HTMLElement>('[data-exercise]').forEach(el=>el.onclick=()=>selectExercise(el.dataset.exercise!));
 document.querySelectorAll<HTMLElement>('[data-tab]').forEach(el=>el.onclick=()=>setTab(el.dataset.tab!));
 $('[data-home]').onclick=ev=>{ev.preventDefault();if(!busy&&!data.activeExam){mode='study';resetLearning(active());tab='subject';render()}};
 $('#search').oninput=ev=>{search=(ev.target as HTMLInputElement).value;$('#exercise-list').innerHTML=exerciseList();bindExerciseList()};
 $('#level').onchange=ev=>{level=(ev.target as HTMLSelectElement).value;$('#exercise-list').innerHTML=exerciseList();bindExerciseList()};

 const tabList=document.querySelector<HTMLElement>('[role="tablist"]');if(tabList)tabList.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));const i=tabs.findIndex(el=>el===document.activeElement);if(i<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;const id=tabs[next].dataset.tab!;setTab(id);document.querySelector<HTMLButtonElement>('[role="tab"][data-tab="'+id+'"]')?.focus()};
 bindLearning();bindResults();on('#results-expand',()=>{resultsExpanded=!resultsExpanded;render()});on('#exercise-history-console',()=>void openHistory({exerciseId:active().id}));on('#back-review',()=>{stopVisual();mode=reviewReturn;reviewAttempt=undefined;output=undefined;outputContext=undefined;tab='subject';render()});document.querySelectorAll<HTMLElement>('[data-review-exam]').forEach(el=>el.onclick=()=>void openHistory({examId:el.dataset.reviewExam!}));on('#settings',settings);on('#settings-top',settings);on('#export-quick',exportFile);on('#export',exportFile);on('#import',()=>{if(!data.activeExam)$('#import-file').click()});
 $('#import-file').onchange=async ev=>{if(data.activeExam)return;const file=(ev.target as HTMLInputElement).files?.[0];if(!file)return;try{const imported=importProgress(await file.text());confirmAction('Importar progresso?','Os dados atuais serão substituídos pelos dados deste arquivo. Exporte uma cópia antes, se precisar.','Importar',()=>{void (async()=>{try{await replaceHistory(imported.history??[]);historyMemory.clear();delete imported.history;data=imported;selected=data.selected;mode=data.activeExam?'exam':'study';resetLearning(getExercise(selected));tab='subject';output=undefined;outputContext=undefined;reviewAttempt=undefined;save();render();toast('Progresso e histórico importados.')}catch(error){toast('A importação não foi concluída: '+String(error))}})()})}catch(error){toast(String(error))}};
 on('#run',()=>void execute(false));on('#grade',()=>void execute(true));on('#stop',()=>runner.cancel());
 on('#restart-runtime',()=>{if(!busy)runner.start()});on('#clear-console',()=>{if(!busy){output=undefined;outputContext=undefined;$('#console-output').innerHTML=consoleContent()}});
 on('#expand',()=>{expanded=!expanded;render()});on('#restore',()=>{if(!busy)confirmAction('Restaurar código inicial?','Seu código desta versão será substituído pela assinatura e um corpo vazio.','Restaurar',()=>{changeCode(starter(active()));render()})});
 on('#download',()=>download(active().file,currentCode(),'text/x-python'));
 $('#sample')?.addEventListener('change',ev=>sample=Number((ev.target as HTMLSelectElement).value));
 $('#version')?.addEventListener('change',ev=>selectExercise((ev.target as HTMLSelectElement).value));
 document.querySelectorAll<HTMLElement>('[data-sample]').forEach(el=>el.onclick=()=>{sample=+el.dataset.sample!;($('#sample') as HTMLSelectElement).value=String(sample);void execute(false)});
 $('#notes')?.addEventListener('input',ev=>{rec().notes=(ev.target as HTMLTextAreaElement).value;save()});
 $('#understood')?.addEventListener('change',ev=>{rec().understood=(ev.target as HTMLInputElement).checked;save()});
 on('#start-exam',()=>{data.settings.duration=+($('#exam-duration') as HTMLSelectElement).value;data.settings.reroll=($('#exam-reroll') as HTMLSelectElement).value==='yes';data.activeExam=createExam(catalog,data.settings.duration,data.settings.reroll);resetLearning(active());output=undefined;tab='subject';save();render()});
 on('#end-exam',()=>confirmAction('Encerrar simulado?','A tentativa e os códigos ficam registrados no histórico.','Encerrar',()=>endExam('Encerrado pelo estudante')));
 const resizer=$('.resizer');if(resizer){const resize=(pct:number)=>{const value=Math.max(28,Math.min(68,pct));$('.split').style.setProperty('--split',`${value}%`);resizer.setAttribute('aria-valuenow',String(Math.round(value)))};resizer.onpointerdown=event=>{resizer.setPointerCapture(event.pointerId);resizer.onpointermove=e=>{const r=$('.split').getBoundingClientRect();resize((e.clientX-r.left)/r.width*100)};resizer.onpointerup=()=>resizer.onpointermove=null};resizer.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();resize(+(resizer.getAttribute('aria-valuenow')||48)+(e.key==='ArrowLeft'?-2:2))}}}
}
function bindExerciseList(){document.querySelectorAll<HTMLElement>('[data-exercise]').forEach(el=>el.onclick=()=>selectExercise(el.dataset.exercise!))}
function on(selector:string,fn:()=>void){const el=$(selector);if(el)el.onclick=fn}
function download(name:string,text:string,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function exportFile(){if(data.activeExam){toast('Encerre o simulado para exportar o histórico detalhado.');return}try{const history=await getHistory();download(`42-exam-progresso-${new Date().toLocaleDateString('sv-SE')}.json`,exportProgress({...data,history}));toast('Progresso exportado com códigos, notas, testes e histórico.')}catch(error){toast('Não foi possível exportar: '+String(error))}}

function confirmAction(title:string,text:string,label:string,fn:()=>void){const dialog=$<HTMLDialogElement>('#dialog');dialog.innerHTML=`<button class="dialog-close icon-button" aria-label="Fechar">${icon('x')}</button><div class="dialog-icon">${icon('bulb')}</div><h2>${title}</h2><p>${text}</p><div class="dialog-actions"><button class="secondary" id="cancel-dialog">Voltar</button><button class="primary" id="confirm-dialog">${label}</button></div>`;dialog.showModal();dialog.querySelector('.dialog-close')!.addEventListener('click',()=>dialog.close());on('#cancel-dialog',()=>dialog.close());on('#confirm-dialog',()=>{dialog.close();fn()})}
function settings(){const dialog=$<HTMLDialogElement>('#dialog');dialog.innerHTML=`<button class="dialog-close icon-button" aria-label="Fechar">${icon('x')}</button><h2>Configurações</h2><label>Tamanho da fonte do editor<select id="font-setting">${[12,14,16,18,20,24].map(n=>`<option ${data.settings.fontSize===n?'selected':''}>${n}</option>`).join('')}</select></label><label>Limite de execução<select id="timeout-setting">${[2000,5000,10000,15000].map(n=>`<option value="${n}" ${data.settings.timeout===n?'selected':''}>${n/1000} segundos</option>`).join('')}</select></label><label>Duração padrão do simulado (minutos)<input type="number" id="duration-setting" min="1" max="360" value="${data.settings.duration}"></label><div class="settings-data"><button class="secondary" id="settings-export" ${data.activeExam?'disabled':''}>Exportar JSON</button><button class="secondary" id="settings-import" ${data.activeExam?'disabled':''}>Importar JSON</button></div><p class="small muted">O Python roda localmente em um worker. Este app não é uma sandbox de segurança para executar código não confiável.</p><button class="primary wide" id="save-settings">Salvar preferências</button>`;dialog.showModal();dialog.querySelector('.dialog-close')!.addEventListener('click',()=>dialog.close());on('#settings-export',exportFile);on('#settings-import',()=>{if(data.activeExam){toast('Encerre o simulado antes de importar dados.');return}dialog.close();$('#import-file').click()});on('#save-settings',()=>{const duration=+($<HTMLInputElement>('#duration-setting')).value;if(duration<1||duration>360){toast('Escolha de 1 a 360 minutos.');return}data.settings.fontSize=+($<HTMLSelectElement>('#font-setting')).value;data.settings.timeout=+($<HTMLSelectElement>('#timeout-setting')).value;data.settings.duration=duration;save();dialog.close();render()})}
async function execute(grade:boolean,test?:TestCase){
 if(busy)return;stopVisual();const e=active();const exam=mode==='exam'?data.activeExam:undefined;const review=mode==='review';
 const code=currentCode();const planned=test?[test]:grade?(reviewAttempt&&review?(reviewAttempt.cases??e.tests):e.tests):sample<0?[]:[e.tests.find(t=>t.input===e.examples[sample]?.input)??e.examples[sample]];
 outputContext={...e,tests:planned};busy=true;output=undefined;gradeOutput=grade;onlyFailures=false;render();
 if(grade&&!review){if(exam)exam.attempts++;else rec(e).attempts++;save()}
 try{output=await runner.execute(code,e,grade,sample,data.settings.timeout,test?[test]:review&&grade?planned:undefined)}
 catch(error){output=error instanceof ExecutionFailure?error.execution:{results:[],error:error instanceof Error?error.message:String(error),errorType:'internal'}}
 const passed=output.results.filter(r=>r.passed).length;const all=grade&&output.results.length===e.tests.length&&passed===e.tests.length&&!output.error&&!output.restriction&&(output.checks??[]).every(c=>c.passed);
 if(grade||test){
  const attempt:Attempt={id:crypto.randomUUID(),timestamp:Date.now(),exerciseId:e.id,examId:exam?.id,kind:review||test?'replay':'grade',code,exercise:structuredClone(e),execution:structuredClone(output),cases:structuredClone(planned),seed:4203};
  historyMemory.set(attempt.id,attempt);
  try{await saveAttempt(attempt)}catch{toast('Seu código está salvo. O histórico detalhado ficou disponível só nesta sessão; exporte JSON para guardar uma cópia.')}
 }
 if(grade&&exam&&data.activeExam?.id===exam.id){
  if(remaining(exam)===0){busy=false;endExam('Tempo esgotado');return}
  if(all){exam.index++;save();if(exam.index===6){busy=false;endExam('Concluído · 6/6 níveis');toast('Simulado concluído! Abra a revisão educativa no histórico.');return}toast(`Nível ${exam.index} aprovado. Próximo exercício disponível.`);output=undefined;outputContext=undefined;sample=0;frame=0;visual=initialVisual(active())}
  else if(exam.reroll){const pool=catalog.filter(x=>x.level===e.level);exam.sequence[exam.index]=pool[Math.floor(Math.random()*pool.length)].id;save();toast('Correção com falha. Novo sorteio no mesmo nível.');sample=0}
 }else if(grade&&!exam&&!review){const r=rec(e);r.total=e.tests.length;r.best=Math.max(r.best,passed);r.passed=r.passed||all;if(!all)r.errors++;save();if(all)toast('Todos os testes locais passaram.')}
 busy=false;render();
}

function endExam(reason:string){if(!data.activeExam)return;stopVisual();const ended=finishExam(data.activeExam,reason);data.exams.push(ended);data.activeExam=undefined;output=undefined;outputContext=undefined;mode='exam';save();if(busy)runner.cancel('Simulado encerrado.');render()}
document.addEventListener('keydown',ev=>{if(ev.key==='/'&&!(ev.target instanceof HTMLInputElement||ev.target instanceof HTMLTextAreaElement||(ev.target as HTMLElement).isContentEditable)){ev.preventDefault();$('#search').focus()}});
setInterval(()=>{const exam=data.activeExam;if(exam){const timer=$('#exam-clock');if(timer)timer.textContent=clockText(remaining(exam));if(remaining(exam)===0)endExam('Tempo esgotado')}if(document.visibilityState==='visible'&&mode==='study'){rec().seconds+=1;if(rec().seconds%10===0)save()}},1000);
window.addEventListener('beforeunload',()=>{stopVisual();save();runner.destroy()});
render();runner.start();
if('serviceWorker' in navigator&&['http:','https:'].includes(location.protocol))navigator.serviceWorker.register('/sw.js').catch(()=>{/* Cache is optional; assets remain local. */});
