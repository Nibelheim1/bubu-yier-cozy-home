import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine,freshState,validateState,clone} from '../src/engine.mjs';
import {CATS,CHAINS} from '../src/data.mjs';
import {describeScene,renderSceneHTML,freezeScene} from '../src/scenes.mjs';

const NOW=new Date('2026-10-10T08:00:00+08:00').getTime();
function setup(stage=24){
 const s=freshState(NOW);s.stage=stage;s.stats.build=stage;s.tutorial='done';s.introSeen=true;
 s.decorStyles=s.decorStyles.map((_,i)=>i<stage?0:null);
 s.board=s.board.map((t,i)=>i<6?t:t?.k==='crate'&&t.openAt>stage?t:null);
 s.producerLessons=Object.fromEntries(CATS.map(c=>[c,c==='clean'||CHAINS[c].unlock<=stage]));
 s.tea.firstVisit=stage===24?'available':'locked';return new GameEngine(s,NOW);
}

test('furniture storage survives export and restore retains layout, style and progress',()=>{
 const g=setup();assert.ok(g.moveDecor(7,34,65).ok);assert.ok(g.redecorate(7,1).ok);
 const before=clone(g.s);assert.ok(g.storeDecor(7).ok);
 assert.deepEqual(g.s,{...before,hiddenDecor:[7]});
 const saved=new GameEngine(JSON.parse(g.export()),NOW);
 assert.deepEqual(saved.s.hiddenDecor,[7]);assert.equal(saved.moveDecor(7,50,50).code,'STORED');
 assert.equal(saved.storeDecor(7).code,'STORED');assert.ok(saved.restoreDecor(7).ok);
 assert.deepEqual(saved.s.decorPositions[7],before.decorPositions[7]);assert.equal(saved.s.decorStyles[7],1);
 assert.deepEqual(saved.s.hiddenDecor,[]);assert.equal(saved.restoreDecor(7).code,'VISIBLE');
 assert.equal(saved.s.stage,before.stage);assert.deepEqual(saved.s.campaign,before.campaign);validateState(saved.s);
});

test('old saves default to no hidden furniture and malformed hidden lists reject',()=>{
 const g=setup(4),old=clone(g.s);delete old.hiddenDecor;
 assert.deepEqual(validateState(old).hiddenDecor,[]);assert.equal(old.hiddenDecor,undefined);
 for(const list of [[0,0],[4],[-1],['0'],null])assert.throws(()=>validateState({...g.s,hiddenDecor:list}),/家具收纳记录/);
 const before=clone(g.s);assert.equal(g.storeDecor(4).code,'DECOR');assert.equal(g.restoreDecor(4).code,'DECOR');
 assert.deepEqual(g.s,before);
});

test('current DOM and photo descriptors omit hidden furniture while historic replay stays visible',()=>{
 const g=setup();assert.ok(g.storeDecor(7).ok);
 const scene=describeScene(g.s,{region:'house',characters:false,interactive:true});
 assert.ok(!scene.layers.some(l=>l.decorId===7));assert.ok(!renderSceneHTML(scene).includes('data-id="7"'));
 const photo=freezeScene(scene);assert.ok(g.restoreDecor(7).ok);
 assert.ok(!photo.layers.some(l=>l.decorId===7));assert.deepEqual(photo.hiddenDecor,[7]);
 assert.ok(describeScene(g.s,{region:'house',characters:false}).layers.some(l=>l.decorId===7));
 assert.ok(g.storeDecor(7).ok);
 assert.ok(describeScene(g.s,{region:'house',stage:24,replay:true,characters:false}).layers.some(l=>l.decorId===7));
});

test('tea and souvenir snapshots retain their own furniture visibility and migrate old snapshots',()=>{
 const g=setup();assert.ok(g.storeDecor(7).ok);
 const order=g.teaOrder(),record=g.resultContext(order);
 g.s.tea.lastResult=clone(record);g.s.world.souvenirs[order.souvenirKey]=clone(record);
 assert.ok(g.restoreDecor(7).ok);
 const replay=describeScene(g.s,{teaResult:record,region:'house',characters:false});
 assert.ok(!replay.layers.some(l=>l.decorId===7));assert.deepEqual(record.hiddenDecor,[7]);
 const saved=validateState(g.s);assert.deepEqual(saved.tea.lastResult.hiddenDecor,[7]);
 assert.deepEqual(saved.world.souvenirs[order.souvenirKey].hiddenDecor,[7]);
 delete saved.tea.lastResult.hiddenDecor;delete saved.world.souvenirs[order.souvenirKey].hiddenDecor;
 assert.ok(g.storeDecor(7).ok);saved.hiddenDecor=[7];
 const migrated=validateState(saved);assert.deepEqual(migrated.tea.lastResult.hiddenDecor,[]);
 assert.deepEqual(migrated.world.souvenirs[order.souvenirKey].hiddenDecor,[]);
 assert.ok(describeScene(g.s,{teaResult:migrated.tea.lastResult,region:'house',characters:false}).layers.some(l=>l.decorId===7));
 saved.tea.lastResult.hiddenDecor=[24];assert.throws(()=>validateState(saved),/家具收纳展示快照/);
});
