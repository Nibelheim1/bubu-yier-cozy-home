import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {GameEngine,freshState,clone,validateState,stockCap,levelOf} from '../src/engine.mjs';
import {CATS,CFG,CHAINS,CHAPTERS,TASKS,DECOR,REGIONS,DAILY,mass} from '../src/data.mjs';
import {spriteSpec,SPRITE_ATLAS_IDS,WORLD_ASSET_IDS} from '../src/visuals.mjs';
import {runCampaign} from './campaign.mjs';
const NOW=new Date('2026-10-07T08:00:00+08:00').getTime();
function setup(stage=24){
 const s=freshState(NOW);s.stage=stage;s.stats.build=stage;s.tutorial='done';s.introSeen=true;s.decorStyles=s.decorStyles.map((_,i)=>i<stage?0:null);s.board=s.board.map((t,i)=>i<6?t:(t?.k==='crate'&&t.openAt>stage?t:null));
 s.producerLessons=Object.fromEntries(CATS.map(c=>[c,c==='clean'||CHAINS[c].unlock<=stage]));s.tea.firstVisit=stage===24?'available':'locked';
 return new GameEngine(s,NOW);
}
const tile=(c='clean',l=1)=>({k:'item',c,l});
const boardMass=(g)=>g.s.board.reduce((n,t)=>n+mass(t),0)+g.s.storage.reduce((n,t)=>n+mass(t),0);
function fillBoard(g){for(let i=6;i<49;i++)if(g.s.board[i]===null)g.s.board[i]=tile();}

