import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script=fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const current=script.match(/const CACHE='([^']+)'/)[1];
function worker(){
 const events={},removed=[],opened=[],installed=[];
 let claimed=false;
 const cache={addAll:async requests=>installed.push(...requests),match:async request=>({version:'current',request})};
 const self={location:new URL('https://example.test/game/sw.js'),addEventListener:(name,handler)=>events[name]=handler,skipWaiting:async()=>{},clients:{claim:async()=>{claimed=true;}}};
 const caches={open:async name=>{opened.push(name);return cache;},keys:async()=>['cozy-v1-old','cozy-legacy',current,'cozy-v12-old','another-app'],delete:async name=>{removed.push(name);return true;},match:()=>{throw Error('Must not search legacy caches');}};
 vm.runInNewContext(script,{self,caches,URL,Request,fetch:async()=>{throw Error('Offline');}});
 return {events,removed,opened,installed,get claimed(){return claimed;}};
}
test('activation removes legacy game caches and preserves current and unrelated caches',async()=>{
 const w=worker();let done;w.events.activate({waitUntil:p=>done=p});await done;
 assert.deepEqual(w.removed,['cozy-v1-old','cozy-legacy','cozy-v12-old']);assert.equal(w.claimed,true);
});
test('resource and offline navigation reads use only the current cache',async()=>{
 const w=worker();let response;
 w.events.fetch({request:{method:'GET',mode:'cors',url:'https://example.test/game/app.js'},respondWith:p=>response=p});
 assert.equal((await response).version,'current');
 w.events.fetch({request:{method:'GET',mode:'navigate',url:'https://example.test/game/'},respondWith:p=>response=p});
 assert.equal((await response).request,'./index.html');assert.deepEqual(w.opened,[current,current]);
});
test('entry links and precache share build versions and bypass the browser HTTP cache on install',async()=>{
 const w=worker();let done;w.events.install({waitUntil:p=>done=p});await done;
 const js=index.match(/src="\.\/(app\.js\?v=[^"]+)"/)[1];
 const css=index.match(/href="\.\/(style\.css\?v=[^"]+)"/)[1];
 assert.ok(w.installed.some(r=>r.url.endsWith('/'+js)));assert.ok(w.installed.some(r=>r.url.endsWith('/'+css)));
 assert.ok(w.installed.every(r=>r.cache==='reload'));
});
