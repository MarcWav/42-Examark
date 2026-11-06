module.exports={
 appId:'org.examtrainer42.desktop',productName:'42 Examark',
 directories:{app:'.cache/desktop-app',output:'release',buildResources:'build'},
 files:['dist/**/*','electron/main.cjs','electron/assets.cjs','electron/portable.cjs','electron/icon.ico','electron/icon.png','package.json','LICENSES.txt','!node_modules{,/**/*}'],
 asar:true,compression:'normal',npmRebuild:false,
 afterPack:require('./scripts/after-pack.cjs'),
 appImage:{executableArgs:[]},
 linux:{target:['AppImage','tar.gz'],executableName:'42-exam-trainer',icon:'build/icon.png',category:'Education',synopsis:'Treine Python Rank 03 offline',artifactName:'42-Examark-${version}-Linux-${arch}-Portatil.${ext}',extraFiles:[{from:'build/AppRun',to:'AppRun'},{from:'build/portable.flag',to:'portable.flag'},{from:'build/iniciar-linux.sh',to:'iniciar.sh'}]},
 win:{target:[{target:'portable',arch:['x64']},{target:'nsis',arch:['x64']}],icon:'build/icon.ico',artifactName:'42-Examark-${version}-${arch}-${target}.${ext}'},
 portable:{artifactName:'42-Examark-${version}-Windows-x64-Portatil.exe',requestExecutionLevel:'user'},
 nsis:{artifactName:'42-Examark-${version}-Windows-x64-Instalador.exe',oneClick:false,allowToChangeInstallationDirectory:true,perMachine:false,createDesktopShortcut:true,createStartMenuShortcut:true,shortcutName:'42 Examark',deleteAppDataOnUninstall:false,installerLanguages:['pt_BR','en_US'],language:'1046',runAfterFinish:true,include:'build/installer.nsh'}
};