test('24 story tasks and all requirements have an unlocked source',()=>{
 assert.equal(TASKS.length,24);for(const [i,t]of TASKS.entries()){assert.equal(t.id,i);assert.equal(t.chapter,Math.floor(i/4));for(const r of t.needs){assert.ok(CHAINS[r.c].unlock<=i);assert.ok(r.l>=1&&r.l<=6);}}
});
test('new game is valid and has two matching tutorial cloths',()=>{const g=new GameEngine(null,NOW);validateState(g.s);assert.equal(g.s.board[8].l,1);assert.equal(g.s.board[9].dust,true);assert.equal(g.s.sideOrders.length,2);});
test('first loop: merge -> submit -> home build -> production',()=>{const g=new GameEngine(null,NOW);assert.ok(g.move(8,9).ok);assert.equal(g.s.tutorial,'deliver');assert.ok(g.submit('main',0).ok);assert.equal(g.s.stars,1);assert.ok(g.build(1).ok);assert.equal(g.s.stage,1);assert.ok(g.produce('clean',NOW).ok);assert.equal(g.s.tutorial,'done');validateState(g.s);});
test('same category and level merges conserve mass',()=>{const g=setup();g.s.board[7]=tile('garden',4);g.s.board[8]=tile('garden',4);const n=boardMass(g);assert.ok(g.move(7,8).ok);assert.equal(g.s.board[8].l,5);assert.equal(boardMass(g),n);assert.equal(g.s.stats.merge,1);});
test('dust is target-only, unlocks and grants exactly five coins',()=>{const g=setup();g.s.board[7]=tile();g.s.board[8]={...tile(),dust:true};const c=g.s.coins;assert.equal(g.move(8,7).ok,false);assert.ok(g.move(7,8).ok);assert.equal(g.s.board[8].dust,undefined);assert.equal(g.s.coins,c+5);});
test('different normal items exchange rather than disappear',()=>{const g=setup();g.s.board[7]=tile('tools',2);g.s.board[8]=tile('tea',3);assert.ok(g.move(7,8).ok);assert.deepEqual(g.s.board[7],tile('tea',3));assert.deepEqual(g.s.board[8],tile('tools',2));});
test('max level cannot merge and state remains unchanged',()=>{const g=setup();g.s.board[7]=tile('craft',6);g.s.board[8]=tile('craft',6);const s=clone(g.s);assert.equal(g.move(7,8).code,'MAX');assert.deepEqual(g.s,s);});
test('wrong item cannot unlock a dust tile',()=>{const g=setup();g.s.board[7]=tile('tea',1);g.s.board[8]={...tile(),dust:true};const s=clone(g.s);assert.equal(g.move(7,8).code,'DUST');assert.deepEqual(g.s,s);});
test('generators cannot be moved, sold, stored or split',()=>{const g=setup();assert.equal(g.move(0,8).ok,false);assert.equal(g.sell(0).ok,false);assert.equal(g.store(0).ok,false);assert.equal(g.split(0).ok,false);assert.equal(g.s.board[0].k,'gen');});
test('locked generator never spends energy',()=>{const g=setup(1);const n=g.s.energy;assert.equal(g.produce('garden',NOW).code,'LOCKED');assert.equal(g.s.energy,n);});
test('full board production does not spend stamina or stock',()=>{const g=setup();fillBoard(g);const e=g.s.energy,n=g.s.producers.clean.stock;assert.equal(g.produce('clean',NOW).code,'FULL');assert.equal(g.s.energy,e);assert.equal(g.s.producers.clean.stock,n);});
test('zero energy rejects production without spending stock',()=>{const g=setup();g.s.energy=0;const n=g.s.producers.clean.stock;assert.equal(g.produce('clean',NOW).code,'ENERGY');assert.equal(g.s.producers.clean.stock,n);});
test('stock exhaustion rejects atomically and recovers with time',()=>{const g=setup();g.s.producers.clean.stock=0;g.s.producers.clean.at=NOW;const e=g.s.energy;assert.equal(g.produce('clean',NOW).code,'STOCK');g.tick(NOW+6000);assert.equal(g.s.producers.clean.stock,1);assert.ok(g.produce('clean',NOW+6000).ok);assert.equal(g.s.energy,e-1);});
test('offline stamina recovery is bounded at cap and full stamina cannot bank time',()=>{const g=setup();g.s.energy=0;g.tick(NOW+24*3600*1000);assert.equal(g.s.energy,100);g.produce('clean',NOW+24*3600*1000);g.tick(NOW+24*3600*1000+1000);assert.equal(g.s.energy,99);});
test('clock reversal keeps cooldown duration sane and creates no free energy',()=>{const g=setup();g.s.energy=40;g.rest(NOW);const e=g.s.energy;g.tick(NOW-3600000);assert.equal(g.s.energy,e);assert.equal(g.s.restAt-(NOW-3600000),60000);});
test('exact-level matching includes storage and excludes dust and pending',()=>{const g=setup();g.s.board[7]=tile('tea',2);g.s.board[8]={...tile('tea',2),dust:true};g.s.storage.push(tile('tea',2));g.s.pending.push(tile('tea',2));assert.equal(g.count('tea',2),2);assert.ok(g.canFulfill([{c:'tea',l:2,n:2}]));assert.ok(!g.canFulfill([{c:'tea',l:2,n:3}]));});
test('duplicate recipe entries are aggregated before consumption',()=>{const g=setup();g.s.board[7]=tile();const n=boardMass(g);const needs=[{c:'clean',l:1,n:1},{c:'clean',l:1,n:1}];assert.equal(g.consume(needs),false);assert.equal(boardMass(g),n);});
test('submit atomically consumes all needed items across board and storage',()=>{const g=setup(6);g.s.board[7]=tile('tea',2);g.s.storage=[tile('tea',2),tile('bake',3)];const n=g.s.coins;assert.ok(g.submit('main',6).ok);assert.equal(g.s.coins,n+TASKS[6].coins);assert.equal(g.s.storage.length,0);assert.equal(g.s.board[7],null);assert.equal(g.s.stars,1);});
test('double submit cannot duplicate rewards',()=>{const g=setup(1);g.s.board[7]=tile('clean',3);assert.ok(g.submit('main',1).ok);const s=clone(g.s);assert.equal(g.submit('main',1).ok,false);assert.deepEqual(g.s,s);});
test('main build requires both the current delivery and its star',()=>{const g=setup(1);g.s.coins=0;assert.equal(g.build().code,'NEED_ORDER');g.s.board[7]=tile('clean',3);g.submit('main',1);assert.ok(g.build().ok);assert.equal(g.s.stage,2);assert.ok(g.unlocked('tools'));assert.equal(g.s.board[35],null);});
test('double build cannot skip the next task',()=>{const g=setup(1);g.s.board[7]=tile('clean',3);g.submit('main',1);g.build();const s=clone(g.s);assert.equal(g.build().ok,false);assert.deepEqual(g.s,s);});
test('side refresh is free, locked sources never appear, stale IDs rejected',()=>{const g=setup(5);for(let i=0;i<100;i++){const o=g.makeSide();assert.ok(o.needs.every(r=>g.unlocked(r.c)));}const old=g.s.sideOrders[0].id,c=g.s.coins;assert.ok(g.refreshSide(0,NOW).ok);assert.equal(g.s.coins,c);assert.equal(g.submit('side',old).code,'STALE');assert.equal(g.refreshSide(0,NOW).code,'COOLDOWN');});
test('full storage and full pending retrieval never lose an item',()=>{const g=setup();g.s.storage=Array.from({length:g.s.capacity},()=>tile());g.s.board[7]=tile('bake',4);const s=clone(g.s);assert.equal(g.store(7).code,'STORAGE_FULL');assert.deepEqual(g.s,s);g.s.pending.push(tile('garden',3));fillBoard(g);const p=clone(g.s.pending);assert.equal(g.retrieve(0,'pending').code,'FULL');assert.deepEqual(g.s.pending,p);});
test('storage upgrade stops at 24 and refuses insufficient coins',()=>{const g=setup();g.s.coins=0;assert.equal(g.expand().code,'COINS');g.s.coins=10000;while(g.s.capacity<24)assert.ok(g.expand().ok);const n=g.s.coins;assert.equal(g.expand().code,'MAX');assert.equal(g.s.coins,n);});
test('scissors conserve mass and require extra board space',()=>{const g=setup();g.s.board[7]=tile('craft',5);const n=boardMass(g),k=g.s.bag.scissors;assert.ok(g.split(7).ok);assert.equal(boardMass(g),n);assert.equal(g.s.bag.scissors,k-1);fillBoard(g);const bag=g.s.bag.scissors;assert.equal(g.split(7).code,'FULL');assert.equal(g.s.bag.scissors,bag);});
test('undo restores coins, discoveries and xp along with board state',()=>{const g=setup();g.s.board[7]=tile('garden',4);g.s.board[8]=tile('garden',4);g.s.xp=59;const s=clone(g.s);g.move(7,8);assert.equal(levelOf(g.s),2);assert.ok(g.undo(NOW).ok);assert.deepEqual(g.s,s);});
test('production invalidates older undo, preventing duplication',()=>{const g=setup();g.s.board[7]=tile();g.s.board[8]=tile();g.move(7,8);g.produce('clean',NOW);assert.equal(g.undo(NOW).code,'NO_UNDO');});
test('sale and split can be safely undone',()=>{const g=setup();g.s.board[7]=tile('tea',4);const s=clone(g.s);g.sell(7);g.undo(NOW);assert.deepEqual(g.s,s);g.split(7);g.undo(NOW);assert.deepEqual(g.s,s);});
test('sorting preserves pinned cells, every item, and all mass',()=>{const g=setup(3);g.s.board[7]=tile('tea',3);g.s.board[19]=tile('tools',2);g.s.board[28]={...tile('clean',2),dust:true};const n=boardMass(g),fixed=clone(g.s.board[28]);g.sort();assert.equal(boardMass(g),n);assert.deepEqual(g.s.board[28],fixed);assert.equal(g.s.board[0].k,'gen');assert.equal(g.s.board[48].k,'crate');});
test('daily reward and daily gift are idempotent',()=>{const g=setup();assert.ok(g.dailyGift(NOW).ok);const c=g.s.coins;assert.equal(g.dailyGift(NOW).code,'CLAIMED');assert.equal(g.s.coins,c);g.s.daily.merge=15;g.claimDaily('merge',NOW);const c2=g.s.coins;assert.equal(g.claimDaily('merge',NOW).code,'CLAIMED');assert.equal(g.s.coins,c2);});
test('next day resets daily counters; clock backwards does not reset them again',()=>{const g=setup();g.dailyGift(NOW);g.tick(NOW+86400000);assert.equal(g.s.daily.gift,false);g.dailyGift(NOW+86400000);g.tick(NOW);assert.equal(g.s.daily.gift,true);});
test('calm mode bypasses spending but not unlocks or board limits',()=>{const g=setup(1);g.s.energy=0;g.s.producers.clean.stock=0;g.setting('calm',true);assert.ok(g.produce('clean',NOW).ok);assert.equal(g.s.energy,0);assert.equal(g.s.producers.clean.stock,0);assert.equal(g.produce('garden',NOW).code,'LOCKED');fillBoard(g);assert.equal(g.produce('clean',NOW).code,'FULL');});
test('JSON export/import roundtrip preserves the complete model',()=>{const g=setup(8);g.produce('craft',NOW);g.s.seen['garden-6']=true;const parsed=validateState(JSON.parse(g.export()));assert.deepEqual(parsed,g.s);assert.deepEqual(new GameEngine(parsed,NOW).s,g.s);});
test('24 renovations are separated into three accessible regions with space left for characters',()=>{
 assert.deepEqual(REGIONS.map(r=>r.id),['house','garden','courtyard']);assert.ok(REGIONS.every(r=>r.unlock===0));
 assert.equal(DECOR.length,24);assert.deepEqual(REGIONS.map(r=>DECOR.filter(d=>d.region===r.id).length),[12,6,6]);
 for(const d of DECOR){assert.ok(REGIONS.some(r=>r.id===d.region));assert.ok(d.x>=10&&d.x<=90&&d.y>=10&&d.y<=90&&d.w>0&&d.w<70);}
});
test('legacy saves migrate home state without changing progress, inventory or the input object',()=>{
 const raw=clone(setup(13).s);delete raw.world;const before=clone(raw);const migrated=validateState(raw);
 assert.deepEqual(raw,before);assert.equal(migrated.stage,13);assert.deepEqual(migrated.board,before.board);assert.equal(migrated.world.region,'house');
 const g=new GameEngine(migrated,NOW);assert.ok(g.visitRegion('garden').ok);assert.equal(validateState(JSON.parse(g.export())).world.region,'garden');
 assert.equal(g.visitRegion('elsewhere').code,'REGION');
});
test('each home activity awards once per day, waits for real objects and resists clock reversal',()=>{
 const g=setup(1),coins=g.s.coins;for(const r of REGIONS){assert.ok(g.homeActivity(r.id,NOW).ok);const before=clone(g.s);assert.equal(g.homeActivity(r.id,NOW).code,'CLAIMED');assert.deepEqual(g.s,before);}
 assert.equal(g.s.coins,coins+24);assert.equal(g.worldProgress().totalActivities,3);assert.ok(g.worldProgress().regions.every(r=>r.activityDone));
 for(const day of [1,2])for(const r of REGIONS)assert.ok(g.homeActivity(r.id,NOW+day*86400000).ok);
 assert.equal(g.worldProgress().memoryCount,0);assert.equal(g.worldProgress().totalActivities,9);const c=g.s.coins;
 assert.equal(g.homeActivity('house',NOW).code,'CLAIMED');assert.equal(g.s.coins,c);validateState(g.s);
 const intro=new GameEngine(null,NOW);assert.equal(intro.homeActivity('house',NOW).code,'TUTORIAL');
});

