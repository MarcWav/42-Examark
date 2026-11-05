import {parentPort} from 'node:worker_threads';
import {loadPyodide} from 'pyodide';
import fs from 'node:fs';
const py=await loadPyodide();
const harness=fs.readFileSync('src/python/evaluator.py','utf8');
parentPort.postMessage({ready:true,version:py.runPython('import sys; sys.version')});
parentPort.on('message',async payload=>{
 try{py.globals.set('_payload',JSON.stringify(payload));parentPort.postMessage({data:JSON.parse(await py.runPythonAsync(harness))})}
 catch(error){parentPort.postMessage({error:String(error)})}
});
