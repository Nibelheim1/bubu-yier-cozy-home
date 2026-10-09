import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {GameEngine,freshState,validateState,clone,levelOf,levelCost,levelReward,levelGift} from '../src/engine.mjs';
import {VERSION,CFG,CATS,CHAINS,TASKS,DAILY,REGIONS,needMass,mass} from '../src/data.mjs';

// One fixed seed, legal public economy actions. Virtual waiting is not human playtime.
// Resident travel is a model assumption: the player brings both bears to each
// activity region. This changes only their model location, and does not simulate
// pointer gestures, door transitions, or the time spent dragging them there.
export function runBalanceCampaign(seed=20261009){
const start=Date.parse('2026-10-09T08:00:00+08:00');
let now=start,calls=0,waitMs=0,naturalEnergy=0,firstWaitAt=null,currentGoal=null;
const g=new GameEngine(freshState(now,seed),now),log=[],transactions=[],gifts=[],levels=[],production={},checkpoints={};
const initialMass=g.s.board.reduce((s,t)=>s+mass(t),0);
function modelPlayerBringsBothBearsTo(region){
 for(const who of ['bubu','yier'])g.s.residents[who].region=region;
}
const tickTo=(t)=>{const before=g.s.energy;now=t;g.tick(now);naturalEnergy+=g.s.energy-before;};
function act(label,fn){
 tickTo(now+250);const before={coins:g.s.coins,energy:g.s.energy,xp:g.s.xp,level:levelOf(g.s),stage:g.s.stage,bag:g.s.bag.scissors};
 const r=fn();assert.ok(r.ok,`${label}: ${r.code} ${r.message} at stage ${g.s.stage}`);
 if(++calls>20000)throw Error('Action bound exceeded');
 const delta={coins:g.s.coins-before.coins,energy:g.s.energy-before.energy,xp:g.s.xp-before.xp,scissors:g.s.bag.scissors-before.bag};
 if(Object.values(delta).some(Boolean))transactions.push({action:label,stage:Math.min(TASKS.length,before.stage+1),...delta});
 if(levelOf(g.s)>before.level)levels.push({from:before.level,to:levelOf(g.s),atStage:before.stage+1,energy:delta.energy,coins:delta.coins});
 return r;
}
const boards=(c,l,dust=false)=>g.s.board.flatMap((t,i)=>t?.k==='item'&&t.c===c&&t.l===l&&!!t.dust===dust?[i]:[]);
function space(){
 if(g.free())return;
 const protectedKeys=new Set((g.mainOrder()?.needs||[]).map(r=>`${r.c}-${r.l}`));
 const i=g.s.board.findIndex(t=>t?.k==='item'&&!t.dust&&!protectedKeys.has(`${t.c}-${t.l}`));
 assert.ok(i>=0,'No recoverable board space');
 act(g.s.storage.length<g.s.capacity?'store':'sell',()=>g.s.storage.length<g.s.capacity?g.store(i):g.sell(i));
}
function toBoard(c,l,n){while(boards(c,l).length<n){const i=g.s.storage.findIndex(t=>t.c===c&&t.l===l);if(i<0)break;space();act('retrieveStorage',()=>g.retrieve(i));}}
function retrieveGifts(){while(g.s.pending.length){space();act('retrievePending',()=>g.retrieve(0,'pending'));}}
function claimRewards(){
 for(let l=5;l<=levelOf(g.s);l+=5)if(!g.s.levelGiftsClaimed.includes(l)){
  const r=act('claimLevelGift',()=>g.claimLevelGift(l));gifts.push({level:l,atStage:g.s.stage,coins:r.coins,scissors:r.scissors,items:r.items});
 }
 for(const d of DAILY)if(g.s.daily[d.key]>=d.target&&!g.s.daily.claimed.includes(d.key))act(`daily:${d.key}`,()=>g.claimDaily(d.key,now));
 retrieveGifts();
}
function produce(c,allowParcel=true){
 space();
 if(allowParcel&&currentGoal?.c===c&&currentGoal.l>=3&&g.s.energy<=10&&g.s.coins>=CFG.parcelCost+145){
  const availableMass=[...g.s.board,...g.s.storage].reduce((a,t)=>a+(t?.k==='item'&&!t.dust&&t.c===c&&t.l<=currentGoal.l?mass(t):0),0);
  const missingMass=2**(currentGoal.l-1)*currentGoal.n-availableMass;
  if(missingMass>=5){const o=g.mainOrder(),q=g.quoteParcel({kind:'main',id:g.s.stage,step:o.phase},c);if(q.ok){act(`parcel:${c}`,()=>g.buy('parcel',q));retrieveGifts();return;}}
 }
 while(g.s.energy<1||g.s.producers[c].stock<1){
  if(firstWaitAt===null)firstWaitAt={stage:g.s.stage+1,produces:g.s.stats.produce,energy:g.s.energy};
  const energyAt=g.s.energy<1?g.s.energyAt+CFG.energyEvery:now;
  const stockAt=g.s.producers[c].stock<1?g.s.producers[c].at+CFG.stockEvery:now;
  const target=Math.max(now+1,energyAt,stockAt);waitMs+=target-now;tickTo(target);
 }
 const r=act('produce',()=>g.produce(c,now));const key=`${c}-${r.l}`;production[key]=(production[key]||0)+1;
}
function ensure(c,l,n,stop=()=>false){
 let loops=0;
 while(!stop()&&g.count(c,l)<n){
  if(++loops>2000)throw Error(`Unreachable recipe ${c}-${l}`);
  if(l===1){produce(c);continue;}
  const dust=boards(c,l-1,true),required=dust.length?1:2;
  ensure(c,l-1,required,()=>stop()||g.count(c,l)>=n);
  if(stop()||g.count(c,l)>=n)return;
  toBoard(c,l-1,required);const sources=boards(c,l-1),target=dust.length?dust[0]:sources[1];
  assert.ok(sources.length>=required&&target!==undefined,'Merge ingredients absent');
  act('merge',()=>g.move(sources[0],target));
 }
}
function invest(stage){
 // Keep 145 coins for one parcel and the first storage expansion. Prioritize future demand.
 const future=CATS.map(c=>({c,m:needMass(TASKS.slice(stage).flatMap(t=>t.needs).filter(r=>r.c===c))})).sort((a,b)=>b.m-a.m);
 for(const {c,m} of future)if(g.unlocked(c)&&g.s.producers[c].level===1&&m>=50&&g.s.coins>=CFG.upgradeCosts[0]+145)act(`upgrade:${c}`,()=>g.upgrade(c));
 if(stage>=12&&g.s.capacity===8&&g.s.coins>=g.expansionCost()+145)act('expand',()=>g.expand());
}
act('markIntro',()=>g.markIntro());act('dailyGift',()=>g.dailyGift(now));
for(let stage=0;stage<TASKS.length;stage++){
 const before={produce:g.s.stats.produce,merge:g.s.stats.merge,wait:waitMs,coins:g.s.coins,energy:g.s.energy,now};
 if(stage===0)act('tutorialMerge',()=>g.move(8,9));
 for(const c of CATS)if(g.unlocked(c)&&!g.s.producerLessons[c])produce(c,false);
 invest(stage);retrieveGifts();
 while(!g.s.delivered){
  const o=g.mainOrder();
  for(const r of o.needs){
   currentGoal=r;
   ensure(r.c,r.l,r.n);
  }
  currentGoal=null;
  act('submitMain',()=>g.submit('main',stage,o.phase));claimRewards();
 }
 act('build',()=>g.build(stage%2));claimRewards();
 for(const r of REGIONS)if(g.s.world.activities[r.id].day!==g.s.daily.day){modelPlayerBringsBothBearsTo(r.id);act(`activity:${r.id}`,()=>g.homeActivity(r.id,now));}
 validateState(g.s);
 if(g.s.stage%4===0)checkpoints[g.s.stage]=clone(g.s);
 log.push({task:stage+1,title:TASKS[stage].name,baseMass:needMass(TASKS[stage].needs),produce:g.s.stats.produce-before.produce,merge:g.s.stats.merge-before.merge,waitSeconds:(waitMs-before.wait)/1000,virtualSeconds:(now-before.now)/1000,energyStart:before.energy,energyEnd:g.s.energy,coinsStart:before.coins,coinsEnd:g.s.coins,level:levelOf(g.s),boardFree:g.free(),storage:g.s.storage.length,capacity:g.s.capacity});
}
const chapterLog=Array.from({length:6},(_,i)=>{const rows=log.slice(i*4,i*4+4);return {chapter:i+1,baseMass:rows.reduce((a,r)=>a+r.baseMass,0),produce:rows.reduce((a,r)=>a+r.produce,0),merge:rows.reduce((a,r)=>a+r.merge,0),waitSeconds:rows.reduce((a,r)=>a+r.waitSeconds,0),energyEnd:rows.at(-1).energyEnd,coinsEnd:rows.at(-1).coinsEnd,level:rows.at(-1).level};});
const coinTotals={};for(const t of transactions)if(t.coins)coinTotals[t.action]=(coinTotals[t.action]||0)+t.coins;
const mainMass=TASKS.reduce((a,t)=>a+needMass(t.needs),0),mainXP=TASKS.reduce((a,t)=>a+10+Math.floor(needMass(t.needs)/3)+CFG.buildXP,0);
const theoretical={mainMass,mainXP,initialMass,bySource:Object.fromEntries(CATS.map(c=>[c,needMass(TASKS.flatMap(t=>t.needs).filter(r=>r.c===c))])),productionMassPerEnergy:[1.2,1.32,1.44],chapterMass:chapterLog.map(r=>r.baseMass),grossEnergyIgnoringGifts:[1.2,1.32,1.44].map(p=>Number((mainMass/p).toFixed(2))),naturalEnergyPerHour:3600000/CFG.energyEvery,emptyToFullSeconds:CFG.energyCap*CFG.energyEvery/1000,upgradeRewards:Array.from({length:9},(_,i)=>({level:i+2,costFromPrevious:levelCost(i+1),...levelReward(i+2)})),levelGifts:[5,10,20,40,60,95].map(level=>({level,...levelGift(level,24)}))};
const result={version:VERSION,date:'2026-10-09',seed,status:'passed',method:'One fixed-seed legal public economy-action campaign, with modeled resident travel before regional activities; no resource injection, no removed energy methods, no undo/calm, no human session estimate.',strategy:'Main only, immediate needed-chain merges, claim chapter/level/daily material and coins; future-mass >=50 level-2 producer upgrades retaining145 coins, one storage expansion; at <=10 energy repeatedly buy current-needs parcels if relevant missing base mass >=5, retaining145 coins. No side/tea submits, no sales/splits unless board recovery needs sale.',theoretical,simulation:{calls,virtualSeconds:(now-start)/1000,waitSeconds:waitMs/1000,produce:g.s.stats.produce,merge:g.s.stats.merge,mainOrders:g.s.stats.order,build:g.s.stage,xp:g.s.xp,level:levelOf(g.s),energy:g.s.energy,naturalEnergy,coins:g.s.coins,initialCoins:120,coinTotals,firstWaitAt,gifts,levels,production,chapterLog,taskLog:log,transactions,finalInventory:{boardMass:g.s.board.reduce((a,t)=>a+mass(t),0),storageMass:g.s.storage.reduce((a,t)=>a+mass(t),0),pendingMass:g.s.pending.reduce((a,t)=>a+mass(t),0),scissors:g.s.bag.scissors,producers:g.s.producers,capacity:g.s.capacity}},limitations:['The expected-mass division is a planning approximation, not an exact integer recipe guarantee.','Virtual actions take 250 ms each; this is a solver convention, not a player-speed or retention measurement.','Resident travel sets model locations directly; drag gestures, door transitions and travel time are not simulated.','One policy and one seed do not establish optimal play or a distribution.','No real UI, mobile, real-world weather, paid monetization or real retention is verified.']};
return {result,final:clone(g.s),checkpoints};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {result}=runBalanceCampaign();
 const output=fileURLToPath(new URL('../qa/balance-v1.4.json',import.meta.url));fs.mkdirSync(fileURLToPath(new URL('../qa/',import.meta.url)),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({version:result.version,status:result.status,seed:result.seed,mainMass:result.theoretical.mainMass,mainXP:result.theoretical.mainXP,...result.simulation,transactions:undefined,taskLog:undefined,production:undefined,finalInventory:undefined},null,2));
}