test('v1.2 legacy migration keeps old memories, delivered preparations and unlocked-source lessons',()=>{
 const old=clone(setup(1).s);old.schema=1;delete old.mainPrepStep;delete old.producerLessons;delete old.tea;delete old.world.memoryUnlocked;delete old.world.souvenirs;delete old.world.equipped;
 for(const a of Object.values(old.world.activities)){a.count=3;a.day=old.daily.day;}
 const original=clone(old),g=new GameEngine(old,NOW);assert.deepEqual(old,original);assert.equal(g.s.schema,2);assert.equal(g.worldProgress().memoryCount,3);assert.equal(g.s.producerLessons.tools,false);assert.equal(g.s.coins,old.coins);assert.deepEqual(g.s.board,old.board);
 const ready=clone(setup(23).s);ready.schema=1;ready.delivered=true;ready.stars=1;delete ready.mainPrepStep;const migrated=new GameEngine(ready,NOW);assert.equal(migrated.s.mainPrepStep,3);const orders=migrated.s.stats.order;assert.ok(migrated.build().ok);assert.equal(migrated.s.stats.order,orders);assert.equal(migrated.s.tea.firstVisit,'available');validateState(migrated.s);
});

test('v1.2 successful production gates the first new-source delivery and opens tea at the garden',()=>{
 const g=setup(4);g.s.producerLessons.bake=false;g.s.board[7]=tile('bake',2);const before=clone(g.s);assert.equal(g.submit('main',4).code,'LESSON');assert.deepEqual(g.s,before);assert.equal(g.hint().c,'bake');assert.ok(g.produce('bake',NOW).lesson);assert.ok(g.submit('main',4).ok);
 const garden=setup(12);assert.equal(garden.teaOrder().available,false);garden.s.board[7]=tile('garden',2);assert.ok(garden.submit('main',12).ok);assert.ok(garden.build().ok);assert.equal(garden.teaOrder().available,true);assert.deepEqual(garden.teaOrder().participants,['bubu','yier']);
});

