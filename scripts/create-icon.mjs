import fs from 'node:fs';
import zlib from 'node:zlib';
const size=256,pixels=Buffer.alloc(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;pixels[i]=19;pixels[i+1]=22;pixels[i+2]=29;pixels[i+3]=255}
const rect=(x,y,w,h)=>{for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){const i=(row*size+col)*4;pixels[i]=165;pixels[i+1]=239;pixels[i+2]=195}};
// Original code-native mark, using simple segments; no external logo or image.
rect(45,65,16,57);rect(101,65,16,57);rect(45,114,72,16);rect(101,122,16,60);
rect(142,65,70,16);rect(196,73,16,49);rect(142,114,70,16);rect(142,122,16,60);rect(142,174,70,16);
rect(71,209,116,8);
const crc32=buffer=>{let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0};
const chunk=(type,data)=>{const label=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([label,data])));return Buffer.concat([length,label,data,crc])};
const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
const scan=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)pixels.copy(scan,y*(size*4+1)+1,y*size*4,(y+1)*size*4);
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]);
const ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(png.length,14);ico.writeUInt32LE(22,18);
fs.mkdirSync('build',{recursive:true});fs.writeFileSync('build/icon.ico',Buffer.concat([ico,png]));fs.writeFileSync('electron/icon.ico',Buffer.concat([ico,png]));fs.writeFileSync('build/icon.png',png);
console.log('Ícone original criado para o aplicativo.');
