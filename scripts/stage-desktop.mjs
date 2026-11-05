import fs from 'node:fs';
import path from 'node:path';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const root=path.resolve('.cache/desktop-app');
const expected=path.join(fs.realpathSync('.cache'),'desktop-app');
if(root!==expected||(fs.existsSync(root)&&fs.lstatSync(root).isSymbolicLink()))throw Error('Pasta de staging fora do caminho esperado.');
if(fs.existsSync(root))fs.rmSync(root,{recursive:true,force:true});
fs.mkdirSync(root,{recursive:true});
fs.cpSync('dist',path.join(root,'dist'),{recursive:true});
fs.mkdirSync(path.join(root,'electron'),{recursive:true});
for(const file of ['main.cjs','assets.cjs','portable.cjs'])fs.copyFileSync(`electron/${file}`,path.join(root,'electron',file));
fs.copyFileSync('build/icon.ico',path.join(root,'electron/icon.ico'));
fs.copyFileSync('build/icon.png',path.join(root,'electron/icon.png'));
fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({name:pkg.name,productName:'42 Exam Trainer',version:pkg.version,description:'Pratique os subjects públicos de Python Rank 03 offline.',main:'electron/main.cjs',author:'42 Exam Trainer — projeto comunitário',license:'UNLICENSED',private:true,dependencies:{}},null,2));
fs.writeFileSync(path.join(root,'LICENSES.txt'),`42 Exam Trainer — ferramenta comunitária, não oficial da École 42.
Os subjects públicos têm atribuição em docs/source-audit.md do projeto-fonte.
Electron: MIT, inclui Chromium e suas licenças em LICENSE.electron.txt e LICENSES.chromium.html.
Pyodide: Mozilla Public License 2.0; CPython: Python Software Foundation License.
CodeMirror: MIT. DM Sans e Manrope: SIL Open Font License 1.1.
Os avisos completos dos pacotes estão junto do runtime distribuído ou no projeto-fonte.
`);
// Include the upstream runtime and font notices with the static files actually shipped.
const notices=path.join(root,'dist/licenses');fs.mkdirSync(notices,{recursive:true});
for(const [name,files] of Object.entries({'pyodide':['README.md','package.json'],'@fontsource/dm-sans':['LICENSE'],'@fontsource/manrope':['LICENSE'],'codemirror':['LICENSE']}))for(const file of files){const source=path.join('node_modules',name,file);if(fs.existsSync(source))fs.copyFileSync(source,path.join(notices,name.replaceAll('/','-')+'-'+file))}
for(const entry of fs.readdirSync('build/licenses'))fs.copyFileSync(path.join('build/licenses',entry),path.join(notices,entry));
for(const scope of ['@codemirror','@lezer','@marijn']){
 const scopeDir=path.join('node_modules',scope);if(!fs.existsSync(scopeDir))continue;
 for(const name of fs.readdirSync(scopeDir)){
  const dir=path.join(scopeDir,name);for(const file of fs.readdirSync(dir))if(/^(LICENSE|COPYING|OFL)/i.test(file)&&fs.statSync(path.join(dir,file)).isFile())fs.copyFileSync(path.join(dir,file),path.join(notices,scope+'-'+name+'-'+file));
 }
}
for(const name of ['crelt','style-mod','w3c-keyname']){
 const dir=path.join('node_modules',name);if(fs.existsSync(dir))for(const file of fs.readdirSync(dir))if(/^LICENSE/i.test(file))fs.copyFileSync(path.join(dir,file),path.join(notices,name+'-'+file));
}
fs.writeFileSync(path.join(notices,'SOURCES.txt'),'Pyodide 0.27.7 source: https://github.com/pyodide/pyodide/tree/0.27.7\nCPython 3.12.7 source: https://github.com/python/cpython/tree/v3.12.7\nCodeMirror: https://github.com/codemirror\nFontsource: https://fontsource.org\nNenhuma modificação foi feita nos binários upstream do Pyodide/CPython.\n');
console.log('Aplicação desktop preparada sem código de testes ou progresso pessoal.');
