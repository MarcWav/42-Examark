import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const source=fs.readFileSync('electron/main.cjs','utf8');
const realRequire=createRequire(path.resolve('electron/main.cjs'));
for(const existing of [false,true])test('desktop profile startup '+(existing?'preserves legacy data':'creates the legacy path on a fresh PC'),()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'examark-profile-'));
 try{
  const legacy=path.join(root,'42 Exam Trainer');
  if(existing){fs.mkdirSync(legacy);fs.writeFileSync(path.join(legacy,'preserved.txt'),'meus dados')}
  const selected:string[]=[];let name='';
  const app={isPackaged:true,setName:(value:string)=>{name=value},getPath:()=>root,setPath:(_key:string,dir:string)=>{assert(fs.existsSync(dir),'setPath needs an existing directory');selected.push(dir)},setAppUserModelId:()=>{},requestSingleInstanceLock:()=>false,quit:()=>{},on:()=>{}};
  const fake={app,protocol:{registerSchemesAsPrivileged:()=>{}}};
  vm.runInNewContext(source,{require:(id:string)=>id==='electron'?fake:realRequire(id),process:{argv:[],env:{},platform:'linux',execPath:path.join(root,'app/examark')},__dirname:path.resolve('electron')},{filename:'electron/main.cjs'});
  assert.equal(name,'42 Examark');assert.equal(selected[0],legacy);
  if(existing)assert.equal(fs.readFileSync(path.join(legacy,'preserved.txt'),'utf8'),'meus dados');
 }finally{if(!path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep))throw Error('Unexpected temporary path');fs.rmSync(root,{recursive:true,force:true})}
});
