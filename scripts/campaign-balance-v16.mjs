import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GameEngine,freshState,validateState,clone,levelOf,levelCost} from '../src/engine.mjs';
import {VERSION,CFG,CATS,TASKS,DAILY,needMass,mass} from '../src/data.mjs';
import {CAMPAIGN_TASKS,CAMPAIGN_CHAPTERS} from '../src/campaign.mjs';

// One fresh, fixed-seed run through actual public resource actions. No injected
// ingredients, XP, energy, coins, resident positions or completion flags.
const seed=20261010,start=Date.parse('2026-10-10T08:00:00+08:00');
let now=start,calls=0,waitMs=0,naturalEnergy=0;
const g=new GameEngine(freshState(now,seed),now),rows=[],sideRows=[],checkpoints={};
const totals={upgrades:0,expansions:0,sales:0,gifts:0};
function tickTo(at){const energy=g.s.energy;now=at;g.tick(now);naturalEnergy+=g.s.energy-energy;}
function act(label,fn){
 tickTo(now+250);const r=fn();assert.ok(r.ok,`${label}: ${r.code} ${r.message}`);
 assert.ok(++calls<100000,'Solver action limit');assert.ok(g.s.energy<=100);
 return r;
}
const boardItems=(c,l,dust=false)=>g.s.board.flatMap((t,i)=>t?.k==='item'&&t.c===c&&t.l===l&&!!t.dust===dust?[i]:[]);
function space(){
 if(g.free())return;
 const protect=new Set((g.mainOrder()?.needs||[]).map(r=>`${r.c}-${r.l}`));
 const i=g.s.board.findIndex(t=>t?.k==='item'&&!t.dust&&!protect.has(`${t.c}-${t.l}`));
 assert.ok(i>=0,'Inventory recovery unavailable');
 if(g.s.storage.length<g.s.capacity)act('store',()=>g.store(i));
 else{act('sell',()=>g.sell(i));totals.sales++;}
}
function retrieve(c,l,n){
 while(boardItems(c,l).length<n){const i=g.s.storage.findIndex(t=>t.c===c&&t.l===l);if(i<0)break;space();act('retrieve',()=>g.retrieve(i));}
}
function takePending(){while(g.s.pending.length){space();act('pending',()=>g.retrieve(0,'pending'));}}
function rewards(){
 for(let l=5;l<=levelOf(g.s);l+=5)if(!g.s.levelGiftsClaimed.includes(l)){act('levelGift',()=>g.claimLevelGift(l));totals.gifts++;}
 for(const d of DAILY)if(g.s.daily[d.key]>=d.target&&!g.s.daily.claimed.includes(d.key))act('daily',()=>g.claimDaily(d.key,now));
 takePending();
}
function produce(c){
 space();while(g.s.energy<1||g.s.producers[c].stock<1){
  const target=Math.max(now+1,g.s.energy<1?g.s.energyAt+CFG.energyEvery:now,g.s.producers[c].stock<1?g.s.producers[c].at+CFG.stockEvery:now);
  waitMs+=target-now;tickTo(target);
 }
 act('produce',()=>g.produce(c,now));
}
function ensure(c,l,n,stop=()=>false){
 let loops=0;while(!stop()&&g.count(c,l)<n){
  assert.ok(++loops<3000,'Unreachable recipe');if(l===1){produce(c);continue;}
  const dust=boardItems(c,l-1,true),required=dust.length?1:2;
  ensure(c,l-1,required,()=>stop()||g.count(c,l)>=n);
  if(stop()||g.count(c,l)>=n)return;
  retrieve(c,l-1,required);const from=boardItems(c,l-1),target=dust.length?dust[0]:from[1];
  assert.ok(from.length>=required&&target!==undefined,'Missing merge ingredients');
  act('merge',()=>g.move(from[0],target));
 }
}
function invest(){
 for(const c of CATS)while(g.unlocked(c)&&g.s.producers[c].level<(g.s.stage>=24?3:2)&&g.s.coins>=CFG.upgradeCosts[g.s.producers[c].level-1]+145){act('upgrade',()=>g.upgrade(c));totals.upgrades++;}
 if(g.s.stage>=12&&g.s.capacity<16&&g.s.coins>=g.expansionCost()+145){act('expand',()=>g.expand());totals.expansions++;}
}
act('intro',()=>g.markIntro());act('dailyGift',()=>g.dailyGift(now));
for(let id=0;id<TASKS.length+CAMPAIGN_TASKS.length;id++){
 const task=g.mainOrder();assert.equal(task.id,id);
 if([24,59,95].includes(id))checkpoints[id]=clone(g.s);
 const before={produce:g.s.stats.produce,merge:g.s.stats.merge,waitMs,xp:g.s.xp};
 if(id===0)act('tutorialMerge',()=>g.move(8,9));
 for(const c of CATS)if(g.unlocked(c)&&!g.s.producerLessons[c])produce(c);
 invest();takePending();
 const phases=[];
 do{
  const order=g.mainOrder();
  for(const r of order.needs)ensure(r.c,r.l,r.n);
  const submitted=act('main',()=>g.submit('main',order.id,order.phase));phases.push({phase:order.phase,kind:submitted.kind});
  rewards();if(submitted.kind==='submit')break;
 }while(true);
 if(task.renovation)act('build',()=>g.build(id%2));
 rewards();validateState(g.s);
 // Validate completed-task snapshots; unit and browser checks cover phase reloads.
 rows.push({id,name:task.name,renovation:!!task.renovation,mass:needMass(task.fullNeeds),phases,produce:g.s.stats.produce-before.produce,merge:g.s.stats.merge-before.merge,waitSeconds:(waitMs-before.waitMs)/1000,xpAwarded:g.s.xp-before.xp,level:levelOf(g.s),free:g.free(),stored:g.s.storage.length});
}
assert.equal(g.mainOrder(),null);assert.equal(g.s.stage,24);assert.equal(g.s.campaign.completed,72);assert.ok(levelOf(g.s)>=50);
// One complete 12-delivery loop and its successor; only public material actions.
for(let i=0;i<14;i++){
 const slot=i%2,order=g.s.sideOrders[slot],before=g.s.sideCompleted;
 for(const r of order.needs)ensure(r.c,r.l,r.n);
 act('side',()=>g.submit('side',order.id));rewards();validateState(g.s);
 assert.equal(g.s.sideCompleted,before+1);
 sideRows.push({slot,name:order.name,loop:order.loop||null,mass:needMass(order.needs),completed:g.s.sideCompleted,nextLoop:g.s.sideOrders[slot].loop});
}
const mainXP=TASKS.reduce((s,t)=>s+t.xp+CFG.buildXP,0)+CAMPAIGN_TASKS.reduce((s,t)=>s+t.xp,0);
const chapters=CAMPAIGN_CHAPTERS.map((c,i)=>{const tasks=CAMPAIGN_TASKS.slice(i*8,i*8+8),runs=rows.slice(24+i*8,32+i*8);return {chapter:i+7,name:c.name,mass:tasks.reduce((s,t)=>s+needMass(t.needs),0),costRange:[needMass(tasks[0].needs),needMass(tasks.at(-1).needs)],expectedEnergyAtMaxProducer:tasks.map(t=>Number((needMass(t.needs)/1.44).toFixed(1))),produce:runs.reduce((s,t)=>s+t.produce,0),xp:tasks.reduce((s,t)=>s+t.xp,0),endingLevel:runs.at(-1).level};});
const result={version:VERSION,date:'2026-10-10',seed,status:'passed',method:'Fresh legal public action solver through all 96 main tasks and 14 side deliveries. No resource injection. One fixed policy/seed; virtual waiting is not human playtime.',policy:'No material parcels, no regional activities or tea. Claim level/chapter/daily rewards; invest in producers (level2 early, level3 after furnishing) and storage up to16. No resource balance reset.',theoretical:{mainTasks:rows.length,expandedTasks:72,chapters:15,mainXP,levelFromMainOnly:levelOf({xp:mainXP}),level50Threshold:Array.from({length:49},(_,i)=>levelCost(i+1)).reduce((a,b)=>a+b,0),mainMass:rows.reduce((s,t)=>s+t.mass,0),expectedMassPerEnergy:[1.2,1.32,1.44],naturalPerHour:36,energyCap:100},simulation:{calls,produce:g.s.stats.produce,merge:g.s.stats.merge,mainEndingXP:rows.reduce((s,t)=>s+t.xpAwarded,0),mainEndingLevel:rows.at(-1).level,waitSeconds:waitMs/1000,virtualSeconds:(now-start)/1000,naturalEnergy,sideCompleted:g.s.sideCompleted,coins:g.s.coins,...totals,chapters,taskLog:rows,sideLog:sideRows},limitations:['Expected energy divides committed base material mass by drop expectation; stock, prior materials, gifts and purchased parcels can change per-task spending.','This policy intentionally does not buy material parcels; players can spend coins to shorten tasks.','No claim about human session duration, real retention or mobile performance.','No resident travel is required for material preparation. Existing resident state is untouched.']};
fs.writeFileSync(new URL('../qa/balance-v1.6.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(new URL('../qa/v1.6-checkpoints.json',import.meta.url),JSON.stringify(checkpoints,null,2)+'\n');
console.log(JSON.stringify({...result,theoretical:result.theoretical,simulation:{...result.simulation,taskLog:undefined,sideLog:undefined}},null,2));