test('v1.2 stages 23 and 24 save preparation steps and pay full original reward exactly once',()=>{
 for(const stage of [22,23]){
  let g=setup(stage);const task=TASKS[stage];task.needs.forEach((r,i)=>g.s.board[7+i]=tile(r.c,r.l));const coins=g.s.coins,xp=g.s.xp,orders=g.s.stats.order;
  for(let phase=0;phase<task.needs.length;phase++){
   const before=clone(g.s);assert.equal(g.submit('main',stage,phase+1).code,'STALE');assert.deepEqual(g.s,before);
   const result=g.submit('main',stage,phase);assert.ok(result.ok);
   if(phase<task.needs.length-1){assert.equal(result.kind,'prepare');assert.equal(g.s.coins,coins);assert.equal(g.s.xp,xp);assert.equal(g.s.stars,0);assert.equal(g.s.stats.order,orders);g=new GameEngine(JSON.parse(g.export()),NOW);}
  }
  assert.equal(g.s.stats.order,orders+1);assert.equal(g.s.stars,1);assert.equal(g.s.coins,coins+task.coins);assert.equal(g.s.xp,xp+(stage===22?26:36));const final=clone(g.s);assert.equal(g.submit('main',stage,0).code,'STALE');assert.deepEqual(g.s,final);assert.ok(g.build().ok);assert.equal(g.s.mainPrepStep,0);validateState(g.s);
 }
});

