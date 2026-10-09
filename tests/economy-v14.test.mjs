import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine,freshState,validateState,clone,levelOf,levelProgress,levelCost,levelReward,levelGift} from '../src/engine.mjs';
import {CATS,CHAINS,CFG,TASKS,DAILY,REGIONS,needMass,orderXP} from '../src/data.mjs';
const NOW=new Date('2026-10-09T10:00:00+08:00').getTime();
const item=(c='clean',l=1)=>({k:'item',c,l});
const xpAt=level=>Array.from({length:level-1},(_,i)=>levelCost(i+1)).reduce((a,b)=>a+b,0);
function setup(stage=1){const s=freshState(NOW);s.stage=stage;s.stats.build=stage;s.tutorial='done';s.decorStyles=s.decorStyles.map((_,i)=>i<stage?0:null);s.board=s.board.map((t,i)=>i<6?t:t?.k==='crate'&&t.openAt>stage?t:null);s.producerLessons=Object.fromEntries(CATS.map(c=>[c,CHAINS[c].unlock<=stage]));s.tea.firstVisit=stage===24?'available':'locked';return new GameEngine(s,NOW);}
function supply(g,needs){let i=7;for(const r of needs)for(let n=0;n<r.n;n++)g.s.board[i++]=item(r.c,r.l);}

test('experience costs increase with level and progress has exact boundaries',()=>{
 for(let l=1;l<99;l++){assert.equal(levelOf({xp:xpAt(l)}),l);assert.equal(levelOf({xp:xpAt(l+1)-1}),l);assert.ok(levelCost(l+1)>levelCost(l));}
 assert.deepEqual(levelProgress({xp:29}),{level:1,current:29,required:30,next:2,total:0});assert.equal(levelProgress({xp:30}).current,0);assert.equal(levelProgress({xp:100000000}).next,null);
 assert.equal(TASKS.reduce((a,t)=>a+t.xp+CFG.buildXP,0),715);assert.equal(levelOf({xp:715}),10);
});

test('level rewards follow the reached-level tier and never exceed stamina 100',()=>{
 const g=setup();g.s.energy=0;let coins=g.s.coins;
 for(const [from,to] of [[1,5],[5,10],[10,20],[20,40],[40,42]]){g.s.xp=xpAt(from);g.s.energy=0;coins=g.s.coins;assert.equal(g.gainXP(xpAt(to)-g.s.xp),to-from);const rewards=Array.from({length:to-from},(_,i)=>levelReward(from+i+1));assert.equal(g.s.energy,Math.min(100,rewards.reduce((a,r)=>a+r.energy,0)));assert.equal(g.s.coins-coins,rewards.reduce((a,r)=>a+r.coins,0));}
 g.s.energy=99;g.s.xp=xpAt(2)-1;g.gainXP(1);assert.equal(g.s.energy,100);const before=clone(g.s);assert.equal(g.gainXP(-5),0);assert.deepEqual(g.s,before);
});

test('natural recovery is 100 seconds, capped, and full stamina cannot bank recovery',()=>{
 const g=setup();assert.equal(CFG.energyEvery,100000);assert.equal(CFG.energyCap,100);g.s.energy=0;g.tick(NOW+99999);assert.equal(g.s.energy,0);g.tick(NOW+100000);assert.equal(g.s.energy,1);g.tick(NOW+200000);assert.equal(g.s.energy,2);
 g.tick(NOW+20000000);assert.equal(g.s.energy,100);assert.ok(g.produce('clean',NOW+20000000).ok);g.tick(NOW+20099999);assert.equal(g.s.energy,99);g.tick(NOW+20100000);assert.equal(g.s.energy,100);
 g.s.energy=1000;g.tick(NOW+20100000);assert.equal(g.s.energy,100);g.s.energy=0;g.tick(NOW);assert.equal(g.s.energy,0);assert.equal(g.energyWait(NOW),100);
});

test('daily, regional, order and chapter rewards cannot add stamina',()=>{
 const g=setup(15);g.s.xp=xpAt(99);g.s.energy=0;g.s.energyAt=NOW;
 assert.ok(g.dailyGift(NOW).ok);for(const d of DAILY){g.s.daily[d.key]=d.target;assert.ok(g.claimDaily(d.key,NOW).ok);}for(const r of REGIONS)assert.ok(g.homeActivity(r.id,NOW).ok);
 let o=g.s.sideOrders[0];supply(g,o.needs);assert.ok(g.submit('side',o.id).ok);o=g.teaOrder();supply(g,o.needs);assert.ok(g.submit('tea',o.id).ok);o=g.mainOrder();supply(g,o.needs);assert.ok(g.submit('main',o.id).ok);assert.ok(g.build(0).ok);assert.equal(g.s.stage,16);assert.equal(g.s.energy,0);assert.ok(g.s.bag.scissors>3);
 assert.ok(TASKS.every(t=>!Object.hasOwn(t,'energy')));assert.ok(DAILY.every(t=>!Object.hasOwn(t,'energy')));assert.ok(REGIONS.every(t=>!Object.hasOwn(t,'energy')));assert.equal(g.addEnergy,undefined);
});

