import {test} from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {portableDirectory}=require('../electron/portable.cjs');
const linux={platform:'linux',env:{},executable:path.resolve('portable/42-exam-trainer'),packaged:true,hasMarker:false};
test('AppImage saves beside the original image, never in its temporary mount',()=>{
 const image=path.resolve('usb/Trainer.AppImage');
 assert.equal(portableDirectory({...linux,env:{APPIMAGE:image}}),path.dirname(image));
 assert.equal(portableDirectory({...linux,env:{APPIMAGE:'relative.AppImage'}}),null);
});
test('Linux archive marker enables portable data; development and normal installs do not',()=>{
 assert.equal(portableDirectory({...linux,hasMarker:true}),path.dirname(linux.executable));
 assert.equal(portableDirectory(linux),null);
 assert.equal(portableDirectory({...linux,packaged:false,hasMarker:true,env:{APPIMAGE:path.resolve('app')}}),null);
});
test('Windows portable profile remains compatible with previous releases',()=>{
 const portable=path.resolve('windows-portable');
 assert.equal(portableDirectory({...linux,platform:'win32',env:{PORTABLE_EXECUTABLE_DIR:portable}}),portable);
 assert.equal(portableDirectory({...linux,platform:'win32'}),null);
});
