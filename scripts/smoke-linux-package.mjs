import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
if(process.platform!=='linux'||process.arch!=='x64')throw Error('Smoke nativo requer Linux x64.');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const root=fs.mkdtempSync(path.resolve('.cache/linux-package-smoke-'));
const appImage=path.resolve('release',`42-Exam-Trainer-${pkg.version}-Linux-x64-Portatil.AppImage`);
const copied=path.join(root,'AppImage',path.basename(appImage));fs.mkdirSync(path.dirname(copied));fs.copyFileSync(appImage,copied);fs.chmodSync(copied,0o755);
const archive=path.resolve('release',`42-Exam-Trainer-${pkg.version}-Linux-x64-Portatil.tar.gz`);
const extracted=path.join(root,'archive');fs.mkdirSync(extracted);
const tar=spawnSync('tar',['-xzf',archive,'-C',extracted],{encoding:'utf8'});assert.equal(tar.status,0,tar.stderr);
const findLauncher=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){const found=findLauncher(file);if(found)return found}else if(entry.name==='iniciar.sh')return file}};
const launcher=findLauncher(extracted);assert(launcher,'Launcher do arquivo tar ausente.');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const checks=[];
for(const [name,binary,args,profileRoot] of [['AppImage',copied,['--appimage-extract-and-run'],path.dirname(copied)],['tar.gz',launcher,[],path.dirname(launcher)]]){
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.APPIMAGE;delete env.APPDIR;
 let log='',exit;
 const child=spawn(binary,args,{cwd:root,env,detached:true,stdio:['ignore','ignore','pipe']});
 child.stderr.on('data',data=>{log=(log+data.toString()).slice(-12000)});
 child.on('error',error=>{exit={error:String(error)}});
 const closed=once(child,'close').then(([code,signal])=>{exit={code,signal}});
 try{
  const profile=path.join(profileRoot,'42 Exam Trainer Dados','Local Storage','leveldb','CURRENT');
  let ready=false;
  for(let i=0;i<120;i++){if(exit)throw Error(name+' encerrou antes da interface: '+JSON.stringify(exit)+'\n'+log);if(fs.existsSync(profile)){ready=true;break}await pause(250)}
  assert(ready,name+': a interface não abriu o armazenamento portátil.\n'+log);
  await pause(5000);assert(!exit,name+': aplicativo encerrou após abrir.\n'+log);
  checks.push({format:name,opened:true,portableStorage:true,noSandboxFlag:false});
 }finally{
  if(!exit){try{process.kill(-child.pid,'SIGTERM')}catch{}}
  await Promise.race([closed,pause(2000)]);
  if(!exit){try{process.kill(-child.pid,'SIGKILL')}catch{}await closed}
 }
}
const report={passed:true,platform:process.platform,arch:process.arch,checks};
fs.writeFileSync('docs/linux-package-smoke.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
