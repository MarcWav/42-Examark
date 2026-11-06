const {app,BrowserWindow,Menu,protocol,session,shell,dialog} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const {createAssetHandler} = require('./assets.cjs');
const {portableDirectory} = require('./portable.cjs');

const HOME = 'trainer://app/';
app.setName('42 Examark');
// Keep the installed profile path used before the visible name change.
const legacyProfile=path.join(app.getPath('appData'),'42 Exam Trainer');
fs.mkdirSync(legacyProfile,{recursive:true});
app.setPath('userData',legacyProfile);
app.setAppUserModelId('org.examtrainer42.desktop');
protocol.registerSchemesAsPrivileged([{scheme:'trainer',privileges:{standard:true,secure:true,supportFetchAPI:true,allowServiceWorkers:true,corsEnabled:true}}]);

// These switches are intentionally restricted to unpackaged development runs.
const args = process.argv.slice(1);
const qaProfile = !app.isPackaged && args.find(arg=>arg.startsWith('--trainer-test-profile='))?.split('=').slice(1).join('=');
const qaReport = !app.isPackaged && args.find(arg=>arg.startsWith('--trainer-test-report='))?.split('=').slice(1).join('=');
const portable = portableDirectory({platform:process.platform,env:process.env,executable:process.execPath,packaged:app.isPackaged,hasMarker:fs.existsSync(path.join(path.dirname(process.execPath),'portable.flag'))});
let profileWarning = '';
try {
  if (qaProfile) app.setPath('userData',path.resolve(qaProfile));
  else if (portable) {
    const dir = path.join(portable,'42 Exam Trainer Dados');
    fs.mkdirSync(dir,{recursive:true});fs.accessSync(dir,fs.constants.W_OK);
    app.setPath('userData',dir);
  }
} catch {
  profileWarning = 'A pasta do aplicativo não permite gravar o progresso. Nesta execução, os dados serão salvos no perfil deste usuário do sistema. Para levar seu progresso, use Exportar JSON.';
}

let mainWindow;
const allowedLinks = new Set(['rank03.42exam.net','github.com','pypi.org','note.com']);
function openSource(address) {
  try {const url=new URL(address);if(url.protocol==='https:'&&allowedLinks.has(url.hostname))void shell.openExternal(url.href)}catch{}
}
function localAddress(address) {try{const url=new URL(address);return url.protocol==='trainer:'&&url.hostname==='app'}catch{return false}}

function createWindow() {
  mainWindow = new BrowserWindow({width:1440,height:940,minWidth:850,minHeight:620,title:'42 Examark',backgroundColor:'#13161d',show:false,
    icon:path.join(__dirname,process.platform==='linux'?'icon.png':'icon.ico'),
    webPreferences:{nodeIntegration:false,nodeIntegrationInWorker:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:!app.isPackaged,spellcheck:false}
  });
  mainWindow.once('ready-to-show',()=>mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({url})=>{openSource(url);return {action:'deny'}});
  mainWindow.webContents.on('will-navigate',(event,url)=>{if(!localAddress(url)){event.preventDefault();openSource(url)}});
  mainWindow.webContents.on('will-attach-webview',event=>event.preventDefault());
  mainWindow.webContents.on('render-process-gone',()=>dialog.showMessageBox(mainWindow,{type:'error',title:'42 Examark',message:'A janela foi encerrada inesperadamente.',detail:'Feche e abra o aplicativo novamente. O progresso salvo permanece no seu perfil.'}));
  void mainWindow.loadURL(HOME);
}

if(!app.requestSingleInstanceLock())app.quit();
else {
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus()}});
  app.whenReady().then(async()=>{
    protocol.handle('trainer',createAssetHandler(path.join(app.getAppPath(),'dist')));
    session.defaultSession.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    session.defaultSession.webRequest.onBeforeRequest((details,callback)=>{
      // Bundled application, Python, and fonts work offline. Source links open in the user's browser.
      const url=new URL(details.url);callback({cancel:!['trainer:','blob:','data:','devtools:'].includes(url.protocol)});
    });
    session.defaultSession.on('will-download',(_event,item)=>{
      item.setSaveDialogOptions({title:'Salvar arquivo · 42 Examark',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label:'Arquivo',submenu:[{label:'Abrir pasta do progresso',click:()=>void shell.openPath(app.getPath('userData'))},{type:'separator'},{role:'quit',label:'Sair'}]},
      {label:'Editar',submenu:[{role:'undo',label:'Desfazer'},{role:'redo',label:'Refazer'},{type:'separator'},{role:'cut',label:'Recortar'},{role:'copy',label:'Copiar'},{role:'paste',label:'Colar'},{role:'selectAll',label:'Selecionar tudo'}]},
      {label:'Exibir',submenu:[{role:'reload',label:'Recarregar'},{role:'resetZoom',label:'Zoom padrão'},{role:'zoomIn',label:'Ampliar'},{role:'zoomOut',label:'Reduzir'},{role:'togglefullscreen',label:'Tela cheia'}]},
      {label:'Ajuda',submenu:[{label:'Sobre o 42 Examark',click:()=>dialog.showMessageBox(mainWindow,{type:'info',title:'42 Examark',message:`42 Examark ${app.getVersion()}`,detail:'Treinamento comunitário de Python Rank 03. Não oficial. Python e fontes incluídos para uso offline.\n\nUse Exportar/Importar JSON para transferir progresso entre a versão web, instalada e portátil.'})}]}
    ]));
    createWindow();
    if(profileWarning)await dialog.showMessageBox(mainWindow,{type:'info',message:profileWarning});
    if(qaReport) {
      // End-to-end QA only: tests the built UI inside the actual Electron renderer.
      const {runDesktopQA} = require('./qa.cjs');
      try {await runDesktopQA(mainWindow,path.resolve(qaReport));app.exit(0)}
      catch(error){fs.writeFileSync(path.resolve(qaReport),JSON.stringify({passed:false,error:String(error),stack:error.stack},null,2));app.exit(1)}
    }
  }).catch(error=>{dialog.showErrorBox('Não foi possível abrir o 42 Examark',String(error));app.exit(1)});
}
app.on('window-all-closed',()=>app.quit());
