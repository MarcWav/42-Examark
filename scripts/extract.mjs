import fs from 'node:fs';
import vm from 'node:vm';
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('docs/rank03-data.js','utf8'),context);
fs.mkdirSync('src/content',{recursive:true});fs.writeFileSync('src/content/subjects.json',JSON.stringify(context.SUBJECTS,null,2));
for(const s of context.SUBJECTS)console.log(JSON.stringify({name:s.name,level:s.level,file:s.file,signature:s.signature,description:s.description.en,examples:s.examples}));
