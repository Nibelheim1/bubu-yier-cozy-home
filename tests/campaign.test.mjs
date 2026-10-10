import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine,freshState,validateState,levelOf} from '../src/engine.mjs';
import {CATS,CFG,TASKS,needMass,orderXP} from '../src/data.mjs';
import {CAMPAIGN_CHAPTERS,CAMPAIGN_TASKS,CAMPAIGN_SIDE_MASS,campaignSideTier} from '../src/campaign.mjs';

function completedHome(){
 const s=freshState(1000);s.stage=24;s.stats.build=24;s.decorStyles.fill(0);s.board=s.board.map((t,i)=>i<6?t:null);
 s.tutorial='done';s.tea.firstVisit='available';s.producerLessons=Object.fromEntries(CATS.map(c=>[c,true]));return new GameEngine(s,1000);
}
function supply(g,needs=g.mainOrder().needs){
 g.s.board=g.s.board.map((t,i)=>i<6?t:null);g.s.storage=[];let i=6;
 for(const r of needs)for(let n=0;n<r.n;n++){assert.ok(i<49,'current phase must fit on the unlocked board');g.s.board[i++]={k:'item',c:r.c,l:r.l};}
}
function submitPhase(g){const o=g.mainOrder();supply(g,o.needs);return g.submit('main',o.id,o.phase);}

test('old saves migrate missing campaign fields without mutating the source or saved side orders',()=>{
 const g=completedHome(),old=structuredClone(g.s);delete old.campaign;delete old.sideCompleted;
 // These are genuine pre-extension orders, retained even though their saved stage is now 24.
 const early=new GameEngine(null,1000);old.sideOrders=structuredClone(early.s.sideOrders);old.sideSerial=early.s.sideSerial;
 const out=validateState(old);assert.deepEqual(out.campaign,{completed:0,step:0});assert.equal(out.sideCompleted,0);assert.equal(old.campaign,undefined);
 assert.deepEqual(out.sideOrders,old.sideOrders);assert.deepEqual(new GameEngine(old,1000).s.sideOrders,old.sideOrders);assert.equal(out.schema,2);assert.equal(out.economyVersion,CFG.economyVersion);
});

test('malformed campaign steps, premature progress and side completion records are rejected',()=>{
 const s=completedHome().s;
 for(const campaign of [null,[],{}, {completed:-1,step:0},{completed:73,step:0},{completed:0,step:3},{completed:72,step:1},{completed:0,step:0,extra:1}])assert.throws(()=>validateState({...s,campaign}),/扩展主线/);
 assert.throws(()=>validateState({...freshState(1000),campaign:{completed:1,step:0}}),/扩展主线/);
 for(const sideCompleted of [-1,1.5,100000001])assert.throws(()=>validateState({...s,sideCompleted}),/循环委托/);
 assert.deepEqual(validateState({...s,campaign:{completed:72,step:0}}).campaign,{completed:72,step:0});
});

test('old renovation order contract and new current-phase/full-remaining requirements coexist',()=>{
 const early=new GameEngine(null,1000);assert.equal(early.mainOrder().renovation,true);assert.equal(early.mainOrder().expanded,undefined);
 const g=completedHome();g.s.campaign.completed=CAMPAIGN_TASKS.findIndex(t=>t.steps.length===3);
 const o=g.mainOrder(),spec=CAMPAIGN_TASKS[g.s.campaign.completed];assert.equal(o.id,24+g.s.campaign.completed);assert.equal(o.expanded,true);assert.equal(o.renovation,false);
 assert.deepEqual(o.needs,spec.steps[0].needs);assert.deepEqual(o.fullNeeds,spec.needs);assert.equal(needMass(o.remainingNeeds),needMass(spec.needs));assert.equal(o.totalPhases,3);
});

test('preparation consumes exactly one phase without awarding coins, XP, stars or moving bears',()=>{
 const g=completedHome();g.s.campaign.completed=CAMPAIGN_TASKS.findIndex(t=>t.steps.length>1);g.s.residents.yier.region='garden';
 const before={coins:g.s.coins,xp:g.s.xp,energy:g.s.energy,stars:g.s.stars,world:g.s.world.region,residents:structuredClone(g.s.residents),orders:g.s.stats.order};
 const result=submitPhase(g);assert.equal(result.ok,true);assert.equal(result.kind,'prepare');assert.equal(result.expanded,true);assert.equal(g.s.campaign.step,1);
 assert.deepEqual({coins:g.s.coins,xp:g.s.xp,energy:g.s.energy,stars:g.s.stars,world:g.s.world.region,residents:g.s.residents,orders:g.s.stats.order},before);
 assert.equal(g.s.board.filter(t=>t?.k==='item').length,0);assert.equal(result.coins,undefined);assert.equal(result.xp,undefined);
});