test('energy purchase, food, free rest, calm mode and undo are unavailable',()=>{
 const g=setup();g.s.energy=0;const before=clone(g.s);
 for(const r of [g.buy('energy'),g.usePack(),g.rest(NOW),g.setting('calm',true),g.undo(NOW)])assert.equal(r.ok,false);
 assert.deepEqual(g.s,before);assert.equal(g.undoState,undefined);assert.equal(g.snapshot,undefined);assert.equal(g.s.settings.calm,undefined);assert.equal(g.s.bag.energyPacks,undefined);assert.equal(g.produce('clean',NOW).code,'ENERGY');
});

test('only matching drag targets merge; invalid drops leave the complete state unchanged',()=>{
 const g=setup();g.s.board[7]=item();g.s.board[8]=item('tools');
 for(const to of [8,9,0,35]){const before=clone(g.s);assert.equal(g.move(7,to).ok,false);assert.deepEqual(g.s,before);}
 g.s.board[8]=item();const xp=g.s.xp;assert.ok(g.move(7,8).ok);assert.deepEqual(g.s.board[8],item('clean',2));assert.equal(g.s.board[7],null);assert.equal(g.s.xp,xp);assert.equal(g.undo().ok,false);
});

test('five-level gifts use unlocked sources, scale modestly, and are once-only across reload',()=>{
 const g=setup(4);g.s.xp=xpAt(10);g.s.energy=12;
 const five=levelGift(5,4),ten=levelGift(10,4);assert.equal(five.coins,80);assert.equal(ten.coins,120);assert.equal(five.items[0].l,2);assert.equal(ten.items[0].l,3);assert.ok(five.items.every(t=>t.c==='bake'));assert.equal(levelGift(4,4),null);assert.equal(levelGift(100,4),null);
 const beforeCoins=g.s.coins;assert.ok(g.claimLevelGift(5).ok);assert.equal(g.s.coins,beforeCoins+80);assert.equal(g.s.energy,12);assert.deepEqual(g.s.levelGiftsClaimed,[5]);const before=clone(g.s);assert.equal(g.claimLevelGift(5).code,'CLAIMED');assert.deepEqual(g.s,before);
 const loaded=new GameEngine(JSON.parse(g.export()),NOW);assert.equal(loaded.claimLevelGift(5).code,'CLAIMED');assert.ok(loaded.claimLevelGift(10).ok);assert.equal(loaded.claimLevelGift(15).code,'LEVEL');assert.deepEqual(loaded.s.levelGiftsClaimed,[5,10]);
});

test('a full parcel queue preserves an unclaimed gift without spending or losing its contents',()=>{
 const g=setup();g.s.xp=xpAt(5);g.s.pending=Array.from({length:999},()=>item());const before=clone(g.s);assert.equal(g.claimLevelGift(5).code,'QUEUE');assert.deepEqual(g.s,before);g.s.pending.pop();assert.ok(g.claimLevelGift(5).ok);assert.equal(g.s.pending.length,1000);assert.deepEqual(g.s.levelGiftsClaimed,[5]);
});

test('legacy experience preserves level and progress; old packs convert once without replaying upgrades',()=>{
 const old=freshState(NOW);delete old.economyVersion;delete old.levelGiftsClaimed;old.xp=270;old.energy=180;old.bag.energyPacks=3;old.settings.calm=true;old.restAt=NOW;const original=clone(old);
 const migrated=validateState(old);assert.deepEqual(old,original);assert.equal(levelOf(migrated),5);assert.equal(levelProgress(migrated).current,Math.floor(levelCost(5)/2));assert.equal(migrated.energy,100);assert.equal(migrated.coins,old.coins+60);assert.equal(migrated.economyVersion,1);assert.equal(migrated.bag.energyPacks,undefined);assert.equal(migrated.settings.calm,undefined);assert.equal(migrated.restAt,undefined);assert.deepEqual(migrated.levelGiftsClaimed,[]);
 assert.deepEqual(validateState(migrated),migrated);const g=new GameEngine(migrated,NOW);assert.equal(g.s.coins,migrated.coins);assert.ok(g.claimLevelGift(5).ok);assert.equal(new GameEngine(JSON.parse(g.export()),NOW).claimLevelGift(5).code,'CLAIMED');
});

test('gift records reject duplicate, future-level and non-milestone claims',()=>{
 const g=setup();g.s.xp=xpAt(5);for(const records of [[5,5],[10],[4],[100]]){const s=clone(g.s);s.levelGiftsClaimed=records;assert.throws(()=>validateState(s));}
 assert.equal(orderXP([{c:'clean',l:6,n:1}]),20);for(const o of g.s.sideOrders){assert.equal(o.coins,8+2*needMass(o.needs));assert.equal(o.xp,orderXP(o.needs));}
});

