import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine,freshState,clone,validateState} from '../src/engine.mjs';
import {CATS,CHAINS,DECOR} from '../src/data.mjs';
import {decorPlacement,decorBounds,describeScene,createScenePlayer} from '../src/scenes.mjs';

const NOW=new Date('2026-10-09T08:00:00+08:00').getTime();
function setup(stage=24){
 const s=freshState(NOW);s.stage=stage;s.stats.build=stage;s.tutorial='done';s.introSeen=true;
 s.decorStyles=s.decorStyles.map((_,id)=>id<stage?0:null);
 s.board=s.board.map((t,id)=>id<6?t:t?.k==='crate'&&t.openAt>stage?t:null);
 s.producerLessons=Object.fromEntries(CATS.map(c=>[c,c==='clean'||CHAINS[c].unlock<=stage]));
 s.tea.firstVisit=stage===24?'available':'locked';return new GameEngine(s,NOW);
}
const decor=(scene,id)=>scene.layers.find(l=>l.decorId===id);

test('furniture moves use actual sprite bounds and never spend or award resources',()=>{
 const g=setup(),before=clone(g.s),bounds=decorBounds(20);
 assert.deepEqual(g.moveDecor(20,-800,600),{ok:true,kind:'moveDecor',id:20,region:'courtyard',x:bounds.minX,y:bounds.maxY});
 assert.equal(bounds.minX,27);assert.equal(decor(describeScene(g.s,{region:'courtyard'}),20).w,54);
 const after=clone(g.s);after.decorPositions={};assert.deepEqual(after,before);
 for(const args of [[24,50,50],[0,NaN,50],[0,50,Infinity],[0,'50',50]]){
  const state=clone(g.s);assert.equal(g.moveDecor(...args).ok,false);assert.deepEqual(g.s,state);
 }
 const newGame=setup(1);assert.equal(newGame.moveDecor(1,50,50).code,'DECOR');
});

test('saved furniture layout and colors roundtrip; missing old layouts migrate without progress changes',()=>{
 const g=setup();for(const [id,x,y] of [[5,40,70],[12,61,75],[21,65,80]])assert.ok(g.moveDecor(id,x,y).ok);
 g.redecorate(5,1);const saved=validateState(JSON.parse(g.export()));assert.deepEqual(saved,g.s);
 const loaded=new GameEngine(saved,NOW);assert.deepEqual(loaded.s.decorPositions,g.s.decorPositions);
 for(const region of ['house','garden','courtyard'])for(const l of describeScene(loaded.s,{region}).layers.filter(l=>l.kind==='decor')){
  const p=decorPlacement(l.decorId,loaded.s.decorPositions[l.decorId]);assert.equal(l.x,p.x);assert.equal(l.y,p.y);
 }
 const old=clone(g.s);delete old.decorPositions;const migrated=validateState(old);assert.deepEqual(old.decorPositions,undefined);
 const expected=clone(old);expected.decorPositions={};assert.deepEqual(migrated,expected);
 const malformed=clone(g.s);malformed.decorPositions[5].x=-1;assert.throws(()=>validateState(malformed),/家具位置/);
 malformed.decorPositions={'24':{x:50,y:50}};assert.throws(()=>validateState(malformed),/家具位置/);
});

test('reset restores original default layout, including untouched old arrangements',()=>{
 const g=setup();const initial=describeScene(g.s,{region:'house'});
 assert.ok(g.moveDecor(19,20,20).ok);assert.ok(g.resetDecorPosition(19).ok);
 assert.deepEqual(decor(describeScene(g.s,{region:'house'}),19),decor(initial,19));
 assert.equal(Object.hasOwn(g.s.decorPositions,19),false);assert.equal(decor(initial,19).y,94);
});

test('tea, first visit and souvenirs freeze layout; older and chapter replays use defaults',()=>{
 const g=setup();g.moveDecor(5,35,76);const order=g.teaOrder();
 for(const r of order.needs)for(let n=0;n<r.n;n++)g.s.storage.push({k:'item',c:r.c,l:r.l});
 const tea=g.submit('tea',order.id);assert.ok(tea.ok);assert.deepEqual(tea.result.decorPositions[5],{x:35,y:76});
 const first=g.beginFirstVisit();assert.ok(first.ok);g.moveDecor(5,70,50);
 const remembered=describeScene(g.s,{teaResult:tea.result});assert.equal(decor(remembered,5).x,35);
 assert.equal(decor(describeScene(g.s,{region:'house'}),5).x,70);
 assert.equal(g.s.world.souvenirs[order.souvenirKey].decorPositions[5].x,35);
 assert.equal(first.result.decorPositions[5].x,35);assert.deepEqual(validateState(JSON.parse(g.export())),g.s);
 const old=clone(tea.result);delete old.decorPositions;
 assert.equal(decor(describeScene(g.s,{teaResult:old}),5).x,decorPlacement(5).x);
 assert.equal(decor(describeScene(g.s,{stage:8,region:'house'}),5).x,decorPlacement(5).x);
 const explicit=describeScene(g.s,{stage:8,region:'house',decorPositions:{5:{x:39,y:72}}});assert.equal(decor(explicit,5).x,39);
});

test('garden support and watering follow a relocated seedling',()=>{
 const g=setup();g.moveDecor(12,50,70);const pending=[],frames=[];
 const player=createScenePlayer({event:'homeActivity-garden',scene:describeScene(g.s,{region:'garden'}),reducedMotion:true,schedule:fn=>{pending.push(fn);return pending.length;},cancel:()=>{},onFrame:s=>frames.push(s)});
 player.start();pending.shift()();player.advance();pending.shift()();
 const water=frames.findLast(s=>s.action?.kind==='water');
 assert.equal(water.layers.find(l=>l.who==='yier').x,62);assert.equal(water.layers.find(l=>l.who==='bubu').x,75);
 assert.equal(water.layers.find(l=>l.key==='watering-can').x,69);player.destroy();
 g.moveDecor(12,100,100);const jobs=[],edgeFrames=[];
 const edge=createScenePlayer({event:'homeActivity-garden',scene:describeScene(g.s,{region:'garden'}),reducedMotion:true,schedule:fn=>{jobs.push(fn);return jobs.length;},cancel:()=>{},onFrame:s=>edgeFrames.push(s)});
 edge.start();jobs.shift()();edge.advance();jobs.shift()();
 const edgeWater=edgeFrames.findLast(s=>s.action?.kind==='water');
 for(const who of ['bubu','yier']){const a=edgeWater.layers.find(l=>l.who===who);assert.ok(a.x>=11&&a.x<=89&&a.y>=14&&a.y<=86);assert.ok(a.x<g.s.decorPositions[12].x);}
 edge.destroy();
});
