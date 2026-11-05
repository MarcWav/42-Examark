import fs from 'node:fs';
fs.mkdirSync('public/runtime',{recursive:true});
for(const file of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])fs.copyFileSync(`node_modules/pyodide/${file}`,`public/runtime/${file}`);
console.log('Pyodide 0.27.7 copiado para public/runtime; execução não depende de CDN.');