test('v1.2 parcels preview exact target materials and reject stale or ready targets without spending',()=>{
 const g=setup(22);const q=g.quoteParcel({kind:'main',id:22,step:0},'bake');assert.ok(q.ok);assert.deepEqual(q.items.map(t=>t.l),[1,1,1,2]);const coins=g.s.coins;assert.ok(g.buy('parcel',q).ok);assert.equal(g.s.coins,coins-65);assert.deepEqual(g.s.pending,q.items);g.s.board[7]=tile('bake',6);const before=clone(g.s);assert.equal(g.buy('parcel',q).code,'READY');assert.deepEqual(g.s,before);g.submit('main',22,0);const next=clone(g.s);assert.equal(g.buy('parcel',q).code,'STALE');assert.deepEqual(g.s,next);
 const done=setup();const side=done.s.sideOrders[0];const c=side.needs[0].c,quote=done.quoteParcel({kind:'side',id:side.id},c);assert.ok(quote.ok);done.refreshSide(0,NOW);const oldCoins=done.s.coins;assert.equal(done.buy('parcel',quote).code,'STALE');assert.equal(done.s.coins,oldCoins);assert.equal(done.buy('parcel').code,'QUOTE');
});

test('v1.2 six tea choices preserve first souvenirs, rewards, result reload and one-slot equipment',()=>{
 const g=setup(13);const outcomes=[];
 // Three conditions per round: choose each plan over two cycles.
 for(let round=0;round<6;round++){
  if(round===3){g.setting('calm',true);g.s.energy=0;g.s.producers.tea.stock=0;assert.ok(g.produce('tea',NOW).ok);assert.equal(g.s.energy,0);assert.equal(g.s.producers.tea.stock,0);}
  assert.ok(g.chooseTeaPlan(round<3?'warm':'garden').ok);const order=g.teaOrder();assert.equal(order.needs.reduce((n,r)=>n+2**(r.l-1)*r.n,0),8);order.needs.forEach((r,i)=>g.s.board[7+i]=tile(r.c,r.l));const beforeOrders=g.s.stats.order,beforeCoins=g.s.coins,beforeLevel=levelOf(g.s);const result=g.submit('tea',order.id);assert.ok(result.ok);assert.equal(result.coins,28);assert.equal(result.energy,3);assert.equal(g.s.stats.order,beforeOrders+1);assert.equal(g.s.coins,beforeCoins+28+20*(levelOf(g.s)-beforeLevel));assert.deepEqual(result.result.participants,['bubu','yier']);assert.ok(result.firstSouvenir);outcomes.push(result.result);const saved=clone(g.s);assert.equal(g.submit('tea',order.id).code,'STALE');assert.deepEqual(g.s,saved);assert.deepEqual(new GameEngine(JSON.parse(g.export()),NOW).s,saved);
 }
 assert.equal(Object.keys(g.s.world.souvenirs).length,6);assert.ok(g.equipSouvenir('house','coaster-garden').ok);assert.equal(g.s.world.equipped.house,'coaster-garden');assert.equal(g.equipSouvenir('garden','coaster-warm').code,'SOUVENIR');
 g.chooseTeaPlan('warm');const repeat=g.teaOrder();repeat.needs.forEach((r,i)=>g.s.board[7+i]=tile(r.c,r.l));assert.equal(g.submit('tea',repeat.id).firstSouvenir,false);assert.deepEqual(g.s.world.souvenirs['coaster-warm'],outcomes[0]);validateState(g.s);
 const ready=setup();const coins=ready.s.coins,orders=ready.s.stats.order;assert.ok(ready.beginFirstVisit().ok);assert.equal(ready.s.tea.firstVisit,'arrived');assert.ok(ready.teaOrder().participants.includes('xiaoli'));assert.equal(ready.beginFirstVisit().code,'ARRIVED');assert.equal(ready.s.coins,coins);assert.equal(ready.s.stats.order,orders);validateState(ready.s);
});