test('a partially delivered main order resumes from its saved step and rejects stale submission',()=>{
 const g=completedHome();g.s.campaign.completed=CAMPAIGN_TASKS.findIndex(t=>t.steps.length===3);const original=g.mainOrder();submitPhase(g);
 const restored=new GameEngine(JSON.parse(g.export()).state,1000);assert.equal(restored.mainOrder().phase,1);assert.deepEqual(restored.mainOrder().needs,CAMPAIGN_TASKS[g.s.campaign.completed].steps[1].needs);
 supply(restored);const before=JSON.stringify(restored.s);assert.equal(restored.submit('main',original.id,0).code,'STALE');assert.equal(JSON.stringify(restored.s),before);
 assert.equal(needMass(restored.mainOrder().remainingNeeds),needMass(original.fullNeeds)-needMass(original.needs));
});

test('expanded final delivery awards once, creates no furniture star and advances to the next ID',()=>{
 const g=completedHome();g.s.xp=1000000;g.s.energy=13;g.s.campaign.completed=CAMPAIGN_TASKS.findIndex(t=>t.steps.length===3);const spec=CAMPAIGN_TASKS[g.s.campaign.completed];
 const before={coins:g.s.coins,xp:g.s.xp,build:g.s.stats.build,styles:structuredClone(g.s.decorStyles),chapterGifts:structuredClone(g.s.world.chapterGifts)};
 let result;for(let i=0;i<spec.steps.length;i++)result=submitPhase(g);
 assert.equal(result.kind,'submit');assert.equal(result.expanded,true);assert.deepEqual(result.campaignTask,spec);assert.equal(g.s.coins,before.coins+spec.coins);assert.equal(g.s.xp,before.xp+spec.xp);
 assert.equal(g.s.energy,13);assert.equal(g.s.stars,0);assert.equal(g.s.delivered,false);assert.equal(g.s.stage,24);assert.equal(g.s.stats.build,before.build);assert.deepEqual(g.s.decorStyles,before.styles);assert.deepEqual(g.s.world.chapterGifts,before.chapterGifts);
 assert.equal(g.s.campaign.step,0);assert.equal(g.mainOrder().id,spec.id+1);const snapshot=JSON.stringify(g.s);assert.equal(g.submit('main',spec.id,spec.steps.length-1).code,'STALE');assert.equal(JSON.stringify(g.s),snapshot);assert.equal(g.build().code,'FINISHED');
});

test('expanded main hint remains main and includes the step even for a one-phase task',()=>{
 const g=completedHome(),o=g.mainOrder();supply(g);
 assert.deepEqual(g.hint('main'),{kind:'submit',orderKind:'main',id:o.id,step:o.phase});
 const before=JSON.stringify(g.s);assert.equal(g.submit('main',o.id).code,'STALE');assert.equal(JSON.stringify(g.s),before);
});

test('parcel quotes bind to the expanded order ID and exact step',()=>{
 const g=completedHome();g.s.campaign.completed=CAMPAIGN_TASKS.findIndex(t=>t.steps.length===3);const o=g.mainOrder();
 const target={kind:'main',id:o.id,step:o.phase};const quote=g.quoteParcel(target,o.needs[0].c);assert.equal(quote.ok,true);assert.equal(quote.targetName,o.name);
 assert.equal(g.quoteParcel({kind:'main',id:o.id},o.needs[0].c).code,'STALE');submitPhase(g);assert.equal(g.buy('parcel',quote).code,'STALE');
 assert.equal(g.quoteParcel({kind:'main',id:o.id,step:1},g.mainOrder().needs[0].c).ok,true);
});

test('the final campaign closes cleanly while side orders remain available indefinitely',()=>{
 const g=completedHome();g.s.campaign.completed=CAMPAIGN_TASKS.length-1;let result;while(g.mainOrder())result=submitPhase(g);
 assert.equal(result.finished,true);assert.equal(result.chapterDone,true);assert.equal(g.mainOrder(),null);assert.equal(g.submit('main',95,2).code,'FINISHED');
 const p=g.progress();assert.equal(p.baseDone,24);assert.equal(p.expandedDone,72);assert.equal(p.completed,96);assert.equal(p.total,96);assert.equal(p.finished,true);
 supply(g,g.s.sideOrders[0].needs);assert.equal(g.hint('main').orderKind,'side');assert.equal(new GameEngine(g.s,1000).mainOrder(),null);
});

test('cyclic side slots keep their short/long budgets when refreshed; refresh never increments progress',()=>{
 const g=completedHome();g.s.xp=18000;g.s.sideCompleted=14;g.s.sideOrders=[g.makeSide(0),g.makeSide(1)];
 const before=g.s.sideOrders.map(o=>({mass:o.mass,slot:o.slot,loop:o.loop,tier:o.tier}));
 assert.ok(before[1].mass>before[0].mass);for(const slot of [0,1])assert.equal(g.refreshSide(slot,1000).ok,true);
 assert.equal(g.s.sideCompleted,14);assert.deepEqual(g.s.sideOrders.map(o=>({mass:o.mass,slot:o.slot,loop:o.loop,tier:o.tier})),before);assert.equal(g.refreshSide(0,1001).code,'COOLDOWN');
 assert.deepEqual(new GameEngine(g.s,1000).s.sideOrders,g.s.sideOrders);
});

