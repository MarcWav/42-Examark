const fs=require('node:fs');
const path=require('node:path');
module.exports=async context=>{
 if(context.electronPlatformName!=='linux')return;
 fs.chmodSync(path.join(context.appOutDir,'iniciar.sh'),0o755);
 fs.chmodSync(path.join(context.appOutDir,'42-exam-trainer'),0o755);
};
