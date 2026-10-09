import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {SPRITE_ATLAS_IDS,WORLD_ASSET_IDS} from '../src/visuals.mjs';
import {VERSION} from '../src/data.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'),release=path.join(root,'release');
await fs.mkdir(dist,{recursive:true});await fs.mkdir(release,{recursive:true});
const html=await fs.readFile(path.join(root,'src/index.html'),'utf8');
const css=await fs.readFile(path.join(root,'src/style.css'),'utf8');
const sourceNames=['data.mjs','engine.mjs','actor-bounds.mjs','visuals.mjs','life.mjs','scenes.mjs','interaction.mjs','ui.mjs'];
const sources=await Promise.all(sourceNames.map(f=>fs.readFile(path.join(root,'src',f),'utf8')));
const code=sources.map(s=>s.replace(/^import .*?;\s*$/gm,'').replace(/^export\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*$/gm,'').replace(/^export /gm,'')).join('\n\n');
const assetsDir=path.join(root,'public/assets');
// Editable originals live in art/source; public/assets contains current runtime media.
const runtimeIds=[
  'app-icon','paper-texture','cozy-loop',
  ...['ambient-cuddle','ambient-kiss','ambient-bubu-guitar','ambient-yier-tea'].flatMap(id=>[id,id+'-motion']),
  ...['bubu','yier'].flatMap(who=>['back','face','happy','idle','joy','side','sit','sleep','surprise','turn','walk','paint','shy'].map(pose=>`${who}-${pose}`)),
  'story-companion','story-garden','story-night','story-rest',
  ...['coin','crate','energy','gift','scissors','star','storage'].map(id=>`util-${id}`),
  ...SPRITE_ATLAS_IDS,...WORLD_ASSET_IDS,
];
const available=new Set(await fs.readdir(assetsDir));
const required=[...SPRITE_ATLAS_IDS,...WORLD_ASSET_IDS];
const missing=required.filter(id=>!available.has(`${id}.png`));
if(missing.length)throw new Error(`新版素材尚未齐备：${missing.join('、')}。请将原始生成图放入 public/assets 后再构建。`);
const files=runtimeIds.map(id=>`${id}.${id==='cozy-loop'?'wav':id.startsWith('ambient-')&&id.endsWith('-motion')?'gif':'png'}`).filter(f=>available.has(f)).sort();
const ids=files.map(f=>path.parse(f).name);
const sizes={};
for(const f of files.filter(f=>f.endsWith('.png'))){const png=await fs.readFile(path.join(assetsDir,f));sizes[path.parse(f).name]=[png.readUInt32BE(16),png.readUInt32BE(20)];}
const codeBundle=`/* ${VERSION} | ${new Date().toISOString()} | locally built; no network dependencies */\nwindow.__ASSET_IDS__=${JSON.stringify(ids)};\nwindow.__ASSET_SIZES__=${JSON.stringify(sizes)};\n(function(){'use strict';\n${code}\n})();`;
const digest=crypto.createHash('sha256').update(codeBundle).update(css).digest('hex').slice(0,12);
await fs.writeFile(path.join(dist,'app.js'),codeBundle);
await fs.writeFile(path.join(dist,'style.css'),css);
const distAssets=path.join(dist,'assets');await fs.mkdir(distAssets,{recursive:true});
// Remove obsolete generated media from an earlier build, never source assets.
for(const entry of await fs.readdir(distAssets,{withFileTypes:true}))if(entry.isFile()&&/\.(png|wav|gif)$/.test(entry.name)&&!files.includes(entry.name))await fs.unlink(path.join(distAssets,entry.name));
for(const f of files)await fs.copyFile(path.join(assetsDir,f),path.join(distAssets,f));
const index=html.replace('<!--STYLE-->',`<link rel="stylesheet" href="./style.css?v=${digest}"><link rel="manifest" href="./manifest.webmanifest"><link rel="icon" href="./assets/app-icon.png"><link rel="apple-touch-icon" href="./assets/app-icon.png">`).replace('<!--SCRIPT-->',`<script src="./app.js?v=${digest}"></script>`);
await fs.writeFile(path.join(dist,'index.html'),index);
const map={};for(const f of files)map[path.parse(f).name]=`data:${f.endsWith('.wav')?'audio/wav':f.endsWith('.gif')?'image/gif':'image/png'};base64,${(await fs.readFile(path.join(assetsDir,f))).toString('base64')}`;
const inline=`<script>window.__OFFLINE_SINGLE__=true;window.__ASSETS__=${JSON.stringify(map)};<\/script><script>${codeBundle.replace(/<\/script/gi,'<\\/script')}<\/script>`;
const offline=html.replace('<!--STYLE-->',()=>`<style>${css}</style>`).replace('<!--SCRIPT-->',()=>inline);
await fs.writeFile(path.join(release,'熊熊之家_双击即玩.html'),offline);
await fs.writeFile(path.join(dist,'manifest.webmanifest'),JSON.stringify({id:'./',name:'熊熊之家',short_name:'熊熊之家',start_url:'./',scope:'./',display:'standalone',orientation:'portrait',theme_color:'#788f72',background_color:'#f6f0dc',lang:'zh-CN',icons:[{src:'assets/app-icon.png',sizes:'512x512',type:'image/png',purpose:'any'}]},null,2));
const precache=['./','./index.html',`./style.css?v=${digest}`,`./app.js?v=${digest}`,'./manifest.webmanifest',...files.map(f=>'./assets/'+f)];
await fs.writeFile(path.join(dist,'sw.js'),`const CACHE='cozy-v12-${digest}';const FILES=${JSON.stringify(precache)};\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(new URL(f,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting())));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cozy-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('./index.html'))));return;}e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||fetch(e.request)));});`);
await fs.writeFile(path.join(root,'release/build-info.json'),JSON.stringify({version:VERSION,builtAt:new Date().toISOString(),buildId:digest,runtimeAssets:files.length,spriteAtlases:SPRITE_ATLAS_IDS.length,worldRegions:3,offlineBytes:Buffer.byteLength(offline),runtimeAssetBytes:(await Promise.all(files.map(async f=>(await fs.stat(path.join(assetsDir,f))).size))).reduce((a,b)=>a+b,0),networkRequiredToPlay:false,characterStyle:'flat-2d-reference',sourceFiles:[...sourceNames.map(f=>'src/'+f),'src/style.css']},null,2));
console.log(`Built ${files.length} bundled assets. Offline file ${(Buffer.byteLength(offline)/1048576).toFixed(2)} MiB. Build ID ${digest}`);