test('successful side deliveries advance the loop without changing the other slot or giving direct energy',()=>{
 const g=completedHome();g.s.xp=1000000;g.s.energy=17;g.s.sideCompleted=11;g.s.sideOrders=[g.makeSide(0),g.makeSide(1)];const other=structuredClone(g.s.sideOrders[1]),old=g.s.sideOrders[0];
 supply(g,old.needs);const result=g.submit('side',old.id);assert.equal(result.ok,true);assert.equal(g.s.sideCompleted,12);assert.equal(g.s.sideOrders[0].loop,2);assert.equal(g.s.sideOrders[0].slot,0);assert.deepEqual(g.s.sideOrders[1],other);assert.equal(g.s.energy,17);
 assert.equal(g.submit('side',old.id).code,'STALE');assert.equal(g.s.sideCompleted,12);assert.equal(validateState(g.s).sideCompleted,12);
});

test('loop metadata, forged rewards, altered budgets and inaccessible materials cannot load',()=>{
 const s=completedHome().s;
 for(const patch of [{slot:1},{loop:2},{tier:5},{completedAt:1},{levelAt:99},{mass:999},{xp:999},{coins:999}]){const bad=structuredClone(s);Object.assign(bad.sideOrders[0],patch);assert.throws(()=>validateState(bad),/循环委托|订单奖励/);}
 const bad=structuredClone(s);bad.sideOrders[0].needs[0].n++;assert.throws(()=>validateState(bad),/订单内容|材料预算/);
 const duplicate=structuredClone(s),rows=duplicate.sideOrders[0].needs,index=rows.findIndex(r=>r.l>=4),r=rows[index];
 rows.splice(index,1,{...r,l:r.l-1},{...r,l:r.l-1});assert.equal(needMass(rows),s.sideOrders[0].mass);assert.throws(()=>validateState(duplicate),/循环委托材料预算/);
 const lowLevel=structuredClone(s),low=lowLevel.sideOrders[0].needs.find(r=>r.l===3&&r.n===1);low.l=2;low.n=2;
 assert.equal(needMass(lowLevel.sideOrders[0].needs),s.sideOrders[0].mass);assert.throws(()=>validateState(lowLevel),/循环委托材料预算/);
 const early=new GameEngine(null,1000).s;early.sideOrders[0].needs[0].c='garden';assert.throws(()=>validateState(early),/邻里订单内容/);
 const forged=completedHome().s;delete forged.sideOrders[0].loop;assert.throws(()=>validateState(forged),/订单附加/);
});

test('all recurring tiers preserve exact budgets and legal recipes across deterministic variations',()=>{
 const g=completedHome();for(const level of [1,18,26,34,42,50,99]){
  g.s.xp=0;for(let l=1;l<level;l++)g.s.xp+=30+12*(l-1)+20*Math.floor((l-1)/10);
  for(const completed of [0,1,2,11,12,29]){g.s.sideCompleted=completed;for(const slot of [0,1]){
   const o=g.makeSide(slot),tier=campaignSideTier(level);assert.equal(o.tier,tier);assert.equal(needMass(o.needs),CAMPAIGN_SIDE_MASS[tier][slot]+(slot===0?4:8)*(completed%3));assert.ok(o.needs.length<=9);assert.ok(o.needs.every(r=>CATS.includes(r.c)&&r.l>=3&&r.l<=6&&r.n>=1&&r.n<=3));assert.equal(o.xp,orderXP(o.needs));
  }}
 }
});

test('96 main tasks provide enough XP for level 50, with rising complete-order difficulty and no invalid phases',()=>{
 assert.equal(CAMPAIGN_CHAPTERS.length,9);assert.equal(CAMPAIGN_TASKS.length,72);
 let totalXP=TASKS.reduce((n,t)=>n+t.xp,0)+24*CFG.buildXP;
 for(let i=0;i<CAMPAIGN_TASKS.length;i++){
  const t=CAMPAIGN_TASKS[i];assert.equal(t.id,24+i);assert.equal(t.chapter,Math.floor(i/8));assert.ok(t.steps.length>=1&&t.steps.length<=3);assert.equal(needMass(t.needs),needMass(t.steps.flatMap(s=>s.needs)));assert.ok(t.needs.every(r=>CATS.includes(r.c)&&r.l>=1&&r.l<=6&&r.n>=1&&r.n<=3));assert.ok(t.steps.every(s=>s.needs.reduce((n,r)=>n+r.n,0)<=15));totalXP+=t.xp;
 }
 assert.ok(levelOf({xp:totalXP})>=50);assert.ok(needMass(CAMPAIGN_TASKS.at(-1).needs)>100);assert.ok(needMass(CAMPAIGN_TASKS[64].needs)>needMass(CAMPAIGN_TASKS[0].needs));
});
