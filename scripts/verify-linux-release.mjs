import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),asar=require('@electron/asar');
const arch=process.argv[2]??'x64';
if(!['x64','arm64'].includes(arch))throw Error('Arquitetura inválida.');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const root=path.join('release',arch==='x64'?'linux-unpacked':'linux-arm64-unpacked');
const binary=fs.readFileSync(path.join(root,'42-exam-trainer'));
if(!binary.subarray(0,4).equals(Buffer.from([127,69,76,70]))||binary.readUInt16LE(18)!==(arch==='x64'?62:183))throw Error('Binário ELF/arquitetura incorretos.');
const files=asar.listPackage(path.join(root,'resources/app.asar')).map(f=>f.replaceAll('\\','/'));
for(const required of ['/dist/index.html','/dist/python-worker.js','/dist/runtime/pyodide.asm.wasm','/dist/runtime/python_stdlib.zip','/electron/portable.cjs','/electron/icon.png','/dist/licenses/PYODIDE-LICENSE.txt','/dist/licenses/CPYTHON-LICENSE.txt'])if(!files.includes(required))throw Error('Ausente no pacote: '+required);
if(files.some(f=>/node_modules|qa-progress|qa\.cjs|test-profile|storage\.json/.test(f)))throw Error('Dados de QA/pessoais no pacote.');
for(const file of ['iniciar.sh','portable.flag','AppRun'])if(!fs.existsSync(path.join(root,file)))throw Error('Ausente: '+file);
if(!(fs.statSync(path.join(root,'iniciar.sh')).mode&0o111))throw Error('Launcher sem permissão de execução.');
if(fs.readFileSync(path.join(root,'AppRun'),'utf8').includes('--no-sandbox'))throw Error('Launcher não deve desligar o sandbox.');
const artifacts=['AppImage','tar.gz'].map(ext=>{
 const file=`42-Examark-${pkg.version}-Linux-${arch}-Portatil.${ext}`;
 const bytes=fs.readFileSync('release/'+file);
 if(bytes.length<1000000)throw Error('Pacote incompleto: '+file);
 if(ext==='AppImage'&&(!bytes.subarray(0,4).equals(Buffer.from([127,69,76,70]))||bytes.readUInt16LE(18)!==(arch==='x64'?62:183)))throw Error('AppImage com arquitetura incorreta.');
 if(ext==='AppImage'&&arch===process.arch){
  const inspect=fs.mkdtempSync(path.resolve('.cache/appimage-inspect-'));
  const extracted=spawnSync(path.resolve('release',file),['--appimage-extract','AppRun'],{cwd:inspect,encoding:'utf8'});
  if(extracted.status!==0)throw Error('Não foi possível inspecionar o AppRun final: '+extracted.stderr);
  const actual=fs.readFileSync(path.join(inspect,'squashfs-root/AppRun'),'utf8');
  if(actual!==fs.readFileSync('build/AppRun','utf8')||actual.includes('--no-sandbox'))throw Error('AppImage não preservou o launcher configurado.');
 }
 if(ext==='tar.gz'){
  const listing=spawnSync('tar',['-tzf','release/'+file],{encoding:'utf8'});
  if(listing.status!==0)throw Error('Arquivo tar inválido.');
  const paths=listing.stdout.split('\n');
  if(!paths.some(f=>f.endsWith('/iniciar.sh'))||!paths.some(f=>f.endsWith('/portable.flag')))throw Error('Arquivo tar sem launcher/marcador.');
  if(paths.some(f=>f.includes('42 Exam Trainer Dados')||f.startsWith('/')||f.split('/').includes('..')))throw Error('Conteúdo inesperado no tar.');
 }
 return {file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync(`release/SHA256SUMS-Linux-${arch}.txt`,artifacts.map(a=>`${a.sha256}  ${a.file}`).join('\n')+'\n');
fs.writeFileSync(`docs/linux-release-${arch}.json`,JSON.stringify({version:pkg.version,platform:'Linux',arch,artifacts,packageFiles:files.length,personalDataIncluded:false,licensesIncluded:true},null,2));
console.log(JSON.stringify(artifacts,null,2));