test('v1.2 living conditions unlock an already-earned memory without another daily reward',()=>{
 const g=setup(6);g.s.world.activities.house={count:3,day:g.s.daily.day};assert.equal(g.worldProgress().memories[0].unlocked,false);g.s.board[7]=tile('tea',2);g.s.board[8]=tile('tea',2);g.s.board[9]=tile('bake',3);g.submit('main',6);const coins=g.s.coins;const result=g.build();assert.ok(result.memories.includes('house'));assert.equal(g.worldProgress().memories[0].unlocked,true);assert.equal(g.s.coins,coins);assert.equal(g.s.world.activities.house.count,3);
});

test('v1.2 result snapshots freeze equipment and preparation stages choose their actual area',()=>{
 const g=setup(13),order=g.teaOrder();order.needs.forEach((r,i)=>g.s.board[7+i]=tile(r.c,r.l));const result=g.submit('tea',order.id).result;
 assert.deepEqual(result.equipped,{house:'coaster-warm',garden:null,courtyard:null});assert.deepEqual(g.s.world.souvenirs['coaster-warm'].equipped,result.equipped);g.s.world.equipped.house=null;assert.equal(g.s.tea.lastResult.equipped.house,'coaster-warm');assert.deepEqual(new GameEngine(JSON.parse(g.export()),NOW).s.tea.lastResult.equipped,result.equipped);
 const older=clone(g.s);delete older.tea.lastResult.equipped;delete older.world.souvenirs['coaster-warm'].equipped;older.world.equipped.house='coaster-warm';const migrated=validateState(older);assert.deepEqual(migrated.tea.lastResult.equipped,{house:null,garden:null,courtyard:null});assert.equal(older.tea.lastResult.equipped,undefined);
 const prep=setup(23);TASKS[23].needs.forEach((r,i)=>prep.s.board[7+i]=tile(r.c,r.l));const first=prep.submit('main',23,0);assert.equal(first.region,'garden');assert.equal(prep.s.world.region,'garden');const next=prep.submit('main',23,1);assert.equal(next.region,'courtyard');assert.equal(prep.s.world.region,'courtyard');const last=prep.submit('main',23,2);assert.equal(last.region,'courtyard');assert.equal(prep.s.stats.order,1);assert.equal(prep.s.stars,1);
 const visit=setup();assert.deepEqual(visit.beginFirstVisit().result.equipped,visit.s.world.equipped);
});
test('side hints follow the visible order and remain useful after the campaign',()=>{
 const g=setup(1);g.s.sideOrders[0].needs=[{c:'clean',l:3,n:1}];g.s.sideOrders[1].needs=[{c:'clean',l:2,n:1}];g.s.board[7]=tile('clean',2);g.s.delivered=true;g.s.stars=1;
 assert.equal(g.hint().kind,'build');assert.deepEqual(g.hint('side'),{kind:'submit',orderKind:'side',id:g.s.sideOrders[1].id});
 const done=setup();done.s.sideOrders.forEach(o=>o.needs=[{c:'tools',l:3,n:1}]);assert.equal(done.hint().c,'tools');
 done.s.board[7]=tile('tools',2);done.s.board[8]=tile('tools',2);assert.equal(done.hint('side').kind,'merge');
});
test('first newly unlocked source chapter gifts require a player merge',()=>{
 for(const [stage,c]of [[3,'bake'],[7,'craft'],[11,'garden']]){const g=setup(stage);g.s.delivered=true;g.s.stars=1;assert.ok(g.build().ok);assert.deepEqual(g.s.pending,[tile(c,1),tile(c,1)]);assert.equal(g.canFulfill(TASKS[stage+1].needs),false);validateState(g.s);}
});
test('chapter gifts survive a full parcel queue and refill it after retrieval',()=>{
 const g=setup(3);g.s.pending=Array.from({length:1000},()=>tile());g.s.delivered=true;g.s.stars=1;assert.ok(g.build().ok);
 assert.equal(g.s.pending.length,1000);assert.deepEqual(g.s.world.chapterGifts,[tile('bake',1),tile('bake',1)]);validateState(JSON.parse(g.export()));
 assert.ok(g.retrieve(0,'pending').ok);assert.equal(g.s.pending.length,1000);assert.equal(g.s.world.chapterGifts.length,1);assert.deepEqual(g.s.pending.at(-1),tile('bake',1));
 assert.ok(g.undo(NOW).ok);assert.equal(g.s.world.chapterGifts.length,2);assert.equal(g.s.pending.length,1000);validateState(g.s);
 const old=clone(g.s);old.pending.push(...old.world.chapterGifts);delete old.world;const imported=validateState(old);
 assert.equal(old.pending.length,1002);assert.equal(imported.pending.length,1000);assert.deepEqual(imported.world.chapterGifts,[tile('bake',1),tile('bake',1)]);
});
test('malformed imports, forged board sizes, missing producers and invalid currency rejected',()=>{const g=setup();for(const change of [s=>s.schema=999,s=>s.board.pop(),s=>s.coins=-1,s=>s.energy=Infinity,s=>delete s.producers.clean,s=>s.board[0]=null,s=>s.decorStyles=[],s=>s.stars=5,s=>s.storage=Array(25).fill(tile()),s=>s.sideOrders[0].id=s.sideOrders[1].id]){const s=clone(g.s);change(s);assert.throws(()=>validateState(s));}assert.throws(()=>validateState(null));});
test('runtime atlases, world art and dialogue poses exist for every declared gameplay object',()=>{
 const root=new URL('../public/assets/',import.meta.url);
 const assets=new Set([...SPRITE_ATLAS_IDS,...WORLD_ASSET_IDS,...REGIONS.map(r=>r.background)]);
 const gameplayIds=[...CATS.flatMap(c=>[`gen-${c}`,...Array.from({length:6},(_,i)=>`${c}-${i+1}`)]),...TASKS.map(t=>t.decor)];
 for(const id of gameplayIds){const spec=spriteSpec(id);assert.ok(spec,`Missing runtime sprite: ${id}`);assets.add(spec.asset);}
 for(const t of TASKS)for(const [who,pose]of t.after)assets.add(`${who}-${pose}`);
 for(const chapter of CHAPTERS)for(const pose of chapter.pose)assets.add(pose);
 for(const id of assets)assert.ok(fs.existsSync(new URL(`${id}.png`,root)),`Missing runtime art: ${id}`);
});
test('built standalone retains double-dollar selectors verbatim',()=>{const path=new URL('../release/好日子小屋_双击即玩.html',import.meta.url);if(!fs.existsSync(path))return;const html=fs.readFileSync(path,'utf8');assert.ok(html.includes('const $$=(s,root=document)'));assert.ok(html.includes('window.__OFFLINE_SINGLE__=true'));assert.ok(!html.includes('<!--SCRIPT-->'));});
test('complete standard campaign includes source lessons and all preparation phases through legal actions',()=>{const r=runCampaign(20261007,{collectAll:false});assert.equal(r.renovations,24);assert.equal(r.orders,24);assert.ok(CATS.every(c=>r.final.producerLessons[c]));assert.equal(r.final.tea.firstVisit,'available');validateState(r.final);assert.ok(r.energy>=0);assert.ok(r.coins>=0);});
