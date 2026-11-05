/* Pyodide 0.27.7, classic Worker. A fresh interpreter is used for every job. */
self.postMessage({type:'status', text:'Carregando o runtime local · etapa 1/3'});
const ready=(async()=>{
  importScripts('/runtime/pyodide.js');
  self.postMessage({type:'status',text:'Preparando Python e biblioteca padrão · etapa 2/3'});
  const py=await loadPyodide({indexURL:'/runtime/'});
  self.postMessage({type:'ready',text:'Python pronto · etapa 3/3'});
  return py;
})();
ready.catch(error=>self.postMessage({type:'error',error:String(error)}));
self.onmessage=async({data})=>{
  try {
    const py=await ready;
    py.globals.set('_payload',JSON.stringify(data.payload));
    py.globals.set('_emit_case',json=>self.postMessage({type:'case',data:JSON.parse(json)}));
    const result=await py.runPythonAsync(data.harness);
    self.postMessage({type:'result',data:JSON.parse(result)});
  } catch(error){self.postMessage({type:'error',error:String(error)})}
};
